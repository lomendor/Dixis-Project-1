<?php

namespace App\Http\Controllers\Api\Business;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\SubscriptionPlan;
use App\Models\Subscription;
use App\Models\Payment;
use App\Notifications\SubscriptionCreated;
use App\Notifications\SubscriptionCancelled;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class SubscriptionController extends Controller
{
    /**
     * Get available subscription plans for businesses.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getAvailablePlans()
    {
        $plans = SubscriptionPlan::where('target_type', 'business')
            ->where('is_active', true)
            ->orderBy('price', 'asc')
            ->get();

        return response()->json($plans);
    }

    /**
     * Get the current subscription for the authenticated business.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getCurrentSubscription()
    {
        $business = Auth::user()->business;

        if (!$business) {
            return response()->json(['message' => 'Business profile not found'], 404);
        }

        $subscription = Subscription::with('plan')
            ->where('subscribable_type', 'App\\Models\\Business')
            ->where('subscribable_id', $business->id)
            ->where('status', 'active')
            ->orderBy('created_at', 'desc')
            ->first();

        if (!$subscription) {
            // If no active subscription is found, check if there's a basic plan
            $basicPlan = SubscriptionPlan::where('target_type', 'business')
                ->where('name', 'Basic')
                ->where('is_active', true)
                ->first();

            if ($basicPlan) {
                // Create a new subscription with the basic plan
                $subscription = new Subscription([
                    'plan_id' => $basicPlan->id,
                    'subscribable_type' => 'App\\Models\\Business',
                    'subscribable_id' => $business->id,
                    'status' => 'active',
                    'start_date' => now(),
                    'end_date' => now()->addMonths($basicPlan->duration_months),
                    'auto_renew' => true,
                ]);

                $subscription->save();
                $subscription->load('plan');
            }
        }

        return response()->json($subscription);
    }

    /**
     * Subscribe to a plan.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function subscribe(Request $request)
    {
        $request->validate([
            'plan_id' => 'required|exists:subscription_plans,id',
            'payment_method_id' => 'required_if:price,>,0|string',
        ]);

        $business = Auth::user()->business;

        if (!$business) {
            return response()->json(['message' => 'Business profile not found'], 404);
        }

        $plan = SubscriptionPlan::findOrFail($request->plan_id);

        // Check if the plan is for businesses
        if ($plan->target_type !== 'business') {
            return response()->json(['message' => 'Invalid subscription plan for businesses'], 400);
        }

        // Check if the plan is active
        if (!$plan->is_active) {
            return response()->json(['message' => 'This subscription plan is not available'], 400);
        }

        // Start a database transaction
        DB::beginTransaction();

        try {
            // Cancel any active subscription
            $activeSubscription = Subscription::where('subscribable_type', 'App\\Models\\Business')
                ->where('subscribable_id', $business->id)
                ->where('status', 'active')
                ->first();

            if ($activeSubscription) {
                $activeSubscription->status = 'cancelled';
                $activeSubscription->cancellation_reason = 'Upgraded to a new plan';
                $activeSubscription->save();
            }

            // Create a payment record if the plan is not free
            $paymentId = null;

            if ($plan->price > 0) {
                // In a real application, you would process the payment with Stripe or another payment processor
                // For now, we'll just create a payment record
                $payment = new Payment([
                    'user_id' => Auth::id(),
                    'amount' => $plan->price,
                    'currency' => 'EUR',
                    'payment_method' => 'card',
                    'payment_method_id' => $request->payment_method_id,
                    'status' => 'completed',
                    'payment_date' => now(),
                ]);

                $payment->save();
                $paymentId = $payment->id;
            }

            // Create a new subscription
            $subscription = new Subscription([
                'plan_id' => $plan->id,
                'subscribable_type' => 'App\\Models\\Business',
                'subscribable_id' => $business->id,
                'status' => 'active',
                'start_date' => now(),
                'end_date' => now()->addMonths($plan->duration_months),
                'auto_renew' => true,
                'payment_id' => $paymentId,
                'last_payment_date' => now(),
                'next_payment_date' => now()->addMonths($plan->duration_months),
            ]);

            $subscription->save();

            // Commit the transaction
            DB::commit();

            // Load the plan relationship
            $subscription->load('plan');

            // Send notification
            $user = Auth::user();
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
     * Cancel the current subscription.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function cancelSubscription(Request $request)
    {
        $request->validate([
            'cancellation_reason' => 'nullable|string|max:255',
        ]);

        $business = Auth::user()->business;

        if (!$business) {
            return response()->json(['message' => 'Business profile not found'], 404);
        }

        $subscription = Subscription::where('subscribable_type', 'App\\Models\\Business')
            ->where('subscribable_id', $business->id)
            ->where('status', 'active')
            ->first();

        if (!$subscription) {
            return response()->json(['message' => 'No active subscription found'], 404);
        }

        // Cancel the subscription
        $subscription->status = 'cancelled';
        $subscription->cancellation_reason = $request->cancellation_reason;
        $subscription->auto_renew = false;
        $subscription->save();

        // Send notification
        $user = Auth::user();
        $user->notify(new SubscriptionCancelled($subscription));

        // Create a new subscription with the basic plan
        $basicPlan = SubscriptionPlan::where('target_type', 'business')
            ->where('name', 'Basic')
            ->where('is_active', true)
            ->first();

        if ($basicPlan) {
            $newSubscription = new Subscription([
                'plan_id' => $basicPlan->id,
                'subscribable_type' => 'App\\Models\\Business',
                'subscribable_id' => $business->id,
                'status' => 'active',
                'start_date' => now(),
                'end_date' => now()->addMonths($basicPlan->duration_months),
                'auto_renew' => true,
            ]);

            $newSubscription->save();
            $newSubscription->load('plan');

            return response()->json([
                'message' => 'Subscription cancelled successfully. Downgraded to basic plan.',
                'subscription' => $newSubscription,
            ]);
        }

        return response()->json([
            'message' => 'Subscription cancelled successfully',
        ]);
    }

    /**
     * Get subscription history for the authenticated business.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getSubscriptionHistory()
    {
        $business = Auth::user()->business;

        if (!$business) {
            return response()->json(['message' => 'Business profile not found'], 404);
        }

        $subscriptions = Subscription::with('plan')
            ->where('subscribable_type', 'App\\Models\\Business')
            ->where('subscribable_id', $business->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($subscriptions);
    }

    /**
     * Toggle auto-renew for the current subscription.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function toggleAutoRenew()
    {
        $business = Auth::user()->business;

        if (!$business) {
            return response()->json(['message' => 'Business profile not found'], 404);
        }

        $subscription = Subscription::where('subscribable_type', 'App\\Models\\Business')
            ->where('subscribable_id', $business->id)
            ->where('status', 'active')
            ->first();

        if (!$subscription) {
            return response()->json(['message' => 'No active subscription found'], 404);
        }

        // Toggle auto-renew
        $subscription->auto_renew = !$subscription->auto_renew;
        $subscription->save();

        return response()->json([
            'message' => $subscription->auto_renew ? 'Auto-renew enabled' : 'Auto-renew disabled',
            'auto_renew' => $subscription->auto_renew,
        ]);
    }
}
