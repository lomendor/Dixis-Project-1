<?php

namespace App\Services\Database;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Log;

class CachingService
{
    // Cache TTL constants (in seconds)
    const CACHE_TTL_SHORT = 300;      // 5 minutes
    const CACHE_TTL_MEDIUM = 1800;    // 30 minutes  
    const CACHE_TTL_LONG = 3600;      // 1 hour
    const CACHE_TTL_VERY_LONG = 86400; // 24 hours

    // Cache key prefixes
    const PREFIX_PRODUCTS = 'products:';
    const PREFIX_CATEGORIES = 'categories:';
    const PREFIX_PRODUCERS = 'producers:';
    const PREFIX_ORDERS = 'orders:';
    const PREFIX_USERS = 'users:';
    const PREFIX_B2B = 'b2b:';
    const PREFIX_INVOICES = 'invoices:';

    /**
     * Cache product data with appropriate TTL
     */
    public function cacheProduct(int $productId, array $data, int $ttl = self::CACHE_TTL_MEDIUM): void
    {
        $key = self::PREFIX_PRODUCTS . $productId;
        Cache::put($key, $data, $ttl);
        
        // Also cache by slug if available
        if (isset($data['slug'])) {
            Cache::put(self::PREFIX_PRODUCTS . 'slug:' . $data['slug'], $data, $ttl);
        }
    }

    /**
     * Get cached product data
     */
    public function getCachedProduct(int $productId): ?array
    {
        $key = self::PREFIX_PRODUCTS . $productId;
        return Cache::get($key);
    }

    /**
     * Get cached product by slug
     */
    public function getCachedProductBySlug(string $slug): ?array
    {
        $key = self::PREFIX_PRODUCTS . 'slug:' . $slug;
        return Cache::get($key);
    }

    /**
     * Cache featured products list
     */
    public function cacheFeaturedProducts(array $products): void
    {
        Cache::put(self::PREFIX_PRODUCTS . 'featured', $products, self::CACHE_TTL_MEDIUM);
    }

    /**
     * Get cached featured products
     */
    public function getCachedFeaturedProducts(): ?array
    {
        return Cache::get(self::PREFIX_PRODUCTS . 'featured');
    }

    /**
     * Cache category tree
     */
    public function cacheCategoryTree(array $categories): void
    {
        Cache::put(self::PREFIX_CATEGORIES . 'tree', $categories, self::CACHE_TTL_LONG);
    }

    /**
     * Get cached category tree
     */
    public function getCachedCategoryTree(): ?array
    {
        return Cache::get(self::PREFIX_CATEGORIES . 'tree');
    }

    /**
     * Cache producer data
     */
    public function cacheProducer(int $producerId, array $data): void
    {
        $key = self::PREFIX_PRODUCERS . $producerId;
        Cache::put($key, $data, self::CACHE_TTL_LONG);
    }

    /**
     * Get cached producer data
     */
    public function getCachedProducer(int $producerId): ?array
    {
        $key = self::PREFIX_PRODUCERS . $producerId;
        return Cache::get($key);
    }

    /**
     * Cache user order history
     */
    public function cacheUserOrders(int $userId, array $orders): void
    {
        $key = self::PREFIX_ORDERS . 'user:' . $userId;
        Cache::put($key, $orders, self::CACHE_TTL_SHORT);
    }

    /**
     * Get cached user orders
     */
    public function getCachedUserOrders(int $userId): ?array
    {
        $key = self::PREFIX_ORDERS . 'user:' . $userId;
        return Cache::get($key);
    }

    /**
     * Cache B2B user data
     */
    public function cacheB2BUser(int $userId, array $data): void
    {
        $key = self::PREFIX_B2B . 'user:' . $userId;
        Cache::put($key, $data, self::CACHE_TTL_MEDIUM);
    }

    /**
     * Get cached B2B user data
     */
    public function getCachedB2BUser(int $userId): ?array
    {
        $key = self::PREFIX_B2B . 'user:' . $userId;
        return Cache::get($key);
    }

    /**
     * Cache B2B pricing for user
     */
    public function cacheB2BPricing(int $userId, int $productId, float $price): void
    {
        $key = self::PREFIX_B2B . 'pricing:' . $userId . ':' . $productId;
        Cache::put($key, $price, self::CACHE_TTL_MEDIUM);
    }

    /**
     * Get cached B2B pricing
     */
    public function getCachedB2BPricing(int $userId, int $productId): ?float
    {
        $key = self::PREFIX_B2B . 'pricing:' . $userId . ':' . $productId;
        return Cache::get($key);
    }

    /**
     * Cache invoice data
     */
    public function cacheInvoice(int $invoiceId, array $data): void
    {
        $key = self::PREFIX_INVOICES . $invoiceId;
        Cache::put($key, $data, self::CACHE_TTL_MEDIUM);
    }

    /**
     * Get cached invoice data
     */
    public function getCachedInvoice(int $invoiceId): ?array
    {
        $key = self::PREFIX_INVOICES . $invoiceId;
        return Cache::get($key);
    }

    /**
     * Cache user invoice list
     */
    public function cacheUserInvoices(int $userId, array $invoices): void
    {
        $key = self::PREFIX_INVOICES . 'user:' . $userId;
        Cache::put($key, $invoices, self::CACHE_TTL_SHORT);
    }

    /**
     * Get cached user invoices
     */
    public function getCachedUserInvoices(int $userId): ?array
    {
        $key = self::PREFIX_INVOICES . 'user:' . $userId;
        return Cache::get($key);
    }

