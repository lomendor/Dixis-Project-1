'use client';

import { ApiClient, ApiResponse, ApiError, RequestConfig } from './apiTypes';
import { csrfProtection } from '@/lib/security/csrfProtection';
import { UNIFIED_API_CONFIG } from '../config/unified';

/**
 * UNIFIED API CLIENT - Single source of truth for all API calls
 * Consolidates features from multiple API clients into one consistent interface
 */

/**
 * Base API URL from environment variables
 */
const API_BASE_URL = UNIFIED_API_CONFIG.BASE_URL;
const API_VERSION = 'v1';

/**
 * Default request timeout
 */
const DEFAULT_TIMEOUT = 30000; // 30 seconds

/**
 * Rate limiting store (in-memory for demo)
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Simple response cache
 */
const responseCache = new Map<string, { data: any; expiry: number }>();

/**
 * Generate unique request ID
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Rate limiting check
 */
function rateLimit(identifier: string, maxRequests: number = 100, windowMs: number = 900000): boolean {
  const now = Date.now();
  const key = identifier;
  const current = rateLimitStore.get(key);

  if (!current || now > current.resetTime) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs,
    });
    return true;
  }

  if (current.count >= maxRequests) {
    return false;
  }

  current.count++;
  return true;
}

/**
 * Cache utilities
 */
function getCachedResponse(key: string): any | null {
  const cached = responseCache.get(key);
  if (!cached || Date.now() > cached.expiry) {
    responseCache.delete(key);
    return null;
  }
  return cached.data;
}

function setCachedResponse(key: string, data: any, ttlSeconds: number = 300): void {
  responseCache.set(key, {
    data,
    expiry: Date.now() + (ttlSeconds * 1000),
  });
}

/**
 * Enhanced fetch with retry logic
 */
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries: number = 3,
  retryDelay: number = 1000
): Promise<Response> {
  let lastError: Error;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Request-ID': generateRequestId(),
          'X-Client-Version': process.env.npm_package_version || '1.0.0',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      lastError = error as Error;
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
      }
    }
  }

  throw lastError!;
}

/**
 * Create an API error from a response or error
 */
function createApiError(error: any, status?: number): ApiError {
  const apiError = new Error(error.message || 'API request failed') as ApiError;
  apiError.status = status || error.status || 500;
  apiError.type = status && status >= 400 && status < 500 ? 'client' : 'server';
  apiError.code = error.code;
  apiError.details = error.details;
  return apiError;
}

/**
 * Simple fetch-based API client
 */
class FetchApiClient implements ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    method: string,
    url: string,
    data?: any,
    config?: RequestConfig & { cache?: boolean; cacheTtl?: number; retries?: number }
  ): Promise<ApiResponse<T>> {
    const fullUrl = url.startsWith('http') ? url : `${this.baseURL}${url}`;
    const requestId = generateRequestId();
    
    // Rate limiting check
    const clientId = this.getClientIdentifier();
    if (!rateLimit(clientId)) {
      throw createApiError({ message: 'Rate limit exceeded' }, 429);
    }

    // Check cache for GET requests
    const cacheKey = config?.cache && method === 'GET' 
      ? `${fullUrl}_${JSON.stringify(data || {})}_${JSON.stringify(config?.params || {})}`
      : null;
    
    if (cacheKey) {
      const cached = getCachedResponse(cacheKey);
      if (cached) {
        return {
          data: cached as T,
          meta: {
            timestamp: new Date().toISOString(),
            requestId,
            fromCache: true,
          },
        };
      }
    }
    
    // Get auth token if available
    const authHeaders: Record<string, string> = {};
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) {
        authHeaders.Authorization = `Bearer ${token}`;
      }
    }

    // Add CSRF protection for state-changing requests
    const secureHeaders = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)
      ? csrfProtection.addToHeaders({})
      : {};

    const requestConfig: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Request-ID': requestId,
        ...authHeaders,
        ...secureHeaders,
        ...config?.headers,
      },
      signal: config?.signal,
    };

    // Add body for POST, PUT, PATCH requests with CSRF protection
    if (data && ['POST', 'PUT', 'PATCH'].includes(method)) {
      const secureData = csrfProtection.addToBody(data);
      requestConfig.body = JSON.stringify(secureData);
    }

    // Add query parameters for GET requests
    let finalUrl = fullUrl;
    if (config?.params && method === 'GET') {
      const searchParams = new URLSearchParams();
      Object.entries(config.params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        const separator = fullUrl.includes('?') ? '&' : '?';
        finalUrl = `${fullUrl}${separator}${queryString}`;
      }
    }

    try {
      const response = await fetchWithRetry(
        finalUrl, 
        requestConfig, 
        config?.retries || 3
      );
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw createApiError(errorData, response.status);
      }

      const responseData = await response.json();
      
      // Cache successful GET responses
      if (cacheKey && method === 'GET') {
        setCachedResponse(cacheKey, responseData, config?.cacheTtl || 300);
      }
      
      // Wrap response in standard format if not already wrapped
      if (responseData.data !== undefined) {
        return {
          ...responseData,
          meta: {
            ...responseData.meta,
            requestId,
            timestamp: new Date().toISOString(),
          },
        } as ApiResponse<T>;
      }

      return {
        data: responseData as T,
        meta: {
          timestamp: new Date().toISOString(),
          requestId,
        },
      };
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw createApiError({ message: 'Request was cancelled' }, 0);
      }
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw createApiError({ message: 'Network error', type: 'network' }, 0);
      }

      throw error;
    }
  }

  private getClientIdentifier(): string {
    if (typeof window !== 'undefined') {
      return `client_${window.navigator.userAgent.slice(0, 50)}`;
    }
    return 'server_client';
  }

  async get<T>(url: string, config?: RequestConfig & { cache?: boolean; cacheTtl?: number }): Promise<ApiResponse<T>> {
    return this.request<T>('GET', url, undefined, { cache: true, ...config });
  }

  async post<T>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('POST', url, data, config);
  }

  async put<T>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', url, data, config);
  }

  async patch<T>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('PATCH', url, data, config);
  }

  async delete<T>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', url, undefined, config);
  }
  
  /**
   * Add auth token to requests
   */
  setAuthToken(token: string): void {
    // This will be handled by the auth interceptor
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  /**
   * Remove auth token
   */
  removeAuthToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }
}

/**
 * Default API client instance - UNIFIED EXPORT
 */
const apiClient = new FetchApiClient();

/**
 * Hook to get the API client instance
 */
export function useApiClient(): ApiClient {
  return apiClient;
}

/**
 * Export the unified API client
 * This is the SINGLE source of truth for all API calls
 */
export { apiClient };
export { FetchApiClient };
export default apiClient;
