<?php

namespace App\Services;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;

class CartService
{
    /**
     * Get the current user's cart or create a new one.
     *
     * @return Cart
     */
    public function getOrCreateCart(): Cart
    {
        try {
            $user = Auth::user();

            if ($user) {
                // For authenticated users, get their cart or create a new one
                $cart = Cart::firstOrCreate(
                    ['user_id' => $user->id],
                    ['session_id' => null, 'expires_at' => null]
                );

                // If there was a session cart, merge it with the user's cart
                $sessionId = Session::getId();
                $sessionCart = Cart::where('session_id', $sessionId)->first();

                if ($sessionCart && $sessionCart->id !== $cart->id) {
                    // Move items from session cart to user cart
                    foreach ($sessionCart->items as $item) {
                        $existingItem = CartItem::where('cart_id', $cart->id)
                                             ->where('product_id', $item->product_id)
                                             ->first();

                        if ($existingItem) {
                            // Update quantity if item already exists
                            $existingItem->quantity += $item->quantity;
                            $existingItem->save();
                        } else {
                            // Create new item in user's cart
                            $newItem = $item->replicate();
                            $newItem->cart_id = $cart->id;
                            $newItem->save();
                        }
                    }

                    // Delete the session cart
                    $sessionCart->items()->delete();
                    $sessionCart->delete();
                }
            } else {
                // For guests, use session ID to identify the cart
                $sessionId = Session::getId();

                // Create a cart for this session if it doesn't exist
                $cart = Cart::firstOrCreate(
                    ['session_id' => $sessionId],
                    ['user_id' => null, 'expires_at' => now()->addDays(30)]
                );
            }

            return $cart;
        } catch (\Exception $e) {
            // Log the error
            \Log::error('Error in getOrCreateCart: ' . $e->getMessage());

            // Create a new session cart as fallback
            $sessionId = Session::getId();
            return Cart::firstOrCreate(
                ['session_id' => $sessionId],
                ['user_id' => null, 'expires_at' => now()->addDays(30)]
            );
        }
    }

    /**
     * Add a product to the cart.
     *
     * @param int $productId
     * @param int $quantity
     * @param array|null $attributes
     * @return array
     */
    public function addItem(int $productId, int $quantity, ?array $attributes = null): array
    {
        // Get the product
        $product = Product::findOrFail($productId);

        // Check if product is active
        if (!$product->is_active) {
            return [
                'success' => false,
                'message' => 'Product is not available.',
                'status' => 400
            ];
        }

        // Check if there's enough stock
        if ($product->stock < $quantity) {
            return [
                'success' => false,
                'message' => 'Not enough stock available.',
                'available_stock' => $product->stock,
                'status' => 400
            ];
        }

        // Get or create the cart
        $cart = $this->getOrCreateCart();

        // Check if the product is already in the cart
        $cartItem = CartItem::where('cart_id', $cart->id)
                          ->where('product_id', $product->id)
                          ->first();

        // Get the current price (use discount_price if available)
        $price = $product->discount_price ?? $product->price;

        if ($cartItem) {
            // Update quantity if the product is already in the cart
            $newQuantity = $cartItem->quantity + $quantity;

            // Check if the new quantity exceeds the available stock
            if ($newQuantity > $product->stock) {
                return [
                    'success' => false,
                    'message' => 'Cannot add more of this product. Stock limit reached.',
                    'available_stock' => $product->stock,
                    'current_quantity' => $cartItem->quantity,
                    'status' => 400
                ];
            }

            $cartItem->quantity = $newQuantity;
            $cartItem->price = $price; // Update price in case it changed
            $cartItem->attributes = $attributes ?? $cartItem->attributes;
            $cartItem->save();
        } else {
            // Add new item to the cart
            $cartItem = new CartItem([
                'cart_id' => $cart->id,
                'product_id' => $product->id,
                'quantity' => $quantity,
                'price' => $price,
                'attributes' => $attributes,
            ]);
            $cartItem->save();
        }

        return [
            'success' => true,
            'cart' => $cart->fresh(),
            'status' => 200
        ];
    }

