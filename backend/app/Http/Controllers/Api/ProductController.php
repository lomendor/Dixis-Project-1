<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage; // Added for file storage
use Illuminate\Foundation\Auth\Access\AuthorizesRequests; // Import the trait
use App\Services\SkuGeneratorService;
use App\Services\CacheService;

class ProductController extends Controller
{
    use AuthorizesRequests; // Add the trait usage here

    protected $cacheService;

    public function __construct(CacheService $cacheService)
    {
        $this->cacheService = $cacheService;
    }

    /**
     * Display a listing of products.
     * - If accessed by an authenticated producer, returns their products (active and inactive).
     * - Otherwise, returns publicly active products.
     * - Supports filtering by category, attribute, price range, and search term.
     */
    public function index(Request $request) // Add Request object
    {
        $user = $request->user('sanctum'); // Get authenticated user via sanctum guard

        // For public requests, try cache first
        if (!$user || $user->role !== 'producer') {
            $filters = $request->only(['category_id', 'search', 'min_price', 'max_price', 'per_page']);
            $cachedProducts = $this->cacheService->cacheProducts($filters);

            if ($cachedProducts) {
                return response()->json($cachedProducts);
            }
        }

        // Initialize query
        if ($user && $user->role === 'producer' && $user->producer) {
            // Producer is logged in - show their products
            $query = $user->producer->products(); // Get products via relationship
        } else {
            // Public view - show active products only
            $query = Product::where('is_active', true);
        }

        // Filter by category
        $categoryId = $request->query('category_id');
        $categorySlug = $request->query('category_slug');

        if ($categoryId) {
            $query->whereHas('categories', function ($q) use ($categoryId) {
                $q->where('id', $categoryId);
            });
        } elseif ($categorySlug) {
            $query->whereHas('categories', function ($q) use ($categorySlug) {
                $q->where('slug', $categorySlug);
            });
        }

        // Filter by attribute
        $attributes = $request->query('attributes');
        if ($attributes && is_array($attributes)) {
            foreach ($attributes as $attributeId => $value) {
                $query->whereHas('attributeValues', function ($q) use ($attributeId, $value) {
                    $q->where('attribute_id', $attributeId)
                      ->where('value', $value);
                });
            }
        }

        // Filter by price range
        $minPrice = $request->query('min_price');
        $maxPrice = $request->query('max_price');

        if ($minPrice !== null) {
            $query->where(function ($q) use ($minPrice) {
                $q->where('price', '>=', $minPrice)
                  ->orWhere(function ($q2) use ($minPrice) {
                      $q2->whereNotNull('discount_price')
                         ->where('discount_price', '>=', $minPrice);
                  });
            });
        }

        if ($maxPrice !== null) {
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

        // Search by term
        $searchTerm = $request->query('search');
        if ($searchTerm) {
            $query->where(function ($q) use ($searchTerm) {
                $q->where('name', 'like', '%' . $searchTerm . '%')
                  ->orWhere('description', 'like', '%' . $searchTerm . '%')
                  ->orWhere('short_description', 'like', '%' . $searchTerm . '%');
            });
        }

        // Sort products
        $sortBy = $request->query('sort_by', 'created_at');
        $sortDirection = $request->query('sort_direction', 'desc');

        // Validate sort parameters
        $allowedSortFields = ['created_at', 'price', 'name'];
        $allowedSortDirections = ['asc', 'desc'];

        if (!in_array($sortBy, $allowedSortFields)) {
            $sortBy = 'created_at';
        }

        if (!in_array($sortDirection, $allowedSortDirections)) {
            $sortDirection = 'desc';
        }

        // Special case for sorting by price (considering discount_price)
        if ($sortBy === 'price') {
            $query->orderByRaw('COALESCE(discount_price, price) ' . $sortDirection);
        } else {
            $query->orderBy($sortBy, $sortDirection);
        }

        // Eager load relationships
        $query->with([
            'producer:id,business_name',
            'categories:id,name,slug',
            'attributeValues.attribute' // Load attribute values with their attributes
        ]);

        // Paginate results
        $perPage = $request->query('per_page', 15);
        $products = $query->paginate($perPage);

        return response()->json($products);
    }

    /**
     * Get featured products.
     * Publicly accessible.
     */
    public function featured(Request $request)
    {
        $limit = $request->query('limit', 8);

        // Use cached featured products
        $products = $this->cacheService->cacheFeaturedProducts($limit);

        return response()->json([
            'data' => $products,
            'meta' => [
                'total' => count($products),
                'limit' => $limit
            ]
        ]);
    }

    /**
     * Store a newly created product in storage.
     * Accessible only by authenticated producers.
     */
    public function store(Request $request, SkuGeneratorService $skuGenerator)
    {
        // Authorize using ProductPolicy's create method
        $this->authorize('create', Product::class);

        $user = Auth::user();
        $producer = $user->producer; // We know producer exists due to authorization check

        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'short_description' => 'nullable|string|max:255',
            'price' => 'required|numeric|min:0',
            'discount_price' => 'nullable|numeric|min:0|lt:price', // Less than original price
            'stock' => 'required|integer|min:0',
            'sku' => ['nullable', 'string', 'max:255', Rule::unique('products', 'sku')],
            'weight_grams' => 'nullable|integer|min:0',
            'length_cm' => 'nullable|integer|min:0', // Add dimension validation
            'width_cm' => 'nullable|integer|min:0',  // Add dimension validation
            'height_cm' => 'nullable|integer|min:0', // Add dimension validation
            'main_image_file' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'is_active' => 'sometimes|boolean',
            // Add validation for other fields like dimensions, seasonal, limited edition if needed for MVP
            'attributes' => 'nullable|array', // Allow flexible attributes
            'attribute_values' => 'nullable|array', // New field for structured attribute values
            'attribute_values.*.attribute_id' => 'required|exists:product_attributes,id',
            'attribute_values.*.value' => 'required|string',
            'category_ids' => 'nullable|array', // Expecting an array of category IDs
            'category_ids.*' => 'exists:product_categories,id' // Validate each ID exists
        ]);

