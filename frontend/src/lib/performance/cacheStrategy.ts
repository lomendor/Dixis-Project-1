/**
 * Comprehensive caching strategies for performance optimization
 */

import { logger } from '@/lib/logging/productionLogger';
import { toError, errorToContext } from '@/lib/utils/errorUtils';
import { UNIFIED_ENDPOINTS } from '@/lib/api/config/unified';

interface CacheConfig {
  ttl: number; // Time to live in seconds
  staleWhileRevalidate?: number; // Serve stale content while revalidating
  tags?: string[]; // Cache tags for invalidation
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  tags?: string[];
}

/**
 * Memory cache for client-side caching
 */
class MemoryCache {
  private cache = new Map<string, CacheEntry<any>>();
  private maxSize = 100; // Maximum cache entries
  
  set<T>(key: string, data: T, config: CacheConfig): void {
    // Implement LRU eviction if cache is full
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: config.ttl * 1000, // Convert to milliseconds
      tags: config.tags
    });
  }
  
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    const now = Date.now();
    const age = now - entry.timestamp;
    
    // Check if cache is expired
    if (age > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }
  
  invalidate(key: string): void {
    this.cache.delete(key);
  }
  
  invalidateByTags(tags: string[]): void {
    for (const [key, entry] of this.cache.entries()) {
      if (entry?.tags?.some(tag => tags.includes(tag))) {
        this.cache.delete(key);
      }
    }
  }
  
  clear(): void {
    this.cache.clear();
  }
}

// Singleton instance
const memoryCache = new MemoryCache();

/**
 * API response caching with stale-while-revalidate
 */
export async function cachedFetch<T>(
  url: string,
  options: RequestInit = {},
  cacheConfig: CacheConfig = { ttl: 300 } // 5 minutes default
): Promise<T> {
  const cacheKey = `api:${url}:${JSON.stringify(options)}`;
  
  // Check memory cache first
  const cached = memoryCache.get<T>(cacheKey);
  if (cached) {
    logger.info('Cache hit', { url, cacheKey });
    return cached;
  }
  
  try {
    // Fetch from API
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Cache-Control': `max-age=${cacheConfig.ttl}, stale-while-revalidate=${cacheConfig.staleWhileRevalidate || 60}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Store in cache
    memoryCache.set(cacheKey, data, cacheConfig);
    
    logger.info('Cache miss - stored', { url, cacheKey });
    return data;
  } catch (error) {
    logger.error('Cached fetch error', toError(error), errorToContext(error));
    throw toError(error);
  }
}

/**
 * Cache strategies for different data types
 */
export const cacheStrategies = {
  // Products - cache for 5 minutes with 1 minute stale
  products: {
    ttl: 300,
    staleWhileRevalidate: 60,
    tags: ['products']
  },
  
  // Product detail - cache for 10 minutes
  productDetail: {
    ttl: 600,
    staleWhileRevalidate: 120,
    tags: ['products', 'product-detail']
  },
  
  // Producers - cache for 15 minutes
  producers: {
    ttl: 900,
    staleWhileRevalidate: 180,
    tags: ['producers']
  },
  
  // Categories - cache for 1 hour
  categories: {
    ttl: 3600,
    staleWhileRevalidate: 300,
    tags: ['categories']
  },
  
  // User data - cache for 1 minute
  userData: {
    ttl: 60,
    staleWhileRevalidate: 10,
    tags: ['user']
  },
  
  // Static content - cache for 1 day
  staticContent: {
    ttl: 86400,
    staleWhileRevalidate: 3600,
    tags: ['static']
  }
};

/**
 * React Query cache configuration
 */
export const reactQueryCacheConfig = {
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: 2,
      retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: true
    },
    mutations: {
      retry: 1,
      retryDelay: 1000
    }
  }
};

/**
 * Service Worker cache strategies
 */
export const swCacheStrategies = {
  // Network first for API calls
  api: {
    strategy: 'NetworkFirst',
    options: {
      cacheName: 'api-cache',
      networkTimeoutSeconds: 5,
      expiration: {
        maxEntries: 50,
        maxAgeSeconds: 300 // 5 minutes
      }
    }
  },
  
  // Cache first for static assets
  static: {
    strategy: 'CacheFirst',
    options: {
      cacheName: 'static-cache',
      expiration: {
        maxEntries: 100,
        maxAgeSeconds: 86400 * 30 // 30 days
      }
    }
  },
  
  // Stale while revalidate for images
  images: {
    strategy: 'StaleWhileRevalidate',
    options: {
      cacheName: 'image-cache',
      expiration: {
        maxEntries: 200,
        maxAgeSeconds: 86400 * 7 // 7 days
      }
    }
  }
};

/**
 * Cache invalidation helpers
 */
export const cacheInvalidation = {
  // Invalidate product caches
  invalidateProducts: () => {
    memoryCache.invalidateByTags(['products']);
  },
  
  // Invalidate specific product
  invalidateProduct: (productId: string | number) => {
    memoryCache.invalidateByTags(['products', `product-${productId}`]);
  },
  
  // Invalidate producer caches
  invalidateProducers: () => {
    memoryCache.invalidateByTags(['producers']);
  },
  
  // Invalidate user data
  invalidateUserData: () => {
    memoryCache.invalidateByTags(['user']);
  },
  
  // Clear all caches
  clearAll: () => {
    memoryCache.clear();
  }
};

/**
 * Preload and cache critical data
 */
export async function preloadCriticalData(): Promise<void> {
  try {
    // Preload categories
    await cachedFetch('/api/categories', {}, cacheStrategies.categories);
    
    // Preload featured products (unified configuration)
    await cachedFetch(UNIFIED_ENDPOINTS.PRODUCTS.FEATURED(), {}, cacheStrategies.products);
    
    // Preload featured producers (unified configuration)
    await cachedFetch(UNIFIED_ENDPOINTS.PRODUCERS.FEATURED(), {}, cacheStrategies.producers);
    
    logger.info('Critical data preloaded successfully');
  } catch (error) {
    logger.error('Failed to preload critical data', toError(error), errorToContext(error));
  }
}

/**
 * Browser cache control headers
 */
export const cacheHeaders = {
  // Public, immutable assets (fonts, images)
  immutable: {
    'Cache-Control': 'public, max-age=31536000, immutable'
  },
  
  // Static assets with revalidation
  static: {
    'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800'
  },
  
  // Dynamic content
  dynamic: {
    'Cache-Control': 'private, max-age=0, must-revalidate'
  },
  
  // API responses
  api: {
    'Cache-Control': 's-maxage=60, stale-while-revalidate=300'
  }
};