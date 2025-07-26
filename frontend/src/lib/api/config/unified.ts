/**
 * 🛡️ UNIFIED API CONFIGURATION - SINGLE SOURCE OF TRUTH
 * 
 * This file completely replaces scattered API configurations:
 * - /lib/apiConstants.ts (DEPRECATED)
 * - /lib/api/core/config.ts (DEPRECATED) 
 * - Various scattered endpoint definitions
 * 
 * ALL API configuration must come from here. This prevents the chaos
 * that caused the double-navigation problem.
 * 
 * Created: 2025-01-26 (Route Navigation Fix)
 * Purpose: Fix product navigation, centralize all API configuration
 */

import { toError, errorToContext } from '@/lib/utils/errorUtils';
import { logger } from '@/lib/logging/productionLogger';

// ===== CORE CONFIGURATION =====

/**
 * Environment detection and base URL configuration
 */
const getBaseURL = (): string => {
  // Client-side environment detection
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    // Production domain
    if (hostname === 'dixis.io') {
      return 'https://dixis.io';
    }
    
    // VPS domain
    if (hostname === '147.93.126.235') {
      return 'http://147.93.126.235:8000';
    }
    
    // Local development - always use localhost
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:8000';
    }
  }
  
  // Server-side fallback
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (envUrl) {
    return envUrl;
  }
  
  // Final fallback to localhost for development
  return 'http://localhost:8000';
};

/**
 * Immutable API configuration
 */
export const UNIFIED_API_CONFIG = {
  // Base configuration
  BASE_URL: getBaseURL(),
  VERSION: 'v1',
  PREFIX: '/api/v1',
  
  // Timeouts and retries
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  
  // Headers
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  
  // Feature flags
  FEATURES: {
    CACHE_ENABLED: true,
    RETRY_ENABLED: true,
    LOGGING_ENABLED: process.env.NODE_ENV === 'development',
  },
} as const;

// ===== ENDPOINT BUILDERS =====

/**
 * Core endpoint builder - creates full URLs
 */
