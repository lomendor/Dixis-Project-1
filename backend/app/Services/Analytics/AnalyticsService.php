<?php

namespace App\Services\Analytics;

use App\Models\Product;
use App\Models\User;
use App\Models\Order;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;

/**
 * Advanced Analytics Service for Business Intelligence
 * Provides comprehensive analytics and insights for AI/ML models
 */
class AnalyticsService
{
    private UserBehaviorTracker $behaviorTracker;

    public function __construct(UserBehaviorTracker $behaviorTracker)
    {
        $this->behaviorTracker = $behaviorTracker;
    }

    /**
     * Get comprehensive dashboard analytics
     */
    public function getDashboardAnalytics(int $days = 30): array
    {
        $startDate = now()->subDays($days);

        return Cache::remember("dashboard_analytics_{$days}d", 1800, function () use ($startDate, $days) {
            return [
                'overview' => $this->getOverviewMetrics($startDate),
                'sales' => $this->getSalesAnalytics($startDate),
                'products' => $this->getProductAnalytics($startDate),
                'users' => $this->getUserAnalytics($startDate),
                'conversion' => $this->behaviorTracker->getConversionFunnel($days),
                'trending' => $this->getTrendingData($days),
                'predictions' => $this->getBasicPredictions($startDate),
            ];
        });
    }

    /**
     * Get product performance analytics
     */
    public function getProductPerformance(int $productId, int $days = 30): array
    {
        $startDate = now()->subDays($days);

        return [
            'views' => $this->getProductViews($productId, $startDate),
            'sales' => $this->getProductSales($productId, $startDate),
            'conversion_rate' => $this->getProductConversionRate($productId, $startDate),
            'revenue' => $this->getProductRevenue($productId, $startDate),
            'ratings' => $this->getProductRatings($productId),
            'recommendations' => $this->getProductRecommendationStats($productId, $startDate),
            'search_rankings' => $this->getProductSearchRankings($productId, $days),
        ];
    }

    /**
     * Get user segmentation analytics
     */
    public function getUserSegmentation(): array
    {
        return Cache::remember('user_segmentation', 3600, function () {
            $segments = [
                'high_value' => $this->getHighValueUsers(),
                'frequent_buyers' => $this->getFrequentBuyers(),
                'at_risk' => $this->getAtRiskUsers(),
                'new_users' => $this->getNewUsers(),
                'inactive' => $this->getInactiveUsers(),
            ];

            return [
                'segments' => $segments,
                'total_users' => User::count(),
                'segment_distribution' => $this->calculateSegmentDistribution($segments),
            ];
        });
    }

    /**
     * Get search analytics
     */
    public function getSearchAnalytics(int $days = 30): array
    {
        $startDate = now()->subDays($days);

        return [
            'popular_queries' => $this->behaviorTracker->getPopularSearches(50, $days),
            'no_results_queries' => $this->getNoResultsQueries($startDate),
            'search_to_purchase' => $this->getSearchToPurchaseRate($startDate),
            'query_trends' => $this->getQueryTrends($startDate),
            'search_performance' => $this->getSearchPerformanceMetrics($startDate),
        ];
    }

    /**
     * Get inventory analytics for demand forecasting
     */
    public function getInventoryAnalytics(): array
    {
        return [
            'low_stock_products' => $this->getLowStockProducts(),
            'fast_moving_products' => $this->getFastMovingProducts(),
            'slow_moving_products' => $this->getSlowMovingProducts(),
            'seasonal_trends' => $this->getSeasonalTrends(),
            'reorder_suggestions' => $this->getReorderSuggestions(),
        ];
    }

    /**
     * Private helper methods
     */
    private function getOverviewMetrics(Carbon $startDate): array
    {
        $totalRevenue = Order::where('created_at', '>=', $startDate)
            ->where('status', 'completed')
            ->sum('total_amount');

        $totalOrders = Order::where('created_at', '>=', $startDate)->count();
        $totalUsers = User::where('created_at', '>=', $startDate)->count();
        $totalProducts = Product::where('is_active', true)->count();

        return [
            'total_revenue' => $totalRevenue,
            'total_orders' => $totalOrders,
            'new_users' => $totalUsers,
            'active_products' => $totalProducts,
            'average_order_value' => $totalOrders > 0 ? $totalRevenue / $totalOrders : 0,
        ];
    }

    private function getSalesAnalytics(Carbon $startDate): array
    {
        $dailySales = Order::where('created_at', '>=', $startDate)
            ->where('status', 'completed')
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('SUM(total_amount) as revenue'),
                DB::raw('COUNT(*) as orders')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return [
            'daily_sales' => $dailySales,
            'growth_rate' => $this->calculateGrowthRate($dailySales),
            'peak_days' => $this->getPeakSalesDays($dailySales),
        ];
    }

    private function getProductAnalytics(Carbon $startDate): array
    {
        $topProducts = DB::table('user_behavior_events')
            ->where('event_type', 'product_view')
            ->where('created_at', '>=', $startDate)
            ->select('product_id', DB::raw('COUNT(*) as views'))
            ->groupBy('product_id')
            ->orderBy('views', 'desc')
            ->limit(10)
            ->get();

        return [
            'top_viewed_products' => $topProducts,
            'trending_products' => $this->behaviorTracker->getTrendingProducts(10, 24),
            'conversion_by_product' => $this->getProductConversions($startDate),
        ];
    }

