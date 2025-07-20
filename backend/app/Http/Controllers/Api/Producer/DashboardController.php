<?php

namespace App\Http\Controllers\Api\Producer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * Get dashboard statistics for the authenticated producer.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getStats(Request $request)
    {
        $user = Auth::user();
        $producer = $user->producer;

        if (!$producer) {
            return response()->json(['message' => 'Producer not found.'], 404);
        }

        // Get producer's products
        $productIds = $producer->products()->pluck('id')->toArray();
        $totalProducts = count($productIds);

        // Get adoptable items count
        $adoptableItems = $producer->adoptableItems()->count();

        // Initialize variables
        $totalOrders = 0;
        $totalSales = 0;
        $recentOrders = [];
        $salesByStatus = [
            'pending' => 0,
            'processing' => 0,
            'shipped' => 0,
            'delivered' => 0,
            'cancelled' => 0
        ];
        $salesByMonth = [];
        $topProducts = [];

        // Initialize sales by month for the last 6 months
        for ($i = 5; $i >= 0; $i--) {
            $month = Carbon::now()->subMonths($i);
            $monthKey = $month->format('M Y');
            $salesByMonth[$monthKey] = 0;
        }

        // If there are products, get order statistics
        if (!empty($productIds)) {
            try {
                // Get total orders and sales
                $orderStats = DB::table('order_items')
                    ->join('orders', 'order_items.order_id', '=', 'orders.id')
                    ->whereIn('order_items.product_id', $productIds)
                    ->select(
                        DB::raw('COUNT(DISTINCT orders.id) as total_orders'),
                        DB::raw('SUM(order_items.subtotal) as total_sales')
                    )
                    ->first();

                // Check if the query returned null values and handle them

                $totalOrders = $orderStats->total_orders ?? 0;
                $totalSales = $orderStats->total_sales ?? 0;

                // Get sales by status
                $salesByStatusData = DB::table('order_items')
                    ->join('orders', 'order_items.order_id', '=', 'orders.id')
                    ->whereIn('order_items.product_id', $productIds)
                    ->whereNotNull('orders.status') // Ensure status is not null
                    ->select(
                        'orders.status',
                        DB::raw('SUM(order_items.subtotal) as total')
                    )
                    ->groupBy('orders.status')
                    ->get();

                foreach ($salesByStatusData as $item) {
                    // Check if status exists in our predefined array
                    if (isset($salesByStatus[$item->status])) {
                        $salesByStatus[$item->status] = (float)$item->total;
                    } else {
                        // If we have a status that's not in our predefined array, add it
                        $salesByStatus[$item->status] = (float)$item->total;
                    }
                }

                // Get sales by month
                foreach ($salesByMonth as $month => $value) {
                    try {
                        $startDate = Carbon::createFromFormat('M Y', $month)->startOfMonth();
                        $endDate = Carbon::createFromFormat('M Y', $month)->endOfMonth();

                        $monthlySales = DB::table('order_items')
                            ->join('orders', 'order_items.order_id', '=', 'orders.id')
                            ->whereIn('order_items.product_id', $productIds)
                            ->whereBetween('orders.created_at', [$startDate, $endDate])
                            ->sum('order_items.subtotal');

                        $salesByMonth[$month] = (float)$monthlySales;
                    } catch (\Exception $e) {
                        \Log::error('Error calculating sales for month ' . $month . ': ' . $e->getMessage());
                        $salesByMonth[$month] = 0;
                    }
                }

                // Get top products
                try {
                    $topProducts = DB::table('order_items')
                        ->join('products', 'order_items.product_id', '=', 'products.id')
                        ->whereIn('order_items.product_id', $productIds)
                        ->select(
                            'products.id',
                            'products.name',
                            'products.main_image',
                            DB::raw('SUM(order_items.quantity) as total_sold'),
                            DB::raw('SUM(order_items.subtotal) as total_revenue')
                        )
                        ->groupBy('products.id', 'products.name', 'products.main_image')
                        ->orderBy('total_revenue', 'desc')
                        ->limit(5)
                        ->get();

                    // Convert numeric values to proper types
                    foreach ($topProducts as $product) {
                        $product->total_sold = (int)$product->total_sold;
                        $product->total_revenue = (float)$product->total_revenue;
                    }
                } catch (\Exception $e) {
                    \Log::error('Error fetching top products: ' . $e->getMessage());
                    $topProducts = [];
                }

                // Get recent orders
                try {
                    $recentOrders = DB::table('orders')
                        ->join('order_items', 'orders.id', '=', 'order_items.order_id')
                        ->whereIn('order_items.product_id', $productIds)
                        ->select(
                            'orders.id',
                            DB::raw("'ORD-' || orders.id as order_number"),
                            'orders.created_at',
                            'orders.status'
                        )
                        ->distinct()
                        ->orderBy('orders.created_at', 'desc')
                        ->limit(5)
                        ->get();
                } catch (\Exception $e) {
                    \Log::error('Error fetching recent orders: ' . $e->getMessage());
                    $recentOrders = [];
                }
            } catch (\Exception $e) {
                // Log the error but continue with default values
                \Log::error('Error fetching producer dashboard stats: ' . $e->getMessage());
            }
        } else {
            // No products found, return empty data with a message
            return response()->json([
                'total_products' => 0,
                'total_orders' => 0,
                'total_sales' => 0,
                'recent_orders' => [],
                'sales_by_status' => $salesByStatus,
                'sales_by_month' => $salesByMonth,
                'top_products' => [],
                'pending_questions' => 0,
                'adoptable_items' => 0,
                'message' => 'Δεν έχετε προσθέσει ακόμα προϊόντα. Προσθέστε προϊόντα για να δείτε στατιστικά.',
                'no_data' => true
            ]);
        }

        // Get pending questions count
        $pendingQuestions = 0;
        try {
            if (Schema::hasTable('product_questions')) {
                $pendingQuestions = DB::table('product_questions')
                    ->whereIn('product_id', $productIds)
                    ->whereNull('answer')
                    ->count();
            }
        } catch (\Exception $e) {
            \Log::error('Error fetching pending questions: ' . $e->getMessage());
        }

        return response()->json([
            'total_products' => $totalProducts,
            'total_orders' => $totalOrders,
            'total_sales' => $totalSales,
            'recent_orders' => $recentOrders,
            'sales_by_status' => $salesByStatus,
            'sales_by_month' => $salesByMonth,
            'top_products' => $topProducts,
            'pending_questions' => $pendingQuestions,
            'adoptable_items' => $adoptableItems,
        ]);
    }
}
