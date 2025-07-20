import { toError, errorToContext } from '@/lib/utils/errorUtils';
import { logger } from '@/lib/logging/productionLogger';

/**
 * 🛡️ API CORE CONFIGURATION - SINGLE SOURCE OF TRUTH
 * 
 * This is the ONLY file that defines API configuration.
 * ALL other API configurations are deprecated and will be removed.
 * 
 * CRITICAL: This file prevents the historical problem of API chaos
 * that previously broke the Next.js frontend.
 * 
 * Created: 2025-01-25 (API Stability Foundation)
 * Purpose: Protect €70K-€290K revenue system from breaking changes
 */

// ===== CORE CONFIGURATION =====

/**
 * Immutable API configuration
 * These values should NEVER change without proper migration
 */
export const API_CORE_CONFIG = {
  // Base URL - Single source of truth (VPS API for all environments during integration testing)
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://147.93.126.235:8000',

  // API Version - Stable versioning
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

/**
 * Environment-specific overrides
 */
export const getEnvironmentConfig = () => {
  const env = process.env.NODE_ENV;
  
  // Check if we're on the production domain
  const isProductionDomain = typeof window !== 'undefined' && window.location.hostname === 'dixis.io';
  
  switch (env) {
    case 'production':
      return {
        ...API_CORE_CONFIG,
        // If on production domain, use relative URL; otherwise use VPS
        BASE_URL: isProductionDomain ? 'https://dixis.io' : (process.env.NEXT_PUBLIC_API_URL || 'http://147.93.126.235:8000'),
        FEATURES: {
          ...API_CORE_CONFIG.FEATURES,
          LOGGING_ENABLED: false,
        },
      };
      
    case 'staging':
      return {
        ...API_CORE_CONFIG,
        BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'https://staging-api.dixis.gr',
      };
      
    case 'development':
    default:
      return API_CORE_CONFIG;
  }
};

/**
 * Get the active configuration based on environment
 */
export const getApiConfig = () => getEnvironmentConfig();

/**
 * Validation function to ensure configuration is valid
 */
export const validateApiConfig = (config: typeof API_CORE_CONFIG) => {
  if (!config.BASE_URL) {
    throw new Error('API_CORE_CONFIG: BASE_URL is required');
  }
  
  if (!config.VERSION) {
    throw new Error('API_CORE_CONFIG: VERSION is required');
  }
  
  if (!config.PREFIX) {
    throw new Error('API_CORE_CONFIG: PREFIX is required');
  }
  
  return true;
};

/**
 * Helper to build full API URL
 */
export const buildApiUrl = (endpoint: string) => {
  const config = getApiConfig();
  validateApiConfig(config);
  
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  
  return `${config.BASE_URL}/${cleanEndpoint}`;
};

/**
 * Helper to build full API endpoint with prefix
 */
export const buildApiEndpoint = (path: string) => {
  const config = getApiConfig();
  
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  return `${config.PREFIX}/${cleanPath}`;
};

/**
 * Type definitions for configuration
 */
export type ApiConfig = typeof API_CORE_CONFIG;
export type ApiEnvironment = 'development' | 'staging' | 'production';

/**
 * Configuration validation on module load
 */
try {
  validateApiConfig(getApiConfig());
} catch (error) {
  logger.error('API Configuration Error:', toError(error), errorToContext(error));
  throw error;
}