    /**
     * Add item to a specific cart by ID.
     *
     * @param string $cartId
     * @param int $productId
     * @param int $quantity
     * @param array|null $attributes
     * @return array
     */
    public function addItemToCart(string $cartId, int $productId, int $quantity, ?array $attributes = null): array
    {
        // Find the cart
        $cart = Cart::find($cartId);
        
        if (!$cart) {
            return [
                'success' => false,
                'message' => 'Cart not found.',
                'status' => 404
            ];
        }

        // Get the product
        $product = Product::find($productId);
        
        if (!$product) {
            return [
                'success' => false,
                'message' => 'Product not found.',
                'status' => 404
            ];
        }

        // Check if product is active
        if (!$product->is_active) {
            return [
                'success' => false,
                'message' => 'Product is not available.',
                'status' => 400
            ];
        }

        // Check if there's enough stock
        $stockField = $product->stock_quantity ?? $product->stock ?? 0;
        if ($stockField < $quantity) {
            return [
                'success' => false,
                'message' => 'Not enough stock available.',
                'available_stock' => $stockField,
                'status' => 400
            ];
        }

        // Check if the product is already in the cart
        $cartItem = CartItem::where('cart_id', $cart->id)
                          ->where('product_id', $product->id)
                          ->first();

        // Get the current price (use discount_price if available)
        $price = $product->discount_price ?? $product->price;

        if ($cartItem) {
            // Update quantity if the product is already in the cart
            $newQuantity = $cartItem->quantity + $quantity;

            // Check if the new quantity exceeds the available stock
            if ($newQuantity > $stockField) {
                return [
                    'success' => false,
                    'message' => 'Cannot add more of this product. Stock limit reached.',
                    'available_stock' => $stockField,
                    'current_quantity' => $cartItem->quantity,
                    'status' => 400
                ];
            }

            $cartItem->quantity = $newQuantity;
            $cartItem->price = $price; // Update price in case it changed
            $cartItem->save();
        } else {
            // Create a new cart item
            $cartItem = new CartItem([
                'cart_id' => $cart->id,
                'product_id' => $product->id,
                'quantity' => $quantity,
                'price' => $price,
                'attributes' => $attributes,
            ]);
            $cartItem->save();
        }

        return [
            'success' => true,
            'cart' => $cart->fresh(),
            'status' => 200
        ];
    }

    /**
     * Update the quantity of an item in the cart.
     *
     * @param int $itemId
     * @param int $quantity
     * @return array
     */
    public function updateItem(int $itemId, int $quantity): array
    {
        // Get the cart
        $cart = $this->getOrCreateCart();

        // Find the cart item
        $cartItem = CartItem::where('id', $itemId)
                          ->where('cart_id', $cart->id)
                          ->first();

        if (!$cartItem) {
            return [
                'success' => false,
                'message' => 'Cart item not found.',
                'status' => 404
            ];
        }

        // Get the product
        $product = Product::findOrFail($cartItem->product_id);

        // Check if there's enough stock
        if ($product->stock < $quantity) {
            return [
                'success' => false,
                'message' => 'Not enough stock available.',
                'available_stock' => $product->stock,
                'status' => 400
            ];
        }

        // Update the quantity
        $cartItem->quantity = $quantity;
        $cartItem->save();

        return [
            'success' => true,
            'cart' => $cart->fresh(),
            'status' => 200
        ];
    }

    /**
     * Remove an item from the cart.
     *
     * @param int $itemId
     * @return array
     */
    public function removeItem(int $itemId): array
    {
        // Get the cart
        $cart = $this->getOrCreateCart();

        // Find the cart item
        $cartItem = CartItem::where('id', $itemId)
                          ->where('cart_id', $cart->id)
                          ->first();

        if (!$cartItem) {
            return [
                'success' => false,
                'message' => 'Cart item not found.',
                'status' => 404
            ];
        }

        // Delete the cart item
        $cartItem->delete();

        return [
            'success' => true,
            'cart' => $cart->fresh(),
            'status' => 200
        ];
    }

