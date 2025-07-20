<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\Product;
use App\Models\Category;
use App\Models\Producer;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

/**
 * Filter Controller
 * 
 * Provides filtering options and faceted search capabilities
 * for products, categories, and other entities
 */
class FilterController extends Controller
{
    /**
     * Get all available filters for products
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $filters = Cache::remember('product_filters', 3600, function() {
                return [
                    'categories' => $this->getCategoryFilters(),
                    'producers' => $this->getProducerFilters(),
                    'price_ranges' => $this->getPriceRanges(),
                    'attributes' => $this->getAttributeFilters(),
                    'availability' => $this->getAvailabilityFilters(),
                    'features' => $this->getFeatureFilters(),
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $filters
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get filters',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get category filters with product counts
     */
    public function getCategoryFilters(): array
    {
        return Category::withCount(['products' => function($query) {
            $query->where('is_active', true)
                  ->where('stock_quantity', '>', 0);
        }])
        ->orderBy('name')
        ->get()
        ->filter(function($category) {
            return $category->products_count > 0;
        })
        ->map(function($category) {
            return [
                'id' => $category->id,
                'name' => $category->name,
                'slug' => $category->slug,
                'count' => $category->products_count
            ];
        })
        ->values()
        ->toArray();
    }

    /**
     * Get producer filters with product counts
     */
    public function getProducerFilters(): array
    {
        return Producer::withCount(['products' => function($query) {
            $query->where('is_active', true)
                  ->where('stock_quantity', '>', 0);
        }])
        ->orderBy('business_name')
        ->get()
        ->filter(function($producer) {
            return $producer->products_count > 0;
        })
        ->map(function($producer) {
            return [
                'id' => $producer->id,
                'name' => $producer->business_name,
                'slug' => $producer->slug ?? \Illuminate\Support\Str::slug($producer->business_name),
                'count' => $producer->products_count
            ];
        })
        ->values()
        ->toArray();
    }

    /**
     * Get price range filters
     */
    public function getPriceRanges(): array
    {
        $priceStats = Product::where('is_active', true)
            ->where('stock_quantity', '>', 0)
            ->selectRaw('MIN(price) as min_price, MAX(price) as max_price')
            ->first();

        if (!$priceStats || !$priceStats->min_price) {
            return [];
        }

        $minPrice = floor($priceStats->min_price);
        $maxPrice = ceil($priceStats->max_price);
        
        // Create price ranges
        $ranges = [];
        $step = max(1, ($maxPrice - $minPrice) / 6); // Create ~6 ranges
        
        for ($i = $minPrice; $i < $maxPrice; $i += $step) {
            $rangeMin = $i;
            $rangeMax = min($i + $step, $maxPrice);
            
            $count = Product::where('is_active', true)
                ->where('stock_quantity', '>', 0)
                ->whereBetween('price', [$rangeMin, $rangeMax])
                ->count();
            
            if ($count > 0) {
                $ranges[] = [
                    'min' => round($rangeMin, 2),
                    'max' => round($rangeMax, 2),
                    'label' => '€' . number_format($rangeMin, 2) . ' - €' . number_format($rangeMax, 2),
                    'count' => $count
                ];
            }
        }

        return $ranges;
    }

    /**
     * Get attribute filters (organic, vegan, etc.)
     */
    public function getAttributeFilters(): array
    {
        $attributes = [];

        // Organic products
        $organicCount = Product::where('is_active', true)
            ->where('stock_quantity', '>', 0)
            ->where('is_organic', true)
            ->count();
        
        if ($organicCount > 0) {
            $attributes[] = [
                'key' => 'is_organic',
                'label' => 'Βιολογικά',
                'count' => $organicCount
            ];
        }

        // Vegan products
        $veganCount = Product::where('is_active', true)
            ->where('stock_quantity', '>', 0)
            ->where('is_vegan', true)
            ->count();
        
        if ($veganCount > 0) {
            $attributes[] = [
                'key' => 'is_vegan',
                'label' => 'Vegan',
                'count' => $veganCount
            ];
        }

        // Gluten-free products
        $glutenFreeCount = Product::where('is_active', true)
            ->where('stock_quantity', '>', 0)
            ->where('is_gluten_free', true)
            ->count();
        
        if ($glutenFreeCount > 0) {
            $attributes[] = [
                'key' => 'is_gluten_free',
                'label' => 'Χωρίς Γλουτένη',
                'count' => $glutenFreeCount
            ];
        }

        return $attributes;
    }

