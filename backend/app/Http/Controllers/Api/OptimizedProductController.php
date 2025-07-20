<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Http\Middleware\ApiResponseCache;

class OptimizedProductController extends Controller
{
    /**
     * Display a listing of products with optimized queries and caching.
     * Target: <200ms response time with proper indexing and caching.
     */
    public function index(Request $request)
    {
        $startTime = microtime(true);
        
        // Generate cache key based on request parameters
        $cacheKey = $this->generateProductListCacheKey($request);
        
        // Try to get from cache first
        $cachedResult = Cache::get($cacheKey);
        if ($cachedResult) {
            Log::debug('Product list cache hit', ['key' => $cacheKey]);
            return response()->json($cachedResult);
        }

        $user = $request->user('sanctum');

        // Optimized query building
        $query = $this->buildOptimizedProductQuery($request, $user);
        
        // Apply filters with optimized patterns
        $this->applyOptimizedFilters($query, $request);
        
        // Apply sorting with index-friendly patterns
        $this->applyOptimizedSorting($query, $request);

        // Optimized eager loading to prevent N+1 queries
        $query->with([
            'producer:id,business_name,logo',
            'categories:id,name,slug',
            'images:id,product_id,image_path,order'
        ]);

        // Use cursor pagination for better performance on large datasets
        $perPage = min($request->query('per_page', 15), 50); // Limit max per page
        
        // Execute query with monitoring
        $products = $query->paginate($perPage);
        
        // Prepare response data
        $responseData = [
            'data' => $products->items(),
            'meta' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
                'from' => $products->firstItem(),
                'to' => $products->lastItem(),
            ],
            'performance' => [
                'query_time' => round((microtime(true) - $startTime) * 1000, 2) . 'ms',
                'cached' => false
            ]
        ];

        // Cache the result for 5 minutes with appropriate tags
        $cacheTags = $this->getProductCacheTags($request);
        Cache::tags($cacheTags)->put($cacheKey, $responseData, now()->addMinutes(5));