    /**
     * Clear all items from the cart.
     *
     * @return array
     */
    public function clearCart(): array
    {
        // Get the cart
        $cart = $this->getOrCreateCart();

        // Delete all items
        $cart->items()->delete();

        return [
            'success' => true,
            'cart' => $cart->fresh(),
            'status' => 200
        ];
    }

    /**
     * Get cart by ID.
     *
     * @param string $cartId
     * @return array
     */
    public function getCartById(string $cartId): array
    {
        // Find the cart
        $cart = Cart::find($cartId);

        if (!$cart) {
            return [
                'success' => false,
                'message' => 'Cart not found.',
                'status' => 404
            ];
        }

        return [
            'success' => true,
            'cart' => $cart,
            'status' => 200
        ];
    }

    /**
     * Create a guest cart.
     *
     * @return Cart
     */
    public function createGuestCart(): Cart
    {
        $sessionId = Session::getId();

        // Create a new guest cart
        $cart = Cart::create([
            'user_id' => null,
            'session_id' => $sessionId,
            'expires_at' => now()->addDays(7) // Guest carts expire after 7 days
        ]);

        return $cart;
    }

    /**
     * Merge guest cart with user cart.
     *
     * @param string $guestCartId
     * @return array
     */
    public function mergeGuestCart(string $guestCartId): array
    {
        $user = Auth::user();
        
        if (!$user) {
            return [
                'success' => false,
                'message' => 'User must be authenticated to merge cart.',
                'status' => 401
            ];
        }

        // Find the guest cart
        $guestCart = Cart::find($guestCartId);
        
        if (!$guestCart || $guestCart->user_id !== null) {
            return [
                'success' => false,
                'message' => 'Guest cart not found.',
                'status' => 404
            ];
        }

        // Get or create user's cart
        $userCart = Cart::firstOrCreate(
            ['user_id' => $user->id],
            ['session_id' => null, 'expires_at' => null]
        );

        // Move items from guest cart to user cart
        foreach ($guestCart->items as $item) {
            $existingItem = CartItem::where('cart_id', $userCart->id)
                                 ->where('product_id', $item->product_id)
                                 ->first();

            if ($existingItem) {
                // Update quantity if item already exists
                $existingItem->quantity += $item->quantity;
                $existingItem->save();
            } else {
                // Create new item in user's cart
                $newItem = $item->replicate();
                $newItem->cart_id = $userCart->id;
                $newItem->save();
            }
        }

        // Delete the guest cart
        $guestCart->delete();

        return [
            'success' => true,
            'cart' => $userCart->fresh(),
            'status' => 200
        ];
    }

    /**
     * Remove item from a specific cart by ID.
     *
     * @param string $cartId
     * @param string $itemId
     * @return array
     */
    public function removeItemFromCart(string $cartId, string $itemId): array
    {
        // Find the cart
        $cart = Cart::find($cartId);
        
        if (!$cart) {
            return [
                'success' => false,
                'message' => 'Cart not found.',
                'status' => 404
            ];
        }

        // Find the cart item
        $cartItem = CartItem::where('id', $itemId)
                          ->where('cart_id', $cart->id)
                          ->first();

        if (!$cartItem) {
            return [
                'success' => false,
                'message' => 'Cart item not found.',
                'status' => 404
            ];
        }

        // Delete the cart item
        $cartItem->delete();

        return [
            'success' => true,
            'cart' => $cart->fresh(),
            'status' => 200
        ];
    }

