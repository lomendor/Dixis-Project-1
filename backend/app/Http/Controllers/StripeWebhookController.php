<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Services\PaymentMonitoringService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Stripe\Webhook;
use Stripe\Exception\SignatureVerificationException;

class StripeWebhookController extends Controller
{
    protected PaymentMonitoringService $monitoringService;
    
    public function __construct(PaymentMonitoringService $monitoringService)
    {
        $this->monitoringService = $monitoringService;
    }
    
    /**
     * Handle Stripe webhook events with retry logic
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function handleWebhook(Request $request): JsonResponse
    {
        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');
        $webhookSecret = config('stripe.webhook_secret');

        try {
            // Verify webhook signature
            $event = Webhook::constructEvent(
                $payload,
                $sigHeader,
                $webhookSecret
            );

            // Log webhook event
            $this->monitoringService->logWebhookEvent($event->type, $event);
            
            // Update last successful webhook timestamp
            Cache::put('stripe.webhook_last_success', now(), now()->addDays(7));

            // Handle different event types
            switch ($event->type) {
                case 'payment_intent.succeeded':
                    $this->handlePaymentIntentSucceeded($event->data->object);
                    break;

                case 'payment_intent.payment_failed':
                    $this->handlePaymentIntentFailed($event->data->object);
                    break;

                case 'payment_intent.canceled':
                    $this->handlePaymentIntentCanceled($event->data->object);
                    break;

                case 'checkout.session.completed':
                    $this->handleCheckoutSessionCompleted($event->data->object);
                    break;
                    
                case 'charge.dispute.created':
                    $this->handleChargeDisputeCreated($event->data->object);
                    break;

                default:
                    // Check if this event type is configured to be handled
                    if (in_array($event->type, config('stripe.webhook_events', []))) {
                        Log::warning('Configured but unhandled Stripe webhook event type', [
                            'event_type' => $event->type,
                            'event_id' => $event->id,
                        ]);
                    }
                    break;
            }

            return response()->json(['status' => 'success']);

        } catch (SignatureVerificationException $e) {
            $this->monitoringService->logWebhookEvent('signature_verification_failed', null, $e->getMessage());

            return response()->json([
                'error' => 'Invalid signature'
            ], 400);

        } catch (\Exception $e) {
            $this->monitoringService->logWebhookEvent($event->type ?? 'unknown', $event ?? null, $e->getMessage());
            
            // For retryable errors, return 500 so Stripe will retry
            // For non-retryable errors, return 400
            $statusCode = $this->isRetryableError($e) ? 500 : 400;

            return response()->json([
                'error' => 'Webhook processing failed',
                'retry' => $statusCode === 500,
            ], $statusCode);
        }
    }

    /**
     * Handle successful payment intent
     *
     * @param object $paymentIntent
     * @return void
     */
    private function handlePaymentIntentSucceeded($paymentIntent): void
    {
        $payment = Payment::where('stripe_payment_intent_id', $paymentIntent->id)->first();

        if (!$payment) {
            Log::warning('Payment not found for successful PaymentIntent', [
                'payment_intent_id' => $paymentIntent->id,
            ]);
            return;
        }

        // Update payment status
        $payment->update([
            'status' => 'succeeded',
            'stripe_data' => array_merge($payment->stripe_data ?? [], [
                'payment_intent' => $paymentIntent,
                'succeeded_at' => now()->toISOString(),
                'webhook_processed_at' => now()->toISOString(),
            ]),
        ]);

        // Update order status
        $payment->order->update([
            'payment_status' => 'paid',
            'status' => 'confirmed',
        ]);

        Log::info('Payment succeeded via webhook', [
            'payment_id' => $payment->id,
            'order_id' => $payment->order_id,
            'amount' => $payment->amount,
            'payment_intent_id' => $paymentIntent->id,
        ]);

        // TODO: Send confirmation email to customer
        // TODO: Trigger order fulfillment process
        // TODO: Update inventory if needed
    }

    /**
     * Handle failed payment intent
     *
     * @param object $paymentIntent
     * @return void
     */
    private function handlePaymentIntentFailed($paymentIntent): void
    {
        $payment = Payment::where('stripe_payment_intent_id', $paymentIntent->id)->first();

        if (!$payment) {
            Log::warning('Payment not found for failed PaymentIntent', [
                'payment_intent_id' => $paymentIntent->id,
            ]);
            return;
        }

        // Update payment status
        $payment->update([
            'status' => 'failed',
            'stripe_data' => array_merge($payment->stripe_data ?? [], [
                'payment_intent' => $paymentIntent,
                'failed_at' => now()->toISOString(),
                'webhook_processed_at' => now()->toISOString(),
                'failure_reason' => $paymentIntent->last_payment_error->message ?? 'Unknown error',
            ]),
        ]);

        // Update order status
        $payment->order->update([
            'payment_status' => 'failed',
        ]);

        Log::info('Payment failed via webhook', [
            'payment_id' => $payment->id,
            'order_id' => $payment->order_id,
            'payment_intent_id' => $paymentIntent->id,
            'failure_reason' => $paymentIntent->last_payment_error->message ?? 'Unknown error',
        ]);

        // TODO: Send failure notification to customer
        // TODO: Optionally retry payment or provide alternative payment methods
    }

