'use client';

import { toError, errorToContext } from '@/lib/utils/errorUtils';
import { UNIFIED_API_CONFIG } from '@/lib/api/config/unified';

import { useQuery } from '@tanstack/react-query';
import { Product } from '@/lib/api/models/product/types';
import { Producer } from '@/lib/api/models/producer/types';
import { mockProducts } from '@/lib/api/models/product/mockData';
import { mockProducers } from '@/lib/api/models/producer/mockData';
import { QueryKeys } from '@/lib/api/utils/queryUtils';
import { logger } from '@/utils/logger';

export interface SearchFilters {
  query?: string;
  category?: string;
  location?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  rating?: number;
  inStock?: boolean;
  organic?: boolean;
  sortBy?: 'relevance' | 'price_asc' | 'price_desc' | 'rating' | 'newest';
}

export interface SearchResults {
  products: Product[];
  producers: Producer[];
  totalProducts: number;
  totalProducers: number;
  suggestions: string[];
  facets: {
    categories: Array<{ name: string; count: number }>;
    locations: Array<{ name: string; count: number }>;
    priceRanges: Array<{ range: string; min: number; max: number; count: number }>;
  };
}

// Search utility functions
const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^\w\s]/g, '') // Remove special characters
    .trim();
};

const searchProducts = (products: Product[], filters: SearchFilters): Product[] => {
  let filtered = [...products];

  // Text search
  if (filters.query) {
    const normalizedQuery = normalizeText(filters.query);
    filtered = filtered.filter(product => {
      const searchableText = [
        product.name,
        product.description,
        product.shortDescription,
        product.category,
        product.producerName,
        ...(product.tags || []),
        product.featured ? 'featured' : ''
      ].join(' ');

      return normalizeText(searchableText).includes(normalizedQuery);
    });
  }

  // Category filter
  if (filters.category) {
    filtered = filtered.filter(product =>
      normalizeText(typeof product.category === 'string' ? product.category : product?.category?.name || '').includes(normalizeText(filters.category!))
    );
  }

  // Location filter (based on producer location)
  if (filters.location) {
    filtered = filtered.filter(product =>
      product.producer_location &&
      normalizeText(product.producer_location).includes(normalizeText(filters.location!))
    );
  }

  // Price range filter
  if (filters.priceRange) {
    filtered = filtered.filter(product => {
      const price = product.salePrice || product.price;
      return price >= filters.priceRange!.min && price <= filters.priceRange!.max;
    });
  }

  // Rating filter
  if (filters.rating) {
    filtered = filtered.filter(product => (product.rating || 0) >= filters.rating!);
  }

  // Stock filter
  if (filters.inStock !== undefined) {
    filtered = filtered.filter(product => (product.stock > 0) === filters.inStock);
  }

  // Organic filter
  if (filters.organic) {
    filtered = filtered.filter(product =>
      product?.tags?.some(tag =>
        normalizeText(tag).includes('βιολογικ') ||
        normalizeText(tag).includes('organic')
      )
    );
  }

  // Sorting
  if (filters.sortBy) {
    switch (filters.sortBy) {
      case 'price_asc':
        filtered.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
        break;
      case 'price_desc':
        filtered.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
        break;
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
        break;
      default: // relevance
        // Keep original order for relevance
        break;
    }
  }

  return filtered;
};

const searchProducers = (producers: Producer[], filters: SearchFilters): Producer[] => {
  let filtered = [...producers];

  // Text search
  if (filters.query) {
    const normalizedQuery = normalizeText(filters.query);
    filtered = filtered.filter(producer => {
      const searchableText = [
        producer.business_name,
        producer.bio,
        producer.location,
        ...(producer.specialties || [])
      ].join(' ');

      return normalizeText(searchableText).includes(normalizedQuery);
    });
  }

  // Location filter
  if (filters.location) {
    filtered = filtered.filter(producer =>
      producer.location &&
      normalizeText(producer.location).includes(normalizeText(filters.location!))
    );
  }

  return filtered;
};

const generateSearchSuggestions = (query: string): string[] => {
  if (!query || query.length < 2) return [];

  const suggestions = [
    'ελαιόλαδο',
    'μέλι',
    'τυρί',
    'κρασί',
    'φέτα',
    'κασέρι',
    'βιολογικά προϊόντα',
    'κρητικά προϊόντα',
    'θυμαρίσιο μέλι',
    'παρθένο ελαιόλαδο'
  ];

  const normalizedQuery = normalizeText(query);
  return suggestions.filter(suggestion =>
    normalizeText(suggestion).includes(normalizedQuery)
  ).slice(0, 5);
};

