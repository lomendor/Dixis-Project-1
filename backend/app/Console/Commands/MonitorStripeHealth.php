<?php

namespace App\Console\Commands;

use App\Services\PaymentMonitoringService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;

class MonitorStripeHealth extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'stripe:monitor 
                            {--check-failed-payments : Check for failed payment threshold}
                            {--test-webhook : Test webhook connectivity}
                            {--alert : Send alerts if issues found}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Monitor Stripe integration health and alert on issues';

    protected PaymentMonitoringService $monitoringService;

    /**
     * Create a new command instance.
     */
    public function __construct(PaymentMonitoringService $monitoringService)
    {
        parent::__construct();
        $this->monitoringService = $monitoringService;
    }

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🔍 Monitoring Stripe Integration Health...');
        $this->newLine();
        
        $issues = [];
        
        // Check Stripe API connectivity
        $this->line('Checking Stripe API connectivity...');
        $healthCheck = $this->checkStripeHealth();
        
        if ($healthCheck['status'] === 'healthy') {
            $this->info('✅ Stripe API: Healthy');
        } else {
            $this->error('❌ Stripe API: ' . $healthCheck['error']);
            $issues[] = 'Stripe API connection failed';
        }
        
        // Check failed payments
        if ($this->option('check-failed-payments')) {
            $this->line('Checking failed payment rates...');
            $this->monitoringService->alertFailedPayments();
            $this->info('✅ Failed payment check completed');
        }
        
        // Test webhook connectivity
        if ($this->option('test-webhook')) {
            $this->line('Testing webhook endpoint...');
            $webhookTest = $this->testWebhookEndpoint();
            
            if ($webhookTest) {
                $this->info('✅ Webhook endpoint: Accessible');
            } else {
                $this->error('❌ Webhook endpoint: Not accessible');
                $issues[] = 'Webhook endpoint not accessible';
            }
        }
        
        // Check database connectivity
        $this->line('Checking database health...');
        try {
            \DB::connection()->getPdo();
            $this->info('✅ Database: Connected');
        } catch (\Exception $e) {
            $this->error('❌ Database: Connection failed');
            $issues[] = 'Database connection failed';
        }
        
        // Check cache connectivity
        $this->line('Checking cache health...');
        try {
            \Cache::put('stripe_monitor_test', true, 10);
            if (\Cache::get('stripe_monitor_test') === true) {
                $this->info('✅ Cache: Working');
                \Cache::forget('stripe_monitor_test');
            } else {
                throw new \Exception('Cache read/write failed');
            }
        } catch (\Exception $e) {
            $this->error('❌ Cache: Not working properly');
            $issues[] = 'Cache system not working';
        }
        
        // Summary
        $this->newLine();
        if (empty($issues)) {
            $this->info('🎉 All systems operational!');
            return Command::SUCCESS;
        } else {
            $this->error('⚠️  Issues detected:');
            foreach ($issues as $issue) {
                $this->line("  - {$issue}");
            }
            
            if ($this->option('alert')) {
                $this->sendAlerts($issues);
            }
            
            return Command::FAILURE;
        }
    }
    
    /**
     * Check Stripe API health
     */
    protected function checkStripeHealth(): array
    {
        try {
            $response = Http::get(url('/api/v1/health/stripe'));
            
            if ($response->successful()) {
                return $response->json();
            }
            
            return [
                'status' => 'unhealthy',
                'error' => 'Health check endpoint returned error'
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'unhealthy',
                'error' => $e->getMessage()
            ];
        }
    }
    
    /**
     * Test webhook endpoint accessibility
     */
    protected function testWebhookEndpoint(): bool
    {
        try {
            $webhookUrl = url('/api/v1/stripe/webhook');
            $response = Http::post($webhookUrl, [
                'test' => true
            ]);
            
            // We expect 400 (invalid signature) which means endpoint is accessible
            return $response->status() === 400;
        } catch (\Exception $e) {
            return false;
        }
    }
    
    /**
     * Send alerts for detected issues
     */
    protected function sendAlerts(array $issues)
    {
        $this->info('Sending alerts...');
        
        $message = "Stripe monitoring detected the following issues:\n\n";
        foreach ($issues as $issue) {
            $message .= "- {$issue}\n";
        }
        $message .= "\nPlease investigate immediately.";
        
        // In production, send actual alerts
        if (app()->environment('production')) {
            \Mail::raw($message, function ($mail) {
                $mail->to(config('stripe.alerts.admin_email'))
                     ->subject('[Dixis] Stripe Monitoring Alert');
            });
        }
        
        $this->warn('Alert notifications sent to administrators');
    }
}