    /**
     * Handle canceled payment intent
     *
     * @param object $paymentIntent
     * @return void
     */
    private function handlePaymentIntentCanceled($paymentIntent): void
    {
        $payment = Payment::where('stripe_payment_intent_id', $paymentIntent->id)->first();

        if (!$payment) {
            Log::warning('Payment not found for canceled PaymentIntent', [
                'payment_intent_id' => $paymentIntent->id,
            ]);
            return;
        }

        // Update payment status
        $payment->update([
            'status' => 'canceled',
            'stripe_data' => array_merge($payment->stripe_data ?? [], [
                'payment_intent' => $paymentIntent,
                'canceled_at' => now()->toISOString(),
                'webhook_processed_at' => now()->toISOString(),
                'cancellation_reason' => $paymentIntent->cancellation_reason ?? 'Unknown reason',
            ]),
        ]);

        // Update order status
        $payment->order->update([
            'payment_status' => 'failed',
            'status' => 'canceled',
        ]);

        Log::info('Payment canceled via webhook', [
            'payment_id' => $payment->id,
            'order_id' => $payment->order_id,
            'payment_intent_id' => $paymentIntent->id,
            'cancellation_reason' => $paymentIntent->cancellation_reason ?? 'Unknown reason',
        ]);

        // TODO: Send cancellation notification to customer
        // TODO: Release any reserved inventory
    }

    /**
     * Handle completed checkout session (if using Stripe Checkout)
     *
     * @param object $session
     * @return void
     */
    private function handleCheckoutSessionCompleted($session): void
    {
        // This would be used if implementing Stripe Checkout instead of Payment Intents
        Log::info('Checkout session completed', [
            'session_id' => $session->id,
            'payment_intent_id' => $session->payment_intent ?? null,
        ]);

        // Implementation would depend on how checkout sessions are structured
        // For now, we're primarily using Payment Intents
    }
    
    /**
     * Handle charge dispute created
     *
     * @param object $dispute
     * @return void
     */
    private function handleChargeDisputeCreated($dispute): void
    {
        // Find payment by charge ID
        $payment = Payment::where('stripe_data->charge_id', $dispute->charge)
            ->orWhere('stripe_data->payment_intent_charge_id', $dispute->charge)
            ->first();
            
        if (!$payment) {
            Log::error('Payment not found for dispute', [
                'dispute_id' => $dispute->id,
                'charge_id' => $dispute->charge,
            ]);
            return;
        }
        
        // Log critical dispute event
        Log::critical('Payment dispute created', [
            'dispute_id' => $dispute->id,
            'payment_id' => $payment->id,
            'order_id' => $payment->order_id,
            'amount' => $dispute->amount / 100,
            'reason' => $dispute->reason,
            'status' => $dispute->status,
        ]);
        
        // Update payment with dispute information
        $payment->update([
            'stripe_data' => array_merge($payment->stripe_data ?? [], [
                'dispute_id' => $dispute->id,
                'dispute_amount' => $dispute->amount / 100,
                'dispute_reason' => $dispute->reason,
                'dispute_status' => $dispute->status,
                'dispute_created_at' => now()->toISOString(),
            ]),
        ]);
        
        // Send immediate alert to administrators
        if (app()->environment('production')) {
            \Mail::raw(
                "URGENT: Payment dispute created!\n\n" .
                "Dispute ID: {$dispute->id}\n" .
                "Order ID: {$payment->order_id}\n" .
                "Amount: €" . number_format($dispute->amount / 100, 2) . "\n" .
                "Reason: {$dispute->reason}\n" .
                "Status: {$dispute->status}",
                function ($message) {
                    $message->to(config('stripe.alerts.admin_email'))
                           ->subject('[URGENT] Payment Dispute Alert - Immediate Action Required')
                           ->priority(1);
                }
            );
        }
    }
    
    /**
     * Determine if an error is retryable
     *
     * @param \Exception $e
     * @return bool
     */
    private function isRetryableError(\Exception $e): bool
    {
        // Database connection errors
        if ($e instanceof \Illuminate\Database\QueryException) {
            return true;
        }
        
        // Network/timeout errors
        if (str_contains($e->getMessage(), 'cURL error') || 
            str_contains($e->getMessage(), 'timeout') ||
            str_contains($e->getMessage(), 'connection')) {
            return true;
        }
        
        // Temporary server errors
        if ($e instanceof \Symfony\Component\HttpKernel\Exception\HttpException) {
            $code = $e->getStatusCode();
            return $code >= 500 && $code < 600;
        }
        
        return false;
    }
}