const generateFacets = (products: Product[], producers: Producer[]) => {
  // Categories facet
  const categoryCount = new Map<string, number>();
  products.forEach(product => {
    const categoryName = typeof product.category === 'string' ? product.category : product?.category?.name || 'Other';
    categoryCount.set(categoryName, (categoryCount.get(categoryName) || 0) + 1);
  });

  // Locations facet
  const locationCount = new Map<string, number>();
  [...products, ...producers].forEach(item => {
    const location = 'producer_location' in item ? item.producer_location : item.location;
    if (location) {
      const region = location.split(',')[1]?.trim() || location;
      locationCount.set(region, (locationCount.get(region) || 0) + 1);
    }
  });

  // Price ranges facet
  const priceRanges = [
    { range: '0-10€', min: 0, max: 10 },
    { range: '10-25€', min: 10, max: 25 },
    { range: '25-50€', min: 25, max: 50 },
    { range: '50€+', min: 50, max: 1000 }
  ];

  const priceRangeCounts = priceRanges.map(range => ({
    ...range,
    count: products.filter(product => {
      const price = product.salePrice || product.price;
      return price >= range.min && (range.max === 1000 ? price >= range.min : price <= range.max);
    }).length
  }));

  return {
    categories: Array.from(categoryCount.entries()).map(([name, count]) => ({ name, count })),
    locations: Array.from(locationCount.entries()).map(([name, count]) => ({ name, count })),
    priceRanges: priceRangeCounts
  };
};

// Real API call for global search
const performGlobalSearch = async (filters: SearchFilters): Promise<SearchResults> => {
  logger.info('Performing global search with filters:', filters);

  try {
    // If no filters or no query, return empty results
    if (!filters || !filters.query || filters.query.length < 2) {
      return {
        products: [],
        producers: [],
        totalProducts: 0,
        totalProducers: 0,
        suggestions: [],
        facets: {
          categories: [],
          locations: [],
          priceRanges: []
        }
      };
    }

    // Build search parameters
    const searchParams = new URLSearchParams();
    searchParams.set('q', filters.query);
    searchParams.set('per_page', '20');

    // Add filters
    if (filters.category) {
      searchParams.set('category', filters.category);
    }
    if (filters.location) {
      searchParams.set('location', filters.location);
    }
    if (filters.priceRange) {
      searchParams.set('min_price', filters.priceRange.min.toString());
      searchParams.set('max_price', filters.priceRange.max.toString());
    }
    if (filters.rating) {
      searchParams.set('rating', filters.rating.toString());
    }
    if (filters.inStock !== undefined) {
      searchParams.set('in_stock', filters.inStock.toString());
    }
    if (filters.sortBy) {
      searchParams.set('sort_by', filters.sortBy);
    }

    // Call the Laravel search API directly
    const searchUrl = `${UNIFIED_API_CONFIG.BASE_URL}/api/v1/products/search?${searchParams.toString()}`;
    
    const response = await fetch(searchUrl);

    if (!response.ok) {
      throw new Error(`Search API error: ${response.status}`);
    }

    const apiData = await response.json();

    // Transform API response to our format
    const products: Product[] = (apiData.data || []).map((item: any) => ({
      id: item.id,
      name: item.name,
      slug: item.slug,
      description: item.description,
      shortDescription: item.short_description,
      price: item.price,
      salePrice: item.discount_price,
      image: item.main_image || '/placeholder-product.jpg',
      category: item?.category?.name || 'Άλλα',
      producerName: item?.producer?.business_name || 'Άγνωστος Παραγωγός',
      producer_location: item?.producer?.location || '',
      rating: item.rating || 4.5,
      stock: item.stock || 0,
      tags: item.tags || [],
      features: item.features || [],
      createdAt: item.created_at
    }));

    // Search producers (DISABLED for now - focus on products)
    let producers: Producer[] = [];

    // Use API suggestions if available, otherwise generate
    const suggestions = apiData.suggestions || generateSearchSuggestions(filters?.query || '');
    
    // Use API facets if available, otherwise generate from results
    const facets = apiData.facets || generateFacets(products, producers);

    const results: SearchResults = {
      products,
      producers,
      totalProducts: apiData.total || products.length,
      totalProducers: producers.length,
      suggestions,
      facets
    };

    return results;

  } catch (error) {
    // Don't log AbortErrors - they're normal when components unmount
    if (error instanceof Error && error.name === 'AbortError') {
      throw error; // Re-throw AbortError to let React Query handle it
    }

    logger.error('Search API error:', toError(error), errorToContext(error));

    // Fallback to mock data on error
    const filteredProducts = filters ? searchProducts(mockProducts, filters) : mockProducts;
    const filteredProducers = filters ? searchProducers(mockProducers, filters) : mockProducers;

    const suggestions = generateSearchSuggestions(filters?.query || '');
    const facets = generateFacets(filteredProducts, filteredProducers);

    return {
      products: filteredProducts,
      producers: filteredProducers,
      totalProducts: filteredProducts.length,
      totalProducers: filteredProducers.length,
      suggestions,
      facets
    };
  }
};

export const useGlobalSearch = (filters?: SearchFilters) => {
  const query = useQuery({
    queryKey: [QueryKeys.SEARCH, 'global', filters],
    queryFn: () => performGlobalSearch(filters!),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!(filters && filters.query && filters.query.length >= 2), // Only run when we have a valid search query
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  return {
    results: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isFetching: query.isFetching,
    isSuccess: query.isSuccess,
  };
};
