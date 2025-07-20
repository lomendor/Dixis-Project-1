<?php

namespace App\Http\Controllers\Api\Business;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Order;

class OrderController extends Controller
{
    /**
     * Get orders for the authenticated business user.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getBusinessOrders(Request $request)
    {
        $user = Auth::user();
        $business = $user->business;
        
        if (!$business) {
            return response()->json(['message' => 'Business profile not found'], 404);
        }
        
        $query = Order::where('business_id', $business->id);
        
        // Apply filters
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }
        
        if ($request->has('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        
        if ($request->has('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }
        
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                  ->orWhere('id', 'like', "%{$search}%");
            });
        }
        
        // Apply sorting
        $sortField = $request->sort_field ?? 'created_at';
        $sortDirection = $request->sort_direction ?? 'desc';
        $query->orderBy($sortField, $sortDirection);
        
        // Paginate results
        $perPage = $request->per_page ?? 10;
        $orders = $query->with(['items.product', 'shippingAddress'])->paginate($perPage);
        
        return response()->json($orders);
    }
    
    /**
     * Get order details for the authenticated business user.
     *
     * @param int $orderId
     * @return \Illuminate\Http\JsonResponse
     */
    public function getBusinessOrderDetails($orderId)
    {
        $user = Auth::user();
        $business = $user->business;
        
        if (!$business) {
            return response()->json(['message' => 'Business profile not found'], 404);
        }
        
        $order = Order::where('id', $orderId)
            ->where('business_id', $business->id)
            ->with(['items.product', 'shippingAddress', 'billingAddress', 'payments'])
            ->first();
        
        if (!$order) {
            return response()->json(['message' => 'Order not found'], 404);
        }
        
        return response()->json($order);
    }
}
