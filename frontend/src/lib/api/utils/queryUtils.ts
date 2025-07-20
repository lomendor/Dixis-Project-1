export const QueryKeys = {
  PRODUCTS: 'products',
  PRODUCERS: 'producers',
  CATEGORIES: 'categories',
  ORDERS: 'orders',
  USERS: 'users',
  ADOPTIONS: 'adoptions',
  ADOPTABLE_ITEMS: 'adoptable-items',
  REVIEWS: 'reviews',
  SEARCH: 'search',
  FAVORITES: 'favorites',
  CART: 'cart',
  ANALYTICS: 'analytics',
  NOTIFICATIONS: 'notifications',

  // Nested query keys for better organization
  products: {
    all: () => ['products'],
    lists: () => [...QueryKeys.products.all(), 'list'],
    list: (filters: any) => [...QueryKeys.products.lists(), filters],
    details: () => [...QueryKeys.products.all(), 'detail'],
    detail: (id: string | number) => [...QueryKeys.products.details(), id],
    recommended: (params?: any) => [...QueryKeys.products.all(), 'recommended', params],
    similar: (productId?: number, categoryId?: number, limit?: number) =>
      [...QueryKeys.products.all(), 'similar', { productId, categoryId, limit }],
    related: (productId: number, limit?: number) =>
      [...QueryKeys.products.all(), 'related', { productId, limit }],
    priceRange: () => [...QueryKeys.products.all(), 'priceRange'],
  },

  producers: {
    all: () => ['producers'],
    lists: () => [...QueryKeys.producers.all(), 'list'],
    list: (filters: any) => [...QueryKeys.producers.lists(), filters],
    details: () => [...QueryKeys.producers.all(), 'detail'],
    detail: (id: string | number) => [...QueryKeys.producers.details(), id],
    dashboard: (id: string | number) => [...QueryKeys.producers.all(), 'dashboard', id],
  },

  search: {
    all: () => ['search'],
    autocomplete: (query: string, limit?: number) =>
      [...QueryKeys.search.all(), 'autocomplete', { query, limit }],
  }
};

export const getQueryOptions = (options?: any) => ({
  staleTime: 5 * 60 * 1000, // 5 minutes
  gcTime: 10 * 60 * 1000, // 10 minutes
  ...options
});

// Utility functions for query parameter handling
export const formatQueryParams = (params: Record<string, any>): string => {
  const filtered = filterNullValues(params);
  return new URLSearchParams(filtered).toString();
};

export const filterNullValues = (obj: Record<string, any>): Record<string, string> => {
  const filtered: Record<string, string> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== null && value !== undefined && value !== '') {
      filtered[key] = String(value);
    }
  }
  return filtered;
};

export const formatUrlPath = (baseUrl: string, params?: Record<string, any>): string => {
  if (!params || Object.keys(params).length === 0) {
    return baseUrl;
  }
  const queryString = formatQueryParams(params);
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
};
