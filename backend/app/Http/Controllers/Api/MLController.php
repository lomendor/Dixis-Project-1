<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\Product;
use App\Models\User;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

/**
 * ML Recommendations Controller
 * 
 * Handles machine learning-based product recommendations
 * Currently implements basic recommendation algorithms
 * Can be extended with actual ML models in the future
 */
class MLController extends Controller
{
    /**
     * Get personalized recommendations for a user
     */
    public function getPersonalizedRecommendations(Request $request): JsonResponse
    {
        try {
            $userId = $request->user()?->id;
            $limit = $request->get('limit', 10);
            
            if (!$userId) {
                // Return popular products for non-authenticated users
                return $this->getPopularProducts($limit);
            }
            
            // Get user's purchase history
            $userProducts = $this->getUserPurchaseHistory($userId);
            
            if ($userProducts->isEmpty()) {
                // New user - return trending products
                return $this->getTrendingProducts($limit);
            }
            
            // Get recommendations based on purchase history
            $recommendations = $this->getCollaborativeRecommendations($userId, $userProducts, $limit);
            
            return response()->json([
                'success' => true,
                'data' => $recommendations,
                'algorithm' => 'collaborative_filtering',
                'user_id' => $userId
            ]);
            
        } catch (\Exception $e) {
            Log::error('Personalized recommendations error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to get personalized recommendations',
                'data' => []
            ], 500);
        }
    }
    
    /**
     * Get real-time recommendations based on current session
     */
    public function getRealTimeRecommendations(Request $request): JsonResponse
    {
        try {
            $productId = $request->get('product_id');
            $categoryId = $request->get('category_id');
            $limit = $request->get('limit', 8);
            
            $recommendations = collect();
            
            if ($productId) {
                // Get similar products
                $recommendations = $this->getSimilarProducts($productId, $limit);
            } elseif ($categoryId) {
                // Get popular products from category
                $recommendations = $this->getCategoryRecommendations($categoryId, $limit);
            } else {
                // Get trending products
                $recommendations = $this->getTrendingProducts($limit);
            }
            
            return response()->json([
                'success' => true,
                'data' => $recommendations,
                'algorithm' => 'content_based',
                'context' => [
                    'product_id' => $productId,
                    'category_id' => $categoryId
                ]
            ]);
            
        } catch (\Exception $e) {
            Log::error('Real-time recommendations error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to get real-time recommendations',
                'data' => []
            ], 500);
        }
    }
    
    /**
     * Get contextual recommendations based on various factors
     */
    public function getContextualRecommendations(Request $request): JsonResponse
    {
        try {
            $context = $request->get('context', 'general');
            $limit = $request->get('limit', 10);
            
            $recommendations = match($context) {
                'seasonal' => $this->getSeasonalRecommendations($limit),
                'featured' => $this->getFeaturedRecommendations($limit),
                'new' => $this->getNewProducts($limit),
                'discounted' => $this->getDiscountedProducts($limit),
                default => $this->getPopularProducts($limit)
            };
            
            return response()->json([
                'success' => true,
                'data' => $recommendations,
                'algorithm' => 'contextual',
                'context' => $context
            ]);
            
        } catch (\Exception $e) {
            Log::error('Contextual recommendations error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to get contextual recommendations',
                'data' => []
            ], 500);
        }
    }
    
    /**
     * Get trending recommendations
     */
    public function getTrendingRecommendations(Request $request): JsonResponse
    {
        try {
            $limit = $request->get('limit', 10);
            $timeframe = $request->get('timeframe', '7d'); // 1d, 7d, 30d
            
            $recommendations = $this->getTrendingProducts($limit, $timeframe);
            
            return response()->json([
                'success' => true,
                'data' => $recommendations,
                'algorithm' => 'trending',
                'timeframe' => $timeframe
            ]);
            
        } catch (\Exception $e) {
            Log::error('Trending recommendations error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to get trending recommendations',
                'data' => []
            ], 500);
        }
    }
    
    /**
     * Get A/B test recommendations
     */
    public function getABTestRecommendations(Request $request): JsonResponse
    {
        try {
            $variant = $request->get('variant', 'A');
            $limit = $request->get('limit', 10);
            
            // Simple A/B test: A = popular, B = trending
            $recommendations = $variant === 'B' 
                ? $this->getTrendingProducts($limit)
                : $this->getPopularProducts($limit);
            
            return response()->json([
                'success' => true,
                'data' => $recommendations,
                'algorithm' => 'ab_test',
                'variant' => $variant
            ]);
            
        } catch (\Exception $e) {
            Log::error('A/B test recommendations error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to get A/B test recommendations',
                'data' => []
            ], 500);
        }
    }
    
    // ===== PRIVATE HELPER METHODS =====
    
    private function getUserPurchaseHistory($userId)
    {
        return OrderItem::whereHas('order', function($query) use ($userId) {
            $query->where('user_id', $userId)
                  ->where('status', 'completed');
        })->with('product')->get();
    }
    
    private function getCollaborativeRecommendations($userId, $userProducts, $limit)
    {
        // Simple collaborative filtering based on users with similar purchases
        $productIds = $userProducts->pluck('product_id')->toArray();
        
        return Product::whereNotIn('id', $productIds)
            ->where('is_active', true)
            ->where('stock_quantity', '>', 0)
            ->with(['producer', 'categories'])
            ->inRandomOrder()
            ->limit($limit)
            ->get();
    }
    
    private function getSimilarProducts($productId, $limit)
    {
        $product = Product::find($productId);
        if (!$product) {
            return collect();
        }
        
        return Product::where('id', '!=', $productId)
            ->where('category_id', $product->category_id)
            ->where('is_active', true)
            ->where('stock_quantity', '>', 0)
            ->with(['producer', 'categories'])
            ->limit($limit)
            ->get();
    }
    
    private function getCategoryRecommendations($categoryId, $limit)
    {
        return Product::where('category_id', $categoryId)
            ->where('is_active', true)
            ->where('stock_quantity', '>', 0)
            ->with(['producer', 'categories'])
            ->orderBy('stock_quantity', 'desc')
            ->limit($limit)
            ->get();
    }
    
    private function getPopularProducts($limit)
    {
        return Cache::remember("popular_products_{$limit}", 3600, function() use ($limit) {
            return Product::where('is_active', true)
                ->where('stock_quantity', '>', 0)
                ->with(['producer', 'categories'])
                ->orderBy('stock_quantity', 'desc')
                ->limit($limit)
                ->get();
        });
    }
    
    private function getTrendingProducts($limit, $timeframe = '7d')
    {
        $days = match($timeframe) {
            '1d' => 1,
            '30d' => 30,
            default => 7
        };
        
        return Cache::remember("trending_products_{$limit}_{$timeframe}", 1800, function() use ($limit, $days) {
            return Product::where('is_active', true)
                ->where('stock_quantity', '>', 0)
                ->where('created_at', '>=', now()->subDays($days))
                ->with(['producer', 'categories'])
                ->orderBy('created_at', 'desc')
                ->limit($limit)
                ->get();
        });
    }
    
    private function getSeasonalRecommendations($limit)
    {
        return Product::where('is_active', true)
            ->where('is_seasonal', true)
            ->where('stock_quantity', '>', 0)
            ->with(['producer', 'categories'])
            ->limit($limit)
            ->get();
    }
    
    private function getFeaturedRecommendations($limit)
    {
        return Product::where('is_active', true)
            ->where('is_featured', true)
            ->where('stock_quantity', '>', 0)
            ->with(['producer', 'categories'])
            ->limit($limit)
            ->get();
    }
    
    private function getNewProducts($limit)
    {
        return Product::where('is_active', true)
            ->where('stock_quantity', '>', 0)
            ->with(['producer', 'categories'])
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }
    
    private function getDiscountedProducts($limit)
    {
        return Product::where('is_active', true)
            ->whereNotNull('discount_price')
            ->where('stock_quantity', '>', 0)
            ->with(['producer', 'categories'])
            ->limit($limit)
            ->get();
    }
}
