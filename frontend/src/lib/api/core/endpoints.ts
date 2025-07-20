import { logger } from '@/lib/logging/productionLogger';

/**
 * 🛡️ API ENDPOINTS - SINGLE SOURCE OF TRUTH
 * 
 * This file contains ALL API endpoint definitions.
 * These endpoints are IMMUTABLE and versioned to prevent breaking changes.
 * 
 * CRITICAL: This prevents the historical API chaos that broke the frontend.
 * 
 * Created: 2025-01-25 (API Stability Foundation)
 * Purpose: Stable, type-safe endpoint definitions
 */

import { buildApiEndpoint } from './config';

/**
 * Core endpoint builder functions
 * These create type-safe, consistent endpoint URLs
 */
const createEndpoint = (path: string) => buildApiEndpoint(path);
const createParameterizedEndpoint = (path: string) => (id: string | number) => buildApiEndpoint(path.replace(':id', String(id)));

/**
 * 🔐 AUTHENTICATION ENDPOINTS
 * Stable authentication API endpoints
 */
export const AUTH_ENDPOINTS = {
  LOGIN: createEndpoint('auth/login'),
  REGISTER: createEndpoint('auth/register'),
  LOGOUT: createEndpoint('auth/logout'),
  REFRESH: createEndpoint('auth/refresh'),
  ME: createEndpoint('auth/me'),
  FORGOT_PASSWORD: createEndpoint('auth/forgot-password'),
  RESET_PASSWORD: createEndpoint('auth/reset-password'),
  VERIFY_EMAIL: createEndpoint('auth/verify-email'),
  RESEND_VERIFICATION: createEndpoint('auth/resend-verification'),
} as const;

/**
 * 🛍️ PRODUCT ENDPOINTS
 * Stable product API endpoints
 */
export const PRODUCT_ENDPOINTS = {
  LIST: createEndpoint('products'),
  DETAIL: createParameterizedEndpoint('products/:id'),
  SEARCH: createEndpoint('products/search'),
  FEATURED: createEndpoint('products/featured'),
  NEW: createEndpoint('products/new'),
  POPULAR: createEndpoint('products/popular'),
  RELATED: createParameterizedEndpoint('products/:id/related'),
  REVIEWS: createParameterizedEndpoint('products/:id/reviews'),
  QUESTIONS: createParameterizedEndpoint('products/:id/questions'),
  BY_CATEGORY: createParameterizedEndpoint('products/category/:id'),
  BY_PRODUCER: createParameterizedEndpoint('products/producer/:id'),
} as const;

/**
 * 📂 CATEGORY ENDPOINTS
 * Stable category API endpoints
 */
export const CATEGORY_ENDPOINTS = {
  LIST: createEndpoint('categories'),
  DETAIL: createParameterizedEndpoint('categories/:id'),
  PRODUCTS: createParameterizedEndpoint('categories/:id/products'),
  TREE: createEndpoint('categories/tree'),
  FEATURED: createEndpoint('categories/featured'),
} as const;

/**
 * 👨‍🌾 PRODUCER ENDPOINTS
 * Stable producer API endpoints
 */
export const PRODUCER_ENDPOINTS = {
  LIST: createEndpoint('producers'),
  DETAIL: createParameterizedEndpoint('producers/:id'),
  PRODUCTS: createParameterizedEndpoint('producers/:id/products'),
  PROFILE: createParameterizedEndpoint('producers/:id/profile'),
  MEDIA: createParameterizedEndpoint('producers/:id/media'),
  QUESTIONS: createParameterizedEndpoint('producers/:id/questions'),
  SEASONALITY: createParameterizedEndpoint('producers/:id/seasonality'),
  ENVIRONMENTAL: createParameterizedEndpoint('producers/:id/environmental'),
  FEATURED: createEndpoint('producers/featured'),
  SEARCH: createEndpoint('producers/search'),
} as const;

/**
 * 🛒 CART ENDPOINTS
 * Stable cart API endpoints
 */
export const CART_ENDPOINTS = {
  GET: createEndpoint('cart'),
  ADD_ITEM: createEndpoint('cart/items'),
  UPDATE_ITEM: createParameterizedEndpoint('cart/items/:id'),
  REMOVE_ITEM: createParameterizedEndpoint('cart/items/:id'),
  CLEAR: createEndpoint('cart/clear'),
  GUEST: createEndpoint('cart/guest'),
  MERGE: createEndpoint('cart/merge'),
} as const;

/**
 * 📦 ORDER ENDPOINTS
 * Stable order API endpoints
 */
export const ORDER_ENDPOINTS = {
  LIST: createEndpoint('orders'),
  DETAIL: createParameterizedEndpoint('orders/:id'),
  CREATE: createEndpoint('orders'),
  CANCEL: createParameterizedEndpoint('orders/:id/cancel'),
  TRACK: createParameterizedEndpoint('orders/:id/track'),
  HISTORY: createEndpoint('orders/history'),
} as const;

/**
 * 💳 PAYMENT ENDPOINTS
 * Stable payment API endpoints
 */
export const PAYMENT_ENDPOINTS = {
  METHODS: createEndpoint('payment/methods'),
  PROCESS: createEndpoint('payment/process'),
  STRIPE_INTENT: createEndpoint('payment/stripe/intent'),
  STRIPE_CONFIRM: createEndpoint('payment/stripe/confirm'),
  WEBHOOK: createEndpoint('payment/webhook'),
} as const;

/**
 * 🚚 SHIPPING ENDPOINTS
 * Stable shipping API endpoints
 */
