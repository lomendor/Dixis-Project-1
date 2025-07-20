<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Log;
use Stripe\Customer;
use Stripe\PaymentMethod;
use Stripe\SetupIntent;
use Stripe\Stripe;
use Stripe\Exception\ApiErrorException;

class StripeCustomerService
{
    public function __construct()
    {
        Stripe::setApiKey(config('stripe.secret'));
    }
    
    /**
     * Create or retrieve Stripe customer for user
     */
    public function createOrRetrieveCustomer(User $user): Customer
    {
        // If user already has a Stripe customer ID, retrieve it
        if ($user->stripe_customer_id) {
            try {
                $customer = Customer::retrieve($user->stripe_customer_id);
                
                // Update customer info if needed
                if ($customer->email !== $user->email || $customer->name !== $user->name) {
                    $customer = Customer::update($user->stripe_customer_id, [
                        'email' => $user->email,
                        'name' => $user->name,
                    ]);
                }
                
                return $customer;
            } catch (ApiErrorException $e) {
                Log::warning('Failed to retrieve Stripe customer, creating new one', [
                    'user_id' => $user->id,
                    'stripe_customer_id' => $user->stripe_customer_id,
                    'error' => $e->getMessage(),
                ]);
            }
        }
        
        // Create new Stripe customer
        try {
            $customer = Customer::create([
                'email' => $user->email,
                'name' => $user->name,
                'phone' => $user->phone,
                'metadata' => [
                    'user_id' => $user->id,
                    'role' => $user->role,
                ],
                'preferred_locales' => ['el'],
            ]);
            
            // Save Stripe customer ID to user
            $user->update(['stripe_customer_id' => $customer->id]);
            
            Log::info('Stripe customer created', [
                'user_id' => $user->id,
                'stripe_customer_id' => $customer->id,
            ]);
            
            return $customer;
            
        } catch (ApiErrorException $e) {
            Log::error('Failed to create Stripe customer', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }
    
    /**
     * Create SetupIntent for saving payment methods
     */
    public function createSetupIntent(User $user): SetupIntent
    {
        $customer = $this->createOrRetrieveCustomer($user);
        
        return SetupIntent::create([
            'customer' => $customer->id,
            'payment_method_types' => ['card'],
            'usage' => 'off_session',
            'metadata' => [
                'user_id' => $user->id,
            ],
        ]);
    }
    
    /**
     * Save payment method to customer
     */
    public function savePaymentMethod(User $user, string $paymentMethodId, bool $setAsDefault = false): PaymentMethod
    {
        $customer = $this->createOrRetrieveCustomer($user);
        
        try {
            // Attach payment method to customer
            $paymentMethod = PaymentMethod::retrieve($paymentMethodId);
            $paymentMethod->attach(['customer' => $customer->id]);
            
            // Set as default if requested
            if ($setAsDefault) {
                Customer::update($customer->id, [
                    'invoice_settings' => [
                        'default_payment_method' => $paymentMethodId,
                    ],
                ]);
            }
            
            Log::info('Payment method saved', [
                'user_id' => $user->id,
                'payment_method_id' => $paymentMethodId,
                'is_default' => $setAsDefault,
            ]);
            
            return $paymentMethod;
            
        } catch (ApiErrorException $e) {
            Log::error('Failed to save payment method', [
                'user_id' => $user->id,
                'payment_method_id' => $paymentMethodId,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }
    
    /**
     * List customer's saved payment methods
     */
    public function listPaymentMethods(User $user, string $type = 'card'): array
    {
        if (!$user->stripe_customer_id) {
            return [];
        }
        
        try {
            $paymentMethods = PaymentMethod::all([
                'customer' => $user->stripe_customer_id,
                'type' => $type,
            ]);
            
            // Get default payment method
            $customer = Customer::retrieve($user->stripe_customer_id);
            $defaultPaymentMethodId = $customer->invoice_settings->default_payment_method ?? null;
            
            // Format payment methods
            $methods = [];
            foreach ($paymentMethods->data as $method) {
                $methods[] = $this->formatPaymentMethod($method, $method->id === $defaultPaymentMethodId);
            }
            
            return $methods;
            
        } catch (ApiErrorException $e) {
            Log::error('Failed to list payment methods', [
                'user_id' => $user->id,
                'stripe_customer_id' => $user->stripe_customer_id,
                'error' => $e->getMessage(),
            ]);
            return [];
        }
    }
    
    /**
     * Delete payment method
     */
    public function deletePaymentMethod(User $user, string $paymentMethodId): bool
    {
        try {
            // Verify payment method belongs to user
            $paymentMethod = PaymentMethod::retrieve($paymentMethodId);
            
            if ($paymentMethod->customer !== $user->stripe_customer_id) {
                Log::warning('Attempted to delete payment method not belonging to user', [
                    'user_id' => $user->id,
                    'payment_method_id' => $paymentMethodId,
                ]);
                return false;
            }
            
            // Detach payment method
            $paymentMethod->detach();
            
            Log::info('Payment method deleted', [
                'user_id' => $user->id,
                'payment_method_id' => $paymentMethodId,
            ]);
            
            return true;
            
        } catch (ApiErrorException $e) {
            Log::error('Failed to delete payment method', [
                'user_id' => $user->id,
                'payment_method_id' => $paymentMethodId,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }
    
    /**
     * Set default payment method
     */
    public function setDefaultPaymentMethod(User $user, string $paymentMethodId): bool
    {
        if (!$user->stripe_customer_id) {
            return false;
        }
        
        try {
            // Verify payment method belongs to user
            $paymentMethod = PaymentMethod::retrieve($paymentMethodId);
            
            if ($paymentMethod->customer !== $user->stripe_customer_id) {
                return false;
            }
            
            // Update default payment method
            Customer::update($user->stripe_customer_id, [
                'invoice_settings' => [
                    'default_payment_method' => $paymentMethodId,
                ],
            ]);
            
            Log::info('Default payment method updated', [
                'user_id' => $user->id,
                'payment_method_id' => $paymentMethodId,
            ]);
            
            return true;
            
        } catch (ApiErrorException $e) {
            Log::error('Failed to set default payment method', [
                'user_id' => $user->id,
                'payment_method_id' => $paymentMethodId,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }
    
    /**
     * Format payment method for API response
     */
    protected function formatPaymentMethod(PaymentMethod $method, bool $isDefault = false): array
    {
        $data = [
            'id' => $method->id,
            'type' => $method->type,
            'is_default' => $isDefault,
            'created_at' => date('Y-m-d H:i:s', $method->created),
        ];
        
        // Add card-specific data
        if ($method->type === 'card' && $method->card) {
            $data['card'] = [
                'brand' => $method->card->brand,
                'last4' => $method->card->last4,
                'exp_month' => $method->card->exp_month,
                'exp_year' => $method->card->exp_year,
                'funding' => $method->card->funding,
                'country' => $method->card->country,
            ];
        }
        
        // Add SEPA debit specific data
        if ($method->type === 'sepa_debit' && $method->sepa_debit) {
            $data['sepa_debit'] = [
                'last4' => $method->sepa_debit->last4,
                'bank_code' => $method->sepa_debit->bank_code,
                'country' => $method->sepa_debit->country,
            ];
        }
        
        return $data;
    }
}