<?php

namespace App\Services;

use App\Models\Payment;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;

class PaymentMonitoringService
{
    /**
     * Log payment attempt with comprehensive details.
     */
    public function logPaymentAttempt($paymentIntent, string $status, ?array $metadata = [])
    {
        $logData = [
            'payment_intent_id' => $paymentIntent->id ?? null,
            'amount' => $paymentIntent->amount ?? null,
            'currency' => $paymentIntent->currency ?? 'EUR',
            'status' => $status,
            'user_id' => auth()->id(),
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'timestamp' => now()->toIso8601String(),
            'metadata' => $metadata,
        ];
        
        Log::channel('stripe')->info("Payment attempt: {$status}", $logData);
        
        // Track failed attempts for monitoring
        if ($status === 'failed') {
            $this->incrementFailedAttempts();
        }
        
        // Check for high-value transactions
        if (($paymentIntent->amount ?? 0) >= config('stripe.alerts.high_value_payment_threshold') * 100) {
            $this->alertHighValuePayment($paymentIntent);
        }
    }
    
    /**
     * Log webhook event processing.
     */
    public function logWebhookEvent(string $eventType, $event, ?string $error = null)
    {
        $logData = [
            'event_id' => $event->id ?? null,
            'event_type' => $eventType,
            'created' => $event->created ?? null,
            'livemode' => $event->livemode ?? false,
            'error' => $error,
            'timestamp' => now()->toIso8601String(),
        ];
        
        $logLevel = $error ? 'error' : 'info';
        Log::channel('stripe')->$logLevel("Webhook event: {$eventType}", $logData);
        
        if ($error) {
            $this->incrementWebhookFailures();
        } else {
            $this->resetWebhookFailures();
        }
    }
    
    /**
     * Check for suspicious payment patterns.
     */
    public function checkFraudIndicators(User $user, float $amount): array
    {
        $warnings = [];
        $config = config('stripe.fraud_detection');
        
        // Check daily transaction count
        $dailyCount = Payment::where('user_id', $user->id)
            ->where('created_at', '>=', now()->startOfDay())
            ->count();
            
        if ($dailyCount >= $config['max_transactions_per_day_per_user']) {
            $warnings[] = 'Daily transaction limit exceeded';
        }
        
        // Check daily amount
        $dailyAmount = Payment::where('user_id', $user->id)
            ->where('created_at', '>=', now()->startOfDay())
            ->where('status', 'succeeded')
            ->sum('amount');
            
        if (($dailyAmount + $amount) > $config['max_amount_per_day_per_user']) {
            $warnings[] = 'Daily amount limit exceeded';
        }
        
        // Check for suspicious amount
        if ($amount >= $config['suspicious_amount_threshold']) {
            $warnings[] = 'High-value transaction';
        }
        
        // Check for rapid successive transactions
        $recentTransaction = Payment::where('user_id', $user->id)
            ->where('created_at', '>=', now()->subMinutes(5))
            ->exists();
            
        if ($recentTransaction) {
            $warnings[] = 'Rapid successive transactions';
        }
        
        if (!empty($warnings)) {
            Log::channel('stripe')->warning('Fraud indicators detected', [
                'user_id' => $user->id,
                'amount' => $amount,
                'warnings' => $warnings,
            ]);
        }
        
        return $warnings;
    }
    
    /**
     * Alert administrators about failed payment threshold.
     */
    public function alertFailedPayments()
    {
        $threshold = config('stripe.alerts.failed_payment_threshold');
        $failedCount = Cache::get('stripe.failed_payments.count', 0);
        
        if ($failedCount >= $threshold) {
            Log::channel('stripe')->critical('Failed payment threshold exceeded', [
                'count' => $failedCount,
                'threshold' => $threshold,
                'period' => 'last hour',
            ]);
            
            // In production, send email alert
            if (app()->environment('production')) {
                Mail::raw(
                    "ALERT: {$failedCount} failed payments in the last hour (threshold: {$threshold})",
                    function ($message) {
                        $message->to(config('stripe.alerts.admin_email'))
                               ->subject('[Dixis] High Failed Payment Rate Alert');
                    }
                );
            }
            
            // Reset counter after alert
            Cache::forget('stripe.failed_payments.count');
        }
    }
    
    /**
     * Alert for high-value payments.
     */
    protected function alertHighValuePayment($paymentIntent)
    {
        Log::channel('stripe')->notice('High-value payment detected', [
            'payment_intent_id' => $paymentIntent->id,
            'amount' => $paymentIntent->amount / 100,
            'currency' => $paymentIntent->currency,
            'user_id' => auth()->id(),
        ]);
    }
    
    /**
     * Increment failed payment attempts counter.
     */
    protected function incrementFailedAttempts()
    {
        $count = Cache::increment('stripe.failed_payments.count');
        
        // Set expiry if this is the first failure
        if ($count === 1) {
            Cache::put('stripe.failed_payments.count', 1, now()->addHour());
        }
        
        // Check if we need to send alert
        $this->alertFailedPayments();
    }
    
    /**
     * Track webhook failures for monitoring.
     */
    protected function incrementWebhookFailures()
    {
        $count = Cache::increment('stripe.webhook_failures.count');
        $threshold = config('stripe.alerts.webhook_failure_threshold');
        
        if ($count >= $threshold) {
            Log::channel('stripe')->critical('Webhook failure threshold exceeded', [
                'consecutive_failures' => $count,
                'threshold' => $threshold,
            ]);
            
            // In production, this would trigger an alert
            if (app()->environment('production')) {
                Mail::raw(
                    "CRITICAL: {$count} consecutive webhook failures detected",
                    function ($message) {
                        $message->to(config('stripe.alerts.admin_email'))
                               ->subject('[Dixis] Webhook Processing Alert');
                    }
                );
            }
        }
    }
    
    /**
     * Reset webhook failure counter on success.
     */
    protected function resetWebhookFailures()
    {
        Cache::forget('stripe.webhook_failures.count');
    }
    
    /**
     * Generate daily payment report.
     */
    public function generateDailyReport(Carbon $date = null)
    {
        $date = $date ?? now();
        $startOfDay = $date->copy()->startOfDay();
        $endOfDay = $date->copy()->endOfDay();
        
        $report = [
            'date' => $date->toDateString(),
            'total_transactions' => Payment::whereBetween('created_at', [$startOfDay, $endOfDay])->count(),
            'successful_transactions' => Payment::whereBetween('created_at', [$startOfDay, $endOfDay])
                ->where('status', 'succeeded')->count(),
            'failed_transactions' => Payment::whereBetween('created_at', [$startOfDay, $endOfDay])
                ->where('status', 'failed')->count(),
            'total_revenue' => Payment::whereBetween('created_at', [$startOfDay, $endOfDay])
                ->where('status', 'succeeded')->sum('amount'),
            'average_transaction_value' => Payment::whereBetween('created_at', [$startOfDay, $endOfDay])
                ->where('status', 'succeeded')->avg('amount'),
            'payment_methods' => Payment::whereBetween('created_at', [$startOfDay, $endOfDay])
                ->where('status', 'succeeded')
                ->selectRaw('payment_gateway, COUNT(*) as count, SUM(amount) as total')
                ->groupBy('payment_gateway')
                ->get(),
        ];
        
        Log::channel('stripe')->info('Daily payment report generated', $report);
        
        return $report;
    }
}