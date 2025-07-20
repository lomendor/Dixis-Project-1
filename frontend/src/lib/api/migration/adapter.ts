import { logger } from '@/lib/logging/productionLogger';

/**
 * 🔄 API MIGRATION ADAPTER - BACKWARD COMPATIBILITY LAYER
 * 
 * This adapter provides backward compatibility for all existing API calls
 * while gradually migrating to the new unified API structure.
 * 
 * CRITICAL: This prevents breaking changes during the migration process
 * and ensures the €70K-€290K revenue system continues working.
 * 
 * Created: 2025-01-25 (API Stability Foundation)
 * Purpose: Zero-downtime migration from old API chaos to unified structure
 */

import { apiClient } from '../core/client';
import { API_ENDPOINTS } from '../core/endpoints';

/**
 * Legacy API endpoint mappings
 * Maps old endpoint patterns to new unified endpoints
 */
const LEGACY_ENDPOINT_MAPPINGS = {
  // Old authentication endpoints
  '/login': API_ENDPOINTS.AUTH.LOGIN,
  '/register': API_ENDPOINTS.AUTH.REGISTER,
  '/logout': API_ENDPOINTS.AUTH.LOGOUT,
  '/user': API_ENDPOINTS.AUTH.ME,
  '/auth/me': API_ENDPOINTS.AUTH.ME,
  '/auth/refresh': API_ENDPOINTS.AUTH.REFRESH,
  
  // Old product endpoints
  '/products': API_ENDPOINTS.PRODUCTS.LIST,
  '/products/featured': API_ENDPOINTS.PRODUCTS.FEATURED,
  '/products/search': API_ENDPOINTS.PRODUCTS.SEARCH,
  '/products/new': API_ENDPOINTS.PRODUCTS.NEW,
  '/products/popular': API_ENDPOINTS.PRODUCTS.POPULAR,
  
  // Old category endpoints
  '/categories': API_ENDPOINTS.CATEGORIES.LIST,
  '/categories/tree': API_ENDPOINTS.CATEGORIES.TREE,
  '/categories/featured': API_ENDPOINTS.CATEGORIES.FEATURED,
  
  // Old producer endpoints
  '/producers': API_ENDPOINTS.PRODUCERS.LIST,
  '/producers/featured': API_ENDPOINTS.PRODUCERS.FEATURED,
  '/producers/search': API_ENDPOINTS.PRODUCERS.SEARCH,
  
  // Old cart endpoints
  '/cart': API_ENDPOINTS.CART.GET,
  '/cart/items': API_ENDPOINTS.CART.ADD_ITEM,
  '/cart/clear': API_ENDPOINTS.CART.CLEAR,
  '/cart/guest': API_ENDPOINTS.CART.GUEST,
  
  // Old order endpoints
  '/orders': API_ENDPOINTS.ORDERS.LIST,
  '/orders/history': API_ENDPOINTS.ORDERS.HISTORY,
  
  // Old shipping endpoints
  '/shipping/calculate': API_ENDPOINTS.SHIPPING.CALCULATE,
  '/shipping/zones': API_ENDPOINTS.SHIPPING.ZONES,
  '/shipping/methods': API_ENDPOINTS.SHIPPING.METHODS,
  
  // Old search endpoints
  '/search': API_ENDPOINTS.SEARCH.GLOBAL,
  '/search/products': API_ENDPOINTS.SEARCH.PRODUCTS,
  '/search/autocomplete': API_ENDPOINTS.SEARCH.AUTOCOMPLETE,
  
  // Old user endpoints
  '/user/profile': API_ENDPOINTS.USER.PROFILE,
  '/user/addresses': API_ENDPOINTS.USER.ADDRESSES,
  '/user/orders': API_ENDPOINTS.USER.ORDERS,
  '/user/wishlist': API_ENDPOINTS.USER.WISHLIST,
} as const;

/**
 * Legacy base URL mappings
 * Maps old base URLs to the new unified base URL
 */
const LEGACY_BASE_URL_MAPPINGS = {
  'http://localhost:8004': 'http://localhost:8000',
  'http://localhost:3000': 'http://localhost:8000',
  'https://api.dixis.io': 'https://api.dixis.gr',
} as const;