export const buildApiUrl = (path: string): string => {
  const config = UNIFIED_API_CONFIG;
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${config.BASE_URL}/api/v1/${cleanPath}`;
};

/**
 * Simple endpoint builder for relative paths
 */
const endpoint = (path: string) => buildApiUrl(path);

/**
 * Parameterized endpoint builder
 */
const paramEndpoint = (template: string) => (id: string | number) => {
  return buildApiUrl(template.replace(':id', String(id)).replace(':slug', String(id)));
};

// ===== UNIFIED ENDPOINTS =====

/**
 * COMPLETE endpoint definitions - replaces ALL scattered configs
 */
export const UNIFIED_ENDPOINTS = {
  // Products (CORE BUSINESS LOGIC)
  PRODUCTS: {
    LIST: () => endpoint('products'),
    DETAIL: (id: string | number) => endpoint(`products/${id}`),
    BY_SLUG: (slug: string) => endpoint(`products/slug/${slug}`),
    FEATURED: () => endpoint('products?is_featured=1&per_page=8'),
    SEARCH: () => endpoint('products/search'),
    RELATED: (id: string | number) => endpoint(`products/${id}/related`),
    SIMILAR: (id: string | number) => endpoint(`products/${id}/similar`),
    BY_CATEGORY: (id: string | number) => endpoint(`products/category/${id}`),
    BY_PRODUCER: (id: string | number) => endpoint(`products/producer/${id}`),
    REVIEWS: (id: string | number) => endpoint(`products/${id}/reviews`),
  },
  
  // Producers
  PRODUCERS: {
    LIST: () => endpoint('producers'),
    DETAIL: (id: string | number) => endpoint(`producers/${id}`),
    BY_SLUG: (slug: string) => endpoint(`producers/slug/${slug}`),
    PRODUCTS: (id: string | number) => endpoint(`producers/${id}/products`),
    FEATURED: () => endpoint('producers?is_featured=1'),
  },
  
  // Categories
  CATEGORIES: {
    LIST: () => endpoint('categories'),
    DETAIL: (id: string | number) => endpoint(`categories/${id}`),
    PRODUCTS: (id: string | number) => endpoint(`categories/${id}/products`),
  },
  
  // Cart (Direct Laravel)
  CART: {
    GUEST: () => endpoint('cart/guest'),
    GET: (cartId: string) => endpoint(`cart/${cartId}`),
    ITEMS: (cartId: string) => endpoint(`cart/${cartId}/items`),
    REMOVE_ITEM: (cartId: string, itemId: string) => endpoint(`cart/${cartId}/items/${itemId}`),
  },
  
  // Payment (Mixed - some proxied for security)
  PAYMENT: {
    // Proxied through Next.js for Stripe security
    CREATE_INTENT: () => '/api/payment/create-intent',
    CONFIRM: () => '/api/payment/confirm',
    
    // Direct Laravel for Greek payments
    GREEK_METHODS: () => endpoint('payments/greek/methods'),
    VIVA_WALLET_CREATE: () => endpoint('payments/greek/viva-wallet/create'),
    VIVA_WALLET_CALLBACK: () => endpoint('payments/greek/viva-wallet/callback'),
  },
  
  // Shipping (Greek market)
  SHIPPING: {
    GREEK_CARRIERS: () => endpoint('shipping/greek/carriers'),
    GREEK_RATES: () => endpoint('shipping/greek/rates'),
    GREEK_ZONES: () => endpoint('shipping/greek/zones'),
    TRACK: () => endpoint('shipping/greek/track'),
  },
  
  // VAT (Greek market)
  VAT: {
    GREEK_RATES: () => endpoint('vat/greek/rates'),
    CALCULATE_CART: () => endpoint('vat/greek/cart'),
    POSTCODE_CHECK: () => endpoint('vat/greek/postcode-check'),
    INVOICE: () => endpoint('vat/greek/invoice'),
  },
  
  // Authentication (proxied for security)
  AUTH: {
    LOGIN: () => '/api/auth/login',
    REGISTER: () => '/api/auth/register',
    LOGOUT: () => '/api/auth/logout',
    ME: () => '/api/auth/me',
  },
  
  // System
  SYSTEM: {
    HEALTH: () => endpoint('health'),
  },
} as const;

// ===== GREEK MARKET CONFIGURATION =====

export const GREEK_MARKET_CONFIG = {
  VAT_RATES: {
    MAINLAND: 0.24, // 24% standard VAT
    ISLANDS: 0.13,  // 13% reduced VAT for islands
    REDUCED: 0.06,  // 6% for basic foods
  },
  SHIPPING: {
    FREE_THRESHOLD: 50, // €50+ free shipping
    COD_FEE: 2.5,      // €2.50 cash on delivery fee
    ISLAND_SURCHARGE: 7.5, // €7.50 island delivery surcharge
  },
  CURRENCY: 'EUR',
  LANGUAGE: 'el',
} as const;

// ===== VALIDATION & UTILITIES =====

/**
 * Validate configuration on load
 */
export const validateUnifiedConfig = (): boolean => {
  try {
    const config = UNIFIED_API_CONFIG;
    
    if (!config.BASE_URL) {
      throw new Error('BASE_URL is required');
    }
    
    if (!config.VERSION) {
      throw new Error('VERSION is required');
    }
    
    if (!config.PREFIX) {
      throw new Error('PREFIX is required');
    }
    
    return true;
  } catch (error) {
    logger.error('Unified API Configuration Error:', toError(error), errorToContext(error));
    throw error;
  }
};

/**
 * Get current configuration (for debugging)
 */
export const getApiConfigInfo = () => ({
  baseUrl: UNIFIED_API_CONFIG.BASE_URL,
  version: UNIFIED_API_CONFIG.VERSION,
  environment: typeof window !== 'undefined' ? window.location.hostname : 'server',
  timestamp: new Date().toISOString(),
});

// ===== BACKWARDS COMPATIBILITY EXPORTS =====

/**
 * Export for components still using old naming
 * TODO: Update all components to use UNIFIED_ENDPOINTS
 */
export const API_ENDPOINTS = UNIFIED_ENDPOINTS;
export const LARAVEL_API_BASE = UNIFIED_API_CONFIG.BASE_URL + '/api/v1';

// ===== INITIALIZATION =====

// Validate configuration on module load
try {
  validateUnifiedConfig();
  
  if (UNIFIED_API_CONFIG.FEATURES.LOGGING_ENABLED) {
    logger.info('Unified API Configuration loaded successfully', {
      data: getApiConfigInfo(),
      context: { feature: 'api-config', action: 'initialization' }
    });
  }
} catch (error) {
  logger.error('Failed to initialize unified API configuration:', toError(error), errorToContext(error));
  throw error;
}