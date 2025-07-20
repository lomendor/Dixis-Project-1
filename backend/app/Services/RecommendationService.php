<?php

namespace App\Services;

use App\Models\Product;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class RecommendationService
{
    /**
     * Get recommended products based on a product ID (similar products)
     *
     * @param int $productId
     * @param int $limit
     * @param array $excludeIds
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getSimilarProducts($productId, $limit = 4, $excludeIds = [])
    {
        try {
            $product = Product::find($productId);

            if (!$product) {
                return collect([]);
            }

            // Get products from the same categories
            $categoryIds = $product->categories()->pluck('categories.id')->toArray();

            $query = Product::with(['producer', 'categories', 'images'])
                ->where('is_active', true)
                ->where('id', '!=', $productId);

            // Exclude specific products if provided
            if (!empty($excludeIds)) {
                $query->whereNotIn('id', $excludeIds);
            }

            if (!empty($categoryIds)) {
                $query->whereHas('categories', function($q) use ($categoryIds) {
                    $q->whereIn('categories.id', $categoryIds);
                });
            }

            // Order by newest first as a fallback
            $query->orderBy('created_at', 'desc');

            return $query->take($limit)->get();
        } catch (\Exception $e) {
            Log::error('Error getting similar products: ' . $e->getMessage());
            return collect([]);
        }
    }

    /**
     * Get recommended products based on a category ID
     *
     * @param int $categoryId
     * @param int $limit
     * @param array $excludeIds
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getCategoryProducts($categoryId, $limit = 4, $excludeIds = [])
    {
        try {
            $query = Product::with(['producer', 'categories', 'images'])
                ->where('is_active', true);

            // Exclude specific products if provided
            if (!empty($excludeIds)) {
                $query->whereNotIn('id', $excludeIds);
            }

            $query->whereHas('categories', function($q) use ($categoryId) {
                $q->where('categories.id', $categoryId);
            });

            // Order by newest first
            $query->orderBy('created_at', 'desc');

            return $query->take($limit)->get();
        } catch (\Exception $e) {
            Log::error('Error getting category products: ' . $e->getMessage());
            return collect([]);
        }
    }

    /**
     * Get frequently bought together products
     *
     * @param int $productId
     * @param int $limit
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getFrequentlyBoughtTogether($productId, $limit = 4)
    {
        try {
            // Find order items containing the product
            $orderIds = OrderItem::where('product_id', $productId)
                ->pluck('order_id')
                ->toArray();

            if (empty($orderIds)) {
                return collect([]);
            }

            // Find other products in the same orders
            $frequentlyBoughtProductIds = OrderItem::whereIn('order_id', $orderIds)
                ->where('product_id', '!=', $productId)
                ->select('product_id', DB::raw('COUNT(*) as frequency'))
                ->groupBy('product_id')
                ->orderBy('frequency', 'desc')
                ->take($limit)
                ->pluck('product_id')
                ->toArray();

            if (empty($frequentlyBoughtProductIds)) {
                return collect([]);
            }

            // Get the products
            return Product::with(['producer', 'categories', 'images'])
                ->where('is_active', true)
                ->whereIn('id', $frequentlyBoughtProductIds)
                ->get();
        } catch (\Exception $e) {
            Log::error('Error getting frequently bought together products: ' . $e->getMessage());
            return collect([]);
        }
    }

    /**
     * Get recommended products based on cart items
     *
     * @param array $cartItemIds
     * @param int $limit
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getCartRecommendations($cartItemIds, $limit = 4)
    {
        try {
            if (empty($cartItemIds)) {
                return $this->getPopularProducts($limit);
            }

            // Get categories of cart items
            $categoryIds = Product::whereIn('id', $cartItemIds)
                ->with('categories')
                ->get()
                ->pluck('categories')
                ->flatten()
                ->pluck('id')
                ->unique()
                ->toArray();

            // Get products from the same categories
            $query = Product::with(['producer', 'categories', 'images'])
                ->where('is_active', true)
                ->whereNotIn('id', $cartItemIds);

            if (!empty($categoryIds)) {
                $query->whereHas('categories', function($q) use ($categoryIds) {
                    $q->whereIn('categories.id', $categoryIds);
                });
            }

            // Order by newest first
            $query->orderBy('created_at', 'desc');

            $products = $query->take($limit)->get();

            // If we don't have enough products, get some popular ones
            if ($products->count() < $limit) {
                $neededCount = $limit - $products->count();
                $existingIds = $products->pluck('id')->toArray();
                $allExcludeIds = array_merge($existingIds, $cartItemIds);

                $popularProducts = $this->getPopularProducts($neededCount, $allExcludeIds);
                $products = $products->concat($popularProducts);
            }

            return $products;
        } catch (\Exception $e) {
            Log::error('Error getting cart recommendations: ' . $e->getMessage());
            return collect([]);
        }
    }

    /**
     * Get popular products
     *
     * @param int $limit
     * @param array $excludeIds
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getPopularProducts($limit = 4, $excludeIds = [])
    {
        try {
            // Get products with the most orders
            $popularProductIds = OrderItem::select('product_id', DB::raw('COUNT(*) as order_count'))
                ->groupBy('product_id')
                ->orderBy('order_count', 'desc')
                ->take($limit * 2) // Get more than needed in case some are excluded
                ->pluck('product_id')
                ->toArray();

            $query = Product::with(['producer', 'categories', 'images'])
                ->where('is_active', true);

            // Exclude specific products if provided
            if (!empty($excludeIds)) {
                $query->whereNotIn('id', $excludeIds);
            }

            if (!empty($popularProductIds)) {
                $query->whereIn('id', $popularProductIds);
                // Preserve the order of popularity
                $orderCases = [];
                foreach ($popularProductIds as $index => $id) {
                    $orderCases[] = "WHEN id = $id THEN $index";
                }
                if (!empty($orderCases)) {
                    $query->orderByRaw("CASE " . implode(' ', $orderCases) . " ELSE 999 END");
                }
            } else {
                // Fallback to newest products if no popular ones
                $query->orderBy('created_at', 'desc');
            }

            return $query->take($limit)->get();
        } catch (\Exception $e) {
            Log::error('Error getting popular products: ' . $e->getMessage());

            // Fallback to newest products
            try {
                return Product::with(['producer', 'categories', 'images'])
                    ->where('is_active', true)
                    ->whereNotIn('id', $excludeIds)
                    ->orderBy('created_at', 'desc')
                    ->take($limit)
                    ->get();
            } catch (\Exception $fallbackE) {
                Log::error('Error getting fallback products: ' . $fallbackE->getMessage());
                return collect([]);
            }
        }
    }

    /**
     * Get personalized recommendations for a user
     *
     * @param User $user
     * @param int $limit
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getPersonalizedRecommendations(User $user, $limit = 4)
    {
        try {
            // Get user's order history
            $orderItems = OrderItem::whereHas('order', function($q) use ($user) {
                $q->where('user_id', $user->id);
            })->get();

            if ($orderItems->isEmpty()) {
                // No order history, return popular products
                return $this->getPopularProducts($limit);
            }

            // Get purchased products and their categories
            $purchasedProductIds = $orderItems->pluck('product_id')->unique()->toArray();
            $purchasedProducts = Product::whereIn('id', $purchasedProductIds)
                ->with('categories')
                ->get();

            // Get categories of purchased products
            $categoryIds = $purchasedProducts
                ->pluck('categories')
                ->flatten()
                ->pluck('id')
                ->unique()
                ->toArray();

            // Get producers of purchased products
            $producerIds = $purchasedProducts
                ->pluck('producer_id')
                ->unique()
                ->toArray();

            // Calculate product weights based on purchase frequency
            $productPurchaseCount = [];
            foreach ($orderItems as $item) {
                if (!isset($productPurchaseCount[$item->product_id])) {
                    $productPurchaseCount[$item->product_id] = 0;
                }
                $productPurchaseCount[$item->product_id] += $item->quantity;
            }

            // Get products from the same categories and producers that the user hasn't purchased
            $query = Product::with(['producer', 'categories', 'images'])
                ->where('is_active', true)
                ->whereNotIn('id', $purchasedProductIds);

            // Create a union of category-based and producer-based recommendations
            $categoryBasedQuery = clone $query;
            $producerBasedQuery = clone $query;

            if (!empty($categoryIds)) {
                $categoryBasedQuery->whereHas('categories', function($q) use ($categoryIds) {
                    $q->whereIn('categories.id', $categoryIds);
                });
            }

            if (!empty($producerIds)) {
                $producerBasedQuery->whereIn('producer_id', $producerIds);
            }

            // Get products from both queries
            $categoryProducts = $categoryBasedQuery->take($limit)->get();
            $producerProducts = $producerBasedQuery->take($limit)->get();

            // Merge and remove duplicates
            $products = $categoryProducts->merge($producerProducts)->unique('id');

            // Sort products by relevance score
            $products = $products->map(function($product) use ($categoryIds, $producerIds, $purchasedProducts) {
                // Calculate relevance score
                $score = 0;

                // Score based on category match
                $productCategoryIds = $product->categories->pluck('id')->toArray();
                $categoryMatches = count(array_intersect($productCategoryIds, $categoryIds));
                $score += $categoryMatches * 2; // Category matches are weighted more

                // Score based on producer match
                if (in_array($product->producer_id, $producerIds)) {
                    $score += 3; // Producer match is weighted heavily
                }

                // Score based on price similarity to purchased products
                $avgPurchasedPrice = $purchasedProducts->avg('price');
                $priceDiff = abs($product->price - $avgPurchasedPrice);
                $priceScore = max(0, 5 - ($priceDiff / 10)); // Higher score for closer price
                $score += $priceScore;

                // Add score to product
                $product->relevance_score = $score;

                return $product;
            })->sortByDesc('relevance_score')->values();

            // Take the top products up to the limit
            $products = $products->take($limit);

            // If we don't have enough products, get some popular ones
            if ($products->count() < $limit) {
                $neededCount = $limit - $products->count();
                $existingIds = $products->pluck('id')->toArray();
                $allExcludeIds = array_merge($existingIds, $purchasedProductIds);

                $popularProducts = $this->getPopularProducts($neededCount, $allExcludeIds);
                $products = $products->concat($popularProducts);
            }

            return $products;
        } catch (\Exception $e) {
            Log::error('Error getting personalized recommendations: ' . $e->getMessage());
            return $this->getPopularProducts($limit);
        }
    }

    /**
     * Get seasonal recommendations
     *
     * @param int $limit
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getSeasonalRecommendations($limit = 4)
    {
        try {
            // Get current month and day
            $currentMonth = date('n');
            $currentDay = date('j');
            $currentYear = date('Y');

            // Define seasonal categories and special occasions
            $seasonalCategories = [];
            $specialOccasion = null;
            $specialOccasionDays = 0;

            // Check for special occasions (holidays, events, etc.)

            // Easter (approximate - would need a proper calculation for exact date)
            $easter = new \DateTime("$currentYear-04-16"); // Approximate
            $today = new \DateTime();
            $daysToEaster = $today->diff($easter)->days;

            if ($daysToEaster <= 14 && $daysToEaster >= 0) {
                $specialOccasion = 'easter';
                $specialOccasionDays = $daysToEaster;
                $seasonalCategories = [13, 14]; // Easter related categories
            }

            // Christmas season
            elseif ($currentMonth == 12 && $currentDay >= 1) {
                $specialOccasion = 'christmas';
                $specialOccasionDays = 25 - $currentDay;
                $seasonalCategories = [15, 16]; // Christmas related categories
            }

            // New Year
            elseif (($currentMonth == 12 && $currentDay >= 26) || ($currentMonth == 1 && $currentDay <= 7)) {
                $specialOccasion = 'newyear';
                $seasonalCategories = [17, 18]; // New Year related categories
            }

            // Valentine's Day
            elseif ($currentMonth == 2 && $currentDay >= 1 && $currentDay <= 14) {
                $specialOccasion = 'valentines';
                $specialOccasionDays = 14 - $currentDay;
                $seasonalCategories = [19]; // Valentine's related categories
            }

            // If no special occasion, use seasonal categories
            if (empty($seasonalCategories)) {
                // Spring (March-May)
                if ($currentMonth >= 3 && $currentMonth <= 5) {
                    $seasonalCategories = [1, 2, 3]; // Example category IDs for spring products
                }
                // Summer (June-August)
                elseif ($currentMonth >= 6 && $currentMonth <= 8) {
                    $seasonalCategories = [4, 5, 6]; // Example category IDs for summer products
                }
                // Fall (September-November)
                elseif ($currentMonth >= 9 && $currentMonth <= 11) {
                    $seasonalCategories = [7, 8, 9]; // Example category IDs for fall products
                }
                // Winter (December-February)
                else {
                    $seasonalCategories = [10, 11, 12]; // Example category IDs for winter products
                }
            }

            // Get products from seasonal categories
            $query = Product::with(['producer', 'categories', 'images'])
                ->where('is_active', true);

            if (!empty($seasonalCategories)) {
                $query->whereHas('categories', function($q) use ($seasonalCategories) {
                    $q->whereIn('categories.id', $seasonalCategories);
                });
            }

            // If it's a special occasion, prioritize products with discounts
            if ($specialOccasion) {
                $query->orderByRaw('CASE WHEN discount_price IS NOT NULL THEN 0 ELSE 1 END')
                      ->orderBy('created_at', 'desc');
            } else {
                // Regular seasonal products, order by newest first
                $query->orderBy('created_at', 'desc');
            }

            $products = $query->take($limit)->get();

            // If we don't have enough products, get some popular ones
            if ($products->count() < $limit) {
                $neededCount = $limit - $products->count();
                $existingIds = $products->pluck('id')->toArray();

                $popularProducts = $this->getPopularProducts($neededCount, $existingIds);
                $products = $products->concat($popularProducts);
            }

            // Add seasonal flag to products
            $products = $products->map(function($product) use ($specialOccasion, $specialOccasionDays) {
                if ($specialOccasion) {
                    $product->seasonal_occasion = $specialOccasion;
                    $product->days_remaining = $specialOccasionDays;
                } else {
                    $product->seasonal_occasion = 'seasonal';
                }
                return $product;
            });

            return $products;
        } catch (\Exception $e) {
            Log::error('Error getting seasonal recommendations: ' . $e->getMessage());
            return $this->getPopularProducts($limit);
        }
    }

    /**
     * Get recommendations based on browsing history
     *
     * @param array $viewedProductIds
     * @param int $limit
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getBrowsingHistoryRecommendations($viewedProductIds, $limit = 4)
    {
        try {
            if (empty($viewedProductIds)) {
                return $this->getPopularProducts($limit);
            }

            // Get viewed products with their categories
            $viewedProducts = Product::whereIn('id', $viewedProductIds)
                ->with('categories')
                ->get();

            // Get categories of viewed products
            $categoryIds = $viewedProducts
                ->pluck('categories')
                ->flatten()
                ->pluck('id')
                ->unique()
                ->toArray();

            // Get products from the same categories that the user hasn't viewed
            $query = Product::with(['producer', 'categories', 'images'])
                ->where('is_active', true)
                ->whereNotIn('id', $viewedProductIds);

            if (!empty($categoryIds)) {
                $query->whereHas('categories', function($q) use ($categoryIds) {
                    $q->whereIn('categories.id', $categoryIds);
                });
            }

            // Calculate recency weights for viewed products (more recent = higher weight)
            $recencyWeights = [];
            foreach (array_values($viewedProductIds) as $index => $productId) {
                // Reverse the index so most recent has highest weight
                $recencyWeights[$productId] = count($viewedProductIds) - $index;
            }

            // Get category weights based on recency of viewed products
            $categoryWeights = [];
            foreach ($viewedProducts as $product) {
                $weight = $recencyWeights[$product->id] ?? 1;
                foreach ($product->categories as $category) {
                    if (!isset($categoryWeights[$category->id])) {
                        $categoryWeights[$category->id] = 0;
                    }
                    $categoryWeights[$category->id] += $weight;
                }
            }

            // Get products and calculate relevance score
            $products = $query->take($limit * 2)->get(); // Get more than needed for scoring

            $products = $products->map(function($product) use ($categoryWeights) {
                $score = 0;

                // Score based on weighted category matches
                foreach ($product->categories as $category) {
                    $score += $categoryWeights[$category->id] ?? 0;
                }

                // Add score to product
                $product->relevance_score = $score;

                return $product;
            })->sortByDesc('relevance_score')->values();

            // Take the top products up to the limit
            $products = $products->take($limit);

            // If we don't have enough products, get some popular ones
            if ($products->count() < $limit) {
                $neededCount = $limit - $products->count();
                $existingIds = $products->pluck('id')->toArray();
                $allExcludeIds = array_merge($existingIds, $viewedProductIds);

                $popularProducts = $this->getPopularProducts($neededCount, $allExcludeIds);
                $products = $products->concat($popularProducts);
            }

            return $products;
        } catch (\Exception $e) {
            Log::error('Error getting browsing history recommendations: ' . $e->getMessage());
            return $this->getPopularProducts($limit);
        }
    }
}
