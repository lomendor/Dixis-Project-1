<?php

namespace App\Http\Controllers\Api\Producer;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\Producer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

class ProductController extends Controller
{
    /**
     * Display a listing of the producer's products.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        try {
            $user = Auth::user();
            $producer = Producer::where('user_id', $user->id)->first();

            if (!$producer) {
                return response()->json([
                    'message' => 'Producer not found'
                ], 404);
            }

            $products = Product::where('producer_id', $producer->id)
                ->with(['category', 'images'])
                ->orderBy('created_at', 'desc')
                ->paginate(10);

            return response()->json($products);
        } catch (\Exception $e) {
            Log::error('Error fetching producer products: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error fetching products',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created product in storage.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'description' => 'required|string',
                'price' => 'required|numeric|min:0',
                'category_id' => 'required|exists:product_categories,id',
                'stock_quantity' => 'required|integer|min:0',
                'weight' => 'required|numeric|min:0',
                'dimensions' => 'nullable|string',
                'is_organic' => 'boolean',
                'is_vegan' => 'boolean',
                'is_gluten_free' => 'boolean',
                'is_featured' => 'boolean',
                'is_seasonal' => 'boolean',
                'seasonality' => 'nullable|json',
                'attributes' => 'nullable|json',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = Auth::user();
            $producer = Producer::where('user_id', $user->id)->first();

            if (!$producer) {
                return response()->json([
                    'message' => 'Producer not found'
                ], 404);
            }

            $product = new Product();
            $product->name = $request->input('name');
            $product->slug = Str::slug($request->input('name'));
            $product->description = $request->input('description');
            $product->price = $request->input('price');
            $product->category_id = $request->input('category_id');
            $product->producer_id = $producer->id;
            $product->stock_quantity = $request->input('stock_quantity');
            $product->weight = $request->input('weight');
            $product->dimensions = $request->input('dimensions');
            $product->is_organic = $request->input('is_organic', false);
            $product->is_vegan = $request->input('is_vegan', false);
            $product->is_gluten_free = $request->input('is_gluten_free', false);
            $product->is_featured = $request->input('is_featured', false);
            $product->is_seasonal = $request->input('is_seasonal', false);
            $product->seasonality = $request->input('seasonality') ? json_decode($request->input('seasonality'), true) : null;
            $product->attributes = $request->input('attributes') ? json_decode($request->input('attributes'), true) : null;
            $product->status = 'pending'; // New products are pending approval
            $product->save();

            return response()->json([
                'message' => 'Product created successfully',
                'product' => $product
            ], 201);
        } catch (\Exception $e) {
            Log::error('Error creating product: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error creating product',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified product.
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        try {
            $user = Auth::user();
            $producer = Producer::where('user_id', $user->id)->first();

            if (!$producer) {
                return response()->json([
                    'message' => 'Producer not found'
                ], 404);
            }

            $product = Product::where('id', $id)
                ->where('producer_id', $producer->id)
                ->with(['category', 'images'])
                ->first();

            if (!$product) {
                return response()->json([
                    'message' => 'Product not found'
                ], 404);
            }

            return response()->json($product);
        } catch (\Exception $e) {
            Log::error('Error fetching product: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error fetching product',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified product in storage.
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'string|max:255',
                'description' => 'string',
                'price' => 'numeric|min:0',
                'category_id' => 'exists:product_categories,id',
                'stock_quantity' => 'integer|min:0',
                'weight' => 'numeric|min:0',
                'dimensions' => 'nullable|string',
                'is_organic' => 'boolean',
                'is_vegan' => 'boolean',
                'is_gluten_free' => 'boolean',
                'is_featured' => 'boolean',
                'is_seasonal' => 'boolean',
                'seasonality' => 'nullable|json',
                'attributes' => 'nullable|json',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = Auth::user();
            $producer = Producer::where('user_id', $user->id)->first();

            if (!$producer) {
                return response()->json([
                    'message' => 'Producer not found'
                ], 404);
            }

            $product = Product::where('id', $id)
                ->where('producer_id', $producer->id)
                ->first();

            if (!$product) {
                return response()->json([
                    'message' => 'Product not found'
                ], 404);
            }

            // Update product fields if they are provided
            if ($request->has('name')) {
                $product->name = $request->input('name');
                $product->slug = Str::slug($request->input('name'));
            }
            if ($request->has('description')) $product->description = $request->input('description');
            if ($request->has('price')) $product->price = $request->input('price');
            if ($request->has('category_id')) $product->category_id = $request->input('category_id');
            if ($request->has('stock_quantity')) $product->stock_quantity = $request->input('stock_quantity');
            if ($request->has('weight')) $product->weight = $request->input('weight');
            if ($request->has('dimensions')) $product->dimensions = $request->input('dimensions');
            if ($request->has('is_organic')) $product->is_organic = $request->input('is_organic');
            if ($request->has('is_vegan')) $product->is_vegan = $request->input('is_vegan');
            if ($request->has('is_gluten_free')) $product->is_gluten_free = $request->input('is_gluten_free');
            if ($request->has('is_featured')) $product->is_featured = $request->input('is_featured');
            if ($request->has('is_seasonal')) $product->is_seasonal = $request->input('is_seasonal');
            if ($request->has('seasonality')) $product->seasonality = json_decode($request->input('seasonality'), true);
            if ($request->has('attributes')) $product->attributes = json_decode($request->input('attributes'), true);

            // Set status to pending when product is updated
            $product->status = 'pending';
            $product->save();

            return response()->json([
                'message' => 'Product updated successfully',
                'product' => $product
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating product: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error updating product',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified product from storage.
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        try {
            $user = Auth::user();
            $producer = Producer::where('user_id', $user->id)->first();

            if (!$producer) {
                return response()->json([
                    'message' => 'Producer not found'
                ], 404);
            }

            $product = Product::where('id', $id)
                ->where('producer_id', $producer->id)
                ->first();

            if (!$product) {
                return response()->json([
                    'message' => 'Product not found'
                ], 404);
            }

            // Delete product images
            foreach ($product->images as $image) {
                Storage::delete('public/' . $image->image_path);
                $image->delete();
            }

            // Delete product
            $product->delete();

            return response()->json([
                'message' => 'Product deleted successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Error deleting product: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error deleting product',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Upload images for a product.
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function uploadImages(Request $request, $id)
    {
        try {
            $validator = Validator::make($request->all(), [
                'images' => 'required|array',
                'images.*' => 'image|mimes:jpeg,png,jpg,gif|max:2048',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = Auth::user();
            $producer = Producer::where('user_id', $user->id)->first();

            if (!$producer) {
                return response()->json([
                    'message' => 'Producer not found'
                ], 404);
            }

            $product = Product::where('id', $id)
                ->where('producer_id', $producer->id)
                ->first();

            if (!$product) {
                return response()->json([
                    'message' => 'Product not found'
                ], 404);
            }

            $uploadedImages = [];
            foreach ($request->file('images') as $image) {
                $path = $image->store('products', 'public');
                
                $productImage = new ProductImage();
                $productImage->product_id = $product->id;
                $productImage->image_path = $path;
                $productImage->sort_order = 0; // Default sort order
                $productImage->save();
                
                $uploadedImages[] = $productImage;
            }

            // Set first uploaded image as main if no images exist
            if (count($product->images) === count($uploadedImages) && !empty($uploadedImages)) {
                $firstImage = $uploadedImages[0];
                $firstImage->sort_order = 1; // First image gets priority
                $firstImage->save();
            }

            return response()->json([
                'message' => 'Images uploaded successfully',
                'images' => $uploadedImages
            ], 201);
        } catch (\Exception $e) {
            Log::error('Error uploading product images: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error uploading images',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a product image.
     *
     * @param int $id
     * @param int $imageId
     * @return \Illuminate\Http\JsonResponse
     */
    public function deleteImage($id, $imageId)
    {
        try {
            $user = Auth::user();
            $producer = Producer::where('user_id', $user->id)->first();

            if (!$producer) {
                return response()->json([
                    'message' => 'Producer not found'
                ], 404);
            }

            $product = Product::where('id', $id)
                ->where('producer_id', $producer->id)
                ->first();

            if (!$product) {
                return response()->json([
                    'message' => 'Product not found'
                ], 404);
            }

            $image = ProductImage::where('id', $imageId)
                ->where('product_id', $product->id)
                ->first();

            if (!$image) {
                return response()->json([
                    'message' => 'Image not found'
                ], 404);
            }

            // Check if this is the main image (sort_order = 1)
            $isMain = $image->sort_order == 1;

            // Delete the image file
            Storage::delete('public/' . $image->image_path);
            
            // Delete the image record
            $image->delete();

            // If this was the main image, set another image as main if available
            if ($isMain) {
                $newMainImage = ProductImage::where('product_id', $product->id)->first();
                if ($newMainImage) {
                    $newMainImage->sort_order = 1;
                    $newMainImage->save();
                }
            }

            return response()->json([
                'message' => 'Image deleted successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Error deleting product image: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error deleting image',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Set a product image as the main image.
     *
     * @param int $id
     * @param int $imageId
     * @return \Illuminate\Http\JsonResponse
     */
    public function setMainImage($id, $imageId)
    {
        try {
            $user = Auth::user();
            $producer = Producer::where('user_id', $user->id)->first();

            if (!$producer) {
                return response()->json([
                    'message' => 'Producer not found'
                ], 404);
            }

            $product = Product::where('id', $id)
                ->where('producer_id', $producer->id)
                ->first();

            if (!$product) {
                return response()->json([
                    'message' => 'Product not found'
                ], 404);
            }

            $image = ProductImage::where('id', $imageId)
                ->where('product_id', $product->id)
                ->first();

            if (!$image) {
                return response()->json([
                    'message' => 'Image not found'
                ], 404);
            }

            // Reset all images sort order
            ProductImage::where('product_id', $product->id)
                ->update(['sort_order' => 0]);

            // Set the selected image as main
            $image->sort_order = 1;
            $image->save();

            return response()->json([
                'message' => 'Main image set successfully',
                'image' => $image
            ]);
        } catch (\Exception $e) {
            Log::error('Error setting main product image: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error setting main image',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get product statistics for the producer dashboard.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function stats()
    {
        try {
            $user = Auth::user();
            $producer = Producer::where('user_id', $user->id)->first();

            if (!$producer) {
                return response()->json([
                    'message' => 'Producer not found'
                ], 404);
            }

            $stats = [
                'total_products' => Product::where('producer_id', $producer->id)->count(),
                'active_products' => Product::where('producer_id', $producer->id)
                    ->whereIn('status', ['active', 'approved'])
                    ->count(),
                'pending_products' => Product::where('producer_id', $producer->id)
                    ->where('status', 'pending')
                    ->count(),
                'inactive_products' => Product::where('producer_id', $producer->id)
                    ->whereIn('status', ['inactive', 'rejected'])
                    ->count(),
                'out_of_stock' => Product::where('producer_id', $producer->id)
                    ->where('stock_quantity', 0)
                    ->count(),
                'low_stock' => Product::where('producer_id', $producer->id)
                    ->where('stock_quantity', '>', 0)
                    ->where('stock_quantity', '<=', 10)
                    ->count(),
            ];

            return response()->json([
                'data' => $stats
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching product stats: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error fetching product statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
