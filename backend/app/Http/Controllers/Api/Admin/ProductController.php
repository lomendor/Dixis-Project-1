<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Product;
use App\Models\Producer;
use App\Models\ProductCategory;
use App\Models\User;
use Illuminate\Validation\Rule;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use App\Services\SkuGeneratorService;

class ProductController extends Controller
{
    /**
     * Display a listing of the products.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        // Validate request parameters
        $request->validate([
            'producer_id' => 'sometimes|integer|exists:producers,id',
            'category_id' => 'sometimes|integer|exists:product_categories,id',
            'is_active' => 'sometimes|boolean',
            'is_featured' => 'sometimes|boolean',
            'has_stock' => 'sometimes|boolean',
            'price_min' => 'sometimes|numeric|min:0',
            'price_max' => 'sometimes|numeric|min:0',
            'date_from' => 'sometimes|date',
            'date_to' => 'sometimes|date',
            'search' => 'sometimes|string|max:100',
            'per_page' => 'sometimes|integer|min:5|max:100',
            'page' => 'sometimes|integer|min:1',
            'sort_by' => ['sometimes', 'string', Rule::in(['id', 'name', 'price', 'stock_quantity', 'created_at'])],
            'sort_dir' => ['sometimes', 'string', Rule::in(['asc', 'desc'])],
        ]);

        // Build query
        $query = Product::with(['producer.user:id,name', 'categories:id,name']);

        // Apply producer filter
        if ($request->has('producer_id')) {
            $query->where('producer_id', $request->producer_id);
        }

        // Apply category filter
        if ($request->has('category_id')) {
            $query->whereHas('categories', function($q) use ($request) {
                $q->where('product_categories.id', $request->category_id);
            });
        }

        // Apply active filter
        if ($request->has('is_active')) {
            $query->where('is_active', $request->is_active);
        }

        // Apply featured filter
        if ($request->has('is_featured')) {
            $query->where('featured', $request->is_featured);
        }

        // Apply stock filter
        if ($request->has('has_stock')) {
            if ($request->has_stock) {
                $query->where('stock_quantity', '>', 0);
            } else {
                $query->where('stock_quantity', '=', 0);
            }
        }

        // Apply price range filter
        if ($request->has('price_min')) {
            $query->where('price', '>=', $request->price_min);
        }

        if ($request->has('price_max')) {
            $query->where('price', '<=', $request->price_max);
        }

        // Apply date range filter
        if ($request->has('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->has('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        // Apply search filter
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%");
            });
        }

        // Apply sorting
        $sortBy = $request->input('sort_by', 'created_at');
        $sortDir = $request->input('sort_dir', 'desc');
        $query->orderBy($sortBy, $sortDir);

        // Paginate results
        $perPage = $request->input('per_page', 15);
        $products = $query->paginate($perPage);

        // Get statistics for filters
        $stats = [
            'total_products' => Product::count(),
            'active_products' => Product::where('is_active', true)->count(),
            'inactive_products' => Product::where('is_active', false)->count(),
            'featured_products' => Product::where('featured', true)->count(),
            'out_of_stock_products' => Product::where('stock_quantity', 0)->count(),
            'price_range' => [
                'min' => Product::min('price'),
                'max' => Product::max('price'),
                'avg' => Product::avg('price')
            ]
        ];

        return response()->json([
            'data' => $products->items(),
            'current_page' => $products->currentPage(),
            'last_page' => $products->lastPage(),
            'per_page' => $products->perPage(),
            'total' => $products->total(),
            'stats' => $stats
        ]);
    }

    /**
     * Display the specified product.
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        // Log the request for debugging
        \Illuminate\Support\Facades\Log::debug('ProductController@show called with product ID: ' . $id);

        // Find the product by ID
        $product = Product::findOrFail($id);

        // Load relationships
        $product->load([
            'producer.user:id,name,email',
            'categories:id,name,parent_id',
            'attributes',
            'images',
            'questions' => function ($query) {
                $query->orderBy('created_at', 'desc');
            },
            'reviews' => function ($query) {
                $query->orderBy('created_at', 'desc');
            },
            'reviews.user:id,name'
        ]);

        // Προσθέτουμε τα ονόματα των χρηστών στις ερωτήσεις
        foreach ($product->questions as $question) {
            if ($question->user) {
                $question->user_name = $question->user->name;
            } else {
                $question->user_name = 'Ανώνυμος';
            }
        }

        // Καταγράφουμε τα δεδομένα που επιστρέφουμε για debugging
        \Illuminate\Support\Facades\Log::debug('ProductController@show returning data: ' . json_encode($product));

        return response()->json($product);
    }

    /**
     * Display the specified product for editing.
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function edit($id)
    {
        // Find the product by ID
        $product = Product::findOrFail($id);

        // Load relationships
        $product->load([
            'producer',
            'categories',
        ]);

        return response()->json($product);
    }

    /**
     * Update the specified product.
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        // Log the request data for debugging
        \Illuminate\Support\Facades\Log::debug('ProductController@update called with data: ' . json_encode($request->all()));

        // Find the product by ID
        $product = Product::findOrFail($id);

        // Validate request
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'short_description' => 'sometimes|nullable|string|max:500',
            'price' => 'sometimes|numeric|min:0',
            'discount_price' => 'sometimes|nullable|numeric|min:0', // Χρησιμοποιούμε το discount_price αντί για sale_price
            'stock' => 'sometimes|integer|min:0', // Χρησιμοποιούμε το stock αντί για stock_quantity
            'sku' => ['sometimes', 'string', 'max:100', Rule::unique('products')->ignore($product->id)],
            'weight_grams' => 'sometimes|nullable|integer|min:0',
            'is_active' => 'sometimes|boolean',
            'is_featured' => 'sometimes|boolean', // Χρησιμοποιούμε το is_featured αντί για featured
            'category_id' => 'sometimes|integer|exists:product_categories,id',
            'producer_id' => 'sometimes|integer|exists:producers,id',
            'attributes' => 'sometimes|array',
        ]);

        // Map frontend field names to backend field names if needed
        $updateData = $validated;

        // Update product
        $product->update($updateData);

        // Update category if category_id was provided
        if (isset($validated['category_id'])) {
            // Remove all current categories and attach the new one
            $product->categories()->sync([$validated['category_id']]);
        }

        // Load relationships for response
        $product->load([
            'producer.user:id,name,email',
            'categories:id,name,parent_id',
            'attributes',
            'images',
            'questions' => function ($query) {
                $query->orderBy('created_at', 'desc');
            },
            'reviews' => function ($query) {
                $query->orderBy('created_at', 'desc');
            },
            'reviews.user:id,name'
        ]);

        return response()->json($product);
    }

    /**
     * Store a newly created product.
     *
     * @param Request $request
     * @param SkuGeneratorService $skuGenerator
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request, SkuGeneratorService $skuGenerator)
    {
        // Validate request
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'discount_price' => 'nullable|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'sku' => 'nullable|string|max:100|unique:products,sku', // Made SKU optional
            'is_active' => 'boolean',
            'category_id' => 'required|integer|exists:product_categories,id',
            'producer_id' => 'required|integer|exists:producers,id',
            'is_featured' => 'boolean',
            'weight_grams' => 'nullable|integer|min:0',
            'dimensions' => 'nullable|array',
            'short_description' => 'nullable|string|max:500',
        ]);

        // Generate slug from name
        $slug = Str::slug($validated['name']);
        $baseSlug = $slug;
        $counter = 1;

        // Ensure slug is unique
        while (Product::where('slug', $slug)->exists()) {
            $slug = $baseSlug . '-' . $counter++;
        }

        // Generate SKU if not provided
        if (empty($validated['sku'])) {
            $validated['sku'] = $skuGenerator->generateSku($validated);
        }

        // Create product
        $product = new Product([
            ...$validated,
            'slug' => $slug,
        ]);

        $product->save();

        // Load relationships for response
        $product->load(['producer.user:id,name', 'categories:id,name']);

        // Attach category if category_id was provided
        if (isset($validated['category_id'])) {
            $product->categories()->attach($validated['category_id']);
        }

        return response()->json($product, 201);
    }

    /**
     * Remove the specified product.
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        // Find the product by ID
        $product = Product::findOrFail($id);

        // Check if product can be deleted (e.g., no orders)
        $hasOrders = $product->orderItems()->exists();
        if ($hasOrders) {
            return response()->json([
                'message' => 'Cannot delete product with existing orders. Consider deactivating it instead.'
            ], 422);
        }

        // Delete product
        $product->delete();

        return response()->json(['message' => 'Product deleted successfully.']);
    }
}
