<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\SubscriptionPlan;
use App\Services\OrderService;
use App\Services\StripeService;
use App\Services\VivaWalletService;
use App\Services\PaymentService;
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

    /**
     * Create a Viva Wallet payment order for Greek market.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function createVivaWalletPayment(Request $request)
    {
        $validatedData = $request->validate([
            'order_id' => 'required|integer|exists:orders,id',
            'installments' => 'sometimes|integer|min:0|max:36',
            'payment_method' => 'sometimes|string|in:card,bank_transfer',
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
            $paymentService = app(PaymentService::class);
            
            // Prepare payment options
            $paymentOptions = [
                'installments' => $validatedData['installments'] ?? null,
                'payment_method' => $validatedData['payment_method'] ?? 'card',
            ];

            // Create Viva Wallet payment
            $payment = $paymentService->createPayment($order, 'viva_wallet', $paymentOptions);

            return response()->json([
                'success' => true,
                'payment_id' => $payment->id,
                'order_code' => $payment->transaction_id,
                'payment_url' => $payment->details['payment_url'],
                'max_installments' => $payment->details['max_installments'],
                'expires_at' => $payment->details['expires_at'],
                'message' => 'Viva Wallet payment order created successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Error creating Viva Wallet payment: ' . $e->getMessage(), [
                'order_id' => $order->id,
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error creating payment: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Handle Viva Wallet payment completion callback.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function vivaWalletCallback(Request $request)
    {
        $validatedData = $request->validate([
            'orderCode' => 'required|string',
            's' => 'sometimes|string', // Status parameter
            't' => 'sometimes|string', // Transaction ID
            'eventId' => 'sometimes|string', // Event ID
        ]);

        try {
            $vivaWalletService = app(VivaWalletService::class);
            
            // Verify payment with Viva Wallet
            $payment = $vivaWalletService->verifyPayment($validatedData['orderCode'], $request->all());

            return response()->json([
                'success' => true,
                'status' => $payment->status,
                'order_id' => $payment->order_id,
                'payment_id' => $payment->id,
                'message' => 'Payment status updated successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Viva Wallet callback error: ' . $e->getMessage(), [
                'order_code' => $validatedData['orderCode'],
                'request_data' => $request->all(),
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error processing payment callback: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Handle Viva Wallet webhook notifications.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function vivaWalletWebhook(Request $request)
    {
        try {
            $webhookData = $request->all();
            
            // Log webhook for debugging
            Log::info('Viva Wallet webhook received', [
                'event_type' => $webhookData['EventTypeId'] ?? 'unknown',
                'order_code' => $webhookData['OrderCode'] ?? 'unknown',
                'data' => $webhookData
            ]);

            $vivaWalletService = app(VivaWalletService::class);
            
            // Process webhook
            $payment = $vivaWalletService->handleWebhook($webhookData);

            if ($payment) {
                Log::info('Viva Wallet webhook processed successfully', [
                    'payment_id' => $payment->id,
                    'status' => $payment->status,
                    'order_id' => $payment->order_id
                ]);
            }

            return response()->json(['message' => 'Webhook processed successfully']);

        } catch (\Exception $e) {
            Log::error('Viva Wallet webhook processing error: ' . $e->getMessage(), [
                'webhook_data' => $request->all(),
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Error processing webhook: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get available payment methods for Greek market.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getGreekPaymentMethods(Request $request)
    {
        $validatedData = $request->validate([
            'order_id' => 'required|integer|exists:orders,id',
        ]);

        $order = Order::findOrFail($validatedData['order_id']);

        // Check if the order belongs to the authenticated user
        if ($order->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        try {
            $vivaWalletService = app(VivaWalletService::class);
            
            // Calculate maximum installments for this order
            $maxInstallments = $this->calculateMaxInstallments($order->total);
            
            // Determine VAT information
            $isIsland = $this->isGreekIsland($order->shipping_city ?? '');
            $vatRate = $isIsland ? 0.13 : 0.24;

            $paymentMethods = [
                'viva_wallet' => [
                    'name' => 'Viva Wallet',
                    'description' => 'Ασφαλής πληρωμή με κάρτα μέσω Viva Wallet',
                    'icon' => 'viva-wallet',
                    'installments' => [
                        'available' => $maxInstallments > 0,
                        'max' => $maxInstallments,
                        'fee_rate' => 0.02 // 2% installment fee
                    ],
                    'features' => [
                        'instant_confirmation' => true,
                        'greek_banks' => true,
                        'mobile_payment' => true,
                        'vat_compliant' => true
                    ],
                    'processing_time' => 'instant'
                ],
                'bank_transfer' => [
                    'name' => 'Τραπεζική Μεταφορά',
                    'description' => 'Μεταφορά μέσω τραπεζικού λογαριασμού',
                    'icon' => 'bank-transfer',
                    'installments' => [
                        'available' => false,
                        'max' => 0
                    ],
                    'features' => [
                        'instant_confirmation' => false,
                        'manual_verification' => true,
                        'lower_fees' => true
                    ],
                    'processing_time' => '1-3 business days'
                ],
                'cash_on_delivery' => [
                    'name' => 'Αντικαταβολή',
                    'description' => 'Πληρωμή κατά την παράδοση',
                    'icon' => 'cash-on-delivery',
                    'installments' => [
                        'available' => false,
                        'max' => 0
                    ],
                    'features' => [
                        'no_online_payment' => true,
                        'cash_or_card_on_delivery' => true,
                        'additional_fee' => 2.0 // €2 COD fee
                    ],
                    'processing_time' => 'on delivery'
                ]
            ];

            return response()->json([
                'success' => true,
                'payment_methods' => $paymentMethods,
                'order_info' => [
                    'total' => $order->total,
                    'currency' => 'EUR',
                    'vat_rate' => $vatRate,
                    'location_type' => $isIsland ? 'island' : 'mainland',
                    'max_installments' => $maxInstallments
                ],
                'recommendations' => [
                    'default' => 'viva_wallet',
                    'for_large_orders' => $order->total > 500 ? 'viva_wallet' : null
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Error getting payment methods: ' . $e->getMessage(), [
                'order_id' => $order->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error retrieving payment methods: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Calculate maximum installments based on order amount
     * 
     * @param float $amount
     * @return int
     */
    private function calculateMaxInstallments(float $amount): int
    {
        if ($amount < 30) {
            return 0;
        } elseif ($amount < 100) {
            return 3;
        } elseif ($amount < 500) {
            return 6;
        } elseif ($amount < 1500) {
            return 12;
        } else {
            return 36;
        }
    }

    /**
     * Check if a city is on a Greek island
     * 
     * @param string $city
     * @return bool
     */
    private function isGreekIsland(string $city): bool
    {
        $islandKeywords = [
            'Crete', 'Κρήτη', 'Heraklion', 'Chania', 'Rethymno', 'Lasithi',
            'Rhodes', 'Ρόδος', 'Kos', 'Κως', 'Santorini', 'Σαντορίνη',
            'Mykonos', 'Μύκονος', 'Paros', 'Πάρος', 'Naxos', 'Νάξος',
            'Corfu', 'Κέρκυρα', 'Zakynthos', 'Ζάκυνθος', 'Kefalonia', 'Κεφαλονιά',
            'Lesbos', 'Λέσβος', 'Chios', 'Χίος', 'Samos', 'Σάμος'
        ];

        foreach ($islandKeywords as $keyword) {
            if (stripos($city, $keyword) !== false) {
                return true;
            }
        }

        return false;
    }
}
