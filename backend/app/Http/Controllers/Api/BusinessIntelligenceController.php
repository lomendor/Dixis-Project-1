<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Models\Producer;
use App\Models\OrderItem;
use Carbon\Carbon;

class BusinessIntelligenceController extends Controller
{
    /**
     * Get comprehensive dashboard analytics
     */
    public function getDashboardAnalytics(Request $request): JsonResponse
    {
        $request->validate([
            'period' => 'in:7d,30d,90d,1y,all',
            'producer_id' => 'nullable|exists:producers,id'
        ]);

        $period = $request->get('period', '30d');
        $producerId = $request->get('producer_id');
        
        // Cache key for analytics
        $cacheKey = "analytics_dashboard_{$period}_{$producerId}_" . auth()->id();
        
        $analytics = Cache::remember($cacheKey, 300, function () use ($period, $producerId) {
            return [
                'overview' => $this->getOverviewMetrics($period, $producerId),
                'revenue' => $this->getRevenueAnalytics($period, $producerId),
                'products' => $this->getProductAnalytics($period, $producerId),
                'customers' => $this->getCustomerAnalytics($period, $producerId),
                'trends' => $this->getTrendAnalytics($period, $producerId),
                'forecasting' => $this->getRevenueForecast($period, $producerId),
                'performance' => $this->getPerformanceMetrics($period, $producerId)
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $analytics,
            'period' => $period,
            'generated_at' => now()->toISOString()
        ]);
    }

    /**
     * Get overview metrics
     */
    private function getOverviewMetrics(string $period, ?int $producerId): array
    {
        $dateRange = $this->getDateRange($period);
        $query = Order::whereBetween('created_at', $dateRange);
        
        if ($producerId) {
            $query->whereHas('items.product', function ($q) use ($producerId) {
                $q->where('producer_id', $producerId);
            });
        }

        $orders = $query->get();
        $previousPeriodOrders = $this->getPreviousPeriodOrders($period, $producerId);

        $totalRevenue = $orders->sum('total_amount');
        $totalOrders = $orders->count();
        $averageOrderValue = $totalOrders > 0 ? $totalRevenue / $totalOrders : 0;
        
        $previousRevenue = $previousPeriodOrders->sum('total_amount');
        $previousOrders = $previousPeriodOrders->count();
        
        return [
            'total_revenue' => round($totalRevenue, 2),
            'total_orders' => $totalOrders,
            'average_order_value' => round($averageOrderValue, 2),
            'revenue_growth' => $this->calculateGrowthRate($totalRevenue, $previousRevenue),
            'orders_growth' => $this->calculateGrowthRate($totalOrders, $previousOrders),
            'conversion_rate' => $this->calculateConversionRate($period, $producerId),
            'customer_satisfaction' => $this->getCustomerSatisfactionScore($period, $producerId)
        ];
    }

    /**
     * Get revenue analytics with detailed breakdown
     */
    private function getRevenueAnalytics(string $period, ?int $producerId): array
    {
        $dateRange = $this->getDateRange($period);
        $query = Order::whereBetween('created_at', $dateRange);
        
        if ($producerId) {
            $query->whereHas('items.product', function ($q) use ($producerId) {
                $q->where('producer_id', $producerId);
            });
        }

        // Daily revenue breakdown
        $dailyRevenue = $query->clone()
            ->selectRaw('DATE(created_at) as date, SUM(total_amount) as revenue, COUNT(*) as orders')
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(function ($item) {
                return [
                    'date' => $item->date,
                    'revenue' => round($item->revenue, 2),
                    'orders' => $item->orders
                ];
            });

        // Revenue by payment method
        $revenueByPayment = $query->clone()
            ->selectRaw('payment_method, SUM(total_amount) as revenue, COUNT(*) as orders')
            ->groupBy('payment_method')
            ->get()
            ->map(function ($item) {
                return [
                    'method' => $item->payment_method,
                    'revenue' => round($item->revenue, 2),
                    'orders' => $item->orders,
                    'percentage' => 0 // Will be calculated after
                ];
            });

        // Calculate percentages
        $totalRevenue = $revenueByPayment->sum('revenue');
        $revenueByPayment = $revenueByPayment->map(function ($item) use ($totalRevenue) {
            $item['percentage'] = $totalRevenue > 0 ? round(($item['revenue'] / $totalRevenue) * 100, 1) : 0;
            return $item;
        });

        // Revenue by customer type
        $revenueByCustomerType = $query->clone()
            ->join('users', 'orders.user_id', '=', 'users.id')
            ->selectRaw('users.role as customer_type, SUM(orders.total_amount) as revenue, COUNT(*) as orders')
            ->groupBy('users.role')
            ->get()
            ->map(function ($item) {
                return [
                    'type' => $item->customer_type,
                    'revenue' => round($item->revenue, 2),
                    'orders' => $item->orders
                ];
            });

        return [
            'daily_breakdown' => $dailyRevenue,
            'by_payment_method' => $revenueByPayment,
            'by_customer_type' => $revenueByCustomerType,
            'monthly_comparison' => $this->getMonthlyComparison($producerId),
            'seasonal_trends' => $this->getSeasonalTrends($producerId)
        ];
    }

    /**
     * Get product performance analytics
     */
    private function getProductAnalytics(string $period, ?int $producerId): array
    {
        $dateRange = $this->getDateRange($period);
        
        $query = OrderItem::join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->whereBetween('orders.created_at', $dateRange);
            
        if ($producerId) {
            $query->where('products.producer_id', $producerId);
        }

        // Top selling products
        $topProducts = $query->clone()
            ->selectRaw('
                products.id,
                products.name,
                products.price,
                SUM(order_items.quantity) as total_sold,
                SUM(order_items.total) as total_revenue,
                COUNT(DISTINCT orders.id) as orders_count
            ')
            ->groupBy('products.id', 'products.name', 'products.price')
            ->orderByDesc('total_revenue')
            ->limit(10)
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'name' => $item->name,
                    'price' => round($item->price, 2),
                    'quantity_sold' => $item->total_sold,
                    'revenue' => round($item->total_revenue, 2),
                    'orders_count' => $item->orders_count,
                    'average_quantity_per_order' => $item->orders_count > 0 ? round($item->total_sold / $item->orders_count, 1) : 0
                ];
            });

