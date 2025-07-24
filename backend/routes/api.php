<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\HealthCheckController;
use App\Http\Controllers\Api\ProducerAnalyticsController;

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
    
    // Products with relationship filtering
    Route::get('/products', function (Request $request) {
        try {
            $perPage = $request->get('per_page', 10);
            $categoryId = $request->get('category_id');
            $producerId = $request->get('producer_id');
            $isFeatured = $request->get('is_featured');
            
            $query = \App\Models\Product::with(['category', 'producer'])
                ->select('id', 'name', 'slug', 'price', 'discount_price', 'description', 'category_id', 'producer_id', 'is_featured')
                ->where('is_active', true);
                
            // Apply filters
            if ($categoryId) {
                $query->where('category_id', $categoryId);
            }
            
            if ($producerId) {
                $query->where('producer_id', $producerId);
            }
            
            if ($isFeatured) {
                $query->where('is_featured', true);
            }
            
            $products = $query->limit($perPage)->get();
            
            // Transform for frontend
            $transformedProducts = $products->map(function($product) {
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'slug' => $product->slug,
                    'price' => (float) $product->price,
                    'discount_price' => $product->discount_price ? (float) $product->discount_price : null,
                    'description' => $product->description,
                    'is_featured' => (bool) $product->is_featured,
                    'category' => $product->category ? [
                        'id' => $product->category->id,
                        'name' => $product->category->name,
                        'slug' => $product->category->slug
                    ] : null,
                    'producer' => $product->producer ? [
                        'id' => $product->producer->id,
                        'business_name' => $product->producer->business_name
                    ] : null
                ];
            });
                
            return response()->json([
                'status' => 'success',
                'message' => 'Products with relationships retrieved successfully',
                'data' => $transformedProducts,
                'count' => $transformedProducts->count(),
                'total' => \App\Models\Product::where('is_active', true)->count(),
                'filters' => [
                    'category_id' => $categoryId,
                    'producer_id' => $producerId,
                    'is_featured' => $isFeatured
                ]
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
    
    // Categories API
    Route::get('/categories', function (Request $request) {
        try {
            $categories = \App\Models\Category::select('id', 'name', 'slug', 'description')
                ->withCount('products')
                ->orderBy('name')
                ->get();
                
            return response()->json([
                'status' => 'success',
                'message' => 'Categories retrieved successfully',
                'data' => $categories,
                'count' => $categories->count()
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve categories: ' . $e->getMessage()
            ], 500);
        }
    });

    // Basic user info
    Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
        return $request->user();
    });
    
    // Producers API (GET endpoint for frontend)
    Route::get('/producers', function (Request $request) {
        try {
            $perPage = $request->get('per_page', 10);
            $isFeatured = $request->get('is_featured');
            
            $query = \App\Models\Producer::with('products')
                ->select('id', 'business_name', 'description', 'bio', 'verified', 'rating', 'city', 'region')
                ->where('verified', true); // Only show verified producers
                
            if ($isFeatured) {
                // For featured, we can use rating or manually mark some as featured
                $query->whereNotNull('rating')->orderBy('rating', 'desc');
            }
            
            $producers = $query->limit($perPage)->get();
            
            // Transform for frontend compatibility
            $transformedProducers = $producers->map(function($producer) {
                return [
                    'id' => $producer->id,
                    'business_name' => $producer->business_name,
                    'slug' => 'producer-' . $producer->id, // Generate slug
                    'bio' => $producer->bio ?? $producer->description ?? 'Παραγωγός premium προϊόντων με παράδοση και ποιότητα.',
                    'location' => $producer->city ?? $producer->region ?? 'Ελλάδα',
                    'profile_image' => null, // Can be added later
                    'verification_status' => $producer->verified ? 'verified' : 'pending',
                    'rating' => $producer->rating ? (float) $producer->rating : 4.8,
                    'total_products' => $producer->products->where('is_active', true)->count()
                ];
            });
            
            return response()->json([
                'status' => 'success',
                'message' => 'Producers retrieved successfully',
                'data' => $transformedProducers,
                'count' => $transformedProducers->count(),
                'total' => \App\Models\Producer::where('verified', true)->count()
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve producers: ' . $e->getMessage()
            ], 500);
        }
    });

    // Producer Routes (MVP Testing)
    Route::post('/producer/login', function (Request $request) {
        try {
            $validated = $request->validate([
                'email' => 'required|email',
                'password' => 'required'
            ]);
            
            // For MVP testing, create a simple producer login
            // In production, this would use proper authentication
            if ($validated['email'] === 'producer@dixis.gr' && $validated['password'] === 'test123') {
                return response()->json([
                    'status' => 'success',
                    'message' => 'Producer logged in successfully',
                    'data' => [
                        'id' => 1,
                        'name' => 'Ελαιώνες Καλαμάτας',
                        'email' => 'producer@dixis.gr',
                        'role' => 'producer',
                        'token' => 'test-producer-token-' . time()
                    ]
                ]);
            }
            
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid credentials'
            ], 401);
            
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Login failed: ' . $e->getMessage()
            ], 500);
        }
    });
    
    // Producer Product Upload (MVP)
    Route::post('/producer/products', function (Request $request) {
        try {
            // Simple authorization check
            $authHeader = $request->header('Authorization');
            if (!$authHeader || !str_contains($authHeader, 'test-producer-token')) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized'
                ], 401);
            }
            
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'description' => 'required|string',
                'price' => 'required|numeric|min:0',
                'category' => 'required|string',
                'stock' => 'required|integer|min:0'
            ]);
            
            // Create new product
            $product = \App\Models\Product::create([
                'name' => $validated['name'],
                'slug' => \Str::slug($validated['name']),
                'description' => $validated['description'],
                'price' => $validated['price'],
                'producer_id' => 1, // Hardcoded for MVP
                'created_at' => now(),
                'updated_at' => now()
            ]);
            
            return response()->json([
                'status' => 'success',
                'message' => 'Product created successfully',
                'data' => [
                    'id' => $product->id,
                    'name' => $product->name,
                    'slug' => $product->slug,
                    'price' => $product->price,
                    'stock' => $product->stock_quantity
                ]
            ]);
            
        } catch (\ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to create product: ' . $e->getMessage()
            ], 500);
        }
    });
    
    // Stripe Payment Processing (MVP)
    Route::post('/payment/create-intent', function (Request $request) {
        try {
            $validated = $request->validate([
                'cart_id' => 'required|string',
                'amount' => 'required|numeric|min:0.50', // Minimum 0.50 EUR
                'currency' => 'string|in:EUR',
            ]);
            
            // Get cart to validate amount
            $cart = session('cart_' . $validated['cart_id']);
            if (!$cart) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Cart not found'
                ], 404);
            }
            
            // Calculate total from cart
            $total = collect($cart['items'])->sum('subtotal');
            
            // For MVP, create a mock payment intent
            // In production, this would use the real Stripe SDK
            $paymentIntent = [
                'id' => 'pi_test_' . time(),
                'amount' => $validated['amount'] * 100, // Convert to cents
                'currency' => $validated['currency'] ?? 'EUR',
                'status' => 'requires_payment_method',
                'client_secret' => 'pi_test_' . time() . '_secret_test',
                'created' => time(),
                'cart_id' => $validated['cart_id']
            ];
            
            return response()->json([
                'status' => 'success',
                'message' => 'Payment intent created',
                'data' => $paymentIntent
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to create payment intent: ' . $e->getMessage()
            ], 500);
        }
    });
    
    // Process Payment (MVP - Mock Success)
    Route::post('/payment/confirm', function (Request $request) {
        try {
            $validated = $request->validate([
                'payment_intent_id' => 'required|string',
                'cart_id' => 'required|string'
            ]);
            
            // Get cart for order creation
            $cart = session('cart_' . $validated['cart_id']);
            if (!$cart) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Cart not found'
                ], 404);
            }
            
            // For MVP, simulate successful payment
            // Create order record in database
            $orderData = [
                'user_id' => null, // Guest order
                'order_number' => 'DX' . date('Ymd') . rand(1000, 9999),
                'subtotal' => collect($cart['items'])->sum('subtotal'),
                'total_amount' => collect($cart['items'])->sum('subtotal'),
                'currency' => 'EUR',
                'payment_status' => 'completed',
                'payment_method' => 'stripe',
                'payment_intent_id' => $validated['payment_intent_id'],
                'created_at' => now(),
                'updated_at' => now()
            ];
            
            // For MVP, we'll simulate order creation
            $orderId = rand(100, 999);
            
            // Clear the cart after successful payment
            session()->forget('cart_' . $validated['cart_id']);
            
            return response()->json([
                'status' => 'success',
                'message' => 'Payment completed successfully',
                'data' => [
                    'order_id' => $orderId,
                    'order_number' => $orderData['order_number'],
                    'payment_status' => 'completed',
                    'total' => $orderData['total_amount'],
                    'currency' => 'EUR'
                ]
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Payment failed: ' . $e->getMessage()
            ], 500);
        }
    });
    
    // Email Testing Endpoint (MVP)
    Route::post('/order/confirmation-email', function (Request $request) {
        try {
            $validated = $request->validate([
                'order_number' => 'required|string',
                'customer_email' => 'required|email',
                'customer_name' => 'required|string',
                'total' => 'required|numeric|min:0',
                'items' => 'required|array'
            ]);
            
            // For MVP, simulate email sending
            // In production, this would use Laravel's Mail system
            $emailData = [
                'order_number' => $validated['order_number'],
                'customer' => [
                    'name' => $validated['customer_name'],
                    'email' => $validated['customer_email']
                ],
                'items' => $validated['items'],
                'total' => $validated['total'],
                'currency' => 'EUR',
                'sent_at' => now(),
                'email_template' => 'order-confirmation'
            ];
            
            // Simulate successful email send
            return response()->json([
                'status' => 'success',
                'message' => 'Order confirmation email sent successfully',
                'data' => [
                    'email_sent' => true,
                    'recipient' => $validated['customer_email'],
                    'order_number' => $validated['order_number'],
                    'sent_at' => $emailData['sent_at'],
                    'email_preview' => [
                        'subject' => 'Επιβεβαίωση Παραγγελίας #' . $validated['order_number'] . ' - Dixis Fresh',
                        'content' => 'Γεια σας ' . $validated['customer_name'] . ', η παραγγελία σας έχει επιβεβαιωθεί!',
                        'total' => '€' . number_format($validated['total'], 2),
                        'items_count' => count($validated['items'])
                    ]
                ]
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to send email: ' . $e->getMessage()
            ], 500);
        }
    });
    
    // Producer Analytics API (MVP)
    Route::get('/producer/analytics', [ProducerAnalyticsController::class, 'analytics']);
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