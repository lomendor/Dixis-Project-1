/**
 * @fileoverview Centralized API Configuration
 * @context @api-config @environment-config @hybrid-approach
 * @see docs/API_ARCHITECTURE.md for architecture decisions
 * 
 * Single source of truth for all API-related configuration.
 * Eliminates hardcoded ports and URLs scattered across the codebase.
 */

import { ROUTE_CLASSIFICATION, MIGRATION_PHASES, PERFORMANCE_TARGETS } from './types/api-architecture';

/**
 * Environment Detection
 */
export const ENVIRONMENT = {
  isDevelopment: process.env.NODE_ENV === 'development',
  isStaging: process.env.NODE_ENV === 'staging', 
  isProduction: process.env.NODE_ENV === 'production',
  current: process.env.NODE_ENV || 'development'
} as const;

/**
 * Base URLs Configuration
 * @context @base-urls @port-configuration
 * 
 * Centralized configuration eliminates scattered hardcoded URLs:
 * - No more localhost:8000 vs localhost:8080 confusion
 * - Environment-specific overrides
 * - Easy production deployment
 */
export const API_URLS = {
  laravel: {
    development: process.env.NEXT_PUBLIC_LARAVEL_API || 'http://localhost:8000/api/v1',
    staging: process.env.NEXT_PUBLIC_LARAVEL_API || 'https://staging-api.dixis.io/api/v1',
    production: process.env.NEXT_PUBLIC_LARAVEL_API || 'https://api.dixis.io/api/v1'
  },
  
  nextjs: {
    development: '/api',
    staging: '/api', 
    production: '/api'
  },
  
  frontend: {
    development: 'http://localhost:3000',
    staging: 'https://staging.dixis.io',
    production: 'https://dixis.io'
  }
} as const;

/**
 * Get current environment's API URLs
 */
export function getAPIUrls() {
  const env = ENVIRONMENT.current as keyof typeof API_URLS.laravel;
  
  return {
    laravel: API_URLS.laravel[env] || API_URLS.laravel.development,
    nextjs: API_URLS.nextjs[env] || API_URLS.nextjs.development,
    frontend: API_URLS.frontend[env] || API_URLS.frontend.development
  };
}

/**
 * Request Configuration
 * @context @request-config
 */
export const REQUEST_CONFIG = {
  timeout: {
    development: 15000,  // Longer timeout for development (debugging)
    staging: 10000,      // Medium timeout for staging
    production: 8000     // Shorter timeout for production
  },
  
  retries: {
    development: 1,      // Fewer retries in development
    staging: 2,          // Standard retries in staging  
    production: 3        // More retries in production
  },
  
  headers: {
    common: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    
    development: {
      'X-Debug-Mode': 'true'
    },
    
    production: {
      'X-Client-Version': process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0'
    }
  }
} as const;

/**
 * Get environment-specific request configuration
 */
export function getRequestConfig() {
  const env = ENVIRONMENT.current as keyof typeof REQUEST_CONFIG.timeout;
  
  return {
    timeout: REQUEST_CONFIG.timeout[env] || REQUEST_CONFIG.timeout.development,
    retries: REQUEST_CONFIG.retries[env] || REQUEST_CONFIG.retries.development,
    headers: {
      ...REQUEST_CONFIG.headers.common,
      ...(ENVIRONMENT.isDevelopment ? REQUEST_CONFIG.headers.development : {}),
      ...(ENVIRONMENT.isProduction ? REQUEST_CONFIG.headers.production : {})
    }
  };
}

/**
 * Route-specific configuration
 * @context @route-config @endpoint-mapping
 */
export const ROUTE_CONFIG = {
  /** Routes that require authentication */
  authenticated: [
    'auth/me',
    'orders',
    'cart',
    'account/stats', 
    'business/dashboard',
    'admin'
  ],
  
  /** Routes with special caching requirements */
  cached: {
    'categories': 300,        // 5 minutes
    'producers/featured': 600, // 10 minutes
    'products/featured': 300, // 5 minutes
    'currency/rates': 3600    // 1 hour
  },
  
  /** Routes that should always use HTTPS in production */
  secure: [
    'auth/login',
    'auth/register', 
    'payment',
    'admin',
    'business'
  ],
  
  /** Routes with custom timeout requirements */ 
  timeouts: {
    'invoices/generate': 30000,    // PDF generation takes time
    'analytics/track': 5000,       // Analytics should be fast
    'health/backend': 3000         // Health checks should be quick
  }
} as const;

/**
 * Migration-specific configuration
 * @context @migration-config
 */
export const MIGRATION_CONFIG = {
  /** Current migration phase */
  currentPhase: 'phase1',
  
  /** Routes completed migration */
  completed: [] as string[],
  
  /** Routes currently being migrated */
  inProgress: [] as string[],
  
  /** Performance tracking enabled */
  performanceTracking: ENVIRONMENT.isDevelopment,
  
  /** Rollback capability enabled */
  rollbackEnabled: true,
  
  /** Feature flags for gradual rollout */
  featureFlags: {
    'direct-categories': ENVIRONMENT.isDevelopment,
    'direct-health': ENVIRONMENT.isDevelopment,
    'direct-filters': false,
    'hybrid-client': ENVIRONMENT.isDevelopment
  }
} as const;

