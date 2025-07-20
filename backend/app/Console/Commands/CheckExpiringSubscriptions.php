<?php

namespace App\Console\Commands;

use App\Models\Subscription;
use App\Models\User;
use App\Notifications\SubscriptionExpiring;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class CheckExpiringSubscriptions extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'subscriptions:check-expiring';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check for subscriptions that are expiring soon and send notifications';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $this->info('Checking for expiring subscriptions...');
        
        // Check for subscriptions expiring in 7 days
        $this->checkExpiringSubscriptions(7);
        
        // Check for subscriptions expiring in 3 days
        $this->checkExpiringSubscriptions(3);
        
        // Check for subscriptions expiring in 1 day
        $this->checkExpiringSubscriptions(1);
        
        $this->info('Finished checking for expiring subscriptions.');
        
        return 0;
    }
    
    /**
     * Check for subscriptions expiring in the specified number of days.
     *
     * @param int $days
     * @return void
     */
    protected function checkExpiringSubscriptions(int $days)
    {
        $date = Carbon::now()->addDays($days)->toDateString();
        
        $this->info("Checking for subscriptions expiring in {$days} days ({$date})...");
        
        $subscriptions = Subscription::where('status', 'active')
            ->whereDate('end_date', $date)
            ->get();
        
        $this->info("Found {$subscriptions->count()} subscriptions expiring in {$days} days.");
        
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
                
                // Send notification
                $user->notify(new SubscriptionExpiring($subscription, $days));
                
                $this->info("Sent expiration notification to user {$user->email} for subscription {$subscription->id}");
            } catch (\Exception $e) {
                $this->error("Error sending notification for subscription {$subscription->id}: {$e->getMessage()}");
                Log::error("Error sending subscription expiration notification: {$e->getMessage()}", [
                    'subscription_id' => $subscription->id,
                    'days' => $days,
                    'exception' => $e,
                ]);
            }
        }
    }
}
