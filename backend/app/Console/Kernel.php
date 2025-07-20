<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     */
    protected function schedule(Schedule $schedule): void
    {
        // Check for expiring subscriptions daily at 8:00 AM
        $schedule->command('subscriptions:check-expiring')
                 ->dailyAt('08:00')
                 ->timezone('Europe/Athens');
        
        // Renew subscriptions daily at 1:00 AM
        $schedule->command('subscriptions:renew')
                 ->dailyAt('01:00')
                 ->timezone('Europe/Athens');
                 
        // Stripe Health Monitoring - Every 5 minutes
        $schedule->command('stripe:monitor --check-failed-payments')
            ->everyFiveMinutes()
            ->withoutOverlapping()
            ->runInBackground();
            
        // Webhook connectivity test - Every hour
        $schedule->command('stripe:monitor --test-webhook')
            ->hourly()
            ->withoutOverlapping();
            
        // Daily payment report - Every day at 2 AM
        $schedule->command('stripe:report --email=' . config('stripe.alerts.admin_email'))
            ->dailyAt('02:00')
            ->timezone('Europe/Athens')
            ->withoutOverlapping();
            
        // Monthly report - First day of each month at 3 AM
        $schedule->command('stripe:report --month=' . now()->format('Y-m') . ' --email=' . config('stripe.alerts.admin_email'))
            ->monthlyOn(1, '03:00')
            ->timezone('Europe/Athens')
            ->withoutOverlapping();
            
        // Full system health check with alerts - Every 30 minutes
        $schedule->command('stripe:monitor --alert')
            ->everyThirtyMinutes()
            ->withoutOverlapping()
            ->onFailure(function () {
                \Log::critical('Stripe monitoring command failed to execute');
            });
    }

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}
