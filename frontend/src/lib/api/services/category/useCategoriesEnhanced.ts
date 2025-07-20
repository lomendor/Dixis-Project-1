'use client';

import { toError, errorToContext } from '@/lib/utils/errorUtils';

import { useQuery } from '@tanstack/react-query';
import { Category, CategoryFilters, CategoryWithChildren } from '@/lib/api/models/category/types';
import { mockCategories } from '@/lib/api/models/category/mockData';
import { QueryKeys } from '@/lib/api/utils/queryUtils';
import { logger } from '@/utils/logger';

// Real API call for categories
const fetchCategories = async (filters?: CategoryFilters): Promise<Category[]> => {
  logger.info('Fetching categories with filters:', filters);

  try {
    // Build query parameters
    const params = new URLSearchParams();

    if (filters?.search) {
      params.append('search', filters.search);
    }

    if (filters?.parent_id !== undefined) {
      params.append('parent_id', filters?.parent_id?.toString() || '');
    }

    if (filters?.is_featured !== undefined) {
      params.append('is_featured', filters.is_featured ? '1' : '0');
    }

    const queryString = params.toString();
    const url = `http://localhost:8000/api/v1/categories${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Categories API error: ${response.status}`);
    }

    const apiData = await response.json();

    // Transform API response to our Category format
    const categories: Category[] = (Array.isArray(apiData) ? apiData : apiData.data || []).map((item: any) => {
      // Ensure we're working with a valid object
      if (!item || typeof item !== 'object') {
        logger.warn('Invalid category item received:', item);
        return null;
      }
      
      return {
        id: Number(item.id) || 0,
        name: String(item.name || ''),
        slug: String(item.slug || ''),
        description: String(item.description || ''),
        icon: getIconForCategory(String(item.name || '')), // Helper function for icons
        image: item.image ? `http://localhost:8000/storage/${item.image}` : null,
        parent_id: item.parent_id ? Number(item.parent_id) : undefined,
        sort_order: Number(item.sort_order) || 0,
        is_featured: Boolean(item.is_featured),
        is_active: Boolean(item.is_active !== false),
        product_count: Number(item.products_count) || 0,
        created_at: String(item.created_at || ''),
        updated_at: String(item.updated_at || ''),
      };
    }).filter(Boolean);

    logger.info(`Returning ${categories.length} categories from API`);
    return categories;

  } catch (error) {
    // Don't log AbortErrors - they're normal when components unmount
    if (error instanceof Error && error.name === 'AbortError') {
      throw error; // Re-throw AbortError to let React Query handle it
    }

    logger.error('Categories API error:', toError(error), errorToContext(error));

    // Fallback to mock data on error, but with reduced delay
    await new Promise(resolve => setTimeout(resolve, 100)); // Reduced from 600ms to 100ms

    let filteredCategories = [...mockCategories];

    if (filters) {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredCategories = filteredCategories.filter(category =>
          category.name.toLowerCase().includes(searchLower) ||
          category?.description?.toLowerCase().includes(searchLower)
        );
      }

      if (filters.parent_id !== undefined) {
        filteredCategories = filteredCategories.filter(category =>
          category.parent_id === filters.parent_id
        );
      }

      if (filters.is_featured !== undefined) {
        filteredCategories = filteredCategories.filter(category =>
          category.is_featured === filters.is_featured
        );
      }
    }

    // Sort by sort_order
    filteredCategories.sort((a, b) => a.sort_order - b.sort_order);

    logger.info(`Returning ${filteredCategories.length} categories from fallback`);
    return filteredCategories;
  }
};

// Helper function to get icons for categories
const getIconForCategory = (categoryName: string): string => {
  const iconMap: Record<string, string> = {
    'Ελιές': '🫒',
    'Λάδι': '🫒',
    'Μέλι': '🍯',
    'Τυρί': '🧀',
    'Κρασί': '🍷',
    'Ψάρι': '🐟',
    'Κρέας': '🥩',
    'Φρούτα': '🍎',
    'Λαχανικά': '🥬',
    'Αρτοποιία': '🍞',
    'Γλυκά': '🍰',
    'Καφές': '☕',
    'Τσάι': '🍵',
    'Μπαχαρικά': '🌿',
    'Βότανα': '🌱',
  };

  // Find matching icon or return default
  for (const [key, icon] of Object.entries(iconMap)) {
    if (categoryName.includes(key)) {
      return icon;
    }
  }

  return '📦'; // Default icon
};

