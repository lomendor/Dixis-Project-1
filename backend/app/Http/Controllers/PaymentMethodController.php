<?php

namespace App\Http\Controllers;

use App\Services\StripeCustomerService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class PaymentMethodController extends Controller
{
    protected StripeCustomerService $stripeCustomerService;
    
    public function __construct(StripeCustomerService $stripeCustomerService)
    {
        $this->stripeCustomerService = $stripeCustomerService;
    }
    
    /**
     * List user's saved payment methods
     */
    public function index(): JsonResponse
    {
        $user = Auth::user();
        $paymentMethods = $this->stripeCustomerService->listPaymentMethods($user);
        
        return response()->json([
            'payment_methods' => $paymentMethods,
            'has_payment_methods' => count($paymentMethods) > 0,
        ]);
    }
    
    /**
     * Create setup intent for saving new payment method
     */
    public function createSetupIntent(): JsonResponse
    {
        try {
            $user = Auth::user();
            $setupIntent = $this->stripeCustomerService->createSetupIntent($user);
            
            return response()->json([
                'client_secret' => $setupIntent->client_secret,
                'setup_intent_id' => $setupIntent->id,
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to create setup intent',
                'message' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }
    
    /**
     * Save new payment method
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'payment_method_id' => 'required|string',
            'set_as_default' => 'boolean',
        ]);
        
        try {
            $user = Auth::user();
            $paymentMethod = $this->stripeCustomerService->savePaymentMethod(
                $user,
                $validated['payment_method_id'],
                $validated['set_as_default'] ?? false
            );
            
            return response()->json([
                'message' => 'Η κάρτα αποθηκεύτηκε επιτυχώς',
                'payment_method' => $this->stripeCustomerService->formatPaymentMethod($paymentMethod),
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Αποτυχία αποθήκευσης κάρτας',
                'message' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }
    
    /**
     * Delete payment method
     */
    public function destroy(string $paymentMethodId): JsonResponse
    {
        try {
            $user = Auth::user();
            $deleted = $this->stripeCustomerService->deletePaymentMethod($user, $paymentMethodId);
            
            if (!$deleted) {
                return response()->json([
                    'error' => 'Η κάρτα δεν βρέθηκε ή δεν μπορεί να διαγραφεί',
                ], 404);
            }
            
            return response()->json([
                'message' => 'Η κάρτα διαγράφηκε επιτυχώς',
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Αποτυχία διαγραφής κάρτας',
                'message' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }
    
    /**
     * Set default payment method
     */
    public function setDefault(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'payment_method_id' => 'required|string',
        ]);
        
        try {
            $user = Auth::user();
            $updated = $this->stripeCustomerService->setDefaultPaymentMethod(
                $user,
                $validated['payment_method_id']
            );
            
            if (!$updated) {
                return response()->json([
                    'error' => 'Η κάρτα δεν βρέθηκε ή δεν μπορεί να οριστεί ως προεπιλογή',
                ], 404);
            }
            
            return response()->json([
                'message' => 'Η προεπιλεγμένη κάρτα ενημερώθηκε επιτυχώς',
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Αποτυχία ενημέρωσης προεπιλεγμένης κάρτας',
                'message' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }
}