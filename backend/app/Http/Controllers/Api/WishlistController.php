<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Wishlist;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class WishlistController extends Controller
{
    /**
     * Get the authenticated user's wishlist.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        try {
            $user = Auth::user();
            $wishlistItems = Wishlist::where('user_id', $user->id)
                ->with('product.producer')
                ->get();

            return response()->json($wishlistItems);
        } catch (\Exception $e) {
            Log::error('Error fetching wishlist: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error fetching wishlist',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Add a product to the user's wishlist.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        try {
            $request->validate([
                'product_id' => 'required|exists:products,id',
            ]);

            $user = Auth::user();
            $productId = $request->input('product_id');

            // Check if the product is already in the wishlist
            $existingItem = Wishlist::where('user_id', $user->id)
                ->where('product_id', $productId)
                ->first();

            if ($existingItem) {
                return response()->json([
                    'message' => 'Product is already in wishlist',
                    'wishlist_item' => $existingItem
                ]);
            }

            // Add the product to the wishlist
            $wishlistItem = new Wishlist();
            $wishlistItem->user_id = $user->id;
            $wishlistItem->product_id = $productId;
            $wishlistItem->save();

            return response()->json([
                'message' => 'Product added to wishlist',
                'wishlist_item' => $wishlistItem
            ], 201);
        } catch (\Exception $e) {
            Log::error('Error adding product to wishlist: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error adding product to wishlist',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove a product from the user's wishlist.
     *
     * @param Request $request
     * @param int $productId
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(Request $request, $productId)
    {
        try {
            $user = Auth::user();

            // Find the wishlist item
            $wishlistItem = Wishlist::where('user_id', $user->id)
                ->where('product_id', $productId)
                ->first();

            if (!$wishlistItem) {
                return response()->json([
                    'message' => 'Product not found in wishlist'
                ], 404);
            }

            // Delete the wishlist item
            $wishlistItem->delete();

            return response()->json([
                'message' => 'Product removed from wishlist'
            ]);
        } catch (\Exception $e) {
            Log::error('Error removing product from wishlist: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error removing product from wishlist',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Toggle a product in the user's wishlist (add if not present, remove if present).
     *
     * @param Request $request
     * @param int $productId
     * @return \Illuminate\Http\JsonResponse
     */
    public function toggle(Request $request, $productId)
    {
        try {
            $user = Auth::user();

            // Check if the product exists
            $product = Product::find($productId);
            if (!$product) {
                return response()->json([
                    'message' => 'Product not found'
                ], 404);
            }

            // Check if the product is already in the wishlist
            $existingItem = Wishlist::where('user_id', $user->id)
                ->where('product_id', $productId)
                ->first();

            if ($existingItem) {
                // Remove from wishlist
                $existingItem->delete();
                return response()->json([
                    'message' => 'Product removed from wishlist',
                    'in_wishlist' => false
                ]);
            } else {
                // Add to wishlist
                $wishlistItem = new Wishlist();
                $wishlistItem->user_id = $user->id;
                $wishlistItem->product_id = $productId;
                $wishlistItem->save();

                return response()->json([
                    'message' => 'Product added to wishlist',
                    'in_wishlist' => true,
                    'wishlist_item' => $wishlistItem
                ], 201);
            }
        } catch (\Exception $e) {
            Log::error('Error toggling product in wishlist: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error toggling product in wishlist',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
