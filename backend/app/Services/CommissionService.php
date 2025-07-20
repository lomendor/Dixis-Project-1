<?php

namespace App\Services;

use App\Models\Producer;
use App\Models\Business;
use App\Models\Subscription;
use App\Models\SubscriptionPlan;
use Carbon\Carbon;

class CommissionService
{
    /**
     * Get the commission rate for a producer.
     *
     * @param Producer $producer
     * @return float
     */
    public function getProducerCommissionRate(Producer $producer): float
    {
        // Get the active subscription for the producer
        $subscription = Subscription::where('subscribable_type', 'App\\Models\\Producer')
            ->where('subscribable_id', $producer->id)
            ->where('status', 'active')
            ->whereDate('end_date', '>=', Carbon::now())
            ->orderBy('created_at', 'desc')
            ->first();
        
        if (!$subscription) {
            // If no active subscription, get the free plan
            $freePlan = SubscriptionPlan::where('target_type', 'producer')
                ->where('price', 0)
                ->where('is_active', true)
                ->first();
            
            return $freePlan ? $freePlan->commission_rate : 7.0; // Default to 7% if no free plan found
        }
        
        return $subscription->plan->commission_rate;
    }
    
    /**
     * Get the commission rate for a business.
     *
     * @param Business $business
     * @return float
     */
    public function getBusinessCommissionRate(Business $business): float
    {
        // Get the active subscription for the business
        $subscription = Subscription::where('subscribable_type', 'App\\Models\\Business')
            ->where('subscribable_id', $business->id)
            ->where('status', 'active')
            ->whereDate('end_date', '>=', Carbon::now())
            ->orderBy('created_at', 'desc')
            ->first();
        
        if (!$subscription) {
            // If no active subscription, get the basic plan
            $basicPlan = SubscriptionPlan::where('target_type', 'business')
                ->where('name', 'Basic')
                ->where('is_active', true)
                ->first();
            
            return $basicPlan ? $basicPlan->commission_rate : 3.5; // Default to 3.5% if no basic plan found
        }
        
        return $subscription->plan->commission_rate;
    }
    
    /**
     * Get the adoption commission rate.
     *
     * @return float
     */
    public function getAdoptionCommissionRate(): float
    {
        return 12.0; // 12% for adoptions
    }
    
    /**
     * Get the live session commission rate.
     *
     * @return float
     */
    public function getLiveSessionCommissionRate(): float
    {
        return 15.0; // 15% for live sessions
    }
    
    /**
     * Calculate the commission amount for a given price and commission rate.
     *
     * @param float $price
     * @param float $commissionRate
     * @return float
     */
    public function calculateCommission(float $price, float $commissionRate): float
    {
        return round($price * ($commissionRate / 100), 2);
    }
    
    /**
     * Calculate the transaction fee for a given price.
     *
     * @param float $price
     * @param string $paymentMethod
     * @return float
     */
    public function calculateTransactionFee(float $price, string $paymentMethod = 'card'): float
    {
        // Stripe fee: 2.9% + €0.30 per successful card charge
        if ($paymentMethod === 'card' || $paymentMethod === 'stripe') {
            return round(($price * 0.029) + 0.30, 2);
        }
        
        // PayPal fee: 3.4% + €0.35 per transaction
        if ($paymentMethod === 'paypal') {
            return round(($price * 0.034) + 0.35, 2);
        }
        
        // Default fee: 3% + €0.30
        return round(($price * 0.03) + 0.30, 2);
    }
}
