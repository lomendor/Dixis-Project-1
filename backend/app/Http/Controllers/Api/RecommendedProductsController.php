<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Services\RecommendationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class RecommendedProductsController extends Controller
{
    protected $recommendationService;

    /**
     * Create a new controller instance.
     *
     * @param RecommendationService $recommendationService
     * @return void
     */
    public function __construct(RecommendationService $recommendationService)
    {
        $this->recommendationService = $recommendationService;
    }

    /**
     * Get recommended products based on various criteria.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getRecommendedProducts(Request $request)
    {
        try {
            // Get parameters from request
            $limit = $request->input('limit', 4); // Default to 4 products
            $categoryId = $request->input('category_id');
            $productId = $request->input('product_id');
            $cartItems = $request->input('cart_items');
            $viewedItems = $request->input('viewed_items');
            $excludeIds = $request->input('exclude_ids', []);
            $recommendationType = $request->input('type', 'default'); // default, similar, cart, browsing, personalized

            // Convert cart_items string to array if provided
            $cartItemIds = [];
            if ($cartItems) {
                $cartItemIds = is_array($cartItems) ? $cartItems : explode(',', $cartItems);
            }

            // Convert viewed_items string to array if provided
            $viewedItemIds = [];
            if ($viewedItems) {
                $viewedItemIds = is_array($viewedItems) ? $viewedItems : explode(',', $viewedItems);
            }

            // Convert exclude_ids to array if it's a string
            if (is_string($excludeIds)) {
                $excludeIds = explode(',', $excludeIds);
            }

            // Get products based on criteria and recommendation type
            $products = collect([]);

            switch ($recommendationType) {
                case 'similar':
                    if ($productId) {
                        $products = $this->recommendationService->getSimilarProducts($productId, $limit, $excludeIds);
                    } else {
                        throw new \Exception('Product ID is required for similar recommendations');
                    }
                    break;

                case 'cart':
                    if (!empty($cartItemIds)) {
                        $products = $this->recommendationService->getCartRecommendations($cartItemIds, $limit);
                    } else {
                        throw new \Exception('Cart items are required for cart recommendations');
                    }
                    break;

                case 'browsing':
                    if (!empty($viewedItemIds)) {
                        $products = $this->recommendationService->getBrowsingHistoryRecommendations($viewedItemIds, $limit);
                    } else {
                        throw new \Exception('Viewed items are required for browsing history recommendations');
                    }
                    break;

                case 'personalized':
                    $user = Auth::user();
                    if ($user) {
                        $products = $this->recommendationService->getPersonalizedRecommendations($user, $limit);
                    } else {
                        // Fallback to browsing history or popular products
                        if (!empty($viewedItemIds)) {
                            $products = $this->recommendationService->getBrowsingHistoryRecommendations($viewedItemIds, $limit);
                        } else {
                            $products = $this->recommendationService->getPopularProducts($limit, $excludeIds);
                        }
                    }
                    break;

                case 'seasonal':
                    $products = $this->recommendationService->getSeasonalRecommendations($limit);
                    break;

                default:
                    // Default behavior (backward compatibility)
                    if (!empty($cartItemIds)) {
                        $products = $this->recommendationService->getCartRecommendations($cartItemIds, $limit);
                    } elseif ($productId) {
                        $products = $this->recommendationService->getSimilarProducts($productId, $limit, $excludeIds);
                    } elseif ($categoryId) {
                        $products = $this->recommendationService->getCategoryProducts($categoryId, $limit, $excludeIds);
                    } else {
                        $products = $this->recommendationService->getPopularProducts($limit, $excludeIds);
                    }
                    break;
            }

            return response()->json($products);
        } catch (\Exception $e) {
            Log::error('Error fetching recommended products: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error fetching recommended products',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get frequently bought together products.
     *
     * @param Request $request
     * @param int $productId
     * @return \Illuminate\Http\JsonResponse
     */
    public function getFrequentlyBoughtTogether(Request $request, $productId)
    {
        try {
            $limit = $request->input('limit', 4);
            $products = $this->recommendationService->getFrequentlyBoughtTogether($productId, $limit);

            return response()->json($products);
        } catch (\Exception $e) {
            Log::error('Error fetching frequently bought together products: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error fetching frequently bought together products',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get personalized recommendations for the authenticated user.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getPersonalizedRecommendations(Request $request)
    {
        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json([
                    'message' => 'User not authenticated'
                ], 401);
            }

            $limit = $request->input('limit', 4);
            $products = $this->recommendationService->getPersonalizedRecommendations($user, $limit);

            return response()->json($products);
        } catch (\Exception $e) {
            Log::error('Error fetching personalized recommendations: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error fetching personalized recommendations',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get seasonal recommendations.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getSeasonalRecommendations(Request $request)
    {
        try {
            $limit = $request->input('limit', 4);
            $products = $this->recommendationService->getSeasonalRecommendations($limit);

            return response()->json($products);
        } catch (\Exception $e) {
            Log::error('Error fetching seasonal recommendations: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error fetching seasonal recommendations',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
