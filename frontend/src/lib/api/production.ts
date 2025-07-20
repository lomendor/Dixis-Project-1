// Production API Utilities
import { productionConfig, PRODUCTION_CONSTANTS } from '@/lib/config/production';
import { handleApiError } from '@/lib/monitoring/errorHandler';

// Rate limiting store (in-memory for demo, use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Request timeout utility
export function withTimeout<T>(promise: Promise<T>, timeoutMs: number = PRODUCTION_CONSTANTS.TIMEOUTS.API_REQUEST): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), timeoutMs);
    }),
  ]);
}

// Rate limiting middleware
export function rateLimit(identifier: string, maxRequests: number = 100, windowMs: number = 900000): boolean {
  if (!productionConfig.rateLimit.enabled) {
    return true; // Rate limiting disabled
  }

  const now = Date.now();
  const key = identifier;
  const current = rateLimitStore.get(key);

  if (!current || now > current.resetTime) {
    // Reset or initialize
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs,
    });
    return true;
  }

  if (current.count >= maxRequests) {
    return false; // Rate limit exceeded
  }

  current.count++;
  return true;
}

// API Response wrapper
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    timestamp: string;
    requestId: string;
    version: string;
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

// Create standardized API response
export function createApiResponse<T>(
  data?: T,
  error?: { code: string; message: string; details?: any },
  meta?: Partial<ApiResponse['meta']>
): ApiResponse<T> {
  return {
    success: !error,
    data: error ? undefined : data,
    error,
    meta: {
      timestamp: new Date().toISOString(),
      requestId: generateRequestId(),
      version: process.env.npm_package_version || '1.0.0',
      ...meta,
    },
  };
}

// Generate unique request ID
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Enhanced fetch with production features
export async function productionFetch(
  url: string,
  options: RequestInit & {
    timeout?: number;
    retries?: number;
    retryDelay?: number;
    cache?: boolean;
    cacheKey?: string;
    cacheTtl?: number;
  } = {}
): Promise<Response> {
  const {
    timeout = PRODUCTION_CONSTANTS.TIMEOUTS.API_REQUEST,
    retries = 3,
    retryDelay = 1000,
    cache = false,
    cacheKey,
    cacheTtl = productionConfig.cache.apiTtl,
    ...fetchOptions
  } = options;

  // Check cache first
  if (cache && cacheKey && typeof window !== 'undefined') {
    const cached = getCachedResponse(cacheKey);
    if (cached) {
      return new Response(JSON.stringify(cached), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  let lastError: Error;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'X-Request-ID': generateRequestId(),
          'X-Client-Version': process.env.npm_package_version || '1.0.0',
          ...fetchOptions.headers,
        },
      });

      clearTimeout(timeoutId);

      // Cache successful responses
      if (cache && cacheKey && response.ok && typeof window !== 'undefined') {
        const responseData = await response.clone().json();
        setCachedResponse(cacheKey, responseData, cacheTtl);
      }

      return response;
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on certain errors
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout');
        }
        if (error.message.includes('NetworkError')) {
          throw error; // Don't retry network errors
        }
      }

      // Wait before retry
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
      }
    }
  }

  throw lastError!;
}

// Cache utilities (simple in-memory cache for demo)
const responseCache = new Map<string, { data: any; expiry: number }>();

function getCachedResponse(key: string): any | null {
  const cached = responseCache.get(key);
  if (!cached || Date.now() > cached.expiry) {
    responseCache.delete(key);
    return null;
  }
  return cached.data;
}

function setCachedResponse(key: string, data: any, ttlSeconds: number): void {
  responseCache.set(key, {
    data,
    expiry: Date.now() + (ttlSeconds * 1000),
  });
}

// API Client class
export class ProductionApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseUrl: string = productionConfig.apiUrl) {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'X-Client-Version': process.env.npm_package_version || '1.0.0',
    };
  }

  async request<T>(
    endpoint: string,
    options: RequestInit & {
      timeout?: number;
      retries?: number;
      cache?: boolean;
      cacheTtl?: number;
    } = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const requestId = generateRequestId();

    try {
      // Rate limiting check
      const clientId = this.getClientIdentifier();
      if (!rateLimit(clientId)) {
        throw new Error('Rate limit exceeded');
      }

      const response = await productionFetch(url, {
        ...options,
        headers: {
          ...this.defaultHeaders,
          'X-Request-ID': requestId,
          ...options.headers,
        },
        cacheKey: options.cache ? `${endpoint}_${JSON.stringify(options.body || {})}` : undefined,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API Error: ${response.status} - ${errorData.message || response.statusText}`);
      }

      const data = await response.json();
      return createApiResponse<T>(data, undefined, { requestId });
    } catch (error) {
      const apiError = handleApiError(error, {
        url,
        method: options.method || 'GET',
        requestId,
      });

      return createApiResponse<T>(undefined, {
        code: PRODUCTION_CONSTANTS.ERROR_CODES.INTERNAL_ERROR,
        message: error instanceof Error ? error.message : 'Unknown error',
        details: { requestId },
      });
    }
  }

  async get<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET', cache: true });
  }

  async post<T>(endpoint: string, data?: any, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  private getClientIdentifier(): string {
    // In production, use IP address or user ID
    if (typeof window !== 'undefined') {
      return `client_${window.navigator.userAgent.slice(0, 50)}`;
    }
    return 'server_client';
  }

  setAuthToken(token: string): void {
    this.defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  removeAuthToken(): void {
    delete this.defaultHeaders['Authorization'];
  }
}

// Default API client instance
export const apiClient = new ProductionApiClient();

// Health check endpoint
export async function healthCheck(): Promise<ApiResponse> {
  try {
    const response = await productionFetch('/api/health', {
      timeout: 5000,
      retries: 1,
    });

    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status}`);
    }

    const data = await response.json();
    return createApiResponse(data);
  } catch (error) {
    return createApiResponse(undefined, {
      code: PRODUCTION_CONSTANTS.ERROR_CODES.INTERNAL_ERROR,
      message: error instanceof Error ? error.message : 'Health check failed',
    });
  }
}

// Metrics collection
export function collectMetrics() {
  if (typeof window === 'undefined') return;

  const metrics = {
    timestamp: Date.now(),
    url: window.location.href,
    userAgent: navigator.userAgent,
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
    },
    performance: {
      navigation: performance.getEntriesByType('navigation')[0],
      memory: (performance as any).memory,
    },
    connection: (navigator as any).connection,
  };

  // Send metrics to monitoring endpoint
  if (productionConfig.isProduction) {
    fetch('/api/monitoring/metrics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(metrics),
    }).catch(() => {
      // Silently fail metrics collection
    });
  }
}

// Initialize metrics collection
if (typeof window !== 'undefined') {
  // Collect initial metrics
  window.addEventListener('load', collectMetrics);
  
  // Collect metrics on page visibility change
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      collectMetrics();
    }
  });
}

export default apiClient;
