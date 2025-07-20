<?php

namespace App\Services\ML;

use App\Services\RecommendationService;
use App\Services\Analytics\UserBehaviorTracker;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Collection;

/**
 * Machine Learning Enhanced Recommendation Service
 * Extends the existing RecommendationService with ML algorithms
 */
class MLRecommendationService extends RecommendationService
{
    private UserBehaviorTracker $behaviorTracker;

    public function __construct(UserBehaviorTracker $behaviorTracker)
    {
        $this->behaviorTracker = $behaviorTracker;
    }

    /**
     * Get ML-powered personalized recommendations
     */
    public function getMLPersonalizedRecommendations(User $user, int $limit = 8): Collection
    {
        try {
            $cacheKey = "ml_recommendations_{$user->id}_{$limit}";
            
            return Cache::remember($cacheKey, 1800, function () use ($user, $limit) {
                // Get user behavior profile
                $userProfile = $this->behaviorTracker->getUserProfile($user->id);
                
                // Get collaborative filtering recommendations
                $collaborativeRecs = $this->getCollaborativeRecommendations($user->id, $limit);
                
                // Get content-based recommendations
                $contentRecs = $this->getContentBasedRecommendations($user->id, $userProfile, $limit);
                
                // Hybrid approach: combine both methods
                $hybridRecs = $this->combineRecommendations($collaborativeRecs, $contentRecs, $userProfile);
                
                // Apply business rules and filters
                $finalRecs = $this->applyBusinessRules($hybridRecs, $user, $limit);
                
                // Track recommendation performance
                $this->trackRecommendationServed($user->id, $finalRecs->pluck('id')->toArray());
                
                return $finalRecs;
            });
        } catch (\Exception $e) {
            Log::error('ML Recommendation error: ' . $e->getMessage());
            // Fallback to original recommendation service
            return parent::getPersonalizedRecommendations($user, $limit);
        }
    }

    /**
     * Get real-time recommendations based on current session
     */
    public function getRealTimeRecommendations(string $sessionId, ?int $userId = null, int $limit = 6): Collection
    {
        try {
            // Get current session behavior
            $sessionProfile = $this->behaviorTracker->getUserProfile($userId, $sessionId);
            
            if (empty($sessionProfile['viewed_products'])) {
                return $this->getPopularProducts($limit);
            }

            // Get recently viewed products
            $recentProducts = collect($sessionProfile['viewed_products'])->take(5);
            
            // Generate recommendations based on recent activity
            $recommendations = collect();
            
            foreach ($recentProducts as $productId) {
                $similar = $this->getSimilarProducts($productId, 3);
                $recommendations = $recommendations->merge($similar);
            }

            // Remove duplicates and recently viewed products
            $recommendations = $recommendations->unique('id')
                ->whereNotIn('id', $sessionProfile['viewed_products'])
                ->take($limit);

            // If not enough recommendations, add popular products
            if ($recommendations->count() < $limit) {
                $needed = $limit - $recommendations->count();
                $excludeIds = $recommendations->pluck('id')->merge($sessionProfile['viewed_products'])->toArray();
                $popular = $this->getPopularProducts($needed, $excludeIds);
                $recommendations = $recommendations->merge($popular);
            }

            return $recommendations->take($limit);
        } catch (\Exception $e) {
            Log::error('Real-time recommendation error: ' . $e->getMessage());
            return $this->getPopularProducts($limit);
        }
    }

    /**
     * Get contextual recommendations based on current product/category
     */
    public function getContextualRecommendations(array $context, int $limit = 6): Collection
    {
        try {
            $recommendations = collect();

            // Product page context
            if (isset($context['product_id'])) {
                $productRecs = $this->getProductContextRecommendations($context['product_id'], $context);
                $recommendations = $recommendations->merge($productRecs);
            }

            // Category page context
            if (isset($context['category_id'])) {
                $categoryRecs = $this->getCategoryContextRecommendations($context['category_id'], $context);
                $recommendations = $recommendations->merge($categoryRecs);
            }

            // Search context
            if (isset($context['search_query'])) {
                $searchRecs = $this->getSearchContextRecommendations($context['search_query'], $context);
                $recommendations = $recommendations->merge($searchRecs);
            }

            // Cart context
            if (isset($context['cart_items'])) {
                $cartRecs = $this->getCartRecommendations($context['cart_items'], $limit);
                $recommendations = $recommendations->merge($cartRecs);
            }

            return $recommendations->unique('id')->take($limit);
        } catch (\Exception $e) {
            Log::error('Contextual recommendation error: ' . $e->getMessage());
            return $this->getPopularProducts($limit);
        }
    }

