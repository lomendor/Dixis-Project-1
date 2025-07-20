<?php

namespace App\Console\Commands;

use App\Services\PaymentMonitoringService;
use Illuminate\Console\Command;
use Carbon\Carbon;

class GenerateStripeReport extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'stripe:report 
                            {--date= : The date to generate report for (Y-m-d format)}
                            {--month= : The month to generate report for (Y-m format)}
                            {--email= : Email address to send the report to}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate Stripe payment report for a specific date or month';

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
        $date = null;
        
        if ($this->option('date')) {
            $date = Carbon::parse($this->option('date'));
            $this->info("Generating daily report for: {$date->toDateString()}");
            
            $report = $this->monitoringService->generateDailyReport($date);
            
        } elseif ($this->option('month')) {
            $date = Carbon::parse($this->option('month') . '-01');
            $this->info("Generating monthly report for: {$date->format('F Y')}");
            
            // Generate report for each day of the month
            $monthlyData = [];
            $daysInMonth = $date->daysInMonth;
            
            for ($day = 1; $day <= $daysInMonth; $day++) {
                $dayDate = $date->copy()->day($day);
                $monthlyData[$dayDate->toDateString()] = $this->monitoringService->generateDailyReport($dayDate);
            }
            
            $report = $this->aggregateMonthlyData($monthlyData);
            
        } else {
            $date = now();
            $this->info("Generating daily report for today: {$date->toDateString()}");
            
            $report = $this->monitoringService->generateDailyReport($date);
        }
        
        $this->displayReport($report);
        
        if ($email = $this->option('email')) {
            $this->sendReportByEmail($report, $email);
        }
        
        return Command::SUCCESS;
    }
    
    /**
     * Display the report in console
     */
    protected function displayReport(array $report)
    {
        $this->newLine();
        $this->line('=== STRIPE PAYMENT REPORT ===');
        $this->line('Date: ' . ($report['date'] ?? 'N/A'));
        $this->newLine();
        
        $this->table(
            ['Metric', 'Value'],
            [
                ['Total Transactions', $report['total_transactions']],
                ['Successful Transactions', $report['successful_transactions']],
                ['Failed Transactions', $report['failed_transactions']],
                ['Total Revenue', '€' . number_format($report['total_revenue'] / 100, 2)],
                ['Average Transaction Value', '€' . number_format($report['average_transaction_value'] / 100, 2)],
            ]
        );
        
        if (!empty($report['payment_methods'])) {
            $this->newLine();
            $this->line('Payment Methods Breakdown:');
            
            $methodsData = [];
            foreach ($report['payment_methods'] as $method) {
                $methodsData[] = [
                    $method['payment_gateway'],
                    $method['count'],
                    '€' . number_format($method['total'] / 100, 2)
                ];
            }
            
            $this->table(['Method', 'Count', 'Total'], $methodsData);
        }
    }
    
    /**
     * Aggregate daily data into monthly summary
     */
    protected function aggregateMonthlyData(array $dailyReports): array
    {
        $totalTransactions = 0;
        $successfulTransactions = 0;
        $failedTransactions = 0;
        $totalRevenue = 0;
        $paymentMethods = [];
        
        foreach ($dailyReports as $date => $report) {
            $totalTransactions += $report['total_transactions'];
            $successfulTransactions += $report['successful_transactions'];
            $failedTransactions += $report['failed_transactions'];
            $totalRevenue += $report['total_revenue'];
            
            foreach ($report['payment_methods'] as $method) {
                $key = $method['payment_gateway'];
                if (!isset($paymentMethods[$key])) {
                    $paymentMethods[$key] = [
                        'payment_gateway' => $key,
                        'count' => 0,
                        'total' => 0
                    ];
                }
                $paymentMethods[$key]['count'] += $method['count'];
                $paymentMethods[$key]['total'] += $method['total'];
            }
        }
        
        return [
            'date' => 'Monthly Summary',
            'total_transactions' => $totalTransactions,
            'successful_transactions' => $successfulTransactions,
            'failed_transactions' => $failedTransactions,
            'total_revenue' => $totalRevenue,
            'average_transaction_value' => $successfulTransactions > 0 
                ? $totalRevenue / $successfulTransactions 
                : 0,
            'payment_methods' => array_values($paymentMethods),
        ];
    }
    
    /**
     * Send report by email
     */
    protected function sendReportByEmail(array $report, string $email)
    {
        $this->info("Sending report to: {$email}");
        
        // In production, implement email sending
        // For now, just log
        $this->warn("Email sending not implemented in development mode");
    }
}