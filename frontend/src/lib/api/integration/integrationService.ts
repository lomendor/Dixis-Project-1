import { toError, errorToContext } from '@/lib/utils/errorUtils';
import { logger } from '@/lib/logging/productionLogger';

/**
 * Integration Service for Frontend-Backend Connection
 * 
 * This service manages the integration between the Next.js frontend
 * and Laravel backend, handling feature flags, fallbacks, and data synchronization.
 */

import { apiProxy } from '../proxy/apiProxy';

interface IntegrationConfig {
  useRealProducts: boolean;
  useRealCategories: boolean;
  useRealProducers: boolean;
  useRealAuth: boolean;
  useRealCart: boolean;
  useRealOrders: boolean;
  fallbackToMock: boolean;
  healthCheckInterval: number;
}

interface HealthStatus {
  backend: 'healthy' | 'unhealthy' | 'unknown';
  database: 'healthy' | 'unhealthy' | 'unknown';
  lastCheck: Date;
  responseTime: number;
}

class IntegrationService {
  private config: IntegrationConfig;
  private healthStatus: HealthStatus;
  private healthCheckTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.config = {
      useRealProducts: true, // TRY REAL API FIRST
      useRealCategories: true, // TRY REAL API FIRST
      useRealProducers: true, // TRY REAL API FIRST
      useRealAuth: true, // TRY REAL API FIRST
      useRealCart: true, // TRY REAL API FIRST
      useRealOrders: true, // TRY REAL API FIRST
      fallbackToMock: true, // ENABLE GRACEFUL FALLBACK
      healthCheckInterval: 60000, // 1 minute
    };

    this.healthStatus = {
      backend: 'unknown',
      database: 'unknown',
      lastCheck: new Date(),
      responseTime: 0,
    };