        // Generate SKU if not provided
        if (empty($validatedData['sku'])) {
            // Prepare data for SKU generation
            $skuData = [
                'name' => $validatedData['name'],
                'producer_id' => $producer->id
            ];

            // Add category_id if available
            if (!empty($validatedData['category_ids']) && is_array($validatedData['category_ids'])) {
                $skuData['category_id'] = $validatedData['category_ids'][0]; // Use the first category
            }

            $validatedData['sku'] = $skuGenerator->generateSku($skuData);
        }

        $product = $producer->products()->create([ // Create product associated with the producer
            'name' => $validatedData['name'],
            'slug' => $this->generateUniqueSlug($validatedData['name']), // Use helper for unique slug
            'description' => $validatedData['description'],
            'short_description' => $validatedData['short_description'] ?? null,
            'price' => $validatedData['price'],
            'discount_price' => $validatedData['discount_price'] ?? null,
            'stock' => $validatedData['stock'],
            'sku' => $validatedData['sku'],
            'weight_grams' => $validatedData['weight_grams'] ?? null,
            // Store dimensions both as JSON and in individual columns
            'dimensions' => json_encode([ // Store dimensions as JSON
                'length_cm' => $validatedData['length_cm'] ?? null,
                'width_cm' => $validatedData['width_cm'] ?? null,
                'height_cm' => $validatedData['height_cm'] ?? null,
            ]),
            'length_cm' => $validatedData['length_cm'] ?? null,
            'width_cm' => $validatedData['width_cm'] ?? null,
            'height_cm' => $validatedData['height_cm'] ?? null,
            'is_active' => $validatedData['is_active'] ?? true,
            'attributes' => $validatedData['attributes'] ?? null,
            // Add other fields here
        ]);

