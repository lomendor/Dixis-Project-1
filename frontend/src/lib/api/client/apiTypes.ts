/**
 * Common API types and interfaces
 */

export type ID = string | number;

/**
 * Helper function to convert ID to string
 */
export function idToString(id: ID): string {
  return typeof id === 'string' ? id : String(id);
}

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T = any> {
  data: T;
  meta?: {
    timestamp?: string;
    cache?: {
      hit: boolean;
      updated_at: string;
    };
    pagination?: {
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
    };
    offline?: boolean;
    error?: {
      message: string;
      type: string;
    };
  };
}

/**
 * List response interface for paginated data
 */
export interface ListResponse<T = any> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * API error interface
 */
export interface ApiError extends Error {
  status?: number;
  type: 'network' | 'server' | 'client' | 'validation';
  code?: string;
  details?: any;
}

/**
 * HTTP methods
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * API options for requests
 */
export interface ApiOptions {
  timeout?: number;
  offlineMode?: 'fallback' | 'error' | 'silent';
  retries?: number;
  headers?: Record<string, string>;
  defaultData?: any;
}

/**
 * Query options for React Query
 */
export interface ApiQueryOptions {
  staleTime?: number;
  gcTime?: number;
  refetchInterval?: number | false;
  refetchOnWindowFocus?: boolean;
  enabled?: boolean;
  retry?: number | boolean;
}

/**
 * Request configuration
 */
export interface RequestConfig {
  params?: Record<string, any>;
  signal?: AbortSignal;
  timeout?: number;
  headers?: Record<string, string>;
}

/**
 * API client interface
 */
export interface ApiClient {
  get<T = any>(url: string, config?: RequestConfig): Promise<ApiResponse<T>>;
  post<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>>;
  put<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>>;
  patch<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>>;
  delete<T = any>(url: string, config?: RequestConfig): Promise<ApiResponse<T>>;
}

/**
 * Network status
 */
export interface NetworkStatus {
  isOnline: boolean;
  isSlowConnection: boolean;
  connectionType?: string;
}

/**
 * Cache entry
 */
export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  expiresAt?: number;
}

/**
 * Offline support options
 */
export interface OfflineSupportOptions<T = any> {
  data: T | undefined;
  mockData: T;
  status: 'pending' | 'error' | 'success';
}

/**
 * Offline support result
 */
export interface OfflineSupportResult<T = any> {
  isOffline: boolean;
  modifiedData: T;
}