    /**
     * Get availability filters
     */
    public function getAvailabilityFilters(): array
    {
        return [
            [
                'key' => 'in_stock',
                'label' => 'Διαθέσιμα',
                'count' => Product::where('is_active', true)
                    ->where('stock_quantity', '>', 0)
                    ->count()
            ],
            [
                'key' => 'low_stock',
                'label' => 'Λίγα Κομμάτια',
                'count' => Product::where('is_active', true)
                    ->whereBetween('stock_quantity', [1, 10])
                    ->count()
            ]
        ];
    }

    /**
     * Get feature filters (featured, seasonal, etc.)
     */
    public function getFeatureFilters(): array
    {
        $features = [];

        // Featured products
        $featuredCount = Product::where('is_active', true)
            ->where('stock_quantity', '>', 0)
            ->where('is_featured', true)
            ->count();
        
        if ($featuredCount > 0) {
            $features[] = [
                'key' => 'is_featured',
                'label' => 'Προτεινόμενα',
                'count' => $featuredCount
            ];
        }

        // Seasonal products
        $seasonalCount = Product::where('is_active', true)
            ->where('stock_quantity', '>', 0)
            ->where('is_seasonal', true)
            ->count();
        
        if ($seasonalCount > 0) {
            $features[] = [
                'key' => 'is_seasonal',
                'label' => 'Εποχιακά',
                'count' => $seasonalCount
            ];
        }

        // Discounted products
        $discountedCount = Product::where('is_active', true)
            ->where('stock_quantity', '>', 0)
            ->whereNotNull('discount_price')
            ->count();
        
        if ($discountedCount > 0) {
            $features[] = [
                'key' => 'has_discount',
                'label' => 'Προσφορές',
                'count' => $discountedCount
            ];
        }

        return $features;
    }

    /**
     * Get filters for a specific category
     */
    public function getFiltersForCategory(Request $request): JsonResponse
    {
        try {
            $categoryId = $request->route('category');
            
            $filters = [
                'producers' => $this->getProducersForCategory($categoryId),
                'price_ranges' => $this->getPriceRangesForCategory($categoryId),
                'attributes' => $this->getAttributesForCategory($categoryId),
            ];

            return response()->json([
                'success' => true,
                'data' => $filters,
                'category_id' => $categoryId
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get category filters',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    private function getProducersForCategory($categoryId): array
    {
        return Producer::whereHas('products', function($query) use ($categoryId) {
            $query->where('category_id', $categoryId)
                  ->where('is_active', true)
                  ->where('stock_quantity', '>', 0);
        })
        ->withCount(['products' => function($query) use ($categoryId) {
            $query->where('category_id', $categoryId)
                  ->where('is_active', true)
                  ->where('stock_quantity', '>', 0);
        }])
        ->orderBy('business_name')
        ->get()
        ->map(function($producer) {
            return [
                'id' => $producer->id,
                'name' => $producer->business_name,
                'count' => $producer->products_count
            ];
        })
        ->toArray();
    }

    private function getPriceRangesForCategory($categoryId): array
    {
        $priceStats = Product::where('category_id', $categoryId)
            ->where('is_active', true)
            ->where('stock_quantity', '>', 0)
            ->selectRaw('MIN(price) as min_price, MAX(price) as max_price')
            ->first();

        if (!$priceStats || !$priceStats->min_price) {
            return [];
        }

        // Similar logic to general price ranges but for specific category
        return $this->buildPriceRanges($priceStats->min_price, $priceStats->max_price, $categoryId);
    }

    private function getAttributesForCategory($categoryId): array
    {
        $attributes = [];

        $organicCount = Product::where('category_id', $categoryId)
            ->where('is_active', true)
            ->where('stock_quantity', '>', 0)
            ->where('is_organic', true)
            ->count();
        
        if ($organicCount > 0) {
            $attributes[] = [
                'key' => 'is_organic',
                'label' => 'Βιολογικά',
                'count' => $organicCount
            ];
        }

        return $attributes;
    }

    private function buildPriceRanges($minPrice, $maxPrice, $categoryId = null): array
    {
        $ranges = [];
        $step = max(1, ($maxPrice - $minPrice) / 6);
        
        for ($i = $minPrice; $i < $maxPrice; $i += $step) {
            $rangeMin = $i;
            $rangeMax = min($i + $step, $maxPrice);
            
            $query = Product::where('is_active', true)
                ->where('stock_quantity', '>', 0)
                ->whereBetween('price', [$rangeMin, $rangeMax]);
            
            if ($categoryId) {
                $query->where('category_id', $categoryId);
            }
            
            $count = $query->count();
            
            if ($count > 0) {
                $ranges[] = [
                    'min' => round($rangeMin, 2),
                    'max' => round($rangeMax, 2),
                    'label' => '€' . number_format($rangeMin, 2) . ' - €' . number_format($rangeMax, 2),
                    'count' => $count
                ];
            }
        }

        return $ranges;
    }
}