    /**
     * Update item quantity in a specific cart by ID.
     *
     * @param string $cartId
     * @param string $itemId
     * @param int $quantity
     * @return array
     */
    public function updateItemInCart(string $cartId, string $itemId, int $quantity): array
    {
        // Find the cart
        $cart = Cart::find($cartId);
        
        if (!$cart) {
            return [
                'success' => false,
                'message' => 'Cart not found.',
                'status' => 404
            ];
        }

        // Find the cart item
        $cartItem = CartItem::where('id', $itemId)
                          ->where('cart_id', $cart->id)
                          ->first();

        if (!$cartItem) {
            return [
                'success' => false,
                'message' => 'Cart item not found.',
                'status' => 404
            ];
        }

        // Get product to check stock
        $product = Product::find($cartItem->product_id);
        if (!$product) {
            return [
                'success' => false,
                'message' => 'Product not found.',
                'status' => 404
            ];
        }

        // Check stock
        $stockField = $product->stock_quantity ?? $product->stock ?? 0;
        if ($quantity > $stockField) {
            return [
                'success' => false,
                'message' => 'Not enough stock available.',
                'available_stock' => $stockField,
                'status' => 400
            ];
        }

        // Update the quantity
        $cartItem->quantity = $quantity;
        $cartItem->save();

        return [
            'success' => true,
            'cart' => $cart->fresh(),
            'status' => 200
        ];
    }

    /**
     * Clear all items from a specific cart by ID.
     *
     * @param string $cartId
     * @return array
     */
    public function clearCartById(string $cartId): array
    {
        // Find the cart
        $cart = Cart::find($cartId);
        
        if (!$cart) {
            return [
                'success' => false,
                'message' => 'Cart not found.',
                'status' => 404
            ];
        }

        // Delete all items
        $cart->items()->delete();

        return [
            'success' => true,
            'cart' => $cart->fresh(),
            'status' => 200
        ];
    }

    /**
     * Format the cart for the API response.
     *
     * @param Cart $cart
     * @return array
     */
    public function formatCartResponse(Cart $cart): array
    {
        try {
            // Load cart items with their products
            $cart->load(['items.product' => function ($query) {
                $query->select('id', 'name', 'slug', 'main_image', 'price', 'discount_price', 'stock_quantity');
            }]);

            $items = $cart->items->map(function ($item) use ($cart) {
                $product = $item->product;

                // Check if product exists
                if (!$product) {
                    // Remove the item from the cart since the product no longer exists
                    $item->delete();
                    return null;
                }

                $price = $product->discount_price ?? $product->price;

                return [
                    'id' => (string) $item->id,
                    'cartId' => (string) $cart->id,
                    'productId' => (string) $product->id,
                    'productName' => $product->name,
                    'slug' => $product->slug,
                    'image' => $product->main_image,
                    'price' => (float) $price,
                    'originalPrice' => $product->discount_price ? (float) $product->price : null,
                    'quantity' => (int) $item->quantity,
                    'subtotal' => (float) ($price * $item->quantity),
                    'attributes' => $item->attributes ?? [],
                    'stock' => (int) ($product->stock_quantity ?? 0),
                    'addedAt' => $item->created_at?->format('c'),
                    'updatedAt' => $item->updated_at?->format('c'),
                ];
            })->filter()->values(); // Remove null items and reindex

            $itemCount = $items->sum('quantity');
            $subtotal = $items->sum('subtotal');

            // Format the response to match frontend types
            return [
                'id' => (string) $cart->id,
                'userId' => $cart->user_id ? (string) $cart->user_id : null,
                'sessionId' => $cart->session_id,
                'items' => $items->toArray(),
                'itemCount' => $itemCount,
                'subtotal' => (float) $subtotal,
                'total' => (float) $subtotal, // For now, total = subtotal (no taxes/shipping)
                'currency' => 'EUR',
                'expiresAt' => $cart->expires_at?->format('c'),
                'createdAt' => $cart->created_at->format('c'),
                'updatedAt' => $cart->updated_at->format('c'),
            ];
        } catch (\Exception $e) {
            // Log the error
            \Log::error('Error in formatCartResponse: ' . $e->getMessage());

            // Return an empty cart as fallback
            return [
                'id' => (string) $cart->id,
                'userId' => $cart->user_id ? (string) $cart->user_id : null,
                'sessionId' => $cart->session_id,
                'items' => [],
                'itemCount' => 0,
                'subtotal' => 0.0,
                'total' => 0.0,
                'currency' => 'EUR',
                'expiresAt' => $cart->expires_at?->format('c'),
                'createdAt' => $cart->created_at->format('c'),
                'updatedAt' => $cart->updated_at->format('c'),
            ];
        }
    }
}