export const SHIPPING_ENDPOINTS = {
  CALCULATE: createEndpoint('shipping/calculate'),
  ZONES: createEndpoint('shipping/zones'),
  METHODS: createEndpoint('shipping/methods'),
  RATES: createEndpoint('shipping/rates'),
  TRACK: createParameterizedEndpoint('shipping/track/:id'),
} as const;

/**
 * 🔍 SEARCH ENDPOINTS
 * Stable search API endpoints
 */
export const SEARCH_ENDPOINTS = {
  GLOBAL: createEndpoint('search'),
  PRODUCTS: createEndpoint('search/products'),
  PRODUCERS: createEndpoint('search/producers'),
  CATEGORIES: createEndpoint('search/categories'),
  AUTOCOMPLETE: createEndpoint('search/autocomplete'),
  SUGGESTIONS: createEndpoint('search/suggestions'),
  FILTERS: createEndpoint('search/filters'),
} as const;

/**
 * 👤 USER ENDPOINTS
 * Stable user API endpoints
 */
export const USER_ENDPOINTS = {
  PROFILE: createEndpoint('user/profile'),
  UPDATE_PROFILE: createEndpoint('user/profile'),
  CHANGE_PASSWORD: createEndpoint('user/password'),
  ADDRESSES: createEndpoint('user/addresses'),
  ADDRESS: createParameterizedEndpoint('user/addresses/:id'),
  WISHLIST: createEndpoint('user/wishlist'),
  ORDERS: createEndpoint('user/orders'),
  NOTIFICATIONS: createEndpoint('user/notifications'),
} as const;

/**
 * 🏢 B2B ENDPOINTS
 * Stable B2B API endpoints
 */
export const B2B_ENDPOINTS = {
  DASHBOARD: createEndpoint('b2b/dashboard'),
  STATS: createEndpoint('b2b/dashboard/stats'),
  ORDERS: createEndpoint('b2b/orders'),
  INVOICES: createEndpoint('b2b/invoices'),
  PROFILE: createEndpoint('b2b/profile'),
  USERS: createEndpoint('b2b/users'),
} as const;

/**
 * 👨‍🌾 PRODUCER DASHBOARD ENDPOINTS
 * Stable producer dashboard API endpoints
 */
export const PRODUCER_DASHBOARD_ENDPOINTS = {
  STATS: createEndpoint('producer/dashboard/stats'),
  PROFILE: createEndpoint('producer/profile'),
  PRODUCTS: createEndpoint('producer/products'),
  ORDERS: createEndpoint('producer/orders'),
  ANALYTICS: createEndpoint('producer/analytics'),
  DOCUMENTS: createEndpoint('producer/documents'),
  SHIPPING: createEndpoint('producer/shipping'),
} as const;

/**
 * 🔧 ADMIN ENDPOINTS
 * Stable admin API endpoints
 */
export const ADMIN_ENDPOINTS = {
  DASHBOARD: createEndpoint('admin/dashboard'),
  STATS: createEndpoint('admin/dashboard/stats'),
  USERS: createEndpoint('admin/users'),
  PRODUCTS: createEndpoint('admin/products'),
  ORDERS: createEndpoint('admin/orders'),
  PRODUCERS: createEndpoint('admin/producers'),
  CATEGORIES: createEndpoint('admin/categories'),
  ANALYTICS: createEndpoint('admin/analytics'),
} as const;

/**
 * 🔧 SYSTEM ENDPOINTS
 * Stable system API endpoints
 */
export const SYSTEM_ENDPOINTS = {
  HEALTH: createEndpoint('health'),
  STATUS: createEndpoint('status'),
  VERSION: createEndpoint('version'),
  CONFIG: createEndpoint('config'),
} as const;

/**
 * 📊 UNIFIED ENDPOINTS EXPORT
 * Single export containing all endpoint categories
 */
export const API_ENDPOINTS = {
  AUTH: AUTH_ENDPOINTS,
  PRODUCTS: PRODUCT_ENDPOINTS,
  CATEGORIES: CATEGORY_ENDPOINTS,
  PRODUCERS: PRODUCER_ENDPOINTS,
  CART: CART_ENDPOINTS,
  ORDERS: ORDER_ENDPOINTS,
  PAYMENT: PAYMENT_ENDPOINTS,
  SHIPPING: SHIPPING_ENDPOINTS,
  SEARCH: SEARCH_ENDPOINTS,
  USER: USER_ENDPOINTS,
  B2B: B2B_ENDPOINTS,
  PRODUCER_DASHBOARD: PRODUCER_DASHBOARD_ENDPOINTS,
  ADMIN: ADMIN_ENDPOINTS,
  SYSTEM: SYSTEM_ENDPOINTS,
} as const;

/**
 * Type definitions for endpoints
 */
export type ApiEndpoints = typeof API_ENDPOINTS;
export type EndpointCategory = keyof ApiEndpoints;

/**
 * Helper function to get all endpoints as a flat array
 */
export const getAllEndpoints = (): string[] => {
  const endpoints: string[] = [];
  
  Object.values(API_ENDPOINTS).forEach(category => {
    Object.values(category).forEach(endpoint => {
      if (typeof endpoint === 'string') {
        endpoints.push(endpoint);
      }
    });
  });
  
  return endpoints;
};

/**
 * Validation function to ensure endpoints are properly formatted
 */
export const validateEndpoints = (): boolean => {
  const endpoints = getAllEndpoints();
  
  for (const endpoint of endpoints) {
    if (!endpoint.startsWith('/api/v1/')) {
      logger.error(`Invalid endpoint format: ${endpoint}`);
      return false;
    }
  }
  
  return true;
};

// Validate endpoints on module load
if (process.env.NODE_ENV === 'development') {
  validateEndpoints();
}
