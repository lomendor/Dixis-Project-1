<?php

namespace App\Http\Controllers\Api\Business;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Models\Order;
use App\Models\Subscription;
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * Get dashboard statistics for the authenticated business user.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getStats()
    {
        $user = Auth::user();
        $business = $user->business;
        
        if (!$business) {
            return response()->json(['message' => 'Business profile not found'], 404);
        }
        
        try {
            // Get total orders and total spent
            $orderStats = DB::table('orders')
                ->where('business_id', $business->id)
                ->select(
                    DB::raw('COUNT(id) as total_orders'),
                    DB::raw('SUM(total_amount) as total_spent')
                )
                ->first();
            
            $totalOrders = $orderStats->total_orders ?? 0;
            $totalSpent = $orderStats->total_spent ?? 0;
            
            // Get recent orders
            $recentOrders = Order::where('business_id', $business->id)
                ->select('id', 'order_number', 'created_at', 'status', 'total_amount')
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get();
            
            // Get current subscription
            $subscription = Subscription::with('plan')
                ->where('subscribable_type', 'App\\Models\\Business')
                ->where('subscribable_id', $business->id)
                ->where('status', 'active')
                ->whereDate('end_date', '>=', Carbon::now())
                ->orderBy('created_at', 'desc')
                ->first();
            
            // Prepare subscription data
            $subscriptionData = null;
            if ($subscription) {
                $subscriptionData = [
                    'plan' => [
                        'name' => $subscription->plan->name,
                        'commission_rate' => $subscription->plan->commission_rate,
                    ],
                    'status' => $subscription->status,
                    'end_date' => $subscription->end_date,
                ];
            }
            
            return response()->json([
                'total_orders' => $totalOrders,
                'total_spent' => $totalSpent,
                'recent_orders' => $recentOrders,
                'subscription' => $subscriptionData,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error fetching dashboard statistics',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
