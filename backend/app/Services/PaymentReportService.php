<?php

namespace App\Services;

use App\Models\Payment;
use App\Models\Order;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

class PaymentReportService
{
    /**
     * Generate monthly payment report
     */
    public function generateMonthlyReport(int $month, int $year): array
    {
        $startDate = Carbon::create($year, $month, 1)->startOfMonth();
        $endDate = $startDate->copy()->endOfMonth();
        
        $payments = Payment::with(['order.user'])
            ->where('status', 'succeeded')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->orderBy('created_at')
            ->get();
        
        $reportData = $payments->map(function ($payment) {
            return [
                'Ημερομηνία' => $payment->created_at->format('d/m/Y H:i'),
                'ID Παραγγελίας' => $payment->order_id,
                'ID Πληρωμής' => $payment->id,
                'Stripe Payment Intent' => $payment->stripe_payment_intent_id,
                'Πελάτης' => $payment->order->user->name ?? 'Άγνωστος',
                'Email Πελάτη' => $payment->order->user->email ?? 'Άγνωστο',
                'Ποσό' => number_format($payment->amount, 2),
                'Νόμισμα' => $payment->currency,
                'Τρόπος Πληρωμής' => $this->formatPaymentGateway($payment->payment_gateway),
                'Κατάσταση' => $this->formatStatus($payment->status),
                'Κόστος Αποστολής' => number_format($payment->order->shipping_cost ?? 0, 2),
                'ΦΠΑ' => number_format($payment->order->tax_amount ?? 0, 2),
            ];
        })->toArray();
        
        $summary = $this->calculateMonthlySummary($payments);
        
        return [
            'report_data' => $reportData,
            'summary' => $summary,
            'period' => [
                'month' => $month,
                'year' => $year,
                'month_name' => $startDate->format('F'),
                'start_date' => $startDate->format('d/m/Y'),
                'end_date' => $endDate->format('d/m/Y'),
            ],
        ];
    }
    
    /**
     * Generate custom period report
     */
    public function generateCustomReport(Carbon $startDate, Carbon $endDate): array
    {
        $payments = Payment::with(['order.user'])
            ->where('status', 'succeeded')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->orderBy('created_at')
            ->get();
        
        $reportData = $payments->map(function ($payment) {
            return [
                'Ημερομηνία' => $payment->created_at->format('d/m/Y H:i'),
                'ID Παραγγελίας' => $payment->order_id,
                'ID Πληρωμής' => $payment->id,
                'Stripe Payment Intent' => $payment->stripe_payment_intent_id,
                'Πελάτης' => $payment->order->user->name ?? 'Άγνωστος',
                'Email Πελάτη' => $payment->order->user->email ?? 'Άγνωστο',
                'Ποσό' => number_format($payment->amount, 2),
                'Νόμισμα' => $payment->currency,
                'Τρόπος Πληρωμής' => $this->formatPaymentGateway($payment->payment_gateway),
                'Κατάσταση' => $this->formatStatus($payment->status),
            ];
        })->toArray();
        
        $summary = $this->calculateCustomSummary($payments, $startDate, $endDate);
        
        return [
            'report_data' => $reportData,
            'summary' => $summary,
            'period' => [
                'start_date' => $startDate->format('d/m/Y'),
                'end_date' => $endDate->format('d/m/Y'),
                'days' => $startDate->diffInDays($endDate) + 1,
            ],
        ];
    }
    
    /**
     * Export report to CSV
     */
    public function exportToCSV(array $reportData, string $filename): string
    {
        if (empty($reportData)) {
            throw new \Exception('Δεν υπάρχουν δεδομένα για εξαγωγή');
        }
        
        $csvContent = '';
        
        // Add BOM for proper UTF-8 encoding in Excel
        $csvContent .= "\xEF\xBB\xBF";
        
        // Add headers
        $headers = array_keys($reportData[0]);
        $csvContent .= implode(',', array_map([$this, 'escapeCsvField'], $headers)) . "\n";
        
        // Add data rows
        foreach ($reportData as $row) {
            $csvContent .= implode(',', array_map([$this, 'escapeCsvField'], array_values($row))) . "\n";
        }
        
        // Store file
        $filePath = "reports/payments/{$filename}";
        Storage::disk('local')->put($filePath, $csvContent);
        
        return $filePath;
    }
    
    /**
     * Export report to Excel (simple CSV with proper formatting)
     */
    public function exportToExcel(array $reportData, array $summary, string $filename): string
    {
        if (empty($reportData)) {
            throw new \Exception('Δεν υπάρχουν δεδομένα για εξαγωγή');
        }
        
        $csvContent = '';
        
        // Add BOM for proper UTF-8 encoding in Excel
        $csvContent .= "\xEF\xBB\xBF";
        
        // Add summary section
        $csvContent .= "ΣΥΝΟΨΗ ΑΝΑΦΟΡΑΣ\n";
        $csvContent .= "================\n";
        foreach ($summary as $key => $value) {
            $csvContent .= $this->escapeCsvField($key) . ',' . $this->escapeCsvField($value) . "\n";
        }
        $csvContent .= "\n\n";
        
        // Add main report
        $csvContent .= "ΑΝΑΛΥΤΙΚΑ ΣΤΟΙΧΕΙΑ\n";
        $csvContent .= "==================\n";
        
        // Add headers
        $headers = array_keys($reportData[0]);
        $csvContent .= implode(',', array_map([$this, 'escapeCsvField'], $headers)) . "\n";
        
        // Add data rows
        foreach ($reportData as $row) {
            $csvContent .= implode(',', array_map([$this, 'escapeCsvField'], array_values($row))) . "\n";
        }
        
        // Store file
        $filePath = "reports/payments/{$filename}";
        Storage::disk('local')->put($filePath, $csvContent);
        
        return $filePath;
    }
    
