<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\SubscriptionPlan;
use App\Services\OrderService;
use App\Services\StripeService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Stripe\Exception\ApiErrorException;
use Stripe\Exception\SignatureVerificationException;
use Stripe\Webhook;

class PaymentController extends Controller
{
    /**
     * The order service instance.
     *
     * @var OrderService
     */
    protected $orderService;

    /**
     * The stripe service instance.
     *
     * @var StripeService
     */
    protected $stripeService;

    /**
     * Create a new controller instance.
     *
     * @param OrderService $orderService
     * @param StripeService $stripeService
     * @return void
     */
    public function __construct(OrderService $orderService, StripeService $stripeService)
    {
        $this->orderService = $orderService;
        $this->stripeService = $stripeService;
    }

    /**
     * Create a payment intent for Stripe.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function createStripePaymentIntent(Request $request)
    {
        $validatedData = $request->validate([
            'order_id' => 'required|integer|exists:orders,id',
        ]);

        $order = Order::findOrFail($validatedData['order_id']);

        // Check if the order belongs to the authenticated user
        if ($order->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Check if the order is already paid
        if ($order->payment_status === 'paid') {
            return response()->json(['message' => 'Order is already paid'], 400);
        }

        try {
            // Create a payment intent using the Stripe service
            $paymentIntent = $this->stripeService->createOrderPaymentIntent($order);

            // Create a payment record in the database
            $payment = new \App\Models\Payment([
                'user_id' => $order->user_id,
                'order_id' => $order->id,
                'transaction_id' => $paymentIntent['payment_intent_id'],
                'status' => 'pending',
                'payment_gateway' => 'stripe',
                'payment_method' => 'card',
                'amount' => $order->total_amount,
                'currency' => 'eur',
                'details' => [
                    'client_secret' => $paymentIntent['client_secret'],
                    'payment_intent_id' => $paymentIntent['payment_intent_id'],
                ],
                'payment_date' => now(),
            ]);
            $payment->save();

            return response()->json([
                'client_secret' => $paymentIntent['client_secret'],
                'payment_id' => $payment->id,
            ]);
        } catch (\Exception $e) {
            Log::error('Error creating Stripe payment intent: ' . $e->getMessage(), [
                'order_id' => $order->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json(['message' => 'Error creating payment intent: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Confirm a Stripe payment.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function confirmStripePayment(Request $request)
    {
        $validatedData = $request->validate([
            'payment_intent_id' => 'required|string',
        ]);

        try {
            // Handle the successful payment using the Stripe service
            $payment = $this->stripeService->handleSuccessfulPayment($validatedData['payment_intent_id']);

            // Get the order if this is an order payment
            $order = null;
            if ($payment->order_id) {
                $order = Order::find($payment->order_id);
            }

            return response()->json([
                'status' => $payment->status,
                'order_id' => $payment->order_id,
                'order' => $order ? [
                    'id' => $order->id,
                    'order_number' => $order->order_number,
                    'status' => $order->status,
                    'payment_status' => $order->payment_status,
                ] : null,
            ]);
        } catch (\Exception $e) {
            Log::error('Error confirming Stripe payment: ' . $e->getMessage(), [
                'payment_intent_id' => $validatedData['payment_intent_id'],
                'error' => $e->getMessage(),
            ]);

            return response()->json(['message' => 'Error confirming payment: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Handle Stripe webhook events.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function handleStripeWebhook(Request $request)
    {
        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');

        // In development mode, we might not have a signature
        if (!$sigHeader && app()->environment('production')) {
            return response()->json(['message' => 'Stripe signature not provided'], 400);
        }

        try {
            // In development mode, we might want to skip signature verification
            if (app()->environment('production')) {
                // Verify the webhook signature
                $event = Webhook::constructEvent(
                    $payload,
                    $sigHeader,
                    config('services.stripe.webhook_secret')
                );
            } else {
                // For development, just decode the JSON payload
                $event = json_decode($payload);
                if (json_last_error() !== JSON_ERROR_NONE) {
                    throw new \Exception('Invalid JSON payload');
                }
            }

            // Convert to array if it's an object
            $eventData = is_object($event) ? json_decode(json_encode($event), true) : $event;

            // Log the webhook event for debugging
            Log::info('Stripe Webhook Received', [
                'event_type' => $eventData['type'] ?? 'unknown',
                'event_id' => $eventData['id'] ?? 'unknown',
            ]);

            // Handle the event based on its type
            $eventType = $eventData['type'] ?? '';

            // Payment Intent events
            if (strpos($eventType, 'payment_intent.') === 0) {
                $paymentIntent = $eventData['data']['object'] ?? [];
                $metadata = $paymentIntent['metadata'] ?? [];

                // Order payment
                if (isset($metadata['type']) && $metadata['type'] === 'order' && isset($metadata['order_id'])) {
                    // Handle order payment events
                    $payment = $this->stripeService->handleSuccessfulPayment($paymentIntent['id']);

                    Log::info('Order payment processed via webhook', [
                        'payment_id' => $payment->id,
                        'order_id' => $payment->order_id,
                    ]);
                }
                // Subscription payment
                else if (isset($metadata['type']) && $metadata['type'] === 'subscription' && isset($metadata['plan_id'])) {
                    // Handle subscription payment events
                    $payment = $this->stripeService->handleSuccessfulPayment($paymentIntent['id']);

                    Log::info('Subscription payment processed via webhook', [
                        'payment_id' => $payment->id,
                        'plan_id' => $metadata['plan_id'],
                    ]);
                }
            }
            // Subscription events
            else if (strpos($eventType, 'customer.subscription.') === 0) {
                // Handle subscription lifecycle events
                if (method_exists($this->stripeService, 'handleSubscriptionWebhook')) {
                    $this->stripeService->handleSubscriptionWebhook($eventData);
                }
            }

            return response()->json(['message' => 'Webhook received successfully']);
        } catch (SignatureVerificationException $e) {
            Log::error('Stripe Webhook Signature Verification Failed: ' . $e->getMessage());
            return response()->json(['message' => 'Invalid signature'], 400);
        } catch (\Exception $e) {
            Log::error('Stripe Webhook Error: ' . $e->getMessage(), [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['message' => 'Error processing webhook: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Create a payment intent for a subscription.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function createSubscriptionPaymentIntent(Request $request)
    {
        $request->validate([
            'plan_id' => 'required|exists:subscription_plans,id',
        ]);

        $user = Auth::user();
        $plan = SubscriptionPlan::findOrFail($request->plan_id);

        // Check if the plan is free
        if ($plan->price <= 0) {
            return response()->json([
                'message' => 'This plan is free and does not require payment.',
                'free_plan' => true,
            ]);
        }

        try {
            $paymentIntent = $this->stripeService->createSubscriptionPaymentIntent($user, $plan);

            return response()->json([
                'client_secret' => $paymentIntent['client_secret'],
                'payment_intent_id' => $paymentIntent['payment_intent_id'],
                'free_plan' => false,
            ]);
        } catch (ApiErrorException $e) {
            Log::error('Stripe API Error: ' . $e->getMessage());

            return response()->json([
                'message' => 'Error creating payment intent: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Confirm a successful subscription payment.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function confirmSubscriptionPayment(Request $request)
    {
        $request->validate([
            'payment_intent_id' => 'required|string',
        ]);

        try {
            $payment = $this->stripeService->handleSuccessfulPayment($request->payment_intent_id);

            return response()->json([
                'message' => 'Payment confirmed successfully',
                'payment' => $payment,
            ]);
        } catch (\Exception $e) {
            Log::error('Error confirming payment: ' . $e->getMessage());

            return response()->json([
                'message' => 'Error confirming payment: ' . $e->getMessage(),
            ], 500);
        }
    }
}
