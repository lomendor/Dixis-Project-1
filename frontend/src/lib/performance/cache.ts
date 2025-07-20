/**
 * Enhanced performance cache implementation with multiple storage layers
 */

import { logger } from '@/lib/logging/productionLogger';

interface CacheItem {
  data: any;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
  priority: number;
}

interface CacheConfig {
  maxSize: number;
  defaultTTL: number;
  compressionThreshold: number;
  enablePersistence: boolean;
  namespace: string;
}

class EnhancedCache {
  private cache = new Map<string, CacheItem>();
  private config: CacheConfig;
  private stats = {
    hits: 0,
    misses: 0,
    evictions: 0,
    operations: 0
  };

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      maxSize: 200,
      defaultTTL: 300000, // 5 minutes
      compressionThreshold: 10000, // 10KB
      enablePersistence: true,
      namespace: 'cache',
      ...config
    };

    // Load persisted cache on initialization
    if (this.config.enablePersistence && typeof window !== 'undefined') {
      this.loadFromPersistence();
    }
  }

  /**
   * Set item in cache with enhanced features
   */
  set(key: string, data: any, options: {
    ttl?: number;
    priority?: number;
    compress?: boolean;
  } = {}): void {
    const {
      ttl = this.config.defaultTTL,
      priority = 1,
      compress = false
    } = options;

    this.stats.operations++;

    // Compression for large data
    let processedData = data;
    if (compress && this.shouldCompress(data)) {
      processedData = this.compressData(data);
    }

    // Evict if cache is full
    if (this.cache.size >= this.config.maxSize) {
      this.evictLeastUsed();
    }

    const now = Date.now();
    this.cache.set(key, {
      data: processedData,
      timestamp: now,
      ttl,
      accessCount: 0,
      lastAccessed: now,
      priority
    });

    // Persist if enabled
    if (this.config.enablePersistence) {
      this.persistItem(key);
    }

    logger.debug('Cache set', { key, ttl, priority, compress });
  }

  /**
   * Get item from cache with analytics
   */
  get(key: string): any {
    this.stats.operations++;
    const item = this.cache.get(key);
    
    if (!item) {
      this.stats.misses++;
      logger.debug('Cache miss', { key });
      return null;
    }

    const now = Date.now();

    // Check if expired
    if (now - item.timestamp > item.ttl) {
      this.cache.delete(key);
      this.stats.misses++;
      logger.debug('Cache expired', { key, age: now - item.timestamp });
      return null;
    }

    // Update access statistics
    item.accessCount++;
    item.lastAccessed = now;
    this.stats.hits++;

    logger.debug('Cache hit', { key, accessCount: item.accessCount });

    // Decompress if needed
    return this.isCompressed(item.data) ? this.decompressData(item.data) : item.data;
  }

  /**
   * Get item with async fallback
   */
  async getOrSet<T>(
    key: string, 
    fallback: () => Promise<T>,
    options: {
      ttl?: number;
      priority?: number;
      compress?: boolean;
    } = {}
  ): Promise<T> {
    const cached = this.get(key);
    if (cached !== null) {
      return cached as T;
    }

    try {
      const data = await fallback();
      this.set(key, data, options);
      return data;
    } catch (error) {
      logger.error('Cache fallback failed', error, { key });
      throw error;
    }
  }

  /**
   * Remove item from cache
   */
  delete(key: string): boolean {
    const result = this.cache.delete(key);
    if (result && this.config.enablePersistence && typeof window !== 'undefined') {
      try {
        localStorage.removeItem(`${this.config.namespace}:${key}`);
      } catch (error) {
        // Ignore localStorage errors
      }
    }
    return result;
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
    this.stats = { hits: 0, misses: 0, evictions: 0, operations: 0 };
    
    if (this.config.enablePersistence && typeof window !== 'undefined') {
      try {
        const keys = Object.keys(localStorage).filter(key => 
          key.startsWith(`${this.config.namespace}:`)
        );
        keys.forEach(key => localStorage.removeItem(key));
      } catch (error) {
        // Ignore localStorage errors
      }
    }
    
    logger.info('Cache cleared', { namespace: this.config.namespace });
  }

  /**
   * Cleanup expired items
   */
  cleanup(): void {
    const now = Date.now();
    let cleanedCount = 0;
    
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
        cleanedCount++;
      }
    }
    
    if (cleanedCount > 0) {
      logger.debug('Cache cleanup', { cleaned: cleanedCount, remaining: this.cache.size });
    }
  }

  /**
   * Evict least used items when cache is full
   */
  private evictLeastUsed(): void {
    const entries = Array.from(this.cache.entries());
    
    // Sort by priority (desc) then by last accessed (asc) then by access count (asc)
    entries.sort(([, a], [, b]) => {
      if (a.priority !== b.priority) return b.priority - a.priority;
      if (a.lastAccessed !== b.lastAccessed) return a.lastAccessed - b.lastAccessed;
      return a.accessCount - b.accessCount;
    });
    
    // Remove least valuable items
    const toRemove = Math.ceil(this.config.maxSize * 0.1); // Remove 10%
    for (let i = 0; i < toRemove && entries.length > 0; i++) {
      const [key] = entries.pop()!;
      this.cache.delete(key);
      this.stats.evictions++;
    }
    
    logger.debug('Cache eviction', { removed: toRemove, remaining: this.cache.size });
  }

  /**
   * Compress data for storage
   */
  private shouldCompress(data: any): boolean {
    const size = JSON.stringify(data).length;
    return size > this.config.compressionThreshold;
  }

  private compressData(data: any): { compressed: true; data: string } {
    try {
      // Simple compression using JSON stringify with space reduction
      return {
        compressed: true,
        data: JSON.stringify(data)
      };
    } catch (error) {
      logger.warn('Compression failed', error);
      return data;
    }
  }

  private decompressData(compressed: { compressed: true; data: string }): any {
    try {
      return JSON.parse(compressed.data);
    } catch (error) {
      logger.warn('Decompression failed', error);
      return compressed;
    }
  }

  private isCompressed(data: any): data is { compressed: true; data: string } {
    return typeof data === 'object' && data?.compressed === true;
  }

  /**
   * Persist item to localStorage
   */
  private persistItem(key: string): void {
    if (typeof window === 'undefined') return;
    
    try {
      const item = this.cache.get(key);
      if (item) {
        localStorage.setItem(
          `${this.config.namespace}:${key}`,
          JSON.stringify({
            data: item.data,
            timestamp: item.timestamp,
            ttl: item.ttl
          })
        );
      }
    } catch (error) {
      // Ignore localStorage errors (quota exceeded, etc.)
      logger.debug('Failed to persist cache item', { key, error: error.message });
    }
  }

  /**
   * Load cache from localStorage
   */
  private loadFromPersistence(): void {
    try {
      const keys = Object.keys(localStorage).filter(key => 
        key.startsWith(`${this.config.namespace}:`)
      );
      
      let loadedCount = 0;
      const now = Date.now();
      
      keys.forEach(storageKey => {
        try {
          const item = JSON.parse(localStorage.getItem(storageKey)!);
          const key = storageKey.replace(`${this.config.namespace}:`, '');
          
          // Check if still valid
          if (now - item.timestamp < item.ttl) {
            this.cache.set(key, {
              data: item.data,
              timestamp: item.timestamp,
              ttl: item.ttl,
              accessCount: 0,
              lastAccessed: now,
              priority: 1
            });
            loadedCount++;
          } else {
            // Remove expired item
            localStorage.removeItem(storageKey);
          }
        } catch (error) {
          // Remove corrupted item
          localStorage.removeItem(storageKey);
        }
      });
      
      if (loadedCount > 0) {
        logger.info('Cache loaded from persistence', { 
          loaded: loadedCount, 
          namespace: this.config.namespace 
        });
      }
    } catch (error) {
      logger.warn('Failed to load cache from persistence', error);
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): typeof this.stats & { 
    size: number; 
    hitRate: number;
    config: CacheConfig;
  } {
    const hitRate = this.stats.operations > 0 
      ? (this.stats.hits / this.stats.operations) * 100 
      : 0;
    
    return {
      ...this.stats,
      size: this.cache.size,
      hitRate: Math.round(hitRate * 100) / 100,
      config: this.config
    };
  }

  /**
   * Warm up cache with predefined data
   */
  warmUp(data: Record<string, any>, ttl?: number): void {
    Object.entries(data).forEach(([key, value]) => {
      this.set(key, value, { ttl, priority: 10 }); // High priority for warm-up data
    });
    
    logger.info('Cache warmed up', { 
      items: Object.keys(data).length,
      namespace: this.config.namespace 
    });
  }
}

// Export enhanced cache instances
export const apiCache = new EnhancedCache({
  namespace: 'api',
  maxSize: 150,
  defaultTTL: 300000, // 5 minutes
  enablePersistence: true
});

export const imageCache = new EnhancedCache({
  namespace: 'images',
  maxSize: 50,
  defaultTTL: 3600000, // 1 hour
  enablePersistence: false // Images handled by browser cache
});

export const userDataCache = new EnhancedCache({
  namespace: 'user',
  maxSize: 20,
  defaultTTL: 1800000, // 30 minutes
  enablePersistence: true
});

export const searchCache = new EnhancedCache({
  namespace: 'search',
  maxSize: 100,
  defaultTTL: 600000, // 10 minutes
  enablePersistence: true
});

// Auto cleanup every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    apiCache.cleanup();
    imageCache.cleanup();
    userDataCache.cleanup();
    searchCache.cleanup();
  }, 300000);
  
  // Log cache stats every 10 minutes in development
  if (process.env.NODE_ENV === 'development') {
    setInterval(() => {
      logger.debug('Cache stats', {
        api: apiCache.getStats(),
        images: imageCache.getStats(),
        user: userDataCache.getStats(),
        search: searchCache.getStats()
      });
    }, 600000);
  }
}
