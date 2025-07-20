/**
 * API endpoint constants
 */

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
export const API_VERSION = 'v1';

/**
 * Product endpoints
 */
export const PRODUCT_ENDPOINTS = {
  LIST: '/api/v1/products',
  DETAIL: '/api/v1/products/:id',
  FEATURED: '/api/v1/products/featured',
  SEARCH: '/api/v1/products/search',
  REVIEWS: '/api/v1/products/:id/reviews',
  RELATED: '/api/v1/products/:id/related',
  CATEGORIES: '/api/v1/products/categories',
  BY_CATEGORY: '/api/v1/products/category/:categoryId',
  BY_PRODUCER: '/api/v1/products/producer/:producerId',
  INVENTORY: '/api/v1/products/:id/inventory',
  FEATURED_STATUS: '/api/v1/products/:id/featured',
};

/**
 * Producer endpoints
 */
export const PRODUCER_ENDPOINTS = {
  LIST: '/api/v1/producers',
  DETAIL: '/api/v1/producers/:id',
  PRODUCTS: '/api/v1/producers/:id/products',
  REVIEWS: '/api/v1/producers/:id/reviews',
  VERIFICATION: '/api/v1/producers/:id/verification',
  DASHBOARD: '/api/v1/producers/dashboard',
  PROFILE: '/api/v1/producers/profile',
};

/**
 * Category endpoints
 */
export const CATEGORY_ENDPOINTS = {
  LIST: '/api/v1/categories',
  DETAIL: '/api/v1/categories/:id',
  PRODUCTS: '/api/v1/categories/:id/products',
  TREE: '/api/v1/categories/tree',
  FEATURED: '/api/v1/categories/featured',
};

/**
 * Cart endpoints
 */
export const CART_ENDPOINTS = {
  GET_CART: '/api/v1/cart',
  ADD_ITEM: '/api/v1/cart/items',
  UPDATE_ITEM: '/api/v1/cart/items/:id',
  REMOVE_ITEM: '/api/v1/cart/items/:id',
  CLEAR_CART: '/api/v1/cart/clear',
  VALIDATE_CART: '/api/v1/cart/validate',
  CREATE_GUEST_CART: '/api/v1/cart/guest',
};

/**
 * Order endpoints
 */
export const ORDER_ENDPOINTS = {
  LIST: '/api/v1/orders',
  DETAIL: '/api/v1/orders/:id',
  CREATE: '/api/v1/orders',
  UPDATE: '/api/v1/orders/:id',
  CANCEL: '/api/v1/orders/:id/cancel',
  TRACK: '/api/v1/orders/:id/track',
};

/**
 * User endpoints
 */
export const USER_ENDPOINTS = {
  PROFILE: '/api/v1/user/profile',
  UPDATE_PROFILE: '/api/v1/user/profile',
  ORDERS: '/api/v1/user/orders',
  FAVORITES: '/api/v1/user/favorites',
  ADDRESSES: '/api/v1/user/addresses',
  NOTIFICATIONS: '/api/v1/user/notifications',
};

/**
 * Auth endpoints
 */
export const AUTH_ENDPOINTS = {
  LOGIN: '/api/v1/auth/login',
  REGISTER: '/api/v1/auth/register',
  LOGOUT: '/api/v1/auth/logout',
  REFRESH: '/api/v1/auth/refresh',
  FORGOT_PASSWORD: '/api/v1/auth/forgot-password',
  RESET_PASSWORD: '/api/v1/auth/reset-password',
  VERIFY_EMAIL: '/api/v1/auth/verify-email',
};

/**
 * Search endpoints
 */
export const SEARCH_ENDPOINTS = {
  GLOBAL: '/api/v1/search',
  PRODUCTS: '/api/v1/search/products',
  PRODUCERS: '/api/v1/search/producers',
  AUTOCOMPLETE: '/api/v1/search/autocomplete',
  SUGGESTIONS: '/api/v1/search/suggestions',
};

/**
 * Review endpoints
 */
export const REVIEW_ENDPOINTS = {
  LIST: '/api/v1/reviews',
  CREATE: '/api/v1/reviews',
  UPDATE: '/api/v1/reviews/:id',
  DELETE: '/api/v1/reviews/:id',
  HELPFUL: '/api/v1/reviews/:id/helpful',
  REPORT: '/api/v1/reviews/:id/report',
};

/**
 * Wishlist/Favorites endpoints
 */
export const FAVORITES_ENDPOINTS = {
  LIST: '/api/v1/favorites',
  ADD: '/api/v1/favorites',
  REMOVE: '/api/v1/favorites/:id',
  CHECK: '/api/v1/favorites/check',
};

/**
 * Upload endpoints
 */
export const UPLOAD_ENDPOINTS = {
  IMAGE: '/api/v1/uploads/image',
  DOCUMENT: '/api/v1/uploads/document',
  AVATAR: '/api/v1/uploads/avatar',
  PRODUCT_IMAGE: '/api/v1/uploads/product-image',
};

/**
 * Analytics endpoints
 */
export const ANALYTICS_ENDPOINTS = {
  TRACK_EVENT: '/api/v1/analytics/event',
  TRACK_PAGE_VIEW: '/api/v1/analytics/page-view',
  TRACK_PURCHASE: '/api/v1/analytics/purchase',
  TRACK_CART_ACTION: '/api/v1/analytics/cart-action',
};

/**
 * Notification endpoints
 */
export const NOTIFICATION_ENDPOINTS = {
  LIST: '/api/v1/notifications',
  MARK_READ: '/api/v1/notifications/:id/read',
  MARK_ALL_READ: '/api/v1/notifications/read-all',
  DELETE: '/api/v1/notifications/:id',
  PREFERENCES: '/api/v1/notifications/preferences',
};

/**
 * Admin endpoints
 */
export const ADMIN_ENDPOINTS = {
  DASHBOARD: '/api/v1/admin/dashboard',
  USERS: '/api/v1/admin/users',
  PRODUCTS: '/api/v1/admin/products',
  ORDERS: '/api/v1/admin/orders',
  PRODUCERS: '/api/v1/admin/producers',
  ANALYTICS: '/api/v1/admin/analytics',
  SETTINGS: '/api/v1/admin/settings',
};

/**
 * Helper function to replace URL parameters
 */
export function formatEndpoint(endpoint: string, params: Record<string, string | number>): string {
  let formattedEndpoint = endpoint;
  
  Object.entries(params).forEach(([key, value]) => {
    formattedEndpoint = formattedEndpoint.replace(`:${key}`, String(value));
  });
  
  return formattedEndpoint;
}

/**
 * Helper function to build query string
 */
export function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        value.forEach(item => searchParams.append(key, String(item)));
      } else {
        searchParams.append(key, String(value));
      }
    }
  });
  
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * All endpoints grouped by domain
 */
export const API_ENDPOINTS = {
  PRODUCT: PRODUCT_ENDPOINTS,
  PRODUCER: PRODUCER_ENDPOINTS,
  CATEGORY: CATEGORY_ENDPOINTS,
  CART: CART_ENDPOINTS,
  ORDER: ORDER_ENDPOINTS,
  USER: USER_ENDPOINTS,
  AUTH: AUTH_ENDPOINTS,
  SEARCH: SEARCH_ENDPOINTS,
  REVIEW: REVIEW_ENDPOINTS,
  FAVORITES: FAVORITES_ENDPOINTS,
  UPLOAD: UPLOAD_ENDPOINTS,
  ANALYTICS: ANALYTICS_ENDPOINTS,
  NOTIFICATION: NOTIFICATION_ENDPOINTS,
  ADMIN: ADMIN_ENDPOINTS,
};
