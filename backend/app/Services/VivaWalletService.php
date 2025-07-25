<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Payment;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * Viva Wallet Payment Service for Greek Market
 * 
 * Handles payment processing through Viva Wallet API
 * Supports installment payments, Greek bank integration, and AADE tax compliance
 */
class VivaWalletService
{
    protected string $baseUrl;
    protected string $clientId;
    protected string $clientSecret;
    protected string $merchantId;
    protected string $apiKey;
    protected bool $isSandbox;

    public function __construct()
    {
        $this->isSandbox = config('services.viva_wallet.sandbox', true);
        $this->baseUrl = $this->isSandbox 
            ? 'https://demo.vivapayments.com' 
            : 'https://www.vivapayments.com';
        
        $this->clientId = config('services.viva_wallet.client_id');
        $this->clientSecret = config('services.viva_wallet.client_secret');
        $this->merchantId = config('services.viva_wallet.merchant_id');
        $this->apiKey = config('services.viva_wallet.api_key');
    }

    /**
     * Create a payment order for Viva Wallet
     * 
     * @param Order $order
     * @param array $options - installments, payment method preferences
     * @return array
     */
    public function createPaymentOrder(Order $order, array $options = []): array
    {
        try {
            // Get access token first
            $accessToken = $this->getAccessToken();

            // Prepare payment order data
            $paymentData = [
                'amount' => (int) round($order->total * 100), // Convert to cents
                'customerTrns' => "Order #{$order->order_number}",
                'customer' => [
                    'email' => $order->user->email,
                    'fullName' => $order->shipping_name ?? $order->user->name,
                    'phone' => $order->shipping_phone ?? $order->user->phone,
                    'countryCode' => 'GR', // Greek market focus
                    'requestLang' => 'el-GR' // Greek language
                ],
                'paymentTimeout' => 1800, // 30 minutes timeout
                'preauth' => false,
                'allowRecurring' => false,
                'maxInstallments' => $this->calculateMaxInstallments($order->total, $options),
                'paymentNotification' => true,
                'tipAmount' => 0,
                'disableExactAmount' => false,
                'disableCash' => true, // Online payments only
                'disableWallet' => false,
                'sourceCode' => config('services.viva_wallet.source_code'),
                'merchantTrns' => "DIXIS-ORDER-{$order->id}",
                'tags' => [
                    'order_id' => $order->id,
                    'platform' => 'dixis',
                    'market' => 'greek'
                ]
            ];

            // Add Greek VAT information
            if ($vatInfo = $this->calculateGreekVAT($order)) {
                $paymentData['vatInfo'] = $vatInfo;
            }

            // Create payment order
            $response = Http::withToken($accessToken)
                ->withHeaders([
                    'Content-Type' => 'application/json',
                    'Accept' => 'application/json'
                ])
                ->post("{$this->baseUrl}/api/orders", $paymentData);

            if (!$response->successful()) {
                throw new \Exception('Viva Wallet API Error: ' . $response->body());
            }

            $result = $response->json();
            
            // Create payment record in database
            $payment = new Payment([
                'order_id' => $order->id,
                'user_id' => $order->user_id,
                'transaction_id' => $result['orderCode'],
                'status' => 'pending',
                'payment_gateway' => 'viva_wallet',
                'payment_method' => 'card',
                'amount' => $order->total,
                'currency' => 'EUR',
                'details' => [
                    'order_code' => $result['orderCode'],
                    'payment_url' => $this->buildPaymentUrl($result['orderCode']),
                    'max_installments' => $paymentData['maxInstallments'],
                    'viva_order_id' => $result['orderId'] ?? null,
                ],
                'payment_date' => now(),
            ]);
            $payment->save();

            Log::info('Viva Wallet payment order created', [
                'order_id' => $order->id,
                'order_code' => $result['orderCode'],
                'amount' => $order->total
            ]);

            return [
                'success' => true,
                'order_code' => $result['orderCode'],
                'payment_url' => $this->buildPaymentUrl($result['orderCode']),
                'payment_id' => $payment->id,
                'max_installments' => $paymentData['maxInstallments'],
                'expires_at' => now()->addMinutes(30)->toISOString()
            ];

        } catch (\Exception $e) {
            Log::error('Viva Wallet payment order creation failed', [
                'order_id' => $order->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            throw new \Exception('Failed to create Viva Wallet payment: ' . $e->getMessage());
        }
    }

    /**
     * Verify payment completion via webhook or callback
     * 
     * @param string $orderCode
     * @param array $webhookData
     * @return Payment
     */
    public function verifyPayment(string $orderCode, array $webhookData = []): Payment
    {
        try {
            $payment = Payment::where('transaction_id', $orderCode)->firstOrFail();
            
            // Get payment details from Viva Wallet API
            $accessToken = $this->getAccessToken();
            
            $response = Http::withToken($accessToken)
                ->get("{$this->baseUrl}/api/orders/{$orderCode}");

            if (!$response->successful()) {
                throw new \Exception('Failed to verify payment with Viva Wallet API');
            }

            $paymentInfo = $response->json();
            $transactionInfo = $paymentInfo['transactions'][0] ?? null;

            if (!$transactionInfo) {
                throw new \Exception('No transaction information found');
            }

            // Update payment status based on Viva Wallet response
            $vivaStatus = $transactionInfo['statusId'] ?? '';
            switch ($vivaStatus) {
                case 'F': // Paid
                    $payment->status = 'succeeded';
                    $this->updateOrderPaymentStatus($payment->order, 'paid');
                    break;
                case 'E': // Error/Failed
                    $payment->status = 'failed';
                    break;
                case 'A': // Authorized (for preauth)
                    $payment->status = 'authorized';
                    break;
                default:
                    $payment->status = 'pending';
            }

            // Update payment details with transaction information
            $payment->details = array_merge($payment->details ?? [], [
                'transaction_id' => $transactionInfo['transactionId'] ?? null,
                'status_id' => $vivaStatus,
                'installments' => $transactionInfo['installments'] ?? 0,
                'card_number' => $transactionInfo['cardNumber'] ?? null,
                'card_type' => $transactionInfo['cardType'] ?? null,
                'bank_id' => $transactionInfo['bankId'] ?? null,
                'verification_date' => now()->toISOString(),
                'webhook_data' => $webhookData
            ]);

            $payment->save();

            Log::info('Viva Wallet payment verified', [
                'order_code' => $orderCode,
                'status' => $payment->status,
                'transaction_id' => $transactionInfo['transactionId'] ?? null
            ]);

            return $payment;

        } catch (\Exception $e) {
            Log::error('Viva Wallet payment verification failed', [
                'order_code' => $orderCode,
                'error' => $e->getMessage()
            ]);

            throw $e;
        }
    }

    /**
     * Handle Viva Wallet webhook notifications
     * 
     * @param array $webhookData
     * @return Payment|null
     */
    public function handleWebhook(array $webhookData): ?Payment
    {
        try {
            $eventType = $webhookData['EventTypeId'] ?? null;
            $orderCode = $webhookData['OrderCode'] ?? null;

            if (!$orderCode) {
                Log::warning('Viva Wallet webhook received without order code', $webhookData);
                return null;
            }

            // Find payment by order code
            $payment = Payment::where('transaction_id', $orderCode)->first();
            if (!$payment) {
                Log::warning('Payment not found for Viva Wallet webhook', [
                    'order_code' => $orderCode,
                    'event_type' => $eventType
                ]);
                return null;
            }

            // Handle different event types
            switch ($eventType) {
                case 1796: // Transaction Payment Created
                    return $this->verifyPayment($orderCode, $webhookData);
                
                case 1797: // Transaction Failed
                    $payment->status = 'failed';
                    $payment->details = array_merge($payment->details ?? [], [
                        'webhook_event' => 'transaction_failed',
                        'webhook_data' => $webhookData,
                        'failed_at' => now()->toISOString()
                    ]);
                    $payment->save();
                    break;

                case 1798: // Transaction Cancelled
                    $payment->status = 'cancelled';
                    $payment->details = array_merge($payment->details ?? [], [
                        'webhook_event' => 'transaction_cancelled',
                        'webhook_data' => $webhookData,
                        'cancelled_at' => now()->toISOString()
                    ]);
                    $payment->save();
                    break;
            }

            return $payment;

        } catch (\Exception $e) {
            Log::error('Viva Wallet webhook processing failed', [
                'webhook_data' => $webhookData,
                'error' => $e->getMessage()
            ]);

            throw $e;
        }
    }

    /**
     * Refund a payment
     * 
     * @param Payment $payment
     * @param float|null $amount - null for full refund
     * @param string $reason
     * @return array
     */
    public function refundPayment(Payment $payment, ?float $amount = null, string $reason = ''): array
    {
        try {
            $accessToken = $this->getAccessToken();
            $refundAmount = $amount ?? $payment->amount;
            
            $refundData = [
                'amount' => (int) round($refundAmount * 100), // Convert to cents
                'transactionId' => $payment->details['transaction_id'] ?? null,
                'sourceCode' => config('services.viva_wallet.source_code'),
                'customerTrns' => $reason ?: "Refund for Order #{$payment->order->order_number}"
            ];

            $response = Http::withToken($accessToken)
                ->withHeaders([
                    'Content-Type' => 'application/json',
                    'Accept' => 'application/json'
                ])
                ->post("{$this->baseUrl}/api/transactions/{$payment->details['transaction_id']}/refunds", $refundData);

            if (!$response->successful()) {
                throw new \Exception('Viva Wallet refund failed: ' . $response->body());
            }

            $result = $response->json();

            // Update payment details with refund information
            $payment->details = array_merge($payment->details ?? [], [
                'refund_id' => $result['refundId'] ?? null,
                'refund_amount' => $refundAmount,
                'refund_reason' => $reason,
                'refunded_at' => now()->toISOString()
            ]);
            $payment->save();

            Log::info('Viva Wallet refund processed', [
                'payment_id' => $payment->id,
                'refund_amount' => $refundAmount,
                'refund_id' => $result['refundId'] ?? null
            ]);

            return [
                'success' => true,
                'refund_id' => $result['refundId'] ?? null,
                'amount' => $refundAmount,
                'status' => $result['status'] ?? 'pending'
            ];

        } catch (\Exception $e) {
            Log::error('Viva Wallet refund failed', [
                'payment_id' => $payment->id,
                'error' => $e->getMessage()
            ]);

            throw $e;
        }
    }

    /**
     * Get OAuth2 access token from Viva Wallet
     * 
     * @return string
     */
    protected function getAccessToken(): string
    {
        try {
            $response = Http::asForm()
                ->withBasicAuth($this->clientId, $this->clientSecret)
                ->post("{$this->baseUrl}/connect/token", [
                    'grant_type' => 'client_credentials',
                    'scope' => 'urn:vivapayments.com:api.payment'
                ]);

            if (!$response->successful()) {
                throw new \Exception('Failed to get Viva Wallet access token: ' . $response->body());
            }

            $tokenData = $response->json();
            return $tokenData['access_token'];

        } catch (\Exception $e) {
            Log::error('Viva Wallet token request failed', [
                'error' => $e->getMessage()
            ]);

            throw new \Exception('Failed to authenticate with Viva Wallet: ' . $e->getMessage());
        }
    }

    /**
     * Calculate maximum installments based on order amount and Greek regulations
     * 
     * @param float $amount
     * @param array $options
     * @return int
     */
    protected function calculateMaxInstallments(float $amount, array $options = []): int
    {
        // Greek market installment rules
        if ($amount < 30) {
            return 0; // No installments for small amounts
        } elseif ($amount < 100) {
            return 3; // Up to 3 installments
        } elseif ($amount < 500) {
            return 6; // Up to 6 installments
        } elseif ($amount < 1500) {
            return 12; // Up to 12 installments for medium amounts
        } else {
            return 36; // Up to 36 installments for large B2B orders
        }
    }

    /**
     * Calculate Greek VAT information for the order
     * 
     * @param Order $order
     * @return array|null
     */
    protected function calculateGreekVAT(Order $order): ?array
    {
        // Get shipping location to determine VAT rate
        $isIsland = $this->isGreekIsland($order->shipping_city ?? '');
        $vatRate = $isIsland ? 0.13 : 0.24; // 13% for islands, 24% for mainland

        $subtotal = $order->subtotal ?? ($order->total / (1 + $vatRate));
        $vatAmount = $order->total - $subtotal;

        return [
            'vatRate' => $vatRate,
            'vatAmount' => (int) round($vatAmount * 100), // In cents
            'netAmount' => (int) round($subtotal * 100), // In cents
            'location' => $isIsland ? 'island' : 'mainland'
        ];
    }

    /**
     * Check if a city is on a Greek island (simplified logic)
     * 
     * @param string $city
     * @return bool
     */
    protected function isGreekIsland(string $city): bool
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

    /**
     * Build payment URL for Viva Wallet checkout
     * 
     * @param string $orderCode
     * @return string
     */
    protected function buildPaymentUrl(string $orderCode): string
    {
        $baseCheckoutUrl = $this->isSandbox 
            ? 'https://demo.vivapayments.com/web/checkout' 
            : 'https://www.vivapayments.com/web/checkout';

        return "{$baseCheckoutUrl}?ref={$orderCode}&lang=el";
    }

    /**
     * Update order payment status
     * 
     * @param Order $order
     * @param string $status
     * @return void
     */
    protected function updateOrderPaymentStatus(Order $order, string $status): void
    {
        $order->payment_status = $status;
        $order->save();

        Log::info('Order payment status updated', [
            'order_id' => $order->id,
            'payment_status' => $status
        ]);
    }
}