/**
 * Migration Adapter Class
 * Provides backward compatibility for legacy API calls
 */
export class ApiMigrationAdapter {
  private migrationLog: Array<{
    timestamp: Date;
    oldEndpoint: string;
    newEndpoint: string;
    method: string;
    success: boolean;
  }> = [];

  /**
   * Migrate legacy endpoint to new unified endpoint
   */
  migrateEndpoint(legacyEndpoint: string): string {
    // Remove base URL if present
    const cleanEndpoint = this.cleanEndpoint(legacyEndpoint);
    
    // Check for direct mapping
    if (LEGACY_ENDPOINT_MAPPINGS[cleanEndpoint as keyof typeof LEGACY_ENDPOINT_MAPPINGS]) {
      const newEndpoint = LEGACY_ENDPOINT_MAPPINGS[cleanEndpoint as keyof typeof LEGACY_ENDPOINT_MAPPINGS];
      this.logMigration(cleanEndpoint, newEndpoint, 'GET', true);
      return newEndpoint;
    }

    // Handle parameterized endpoints
    const migratedEndpoint = this.migrateParameterizedEndpoint(cleanEndpoint);
    if (migratedEndpoint !== cleanEndpoint) {
      this.logMigration(cleanEndpoint, migratedEndpoint, 'GET', true);
      return migratedEndpoint;
    }

    // If no migration found, try to construct new endpoint
    const constructedEndpoint = this.constructNewEndpoint(cleanEndpoint);
    this.logMigration(cleanEndpoint, constructedEndpoint, 'GET', constructedEndpoint !== cleanEndpoint);
    
    return constructedEndpoint;
  }

  /**
   * Migrate legacy base URL to new unified base URL
   */
  migrateBaseUrl(legacyBaseUrl: string): string {
    return LEGACY_BASE_URL_MAPPINGS[legacyBaseUrl as keyof typeof LEGACY_BASE_URL_MAPPINGS] || legacyBaseUrl;
  }

  /**
   * Clean endpoint by removing base URL and normalizing
   */
  private cleanEndpoint(endpoint: string): string {
    // Remove full URLs and keep only the path
    const url = new URL(endpoint, 'http://localhost');
    let path = url.pathname;

    // Remove /api/v1 prefix if present
    if (path.startsWith('/api/v1')) {
      path = path.substring(7);
    }

    // Ensure leading slash
    if (!path.startsWith('/')) {
      path = '/' + path;
    }

    return path;
  }

  /**
   * Handle parameterized endpoints (e.g., /products/123)
   */
  private migrateParameterizedEndpoint(endpoint: string): string {
    // Products with ID
    if (/^\/products\/\d+$/.test(endpoint)) {
      const id = endpoint.split('/')[2];
      return API_ENDPOINTS.PRODUCTS.DETAIL(id);
    }

    // Categories with ID
    if (/^\/categories\/\d+$/.test(endpoint)) {
      const id = endpoint.split('/')[2];
      return API_ENDPOINTS.CATEGORIES.DETAIL(id);
    }

    // Producers with ID
    if (/^\/producers\/\d+$/.test(endpoint)) {
      const id = endpoint.split('/')[2];
      return API_ENDPOINTS.PRODUCERS.DETAIL(id);
    }

    // Product reviews
    if (/^\/products\/\d+\/reviews$/.test(endpoint)) {
      const id = endpoint.split('/')[2];
      return API_ENDPOINTS.PRODUCTS.REVIEWS(id);
    }

    // Product questions
    if (/^\/products\/\d+\/questions$/.test(endpoint)) {
      const id = endpoint.split('/')[2];
      return API_ENDPOINTS.PRODUCTS.QUESTIONS(id);
    }

    // Related products
    if (/^\/products\/\d+\/related$/.test(endpoint)) {
      const id = endpoint.split('/')[2];
      return API_ENDPOINTS.PRODUCTS.RELATED(id);
    }

    // Producer products
    if (/^\/producers\/\d+\/products$/.test(endpoint)) {
      const id = endpoint.split('/')[2];
      return API_ENDPOINTS.PRODUCERS.PRODUCTS(id);
    }

    // Category products
    if (/^\/categories\/\d+\/products$/.test(endpoint)) {
      const id = endpoint.split('/')[2];
      return API_ENDPOINTS.CATEGORIES.PRODUCTS(id);
    }

    // Cart items
    if (/^\/cart\/items\/\d+$/.test(endpoint)) {
      const id = endpoint.split('/')[3];
      return API_ENDPOINTS.CART.UPDATE_ITEM(id);
    }

    // Orders with ID
    if (/^\/orders\/\d+$/.test(endpoint)) {
      const id = endpoint.split('/')[2];
      return API_ENDPOINTS.ORDERS.DETAIL(id);
    }

    // User addresses
    if (/^\/user\/addresses\/\d+$/.test(endpoint)) {
      const id = endpoint.split('/')[3];
      return API_ENDPOINTS.USER.ADDRESS(id);
    }

    return endpoint;
  }