        // Product category performance
        $categoryPerformance = $query->clone()
            ->join('categories', 'products.category_id', '=', 'categories.id')
            ->selectRaw('
                categories.name as category,
                SUM(order_items.quantity) as total_sold,
                SUM(order_items.total) as total_revenue,
                COUNT(DISTINCT products.id) as products_count
            ')
            ->groupBy('categories.id', 'categories.name')
            ->orderByDesc('total_revenue')
            ->get()
            ->map(function ($item) {
                return [
                    'category' => $item->category,
                    'quantity_sold' => $item->total_sold,
                    'revenue' => round($item->total_revenue, 2),
                    'products_count' => $item->products_count,
                    'average_revenue_per_product' => $item->products_count > 0 ? round($item->total_revenue / $item->products_count, 2) : 0
                ];
            });

        // Product inventory insights
        $inventoryInsights = Product::when($producerId, function ($q) use ($producerId) {
                $q->where('producer_id', $producerId);
            })
            ->selectRaw('
                COUNT(*) as total_products,
                SUM(CASE WHEN stock <= 10 THEN 1 ELSE 0 END) as low_stock_products,
                SUM(CASE WHEN stock = 0 THEN 1 ELSE 0 END) as out_of_stock_products,
                AVG(stock) as average_stock,
                AVG(price) as average_price
            ')
            ->first();

        return [
            'top_products' => $topProducts,
            'category_performance' => $categoryPerformance,
            'inventory_insights' => [
                'total_products' => $inventoryInsights->total_products,
                'low_stock_products' => $inventoryInsights->low_stock_products,
                'out_of_stock_products' => $inventoryInsights->out_of_stock_products,
                'average_stock' => round($inventoryInsights->average_stock, 1),
                'average_price' => round($inventoryInsights->average_price, 2)
            ],
            'product_trends' => $this->getProductTrends($period, $producerId)
        ];
    }

    /**
     * Get customer analytics
     */
    private function getCustomerAnalytics(string $period, ?int $producerId): array
    {
        $dateRange = $this->getDateRange($period);
        
        $query = Order::whereBetween('created_at', $dateRange);
        if ($producerId) {
            $query->whereHas('items.product', function ($q) use ($producerId) {
                $q->where('producer_id', $producerId);
            });
        }

        // Customer segments
        $customerSegments = $query->clone()
            ->join('users', 'orders.user_id', '=', 'users.id')
            ->selectRaw('
                users.role,
                COUNT(DISTINCT users.id) as customer_count,
                SUM(orders.total_amount) as total_revenue,
                AVG(orders.total_amount) as avg_order_value,
                COUNT(orders.id) as total_orders
            ')
            ->groupBy('users.role')
            ->get()
            ->map(function ($item) {
                return [
                    'segment' => $item->role,
                    'customer_count' => $item->customer_count,
                    'revenue' => round($item->total_revenue, 2),
                    'avg_order_value' => round($item->avg_order_value, 2),
                    'total_orders' => $item->total_orders,
                    'orders_per_customer' => $item->customer_count > 0 ? round($item->total_orders / $item->customer_count, 1) : 0
                ];
            });

        // New vs returning customers
        $newVsReturning = $this->getNewVsReturningCustomers($period, $producerId);

        // Customer lifetime value
        $customerLTV = $this->calculateCustomerLTV($producerId);

        return [
            'segments' => $customerSegments,
            'new_vs_returning' => $newVsReturning,
            'lifetime_value' => $customerLTV,
            'geographic_distribution' => $this->getGeographicDistribution($period, $producerId),
            'customer_retention' => $this->getCustomerRetentionMetrics($period, $producerId)
        ];
    }

    /**
     * Get trend analytics
     */
    private function getTrendAnalytics(string $period, ?int $producerId): array
    {
        return [
            'growth_trends' => $this->getGrowthTrends($period, $producerId),
            'seasonal_patterns' => $this->getSeasonalPatterns($producerId),
            'market_share' => $this->getMarketShareTrends($period, $producerId),
            'competitive_analysis' => $this->getCompetitiveAnalysis($period, $producerId)
        ];
    }

    /**
     * Get revenue forecast
     */
    private function getRevenueForecast(string $period, ?int $producerId): array
    {
        $historicalData = $this->getHistoricalRevenueData($producerId);
        
        // Simple linear regression for forecasting
        $forecast = $this->calculateLinearForecast($historicalData);
        
        return [
            'next_month_forecast' => round($forecast['next_month'], 2),
            'next_quarter_forecast' => round($forecast['next_quarter'], 2),
            'confidence_level' => $forecast['confidence'],
            'trend_direction' => $forecast['trend'],
            'growth_rate_prediction' => round($forecast['growth_rate'], 2)
        ];
    }

    /**
     * Get performance metrics
     */
    private function getPerformanceMetrics(string $period, ?int $producerId): array
    {
        return [
            'operational_efficiency' => $this->getOperationalEfficiency($period, $producerId),
            'customer_acquisition_cost' => $this->getCustomerAcquisitionCost($period, $producerId),
            'return_on_investment' => $this->getROIMetrics($period, $producerId),
            'market_penetration' => $this->getMarketPenetration($period, $producerId)
        ];
    }

    // Helper methods would continue here...
    // Due to length constraints, I'll add the remaining helper methods in the next part

    private function getDateRange(string $period): array
    {
        $end = Carbon::now();
        
        switch ($period) {
            case '7d':
                $start = $end->copy()->subDays(7);
                break;
            case '30d':
                $start = $end->copy()->subDays(30);
                break;
            case '90d':
                $start = $end->copy()->subDays(90);
                break;
            case '1y':
                $start = $end->copy()->subYear();
                break;
            default:
                $start = Carbon::create(2020, 1, 1); // All time
        }
        
        return [$start, $end];
    }

    private function calculateGrowthRate(float $current, float $previous): float
    {
        if ($previous == 0) {
            return $current > 0 ? 100 : 0;
        }
        
        return round((($current - $previous) / $previous) * 100, 2);
    }

    private function getPreviousPeriodOrders(string $period, ?int $producerId)
    {
        $currentRange = $this->getDateRange($period);
        $duration = $currentRange[1]->diffInDays($currentRange[0]);
        
        $previousStart = $currentRange[0]->copy()->subDays($duration);
        $previousEnd = $currentRange[0];
        
        $query = Order::whereBetween('created_at', [$previousStart, $previousEnd]);
        
        if ($producerId) {
            $query->whereHas('items.product', function ($q) use ($producerId) {
                $q->where('producer_id', $producerId);
            });
        }
        
        return $query->get();
    }

    // Additional helper methods would be implemented here...
    private function calculateConversionRate(string $period, ?int $producerId): float
    {
        // Placeholder implementation
        return 2.5;
    }

    private function getCustomerSatisfactionScore(string $period, ?int $producerId): float
    {
        // Placeholder implementation
        return 4.2;
    }

    private function getMonthlyComparison(?int $producerId): array
    {
        // Placeholder implementation
        return [];
    }

    private function getSeasonalTrends(?int $producerId): array
    {
        // Placeholder implementation
        return [];
    }

    private function getProductTrends(string $period, ?int $producerId): array
    {
        // Placeholder implementation
        return [];
    }

    private function getNewVsReturningCustomers(string $period, ?int $producerId): array
    {
        // Placeholder implementation
        return [];
    }

    private function calculateCustomerLTV(?int $producerId): array
    {
        // Placeholder implementation
        return [];
    }

    private function getGeographicDistribution(string $period, ?int $producerId): array
    {
        // Placeholder implementation
        return [];
    }

    private function getCustomerRetentionMetrics(string $period, ?int $producerId): array
    {
        // Placeholder implementation
        return [];
    }

    private function getGrowthTrends(string $period, ?int $producerId): array
    {
        // Placeholder implementation
        return [];
    }

    private function getSeasonalPatterns(?int $producerId): array
    {
        // Placeholder implementation
        return [];
    }

    private function getMarketShareTrends(string $period, ?int $producerId): array
    {
        // Placeholder implementation
        return [];
    }

    private function getCompetitiveAnalysis(string $period, ?int $producerId): array
    {
        // Placeholder implementation
        return [];
    }

    private function getHistoricalRevenueData(?int $producerId): array
    {
        // Placeholder implementation
        return [];
    }

    private function calculateLinearForecast(array $data): array
    {
        // Placeholder implementation
        return [
            'next_month' => 5000,
            'next_quarter' => 15000,
            'confidence' => 85,
            'trend' => 'upward',
            'growth_rate' => 12.5
        ];
    }

    private function getOperationalEfficiency(string $period, ?int $producerId): array
    {
        // Placeholder implementation
        return [];
    }

    private function getCustomerAcquisitionCost(string $period, ?int $producerId): float
    {
        // Placeholder implementation
        return 25.50;
    }

    private function getROIMetrics(string $period, ?int $producerId): array
    {
        // Placeholder implementation
        return [];
    }

    private function getMarketPenetration(string $period, ?int $producerId): float
    {
        // Placeholder implementation
        return 15.2;
    }
}
