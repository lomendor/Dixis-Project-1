<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Payment;
use App\Services\VivaWalletService;
use Illuminate\Support\Facades\Log;
use Stripe\Exception\ApiErrorException;
use Stripe\PaymentIntent;
use Stripe\Stripe;

class PaymentService
{
    /**
     * Initialize the Stripe API key.
     */
    public function __construct()
    {
        Stripe::setApiKey(config('services.stripe.secret'));
    }
    
    /**
     * Create a payment for an order.
     *
     * @param Order $order
     * @param string $paymentMethod
     * @param array $paymentData
     * @return Payment
     */
    public function createPayment(Order $order, string $paymentMethod, array $paymentData = []): Payment
    {
        // Create a payment record
        $payment = new Payment([
            'order_id' => $order->id,
            'status' => 'pending',
            'payment_gateway' => $paymentMethod,
            'amount' => $order->total,
            'details' => $paymentData,
        ]);
        
        $payment->save();
        
        // Process payment based on method
        switch ($paymentMethod) {
            case 'stripe':
                return $this->processStripePayment($payment, $paymentData);
            case 'viva_wallet':
                return $this->processVivaWalletPayment($payment, $paymentData);
            case 'paypal':
                return $this->processPayPalPayment($payment, $paymentData);
            case 'bank_transfer':
                return $this->processBankTransferPayment($payment, $paymentData);
            case 'cod':
                return $this->processCodPayment($payment);
            default:
                throw new \InvalidArgumentException("Unsupported payment method: {$paymentMethod}");
        }
    }
    
    /**
     * Process a Stripe payment.
     *
     * @param Payment $payment
     * @param array $paymentData
     * @return Payment
     */
    protected function processStripePayment(Payment $payment, array $paymentData): Payment
    {
        try {
            // Create a PaymentIntent
            $paymentIntent = PaymentIntent::create([
                'amount' => (int) ($payment->amount * 100), // Convert to cents
                'currency' => 'eur',
                'payment_method' => $paymentData['payment_method_id'] ?? null,
                'confirm' => $paymentData['confirm'] ?? false,
                'confirmation_method' => 'manual',
                'description' => "Order #{$payment->order->order_number}",
                'metadata' => [
                    'order_id' => $payment->order_id,
                    'payment_id' => $payment->id,
                ],
            ]);
            
            // Update payment with transaction ID and details
            $payment->transaction_id = $paymentIntent->id;
            $payment->details = array_merge($payment->details ?? [], [
                'payment_intent' => $paymentIntent->id,
                'client_secret' => $paymentIntent->client_secret,
                'status' => $paymentIntent->status,
            ]);
            
            // Update payment status based on PaymentIntent status
            switch ($paymentIntent->status) {
                case 'requires_confirmation':
                case 'requires_action':
                case 'requires_payment_method':
                    $payment->status = 'pending';
                    break;
                case 'processing':
                    $payment->status = 'processing';
                    break;
                case 'succeeded':
                    $payment->status = 'succeeded';
                    // Update order payment status
                    $this->updateOrderPaymentStatus($payment->order, 'paid');
                    break;
                case 'canceled':
                    $payment->status = 'failed';
                    break;
                default:
                    $payment->status = 'pending';
            }
            
            $payment->save();
            
            return $payment;
        } catch (ApiErrorException $e) {
            Log::error('Stripe payment processing error: ' . $e->getMessage(), [
                'payment_id' => $payment->id,
                'order_id' => $payment->order_id,
                'error' => $e->getMessage(),
            ]);
            
            // Update payment status to failed
            $payment->status = 'failed';
            $payment->details = array_merge($payment->details ?? [], [
                'error' => $e->getMessage(),
            ]);
            $payment->save();
            
            throw $e;
        }
    }
    
    /**
     * Process a Viva Wallet payment (Greek payment gateway).
     *
     * @param Payment $payment
     * @param array $paymentData
     * @return Payment
     */
    protected function processVivaWalletPayment(Payment $payment, array $paymentData): Payment
    {
        try {
            $vivaWalletService = app(VivaWalletService::class);
            
            // Create payment order with Viva Wallet
            $result = $vivaWalletService->createPaymentOrder($payment->order, $paymentData);
            
            // Update payment with Viva Wallet order code and payment URL
            $payment->transaction_id = $result['order_code'];
            $payment->details = array_merge($payment->details ?? [], [
                'order_code' => $result['order_code'],
                'payment_url' => $result['payment_url'],
                'max_installments' => $result['max_installments'],
                'expires_at' => $result['expires_at'],
                'viva_created_at' => now()->toISOString()
            ]);
            $payment->status = 'pending';
            $payment->save();
            
            Log::info('Viva Wallet payment initiated', [
                'payment_id' => $payment->id,
                'order_id' => $payment->order_id,
                'order_code' => $result['order_code']
            ]);
            
            return $payment;
            
        } catch (\Exception $e) {
            Log::error('Viva Wallet payment processing error: ' . $e->getMessage(), [
                'payment_id' => $payment->id,
                'order_id' => $payment->order_id,
                'error' => $e->getMessage(),
            ]);
            
            // Update payment status to failed
            $payment->status = 'failed';
            $payment->details = array_merge($payment->details ?? [], [
                'error' => $e->getMessage(),
                'failed_at' => now()->toISOString()
            ]);
            $payment->save();
            
            throw $e;
        }
    }
    