  /**
   * Construct new endpoint from legacy pattern
   */
  private constructNewEndpoint(legacyEndpoint: string): string {
    // If endpoint already starts with /api/v1, it's likely already correct
    if (legacyEndpoint.startsWith('/api/v1/')) {
      return legacyEndpoint;
    }

    // Add /api/v1 prefix to legacy endpoints
    return `/api/v1${legacyEndpoint}`;
  }

  /**
   * Log migration for monitoring and debugging
   */
  private logMigration(oldEndpoint: string, newEndpoint: string, method: string, success: boolean): void {
    this.migrationLog.push({
      timestamp: new Date(),
      oldEndpoint,
      newEndpoint,
      method,
      success,
    });

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      if (success && oldEndpoint !== newEndpoint) {
        logger.info(`🔄 API Migration: ${oldEndpoint} → ${newEndpoint}`);
      } else if (!success) {
        logger.warn(`⚠️ API Migration Failed: ${oldEndpoint}`);
      }
    }
  }

  /**
   * Get migration statistics
   */
  getMigrationStats() {
    const total = this.migrationLog.length;
    const successful = this.migrationLog.filter(log => log.success).length;
    const failed = total - successful;

    return {
      total,
      successful,
      failed,
      successRate: total > 0 ? (successful / total) * 100 : 0,
      recentMigrations: this.migrationLog.slice(-10),
    };
  }

  /**
   * Clear migration log
   */
  clearMigrationLog(): void {
    this.migrationLog = [];
  }

  /**
   * Check if endpoint needs migration
   */
  needsMigration(endpoint: string): boolean {
    const cleanEndpoint = this.cleanEndpoint(endpoint);
    return !cleanEndpoint.startsWith('/api/v1/');
  }
}

/**
 * Singleton instance of the migration adapter
 */
export const migrationAdapter = new ApiMigrationAdapter();

/**
 * Legacy API client wrapper
 * Provides backward compatibility for old API calls
 */
export class LegacyApiClient {
  /**
   * GET request with automatic migration
   */
  async get(endpoint: string, options?: any) {
    const migratedEndpoint = migrationAdapter.migrateEndpoint(endpoint);
    return apiClient.get(migratedEndpoint, options);
  }

  /**
   * POST request with automatic migration
   */
  async post(endpoint: string, data?: any, options?: any) {
    const migratedEndpoint = migrationAdapter.migrateEndpoint(endpoint);
    return apiClient.post(migratedEndpoint, data, options);
  }

  /**
   * PUT request with automatic migration
   */
  async put(endpoint: string, data?: any, options?: any) {
    const migratedEndpoint = migrationAdapter.migrateEndpoint(endpoint);
    return apiClient.put(migratedEndpoint, data, options);
  }

  /**
   * PATCH request with automatic migration
   */
  async patch(endpoint: string, data?: any, options?: any) {
    const migratedEndpoint = migrationAdapter.migrateEndpoint(endpoint);
    return apiClient.patch(migratedEndpoint, data, options);
  }

  /**
   * DELETE request with automatic migration
   */
  async delete(endpoint: string, options?: any) {
    const migratedEndpoint = migrationAdapter.migrateEndpoint(endpoint);
    return apiClient.delete(migratedEndpoint, options);
  }
}

/**
 * Legacy API client instance for backward compatibility
 */
export const legacyApiClient = new LegacyApiClient();

/**
 * Default export for convenience
 */
export default migrationAdapter;