    /**
     * Generate tax report for accounting
     */
    public function generateTaxReport(int $month, int $year): array
    {
        $startDate = Carbon::create($year, $month, 1)->startOfMonth();
        $endDate = $startDate->copy()->endOfMonth();
        
        $orders = Order::with(['payments', 'user'])
            ->whereHas('payments', function ($query) {
                $query->where('status', 'succeeded');
            })
            ->whereBetween('created_at', [$startDate, $endDate])
            ->get();
        
        $taxData = $orders->map(function ($order) {
            $successfulPayment = $order->payments->where('status', 'succeeded')->first();
            
            return [
                'Ημερομηνία' => $order->created_at->format('d/m/Y'),
                'ΑΦΜ Πελάτη' => '', // Would need to be added to user data
                'Επωνυμία Πελάτη' => $order->user->name ?? 'Άγνωστος',
                'Καθαρή Αξία' => number_format($order->total_amount - $order->tax_amount, 2),
                'ΦΠΑ 24%' => number_format($order->tax_amount, 2),
                'Συνολικό Ποσό' => number_format($order->total_amount, 2),
                'Τρόπος Πληρωμής' => $this->formatPaymentGateway($successfulPayment->payment_gateway ?? ''),
                'Παρατηρήσεις' => $order->notes ?? '',
            ];
        })->toArray();
        
        $taxSummary = [
            'Συνολικές Πωλήσεις' => $orders->sum('total_amount'),
            'Συνολικό ΦΠΑ' => $orders->sum('tax_amount'),
            'Καθαρή Αξία' => $orders->sum('total_amount') - $orders->sum('tax_amount'),
            'Αριθμός Συναλλαγών' => $orders->count(),
        ];
        
        return [
            'tax_data' => $taxData,
            'tax_summary' => $taxSummary,
            'period' => [
                'month' => $month,
                'year' => $year,
                'month_name' => $startDate->format('F'),
            ],
        ];
    }
    
    /**
     * Calculate monthly summary
     */
    protected function calculateMonthlySummary($payments): array
    {
        $totalRevenue = $payments->sum('amount');
        $totalTransactions = $payments->count();
        $paymentMethods = $payments->groupBy('payment_gateway');
        
        $methodBreakdown = [];
        foreach ($paymentMethods as $method => $methodPayments) {
            $methodBreakdown[$this->formatPaymentGateway($method)] = [
                'count' => $methodPayments->count(),
                'amount' => $methodPayments->sum('amount'),
            ];
        }
        
        return [
            'Συνολικά Έσοδα' => '€' . number_format($totalRevenue, 2),
            'Συνολικές Συναλλαγές' => $totalTransactions,
            'Μέσος Όρος ανά Συναλλαγή' => '€' . number_format($totalTransactions > 0 ? $totalRevenue / $totalTransactions : 0, 2),
            'Ανάλυση ανά Μέθοδο' => $methodBreakdown,
        ];
    }
    
    /**
     * Calculate custom period summary
     */
    protected function calculateCustomSummary($payments, Carbon $startDate, Carbon $endDate): array
    {
        $totalRevenue = $payments->sum('amount');
        $totalTransactions = $payments->count();
        $days = $startDate->diffInDays($endDate) + 1;
        
        return [
            'Συνολικά Έσοδα' => '€' . number_format($totalRevenue, 2),
            'Συνολικές Συναλλαγές' => $totalTransactions,
            'Μέσος Όρος ανά Ημέρα' => '€' . number_format($days > 0 ? $totalRevenue / $days : 0, 2),
            'Μέσος Όρος ανά Συναλλαγή' => '€' . number_format($totalTransactions > 0 ? $totalRevenue / $totalTransactions : 0, 2),
            'Περίοδος' => $days . ' ημέρες',
        ];
    }
    
    /**
     * Format payment gateway for display
     */
    protected function formatPaymentGateway(string $gateway): string
    {
        return match($gateway) {
            'stripe' => 'Κάρτα (Stripe)',
            'sepa_debit' => 'SEPA Direct Debit',
            'paypal' => 'PayPal',
            'cash_on_delivery' => 'Αντικαταβολή',
            default => ucfirst($gateway),
        };
    }
    
    /**
     * Format status for display
     */
    protected function formatStatus(string $status): string
    {
        return match($status) {
            'succeeded' => 'Επιτυχής',
            'failed' => 'Αποτυχημένη',
            'pending' => 'Εκκρεμής',
            'canceled' => 'Ακυρωμένη',
            default => ucfirst($status),
        };
    }
    
    /**
     * Escape CSV field
     */
    protected function escapeCsvField($field): string
    {
        // Convert to string and handle null values
        $field = (string) $field;
        
        // If field contains comma, quote, or newline, wrap in quotes and escape quotes
        if (strpos($field, ',') !== false || strpos($field, '"') !== false || strpos($field, "\n") !== false) {
            $field = '"' . str_replace('"', '""', $field) . '"';
        }
        
        return $field;
    }
}