    /**
     * Invalidate product-related caches
     */
    public function invalidateProductCaches(int $productId, ?string $slug = null): void
    {
        $keys = [
            self::PREFIX_PRODUCTS . $productId,
            self::PREFIX_PRODUCTS . 'featured'
        ];

        if ($slug) {
            $keys[] = self::PREFIX_PRODUCTS . 'slug:' . $slug;
        }

        Cache::forget($keys);
    }

    /**
     * Invalidate category caches
     */
    public function invalidateCategoryCaches(): void
    {
        Cache::forget(self::PREFIX_CATEGORIES . 'tree');
    }

    /**
     * Invalidate user-specific caches
     */
    public function invalidateUserCaches(int $userId): void
    {
        $keys = [
            self::PREFIX_ORDERS . 'user:' . $userId,
            self::PREFIX_B2B . 'user:' . $userId,
            self::PREFIX_INVOICES . 'user:' . $userId
        ];

        Cache::forget($keys);
    }

    /**
     * Invalidate B2B pricing caches for user
     */
    public function invalidateB2BPricingCaches(int $userId): void
    {
        // Get all cached keys for this user's pricing
        $pattern = self::PREFIX_B2B . 'pricing:' . $userId . ':*';
        
        if (Cache::getStore() instanceof \Illuminate\Cache\RedisStore) {
            $keys = Redis::keys($pattern);
            if (!empty($keys)) {
                Cache::forget($keys);
            }
        }
    }

    /**
     * Warm up essential caches
     */
    public function warmUpCaches(): array
    {
        $results = [];

        try {
            // Warm up featured products
            $featuredProducts = \App\Models\Product::where('is_featured', true)
                ->where('is_active', true)
                ->with(['producer', 'category', 'images'])
                ->limit(10)
                ->get()
                ->toArray();
            
            $this->cacheFeaturedProducts($featuredProducts);
            $results['featured_products'] = 'cached';

            // Warm up category tree
            $categories = \App\Models\Category::with('children')
                ->whereNull('parent_id')
                ->orderBy('name')
                ->get()
                ->toArray();
            
            $this->cacheCategoryTree($categories);
            $results['category_tree'] = 'cached';

            // Warm up active producers
            $producers = \App\Models\Producer::where('verified', true)
                ->with('user')
                ->limit(20)
                ->get();

            foreach ($producers as $producer) {
                $this->cacheProducer($producer->id, $producer->toArray());
            }
            $results['producers'] = count($producers) . ' cached';

        } catch (\Exception $e) {
            Log::error('Cache warm-up failed: ' . $e->getMessage());
            $results['error'] = $e->getMessage();
        }

        return $results;
    }

    /**
     * Clear all application caches
     */
    public function clearAllCaches(): array
    {
        $results = [];

        try {
            // Clear Laravel cache
            Cache::flush();
            $results['laravel_cache'] = 'cleared';

            // Clear Redis cache if available
            if (Cache::getStore() instanceof \Illuminate\Cache\RedisStore) {
                Redis::flushdb();
                $results['redis_cache'] = 'cleared';
            }

            // Clear config cache
            \Artisan::call('config:clear');
            $results['config_cache'] = 'cleared';

            // Clear route cache
            \Artisan::call('route:clear');
            $results['route_cache'] = 'cleared';

            // Clear view cache
            \Artisan::call('view:clear');
            $results['view_cache'] = 'cleared';

        } catch (\Exception $e) {
            Log::error('Cache clearing failed: ' . $e->getMessage());
            $results['error'] = $e->getMessage();
        }

        return $results;
    }

    /**
     * Get cache statistics
     */
    public function getCacheStats(): array
    {
        $stats = [];

        try {
            if (Cache::getStore() instanceof \Illuminate\Cache\RedisStore) {
                $info = Redis::info();
                
                $stats = [
                    'redis_version' => $info['redis_version'] ?? 'unknown',
                    'used_memory' => $info['used_memory_human'] ?? 'unknown',
                    'connected_clients' => $info['connected_clients'] ?? 0,
                    'total_commands_processed' => $info['total_commands_processed'] ?? 0,
                    'keyspace_hits' => $info['keyspace_hits'] ?? 0,
                    'keyspace_misses' => $info['keyspace_misses'] ?? 0,
                    'hit_rate' => $this->calculateHitRate(
                        $info['keyspace_hits'] ?? 0,
                        $info['keyspace_misses'] ?? 0
                    )
                ];
            }

            // Add Laravel cache info
            $stats['cache_driver'] = config('cache.default');
            $stats['cache_prefix'] = config('cache.prefix');

        } catch (\Exception $e) {
            Log::warning('Could not retrieve cache stats: ' . $e->getMessage());
            $stats['error'] = $e->getMessage();
        }

        return $stats;
    }

    /**
     * Calculate cache hit rate
     */
    private function calculateHitRate(int $hits, int $misses): float
    {
        $total = $hits + $misses;
        if ($total === 0) {
            return 0;
        }

        return round(($hits / $total) * 100, 2);
    }

    /**
     * Cache with tags for easier invalidation
     */
    public function cacheWithTags(array $tags, string $key, $value, int $ttl = self::CACHE_TTL_MEDIUM): void
    {
        if (method_exists(Cache::getStore(), 'tags')) {
            Cache::tags($tags)->put($key, $value, $ttl);
        } else {
            Cache::put($key, $value, $ttl);
        }
    }

    /**
     * Invalidate cache by tags
     */
    public function invalidateByTags(array $tags): void
    {
        if (method_exists(Cache::getStore(), 'tags')) {
            Cache::tags($tags)->flush();
        }
    }
}