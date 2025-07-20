import { logger } from '@/lib/logging/productionLogger';

/**
 * API Proxy Service for Frontend-Backend Integration
 * 
 * This service handles the communication between the Next.js frontend
 * and the Laravel backend, providing a unified interface for all API calls.
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

interface ApiProxyConfig {
  baseURL: string;
  timeout: number;
  retries: number;
  retryDelay: number;
}

interface ApiResponse<T = any> {
  data: T;
  status: number;
  message?: string;
  errors?: Record<string, string[]>;
  meta?: {
    pagination?: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  };
}

interface RequestOptions {
  skipAuth?: boolean;
  retries?: number;
  cache?: boolean;
  cacheTTL?: number;
  // Include common Axios options we need
  timeout?: number;
  headers?: Record<string, string>;
  params?: any;
  data?: any;
}

class ApiProxyService {
  private client: AxiosInstance;
  private config: ApiProxyConfig;
  private cache: Map<string, { data: any; expires: number }> = new Map();

  constructor() {
    this.config = {
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
      timeout: 30000, // 30 seconds
      retries: 3,
      retryDelay: 1000, // 1 second
    };

    this.client = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
      withCredentials: true, // For CSRF and session cookies
    });

    this.setupInterceptors();
  }

  /**
   * Setup request and response interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add auth token if available
        const token = this.getAuthToken();
        if (token && !config?.headers?.skipAuth) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Add CSRF token for state-changing requests
        if (['post', 'put', 'patch', 'delete'].includes(config?.method?.toLowerCase() || '')) {
          const csrfToken = this.getCsrfToken();
          if (csrfToken) {
            config.headers['X-CSRF-TOKEN'] = csrfToken;
          }
        }

        // Add API key if configured
        const apiKey = process.env.NEXT_PUBLIC_API_KEY;
        if (apiKey) {
          config.headers['X-API-Key'] = apiKey;
        }

        // Add tenant context if available
        const tenantId = this.getTenantId();
        if (tenantId) {
          config.headers['X-Tenant-ID'] = tenantId;
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        // Handle 401 Unauthorized
        if (error?.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            await this.refreshToken();
            return this.client(originalRequest);
          } catch (refreshError) {
            this.handleAuthError();
            return Promise.reject(refreshError);
          }
        }

        // Handle 429 Rate Limiting
        if (error?.response?.status === 429) {
          const retryAfter = error.response.headers['retry-after'] || 60;
          logger.warn(`Rate limited. Retrying after ${retryAfter} seconds.`);
          
          await this.delay(retryAfter * 1000);
          return this.client(originalRequest);
        }

        // Handle network errors with retry
        if (!error.response && originalRequest.retries > 0) {
          originalRequest.retries--;
          await this.delay(this.config.retryDelay);
          return this.client(originalRequest);
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * GET request
   */
  async get<T = any>(
    url: string, 
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const cacheKey = `GET:${url}:${JSON.stringify(options.params || {})}`;
    
    // Check cache if enabled
    if (options.cache) {
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }
    }

    try {
      // Separate custom options from Axios options
      const { skipAuth, retries, cache, cacheTTL, ...axiosOptions } = options;
      
      const response = await this.client.get<any>(url, axiosOptions);

      const result = this.formatResponse(response);

      // Cache if enabled
      if (options.cache) {
        this.setCache(cacheKey, result, options.cacheTTL || 300000); // 5 minutes default
      }

      return result as ApiResponse<T>;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * POST request
   */
  async post<T = any>(
    url: string, 
    data?: any, 
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    try {
      // Separate custom options from Axios options
      const { skipAuth, retries, cache, cacheTTL, ...axiosOptions } = options;
      
      const response = await this.client.post<any>(url, data, axiosOptions);

      return this.formatResponse(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    try {
      const response = await this.get('/v1/health', {
        skipAuth: true,
        cache: false
      });
      return response.data;
    } catch (error) {
      return { 
        status: 'unhealthy', 
        timestamp: new Date().toISOString() 
      };
    }
  }

  /**
   * Get authentication token
   */
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    
    // Try localStorage first
    const token = localStorage.getItem('auth_token');
    if (token) return token;

    // Try sessionStorage
    const sessionToken = sessionStorage.getItem('auth_token');
    if (sessionToken) return sessionToken;

    return null;
  }

  /**
   * Get CSRF token
   */
  private getCsrfToken(): string | null {
    if (typeof window === 'undefined') return null;

    // Try meta tag first
    const metaToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    if (metaToken) return metaToken;

    return null;
  }

  /**
   * Get tenant ID
   */
  private getTenantId(): string | null {
    if (typeof window === 'undefined') return null;
    
    return localStorage.getItem('tenant_id') || null;
  }

  /**
   * Refresh authentication token
   */
  private async refreshToken(): Promise<void> {
    try {
      const response = await this.client.post('/auth/refresh', {});

      const newToken = response.data?.data?.token;
      if (newToken && typeof window !== 'undefined') {
        localStorage.setItem('auth_token', newToken);
      }
    } catch (error) {
      throw new Error('Token refresh failed');
    }
  }

  /**
   * Handle authentication error
   */
  private handleAuthError(): void {
    if (typeof window === 'undefined') return;

    // Clear auth data
    localStorage.removeItem('auth_token');
    sessionStorage.removeItem('auth_token');
    localStorage.removeItem('user');

    // Redirect to login
    window.location.href = '/auth/login';
  }

  /**
   * Format API response
   */
  private formatResponse<T>(response: AxiosResponse<any>): ApiResponse<T> {
    // Handle both wrapped and direct responses
    const responseData = response.data;
    return {
      data: responseData.data !== undefined ? responseData.data : responseData,
      status: response.status,
      message: responseData.message,
      errors: responseData.errors,
      meta: responseData.meta,
    };
  }

  /**
   * Handle API errors
   */
  private handleError(error: any): Error {
    if (error.response) {
      // Server responded with error status
      const message = error.response?.data?.message || 
                     error.response?.data?.error || 
                     `HTTP ${error.response.status}: ${error.response.statusText}`;
      
      const apiError = new Error(message);
      (apiError as any).status = error.response.status;
      (apiError as any).errors = error.response?.data?.errors;
      (apiError as any).data = error.response.data;
      
      return apiError;
    } else if (error.request) {
      // Network error
      return new Error('Network error: Unable to connect to server');
    } else {
      // Other error
      return new Error(error.message || 'Unknown error occurred');
    }
  }

  /**
   * Cache management
   */
  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && cached.expires > Date.now()) {
      return cached.data;
    }
    
    if (cached) {
      this.cache.delete(key);
    }
    
    return null;
  }

  private setCache(key: string, data: any, ttl: number): void {
    this.cache.set(key, {
      data,
      expires: Date.now() + ttl,
    });
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Delay utility
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get base URL
   */
  getBaseURL(): string {
    return this.config.baseURL;
  }
}

// Export singleton instance
export const apiProxy = new ApiProxyService();
export default apiProxy;