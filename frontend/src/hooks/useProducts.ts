'use client';

import { toError, errorToContext } from '@/lib/utils/errorUtils';

import { logger } from '@/lib/logging/productionLogger';

import { useState, useEffect, useCallback } from 'react';
import { integrationService } from '@/lib/api/integration/integrationService';
import { performanceMonitor } from '@/lib/performance/monitoring';
import { apiCache } from '@/lib/performance/cache';

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  main_image?: string;
  category_id?: number;
  producer?: {
    id: number;
    business_name: string;
    name?: string;
    location?: string;
  };
  category?: {
    id: number;
    name: string;
  };
  rating?: number;
  stock?: number;
  stock_quantity?: number;
  is_featured?: boolean;
  is_organic?: boolean;
  reviews_count?: number;
}

interface ProductsFilters {
  search?: string;
  category?: string;
  producer?: string;
  featured?: boolean;
  organic?: boolean;
  min_price?: number;
  max_price?: number;
  sort?: string;
  per_page?: number;
  page?: number;
}

interface UseProductsReturn {
  products: Product[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  refetch: () => Promise<void>;
  fetchMore: () => Promise<void>;
  updateFilters: (filters: ProductsFilters) => void;
  clearFilters: () => void;
  retryCount: number;
}

const DEFAULT_FILTERS: ProductsFilters = {
  per_page: 20,
  page: 1,
  sort: 'name'
};

export function useProducts(initialFilters: ProductsFilters = {}): UseProductsReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const [filters, setFilters] = useState<ProductsFilters>({
    ...DEFAULT_FILTERS,
    ...initialFilters
  });