// Build category tree with children
const buildCategoryTree = (categories: Category[]): CategoryWithChildren[] => {
  const categoryMap = new Map<number, CategoryWithChildren>();
  const rootCategories: CategoryWithChildren[] = [];

  // First pass: create all categories
  categories.forEach(category => {
    categoryMap.set(category.id, { ...category, children: [] });
  });

  // Second pass: build tree structure
  categories.forEach(category => {
    const categoryWithChildren = categoryMap.get(category.id)!;

    if (category.parent_id === null || category.parent_id === undefined) {
      rootCategories.push(categoryWithChildren);
    } else {
      const parent = categoryMap.get(category.parent_id);
      if (parent) {
        parent.children!.push(categoryWithChildren);
      }
    }
  });

  return rootCategories;
};

export const useEnhancedCategories = (filters?: CategoryFilters) => {
  // Create stable query key by serializing filters
  const stableFilters = filters ? JSON.stringify(filters) : 'default';
  const queryKey = [QueryKeys.CATEGORIES, stableFilters];

  const query = useQuery({
    queryKey,
    queryFn: () => fetchCategories(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  return {
    categories: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isFetching: query.isFetching,
    isSuccess: query.isSuccess,
  };
};

export const useEnhancedCategoriesTree = (filters?: CategoryFilters) => {
  const { categories, ...rest } = useEnhancedCategories(filters);

  const categoriesTree = categories ? buildCategoryTree(categories) : undefined;

  return {
    categories: categoriesTree,
    ...rest,
  };
};

export const useEnhancedCategory = (id: number) => {
  const query = useQuery({
    queryKey: [QueryKeys.CATEGORIES, id],
    queryFn: async () => {
      logger.info('Fetching category with id:', id);

      try {
        const response = await fetch(`http://localhost:8000/api/v1/categories/${id}`);

        if (!response.ok) {
          throw new Error(`Category API error: ${response.status}`);
        }

        const apiData = await response.json();
        const item = apiData.data || apiData;

        // Ensure we have a valid item object
        if (!item || typeof item !== 'object') {
          throw new Error(`Invalid category data received for id ${id}`);
        }

        const category: Category = {
          id: Number(item.id) || 0,
          name: String(item.name || ''),
          slug: String(item.slug || ''),
          description: String(item.description || ''),
          icon: getIconForCategory(String(item.name || '')),
          image: item.image ? `http://localhost:8000/storage/${item.image}` : null,
          parent_id: item.parent_id ? Number(item.parent_id) : undefined,
          sort_order: Number(item.sort_order) || 0,
          is_featured: Boolean(item.is_featured),
          is_active: Boolean(item.is_active !== false),
          product_count: Number(item.products_count) || 0,
          created_at: String(item.created_at || ''),
          updated_at: String(item.updated_at || ''),
        };

        return category;

      } catch (error) {
        // Don't log AbortErrors - they're normal when components unmount
        if (error instanceof Error && error.name === 'AbortError') {
          throw error; // Re-throw AbortError to let React Query handle it
        }

        logger.error('Category API error:', toError(error), errorToContext(error));

        // Fallback to mock data with reduced delay
        await new Promise(resolve => setTimeout(resolve, 50));

        const category = mockCategories.find(c => c.id === id);
        if (!category) {
          throw new Error(`Category with id ${id} not found`);
        }

        return category;
      }
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    enabled: !!id,
  });

  return {
    category: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isFetching: query.isFetching,
    isSuccess: query.isSuccess,
  };
};

export const useEnhancedFeaturedCategories = () => {
  return useEnhancedCategories({ is_featured: true });
};

export const useEnhancedMainCategories = () => {
  return useEnhancedCategories({ parent_id: null });
};
