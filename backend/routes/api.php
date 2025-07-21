<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\HealthCheckController;

/*
|--------------------------------------------------------------------------
| API Routes (Minimal MVP Version)
|--------------------------------------------------------------------------
|
| Minimal routes for testing core functionality
| Only includes Products API, Cart system, and Health endpoints
|
*/

// Health Check Endpoints (Public - critical for deployment)
Route::get('/health', [HealthCheckController::class, 'index']);

// Public API endpoints (Version 1)
Route::prefix('v1')->group(function () {
    
    // Products (Direct database queries for MVP testing)
    Route::get('/products', function () {
        try {
            $products = \App\Models\Product::select('id', 'name', 'slug', 'price', 'description')
                ->limit(10)
                ->get();
                
            return response()->json([
                'status' => 'success',
                'message' => 'Greek products from PostgreSQL',
                'data' => $products,
                'count' => $products->count(),
                'total' => \App\Models\Product::count()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve products: ' . $e->getMessage()
            ], 500);
        }
    });
    
    Route::get('/products/{id}', function ($id) {
        try {
            $product = \App\Models\Product::findOrFail($id);
            return response()->json([
                'status' => 'success',
                'data' => $product
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Product not found'
            ], 404);
        }
    });
    
    // Guest Cart System (SIMPLE MVP - Session-based)
    Route::post('/cart/guest', function (Request $request) {
        try {
            $sessionId = session()->getId();
            $cartId = 'cart_' . $sessionId . '_' . time();
            
            // Initialize empty cart in session
            session(['cart_' . $cartId => [
                'id' => $cartId,
                'items' => [],
                'created_at' => now(),
                'expires_at' => now()->addDays(7)
            ]]);
            
            return response()->json([
                'status' => 'success',
                'message' => 'Guest cart created successfully',
                'data' => [
                    'id' => $cartId,
                    'items' => [],
                    'itemCount' => 0,
                    'subtotal' => 0,
                    'total' => 0,
                    'currency' => 'EUR'
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to create cart: ' . $e->getMessage()
            ], 500);
        }
    });
    
    Route::get('/cart/{cartId}', function ($cartId) {
        try {
            $cart = session('cart_' . $cartId);
            
            if (!$cart) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Cart not found'
                ], 404);
            }
            
            // Calculate totals
            $itemCount = collect($cart['items'])->sum('quantity');
            $subtotal = collect($cart['items'])->sum(function ($item) {
                return $item['price'] * $item['quantity'];
            });
            
            return response()->json([
                'status' => 'success',
                'data' => [
                    'id' => $cartId,
                    'items' => $cart['items'],
                    'itemCount' => $itemCount,
                    'subtotal' => $subtotal,
                    'total' => $subtotal,
                    'currency' => 'EUR',
                    'created_at' => $cart['created_at'],
                    'expires_at' => $cart['expires_at']
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve cart: ' . $e->getMessage()
            ], 500);
        }
    });
    
    Route::post('/cart/{cartId}/items', function (Request $request, $cartId) {
        try {
            $validated = $request->validate([
                'product_id' => 'required|integer|exists:products,id',
                'quantity' => 'required|integer|min:1'
            ]);
            
            // Get product details
            $product = \App\Models\Product::find($validated['product_id']);
            if (!$product) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Product not found'
                ], 404);
            }
            
            $cart = session('cart_' . $cartId, [
                'id' => $cartId,
                'items' => [],
                'created_at' => now(),
                'expires_at' => now()->addDays(7)
            ]);
            
            // Check if item already exists in cart
            $existingKey = null;
            foreach ($cart['items'] as $key => $item) {
                if ($item['product_id'] == $validated['product_id']) {
                    $existingKey = $key;
                    break;
                }
            }
            
            if ($existingKey !== null) {
                // Update existing item
                $cart['items'][$existingKey]['quantity'] += $validated['quantity'];
            } else {
                // Add new item
                $cart['items'][] = [
                    'id' => 'item_' . time() . '_' . $validated['product_id'],
                    'product_id' => $validated['product_id'],
                    'product_name' => $product->name,
                    'slug' => $product->slug,
                    'price' => (float) $product->price,
                    'quantity' => $validated['quantity'],
                    'subtotal' => (float) $product->price * $validated['quantity'],
                    'added_at' => now()
                ];
            }
            
            // Save updated cart to session
            session(['cart_' . $cartId => $cart]);
            
            // Calculate totals
            $itemCount = collect($cart['items'])->sum('quantity');
            $subtotal = collect($cart['items'])->sum('subtotal');
            
            return response()->json([
                'status' => 'success',
                'message' => 'Item added to cart successfully',
                'data' => [
                    'id' => $cartId,
                    'items' => $cart['items'],
                    'itemCount' => $itemCount,
                    'subtotal' => $subtotal,
                    'total' => $subtotal,
                    'currency' => 'EUR'
                ]
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to add item to cart: ' . $e->getMessage()
            ], 500);
        }
    });
    
    Route::delete('/cart/{cartId}/items/{itemId}', function ($cartId, $itemId) {
        try {
            $cart = session('cart_' . $cartId);
            
            if (!$cart) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Cart not found'
                ], 404);
            }
            
            // Remove item from cart
            $cart['items'] = array_filter($cart['items'], function ($item) use ($itemId) {
                return $item['id'] !== $itemId;
            });
            
            // Reindex array
            $cart['items'] = array_values($cart['items']);
            
            // Save updated cart
            session(['cart_' . $cartId => $cart]);
            
            // Calculate totals
            $itemCount = collect($cart['items'])->sum('quantity');
            $subtotal = collect($cart['items'])->sum('subtotal');
            
            return response()->json([
                'status' => 'success',
                'message' => 'Item removed from cart successfully',
                'data' => [
                    'id' => $cartId,
                    'items' => $cart['items'],
                    'itemCount' => $itemCount,
                    'subtotal' => $subtotal,
                    'total' => $subtotal,
                    'currency' => 'EUR'
                ]
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to remove item from cart: ' . $e->getMessage()
            ], 500);
        }
    });
    
    // Basic user info
    Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
        return $request->user();
    });
});

// Default fallback for undefined routes
Route::fallback(function () {
    return response()->json([
        'status' => 'error',
        'message' => 'API endpoint not found in MVP version',
        'available_endpoints' => [
            'GET /api/health' => 'System health check',
            'GET /api/v1/products' => 'List products',
            'POST /api/v1/cart/guest' => 'Create guest cart',
            'GET /api/v1/cart/{id}' => 'Get cart details'
        ]
    ], 404);
});