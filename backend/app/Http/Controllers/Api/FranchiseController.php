<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Models\User;
use App\Models\RevenueShare;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class FranchiseController extends Controller
{
    /**
     * Get all tenants (admin only)
     */
    public function index(Request $request): JsonResponse
    {
        $query = Tenant::with(['owner', 'theme']);
        
        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        
        // Filter by plan
        if ($request->has('plan')) {
            $query->where('plan', $request->plan);
        }
        
        // Search by name
        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }
        
        $tenants = $query->paginate($request->get('per_page', 15));
        
        return response()->json([
            'tenants' => $tenants->items(),
            'pagination' => [
                'current_page' => $tenants->currentPage(),
                'last_page' => $tenants->lastPage(),
                'per_page' => $tenants->perPage(),
                'total' => $tenants->total()
            ]
        ]);
    }

    /**
     * Create new franchise tenant
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'owner_email' => 'required|email|unique:users,email',
            'owner_name' => 'required|string|max:255',
            'owner_password' => 'required|string|min:8',
            'plan' => 'required|in:basic,premium,enterprise',
            'domain' => 'nullable|string|unique:tenants,domain',
            'trial_days' => 'nullable|integer|min:0|max:90'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        DB::beginTransaction();
        
        try {
            // Create owner user
            $owner = User::create([
                'name' => $request->owner_name,
                'email' => $request->owner_email,
                'password' => Hash::make($request->owner_password),
                'role' => 'franchise_owner'
            ]);

            // Create tenant
            $trialDays = $request->get('trial_days', 14);
            $tenant = Tenant::create([
                'name' => $request->name,
                'owner_id' => $owner->id,
                'plan' => $request->plan,
                'domain' => $request->domain,
                'status' => Tenant::STATUS_TRIAL,
                'trial_ends_at' => now()->addDays($trialDays),
                'subscription_expires_at' => null
            ]);

            // Update owner with tenant_id
            $owner->update(['tenant_id' => $tenant->id]);

            DB::commit();

            return response()->json([
                'message' => 'Franchise created successfully',
                'tenant' => $tenant->load(['owner', 'theme']),
                'login_url' => $tenant->getUrl() . '/login',
                'trial_expires' => $tenant->trial_ends_at->format('Y-m-d H:i:s')
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'error' => 'Failed to create franchise',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get specific tenant details
     */
    public function show(Tenant $tenant): JsonResponse
    {
        $tenant->load(['owner', 'theme', 'revenueShares' => function($query) {
            $query->latest()->limit(10);
        }]);

        $analytics = $this->getTenantAnalytics($tenant);

        return response()->json([
            'tenant' => $tenant,
            'analytics' => $analytics
        ]);
    }

    /**
     * Update tenant
     */
    public function update(Request $request, Tenant $tenant): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'plan' => 'sometimes|in:basic,premium,enterprise',
            'status' => 'sometimes|in:active,inactive,suspended,trial',
            'domain' => 'sometimes|string|unique:tenants,domain,' . $tenant->id,
            'subscription_expires_at' => 'sometimes|date|after:now',
            'trial_ends_at' => 'sometimes|date'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $tenant->update($request->only([
            'name', 'plan', 'status', 'domain', 
            'subscription_expires_at', 'trial_ends_at'
        ]));

        return response()->json([
            'message' => 'Tenant updated successfully',
            'tenant' => $tenant->fresh(['owner', 'theme'])
        ]);
    }

    /**
     * Suspend tenant
     */
    public function suspend(Tenant $tenant): JsonResponse
    {
        $tenant->update(['status' => Tenant::STATUS_SUSPENDED]);

        return response()->json([
            'message' => 'Tenant suspended successfully',
            'tenant' => $tenant
        ]);
    }

    /**
     * Activate tenant
     */
    public function activate(Tenant $tenant): JsonResponse
    {
        $tenant->update(['status' => Tenant::STATUS_ACTIVE]);

        return response()->json([
            'message' => 'Tenant activated successfully',
            'tenant' => $tenant
        ]);
    }

    /**
     * Delete tenant
     */
    public function destroy(Tenant $tenant): JsonResponse
    {
        $tenant->delete();

        return response()->json([
            'message' => 'Tenant deleted successfully'
        ]);
    }

    /**
     * Get tenant analytics
     */
    public function analytics(Tenant $tenant): JsonResponse
    {
        $analytics = $this->getTenantAnalytics($tenant);

        return response()->json($analytics);
    }

    /**
     * Get revenue share summary for tenant
     */
    public function revenueShares(Request $request, Tenant $tenant): JsonResponse
    {
        $startDate = $request->get('start_date', now()->startOfMonth());
        $endDate = $request->get('end_date', now()->endOfMonth());

        $summary = RevenueShare::getSummaryForTenant($tenant, $startDate, $endDate);
        
        $recentShares = $tenant->revenueShares()
            ->with('order')
            ->latest()
            ->paginate(20);

        return response()->json([
            'summary' => $summary,
            'recent_shares' => $recentShares
        ]);
    }

    /**
     * Get all pending payouts
     */
    public function pendingPayouts(): JsonResponse
    {
        $payouts = RevenueShare::getPendingPayouts();

        return response()->json([
            'pending_payouts' => $payouts,
            'total_amount' => collect($payouts)->sum('total_payout'),
            'total_tenants' => count($payouts)
        ]);
    }

    /**
     * Process batch payout
     */
    public function processPayout(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'tenant_ids' => 'required|array',
            'tenant_ids.*' => 'exists:tenants,id',
            'payout_reference' => 'required|string|max:255'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $processed = RevenueShare::processBatchPayout(
            $request->tenant_ids,
            $request->payout_reference
        );

        return response()->json([
            'message' => 'Payout processed successfully',
            'processed_count' => $processed,
            'payout_reference' => $request->payout_reference
        ]);
    }

    /**
     * Get platform statistics
     */
    public function platformStats(): JsonResponse
    {
        $stats = [
            'total_tenants' => Tenant::count(),
            'active_tenants' => Tenant::where('status', Tenant::STATUS_ACTIVE)->count(),
            'trial_tenants' => Tenant::where('status', Tenant::STATUS_TRIAL)->count(),
            'suspended_tenants' => Tenant::where('status', Tenant::STATUS_SUSPENDED)->count(),
            'total_revenue_this_month' => RevenueShare::whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->sum('commission_amount'),
            'pending_payouts' => RevenueShare::where('status', RevenueShare::STATUS_APPROVED)
                ->sum('net_amount'),
            'plans_distribution' => Tenant::selectRaw('plan, COUNT(*) as count')
                ->groupBy('plan')
                ->pluck('count', 'plan')
        ];

        return response()->json($stats);
    }

    /**
     * Get tenant analytics data
     */
    private function getTenantAnalytics(Tenant $tenant): array
    {
        $currentMonth = now();
        $lastMonth = now()->subMonth();

        return [
            'current_month' => [
                'revenue' => $tenant->getMonthlyRevenue(),
                'commission' => $tenant->getMonthlyCommission(),
                'orders' => $tenant->orders()
                    ->whereYear('created_at', $currentMonth->year)
                    ->whereMonth('created_at', $currentMonth->month)
                    ->count(),
                'products' => $tenant->products()->count(),
                'users' => $tenant->users()->count()
            ],
            'last_month' => [
                'revenue' => $tenant->orders()
                    ->whereYear('created_at', $lastMonth->year)
                    ->whereMonth('created_at', $lastMonth->month)
                    ->where('status', 'completed')
                    ->sum('total_amount'),
                'orders' => $tenant->orders()
                    ->whereYear('created_at', $lastMonth->year)
                    ->whereMonth('created_at', $lastMonth->month)
                    ->count()
            ],
            'plan_features' => $tenant->getPlanFeatures(),
            'subscription_status' => [
                'is_trial' => $tenant->isOnTrial(),
                'trial_ends_at' => $tenant->trial_ends_at,
                'subscription_expires_at' => $tenant->subscription_expires_at,
                'is_expired' => $tenant->isSubscriptionExpired()
            ]
        ];
    }
}
