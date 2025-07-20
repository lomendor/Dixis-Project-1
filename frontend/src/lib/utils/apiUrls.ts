/**
 * API URL Utilities - Production Safe URLs
 * 
 * This utility provides production-safe API URLs that automatically
 * switch between development and production environments.
 */

/**
 * Get the base API URL for the current environment
 */
export const getApiBaseUrl = (): string => {
  // In production, use the environment variable
  if (process.env.NODE_ENV === 'production') {
    return process.env.NEXT_PUBLIC_API_URL || 'http://147.93.126.235:8000/api/v1';
  }
  
  // In development, use localhost  
  return 'http://localhost:8000/api/v1';
};

/**
 * Build a complete API URL for a given endpoint
 */
export const buildApiUrl = (endpoint: string): string => {
  const baseUrl = getApiBaseUrl();
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${baseUrl}/${cleanEndpoint}`;
};

/**
 * Get the base storage URL for file uploads
 */
export const getStorageBaseUrl = (): string => {
  // In production, use the VPS IP
  if (process.env.NODE_ENV === 'production') {
    return process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://147.93.126.235:8000';
  }
  
  // In development, use localhost
  return 'http://localhost:8000';
};

/**
 * Build a complete storage URL for a given path
 */
export const buildStorageUrl = (path: string): string => {
  const baseUrl = getStorageBaseUrl();
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${baseUrl}/storage/${cleanPath}`;
};

/**
 * Common API endpoints - use these instead of hardcoded URLs
 */
export const API_ENDPOINTS = {
  // Producer endpoints
  PRODUCER_PROFILE: 'producer/profile',
  PRODUCER_DASHBOARD_STATS: 'producer/dashboard/stats',
  PRODUCER_REGISTER: 'producer/register',
  PRODUCER_ORDERS: 'producer/orders',
  PRODUCER_PRODUCTS: 'producer/products',
  
  // Product endpoints
  PRODUCTS: 'products',
  PRODUCT_FEATURED: 'products/featured',
  PRODUCT_SEARCH: 'products/search',
  
  // Category endpoints
  CATEGORIES: 'categories',
  
  // Auth endpoints
  AUTH_LOGIN: 'auth/login',
  AUTH_REGISTER: 'auth/register',
  AUTH_LOGOUT: 'auth/logout',
  
  // Cart endpoints
  CART: 'cart',
  CART_ITEMS: 'cart/items',
  
  // Order endpoints
  ORDERS: 'orders',
} as const;

/**
 * Helper function to build API URLs using predefined endpoints
 */
export const getApiUrl = (endpoint: keyof typeof API_ENDPOINTS): string => {
  return buildApiUrl(API_ENDPOINTS[endpoint]);
};

/**
 * Helper function to build API URLs with dynamic parameters
 */
export const getApiUrlWithParams = (endpoint: string, params: Record<string, string | number>): string => {
  let url = endpoint;
  
  // Replace parameters in the URL
  for (const [key, value] of Object.entries(params)) {
    url = url.replace(`{${key}}`, String(value));
  }
  
  return buildApiUrl(url);
};