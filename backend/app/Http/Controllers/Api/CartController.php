<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\CartService;
use Illuminate\Http\Request;

class CartController extends Controller
{
    /**
     * The cart service instance.
     *
     * @var CartService
     */
    protected $cartService;

    /**
     * Create a new controller instance.
     *
     * @param CartService $cartService
     * @return void
     */
    public function __construct(CartService $cartService)
    {
        $this->cartService = $cartService;
    }

    /**
     * Get cart by ID.
     *
     * @param string $cartId
     * @return \Illuminate\Http\JsonResponse
     */
    public function getCart($cartId)
    {
        try {
            $result = $this->cartService->getCartById($cartId);

            if (!$result['success']) {
                return response()->json(['message' => $result['message']], $result['status']);
            }

            $formattedCart = $this->cartService->formatCartResponse($result['cart']);
            return response()->json($formattedCart);
        } catch (\Exception $e) {
            \Log::error('Error in getCart: ' . $e->getMessage());
            return response()->json(['message' => 'Error retrieving cart'], 500);
        }
    }

    /**
     * Get the current user's cart with its items.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getUserCart()
    {
        try {
            $cart = $this->cartService->getOrCreateCart();
            $formattedCart = $this->cartService->formatCartResponse($cart);

            return response()->json($formattedCart);
        } catch (\Exception $e) {
            \Log::error('Error in getUserCart: ' . $e->getMessage());
            return response()->json(['message' => 'Error retrieving user cart'], 500);
        }
    }

    /**
     * Add an item to the cart.
     *
     * @param Request $request
     * @param string $cartId
     * @return \Illuminate\Http\JsonResponse
     */
    public function addItem(Request $request, $cartId)
    {
        $validatedData = $request->validate([
            'product_id' => 'required|integer|exists:products,id',
            'quantity' => 'required|integer|min:1',
            'attributes' => 'nullable|array',
        ]);

        $result = $this->cartService->addItemToCart(
            $cartId,
            $validatedData['product_id'],
            $validatedData['quantity'],
            $validatedData['attributes'] ?? null
        );

        if (!$result['success']) {
            return response()->json(['message' => $result['message']], $result['status']);
        }

        $formattedCart = $this->cartService->formatCartResponse($result['cart']);
        return response()->json($formattedCart);
    }

    /**
     * Update the quantity of an item in the cart.
     *
     * @param Request $request
     * @param string $cartId
     * @param string $itemId
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateItem(Request $request, $cartId, $itemId)
    {
        $validatedData = $request->validate([
            'quantity' => 'required|integer|min:1',
        ]);

        $result = $this->cartService->updateItemInCart(
            $cartId,
            $itemId,
            $validatedData['quantity']
        );

        if (!$result['success']) {
            return response()->json(['message' => $result['message']], $result['status']);
        }

        $formattedCart = $this->cartService->formatCartResponse($result['cart']);
        return response()->json($formattedCart);
    }

    /**
     * Remove an item from the cart.
     *
     * @param string $cartId
     * @param string $itemId
     * @return \Illuminate\Http\JsonResponse
     */
    public function removeItem($cartId, $itemId)
    {
        $result = $this->cartService->removeItemFromCart($cartId, $itemId);

        if (!$result['success']) {
            return response()->json(['message' => $result['message']], $result['status']);
        }

        $formattedCart = $this->cartService->formatCartResponse($result['cart']);
        return response()->json($formattedCart);
    }

    /**
     * Clear all items from the cart.
     *
     * @param string $cartId
     * @return \Illuminate\Http\JsonResponse
     */
    public function clearCart($cartId)
    {
        $result = $this->cartService->clearCartById($cartId);

        if (!$result['success']) {
            return response()->json(['message' => $result['message']], $result['status']);
        }

        $formattedCart = $this->cartService->formatCartResponse($result['cart']);
        return response()->json($formattedCart);
    }

    /**
     * Create a guest cart.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function createGuestCart()
    {
        try {
            $cart = $this->cartService->createGuestCart();
            $formattedCart = $this->cartService->formatCartResponse($cart);

            return response()->json($formattedCart);
        } catch (\Exception $e) {
            \Log::error('Error in createGuestCart: ' . $e->getMessage());
            return response()->json(['message' => 'Error creating guest cart'], 500);
        }
    }

    /**
     * Add an item to the authenticated user's cart.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function addItemToUserCart(Request $request)
    {
        $validatedData = $request->validate([
            'product_id' => 'required|integer|exists:products,id',
            'quantity' => 'required|integer|min:1',
            'attributes' => 'nullable|array',
        ]);

        $result = $this->cartService->addItem(
            $validatedData['product_id'],
            $validatedData['quantity'],
            $validatedData['attributes'] ?? null
        );

        if (!$result['success']) {
            return response()->json(['message' => $result['message']], $result['status']);
        }

        $formattedCart = $this->cartService->formatCartResponse($result['cart']);
        return response()->json($formattedCart);
    }

    /**
     * Update an item in the authenticated user's cart.
     *
     * @param Request $request
     * @param string $itemId
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateUserCartItem(Request $request, $itemId)
    {
        $validatedData = $request->validate([
            'quantity' => 'required|integer|min:1',
        ]);

        $result = $this->cartService->updateItem($itemId, $validatedData['quantity']);

        if (!$result['success']) {
            return response()->json(['message' => $result['message']], $result['status']);
        }

        $formattedCart = $this->cartService->formatCartResponse($result['cart']);
        return response()->json($formattedCart);
    }

    /**
     * Remove an item from the authenticated user's cart.
     *
     * @param string $itemId
     * @return \Illuminate\Http\JsonResponse
     */
    public function removeUserCartItem($itemId)
    {
        $result = $this->cartService->removeItem($itemId);

        if (!$result['success']) {
            return response()->json(['message' => $result['message']], $result['status']);
        }

        $formattedCart = $this->cartService->formatCartResponse($result['cart']);
        return response()->json($formattedCart);
    }

    /**
     * Clear the authenticated user's cart.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function clearUserCart()
    {
        $result = $this->cartService->clearCart();

        if (!$result['success']) {
            return response()->json(['message' => $result['message']], $result['status']);
        }

        $formattedCart = $this->cartService->formatCartResponse($result['cart']);
        return response()->json($formattedCart);
    }

    /**
     * Merge guest cart with user cart.
     *
     * @param string $guestCartId
     * @return \Illuminate\Http\JsonResponse
     */
    public function mergeGuestCart($guestCartId)
    {
        try {
            $result = $this->cartService->mergeGuestCart($guestCartId);

            if (!$result['success']) {
                return response()->json(['message' => $result['message']], $result['status']);
            }

            $formattedCart = $this->cartService->formatCartResponse($result['cart']);
            return response()->json($formattedCart);
        } catch (\Exception $e) {
            \Log::error('Error in mergeGuestCart: ' . $e->getMessage());
            return response()->json(['message' => 'Error merging guest cart'], 500);
        }
    }

    /**
     * Apply a coupon to the cart.
     * (Placeholder for future implementation)
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function applyCoupon(Request $request)
    {
        // This is a placeholder for future coupon functionality
        return response()->json(['message' => 'Coupon functionality not implemented yet.'], 501);
    }
}
