<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class CacheService
{
    /**
     * Cache TTL configurations (in seconds)
     */
    private const CACHE_TTLS = [
        'products' => 300,        // 5 minutes
        'categories' => 1800,     // 30 minutes
        'producers' => 900,       // 15 minutes
        'filters' => 600,         // 10 minutes
        'featured' => 600,        // 10 minutes
        'user_data' => 300,       // 5 minutes
        'analytics' => 3600,      // 1 hour
        'settings' => 7200,       // 2 hours
    ];

    /**
     * Get cached data or execute callback and cache result
     */
    public function remember(string $key, callable $callback, ?int $ttl = null): mixed
    {
        $cacheKey = $this->generateCacheKey($key);
        $ttl = $ttl ?? $this->getTTL($key);

        try {
            return Cache::remember($cacheKey, $ttl, $callback);
        } catch (\Exception $e) {
            Log::error('Cache remember failed', [
                'key' => $cacheKey,
                'error' => $e->getMessage()
            ]);
            
            // Fallback to direct execution if cache fails
            return $callback();
        }
    }

    /**
     * Get data from cache
     */
    public function get(string $key, mixed $default = null): mixed
    {
        $cacheKey = $this->generateCacheKey($key);
        
        try {
            return Cache::get($cacheKey, $default);
        } catch (\Exception $e) {
            Log::error('Cache get failed', [
                'key' => $cacheKey,
                'error' => $e->getMessage()
            ]);
            
            return $default;
        }
    }

    /**
     * Store data in cache
     */
    public function put(string $key, mixed $value, ?int $ttl = null): bool
    {
        $cacheKey = $this->generateCacheKey($key);
        $ttl = $ttl ?? $this->getTTL($key);

        try {
            return Cache::put($cacheKey, $value, $ttl);
        } catch (\Exception $e) {
            Log::error('Cache put failed', [
                'key' => $cacheKey,
                'error' => $e->getMessage()
            ]);
            
            return false;
        }
    }

    /**
     * Remove data from cache
     */
    public function forget(string $key): bool
    {
        $cacheKey = $this->generateCacheKey($key);
        
        try {
            return Cache::forget($cacheKey);
        } catch (\Exception $e) {
            Log::error('Cache forget failed', [
                'key' => $cacheKey,
                'error' => $e->getMessage()
            ]);
            
            return false;
        }
    }

    /**
     * Clear cache by pattern
     */
    public function forgetByPattern(string $pattern): int
    {
        try {
            $keys = $this->getKeysByPattern($pattern);
            $cleared = 0;
            
            foreach ($keys as $key) {
                if (Cache::forget($key)) {
                    $cleared++;
                }
            }
            
            return $cleared;
        } catch (\Exception $e) {
            Log::error('Cache pattern forget failed', [
                'pattern' => $pattern,
                'error' => $e->getMessage()
            ]);
            
            return 0;
        }
    }

    /**
     * Cache products with optimized queries
     */
    public function cacheProducts(array $filters = []): array
    {
        $cacheKey = 'products:' . md5(serialize($filters));
        
        return $this->remember($cacheKey, function () use ($filters) {
            $query = \App\Models\Product::with(['producer', 'category'])
                ->where('is_active', true);
            
            // Apply filters
            if (!empty($filters['category_id'])) {
                $query->where('category_id', $filters['category_id']);
            }
            
            if (!empty($filters['producer_id'])) {
                $query->where('producer_id', $filters['producer_id']);
            }
            
            if (!empty($filters['search'])) {
                $query->where(function ($q) use ($filters) {
                    $q->where('name', 'like', '%' . $filters['search'] . '%')
                      ->orWhere('description', 'like', '%' . $filters['search'] . '%');
                });
            }
            
            return $query->orderBy('created_at', 'desc')
                        ->paginate($filters['per_page'] ?? 20)
                        ->toArray();
        }, self::CACHE_TTLS['products']);
    }

    /**
     * Cache featured products
     */
    public function cacheFeaturedProducts(int $limit = 8): array
    {
        return $this->remember('featured_products:' . $limit, function () use ($limit) {
            return \App\Models\Product::with(['producer', 'category'])
                ->where('is_active', true)
                ->where('is_featured', true)
                ->orderBy('featured_order', 'asc')
                ->limit($limit)
                ->get()
                ->toArray();
        }, self::CACHE_TTLS['featured']);
    }

    /**
     * Cache categories
     */
    public function cacheCategories(): array
    {
        return $this->remember('categories:all', function () {
            return \App\Models\Category::where('is_active', true)
                ->orderBy('name')
                ->get()
                ->toArray();
        }, self::CACHE_TTLS['categories']);
    }

    /**
     * Cache producers
     */
    public function cacheProducers(bool $featuredOnly = false): array
    {
        $cacheKey = $featuredOnly ? 'producers:featured' : 'producers:all';
        
        return $this->remember($cacheKey, function () use ($featuredOnly) {
            $query = \App\Models\Producer::where('is_active', true);
            
            if ($featuredOnly) {
                $query->where('is_featured', true);
            }
            
            return $query->orderBy('business_name')
                        ->get()
                        ->toArray();
        }, self::CACHE_TTLS['producers']);
    }

    /**
     * Cache filters data
     */
    public function cacheFilters(): array
    {
        return $this->remember('filters:all', function () {
            return [
                'categories' => $this->cacheCategories(),
                'producers' => $this->cacheProducers(),
                'price_ranges' => $this->getPriceRanges(),
                'locations' => $this->getProducerLocations()
            ];
        }, self::CACHE_TTLS['filters']);
    }

    /**
     * Invalidate related caches when data changes
     */
    public function invalidateProductCaches(): void
    {
        $this->forgetByPattern('products:*');
        $this->forgetByPattern('featured_products:*');
        $this->forget('filters:all');
    }

    /**
     * Invalidate category caches
     */
    public function invalidateCategoryCaches(): void
    {
        $this->forgetByPattern('categories:*');
        $this->forget('filters:all');
    }

    /**
     * Invalidate producer caches
     */
    public function invalidateProducerCaches(): void
    {
        $this->forgetByPattern('producers:*');
        $this->forget('filters:all');
    }

    /**
     * Generate cache key with prefix
     */
    private function generateCacheKey(string $key): string
    {
        $prefix = config('cache.prefix', 'dixis');
        return $prefix . ':' . $key;
    }

    /**
     * Get TTL for cache key
     */
    private function getTTL(string $key): int
    {
        foreach (self::CACHE_TTLS as $pattern => $ttl) {
            if (str_contains($key, $pattern)) {
                return $ttl;
            }
        }
        
        return 300; // Default 5 minutes
    }

    /**
     * Get cache keys by pattern (Redis specific)
     */
    private function getKeysByPattern(string $pattern): array
    {
        // This is a simplified implementation
        // In production, you might want to use Redis SCAN command
        return [];
    }

    /**
     * Get price ranges for filters
     */
    private function getPriceRanges(): array
    {
        return [
            ['min' => 0, 'max' => 10, 'label' => 'Κάτω από 10€'],
            ['min' => 10, 'max' => 25, 'label' => '10€ - 25€'],
            ['min' => 25, 'max' => 50, 'label' => '25€ - 50€'],
            ['min' => 50, 'max' => 100, 'label' => '50€ - 100€'],
            ['min' => 100, 'max' => null, 'label' => 'Πάνω από 100€']
        ];
    }

    /**
     * Get producer locations for filters
     */
    private function getProducerLocations(): array
    {
        return \App\Models\Producer::where('is_active', true)
            ->whereNotNull('location')
            ->distinct()
            ->pluck('location')
            ->toArray();
    }
}