    /**
     * Process a PayPal payment.
     *
     * @param Payment $payment
     * @param array $paymentData
     * @return Payment
     */
    protected function processPayPalPayment(Payment $payment, array $paymentData): Payment
    {
        // TODO: Implement PayPal payment processing
        // For now, just mark as pending
        $payment->status = 'pending';
        $payment->save();
        
        return $payment;
    }
    
    /**
     * Process a bank transfer payment.
     *
     * @param Payment $payment
     * @param array $paymentData
     * @return Payment
     */
    protected function processBankTransferPayment(Payment $payment, array $paymentData): Payment
    {
        // Bank transfer payments are always pending until manually confirmed
        $payment->status = 'pending';
        $payment->save();
        
        return $payment;
    }
    
    /**
     * Process a cash on delivery payment.
     *
     * @param Payment $payment
     * @return Payment
     */
    protected function processCodPayment(Payment $payment): Payment
    {
        // COD payments are always pending until delivery
        $payment->status = 'pending';
        $payment->save();
        
        return $payment;
    }
    
    /**
     * Confirm a Stripe payment.
     *
     * @param string $paymentIntentId
     * @return Payment
     */
    public function confirmStripePayment(string $paymentIntentId): Payment
    {
        try {
            // Find the payment by transaction_id
            $payment = Payment::where('transaction_id', $paymentIntentId)->firstOrFail();
            
            // Confirm the PaymentIntent
            $paymentIntent = PaymentIntent::retrieve($paymentIntentId);
            $paymentIntent->confirm();
            
            // Update payment status based on PaymentIntent status
            switch ($paymentIntent->status) {
                case 'requires_action':
                    $payment->status = 'pending';
                    break;
                case 'processing':
                    $payment->status = 'processing';
                    break;
                case 'succeeded':
                    $payment->status = 'succeeded';
                    // Update order payment status
                    $this->updateOrderPaymentStatus($payment->order, 'paid');
                    break;
                case 'canceled':
                    $payment->status = 'failed';
                    break;
                default:
                    $payment->status = 'pending';
            }
            
            // Update payment details
            $payment->details = array_merge($payment->details ?? [], [
                'status' => $paymentIntent->status,
            ]);
            $payment->save();
            
            return $payment;
        } catch (ApiErrorException $e) {
            Log::error('Stripe payment confirmation error: ' . $e->getMessage(), [
                'payment_intent_id' => $paymentIntentId,
                'error' => $e->getMessage(),
            ]);
            
            throw $e;
        }
    }
    
    /**
     * Handle a Stripe webhook event.
     *
     * @param array $payload
     * @return Payment|null
     */
    public function handleStripeWebhook(array $payload): ?Payment
    {
        $event = $payload['type'] ?? null;
        $data = $payload['data']['object'] ?? null;
        
        if (!$event || !$data) {
            return null;
        }
        
        // Find the payment by transaction_id
        $payment = Payment::where('transaction_id', $data['id'] ?? '')->first();
        
        if (!$payment) {
            return null;
        }
        
        // Handle different event types
        switch ($event) {
            case 'payment_intent.succeeded':
                $payment->status = 'succeeded';
                // Update order payment status
                $this->updateOrderPaymentStatus($payment->order, 'paid');
                break;
            case 'payment_intent.payment_failed':
                $payment->status = 'failed';
                break;
            case 'payment_intent.processing':
                $payment->status = 'processing';
                break;
            case 'payment_intent.canceled':
                $payment->status = 'failed';
                break;
        }
        
        // Update payment details
        $payment->details = array_merge($payment->details ?? [], [
            'event' => $event,
            'status' => $data['status'] ?? null,
        ]);
        $payment->save();
        
        return $payment;
    }
    
    /**
     * Update the payment status of an order.
     *
     * @param Order $order
     * @param string $status
     * @return Order
     */
    protected function updateOrderPaymentStatus(Order $order, string $status): Order
    {
        $order->payment_status = $status;
        $order->save();
        
        return $order;
    }
}