    this.startHealthChecks();
  }

  /**
   * Start periodic health checks
   */
  private startHealthChecks(): void {
    if (typeof window === 'undefined') return;

    this.performHealthCheck();
    
    this.healthCheckTimer = setInterval(() => {
      this.performHealthCheck();
    }, this.config.healthCheckInterval);
  }

  /**
   * Stop health checks
   */
  stopHealthChecks(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = null;
    }
  }

  /**
   * Perform health check
   */
  private async performHealthCheck(): Promise<void> {
    const startTime = Date.now();

    try {
      logger.info('🔍 Performing health check...');
      const health = await apiProxy.healthCheck();
      const responseTime = Date.now() - startTime;

      logger.info('✅ Health check response:', health);
      logger.info('📊 Response time:', responseTime + 'ms');

      this.healthStatus = {
        backend: health.status === 'healthy' ? 'healthy' : 'unhealthy',
        database: 'healthy', // Assume healthy if backend responds
        lastCheck: new Date(),
        responseTime,
      };

      logger.info('💾 Updated health status:', this.healthStatus);
    } catch (error) {
      logger.error('❌ Health check failed:', toError(error), errorToContext(error));
      this.healthStatus = {
        backend: 'unhealthy',
        database: 'unknown',
        lastCheck: new Date(),
        responseTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Get current health status
   */
  getHealthStatus(): HealthStatus {
    return { ...this.healthStatus };
  }

  /**
   * Check if backend is available
   */
  isBackendAvailable(): boolean {
    return this.healthStatus.backend === 'healthy';
  }

  /**
   * Determine if should use real API for a feature
   */
  shouldUseRealApi(feature: keyof IntegrationConfig): boolean {
    // Always use real API since we forced the config
    return this.config[feature];
  }

  /**
   * Make API call with fallback
   */
  async apiCall<T>(
    feature: keyof IntegrationConfig,
    realApiCall: () => Promise<T>,
    mockApiCall: () => Promise<T> | T
  ): Promise<T> {
    logger.info(`🔍 apiCall for ${feature}:`);
    logger.info(`  - Config enabled: ${this.config[feature]}`);
    logger.info(`  - Backend available: ${this.isBackendAvailable()}`);
    logger.info(`  - Should use real API: ${this.shouldUseRealApi(feature)}`);

    if (this.shouldUseRealApi(feature)) {
      try {
        logger.info(`📡 Making real API call for ${feature}...`);
        const result = await realApiCall();
        logger.info(`✅ Real API call succeeded for ${feature}:`, result);
        return result;
      } catch (error) {
        logger.warn(`❌ Real API call failed for ${feature}, falling back to mock:`, error);

        if (this.config.fallbackToMock) {
          return await mockApiCall();
        }

        throw error;
      }
    } else {
      logger.info(`🎭 Using mock data for ${feature}`);
      return await mockApiCall();
    }
  }

  /**
   * Products API integration
   */
  async getProducts(params?: any): Promise<any> {
    return this.apiCall(
      'useRealProducts',
      () => apiProxy.get('/v1/products', { params, cache: true, cacheTTL: 300000 }),
      () => Promise.resolve({ data: [], status: 200, message: 'Mock data' })
    );
  }

  async getProduct(id: string): Promise<any> {
    return this.apiCall(
      'useRealProducts',
      () => apiProxy.get(`/v1/products/${id}`, { cache: true, cacheTTL: 600000 }),
      () => Promise.resolve({ data: null, status: 200, message: 'Mock data' })
    );
  }

  /**
   * Categories API integration
   */
  async getCategories(): Promise<any> {
    return this.apiCall(
      'useRealCategories',
      () => apiProxy.get('/v1/categories', { cache: true, cacheTTL: 600000 }),
      () => Promise.resolve({ data: [], status: 200, message: 'Mock data' })
    );
  }

  /**
   * Producers API integration
   */
  async getProducers(params?: any): Promise<any> {
    return this.apiCall(
      'useRealProducers',
      () => apiProxy.get('/v1/producers', { params, cache: true, cacheTTL: 300000 }),
      () => Promise.resolve({ data: [], status: 200, message: 'Mock data' })
    );
  }

  /**
   * Orders API integration
   */
  async getOrders(params?: any): Promise<any> {
    return this.apiCall(
      'useRealOrders',
      () => apiProxy.get('/v1/orders', { params, cache: true, cacheTTL: 300000 }),
      () => Promise.resolve({ data: [], meta: { pagination: { total: 1200 } }, status: 200, message: 'Mock data' })
    );
  }

  /**
   * Authentication API integration
   */
  async login(credentials: { email: string; password: string }): Promise<any> {
    return this.apiCall(
      'useRealAuth',
      () => apiProxy.post('/auth/login', credentials),
      () => Promise.resolve({ data: { token: 'mock-token', user: { id: 1, email: credentials.email } }, status: 200 })
    );
  }

  async register(userData: any): Promise<any> {
    return this.apiCall(
      'useRealAuth',
      () => apiProxy.post('/auth/register', userData),
      () => Promise.resolve({ data: { token: 'mock-token', user: { id: 1, ...userData } }, status: 201 })
    );
  }

  async logout(): Promise<any> {
    return this.apiCall(
      'useRealAuth',
      () => apiProxy.post('/auth/logout'),
      () => Promise.resolve({ data: null, status: 200, message: 'Logged out' })
    );
  }

  /**
   * Cart API integration
   */
  async getCart(): Promise<any> {
    return this.apiCall(
      'useRealCart',
      () => apiProxy.get('/cart'),
      () => Promise.resolve({ data: { items: [], total: 0 }, status: 200 })
    );
  }

  async addToCart(productId: string, quantity: number): Promise<any> {
    return this.apiCall(
      'useRealCart',
      () => apiProxy.post('/cart/items', { product_id: productId, quantity }),
      () => Promise.resolve({ data: { id: Date.now(), product_id: productId, quantity }, status: 201 })
    );
  }



  async createOrder(orderData: any): Promise<any> {
    return this.apiCall(
      'useRealOrders',
      () => apiProxy.post('/orders', orderData),
      () => Promise.resolve({ data: { id: Date.now(), ...orderData, status: 'pending' }, status: 201 })
    );
  }

  /**
   * Test backend connection
   */
  async testConnection(): Promise<{
    success: boolean;
    responseTime: number;
    error?: string;
  }> {
    logger.info('🚀 testConnection() called');
    const startTime = Date.now();

    try {
      logger.info('📡 Calling apiProxy.healthCheck()...');
      await apiProxy.healthCheck();
      logger.info('✅ apiProxy.healthCheck() succeeded');

      // Update health status after successful test
      logger.info('🔄 Calling performHealthCheck()...');
      await this.performHealthCheck();

      return {
        success: true,
        responseTime: Date.now() - startTime,
      };
    } catch (error) {
      logger.error('❌ testConnection() failed:', toError(error), errorToContext(error));
      // Update health status after failed test
      await this.performHealthCheck();
      return {
        success: false,
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get integration status
   */
  getIntegrationStatus(): {
    config: IntegrationConfig;
    health: HealthStatus;
    backendUrl: string;
  } {
    return {
      config: this.config,
      health: this.getHealthStatus(),
      backendUrl: apiProxy.getBaseURL(),
    };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<IntegrationConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

// Export singleton instance
export const integrationService = new IntegrationService();
export default integrationService;