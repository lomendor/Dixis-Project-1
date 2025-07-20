<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Stripe\Stripe;
use Stripe\Account;

class HealthCheckController extends Controller
{
    /**
     * General health check endpoint.
     */
    public function index(): JsonResponse
    {
        $checks = [];
        
        // Database check
        $checks['database'] = $this->checkDatabase();
        
        // Cache check
        $checks['cache'] = $this->checkCache();
        
        // Stripe connection check
        $checks['stripe'] = $this->checkStripe();
        
        // Disk space check
        $checks['disk'] = $this->checkDiskSpace();
        
        // Calculate overall status
        $overallStatus = collect($checks)->every(fn($check) => $check['status'] === 'healthy') 
            ? 'healthy' 
            : 'unhealthy';
        
        $statusCode = $overallStatus === 'healthy' ? 200 : 503;
        
        return response()->json([
            'status' => $overallStatus,
            'timestamp' => now()->toIso8601String(),
            'checks' => $checks,
            'app_version' => config('app.version', '1.0.0'),
            'environment' => app()->environment(),
        ], $statusCode);
    }
    
    /**
     * Stripe-specific health check.
     */
    public function stripe(): JsonResponse
    {
        try {
            Stripe::setApiKey(config('stripe.secret'));
            $account = Account::retrieve();
            
            $webhookHealthy = $this->checkWebhookHealth();
            $paymentHealthy = $this->checkPaymentProcessingHealth();
            
            return response()->json([
                'status' => 'healthy',
                'stripe_account_id' => $account->id,
                'stripe_account_country' => $account->country,
                'charges_enabled' => $account->charges_enabled,
                'payouts_enabled' => $account->payouts_enabled,
                'webhook_health' => $webhookHealthy,
                'payment_processing_health' => $paymentHealthy,
                'timestamp' => now()->toIso8601String(),
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'unhealthy',
                'error' => 'Failed to connect to Stripe',
                'message' => config('app.debug') ? $e->getMessage() : null,
                'timestamp' => now()->toIso8601String(),
            ], 503);
        }
    }
    
    /**
     * Check database connectivity.
     */
    protected function checkDatabase(): array
    {
        try {
            DB::connection()->getPdo();
            
            // Check if we can query
            $result = DB::select('SELECT 1');
            
            return [
                'status' => 'healthy',
                'response_time_ms' => round(microtime(true) * 1000 - LARAVEL_START * 1000),
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'unhealthy',
                'error' => 'Database connection failed',
                'message' => config('app.debug') ? $e->getMessage() : null,
            ];
        }
    }
    
    /**
     * Check cache connectivity.
     */
    protected function checkCache(): array
    {
        try {
            $key = 'health_check_' . time();
            Cache::put($key, true, 10);
            $value = Cache::get($key);
            Cache::forget($key);
            
            if ($value === true) {
                return [
                    'status' => 'healthy',
                    'driver' => config('cache.default'),
                ];
            }
            
            return [
                'status' => 'unhealthy',
                'error' => 'Cache write/read failed',
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'unhealthy',
                'error' => 'Cache connection failed',
                'message' => config('app.debug') ? $e->getMessage() : null,
            ];
        }
    }
    
    /**
     * Check Stripe connectivity.
     */
    protected function checkStripe(): array
    {
        try {
            if (!config('stripe.secret')) {
                return [
                    'status' => 'unhealthy',
                    'error' => 'Stripe API key not configured',
                ];
            }
            
            Stripe::setApiKey(config('stripe.secret'));
            Account::retrieve();
            
            return [
                'status' => 'healthy',
                'mode' => str_contains(config('stripe.secret'), '_test_') ? 'test' : 'live',
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'unhealthy',
                'error' => 'Stripe connection failed',
                'message' => config('app.debug') ? $e->getMessage() : null,
            ];
        }
    }
    
    /**
     * Check disk space.
     */
    protected function checkDiskSpace(): array
    {
        try {
            $freeSpace = disk_free_space('/');
            $totalSpace = disk_total_space('/');
            $usedPercentage = round((($totalSpace - $freeSpace) / $totalSpace) * 100, 2);
            
            $status = $usedPercentage < 90 ? 'healthy' : 'unhealthy';
            
            return [
                'status' => $status,
                'used_percentage' => $usedPercentage,
                'free_gb' => round($freeSpace / 1024 / 1024 / 1024, 2),
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'unknown',
                'error' => 'Could not check disk space',
            ];
        }
    }
    
    /**
     * Check webhook processing health.
     */
    protected function checkWebhookHealth(): array
    {
        $failureCount = Cache::get('stripe.webhook_failures.count', 0);
        $lastSuccess = Cache::get('stripe.webhook_last_success');
        
        $status = 'healthy';
        if ($failureCount >= config('stripe.alerts.webhook_failure_threshold')) {
            $status = 'unhealthy';
        } elseif ($lastSuccess && now()->diffInHours($lastSuccess) > 24) {
            $status = 'warning';
        }
        
        return [
            'status' => $status,
            'consecutive_failures' => $failureCount,
            'last_success' => $lastSuccess ? $lastSuccess->toIso8601String() : null,
        ];
    }
    
    /**
     * Check payment processing health.
     */
    protected function checkPaymentProcessingHealth(): array
    {
        $recentFailures = Cache::get('stripe.failed_payments.count', 0);
        $threshold = config('stripe.alerts.failed_payment_threshold');
        
        return [
            'status' => $recentFailures < $threshold ? 'healthy' : 'warning',
            'recent_failures' => $recentFailures,
            'failure_threshold' => $threshold,
        ];
    }
}