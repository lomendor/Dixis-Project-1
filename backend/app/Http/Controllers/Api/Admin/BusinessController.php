<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Business;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class BusinessController extends Controller
{
    /**
     * Display a listing of the businesses.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        // Validate request parameters
        $request->validate([
            'search' => 'sometimes|string|max:100',
            'status' => ['sometimes', 'string', Rule::in(['verified', 'pending', 'all'])],
            'business_type' => 'sometimes|string|max:100',
            'per_page' => 'sometimes|integer|min:5|max:100',
            'page' => 'sometimes|integer|min:1',
            'sort_by' => ['sometimes', 'string', Rule::in(['id', 'name', 'created_at'])],
            'sort_direction' => ['sometimes', 'string', Rule::in(['asc', 'desc'])],
        ]);

        // Build query
        $query = Business::with('user:id,name,email');

        // Apply filters
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('tax_id', 'like', "%{$search}%")
                  ->orWhere('city', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($userQuery) use ($search) {
                      $userQuery->where('name', 'like', "%{$search}%")
                                ->orWhere('email', 'like', "%{$search}%");
                  });
            });
        }

        if ($request->has('status') && $request->status !== 'all') {
            if ($request->status === 'verified') {
                $query->where('verified', true);
            } elseif ($request->status === 'pending') {
                $query->where('verified', false);
            }
        }

        if ($request->has('business_type') && $request->business_type) {
            $query->where('business_type', $request->business_type);
        }

        // Apply sorting
        $sortBy = $request->sort_by ?? 'created_at';
        $sortDirection = $request->sort_direction ?? 'desc';
        $query->orderBy($sortBy, $sortDirection);

        // Paginate results
        $perPage = $request->per_page ?? 15;
        $businesses = $query->paginate($perPage);

        return response()->json($businesses);
    }

    /**
     * Display the specified business.
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $business = Business::with([
            'user:id,name,email,phone',
            'subscription',
        ])->findOrFail($id);

        return response()->json($business);
    }

    /**
     * Update the specified business.
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $business = Business::findOrFail($id);

        // Validate request
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'business_type' => ['sometimes', 'string', Rule::in(['restaurant', 'hotel', 'catering', 'retail', 'other'])],
            'tax_id' => ['sometimes', 'string', 'max:20', Rule::unique('businesses')->ignore($business->id)],
            'tax_office' => 'sometimes|string|max:255',
            'address' => 'sometimes|string|max:255',
            'city' => 'sometimes|string|max:100',
            'postal_code' => 'sometimes|string|max:20',
            'phone' => 'sometimes|string|max:20',
            'email' => ['sometimes', 'email', Rule::unique('businesses')->ignore($business->id)],
            'website' => 'sometimes|nullable|url|max:255',
            'description' => 'sometimes|nullable|string',
            'contact_person' => 'sometimes|nullable|string|max:255',
            'verified' => 'sometimes|boolean',
        ]);

        // Update business
        $business->update($validated);

        return response()->json([
            'message' => 'Business updated successfully',
            'business' => $business->fresh(['user:id,name,email,phone']),
        ]);
    }

    /**
     * Verify a business.
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function verify($id)
    {
        $business = Business::findOrFail($id);
        $business->verified = true;
        $business->save();

        // TODO: Send notification to business

        return response()->json([
            'message' => 'Business verified successfully',
            'business' => $business->fresh(),
        ]);
    }

    /**
     * Reject a business.
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function reject(Request $request, $id)
    {
        $request->validate([
            'reason' => 'required|string',
        ]);

        $business = Business::findOrFail($id);
        
        // We don't delete the business, just keep it unverified
        // and store the rejection reason for future reference
        $business->verified = false;
        $business->rejection_reason = $request->reason;
        $business->save();

        // TODO: Send notification to business with rejection reason

        return response()->json([
            'message' => 'Business rejected successfully',
            'business' => $business->fresh(),
        ]);
    }

    /**
     * Get pending businesses.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getPendingBusinesses()
    {
        $pendingBusinesses = Business::with('user:id,name,email')
            ->where('verified', false)
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return response()->json($pendingBusinesses);
    }

    /**
     * Get business statistics.
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function getStats($id)
    {
        $business = Business::findOrFail($id);

        // Get order count and total purchases
        $orders = DB::table('orders')
            ->where('business_id', $business->id)
            ->where('status', '!=', 'cancelled')
            ->select(
                DB::raw('COUNT(id) as order_count'),
                DB::raw('SUM(total) as total_purchases')
            )
            ->first();

        $orderCount = $orders->order_count ?? 0;
        $totalPurchases = $orders->total_purchases ?? 0;

        // Get recent orders
        $recentOrders = DB::table('orders')
            ->where('business_id', $business->id)
            ->select(
                'id',
                'order_number',
                'status',
                'total',
                'created_at'
            )
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        // Get subscription info
        $subscription = $business->subscription;

        return response()->json([
            'order_count' => $orderCount,
            'total_purchases' => $totalPurchases,
            'recent_orders' => $recentOrders,
            'subscription' => $subscription,
        ]);
    }
}