    private function getUserAnalytics(Carbon $startDate): array
    {
        $activeUsers = DB::table('user_behavior_events')
            ->where('created_at', '>=', $startDate)
            ->distinct('user_id')
            ->whereNotNull('user_id')
            ->count();

        return [
            'active_users' => $activeUsers,
            'user_retention' => $this->calculateUserRetention($startDate),
            'user_engagement' => $this->calculateUserEngagement($startDate),
        ];
    }

    private function getTrendingData(int $days): array
    {
        return [
            'trending_products' => $this->behaviorTracker->getTrendingProducts(10, 24),
            'trending_categories' => $this->getTrendingCategories($days),
            'trending_searches' => $this->behaviorTracker->getPopularSearches(10, $days),
        ];
    }

    private function getBasicPredictions(Carbon $startDate): array
    {
        // Simple trend-based predictions
        $recentSales = Order::where('created_at', '>=', $startDate)
            ->where('status', 'completed')
            ->sum('total_amount');

        $previousPeriodSales = Order::where('created_at', '>=', $startDate->copy()->subDays(30))
            ->where('created_at', '<', $startDate)
            ->where('status', 'completed')
            ->sum('total_amount');

        $growthRate = $previousPeriodSales > 0 ? 
            (($recentSales - $previousPeriodSales) / $previousPeriodSales) * 100 : 0;

        return [
            'revenue_trend' => $growthRate,
            'predicted_next_month' => $recentSales * (1 + ($growthRate / 100)),
            'growth_rate' => round($growthRate, 2),
        ];
    }

    private function getProductViews(int $productId, Carbon $startDate): int
    {
        return DB::table('user_behavior_events')
            ->where('product_id', $productId)
            ->where('event_type', 'product_view')
            ->where('created_at', '>=', $startDate)
            ->count();
    }

    private function getProductSales(int $productId, Carbon $startDate): int
    {
        return DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('order_items.product_id', $productId)
            ->where('orders.created_at', '>=', $startDate)
            ->where('orders.status', 'completed')
            ->sum('order_items.quantity');
    }

    private function getProductConversionRate(int $productId, Carbon $startDate): float
    {
        $views = $this->getProductViews($productId, $startDate);
        $sales = $this->getProductSales($productId, $startDate);

        return $views > 0 ? round(($sales / $views) * 100, 2) : 0;
    }

    private function getProductRevenue(int $productId, Carbon $startDate): float
    {
        return DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('order_items.product_id', $productId)
            ->where('orders.created_at', '>=', $startDate)
            ->where('orders.status', 'completed')
            ->sum(DB::raw('order_items.quantity * order_items.price'));
    }

    private function getHighValueUsers(): array
    {
        return User::select('users.*')
            ->join('orders', 'users.id', '=', 'orders.user_id')
            ->where('orders.status', 'completed')
            ->groupBy('users.id')
            ->having(DB::raw('SUM(orders.total_amount)'), '>', 500)
            ->limit(100)
            ->get()
            ->toArray();
    }

    private function getFrequentBuyers(): array
    {
        return User::select('users.*')
            ->join('orders', 'users.id', '=', 'orders.user_id')
            ->where('orders.status', 'completed')
            ->groupBy('users.id')
            ->having(DB::raw('COUNT(orders.id)'), '>', 5)
            ->limit(100)
            ->get()
            ->toArray();
    }

    private function getAtRiskUsers(): array
    {
        return User::whereHas('orders', function ($query) {
                $query->where('created_at', '<', now()->subDays(60));
            })
            ->whereDoesntHave('orders', function ($query) {
                $query->where('created_at', '>=', now()->subDays(60));
            })
            ->limit(100)
            ->get()
            ->toArray();
    }

    private function getNewUsers(): array
    {
        return User::where('created_at', '>=', now()->subDays(30))
            ->limit(100)
            ->get()
            ->toArray();
    }

    private function getInactiveUsers(): array
    {
        return User::where('created_at', '<', now()->subDays(90))
            ->whereDoesntHave('orders', function ($query) {
                $query->where('created_at', '>=', now()->subDays(90));
            })
            ->limit(100)
            ->get()
            ->toArray();
    }

    private function calculateSegmentDistribution(array $segments): array
    {
        $total = User::count();
        $distribution = [];

        foreach ($segments as $name => $users) {
            $count = count($users);
            $distribution[$name] = [
                'count' => $count,
                'percentage' => $total > 0 ? round(($count / $total) * 100, 2) : 0
            ];
        }

        return $distribution;
    }

    // Placeholder methods for additional functionality
    private function calculateGrowthRate($dailySales): float { return 0; }
    private function getPeakSalesDays($dailySales): array { return []; }
    private function getProductConversions($startDate): array { return []; }
    private function calculateUserRetention($startDate): float { return 0; }
    private function calculateUserEngagement($startDate): float { return 0; }
    private function getTrendingCategories($days): array { return []; }
    private function getNoResultsQueries($startDate): array { return []; }
    private function getSearchToPurchaseRate($startDate): float { return 0; }
    private function getQueryTrends($startDate): array { return []; }
    private function getSearchPerformanceMetrics($startDate): array { return []; }
    private function getLowStockProducts(): array { return []; }
    private function getFastMovingProducts(): array { return []; }
    private function getSlowMovingProducts(): array { return []; }
    private function getSeasonalTrends(): array { return []; }
    private function getReorderSuggestions(): array { return []; }
    private function getProductRatings($productId): array { return []; }
    private function getProductRecommendationStats($productId, $startDate): array { return []; }
    private function getProductSearchRankings($productId, $days): array { return []; }
}
