<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Payment;
use App\Services\VivaWalletService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

/**
 * Greek Payment Methods Controller
 * 
 * Handles Greek-specific payment methods:
 * - Viva Wallet (primary Greek payment gateway)
 * - Greek bank cards with installments
 * - Greek VAT compliance
 */
class GreekPaymentController extends Controller
{
    protected VivaWalletService $vivaWalletService;

    public function __construct(VivaWalletService $vivaWalletService)
    {
        $this->vivaWalletService = $vivaWalletService;
    }

    /**
     * Create a Viva Wallet payment order
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function createVivaWalletPayment(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'order_id' => 'required|integer|exists:orders,id',
                'amount' => 'required|numeric|min:0.01',
                'installments' => 'integer|min:0|max:36',
                'options.language' => 'string|in:el,en',
                'options.return_url' => 'url',
                'options.cancel_url' => 'url',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 400);
            }

            $order = Order::findOrFail($request->order_id);
            
            // Verify order belongs to authenticated user (if not admin)
            if (!auth()->user()->isAdmin() && $order->user_id !== auth()->id()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized access to order'
                ], 403);
            }

            // Check if order already has a successful payment
            $existingPayment = Payment::where('order_id', $order->id)
                ->where('status', 'succeeded')
                ->first();

            if ($existingPayment) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Order already has a successful payment'
                ], 400);
            }

            // Prepare options for Viva Wallet
            $options = [
                'installments' => $request->input('installments', 0),
                'language' => $request->input('options.language', 'el'),
                'return_url' => $request->input('options.return_url'),
                'cancel_url' => $request->input('options.cancel_url'),
            ];

            // Create payment order with Viva Wallet
            $paymentResult = $this->vivaWalletService->createPaymentOrder($order, $options);

            Log::info('Viva Wallet payment order created', [
                'order_id' => $order->id,
                'order_code' => $paymentResult['order_code'],
                'user_id' => auth()->id()
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Viva Wallet payment order created successfully',
                'data' => [
                    'orderCode' => $paymentResult['order_code'],
                    'paymentUrl' => $paymentResult['payment_url'],
                    'paymentId' => $paymentResult['payment_id'],
                    'maxInstallments' => $paymentResult['max_installments'],
                    'expiresAt' => $paymentResult['expires_at'],
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Viva Wallet payment creation failed', [
                'order_id' => $request->order_id,
                'user_id' => auth()->id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to create Viva Wallet payment: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Handle Viva Wallet payment completion callback
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function handleVivaWalletCallback(Request $request): JsonResponse
    {
        try {
            $webhookData = $request->all();
            
            Log::info('Viva Wallet webhook received', [
                'event_type' => $webhookData['EventTypeId'] ?? null,
                'order_code' => $webhookData['OrderCode'] ?? null,
                'webhook_data' => $webhookData
            ]);

            // Process webhook with Viva Wallet service
            $payment = $this->vivaWalletService->handleWebhook($webhookData);

            if (!$payment) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Payment not found or webhook not processed'
                ], 404);
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Webhook processed successfully',
                'data' => [
                    'payment_id' => $payment->id,
                    'status' => $payment->status,
                    'order_id' => $payment->order_id
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Viva Wallet webhook processing failed', [
                'webhook_data' => $request->all(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Webhook processing failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Verify Viva Wallet payment status
     * 
     * @param string $orderCode
     * @return JsonResponse
     */
    public function verifyVivaWalletPayment(string $orderCode): JsonResponse
    {
        try {
            // Verify payment with Viva Wallet service
            $payment = $this->vivaWalletService->verifyPayment($orderCode);

            return response()->json([
                'status' => 'success',
                'message' => 'Payment verification completed',
                'data' => [
                    'payment_id' => $payment->id,
                    'order_id' => $payment->order_id,
                    'status' => $payment->status,
                    'amount' => $payment->amount,
                    'currency' => $payment->currency,
                    'details' => $payment->details,
                    'verified_at' => now()->toISOString()
                ]
            ]);

        } catch (\ModelNotFoundException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Payment not found'
            ], 404);

        } catch (\Exception $e) {
            Log::error('Viva Wallet payment verification failed', [
                'order_code' => $orderCode,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Payment verification failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get available Greek payment methods
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function getGreekPaymentMethods(Request $request): JsonResponse
    {
        try {
            $amount = $request->input('amount', 0);
            
            $methods = [
                [
                    'id' => 'viva_wallet',
                    'name' => 'Viva Wallet',
                    'description' => 'Ελληνικές τραπεζικές κάρτες με δόσεις',
                    'icon' => 'viva_wallet',
                    'supported_currencies' => ['EUR'],
                    'installments' => $this->getAvailableInstallments($amount),
                    'fees' => [
                        'percentage' => 0, // Can be 0% with fee-back program
                        'fixed' => 0
                    ],
                    'processing_time' => 'instant',
                    'settlement_time' => 'next_business_day'
                ],
                [
                    'id' => 'bank_transfer',
                    'name' => 'Τραπεζικό Έμβασμα',
                    'description' => 'Άμεση μεταφορά από τραπεζικό λογαριασμό',
                    'icon' => 'bank_transfer',
                    'supported_currencies' => ['EUR'],
                    'installments' => [],
                    'fees' => [
                        'percentage' => 0,
                        'fixed' => 0
                    ],
                    'processing_time' => '1-3_business_days',
                    'settlement_time' => '1-3_business_days'
                ],
                [
                    'id' => 'cash_on_delivery',
                    'name' => 'Αντικαταβολή',
                    'description' => 'Πληρωμή κατά την παράδοση',
                    'icon' => 'cash',
                    'supported_currencies' => ['EUR'],
                    'installments' => [],
                    'fees' => [
                        'percentage' => 0,
                        'fixed' => 2.50 // Standard COD fee in Greece
                    ],
                    'processing_time' => 'on_delivery',
                    'settlement_time' => 'on_delivery'
                ]
            ];

            return response()->json([
                'status' => 'success',
                'message' => 'Greek payment methods retrieved',
                'data' => $methods
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to get Greek payment methods', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve payment methods'
            ], 500);
        }
    }

    /**
     * Get available installment options for amount
     * 
     * @param float $amount
     * @return array
     */
    private function getAvailableInstallments(float $amount): array
    {
        $installments = [];
        
        if ($amount >= 30) {
            $installments[] = ['count' => 3, 'fee' => 0, 'description' => '3 άτοκες δόσεις'];
        }
        
        if ($amount >= 100) {
            $installments[] = ['count' => 6, 'fee' => 0, 'description' => '6 άτοκες δόσεις'];
        }
        
        if ($amount >= 500) {
            $installments[] = ['count' => 12, 'fee' => 0, 'description' => '12 άτοκες δόσεις'];
        }
        
        if ($amount >= 1500) {
            $installments[] = ['count' => 24, 'fee' => 0, 'description' => '24 άτοκες δόσεις'];
            $installments[] = ['count' => 36, 'fee' => 0, 'description' => '36 άτοκες δόσεις'];
        }
        
        return $installments;
    }

    /**
     * Refund a Viva Wallet payment
     * 
     * @param Request $request
     * @param int $paymentId
     * @return JsonResponse
     */
    public function refundVivaWalletPayment(Request $request, int $paymentId): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'amount' => 'numeric|min:0.01',
                'reason' => 'string|max:255',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 400);
            }

            $payment = Payment::findOrFail($paymentId);
            
            if ($payment->payment_gateway !== 'viva_wallet') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Payment is not a Viva Wallet payment'
                ], 400);
            }

            if ($payment->status !== 'succeeded') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Can only refund successful payments'
                ], 400);
            }

            $refundAmount = $request->input('amount', $payment->amount);
            $reason = $request->input('reason', 'Customer refund request');

            $refundResult = $this->vivaWalletService->refundPayment($payment, $refundAmount, $reason);

            Log::info('Viva Wallet refund processed', [
                'payment_id' => $payment->id,
                'refund_amount' => $refundAmount,
                'refund_id' => $refundResult['refund_id'],
                'user_id' => auth()->id()
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Refund processed successfully',
                'data' => $refundResult
            ]);

        } catch (\Exception $e) {
            Log::error('Viva Wallet refund failed', [
                'payment_id' => $paymentId,
                'error' => $e->getMessage(),
                'user_id' => auth()->id()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Refund processing failed: ' . $e->getMessage()
            ], 500);
        }
    }
}