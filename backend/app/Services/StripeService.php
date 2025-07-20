<?php

namespace App\Services;

use App\Models\Payment;
use App\Models\Subscription;
use App\Models\SubscriptionPlan;
use App\Models\User;
use App\Notifications\PaymentFailed;
use Illuminate\Support\Facades\Log;
use Stripe\Exception\ApiErrorException;
use Stripe\StripeClient;

class StripeService
{
    protected $stripe;

    public function __construct()
    {
        // Check if Stripe API key is configured
        $stripeSecret = config('services.stripe.secret');

        if ($stripeSecret) {
            $this->stripe = new StripeClient($stripeSecret);
        }
    }

    /**
     * Create a payment intent for an order.
     *
     * @param Order $order
     * @return array
     * @throws ApiErrorException
     */
    public function createOrderPaymentIntent($order): array
    {
        // Check if Stripe is configured
        if (!$this->stripe) {
            // Return a mock payment intent for development
            return [
                'client_secret' => 'mock_client_secret_' . uniqid(),
                'payment_intent_id' => 'mock_pi_' . uniqid(),
            ];
        }

        try {
            // Create a customer if the user doesn't have one
            $customerId = $this->getOrCreateCustomer($order->user);

            // Create a payment intent
            $paymentIntent = $this->stripe->paymentIntents->create([
                'amount' => (int)($order->total_amount * 100), // Convert to cents
                'currency' => 'eur',
                'customer' => $customerId,
                'metadata' => [
                    'user_id' => $order->user_id,
                    'order_id' => $order->id,
                    'order_number' => $order->order_number,
                    'type' => 'order',
                ],
                'description' => "Order #{$order->order_number}",
                'automatic_payment_methods' => [
                    'enabled' => true,
                ],
            ]);

            return [
                'client_secret' => $paymentIntent->client_secret,
                'payment_intent_id' => $paymentIntent->id,
            ];
        } catch (ApiErrorException $e) {
            Log::error('Stripe API Error: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Create a payment intent for a subscription.
     *
     * @param User $user
     * @param SubscriptionPlan $plan
     * @return array
     * @throws ApiErrorException
     */
    public function createSubscriptionPaymentIntent(User $user, SubscriptionPlan $plan): array
    {
        // Check if Stripe is configured
        if (!$this->stripe) {
            // Return a mock payment intent for development
            return [
                'client_secret' => 'mock_client_secret_' . uniqid(),
                'payment_intent_id' => 'mock_pi_' . uniqid(),
            ];
        }

        try {
            // Create a customer if the user doesn't have one
            $customerId = $this->getOrCreateCustomer($user);

            // Create a payment intent
            $paymentIntent = $this->stripe->paymentIntents->create([
                'amount' => $plan->price * 100, // Convert to cents
                'currency' => 'eur',
                'customer' => $customerId,
                'metadata' => [
                    'user_id' => $user->id,
                    'plan_id' => $plan->id,
                    'plan_name' => $plan->name,
                    'type' => 'subscription',
                ],
                'description' => "Subscription to {$plan->name} plan",
                'automatic_payment_methods' => [
                    'enabled' => true,
                ],
            ]);

            return [
                'client_secret' => $paymentIntent->client_secret,
                'payment_intent_id' => $paymentIntent->id,
            ];
        } catch (ApiErrorException $e) {
            Log::error('Stripe API Error: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Get or create a Stripe customer for the user.
     *
     * @param User $user
     * @return string
     * @throws ApiErrorException
     */
    public function getOrCreateCustomer(User $user): string
    {
        // Check if Stripe is configured
        if (!$this->stripe) {
            // Return a mock customer ID for development
            return 'mock_cus_' . uniqid();
        }

        // Check if the user already has a Stripe customer ID
        if ($user->stripe_customer_id) {
            return $user->stripe_customer_id;
        }

        // Create a new customer
        $customer = $this->stripe->customers->create([
            'email' => $user->email,
            'name' => $user->name,
            'metadata' => [
                'user_id' => $user->id,
            ],
        ]);

        // Save the customer ID to the user
        $user->stripe_customer_id = $customer->id;
        $user->save();

        return $customer->id;
    }

    /**
     * Handle a successful payment.
     *
     * @param string $paymentIntentId
     * @return Payment
     * @throws ApiErrorException
     */
    public function handleSuccessfulPayment(string $paymentIntentId): Payment
    {
        // Check if Stripe is configured
        if (!$this->stripe) {
            // Create a mock payment record for development
            $userId = 1; // Default user ID for mock data
            $planId = 1; // Default plan ID for mock data
            $orderId = null; // Default order ID for mock data

            // Check if this is a mock payment intent ID generated by createSubscriptionPaymentIntent
            if (strpos($paymentIntentId, 'mock_pi_') === 0) {
                // Extract user ID and plan ID from the mock payment intent ID if available
                // This is just a placeholder - in a real implementation, we would need to store this information
            }

            $payment = new Payment([
                'user_id' => $userId,
                'transaction_id' => $paymentIntentId,
                'status' => 'completed',
                'payment_gateway' => 'stripe',
                'payment_method' => 'card',
                'payment_method_id' => 'mock_pm_' . uniqid(),
                'amount' => 0, // Mock amount
                'currency' => 'eur',
                'details' => [
                    'payment_intent_id' => $paymentIntentId,
                    'payment_method_types' => ['card'],
                    'status' => 'succeeded',
                ],
                'payment_date' => now(),
            ]);

            $payment->save();

            // If this is a subscription payment, create or update the subscription
            if ($planId) {
                $this->createOrUpdateSubscription($payment, $planId);
            }

            // If this is an order payment, update the order status
            if ($orderId) {
                $this->updateOrderStatus($orderId, 'paid');
            }

            return $payment;
        }

        try {
            // Retrieve the payment intent
            $paymentIntent = $this->stripe->paymentIntents->retrieve($paymentIntentId);

            // Create a payment record
            $payment = new Payment([
                'user_id' => $paymentIntent->metadata->user_id,
                'transaction_id' => $paymentIntent->id,
                'status' => 'completed',
                'payment_gateway' => 'stripe',
                'payment_method' => $paymentIntent->payment_method_types[0] ?? 'card',
                'payment_method_id' => $paymentIntent->payment_method,
                'amount' => $paymentIntent->amount / 100, // Convert from cents
                'currency' => $paymentIntent->currency,
                'details' => [
                    'payment_intent_id' => $paymentIntent->id,
                    'payment_method_types' => $paymentIntent->payment_method_types,
                    'status' => $paymentIntent->status,
                ],
                'payment_date' => now(),
            ]);

            // Set order_id if this is an order payment
            if (isset($paymentIntent->metadata->type) && $paymentIntent->metadata->type === 'order') {
                $payment->order_id = $paymentIntent->metadata->order_id;
            }

            $payment->save();

            // If this is a subscription payment, create or update the subscription
            if (isset($paymentIntent->metadata->type) && $paymentIntent->metadata->type === 'subscription') {
                $this->createOrUpdateSubscription($payment, $paymentIntent->metadata->plan_id);
            }

            // If this is an order payment, update the order status
            if (isset($paymentIntent->metadata->type) && $paymentIntent->metadata->type === 'order') {
                $this->updateOrderStatus($paymentIntent->metadata->order_id, 'paid');
            }

            return $payment;
        } catch (ApiErrorException $e) {
            Log::error('Stripe API Error: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Update the order status after a successful payment.
     *
     * @param int $orderId
     * @param string $status
     * @return void
     */
    protected function updateOrderStatus(int $orderId, string $status): void
    {
        try {
            $order = \App\Models\Order::findOrFail($orderId);
            $order->payment_status = $status;

            // If the order is paid, also update the order status to processing
            if ($status === 'paid') {
                $order->status = 'processing';
            }

            $order->save();

            // Log the order status update
            Log::info("Order #{$order->order_number} status updated to {$status}");

            // Optionally, send a notification to the user
            $order->user->notify(new \App\Notifications\OrderStatusUpdated($order));
        } catch (\Exception $e) {
            Log::error("Error updating order status: {$e->getMessage()}", [
                'order_id' => $orderId,
                'status' => $status,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Create or update a subscription.
     *
     * @param Payment $payment
     * @param int $planId
     * @return Subscription
     */
    protected function createOrUpdateSubscription(Payment $payment, int $planId): Subscription
    {
        $user = User::findOrFail($payment->user_id);
        $plan = SubscriptionPlan::findOrFail($planId);

        // Determine the subscribable type and ID based on the user's role
        $subscribableType = null;
        $subscribableId = null;

        if ($user->hasRole('producer') && $user->producer) {
            $subscribableType = 'App\\Models\\Producer';
            $subscribableId = $user->producer->id;
        } elseif ($user->hasRole('business_user') && $user->business) {
            $subscribableType = 'App\\Models\\Business';
            $subscribableId = $user->business->id;
        } else {
            throw new \Exception('User does not have a valid subscribable entity');
        }

        // Cancel any active subscription
        $activeSubscription = Subscription::where('subscribable_type', $subscribableType)
            ->where('subscribable_id', $subscribableId)
            ->where('status', 'active')
            ->first();

        if ($activeSubscription) {
            $activeSubscription->status = 'cancelled';
            $activeSubscription->cancellation_reason = 'Upgraded to a new plan';
            $activeSubscription->save();
        }

        // Create a new subscription
        $subscription = new Subscription([
            'plan_id' => $plan->id,
            'subscribable_type' => $subscribableType,
            'subscribable_id' => $subscribableId,
            'status' => 'active',
            'start_date' => now(),
            'end_date' => now()->addMonths($plan->duration_months),
            'auto_renew' => true,
            'payment_id' => $payment->id,
            'last_payment_date' => now(),
            'next_payment_date' => now()->addMonths($plan->duration_months),
        ]);

        $subscription->save();

        return $subscription;
    }

    /**
     * Handle a webhook event from Stripe.
     *
     * @param array $payload
     * @return void
     */
    public function handleWebhookEvent(array $payload): void
    {
        // Check if Stripe is configured
        if (!$this->stripe) {
            // Log that we're in development mode and not processing webhooks
            Log::info('Stripe is not configured. Webhook event not processed.');
            return;
        }

        $event = $payload['type'];

        switch ($event) {
            case 'payment_intent.succeeded':
                $paymentIntent = $payload['data']['object'];
                $this->handleSuccessfulPayment($paymentIntent['id']);
                break;

            case 'payment_intent.payment_failed':
                $paymentIntent = $payload['data']['object'];
                $this->handleFailedPayment($paymentIntent['id']);
                break;

            case 'customer.subscription.created':
            case 'customer.subscription.updated':
            case 'customer.subscription.deleted':
                // Handle subscription events if needed
                break;

            default:
                // Log unhandled events
                Log::info('Unhandled Stripe event: ' . $event);
                break;
        }
    }

    /**
     * Handle a failed payment.
     *
     * @param string $paymentIntentId
     * @return void
     */
    protected function handleFailedPayment(string $paymentIntentId): void
    {
        // Check if Stripe is configured
        if (!$this->stripe) {
            // Log that we're in development mode and not processing failed payments
            Log::info('Stripe is not configured. Failed payment not processed.');
            return;
        }

        try {
            // Retrieve the payment intent
            $paymentIntent = $this->stripe->paymentIntents->retrieve($paymentIntentId);

            // Create a payment record
            $payment = new Payment([
                'user_id' => $paymentIntent->metadata->user_id,
                'transaction_id' => $paymentIntent->id,
                'status' => 'failed',
                'payment_gateway' => 'stripe',
                'payment_method' => $paymentIntent->payment_method_types[0] ?? 'card',
                'payment_method_id' => $paymentIntent->payment_method,
                'amount' => $paymentIntent->amount / 100, // Convert from cents
                'currency' => $paymentIntent->currency,
                'details' => [
                    'payment_intent_id' => $paymentIntent->id,
                    'payment_method_types' => $paymentIntent->payment_method_types,
                    'status' => $paymentIntent->status,
                    'error' => $paymentIntent->last_payment_error,
                ],
                'payment_date' => now(),
            ]);

            $payment->save();

            // Notify the user about the failed payment
            $user = User::find($paymentIntent->metadata->user_id);
            if ($user) {
                $user->notify(new PaymentFailed($payment));
            }
        } catch (ApiErrorException $e) {
            Log::error('Stripe API Error: ' . $e->getMessage());
        }
    }
}