        // Handle main image upload
        if ($request->hasFile('main_image_file')) {
            $path = $request->file('main_image_file')->store('product_images', 'public');
            // Update the product's main_image path after creation
            $product->main_image = $path;
            $product->save();
        }

        // Handle category relationships if provided
        if (!empty($validatedData['category_ids'])) {
            $product->categories()->sync($validatedData['category_ids']);
        }

        // Handle attribute values if provided
        if (!empty($validatedData['attribute_values'])) {
            foreach ($validatedData['attribute_values'] as $attributeValue) {
                $product->attributeValues()->create([
                    'attribute_id' => $attributeValue['attribute_id'],
                    'value' => $attributeValue['value'],
                ]);
            }
        }

        return response()->json($product->load(['categories', 'attributeValues.attribute']), 201); // Return created product with categories and attributes
    }

    /**
     * Display the specified product by slug.
     * Publicly accessible.
     */
    public function show(Product $product) // Route model binding by slug
    {
        // Ensure the product is active
        if (!$product->is_active) {
            return response()->json(['message' => 'Product not found or not active.'], 404);
        }
        // Eager load relationships
        // Note: We might want to authorize here too, even for public view,
        // if there's a chance a non-active product slug is guessed.
        // $this->authorize('view', $product); // Optional: uncomment if needed

        // Eager load relationships
        return response()->json($product->load(['producer:id,business_name,logo', 'categories:id,name,slug', 'images']));
    }

     /**
     * Display the specified product for the owning producer.
     * Allows viewing inactive products.
     */
    public function showForProducer(Product $product) // Route model binding by ID
    {
        // Authorize using ProductPolicy's view method (allows owner to see inactive)
        // Note: The policy's view method already handles the logic.
        // We just need to ensure the route middleware enforces authentication.
        $this->authorize('view', $product);

        // Parse the dimensions JSON if it's a string
        $dimensionsArray = [];
        if (is_string($product->dimensions) && !empty($product->dimensions)) {
            $dimensionsArray = json_decode($product->dimensions, true) ?? [];
        } elseif (is_array($product->dimensions)) {
            $dimensionsArray = $product->dimensions;
        }

        // Always create a dimensions object with the most accurate data available
        // This ensures the frontend always receives dimensions in a consistent format
        $product->dimensions = [
            'length_cm' => $product->length_cm ?? ($dimensionsArray['length_cm'] ?? null),
            'width_cm' => $product->width_cm ?? ($dimensionsArray['width_cm'] ?? null),
            'height_cm' => $product->height_cm ?? ($dimensionsArray['height_cm'] ?? null),
        ];

        // Eager load relationships needed for the edit form
        return response()->json($product->load(['categories:id,name', 'images'])); // Load categories and images
    }


    /**
     * Update the specified product in storage.
     * Accessible only by the producer who owns the product.
     */
    public function update(Request $request, Product $product) // Route model binding by ID
    {
        // Authorize using ProductPolicy's update method
        $this->authorize('update', $product);

        // Validation logic remains the same
        $validatedData = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'short_description' => 'nullable|string|max:255',
            'price' => 'sometimes|required|numeric|min:0',
            'discount_price' => 'nullable|numeric|min:0|lt:price',
            'stock' => 'sometimes|required|integer|min:0',
            'sku' => ['nullable', 'string', 'max:255', Rule::unique('products', 'sku')->ignore($product->id)],
            'weight_grams' => 'nullable|integer|min:0',
            'length_cm' => 'nullable|integer|min:0', // Add dimension validation
            'width_cm' => 'nullable|integer|min:0',  // Add dimension validation
            'height_cm' => 'nullable|integer|min:0', // Add dimension validation
            'main_image_file' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'is_active' => 'sometimes|boolean',
            'attributes' => 'nullable|array', // Allow flexible attributes
            'attribute_values' => 'nullable|array', // New field for structured attribute values
            'attribute_values.*.attribute_id' => 'required|exists:product_attributes,id',
            'attribute_values.*.value' => 'required|string',
            'category_ids' => 'nullable|array',
            'category_ids.*' => 'exists:product_categories,id'
        ]);

        // Update slug if name is changed, ensuring uniqueness
        if ($request->has('name') && $validatedData['name'] !== $product->name) {
            $validatedData['slug'] = $this->generateUniqueSlug($validatedData['name'], $product->id);
        }

         // Parse existing dimensions from JSON if needed
         $existingDimensions = [];
         if (is_string($product->dimensions) && !empty($product->dimensions)) {
             $existingDimensions = json_decode($product->dimensions, true) ?? [];
         } elseif (is_array($product->dimensions)) {
             $existingDimensions = $product->dimensions;
         }

         // Always update both the dimensions JSON field and individual columns
         // This ensures consistency between the two storage methods

         // First, ensure we have the most accurate dimension values
         // Use the validated data if provided, otherwise use existing values from either source
         $length = isset($validatedData['length_cm']) ? $validatedData['length_cm'] :
                  ($product->length_cm ?? ($existingDimensions['length_cm'] ?? null));

         $width = isset($validatedData['width_cm']) ? $validatedData['width_cm'] :
                 ($product->width_cm ?? ($existingDimensions['width_cm'] ?? null));

         $height = isset($validatedData['height_cm']) ? $validatedData['height_cm'] :
                  ($product->height_cm ?? ($existingDimensions['height_cm'] ?? null));

         // Update individual columns
         $validatedData['length_cm'] = $length;
         $validatedData['width_cm'] = $width;
         $validatedData['height_cm'] = $height;

         // Update dimensions JSON field
         $validatedData['dimensions'] = json_encode([
             'length_cm' => $length,
             'width_cm' => $width,
             'height_cm' => $height,
         ]);

        // Handle main image upload for update
        if ($request->hasFile('main_image_file')) {
            // Delete old image if it exists
            if ($product->main_image) {
                Storage::disk('public')->delete($product->main_image);
            }
            // Store new image and update path
            $validatedData['main_image'] = $request->file('main_image_file')->store('product_images', 'public');
        } elseif ($request->input('remove_main_image') == '1' && $product->main_image) {
             // Handle image removal if a specific input is sent (e.g., remove_main_image=1)
             Storage::disk('public')->delete($product->main_image);
             $validatedData['main_image'] = null;
        }


        $product->update($validatedData);

        // Handle category relationships if provided
        if ($request->has('category_ids')) {
             // Use sync to add/remove categories as needed
            $product->categories()->sync($validatedData['category_ids'] ?? []);
        }

        // Handle attribute values if provided
        if ($request->has('attribute_values')) {
            // Delete existing attribute values
            $product->attributeValues()->delete();

            // Add new attribute values
            if (!empty($validatedData['attribute_values'])) {
                foreach ($validatedData['attribute_values'] as $attributeValue) {
                    $product->attributeValues()->create([
                        'attribute_id' => $attributeValue['attribute_id'],
                        'value' => $attributeValue['value'],
                    ]);
                }
            }
        }

        return response()->json($product->load(['categories', 'attributeValues.attribute'])); // Return updated product with categories and attributes
    }

    /**
     * Remove the specified product from storage.
     * Accessible only by the producer who owns the product.
     */
    public function destroy(Product $product) // Route model binding by ID
    {
        // Authorize using ProductPolicy's delete method
        $this->authorize('delete', $product);

        // Detach categories before deleting product to avoid constraint issues if any
        // Delete associated image(s) when product is deleted
        if ($product->main_image) {
            Storage::disk('public')->delete($product->main_image);
        }
        // TODO: Delete images from product_images table as well if implemented

        // Delete attribute values
        $product->attributeValues()->delete();

        // Detach categories
        $product->categories()->detach();

        // Delete product
        $product->delete();

        return response()->json(['message' => 'Product deleted successfully.'], 200);
    }

    /**
     * Search products by term.
     * Publicly accessible.
     */
    public function search(Request $request)
    {
        $request->validate([
            'q' => 'required|string|min:1|max:255',
            'category_id' => 'nullable|integer|exists:product_categories,id',
            'per_page' => 'nullable|integer|min:1|max:50',
        ]);

        $searchTerm = $request->query('q');
        $categoryId = $request->query('category_id');
        $perPage = $request->query('per_page', 15);

        // Prepare case variations for Greek text search
        $searchTermUpper = mb_strtoupper($searchTerm, 'UTF-8');
        $searchTermLower = mb_strtolower($searchTerm, 'UTF-8');

        // Initialize query for active products only
        $query = Product::where('is_active', true);

        // Search by term (GREEK-SMART-CASE - Handle Greek capitalization patterns)
        // Create Greek-aware search variations:
        // 1. Original term, 2. First letter uppercase, 3. All uppercase, 4. All lowercase
        $searchTermFirstCap = mb_strtoupper(mb_substr($searchTerm, 0, 1, 'UTF-8'), 'UTF-8') . 
                              mb_strtolower(mb_substr($searchTerm, 1, null, 'UTF-8'), 'UTF-8');
        
        $searchVariations = array_unique([
            $searchTerm,
            $searchTermUpper,
            $searchTermLower, 
            $searchTermFirstCap
        ]);
        
        $query->where(function ($q) use ($searchVariations) {
            foreach ($searchVariations as $variation) {
                $q->orWhere('name', 'ILIKE', '%' . $variation . '%')
                  ->orWhere('description', 'ILIKE', '%' . $variation . '%')
                  ->orWhere('short_description', 'ILIKE', '%' . $variation . '%');
            }
        });

        // Filter by category if provided (SIMPLIFIED - Use direct category_id)
        if ($categoryId) {
            $query->where('category_id', $categoryId);
        }

        // Eager load relationships (SIMPLIFIED)
        $query->with('producer:id,business_name');

        // Order by relevance (products with name match first, then description, etc.)
        $query->orderByRaw("
            CASE
                WHEN name LIKE ? THEN 1
                WHEN short_description LIKE ? THEN 2
                WHEN description LIKE ? THEN 3
                ELSE 4
            END, created_at DESC
        ", [
            '%' . $searchTerm . '%',
            '%' . $searchTerm . '%',
            '%' . $searchTerm . '%'
        ]);

        // Paginate results
        $products = $query->paginate($perPage);

        return response()->json([
            'data' => $products->items(),
            'meta' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
                'search_term' => $searchTerm,
                'category_id' => $categoryId,
            ]
        ]);
    }

    /**
     * Get recommended products based on cart items or popular products.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getRecommendedProducts(Request $request)
    {
        // Validate request parameters
        $request->validate([
            'cart_items' => 'nullable|string', // Comma-separated list of product IDs
            'limit' => 'nullable|integer|min:1|max:20', // Limit the number of recommendations
        ]);

        // Get parameters
        $cartItems = $request->input('cart_items');
        $limit = $request->input('limit', 4); // Default to 4 recommendations

        // Initialize query for active products
        $query = Product::where('is_active', true);

        // If cart items are provided, use them for recommendations
        if ($cartItems) {
            $cartItemIds = explode(',', $cartItems);

            if (!empty($cartItemIds)) {
                // Get products from the same categories as the cart items
                $categoryIds = DB::table('product_category')
                    ->whereIn('product_id', $cartItemIds)
                    ->pluck('category_id')
                    ->toArray();

                if (!empty($categoryIds)) {
                    $query->whereHas('categories', function ($q) use ($categoryIds) {
                        $q->whereIn('product_categories.id', $categoryIds);
                    });
                }

                // Exclude products already in the cart
                $query->whereNotIn('id', $cartItemIds);
            }
        }

        // If no cart items or no categories found, fall back to popular products
        if ($cartItems === null || $query->count() === 0) {
            // Reset query
            $query = Product::where('is_active', true);

            // Order by popularity (you can define your own popularity metric)
            // For example, products with most orders or views
            $query->orderBy('created_at', 'desc'); // Temporary fallback to newest products
        }

        // Eager load necessary relationships
        $query->with([
            'producer:id,business_name',
            'categories:id,name,slug'
        ]);

        // Limit results
        $products = $query->limit($limit)->get();

        return response()->json([
            'data' => $products,
            'meta' => [
                'count' => $products->count(),
                'based_on_cart' => !empty($cartItemIds) && !empty($categoryIds)
            ]
        ]);
    }

    /**
     * Get autocomplete suggestions for product search.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function autocomplete(Request $request)
    {
        // Validate request parameters
        $request->validate([
            'query' => 'required|string|min:2|max:100',
            'limit' => 'nullable|integer|min:1|max:20',
        ]);

        // Get parameters
        $query = $request->input('query');
        $limit = $request->input('limit', 10); // Default to 10 suggestions

        // Initialize results arrays
        $products = [];
        $categories = [];
        $producers = [];

        // Search for products
        $productResults = Product::where('is_active', true)
            ->where(function ($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                  ->orWhere('short_description', 'like', "%{$query}%");
            })
            ->with(['producer:id,business_name', 'categories:id,name,slug'])
            ->limit($limit)
            ->get(['id', 'name', 'slug', 'price', 'discount_price', 'main_image', 'short_description', 'producer_id']);

        if ($productResults->count() > 0) {
            $products = $productResults;
        }

        // Search for categories
        $categoryResults = DB::table('product_categories')
            ->where('name', 'like', "%{$query}%")
            ->limit(5)
            ->get(['id', 'name', 'slug']);

        if ($categoryResults->count() > 0) {
            $categories = $categoryResults;
        }

        // Search for producers
        $producerResults = DB::table('producers')
            ->where('business_name', 'like', "%{$query}%")
            ->limit(5)
            ->get(['id', 'business_name', 'slug']);

        if ($producerResults->count() > 0) {
            $producers = $producerResults;
        }

        // Combine results
        return response()->json([
            'products' => $products,
            'categories' => $categories,
            'producers' => $producers,
            'meta' => [
                'query' => $query,
                'product_count' => count($products),
                'category_count' => count($categories),
                'producer_count' => count($producers),
                'total_count' => count($products) + count($categories) + count($producers)
            ]
        ]);
    }

    /**
     * Get general related products.
     * Returns popular or featured products.
     */
    public function getRelatedProducts(Request $request)
    {
        $limit = $request->query('limit', 8);

        // Get popular products (you can customize this logic)
        $products = Product::where('is_active', true)
            ->with(['producer:id,business_name', 'categories:id,name,slug'])
            ->inRandomOrder() // For now, return random products
            ->limit($limit)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $products
        ]);
    }

    /**
     * Generate a unique slug for the product.
     *
     * @param string $name The product name to slugify.
     * @param int|null $ignoreId The ID of the product to ignore during uniqueness check (for updates).
     * @return string The unique slug.
     */
    protected function generateUniqueSlug(string $name, ?int $ignoreId = null): string
    {
        $slug = Str::slug($name);
        $originalSlug = $slug;
        $count = 1;

        // Check if the slug exists
        $query = Product::where('slug', $slug);
        if ($ignoreId !== null) {
            $query->where('id', '!=', $ignoreId);
        }

        while ($query->exists()) {
            // If it exists, append a number and check again
            $slug = $originalSlug . '-' . $count++;
            // Re-query with the new slug attempt
            $query = Product::where('slug', $slug);
             if ($ignoreId !== null) {
                $query->where('id', '!=', $ignoreId);
            }
        }

        return $slug;
    }
}
