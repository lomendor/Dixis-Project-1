<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\SubscriptionPlan;
use App\Models\Subscription;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class SubscriptionController extends Controller
{
    /**
     * Display a listing of the subscription plans.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function indexPlans(Request $request)
    {
        // Validate request parameters
        $request->validate([
            'target_type' => ['sometimes', 'string', Rule::in(['business', 'producer', 'all'])],
            'is_active' => 'sometimes|boolean',
            'per_page' => 'sometimes|integer|min:5|max:100',
            'page' => 'sometimes|integer|min:1',
        ]);

        // Build query
        $query = SubscriptionPlan::query();

        // Apply filters
        if ($request->has('target_type') && $request->target_type !== 'all') {
            $query->where('target_type', $request->target_type);
        }

        if ($request->has('is_active')) {
            $query->where('is_active', $request->is_active);
        }

        // Apply sorting
        $query->orderBy('target_type', 'asc')->orderBy('price', 'asc');

        // Paginate results
        $perPage = $request->per_page ?? 15;
        $plans = $query->paginate($perPage);

        return response()->json($plans);
    }

    /**
     * Store a newly created subscription plan.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function storePlan(Request $request)
    {
        // Validate request
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'target_type' => ['required', 'string', Rule::in(['business', 'producer'])],
            'price' => 'required|numeric|min:0',
            'billing_cycle' => ['required', 'string', Rule::in(['monthly', 'annually'])],
            'commission_rate' => 'nullable|numeric|min:0|max:100',
            'features' => 'nullable|array',
            'is_active' => 'boolean',
        ]);

        // Create subscription plan
        $plan = SubscriptionPlan::create($validated);

        return response()->json([
            'message' => 'Subscription plan created successfully',
            'plan' => $plan,
        ], 201);
    }

    /**
     * Display the specified subscription plan.
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function showPlan($id)
    {
        $plan = SubscriptionPlan::findOrFail($id);

        return response()->json($plan);
    }

    /**
     * Update the specified subscription plan.
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function updatePlan(Request $request, $id)
    {
        $plan = SubscriptionPlan::findOrFail($id);

        // Validate request
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'target_type' => ['sometimes', 'string', Rule::in(['business', 'producer'])],
            'price' => 'sometimes|numeric|min:0',
            'billing_cycle' => ['sometimes', 'string', Rule::in(['monthly', 'annually'])],
            'commission_rate' => 'nullable|numeric|min:0|max:100',
            'features' => 'nullable|array',
            'is_active' => 'sometimes|boolean',
        ]);

        // Update subscription plan
        $plan->update($validated);

        return response()->json([
            'message' => 'Subscription plan updated successfully',
            'plan' => $plan->fresh(),
        ]);
    }

    /**
     * Display a listing of active subscriptions.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function indexSubscriptions(Request $request)
    {
        // Validate request parameters
        $request->validate([
            'subscribable_type' => ['sometimes', 'string', Rule::in(['business', 'producer', 'all'])],
            'status' => ['sometimes', 'string', Rule::in(['active', 'pending', 'cancelled', 'expired', 'all'])],
            'plan_id' => 'sometimes|integer|exists:subscription_plans,id',
            'search' => 'sometimes|string|max:100',
            'per_page' => 'sometimes|integer|min:5|max:100',
            'page' => 'sometimes|integer|min:1',
        ]);

        // Build query
        $query = Subscription::with(['plan', 'subscribable']);

        // Apply filters
        if ($request->has('subscribable_type') && $request->subscribable_type !== 'all') {
            $query->where('subscribable_type', 'App\\Models\\' . ucfirst($request->subscribable_type));
        }

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->has('plan_id')) {
            $query->where('plan_id', $request->plan_id);
        }

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->whereHasMorph('subscribable', ['App\\Models\\Business', 'App\\Models\\Producer'], function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('business_name', 'like', "%{$search}%");
            });
        }

        // Apply sorting
        $query->orderBy('created_at', 'desc');

        // Paginate results
        $perPage = $request->per_page ?? 15;
        $subscriptions = $query->paginate($perPage);

        return response()->json($subscriptions);
    }

    /**
     * Display the specified subscription.
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function showSubscription($id)
    {
        $subscription = Subscription::with(['plan', 'subscribable'])->findOrFail($id);

        return response()->json($subscription);
    }

    /**
     * Update the specified subscription.
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateSubscription(Request $request, $id)
    {
        $subscription = Subscription::findOrFail($id);

        // Validate request
        $validated = $request->validate([
            'status' => ['sometimes', 'string', Rule::in(['active', 'pending', 'cancelled', 'expired'])],
            'end_date' => 'sometimes|nullable|date',
            'auto_renew' => 'sometimes|boolean',
        ]);

        // Update subscription
        $subscription->update($validated);

        return response()->json([
            'message' => 'Subscription updated successfully',
            'subscription' => $subscription->fresh(['plan', 'subscribable']),
        ]);
    }

    /**
     * Get subscription statistics.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getStats()
    {
        // Get subscription counts by status
        $statusCounts = Subscription::select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get()
            ->pluck('count', 'status')
            ->toArray();

        // Get subscription counts by type
        $typeCounts = Subscription::select('subscribable_type', DB::raw('count(*) as count'))
            ->groupBy('subscribable_type')
            ->get()
            ->pluck('count', 'subscribable_type')
            ->toArray();

        // Get subscription counts by plan
        $planCounts = Subscription::select('plan_id', DB::raw('count(*) as count'))
            ->groupBy('plan_id')
            ->get();

        // Get plan details for each plan_id
        $planDetails = [];
        foreach ($planCounts as $planCount) {
            $plan = SubscriptionPlan::find($planCount->plan_id);
            if ($plan) {
                $planDetails[] = [
                    'plan_id' => $plan->id,
                    'name' => $plan->name,
                    'target_type' => $plan->target_type,
                    'count' => $planCount->count,
                ];
            }
        }

        // Get total revenue from subscriptions
        $totalRevenue = Subscription::join('subscription_plans', 'subscriptions.plan_id', '=', 'subscription_plans.id')
            ->where('subscriptions.status', 'active')
            ->sum('subscription_plans.price');

        return response()->json([
            'status_counts' => $statusCounts,
            'type_counts' => $typeCounts,
            'plan_counts' => $planDetails,
            'total_revenue' => $totalRevenue,
        ]);
    }
}