    /**
     * Get trending recommendations with ML scoring
     */
    public function getTrendingRecommendations(int $limit = 8, int $hours = 24): Collection
    {
        try {
            $cacheKey = "ml_trending_{$limit}_{$hours}h";
            
            return Cache::remember($cacheKey, 900, function () use ($limit, $hours) {
                // Get trending products from behavior tracker
                $trendingData = $this->behaviorTracker->getTrendingProducts($limit * 2, $hours);
                
                if (empty($trendingData)) {
                    return $this->getPopularProducts($limit);
                }

                // Calculate ML-based trending score
                $scoredProducts = collect($trendingData)->map(function ($item) use ($hours) {
                    $product = Product::with(['producer', 'categories', 'images'])->find($item->product_id);
                    
                    if (!$product || !$product->is_active) {
                        return null;
                    }

                    // Calculate trending score
                    $trendingScore = $this->calculateTrendingScore($product, $item->view_count, $hours);
                    $product->trending_score = $trendingScore;
                    
                    return $product;
                })->filter()->sortByDesc('trending_score');

                return $scoredProducts->take($limit)->values();
            });
        } catch (\Exception $e) {
            Log::error('Trending recommendation error: ' . $e->getMessage());
            return $this->getPopularProducts($limit);
        }
    }

    /**
     * Private helper methods
     */
    private function getCollaborativeRecommendations(int $userId, int $limit): Collection
    {
        // Simplified collaborative filtering
        // In a full implementation, this would use the CollaborativeFilteringEngine
        return $this->getPersonalizedRecommendations(User::find($userId), $limit);
    }

    private function getContentBasedRecommendations(int $userId, array $userProfile, int $limit): Collection
    {
        // Simplified content-based filtering
        // In a full implementation, this would use the ContentBasedEngine
        $preferredCategories = $userProfile['preferred_categories'] ?? [];
        
        if (empty($preferredCategories)) {
            return collect();
        }

        return $this->getCategoryProducts($preferredCategories[0], $limit);
    }

    private function combineRecommendations(Collection $collaborative, Collection $content, array $userProfile): Collection
    {
        // Weight recommendations based on user activity level
        $activityScore = $userProfile['activity_score'] ?? 0;
        
        // High activity users get more collaborative filtering
        $collaborativeWeight = min(0.8, $activityScore / 100);
        $contentWeight = 1 - $collaborativeWeight;

        // Combine recommendations with weights
        $combined = collect();
        
        // Add collaborative recommendations with weight
        $collaborative->each(function ($product, $index) use ($combined, $collaborativeWeight) {
            $product->recommendation_score = (1 - ($index * 0.1)) * $collaborativeWeight;
            $combined->push($product);
        });

        // Add content-based recommendations with weight
        $content->each(function ($product, $index) use ($combined, $contentWeight) {
            $existing = $combined->firstWhere('id', $product->id);
            
            if ($existing) {
                // Boost score if product appears in both methods
                $existing->recommendation_score += (1 - ($index * 0.1)) * $contentWeight * 1.5;
            } else {
                $product->recommendation_score = (1 - ($index * 0.1)) * $contentWeight;
                $combined->push($product);
            }
        });

        return $combined->sortByDesc('recommendation_score')->values();
    }

    private function applyBusinessRules(Collection $recommendations, User $user, int $limit): Collection
    {
        return $recommendations
            ->filter(function ($product) {
                // Only active products
                return $product->is_active;
            })
            ->filter(function ($product) {
                // Only products with stock (if tracking inventory)
                return !$product->track_inventory || $product->stock_quantity > 0;
            })
            ->take($limit);
    }

    private function trackRecommendationServed(int $userId, array $productIds): void
    {
        try {
            DB::table('recommendation_logs')->insert([
                'user_id' => $userId,
                'product_ids' => json_encode($productIds),
                'algorithm' => 'ml_hybrid',
                'served_at' => now(),
            ]);
        } catch (\Exception $e) {
            Log::warning('Failed to log recommendation: ' . $e->getMessage());
        }
    }

    private function getProductContextRecommendations(int $productId, array $context): Collection
    {
        // Get similar products with enhanced scoring
        $similar = $this->getSimilarProducts($productId, 4);
        
        // Get frequently bought together
        $fbt = $this->getFrequentlyBoughtTogether($productId, 4);
        
        return $similar->merge($fbt)->unique('id');
    }

    private function getCategoryContextRecommendations(int $categoryId, array $context): Collection
    {
        return $this->getCategoryProducts($categoryId, 6);
    }

    private function getSearchContextRecommendations(string $query, array $context): Collection
    {
        // This would integrate with the intelligent search service
        // For now, return popular products
        return $this->getPopularProducts(4);
    }

    private function calculateTrendingScore(Product $product, int $viewCount, int $hours): float
    {
        // Base score from view count
        $baseScore = $viewCount;
        
        // Boost newer products
        $ageInDays = $product->created_at->diffInDays(now());
        $ageBoost = max(0, 1 - ($ageInDays / 365)); // Newer products get higher boost
        
        // Boost products with good ratings (if available)
        $ratingBoost = 1; // Default, would integrate with rating system
        
        // Boost products with good conversion rates
        $conversionBoost = 1; // Would calculate from actual conversion data
        
        return $baseScore * (1 + $ageBoost + $ratingBoost + $conversionBoost);
    }
}