/**
 * Update migration status
 * @context @migration-tracking
 */
export function updateMigrationStatus(route: string, status: 'completed' | 'in-progress' | 'rollback') {
  switch (status) {
    case 'completed':
      MIGRATION_CONFIG.completed.push(route);
      MIGRATION_CONFIG.inProgress = MIGRATION_CONFIG.inProgress.filter(r => r !== route);
      break;
      
    case 'in-progress':
      if (!MIGRATION_CONFIG.inProgress.includes(route)) {
        MIGRATION_CONFIG.inProgress.push(route);
      }
      break;
      
    case 'rollback':
      MIGRATION_CONFIG.completed = MIGRATION_CONFIG.completed.filter(r => r !== route);
      MIGRATION_CONFIG.inProgress = MIGRATION_CONFIG.inProgress.filter(r => r !== route);
      break;
  }
}

/**
 * Feature flag utilities
 * @context @feature-flags
 */
export function isFeatureEnabled(flag: keyof typeof MIGRATION_CONFIG.featureFlags): boolean {
  return MIGRATION_CONFIG.featureFlags[flag] || false;
}

export function enableFeature(flag: keyof typeof MIGRATION_CONFIG.featureFlags): void {
  MIGRATION_CONFIG.featureFlags[flag] = true;
}

export function disableFeature(flag: keyof typeof MIGRATION_CONFIG.featureFlags): void {
  MIGRATION_CONFIG.featureFlags[flag] = false;
}

/**
 * Environment-specific behavior configuration
 * @context @environment-behavior
 */
export const BEHAVIOR_CONFIG = {
  development: {
    enableMockFallbacks: true,
    enablePerformanceLogging: true,
    enableDebugHeaders: true,
    enableCORS: true,
    strictErrorHandling: false
  },
  
  staging: {
    enableMockFallbacks: false,
    enablePerformanceLogging: true, 
    enableDebugHeaders: false,
    enableCORS: true,
    strictErrorHandling: true
  },
  
  production: {
    enableMockFallbacks: false,
    enablePerformanceLogging: false,
    enableDebugHeaders: false, 
    enableCORS: false,
    strictErrorHandling: true
  }
} as const;

/**
 * Get current environment behavior configuration
 */
export function getBehaviorConfig() {
  const env = ENVIRONMENT.current as keyof typeof BEHAVIOR_CONFIG;
  return BEHAVIOR_CONFIG[env] || BEHAVIOR_CONFIG.development;
}

/**
 * Utility function to build API URLs
 * @context @url-building
 */
export function buildApiUrl(endpoint: string, type: 'laravel' | 'nextjs' = 'nextjs'): string {
  const urls = getAPIUrls();
  const baseUrl = type === 'laravel' ? urls.laravel : urls.nextjs;
  
  // Remove leading slash from endpoint if present
  const cleanEndpoint = endpoint.replace(/^\//, '');
  
  if (type === 'laravel') {
    return `${baseUrl}/${cleanEndpoint}`;
  } else {
    // Next.js routes expect /api prefix
    return cleanEndpoint.startsWith('api/') ? `/${cleanEndpoint}` : `/api/${cleanEndpoint}`;
  }
}

/**
 * Configuration validation
 * @context @config-validation
 */
export function validateConfiguration(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const urls = getAPIUrls();
  
  // Validate Laravel URL
  try {
    new URL(urls.laravel);
  } catch {
    errors.push(`Invalid Laravel API URL: ${urls.laravel}`);
  }
  
  // Validate environment
  if (!['development', 'staging', 'production'].includes(ENVIRONMENT.current)) {
    errors.push(`Invalid environment: ${ENVIRONMENT.current}`);
  }
  
  // Validate route classifications
  const routeCount = Object.keys(ROUTE_CLASSIFICATION).length;
  if (routeCount === 0) {
    errors.push('No routes configured in ROUTE_CLASSIFICATION');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Development utilities
 * @context @dev-utilities
 */
export const DEV_UTILS = {
  /** Log current configuration */
  logConfig: () => {
    if (ENVIRONMENT.isDevelopment) {
      console.group('🔧 API Configuration');
      console.log('Environment:', ENVIRONMENT.current);
      console.log('URLs:', getAPIUrls());
      console.log('Request Config:', getRequestConfig());
      console.log('Migration Status:', MIGRATION_CONFIG);
      console.log('Behavior Config:', getBehaviorConfig());
      console.groupEnd();
    }
  },
  
  /** Test configuration validity */
  testConfig: () => {
    const validation = validateConfiguration();
    console.log('Configuration valid:', validation.valid);
    if (!validation.valid) {
      console.error('Configuration errors:', validation.errors);
    }
    return validation;
  },
  
  /** Reset migration status (for testing) */
  resetMigration: () => {
    if (ENVIRONMENT.isDevelopment) {
      MIGRATION_CONFIG.completed.length = 0;
      MIGRATION_CONFIG.inProgress.length = 0;
      console.log('Migration status reset');
    }
  }
};