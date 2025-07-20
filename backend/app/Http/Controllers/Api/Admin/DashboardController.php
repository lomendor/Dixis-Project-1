<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use App\Models\User;
use App\Models\Product;
use App\Models\Order;
use App\Models\Producer;
use App\Models\ProductCategory;
use App\Models\AdoptableItem;

class DashboardController extends Controller
{
    /**
     * Get dashboard statistics for the admin.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getStats(Request $request)
    {
        // Ensure user is admin
        if (!$request->user()->hasRole('admin')) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        // Get date range from request or use default (current month)
        $startDate = $request->input('start_date') ? Carbon::parse($request->input('start_date')) : Carbon::now()->startOfMonth();
        $endDate = $request->input('end_date') ? Carbon::parse($request->input('end_date'))->endOfDay() : Carbon::now()->endOfDay();

        // Get user counts by role
        $userCounts = [
            'total' => User::count(),
            'consumers' => User::role('consumer')->count(),
            'producers' => User::role('producer')->count(),
            'business_users' => User::role('business_user')->count(),
            'admins' => User::role('admin')->count(),
        ];

        // Get new users counts (today, this week, this month)
        $today = Carbon::today();
        $yesterday = Carbon::yesterday();
        $startOfWeek = Carbon::now()->startOfWeek();
        $startOfMonth = Carbon::now()->startOfMonth();
        $startOfLastMonth = Carbon::now()->subMonth()->startOfMonth();

        // Calculate previous period for comparison
        $periodLength = $endDate->diffInDays($startDate) + 1;
        $previousPeriodStart = (clone $startDate)->subDays($periodLength);
        $previousPeriodEnd = (clone $startDate)->subDay();

        $newUserCounts = [
            'today' => User::whereDate('created_at', $today)->count(),
            'yesterday' => User::whereDate('created_at', $yesterday)->count(),
            'week' => User::where('created_at', '>=', $startOfWeek)->count(),
            'month' => User::where('created_at', '>=', $startOfMonth)->count(),
            'last_month' => User::whereBetween('created_at', [$startOfLastMonth, $startOfMonth])->count(),
            'selected_period' => User::whereBetween('created_at', [$startDate, $endDate])->count(),
            'previous_period' => User::whereBetween('created_at', [$previousPeriodStart, $previousPeriodEnd])->count(),
        ];

        // Get user growth percentage
        $userGrowth = [
            'daily' => $newUserCounts['yesterday'] > 0 ?
                (($newUserCounts['today'] - $newUserCounts['yesterday']) / $newUserCounts['yesterday']) * 100 : 0,
            'monthly' => $newUserCounts['last_month'] > 0 ?
                (($newUserCounts['month'] - $newUserCounts['last_month']) / $newUserCounts['last_month']) * 100 : 0,
            'period' => $newUserCounts['previous_period'] > 0 ?
                (($newUserCounts['selected_period'] - $newUserCounts['previous_period']) / $newUserCounts['previous_period']) * 100 : 0,
        ];

        // Get product counts
        $productCounts = [
            'total' => Product::count(),
            'active' => Product::where('is_active', true)->count(),
            'inactive' => Product::where('is_active', false)->count(),
            'featured' => Product::where('featured', true)->count(),
            'out_of_stock' => Product::where('stock_quantity', 0)->count(),
        ];

        // Get product stats by producer
        $productsPerProducer = DB::table('products')
            ->select('producer_id', DB::raw('COUNT(*) as product_count'))
            ->groupBy('producer_id')
            ->get();

        $productStats = [
            'avg_per_producer' => $productsPerProducer->avg('product_count') ?? 0,
            'max_per_producer' => $productsPerProducer->max('product_count') ?? 0,
            'producers_with_products' => $productsPerProducer->count(),
            'producers_without_products' => Producer::count() - $productsPerProducer->count(),
        ];

        // Get order counts by status
        $orderCounts = [
            'total' => Order::count(),
            'pending' => Order::where('status', 'pending')->count(),
            'processing' => Order::where('status', 'processing')->count(),
            'shipped' => Order::where('status', 'shipped')->count(),
            'delivered' => Order::where('status', 'delivered')->count(),
            'cancelled' => Order::where('status', 'cancelled')->count(),
        ];

        // Get order counts by time period
        $orderCountsByPeriod = [
            'today' => Order::whereDate('created_at', $today)->count(),
            'yesterday' => Order::whereDate('created_at', $yesterday)->count(),
            'week' => Order::where('created_at', '>=', $startOfWeek)->count(),
            'month' => Order::where('created_at', '>=', $startOfMonth)->count(),
            'last_month' => Order::whereBetween('created_at', [$startOfLastMonth, $startOfMonth])->count(),
            'selected_period' => Order::whereBetween('created_at', [$startDate, $endDate])->count(),
            'previous_period' => Order::whereBetween('created_at', [$previousPeriodStart, $previousPeriodEnd])->count(),
        ];

        // Get order growth percentage
        $orderGrowth = [
            'daily' => $orderCountsByPeriod['yesterday'] > 0 ?
                (($orderCountsByPeriod['today'] - $orderCountsByPeriod['yesterday']) / $orderCountsByPeriod['yesterday']) * 100 : 0,
            'monthly' => $orderCountsByPeriod['last_month'] > 0 ?
                (($orderCountsByPeriod['month'] - $orderCountsByPeriod['last_month']) / $orderCountsByPeriod['last_month']) * 100 : 0,
            'period' => $orderCountsByPeriod['previous_period'] > 0 ?
                (($orderCountsByPeriod['selected_period'] - $orderCountsByPeriod['previous_period']) / $orderCountsByPeriod['previous_period']) * 100 : 0,
        ];

        // Get total sales
        $totalSales = Order::where('status', '!=', 'cancelled')->sum('total_amount');

        // Get sales by time period
        $salesByPeriod = [
            'today' => Order::where('status', '!=', 'cancelled')->whereDate('created_at', $today)->sum('total_amount'),
            'yesterday' => Order::where('status', '!=', 'cancelled')->whereDate('created_at', $yesterday)->sum('total_amount'),
            'week' => Order::where('status', '!=', 'cancelled')->where('created_at', '>=', $startOfWeek)->sum('total_amount'),
            'month' => Order::where('status', '!=', 'cancelled')->where('created_at', '>=', $startOfMonth)->sum('total_amount'),
            'last_month' => Order::where('status', '!=', 'cancelled')->whereBetween('created_at', [$startOfLastMonth, $startOfMonth])->sum('total_amount'),
            'selected_period' => Order::where('status', '!=', 'cancelled')->whereBetween('created_at', [$startDate, $endDate])->sum('total_amount'),
            'previous_period' => Order::where('status', '!=', 'cancelled')->whereBetween('created_at', [$previousPeriodStart, $previousPeriodEnd])->sum('total_amount'),
        ];

        // Get sales growth percentage
        $salesGrowth = [
            'daily' => $salesByPeriod['yesterday'] > 0 ?
                (($salesByPeriod['today'] - $salesByPeriod['yesterday']) / $salesByPeriod['yesterday']) * 100 : 0,
            'monthly' => $salesByPeriod['last_month'] > 0 ?
                (($salesByPeriod['month'] - $salesByPeriod['last_month']) / $salesByPeriod['last_month']) * 100 : 0,
            'period' => $salesByPeriod['previous_period'] > 0 ?
                (($salesByPeriod['selected_period'] - $salesByPeriod['previous_period']) / $salesByPeriod['previous_period']) * 100 : 0,
        ];

        // Calculate Average Order Value (AOV)
        $completedOrdersCount = Order::where('status', '!=', 'cancelled')->count();
        $averageOrderValue = $completedOrdersCount > 0 ? $totalSales / $completedOrdersCount : 0;

        // Get sales by period (based on selected date range)
        $salesByPeriodDetailed = [];

        // Calculate the number of days in the selected period
        $daysInPeriod = $endDate->diffInDays($startDate) + 1;

        if ($daysInPeriod <= 31) {
            // If period is 31 days or less, show daily data
            for ($i = 0; $i < $daysInPeriod; $i++) {
                $day = (clone $startDate)->addDays($i);
                $dayStart = $day->copy()->startOfDay();
                $dayEnd = $day->copy()->endOfDay();

                $dailySales = Order::where('status', '!=', 'cancelled')
                    ->whereBetween('created_at', [$dayStart, $dayEnd])
                    ->sum('total_amount');

                $salesByPeriodDetailed[$day->format('d M')] = $dailySales;
            }
        } else if ($daysInPeriod <= 92) {
            // If period is 3 months or less, show weekly data
            $currentDay = clone $startDate;
            while ($currentDay->lte($endDate)) {
                $weekStart = $currentDay->copy()->startOfDay();
                $weekEnd = $currentDay->copy()->addDays(6)->endOfDay();

                // Ensure we don't go beyond the end date
                if ($weekEnd->gt($endDate)) {
                    $weekEnd = $endDate->copy()->endOfDay();
                }

                $weeklySales = Order::where('status', '!=', 'cancelled')
                    ->whereBetween('created_at', [$weekStart, $weekEnd])
                    ->sum('total_amount');

                $salesByPeriodDetailed[$weekStart->format('d M') . ' - ' . $weekEnd->format('d M')] = $weeklySales;

                $currentDay->addDays(7);
            }
        } else {
            // If period is more than 3 months, show monthly data
            $currentMonth = clone $startDate;
            $currentMonth->startOfMonth();

            while ($currentMonth->lte($endDate)) {
                $monthStart = $currentMonth->copy()->startOfMonth();
                $monthEnd = $currentMonth->copy()->endOfMonth();

                // Ensure we don't go beyond the end date
                if ($monthEnd->gt($endDate)) {
                    $monthEnd = $endDate->copy()->endOfDay();
                }

                $monthlySales = Order::where('status', '!=', 'cancelled')
                    ->whereBetween('created_at', [$monthStart, $monthEnd])
                    ->sum('total_amount');

                $salesByPeriodDetailed[$currentMonth->format('M Y')] = $monthlySales;

                $currentMonth->addMonth();
            }
        }

        // Also keep the original sales by month for backward compatibility
        $salesByMonth = [];
        for ($i = 0; $i < 12; $i++) {
            $month = Carbon::now()->subMonths($i);
            $startOfMonth = $month->copy()->startOfMonth();
            $endOfMonth = $month->copy()->endOfMonth();

            $monthlySales = Order::where('status', '!=', 'cancelled')
                ->whereBetween('created_at', [$startOfMonth, $endOfMonth])
                ->sum('total_amount');

            $salesByMonth[$month->format('M Y')] = $monthlySales;
        }

        // Get user registrations by period (based on selected date range)
        $userRegistrationsByPeriod = [];

        if ($daysInPeriod <= 31) {
            // If period is 31 days or less, show daily data
            for ($i = 0; $i < $daysInPeriod; $i++) {
                $day = (clone $startDate)->addDays($i);
                $dayStart = $day->copy()->startOfDay();
                $dayEnd = $day->copy()->endOfDay();

                $dailyRegistrations = User::whereBetween('created_at', [$dayStart, $dayEnd])->count();

                $userRegistrationsByPeriod[$day->format('d M')] = $dailyRegistrations;
            }
        } else if ($daysInPeriod <= 92) {
            // If period is 3 months or less, show weekly data
            $currentDay = clone $startDate;
            while ($currentDay->lte($endDate)) {
                $weekStart = $currentDay->copy()->startOfDay();
                $weekEnd = $currentDay->copy()->addDays(6)->endOfDay();

                // Ensure we don't go beyond the end date
                if ($weekEnd->gt($endDate)) {
                    $weekEnd = $endDate->copy()->endOfDay();
                }

                $weeklyRegistrations = User::whereBetween('created_at', [$weekStart, $weekEnd])->count();

                $userRegistrationsByPeriod[$weekStart->format('d M') . ' - ' . $weekEnd->format('d M')] = $weeklyRegistrations;

                $currentDay->addDays(7);
            }
        } else {
            // If period is more than 3 months, show monthly data
            $currentMonth = clone $startDate;
            $currentMonth->startOfMonth();

            while ($currentMonth->lte($endDate)) {
                $monthStart = $currentMonth->copy()->startOfMonth();
                $monthEnd = $currentMonth->copy()->endOfMonth();

                // Ensure we don't go beyond the end date
                if ($monthEnd->gt($endDate)) {
                    $monthEnd = $endDate->copy()->endOfDay();
                }

                $monthlyRegistrations = User::whereBetween('created_at', [$monthStart, $monthEnd])->count();

                $userRegistrationsByPeriod[$currentMonth->format('M Y')] = $monthlyRegistrations;

                $currentMonth->addMonth();
            }
        }

        // Also keep the original user registrations by month for backward compatibility
        $userRegistrationsByMonth = [];
        for ($i = 0; $i < 12; $i++) {
            $month = Carbon::now()->subMonths($i);
            $startOfMonth = $month->copy()->startOfMonth();
            $endOfMonth = $month->copy()->endOfMonth();

            $monthlyRegistrations = User::whereBetween('created_at', [$startOfMonth, $endOfMonth])->count();

            $userRegistrationsByMonth[$month->format('M Y')] = $monthlyRegistrations;
        }

        // Get orders by period (based on selected date range)
        $ordersByPeriod = [];

        if ($daysInPeriod <= 31) {
            // If period is 31 days or less, show daily data
            for ($i = 0; $i < $daysInPeriod; $i++) {
                $day = (clone $startDate)->addDays($i);
                $dayStart = $day->copy()->startOfDay();
                $dayEnd = $day->copy()->endOfDay();

                $dailyOrders = Order::whereBetween('created_at', [$dayStart, $dayEnd])->count();

                $ordersByPeriod[$day->format('d M')] = $dailyOrders;
            }
        } else if ($daysInPeriod <= 92) {
            // If period is 3 months or less, show weekly data
            $currentDay = clone $startDate;
            while ($currentDay->lte($endDate)) {
                $weekStart = $currentDay->copy()->startOfDay();
                $weekEnd = $currentDay->copy()->addDays(6)->endOfDay();

                // Ensure we don't go beyond the end date
                if ($weekEnd->gt($endDate)) {
                    $weekEnd = $endDate->copy()->endOfDay();
                }

                $weeklyOrders = Order::whereBetween('created_at', [$weekStart, $weekEnd])->count();

                $ordersByPeriod[$weekStart->format('d M') . ' - ' . $weekEnd->format('d M')] = $weeklyOrders;

                $currentDay->addDays(7);
            }
        } else {
            // If period is more than 3 months, show monthly data
            $currentMonth = clone $startDate;
            $currentMonth->startOfMonth();

            while ($currentMonth->lte($endDate)) {
                $monthStart = $currentMonth->copy()->startOfMonth();
                $monthEnd = $currentMonth->copy()->endOfMonth();

                // Ensure we don't go beyond the end date
                if ($monthEnd->gt($endDate)) {
                    $monthEnd = $endDate->copy()->endOfDay();
                }

                $monthlyOrders = Order::whereBetween('created_at', [$monthStart, $monthEnd])->count();

                $ordersByPeriod[$currentMonth->format('M Y')] = $monthlyOrders;

                $currentMonth->addMonth();
            }
        }

        // Also keep the original orders by month for backward compatibility
        $ordersByMonth = [];
        for ($i = 0; $i < 12; $i++) {
            $month = Carbon::now()->subMonths($i);
            $startOfMonth = $month->copy()->startOfMonth();
            $endOfMonth = $month->copy()->endOfMonth();

            $monthlyOrders = Order::whereBetween('created_at', [$startOfMonth, $endOfMonth])->count();

            $ordersByMonth[$month->format('M Y')] = $monthlyOrders;
        }

        // Get pending producers count
        $pendingProducersCount = Producer::where('verified', false)->count();

        // Get recent orders (last 10)
        $recentOrders = Order::with(['user:id,name,email', 'items.product:id,name,sku,main_image'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get(['id', 'user_id', 'status', 'total_amount', 'created_at']);

        // Add order number (using id as order number)
        $recentOrders->each(function ($order) {
            $order->order_number = 'ORD-' . str_pad($order->id, 8, '0', STR_PAD_LEFT);
            $order->total = $order->total_amount;
            $order->items_count = $order->items->sum('quantity');
        });

        // Get recent users (last 5)
        $recentUsers = User::orderBy('created_at', 'desc')
            ->limit(5)
            ->get(['id', 'name', 'email', 'created_at']);

        // Add roles to each user
        $recentUsers->each(function ($user) {
            $user->role = $user->getRoleNames()->first();
        });

        // Get pending producers (last 5)
        $pendingProducers = Producer::with(['user:id,name,email'])
            ->where('verified', false)
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get(['id', 'user_id', 'business_name', 'created_at']);

        // Get top selling products for the selected period
        $topProducts = DB::table('order_items')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('orders.status', '!=', 'cancelled')
            ->whereBetween('orders.created_at', [$startDate, $endDate])
            ->select(
                'products.id',
                'products.name',
                'products.main_image',
                'products.price',
                DB::raw('SUM(order_items.quantity) as total_quantity'),
                DB::raw('SUM(order_items.subtotal) as total_revenue')
            )
            ->groupBy('products.id', 'products.name', 'products.main_image', 'products.price')
            ->orderBy('total_revenue', 'desc')
            ->limit(5)
            ->get();

        // Get top producers by sales for the selected period
        $topProducers = DB::table('order_items')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('producers', 'products.producer_id', '=', 'producers.id')
            ->where('orders.status', '!=', 'cancelled')
            ->whereBetween('orders.created_at', [$startDate, $endDate])
            ->select(
                'producers.id',
                'producers.business_name',
                DB::raw('SUM(order_items.subtotal) as total_revenue'),
                DB::raw('COUNT(DISTINCT orders.id) as orders_count')
            )
            ->groupBy('producers.id', 'producers.business_name')
            ->orderBy('total_revenue', 'desc')
            ->limit(5)
            ->get();

        // Get category counts
        $categoryCount = ProductCategory::count();

        // Get categories with product counts
        $categoriesWithCounts = ProductCategory::withCount('products')->orderBy('products_count', 'desc')->limit(5)->get();

        // Get adoptable items count
        $adoptableItemsCount = AdoptableItem::count();

        // Get order statistics for dashboard
        $orderStats = [
            'total_orders' => Order::count(),
            'orders_by_status' => [
                'pending' => Order::where('status', 'pending')->count(),
                'processing' => Order::where('status', 'processing')->count(),
                'shipped' => Order::where('status', 'shipped')->count(),
                'delivered' => Order::where('status', 'delivered')->count(),
                'cancelled' => Order::where('status', 'cancelled')->count(),
            ],
            'orders_by_payment_status' => [
                'pending' => Order::where('payment_status', 'pending')->count(),
                'paid' => Order::where('payment_status', 'paid')->count(),
                'failed' => Order::where('payment_status', 'failed')->count(),
                'refunded' => Order::where('payment_status', 'refunded')->count(),
            ],
            'total_revenue' => Order::where('status', '!=', 'cancelled')->sum('total_amount'),
            'average_order_value' => Order::where('status', '!=', 'cancelled')->avg('total_amount') ?? 0,
            'recent_period' => [
                'orders' => Order::where('created_at', '>=', now()->subDays(30))->count(),
                'revenue' => Order::where('created_at', '>=', now()->subDays(30))
                                ->where('status', '!=', 'cancelled')
                                ->sum('total_amount'),
            ],
        ];

        return response()->json([
            'user_counts' => $userCounts,
            'new_user_counts' => $newUserCounts,
            'user_growth' => $userGrowth,
            'product_counts' => $productCounts,
            'product_stats' => $productStats,
            'order_counts' => $orderCounts,
            'order_counts_by_period' => $orderCountsByPeriod,
            'order_growth' => $orderGrowth,
            'total_sales' => $totalSales,
            'sales_by_period' => $salesByPeriod,
            'sales_growth' => $salesGrowth,
            'average_order_value' => $averageOrderValue,
            'sales_by_month' => $salesByMonth,
            'sales_by_period_detailed' => $salesByPeriodDetailed,
            'user_registrations_by_month' => $userRegistrationsByMonth,
            'user_registrations_by_period' => $userRegistrationsByPeriod,
            'orders_by_month' => $ordersByMonth,
            'orders_by_period' => $ordersByPeriod,
            'pending_producers_count' => $pendingProducersCount,
            'recent_orders' => $recentOrders,
            'recent_users' => $recentUsers,
            'pending_producers' => $pendingProducers,
            'top_products' => $topProducts,
            'top_producers' => $topProducers,
            'category_count' => $categoryCount,
            'top_categories' => $categoriesWithCounts,
            'adoptable_items_count' => $adoptableItemsCount,
            'order_stats' => $orderStats,
            'date_range' => [
                'start_date' => $startDate->toDateString(),
                'end_date' => $endDate->toDateString(),
                'previous_period_start' => $previousPeriodStart->toDateString(),
                'previous_period_end' => $previousPeriodEnd->toDateString(),
                'days_in_period' => $daysInPeriod,
            ],
        ]);
    }
}
