<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Payment;
use App\Services\PaymentMonitoringService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Stripe\PaymentIntent;
use Stripe\Stripe;
use Stripe\Exception\ApiErrorException;

class PaymentController extends Controller
{
    protected PaymentMonitoringService $monitoringService;
    
    public function __construct(PaymentMonitoringService $monitoringService)
    {
        // Set Stripe API key
        Stripe::setApiKey(config('stripe.secret'));
        $this->monitoringService = $monitoringService;
    }

    /**
     * Create a PaymentIntent for the given order
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function createPaymentIntent(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'order_id' => 'required|exists:orders,id',
                'currency' => 'sometimes|string|size:3',
            ]);

            $order = Order::findOrFail($validated['order_id']);
            
            // Check if user owns this order or is admin
            if (Auth::id() !== $order->user_id && !Auth::user()->hasRole('admin')) {
                return response()->json([
                    'error' => 'Unauthorized to create payment for this order'
                ], 403);
            }

            // Check if order already has a succeeded payment
            $existingPayment = $order->payments()->where('status', 'succeeded')->first();
            if ($existingPayment) {
                return response()->json([
                    'error' => 'Order already has a successful payment'
                ], 400);
            }

            $currency = $validated['currency'] ?? config('stripe.currency', 'EUR');
            $amount = (int) ($order->total_amount * 100); // Convert to cents

            // Check for fraud indicators
            $fraudWarnings = $this->monitoringService->checkFraudIndicators(
                $order->user,
                $order->total_amount
            );
            
            // Create PaymentIntent with enhanced fraud detection and SEPA support
            $paymentIntentData = [
                'amount' => $amount,
                'currency' => strtolower($currency),
                'payment_method_types' => ['card', 'sepa_debit'],
                'metadata' => [
                    'order_id' => $order->id,
                    'user_id' => $order->user_id,
                    'user_email' => $order->user->email,
                    'ip_address' => $request->ip(),
                ],
            ];
            
            // Require 3D Secure for high-value transactions
            if ($order->total_amount >= config('stripe.fraud_detection.require_3ds_above_amount')) {
                $paymentIntentData['payment_method_options'] = [
                    'card' => [
                        'request_three_d_secure' => 'required',
                    ],
                ];
            }
            
            // Add Radar session if available
            if ($request->header('X-Stripe-Session-ID')) {
                $paymentIntentData['radar_options'] = [
                    'session' => $request->header('X-Stripe-Session-ID'),
                ];
            }
            
            $paymentIntent = PaymentIntent::create($paymentIntentData);

            // Create payment record in database
            $payment = Payment::create([
                'order_id' => $order->id,
                'stripe_payment_intent_id' => $paymentIntent->id,
                'amount' => $order->total_amount,
                'currency' => $currency,
                'status' => 'pending',
                'payment_gateway' => 'stripe',
                'stripe_data' => [
                    'payment_intent_id' => $paymentIntent->id,
                    'client_secret' => $paymentIntent->client_secret,
                ],
            ]);

            // Log payment attempt
            $this->monitoringService->logPaymentAttempt($paymentIntent, 'created', [
                'fraud_warnings' => $fraudWarnings,
                'payment_id' => $payment->id,
                'order_id' => $order->id,
            ]);

            return response()->json([
                'client_secret' => $paymentIntent->client_secret,
                'payment_id' => $payment->id,
                'amount' => $order->total_amount,
                'currency' => $currency,
            ]);

        } catch (ApiErrorException $e) {
            $this->monitoringService->logPaymentAttempt(null, 'failed', [
                'error' => $e->getMessage(),
                'error_code' => $e->getError()->code ?? null,
                'order_id' => $validated['order_id'] ?? null,
            ]);

            return response()->json([
                'error' => 'Payment processing error. Please try again.',
                'details' => config('app.debug') ? $e->getMessage() : null,
            ], 500);

        } catch (\Exception $e) {
            $this->monitoringService->logPaymentAttempt(null, 'failed', [
                'error' => $e->getMessage(),
                'order_id' => $validated['order_id'] ?? null,
            ]);

            return response()->json([
                'error' => 'An unexpected error occurred. Please try again.',
                'details' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Confirm payment completion (called from frontend after successful payment)
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function confirmPayment(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'payment_intent_id' => 'required|string',
            ]);

            $payment = Payment::where('stripe_payment_intent_id', $validated['payment_intent_id'])->first();

            if (!$payment) {
                return response()->json([
                    'error' => 'Payment not found'
                ], 404);
            }

            // Check if user owns this payment
            if (Auth::id() !== $payment->order->user_id && !Auth::user()->hasRole('admin')) {
                return response()->json([
                    'error' => 'Unauthorized to confirm this payment'
                ], 403);
            }

            // Retrieve PaymentIntent from Stripe to get latest status
            $paymentIntent = PaymentIntent::retrieve($validated['payment_intent_id']);

            // Update payment status based on Stripe status
            $payment->update([
                'status' => $paymentIntent->status,
                'stripe_data' => array_merge($payment->stripe_data ?? [], [
                    'payment_intent' => $paymentIntent->toArray(),
                    'confirmed_at' => now()->toISOString(),
                ]),
            ]);

            // Update order status if payment succeeded
            if ($paymentIntent->status === 'succeeded') {
                $payment->order->update([
                    'payment_status' => 'paid',
                    'status' => 'confirmed',
                ]);

                Log::info('Payment confirmed successfully', [
                    'payment_id' => $payment->id,
                    'order_id' => $payment->order_id,
                    'amount' => $payment->amount,
                ]);
            }

            return response()->json([
                'status' => $paymentIntent->status,
                'payment_id' => $payment->id,
                'order_id' => $payment->order_id,
            ]);

        } catch (ApiErrorException $e) {
            Log::error('Stripe API Error in confirmation: ' . $e->getMessage(), [
                'payment_intent_id' => $validated['payment_intent_id'] ?? null,
            ]);

            return response()->json([
                'error' => 'Error confirming payment. Please try again.',
                'details' => config('app.debug') ? $e->getMessage() : null,
            ], 500);

        } catch (\Exception $e) {
            Log::error('Payment confirmation error: ' . $e->getMessage(), [
                'payment_intent_id' => $validated['payment_intent_id'] ?? null,
            ]);

            return response()->json([
                'error' => 'An unexpected error occurred. Please try again.',
                'details' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Get payment status
     *
     * @param Payment $payment
     * @return JsonResponse
     */
    public function show(Payment $payment): JsonResponse
    {
        // Check if user owns this payment
        if (Auth::id() !== $payment->order->user_id && !Auth::user()->hasRole('admin')) {
            return response()->json([
                'error' => 'Unauthorized to view this payment'
            ], 403);
        }

        return response()->json([
            'id' => $payment->id,
            'order_id' => $payment->order_id,
            'amount' => $payment->amount,
            'currency' => $payment->currency,
            'status' => $payment->status,
            'payment_gateway' => $payment->payment_gateway,
            'created_at' => $payment->created_at,
            'updated_at' => $payment->updated_at,
        ]);
    }
}