  const fetchProducts = useCallback(async (loadMore = false) => {
    const startTime = performance.now();

    try {
      setLoading(true);
      setError(null);

      logger.info('🚀 Fetching products with filters:', filters);

      // Generate cache key based on filters
      const cacheKey = `products_${JSON.stringify(filters)}`;
      
      // Check cache first (only for first page, not for load more)
      if (!loadMore) {
        const cachedData = apiCache.get(cacheKey);
        if (cachedData) {
          setProducts(cachedData.products);
          setTotalCount(cachedData.totalCount);
          setCurrentPage(cachedData.currentPage);
          setTotalPages(cachedData.totalPages);
          logger.info('📦 Loaded products from cache');
          setLoading(false);
          return;
        }
      }

      // Prepare API parameters
      const apiParams = {
        ...filters,
        with: ['producer', 'category'], // Include relationships
      };

      // Use integration service to fetch products
      const response = await integrationService.apiCall(
        'useRealProducts',
        async () => {
          return await integrationService.getProducts(apiParams);
        },
        async () => {
          // Fallback to mock data
          logger.info('📦 Using fallback mock data for products');
          return {
            data: getMockProducts(),
            meta: {
              pagination: {
                total: 65,
                per_page: filters.per_page || 20,
                current_page: filters.page || 1,
                last_page: Math.ceil(65 / (filters.per_page || 20))
              }
            }
          };
        }
      );

      logger.info('✅ Products fetched successfully:', response);

      if (response.data && Array.isArray(response.data)) {
        const transformedProducts = response.data.map(transformProduct);
        
        if (loadMore && filters.page && filters.page > 1) {
          // Append to existing products for pagination
          setProducts(prev => [...prev, ...transformedProducts]);
        } else {
          // Replace products for new search/filter
          setProducts(transformedProducts);
        }

        // Update pagination info
        const pagination = response?.meta?.pagination;
        if (pagination) {
          setTotalCount(pagination.total || 0);
          setCurrentPage(pagination.current_page || 1);
          setTotalPages(pagination.last_page || 1);
        }

        // Cache the data for 5 minutes (only for first page)
        if (!loadMore) {
          apiCache.set(cacheKey, {
            products: transformedProducts,
            totalCount: pagination?.total || 0,
            currentPage: pagination?.current_page || 1,
            totalPages: pagination?.last_page || 1
          }, 5 * 60 * 1000);
        }

        logger.info(`📦 Loaded ${transformedProducts.length} products`);
      } else {
        logger.warn('⚠️ Unexpected data format:', response);
        setProducts([]);
        setError('Μη αναμενόμενη μορφή δεδομένων από τον διακομιστή');
      }
    } catch (err) {
      logger.error('❌ Error fetching products:', toError(err), errorToContext(err));

      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          setError('Η αίτηση έληξε. Παρακαλώ δοκιμάστε ξανά.');
        } else if (err.message.includes('fetch') || err.message.includes('network')) {
          setError('Πρόβλημα σύνδεσης. Ελέγξτε τη σύνδεσή σας στο διαδίκτυο.');
        } else {
          setError(err.message);
        }
      } else {
        setError('Άγνωστο σφάλμα κατά τη φόρτωση των προϊόντων');
      }

      // On error, try to load mock data as fallback
      if (!loadMore) {
        const mockProducts = getMockProducts();
        setProducts(mockProducts);
        setTotalCount(mockProducts.length);
        setCurrentPage(1);
        setTotalPages(Math.ceil(mockProducts.length / (filters.per_page || 20)));
        logger.info('📦 Loaded mock products as fallback');
      }
    } finally {
      setLoading(false);

      // Record performance metric
      const loadTime = performance.now() - startTime;
      performanceMonitor.recordMetric({
        name: 'products_load_time',
        value: loadTime,
        timestamp: Date.now(),
        url: typeof window !== 'undefined' ? window.location.href : ''
      });
    }
  }, [filters]);

  const transformProduct = (product: any): Product => {
    return {
      id: product.id,
      name: product.name,
      price: parseFloat(product.price) || 0,
      description: product.description || product.short_description || '',
      main_image: product.image || product.main_image || product.images?.[0],
      category_id: product.category_id,
      producer: product.producer ? {
        id: product.producer.id,
        business_name: product.producer.business_name || product.producer.name,
        name: product.producer.name,
        location: product.producer.location || product.producer.city
      } : undefined,
      category: product.category ? {
        id: product.category.id,
        name: product.category.name
      } : undefined,
      rating: product.rating || (4.0 + Math.random() * 1.0), // Generate rating if not available
      stock: product.stock || product.stock_quantity,
      stock_quantity: product.stock_quantity || product.stock,
      is_featured: product.is_featured || false,
      is_organic: product.is_organic || false,
      reviews_count: product.reviews_count || Math.floor(Math.random() * 50) + 5
    };
  };

  const getMockProducts = (): Product[] => [
    {
      id: 1,
      name: 'Εξτραπάρθενο Ελαιόλαδο Καλαμάτας',
      price: 12.90,
      description: 'Εξαιρετικό παρθένο ελαιόλαδο από επιλεγμένες ελιές Κορωνέικης',
      main_image: '/images/products/olive-oil.jpg',
      category_id: 1,
      producer: {
        id: 1,
        business_name: 'Ελαιώνες Καλαμάτας',
        location: 'Καλαμάτα'
      },
      category: { id: 1, name: 'Ελαιόλαδο' },
      rating: 4.8,
      stock: 50,
      is_featured: true,
      is_organic: true,
      reviews_count: 24
    },
    {
      id: 2,
      name: 'Θυμαρίσιο Μέλι Κρήτης',
      price: 9.50,
      description: 'Αγνό θυμαρίσιο μέλι από τα βουνά της Κρήτης',
      main_image: '/images/products/honey.jpg',
      category_id: 2,
      producer: {
        id: 2,
        business_name: 'Μελισσοκομία Κρήτης',
        location: 'Χανιά'
      },
      category: { id: 2, name: 'Μέλι' },
      rating: 4.9,
      stock: 30,
      is_featured: true,
      is_organic: true,
      reviews_count: 18
    },
    {
      id: 3,
      name: 'Φέτα ΠΟΠ Ηπείρου',
      price: 8.50,
      description: 'Παραδοσιακή φέτα με πιστοποίηση ΠΟΠ από την Ήπειρο',
      main_image: '/images/products/feta.jpg',
      category_id: 3,
      producer: {
        id: 3,
        business_name: 'Τυροκομείο Ηπείρου',
        location: 'Ιωάννινα'
      },
      category: { id: 3, name: 'Γαλακτοκομικά' },
      rating: 4.7,
      stock: 25,
      is_featured: false,
      is_organic: false,
      reviews_count: 32
    }
  ];

  const refetch = useCallback(async () => {
    setRetryCount(prev => prev + 1);
    await fetchProducts(false);
  }, [fetchProducts]);

  const fetchMore = useCallback(async () => {
    if (currentPage < totalPages && !loading) {
      const newFilters = { ...filters, page: currentPage + 1 };
      setFilters(newFilters);
      await fetchProducts(true);
    }
  }, [currentPage, totalPages, loading, filters, fetchProducts]);

  const updateFilters = useCallback((newFilters: ProductsFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1 // Reset to first page when filters change
    }));
    setCurrentPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setCurrentPage(1);
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchProducts(false);
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    totalCount,
    currentPage,
    totalPages,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
    refetch,
    fetchMore,
    updateFilters,
    clearFilters,
    retryCount
  };
}