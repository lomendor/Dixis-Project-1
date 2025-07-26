/**
 * @fileoverview Hybrid API Client - Smart Routing System
 * @context @hybrid-approach @api-client @smart-routing
 * @see docs/API_ARCHITECTURE.md for routing decisions
 * @see docs/MIGRATION_PLAN.md for implementation strategy
 * 
 * This client automatically routes API requests to either:
 * - Next.js proxy routes (for complex business logic, auth, fallbacks)
 * - Direct Laravel API calls (for simple CRUD, performance optimization)
 */

import { ROUTE_CLASSIFICATION, PERFORMANCE_TARGETS, type APIRoute, type PerformanceMetrics } from './types/api-architecture';
import { UNIFIED_API_CONFIG } from './config/unified';

/**
 * API Client Configuration
 * @context @api-config @environment-config
 */
interface APIClientConfig {
  /** Laravel API base URL */
  laravelBase: string;
  
  /** Next.js proxy base URL */
  proxyBase: string;
  
  /** Request timeout in milliseconds */
  timeout: number;
  
  /** Number of retry attempts */
  retries: number;
  
  /** Enable performance monitoring */
  performanceMonitoring: boolean;
  
  /** Enable mock fallbacks in development */
  fallbackEnabled: boolean;
  
  /** Current environment */
  environment: 'development' | 'staging' | 'production';
}

/**
 * Performance monitoring data
 */
interface RequestMetrics {
  endpoint: string;
  method: string;
  startTime: number;
  endTime: number;
  duration: number;
  success: boolean;
  routingType: 'proxy' | 'direct';
  error?: string;
}

/**
 * Hybrid API Client
 * @context @hybrid-client @performance-monitoring
 * 
 * Features:
 * - Smart routing based on route classification
 * - Environment-aware behavior
 * - Performance monitoring and metrics
 * - Automatic fallback handling
 * - Centralized error management
 */
export class HybridAPIClient {
  private config: APIClientConfig;
  private metrics: RequestMetrics[] = [];

  constructor(config?: Partial<APIClientConfig>) {
    this.config = {
      laravelBase: UNIFIED_API_CONFIG.BASE_URL + UNIFIED_API_CONFIG.PREFIX,
      proxyBase: '/api',
      timeout: 10000,
      retries: 2,
      performanceMonitoring: true,
      fallbackEnabled: process.env.NODE_ENV === 'development',
      environment: (process.env.NODE_ENV as APIClientConfig['environment']) || 'development',
      ...config
    };
  }

  /**
   * Main request method with smart routing
   * @context @smart-routing
   */
  async request<T = any>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const startTime = performance.now();
    const route = this.getRouteConfig(endpoint);
    
    try {
      let response: Response;
      let routingType: 'proxy' | 'direct';

      // Smart routing decision
      if (this.shouldUseDirectCall(route, endpoint)) {
        response = await this.directLaravelCall(endpoint, options);
        routingType = 'direct';
      } else {
        response = await this.proxyCall(endpoint, options);
        routingType = 'proxy';
      }

      const data = await response.json();
      
      // Record performance metrics
      if (this.config.performanceMonitoring) {
        this.recordMetrics({
          endpoint,
          method: options.method || 'GET',
          startTime,
          endTime: performance.now(),
          duration: performance.now() - startTime,
          success: response.ok,
          routingType
        });
      }

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      return data;
    } catch (error) {
      // Record error metrics
      if (this.config.performanceMonitoring) {
        this.recordMetrics({
          endpoint,
          method: options.method || 'GET',
          startTime,
          endTime: performance.now(),
          duration: performance.now() - startTime,
          success: false,
          routingType: 'proxy', // Default for errors
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }

      throw error;
    }
  }

  /**
   * Routing decision logic
   * @context @routing-decisions
   */
  private shouldUseDirectCall(route: APIRoute | null, endpoint: string): boolean {
    // No route configuration = use proxy (safe default)
    if (!route) return false;

    // Migration status check
    if (route.migrationStatus === 'keep') return false;
    if (route.migrationStatus === 'migrate' && route.type === 'direct') return true;
    if (route.migrationStatus === 'completed') return true;

    // Environment-specific overrides
    if (this.config.environment === 'development' && this.config.fallbackEnabled) {
      // In development, prefer proxy for routes with mock fallbacks
      if (route.reason === 'mock-fallback') return false;
    }

    // Performance-critical routes always direct in production
    if (this.config.environment === 'production' && route.reason === 'performance') {
      return true;
    }

    // Default to proxy for safety
    return false;
  }

  /**
   * Direct Laravel API call
   * @context @direct-calls @laravel-api
   */
  private async directLaravelCall(endpoint: string, options: RequestInit): Promise<Response> {
    const url = this.buildLaravelUrl(endpoint);
    
    const requestOptions: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers
      },
      signal: AbortSignal.timeout(this.config.timeout)
    };

