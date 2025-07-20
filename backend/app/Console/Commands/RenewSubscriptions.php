<?php

namespace App\Console\Commands;

use App\Models\Subscription;
use App\Models\User;
use App\Notifications\SubscriptionRenewed;
use App\Services\StripeService;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class RenewSubscriptions extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'subscriptions:renew';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Renew subscriptions that are set to auto-renew and are expiring today';

    /**
     * The Stripe service instance.
     *
     * @var StripeService
     */
    protected $stripeService;

    /**
     * Create a new command instance.
     *
     * @param StripeService $stripeService
     * @return void
     */
    public function __construct(StripeService $stripeService)
    {
        parent::__construct();
        $this->stripeService = $stripeService;
    }

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $this->info('Checking for subscriptions to renew...');
        
        $today = Carbon::now()->toDateString();
        
        $subscriptions = Subscription::where('status', 'active')
            ->where('auto_renew', true)
            ->whereDate('end_date', $today)
            ->get();
        
        $this->info("Found {$subscriptions->count()} subscriptions to renew.");
        
        foreach ($subscriptions as $subscription) {
            try {
                // Get the user associated with the subscription
                $user = null;
                
                if ($subscription->subscribable_type === 'App\\Models\\Producer') {
                    $user = User::whereHas('producer', function ($query) use ($subscription) {
                        $query->where('id', $subscription->subscribable_id);
                    })->first();
                } elseif ($subscription->subscribable_type === 'App\\Models\\Business') {
                    $user = User::whereHas('business', function ($query) use ($subscription) {
                        $query->where('id', $subscription->subscribable_id);
                    })->first();
                }
                
                if (!$user) {
                    $this->error("Could not find user for subscription {$subscription->id}");
                    continue;
                }
                
                // If the plan is free, just renew the subscription
                if ($subscription->plan->price <= 0) {
                    $this->renewSubscription($subscription, $user);
                    continue;
                }
                
                // For paid plans, process the payment
                try {
                    // Create a payment intent
                    $paymentIntent = $this->stripeService->createSubscriptionPaymentIntent($user, $subscription->plan);
                    
                    // Process the payment
                    $payment = $this->stripeService->handleSuccessfulPayment($paymentIntent['payment_intent_id']);
                    
                    // Renew the subscription
                    $this->renewSubscription($subscription, $user);
                    
                    $this->info("Renewed subscription {$subscription->id} for user {$user->email}");
                } catch (\Exception $e) {
                    $this->error("Error processing payment for subscription {$subscription->id}: {$e->getMessage()}");
                    Log::error("Error processing payment for subscription renewal: {$e->getMessage()}", [
                        'subscription_id' => $subscription->id,
                        'user_id' => $user->id,
                        'exception' => $e,
                    ]);
                }
            } catch (\Exception $e) {
                $this->error("Error renewing subscription {$subscription->id}: {$e->getMessage()}");
                Log::error("Error renewing subscription: {$e->getMessage()}", [
                    'subscription_id' => $subscription->id,
                    'exception' => $e,
                ]);
            }
        }
        
        $this->info('Finished renewing subscriptions.');
        
        return 0;
    }
    
    /**
     * Renew a subscription.
     *
     * @param Subscription $subscription
     * @param User $user
     * @return void
     */
    protected function renewSubscription(Subscription $subscription, User $user)
    {
        // Update the subscription dates
        $subscription->start_date = Carbon::now();
        $subscription->end_date = Carbon::now()->addMonths($subscription->plan->duration_months);
        $subscription->last_payment_date = Carbon::now();
        $subscription->next_payment_date = Carbon::now()->addMonths($subscription->plan->duration_months);
        $subscription->save();
        
        // Send notification
        $user->notify(new SubscriptionRenewed($subscription));
        
        $this->info("Renewed subscription {$subscription->id} for user {$user->email}");
    }
}
