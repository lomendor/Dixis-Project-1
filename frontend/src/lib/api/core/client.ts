import { toError, errorToContext } from '@/lib/utils/errorUtils';
import { logger } from '@/lib/logging/productionLogger';

/**
 * 🛡️ UNIFIED API CLIENT - SINGLE SOURCE OF TRUTH
 * 
 * This is the ONLY API client that should be used throughout the application.
 * It provides a stable, consistent interface that prevents breaking changes.
 * 
 * CRITICAL: This replaces ALL other API clients and prevents the historical
 * problem of inconsistent API configurations.
 * 
 * Created: 2025-01-25 (API Stability Foundation)
 * Purpose: Rock-solid API communication layer
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { getApiConfig, validateApiConfig } from './config';

/**
 * API Response wrapper type
 */
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  status: number;
  success: boolean;
}

/**
 * API Error type
 */
export interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: any;
}

/**
 * Request options type
 */
export interface RequestOptions extends AxiosRequestConfig {
  skipAuth?: boolean;
  skipRetry?: boolean;
  skipCache?: boolean;
}

/**
 * Unified API Client Class
 * Provides a stable, consistent interface for all API calls
 */
class UnifiedApiClient {
  private client: AxiosInstance;
  private config: ReturnType<typeof getApiConfig>;

  constructor() {
    this.config = getApiConfig();
    validateApiConfig(this.config);
    
    this.client = axios.create({
      baseURL: this.config.BASE_URL,
      timeout: this.config.TIMEOUT,
      headers: this.config.DEFAULT_HEADERS,
      withCredentials: true,
    });

    this.setupInterceptors();
  }

  /**
   * Setup request and response interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor - Add auth token
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

        // Log request in development
        if (this.config.FEATURES.LOGGING_ENABLED) {
          logger.info(`🚀 API Request: ${config?.method?.toUpperCase()} ${config.url}`, {
            data: config.data,
            params: config.params,
          });
        }

        return config;
      },
      (error) => {
        logger.error('🚨 API Request Error:', toError(error), errorToContext(error));
        return Promise.reject(error);
      }
    );

    // Response interceptor - Handle responses and errors
    this.client.interceptors.response.use(
      (response) => {
        // Log response in development
        if (this.config.FEATURES.LOGGING_ENABLED) {
          logger.info(`✅ API Response: ${response.status}`, {
            url: response.config.url,
            data: response.data,
          });
        }

        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        // Handle 401 - Unauthorized
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

        // Handle 429 - Rate limiting with retry
        if (error?.response?.status === 429 && this.config.FEATURES.RETRY_ENABLED) {
          const retryAfter = error.response.headers['retry-after'] || 1;
          await this.delay(retryAfter * 1000);
          return this.client(originalRequest);
        }

        // Log error in development
        if (this.config.FEATURES.LOGGING_ENABLED) {
          logger.error('🚨 API Response Error:', {
            status: error?.response?.status,
            url: error?.config?.url,
            message: error.message,
            data: error?.response?.data,
          });
        }

        return Promise.reject(this.formatError(error));
      }
    );
  }

  /**
   * GET request
   */
  async get<T = any>(url: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    const response = await this.client.get<T>(url, options);
    return this.formatResponse(response);
  }

  /**
   * POST request
   */
  async post<T = any>(url: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    const response = await this.client.post<T>(url, data, options);
    return this.formatResponse(response);
  }

  /**
   * PUT request
   */
  async put<T = any>(url: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    const response = await this.client.put<T>(url, data, options);
    return this.formatResponse(response);
  }

  /**
   * PATCH request
   */
  async patch<T = any>(url: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    const response = await this.client.patch<T>(url, data, options);
    return this.formatResponse(response);
  }

  /**
   * DELETE request
   */
  async delete<T = any>(url: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    const response = await this.client.delete<T>(url, options);
    return this.formatResponse(response);
  }

  /**
   * Upload file
   */
  async upload<T = any>(url: string, file: File, options?: RequestOptions): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.client.post<T>(url, formData, {
      ...options,
      headers: {
        ...options?.headers,
        'Content-Type': 'multipart/form-data',
      },
    });

    return this.formatResponse(response);
  }

  /**
   * Format response to consistent structure
   */
  private formatResponse<T>(response: AxiosResponse<T>): ApiResponse<T> {
    return {
      data: response.data,
      status: response.status,
      success: response.status >= 200 && response.status < 300,
      message: (response.data as any)?.message,
    };
  }

  /**
   * Format error to consistent structure
   */
  private formatError(error: any): ApiError {
    return {
      message: error?.response?.data?.message || error.message || 'An error occurred',
      status: error?.response?.status || 500,
      code: error?.response?.data?.code || error.code,
      details: error?.response?.data,
    };
  }

  /**
   * Get auth token from storage
   */
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth-token') || sessionStorage.getItem('auth-token');
  }

  /**
   * Get CSRF token
   */
  private getCsrfToken(): string | null {
    if (typeof window === 'undefined') return null;
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || null;
  }

  /**
   * Refresh authentication token
   */
  private async refreshToken(): Promise<void> {
    const refreshToken = localStorage.getItem('refresh-token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await this.client.post('/api/v1/auth/refresh', {
      refresh_token: refreshToken,
    });

    const { access_token, refresh_token: newRefreshToken } = response.data;
    
    localStorage.setItem('auth-token', access_token);
    if (newRefreshToken) {
      localStorage.setItem('refresh-token', newRefreshToken);
    }
  }

  /**
   * Handle authentication errors
   */
  private handleAuthError(): void {
    // Clear tokens
    localStorage.removeItem('auth-token');
    localStorage.removeItem('refresh-token');
    sessionStorage.removeItem('auth-token');

    // Redirect to login if in browser
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }

  /**
   * Delay utility for retries
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get client configuration
   */
  getConfig() {
    return this.config;
  }

  /**
   * Update base URL (for environment changes)
   */
  updateBaseUrl(baseUrl: string): void {
    this.client.defaults.baseURL = baseUrl;
    this.config = { ...this.config, BASE_URL: baseUrl };
  }
}

/**
 * Singleton instance of the unified API client
 * This is the ONLY API client instance that should be used
 */
export const apiClient = new UnifiedApiClient();

/**
 * Export the client class for testing purposes
 */
export { UnifiedApiClient };

/**
 * Default export for convenience
 */
export default apiClient;
