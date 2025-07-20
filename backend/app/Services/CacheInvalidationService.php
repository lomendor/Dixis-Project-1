<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use App\Models\Product;
use App\Models\Producer;
use App\Models\ProductCategory;

class CacheInvalidationService
{
    /**
     * Invalidate product-related caches when a product is created, updated, or deleted.
     */
    public function invalidateProductCaches(Product $product, string $action = 'update'): void
    {
        try {
            $tags = $this->getProductCacheTags($product);
            
            // Invalidate by tags
            Cache::tags($tags)->flush();
            
            // Invalidate specific product cache
            Cache::forget("product:details:{$product->id}");
            
            // Invalidate producer-specific caches
            if ($product->producer) {
                Cache::tags(["producer:{$product->producer->id}"])->flush();
            }
            
            // Invalidate category-specific caches
            foreach ($product->categories as $category) {
                Cache::tags(["category:{$category->id}"])->flush();
            }
            
            // Invalidate search caches
            Cache::tags(['search'])->flush();
            
            Log::info('Product cache invalidated', [
                'product_id' => $product->id,
                'action' => $action,
                'tags' => $tags
            ]);
            
        } catch (\Exception $e) {
            Log::error('Failed to invalidate product cache', [
                'product_id' => $product->id,
                'action' => $action,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Invalidate producer-related caches.
     */
    public function invalidateProducerCaches(Producer $producer, string $action = 'update'): void
    {
        try {
            $tags = [
                'producers',
                "producer:{$producer->id}",
                'products' // Producer changes affect product listings
            ];
            
            Cache::tags($tags)->flush();
            
            // Invalidate specific producer cache
            Cache::forget("producer:details:{$producer->id}");
            Cache::forget("producer:products:{$producer->id}");
            
            Log::info('Producer cache invalidated', [
                'producer_id' => $producer->id,
                'action' => $action,
                'tags' => $tags
            ]);
            
        } catch (\Exception $e) {
            Log::error('Failed to invalidate producer cache', [
                'producer_id' => $producer->id,
                'action' => $action,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Invalidate category-related caches.
     */
    public function invalidateCategoryCaches(ProductCategory $category, string $action = 'update'): void
    {
        try {
            $tags = [
                'categories',
                "category:{$category->id}",
                'products' // Category changes affect product listings
            ];
            
            // If category has parent, invalidate parent cache too
            if ($category->parent_id) {
                $tags[] = "category:{$category->parent_id}";
            }
            
            // If category has children, invalidate children caches
            foreach ($category->children as $child) {
                $tags[] = "category:{$child->id}";
            }
            
            Cache::tags($tags)->flush();
            
            // Invalidate specific category caches
            Cache::forget("category:details:{$category->id}");
            Cache::forget("category:tree");
            Cache::forget("category:products:{$category->id}");
            
            Log::info('Category cache invalidated', [
                'category_id' => $category->id,
                'action' => $action,
                'tags' => $tags
            ]);
            
        } catch (\Exception $e) {
            Log::error('Failed to invalidate category cache', [
                'category_id' => $category->id,
                'action' => $action,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Invalidate order-related caches.
     */
    public function invalidateOrderCaches($orderId, $userId = null): void
    {
        try {
            $tags = ['orders'];
            
            if ($userId) {
                $tags[] = "user:{$userId}:orders";
            }
            
            Cache::tags($tags)->flush();
            
            // Invalidate specific order cache
            Cache::forget("order:details:{$orderId}");
            
            // Invalidate dashboard statistics
            Cache::forget('admin:dashboard:stats');
            Cache::forget('producer:dashboard:stats');
            
            Log::info('Order cache invalidated', [
                'order_id' => $orderId,
                'user_id' => $userId,
                'tags' => $tags
            ]);
            
        } catch (\Exception $e) {
            Log::error('Failed to invalidate order cache', [
                'order_id' => $orderId,
                'user_id' => $userId,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Invalidate cart-related caches.
     */
    public function invalidateCartCaches($cartId, $userId = null): void
    {
        try {
            $tags = ['carts'];
            
            if ($userId) {
                $tags[] = "user:{$userId}:cart";
            }
            
            Cache::tags($tags)->flush();
            
            // Invalidate specific cart cache
            Cache::forget("cart:details:{$cartId}");
            
            if ($userId) {
                Cache::forget("user:{$userId}:cart");
            }
            
            Log::info('Cart cache invalidated', [
                'cart_id' => $cartId,
                'user_id' => $userId,
                'tags' => $tags
            ]);
            
        } catch (\Exception $e) {
            Log::error('Failed to invalidate cart cache', [
                'cart_id' => $cartId,
                'user_id' => $userId,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Invalidate all caches (emergency use only).
     */
    public function invalidateAllCaches(): void
    {
        try {
            Cache::flush();
            
            Log::warning('All caches invalidated', [
                'timestamp' => now()->toISOString(),
                'reason' => 'Manual flush requested'
            ]);
            
        } catch (\Exception $e) {
            Log::error('Failed to invalidate all caches', [
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Warm up critical caches.
     */
    public function warmUpCaches(): void
    {
        try {
            // Warm up featured products
            $this->warmUpFeaturedProducts();
            
            // Warm up category tree
            $this->warmUpCategoryTree();
            
            // Warm up popular products
            $this->warmUpPopularProducts();
            
            Log::info('Cache warm-up completed');
            
        } catch (\Exception $e) {
            Log::error('Failed to warm up caches', [
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Get cache tags for a product.
     */
    private function getProductCacheTags(Product $product): array
    {
        $tags = ['products'];
        
        if ($product->is_featured) {
            $tags[] = 'products:featured';
        }
        
        if ($product->producer) {
            $tags[] = "producer:{$product->producer->id}";
        }
        
        foreach ($product->categories as $category) {
            $tags[] = "category:{$category->id}";
        }
        
        return $tags;
    }

    /**
     * Warm up featured products cache.
     */
    private function warmUpFeaturedProducts(): void
    {
        $cacheKey = 'products:featured:10';
        
        if (!Cache::has($cacheKey)) {
            $products = Product::select([
                'id', 'producer_id', 'name', 'slug', 'short_description',
                'price', 'discount_price', 'main_image', 'created_at'
            ])
            ->where('is_active', true)
            ->where('is_featured', true)
            ->with([
                'producer:id,business_name',
                'categories:id,name,slug'
            ])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

            $responseData = [
                'data' => $products,
                'meta' => [
                    'count' => $products->count(),
                    'limit' => 10
                ]
            ];

            Cache::tags(['products', 'products:featured'])
                 ->put($cacheKey, $responseData, now()->addMinutes(30));
        }
    }

    /**
     * Warm up category tree cache.
     */
    private function warmUpCategoryTree(): void
    {
        $cacheKey = 'category:tree';
        
        if (!Cache::has($cacheKey)) {
            $categories = ProductCategory::select(['id', 'name', 'slug', 'parent_id', 'order'])
                ->orderBy('order')
                ->orderBy('name')
                ->get()
                ->groupBy('parent_id');

            Cache::tags(['categories'])
                 ->put($cacheKey, $categories, now()->addHours(1));
        }
    }

    /**
     * Warm up popular products cache.
     */
    private function warmUpPopularProducts(): void
    {
        $cacheKey = 'products:popular:10';
        
        if (!Cache::has($cacheKey)) {
            // This would require order statistics - simplified for now
            $products = Product::select([
                'id', 'producer_id', 'name', 'slug', 'short_description',
                'price', 'discount_price', 'main_image', 'created_at'
            ])
            ->where('is_active', true)
            ->with([
                'producer:id,business_name',
                'categories:id,name,slug'
            ])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

            $responseData = [
                'data' => $products,
                'meta' => [
                    'count' => $products->count(),
                    'limit' => 10
                ]
            ];

            Cache::tags(['products', 'products:popular'])
                 ->put($cacheKey, $responseData, now()->addMinutes(20));
        }
    }

    /**
     * Get cache statistics.
     */
    public function getCacheStats(): array
    {
        try {
            // This would require Redis-specific commands for detailed stats
            return [
                'status' => 'active',
                'driver' => config('cache.default'),
                'timestamp' => now()->toISOString(),
                'tags_supported' => true
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'error',
                'error' => $e->getMessage(),
                'timestamp' => now()->toISOString()
            ];
        }
    }
}