    return fetch(url, requestOptions);
  }

  /**
   * Next.js proxy call
   * @context @proxy-calls @nextjs-api
   */
  private async proxyCall(endpoint: string, options: RequestInit): Promise<Response> {
    const url = this.buildProxyUrl(endpoint);
    
    const requestOptions: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers
      },
      signal: AbortSignal.timeout(this.config.timeout)
    };

    return fetch(url, requestOptions);
  }

  /**
   * Build Laravel API URL
   */
  private buildLaravelUrl(endpoint: string): string {
    // Remove leading /api if present
    const cleanEndpoint = endpoint.replace(/^\/api\//, '');
    return `${this.config.laravelBase}/${cleanEndpoint}`;
  }

  /**
   * Build Next.js proxy URL
   */
  private buildProxyUrl(endpoint: string): string {
    // Ensure leading /api
    const cleanEndpoint = endpoint.startsWith('/api/') ? endpoint : `/api/${endpoint}`;
    return cleanEndpoint;
  }

  /**
   * Get route configuration
   */
  private getRouteConfig(endpoint: string): APIRoute | null {
    // Normalize endpoint for lookup
    const normalizedEndpoint = endpoint.replace(/^\/api\//, '').replace(/^\//, '');
    
    // Direct lookup
    if (ROUTE_CLASSIFICATION[normalizedEndpoint]) {
      return ROUTE_CLASSIFICATION[normalizedEndpoint];
    }

    // Pattern matching for dynamic routes
    for (const [key, config] of Object.entries(ROUTE_CLASSIFICATION)) {
      if (key.includes('[') && this.matchesPattern(normalizedEndpoint, key)) {
        return config;
      }
    }

    return null;
  }

  /**
   * Pattern matching for dynamic routes
   */
  private matchesPattern(endpoint: string, pattern: string): boolean {
    const regex = pattern.replace(/\[([^\]]+)\]/g, '([^/]+)');
    return new RegExp(`^${regex}$`).test(endpoint);
  }

  /**
   * Record performance metrics
   * @context @performance-monitoring
   */
  private recordMetrics(metrics: RequestMetrics): void {
    this.metrics.push(metrics);
    
    // Keep only last 100 metrics to prevent memory leaks
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100);
    }

    // Log performance in development
    if (this.config.environment === 'development') {
      console.log(`🚀 API ${metrics.routingType}: ${metrics.endpoint} (${metrics.duration.toFixed(0)}ms)`);
    }
  }

  /**
   * Get performance analytics
   * @context @performance-analytics
   */
  getPerformanceAnalytics(): {
    averageResponseTime: number;
    proxyVsDirect: { proxy: number; direct: number };
    errorRate: number;
    recentMetrics: RequestMetrics[];
  } {
    if (this.metrics.length === 0) {
      return {
        averageResponseTime: 0,
        proxyVsDirect: { proxy: 0, direct: 0 },
        errorRate: 0,
        recentMetrics: []
      };
    }

    const totalTime = this.metrics.reduce((sum, m) => sum + m.duration, 0);
    const averageResponseTime = totalTime / this.metrics.length;

    const proxyCount = this.metrics.filter(m => m.routingType === 'proxy').length;
    const directCount = this.metrics.filter(m => m.routingType === 'direct').length;

    const errorCount = this.metrics.filter(m => !m.success).length;
    const errorRate = errorCount / this.metrics.length;

    return {
      averageResponseTime,
      proxyVsDirect: { proxy: proxyCount, direct: directCount },
      errorRate,
      recentMetrics: this.metrics.slice(-10)
    };
  }

  /**
   * Update route configuration (for testing/debugging)
   * @context @route-configuration
   */
  updateRouteConfig(endpoint: string, updates: Partial<APIRoute>): void {
    const normalizedEndpoint = endpoint.replace(/^\/api\//, '').replace(/^\//, '');
    
    if (ROUTE_CLASSIFICATION[normalizedEndpoint]) {
      Object.assign(ROUTE_CLASSIFICATION[normalizedEndpoint], updates);
    }
  }

  /**
   * Force route type for testing
   */
  forceRouteType(endpoint: string, type: 'proxy' | 'direct'): void {
    this.updateRouteConfig(endpoint, { 
      type, 
      migrationStatus: type === 'direct' ? 'completed' : 'keep' 
    });
  }
}

/**
 * Global hybrid API client instance
 * @context @global-client
 */
export const apiClient = new HybridAPIClient();

/**
 * Convenience methods for common HTTP operations
 * @context @convenience-methods
 */
export const api = {
  get: <T = any>(endpoint: string, options?: RequestInit) => 
    apiClient.request<T>(endpoint, { ...options, method: 'GET' }),
    
  post: <T = any>(endpoint: string, data?: any, options?: RequestInit) =>
    apiClient.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined
    }),
    
  put: <T = any>(endpoint: string, data?: any, options?: RequestInit) =>
    apiClient.request<T>(endpoint, {
      ...options,
      method: 'PUT', 
      body: data ? JSON.stringify(data) : undefined
    }),
    
  delete: <T = any>(endpoint: string, options?: RequestInit) =>
    apiClient.request<T>(endpoint, { ...options, method: 'DELETE' }),

  // Performance monitoring
  getMetrics: () => apiClient.getPerformanceAnalytics(),
  
  // Testing utilities
  forceProxy: (endpoint: string) => apiClient.forceRouteType(endpoint, 'proxy'),
  forceDirect: (endpoint: string) => apiClient.forceRouteType(endpoint, 'direct')
};