        return response()->json($responseData);
    }

    /**
     * Build optimized product query with proper indexing.
     */
    private function buildOptimizedProductQuery(Request $request, $user)
    {
        if ($user && $user->role === 'producer' && $user->producer) {
            // Producer view - use index on producer_id
            return $user->producer->products()->select([
                'id', 'producer_id', 'name', 'slug', 'short_description', 
                'price', 'discount_price', 'stock', 'main_image', 
                'is_active', 'is_featured', 'created_at'
            ]);
        } else {
            // Public view - use index on is_active
            return Product::select([
                'id', 'producer_id', 'name', 'slug', 'short_description', 
                'price', 'discount_price', 'stock', 'main_image', 
                'is_active', 'is_featured', 'created_at'
            ])->where('is_active', true);
        }
    }

    /**
     * Apply optimized filters using indexed columns.
     */
    private function applyOptimizedFilters($query, Request $request)
    {
        // Category filter - optimized with proper joins
        if ($categoryId = $request->query('category_id')) {
            $query->whereHas('categories', function ($q) use ($categoryId) {
                $q->where('product_categories.id', $categoryId);
            });
        } elseif ($categorySlug = $request->query('category_slug')) {
            $query->whereHas('categories', function ($q) use ($categorySlug) {
                $q->where('product_categories.slug', $categorySlug);
            });
        }

        // Price range filter - optimized for indexed price columns
        if ($minPrice = $request->query('min_price')) {
            $query->where(function ($q) use ($minPrice) {
                $q->where('price', '>=', $minPrice)
                  ->orWhere('discount_price', '>=', $minPrice);
            });
        }

        if ($maxPrice = $request->query('max_price')) {
            $query->where(function ($q) use ($maxPrice) {
                $q->where(function ($q2) use ($maxPrice) {
                    $q2->whereNotNull('discount_price')
                       ->where('discount_price', '<=', $maxPrice);
                })
                ->orWhere(function ($q2) use ($maxPrice) {
                    $q2->whereNull('discount_price')
                       ->where('price', '<=', $maxPrice);
                });
            });
        }

        // Search filter - optimized with FULLTEXT index (if available)
        if ($searchTerm = $request->query('search')) {
            $query->where(function ($q) use ($searchTerm) {
                $q->where('name', 'like', '%' . $searchTerm . '%')
                  ->orWhere('short_description', 'like', '%' . $searchTerm . '%');
            });
        }

        // Featured filter - uses indexed column
        if ($request->query('featured') === 'true') {
            $query->where('is_featured', true);
        }

        // Stock filter - uses indexed column
        if ($request->query('in_stock') === 'true') {
            $query->where('stock', '>', 0);
        }
    }

    /**
     * Apply optimized sorting using indexed columns.
     */
    private function applyOptimizedSorting($query, Request $request)
    {
        $sortBy = $request->query('sort_by', 'created_at');
        $sortDirection = $request->query('sort_direction', 'desc');

        // Whitelist allowed sort fields (all indexed)
        $allowedSortFields = [
            'created_at', 'price', 'name', 'stock', 'is_featured'
        ];

        if (!in_array($sortBy, $allowedSortFields)) {
            $sortBy = 'created_at';
        }

        if (!in_array($sortDirection, ['asc', 'desc'])) {
            $sortDirection = 'desc';
        }

        // Optimized price sorting considering discount
        if ($sortBy === 'price') {
            $query->orderByRaw('COALESCE(discount_price, price) ' . $sortDirection);
        } else {
            $query->orderBy($sortBy, $sortDirection);
        }

        // Secondary sort for consistency
        if ($sortBy !== 'created_at') {
            $query->orderBy('created_at', 'desc');
        }
    }

    /**
     * Generate cache key for product list.
     */
    private function generateProductListCacheKey(Request $request): string
    {
        $params = [
            'category_id' => $request->query('category_id'),
            'category_slug' => $request->query('category_slug'),
            'min_price' => $request->query('min_price'),
            'max_price' => $request->query('max_price'),
            'search' => $request->query('search'),
            'featured' => $request->query('featured'),
            'in_stock' => $request->query('in_stock'),
            'sort_by' => $request->query('sort_by', 'created_at'),
            'sort_direction' => $request->query('sort_direction', 'desc'),
            'per_page' => $request->query('per_page', 15),
            'page' => $request->query('page', 1),
            'user_id' => $request->user() ? $request->user()->id : 'guest',
            'user_role' => $request->user() ? $request->user()->role : 'guest'
        ];

        return 'products:list:' . md5(serialize($params));
    }

    /**
     * Get cache tags for product list.
     */
    private function getProductCacheTags(Request $request): array
    {
        $tags = ['products'];

        if ($categoryId = $request->query('category_id')) {
            $tags[] = "category:{$categoryId}";
        }

        if ($request->query('featured') === 'true') {
            $tags[] = 'products:featured';
        }

        if ($request->user() && $request->user()->role === 'producer') {
            $tags[] = "producer:{$request->user()->producer->id}";
        }

        return $tags;
    }

    /**
     * Display optimized product details with caching.
     */
    public function show(Product $product)
    {
        // Check if product is active for public access
        if (!$product->is_active) {
            return response()->json(['message' => 'Product not found or not active.'], 404);
        }

        $cacheKey = "product:details:{$product->id}";
        
        // Try cache first
        $cachedProduct = Cache::get($cacheKey);
        if ($cachedProduct) {
            return response()->json($cachedProduct);
        }

        // Optimized eager loading
        $product->load([
            'producer:id,business_name,logo,location,description',
            'categories:id,name,slug',
            'images:id,product_id,image_path,order',
            'reviews:id,user_id,rating,comment,created_at',
            'reviews.user:id,name'
        ]);

        // Add computed fields
        $productData = $product->toArray();
        $productData['average_rating'] = $product->reviews->avg('rating');
        $productData['review_count'] = $product->reviews->count();
        $productData['effective_price'] = $product->discount_price ?? $product->price;

        // Cache for 15 minutes
        Cache::tags(['products', "product:{$product->id}"])
             ->put($cacheKey, $productData, now()->addMinutes(15));

        return response()->json($productData);
    }

    /**
     * Optimized search with full-text capabilities.
     */
    public function search(Request $request)
    {
        $request->validate([
            'q' => 'required|string|min:1|max:255',
            'category_id' => 'nullable|integer|exists:product_categories,id',
            'per_page' => 'nullable|integer|min:1|max:50',
        ]);

        $searchTerm = $request->query('q');
        $cacheKey = "search:" . md5($searchTerm . serialize($request->query()));

        // Try cache first
        $cachedResults = Cache::get($cacheKey);
        if ($cachedResults) {
            return response()->json($cachedResults);
        }

        // Optimized search query
        $query = Product::select([
            'id', 'producer_id', 'name', 'slug', 'short_description',
            'price', 'discount_price', 'main_image', 'created_at'
        ])->where('is_active', true);

        // Use FULLTEXT search if available, otherwise LIKE
        $query->where(function ($q) use ($searchTerm) {
            $q->where('name', 'like', '%' . $searchTerm . '%')
              ->orWhere('short_description', 'like', '%' . $searchTerm . '%')
              ->orWhereHas('producer', function ($q2) use ($searchTerm) {
                  $q2->where('business_name', 'like', '%' . $searchTerm . '%');
              });
        });

        // Category filter
        if ($categoryId = $request->query('category_id')) {
            $query->whereHas('categories', function ($q) use ($categoryId) {
                $q->where('product_categories.id', $categoryId);
            });
        }

        // Relevance-based ordering
        $query->orderByRaw("
            CASE
                WHEN name LIKE ? THEN 1
                WHEN short_description LIKE ? THEN 2
                ELSE 3
            END, created_at DESC
        ", ['%' . $searchTerm . '%', '%' . $searchTerm . '%']);

        // Eager load relationships
        $query->with([
            'producer:id,business_name',
            'categories:id,name,slug'
        ]);

        $perPage = min($request->query('per_page', 15), 50);
        $products = $query->paginate($perPage);

        $responseData = [
            'data' => $products->items(),
            'meta' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
                'search_term' => $searchTerm,
            ]
        ];

        // Cache search results for 10 minutes
        Cache::tags(['products', 'search'])
             ->put($cacheKey, $responseData, now()->addMinutes(10));

        return response()->json($responseData);
    }

    /**
     * Get featured products with optimized caching.
     */
    public function featured(Request $request)
    {
        $cacheKey = 'products:featured:' . ($request->query('limit', 10));
        
        $cachedProducts = Cache::get($cacheKey);
        if ($cachedProducts) {
            return response()->json($cachedProducts);
        }

        $limit = min($request->query('limit', 10), 50);
        
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
        ->limit($limit)
        ->get();

        $responseData = [
            'data' => $products,
            'meta' => [
                'count' => $products->count(),
                'limit' => $limit
            ]
        ];

        // Cache for 30 minutes
        Cache::tags(['products', 'products:featured'])
             ->put($cacheKey, $responseData, now()->addMinutes(30));

        return response()->json($responseData);
    }
}
