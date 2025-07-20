// Use Next.js API routes as fallback when Laravel backend is not available
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';
export const API_VERSION = 'v1';

// Helper to get the correct API base URL
function getApiBaseUrl(): string {
  if (API_BASE_URL) {
    return API_BASE_URL;
  }

  // Use Next.js API proxy routes for frontend calls
  if (typeof window !== 'undefined') {
    return ''; // Empty string means relative URLs for browser (will use proxy)
  }

  // For server-side calls, use the Laravel backend directly
  return 'http://localhost:8000';
}

export const API_ENDPOINTS = {
  PRODUCTS: {
    LIST: () => `${getApiBaseUrl()}/api/products`,
    PRODUCT: (id: string | number) => `${getApiBaseUrl()}/api/products/${id}`,
    FEATURED: () => `${getApiBaseUrl()}/api/products/featured`,
    SEARCH: () => `${getApiBaseUrl()}/api/products/search`,
    BASE: () => `${getApiBaseUrl()}/api/products`,
  },
  PRODUCERS: {
    LIST: () => `${getApiBaseUrl()}/api/producers`,
    DETAIL: (id: string | number) => `${getApiBaseUrl()}/api/producers/${id}`,
    PRODUCER: (id: string | number) => `${getApiBaseUrl()}/api/producers/${id}`,
    PRODUCTS: (id: string | number) => `${getApiBaseUrl()}/api/producers/${id}/products`,
  },
  CATEGORIES: {
    LIST: () => `${getApiBaseUrl()}/api/categories`,
    CATEGORY: (id: string | number) => `${getApiBaseUrl()}/api/categories/${id}`,
    PRODUCTS: (id: string | number) => `${getApiBaseUrl()}/api/categories/${id}/products`,
  },
  RECOMMENDATIONS: {
    RELATED: (id: string | number) => `${getApiBaseUrl()}/api/products/${id}/related`,
    SIMILAR: (id: string | number) => `${getApiBaseUrl()}/api/products/${id}/similar`,
  },
  ORDERS: () => `${getApiBaseUrl()}/api/orders`,
  AUTH: {
    LOGIN: () => `${getApiBaseUrl()}/api/auth/login`,
    REGISTER: () => `${getApiBaseUrl()}/api/auth/register`,
    LOGOUT: () => `${getApiBaseUrl()}/api/auth/logout`,
    ME: () => `${getApiBaseUrl()}/api/auth/me`,
  },
  USERS: () => `${getApiBaseUrl()}/api/users`,
  ADOPTIONS: () => `${getApiBaseUrl()}/api/laravel/${API_VERSION}/adoptions`,
  ADOPTABLE_ITEMS: () => `${getApiBaseUrl()}/api/laravel/${API_VERSION}/adoptable-items`,
  REVIEWS: () => `${getApiBaseUrl()}/api/laravel/${API_VERSION}/reviews`,
  FAVORITES: () => `${getApiBaseUrl()}/api/laravel/${API_VERSION}/favorites`,
  CART: () => `${getApiBaseUrl()}/api/laravel/${API_VERSION}/cart`,
  SEARCH: () => `${getApiBaseUrl()}/api/laravel/${API_VERSION}/search`,
  ANALYTICS: () => `${getApiBaseUrl()}/api/laravel/${API_VERSION}/analytics`,
  NOTIFICATIONS: () => `${getApiBaseUrl()}/api/laravel/${API_VERSION}/notifications`,
  UPLOADS: () => `${getApiBaseUrl()}/api/laravel/${API_VERSION}/uploads`,
  PAYMENTS: () => `${getApiBaseUrl()}/api/laravel/${API_VERSION}/payments`,
  SHIPPING: () => `${getApiBaseUrl()}/api/laravel/${API_VERSION}/shipping`,
  ADMIN: () => `${getApiBaseUrl()}/api/laravel/${API_VERSION}/admin`,
  REPORTS: () => `${getApiBaseUrl()}/api/laravel/${API_VERSION}/reports`,
  SETTINGS: () => `${getApiBaseUrl()}/api/laravel/${API_VERSION}/settings`
};

