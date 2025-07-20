<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Subscription;
use App\Models\SubscriptionPlan;
use App\Models\User;
use App\Notifications\SubscriptionCreated;
use App\Notifications\SubscriptionCancelled;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class SubscriptionManagementController extends Controller
{
    /**
     * Get all subscription plans.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getAllPlans()
    {
        $plans = SubscriptionPlan::orderBy('target_type')
            ->orderBy('price')
            ->get();
        
        return response()->json($plans);
    }
    
    /**
     * Get a specific subscription plan.
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function getPlan($id)
    {
        $plan = SubscriptionPlan::findOrFail($id);
        
        return response()->json($plan);
    }
    
    /**
     * Create a new subscription plan.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function createPlan(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'target_type' => 'required|string|in:producer,business',
            'price' => 'required|numeric|min:0',
            'billing_cycle' => 'required|string|in:monthly,annually',
            'duration_months' => 'required|integer|min:1',
            'commission_rate' => 'required|numeric|min:0|max:100',
            'features' => 'required|array',
            'features.*' => 'string',
            'is_active' => 'boolean',
        ]);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        $plan = SubscriptionPlan::create($request->all());
        
        return response()->json($plan, 201);
    }
    
    /**
     * Update a subscription plan.
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function updatePlan(Request $request, $id)
    {
        $plan = SubscriptionPlan::findOrFail($id);
        
        $validator = Validator::make($request->all(), [
            'name' => 'string|max:255',
            'target_type' => 'string|in:producer,business',
            'price' => 'numeric|min:0',
            'billing_cycle' => 'string|in:monthly,annually',
            'duration_months' => 'integer|min:1',
            'commission_rate' => 'numeric|min:0|max:100',
            'features' => 'array',
            'features.*' => 'string',
            'is_active' => 'boolean',
        ]);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        $plan->update($request->all());
        
        return response()->json($plan);
    }
    
    /**
     * Delete a subscription plan.
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function deletePlan($id)
    {
        $plan = SubscriptionPlan::findOrFail($id);
        
        // Check if the plan has active subscriptions
        $activeSubscriptions = Subscription::where('plan_id', $id)
            ->where('status', 'active')
            ->count();
        
        if ($activeSubscriptions > 0) {
            return response()->json([
                'message' => 'Cannot delete plan with active subscriptions',
                'active_subscriptions' => $activeSubscriptions,
            ], 400);
        }
        
        $plan->delete();
        
        return response()->json(['message' => 'Plan deleted successfully']);
    }
    
    /**
     * Get all subscriptions.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getAllSubscriptions(Request $request)
    {
        $query = Subscription::with(['plan']);
        
        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }
        
        // Filter by plan
        if ($request->has('plan_id')) {
            $query->where('plan_id', $request->plan_id);
        }
        
        // Filter by target type
        if ($request->has('target_type')) {
            $query->whereHas('plan', function ($q) use ($request) {
                $q->where('target_type', $request->target_type);
            });
        }
        
        // Search by user
        if ($request->has('search')) {
            $search = $request->search;
            
            $query->where(function ($q) use ($search) {
                $q->whereHasMorph('subscribable', ['App\\Models\\Producer', 'App\\Models\\Business'], function ($query) use ($search) {
                    $query->where('business_name', 'like', "%{$search}%");
                });
            });
        }
        
        // Sort
        $sortField = $request->sort_field ?? 'created_at';
        $sortDirection = $request->sort_direction ?? 'desc';
        
        if ($sortField === 'plan_name') {
            $query->join('subscription_plans', 'subscriptions.plan_id', '=', 'subscription_plans.id')
                ->orderBy('subscription_plans.name', $sortDirection)
                ->select('subscriptions.*');
        } else {
            $query->orderBy($sortField, $sortDirection);
        }
        
        // Paginate
        $perPage = $request->per_page ?? 10;
        $subscriptions = $query->paginate($perPage);
        
        // Load user information for each subscription
        foreach ($subscriptions as $subscription) {
            if ($subscription->subscribable_type === 'App\\Models\\Producer') {
                $user = User::whereHas('producer', function ($q) use ($subscription) {
                    $q->where('id', $subscription->subscribable_id);
                })->first();
                
                $subscription->user = $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                ] : null;
                
                $subscription->business_name = $subscription->subscribable ? $subscription->subscribable->business_name : null;
            } elseif ($subscription->subscribable_type === 'App\\Models\\Business') {
                $user = User::whereHas('business', function ($q) use ($subscription) {
                    $q->where('id', $subscription->subscribable_id);
                })->first();
                
                $subscription->user = $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                ] : null;
                
                $subscription->business_name = $subscription->subscribable ? $subscription->subscribable->business_name : null;
            }
        }
        
        return response()->json($subscriptions);
    }
    
    /**
     * Get a specific subscription.
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function getSubscription($id)
    {
        $subscription = Subscription::with(['plan'])->findOrFail($id);
        
        // Load user information
        if ($subscription->subscribable_type === 'App\\Models\\Producer') {
            $user = User::whereHas('producer', function ($q) use ($subscription) {
                $q->where('id', $subscription->subscribable_id);
            })->first();
            
            $subscription->user = $user ? [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ] : null;
            
            $subscription->business_name = $subscription->subscribable ? $subscription->subscribable->business_name : null;
        } elseif ($subscription->subscribable_type === 'App\\Models\\Business') {
            $user = User::whereHas('business', function ($q) use ($subscription) {
                $q->where('id', $subscription->subscribable_id);
            })->first();
            
            $subscription->user = $user ? [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ] : null;
            
            $subscription->business_name = $subscription->subscribable ? $subscription->subscribable->business_name : null;
        }
        
        return response()->json($subscription);
    }
    
    /**
     * Update a subscription.
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateSubscription(Request $request, $id)
    {
        $subscription = Subscription::findOrFail($id);
        
        $validator = Validator::make($request->all(), [
            'plan_id' => 'exists:subscription_plans,id',
            'status' => 'string|in:active,cancelled,expired',
            'auto_renew' => 'boolean',
            'end_date' => 'date',
        ]);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        // Start a database transaction
        DB::beginTransaction();
        
        try {
            // If changing the plan, check if the new plan is compatible with the subscription
            if ($request->has('plan_id') && $request->plan_id != $subscription->plan_id) {
                $newPlan = SubscriptionPlan::findOrFail($request->plan_id);
                $currentPlan = $subscription->plan;
                
                // Check if the target types match
                if ($newPlan->target_type !== $currentPlan->target_type) {
                    return response()->json([
                        'message' => 'Cannot change to a plan with a different target type',
                    ], 400);
                }
            }
            
            // Update the subscription
            $subscription->update($request->all());
            
            // Commit the transaction
            DB::commit();
            
            return response()->json($subscription);
        } catch (\Exception $e) {
            // Rollback the transaction in case of an error
            DB::rollBack();
            
            return response()->json([
                'message' => 'Failed to update subscription',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    
    /**
     * Cancel a subscription.
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function cancelSubscription(Request $request, $id)
    {
        $subscription = Subscription::findOrFail($id);
        
        $validator = Validator::make($request->all(), [
            'cancellation_reason' => 'nullable|string|max:255',
        ]);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        // Check if the subscription is already cancelled
        if ($subscription->status === 'cancelled') {
            return response()->json(['message' => 'Subscription is already cancelled'], 400);
        }
        
        // Cancel the subscription
        $subscription->status = 'cancelled';
        $subscription->cancellation_reason = $request->cancellation_reason;
        $subscription->auto_renew = false;
        $subscription->save();
        
        // Find the user associated with the subscription
        $user = null;
        
        if ($subscription->subscribable_type === 'App\\Models\\Producer') {
            $user = User::whereHas('producer', function ($q) use ($subscription) {
                $q->where('id', $subscription->subscribable_id);
            })->first();
        } elseif ($subscription->subscribable_type === 'App\\Models\\Business') {
            $user = User::whereHas('business', function ($q) use ($subscription) {
                $q->where('id', $subscription->subscribable_id);
            })->first();
        }
        
        // Send notification if user is found
        if ($user) {
            $user->notify(new SubscriptionCancelled($subscription));
        }
        
        return response()->json([
            'message' => 'Subscription cancelled successfully',
            'subscription' => $subscription,
        ]);
    }
    
    /**
     * Create a subscription for a user.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function createSubscription(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
            'plan_id' => 'required|exists:subscription_plans,id',
            'auto_renew' => 'boolean',
            'end_date' => 'nullable|date',
        ]);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        $user = User::findOrFail($request->user_id);
        $plan = SubscriptionPlan::findOrFail($request->plan_id);
        
        // Start a database transaction
        DB::beginTransaction();
        
        try {
            // Determine the subscribable type and ID based on the user's role and the plan's target type
            $subscribableType = null;
            $subscribableId = null;
            
            if ($plan->target_type === 'producer' && $user->hasRole('producer') && $user->producer) {
                $subscribableType = 'App\\Models\\Producer';
                $subscribableId = $user->producer->id;
            } elseif ($plan->target_type === 'business' && $user->hasRole('business_user') && $user->business) {
                $subscribableType = 'App\\Models\\Business';
                $subscribableId = $user->business->id;
            } else {
                return response()->json([
                    'message' => 'User does not have a valid profile for this subscription plan',
                ], 400);
            }
            
            // Cancel any active subscription
            $activeSubscription = Subscription::where('subscribable_type', $subscribableType)
                ->where('subscribable_id', $subscribableId)
                ->where('status', 'active')
                ->first();
            
            if ($activeSubscription) {
                $activeSubscription->status = 'cancelled';
                $activeSubscription->cancellation_reason = 'Replaced by admin';
                $activeSubscription->save();
            }
            
            // Create a new subscription
            $subscription = new Subscription([
                'plan_id' => $plan->id,
                'subscribable_type' => $subscribableType,
                'subscribable_id' => $subscribableId,
                'status' => 'active',
                'start_date' => now(),
                'end_date' => $request->end_date ?? now()->addMonths($plan->duration_months),
                'auto_renew' => $request->has('auto_renew') ? $request->auto_renew : true,
                'last_payment_date' => now(),
                'next_payment_date' => $request->end_date ?? now()->addMonths($plan->duration_months),
            ]);
            
            $subscription->save();
            
            // Commit the transaction
            DB::commit();
            
            // Load the plan relationship
            $subscription->load('plan');
            
            // Send notification
            $user->notify(new SubscriptionCreated($subscription));
            
            return response()->json([
                'message' => 'Subscription created successfully',
                'subscription' => $subscription,
            ], 201);
        } catch (\Exception $e) {
            // Rollback the transaction in case of an error
            DB::rollBack();
            
            return response()->json([
                'message' => 'Failed to create subscription',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    
    /**
     * Get subscription statistics.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getStatistics()
    {
        // Get total active subscriptions
        $totalActiveSubscriptions = Subscription::where('status', 'active')->count();
        
        // Get active subscriptions by plan
        $activeSubscriptionsByPlan = Subscription::where('status', 'active')
            ->join('subscription_plans', 'subscriptions.plan_id', '=', 'subscription_plans.id')
            ->select('subscription_plans.name', DB::raw('count(*) as count'))
            ->groupBy('subscription_plans.name')
            ->get();
        
        // Get active subscriptions by target type
        $activeSubscriptionsByTargetType = Subscription::where('status', 'active')
            ->join('subscription_plans', 'subscriptions.plan_id', '=', 'subscription_plans.id')
            ->select('subscription_plans.target_type', DB::raw('count(*) as count'))
            ->groupBy('subscription_plans.target_type')
            ->get();
        
        // Get monthly revenue from subscriptions
        $monthlyRevenue = Subscription::where('status', 'active')
            ->join('subscription_plans', 'subscriptions.plan_id', '=', 'subscription_plans.id')
            ->where('subscription_plans.price', '>', 0)
            ->sum('subscription_plans.price');
        
        // Get subscriptions expiring in the next 30 days
        $expiringSubscriptions = Subscription::where('status', 'active')
            ->whereBetween('end_date', [now(), now()->addDays(30)])
            ->count();
        
        return response()->json([
            'total_active_subscriptions' => $totalActiveSubscriptions,
            'active_subscriptions_by_plan' => $activeSubscriptionsByPlan,
            'active_subscriptions_by_target_type' => $activeSubscriptionsByTargetType,
            'monthly_revenue' => $monthlyRevenue,
            'expiring_subscriptions' => $expiringSubscriptions,
        ]);
    }
}
