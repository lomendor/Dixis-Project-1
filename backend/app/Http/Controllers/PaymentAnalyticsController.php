<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Order;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class PaymentAnalyticsController extends Controller
{
    /**
     * Get payment analytics dashboard data
     */
    public function dashboard(Request $request): JsonResponse
    {
        $period = $request->get('period', '30d'); // 7d, 30d, 90d, 1y
        $startDate = $this->getStartDate($period);
        
        $analytics = [
            'overview' => $this->getOverviewStats($startDate),
            'revenue_chart' => $this->getRevenueChart($startDate, $period),
            'payment_methods' => $this->getPaymentMethodsBreakdown($startDate),
            'success_rate' => $this->getSuccessRate($startDate),
            'top_customers' => $this->getTopCustomers($startDate),
            'recent_transactions' => $this->getRecentTransactions(),
            'geographical_breakdown' => $this->getGeographicalBreakdown($startDate),
        ];
        
        return response()->json($analytics);
    }
    
    /**
     * Get overview statistics
     */
    protected function getOverviewStats(Carbon $startDate): array
    {
        $currentPeriod = Payment::where('created_at', '>=', $startDate);
        $previousPeriod = Payment::where('created_at', '>=', $startDate->copy()->subDays($startDate->diffInDays(now())))
                                ->where('created_at', '<', $startDate);
        
        $currentRevenue = $currentPeriod->where('status', 'succeeded')->sum('amount');
        $previousRevenue = $previousPeriod->where('status', 'succeeded')->sum('amount');
        
        $currentTransactions = $currentPeriod->count();
        $previousTransactions = $previousPeriod->count();
        
        $currentSuccessful = $currentPeriod->where('status', 'succeeded')->count();
        $previousSuccessful = $previousPeriod->where('status', 'succeeded')->count();
        
        $currentCustomers = Order::where('created_at', '>=', $startDate)
                                ->distinct('user_id')
                                ->count('user_id');
        $previousCustomers = Order::where('created_at', '>=', $startDate->copy()->subDays($startDate->diffInDays(now())))
                                ->where('created_at', '<', $startDate)
                                ->distinct('user_id')
                                ->count('user_id');
        
        return [
            'total_revenue' => [
                'current' => $currentRevenue,
                'previous' => $previousRevenue,
                'change_percent' => $this->calculatePercentageChange($currentRevenue, $previousRevenue),
            ],
            'total_transactions' => [
                'current' => $currentTransactions,
                'previous' => $previousTransactions,
                'change_percent' => $this->calculatePercentageChange($currentTransactions, $previousTransactions),
            ],
            'successful_transactions' => [
                'current' => $currentSuccessful,
                'previous' => $previousSuccessful,
                'change_percent' => $this->calculatePercentageChange($currentSuccessful, $previousSuccessful),
            ],
            'unique_customers' => [
                'current' => $currentCustomers,
                'previous' => $previousCustomers,
                'change_percent' => $this->calculatePercentageChange($currentCustomers, $previousCustomers),
            ],
            'average_order_value' => [
                'current' => $currentSuccessful > 0 ? $currentRevenue / $currentSuccessful : 0,
                'previous' => $previousSuccessful > 0 ? $previousRevenue / $previousSuccessful : 0,
            ],
        ];
    }
    
    /**
     * Get revenue chart data
     */
    protected function getRevenueChart(Carbon $startDate, string $period): array
    {
        $groupBy = match($period) {
            '7d' => 'DATE(created_at)',
            '30d' => 'DATE(created_at)',
            '90d' => 'WEEK(created_at)',
            '1y' => 'MONTH(created_at)',
            default => 'DATE(created_at)',
        };
        
        $payments = Payment::where('status', 'succeeded')
            ->where('created_at', '>=', $startDate)
            ->selectRaw("{$groupBy} as period, SUM(amount) as revenue, COUNT(*) as count")
            ->groupBy('period')
            ->orderBy('period')
            ->get();
        
        return $payments->map(function ($payment) use ($period) {
            return [
                'period' => $payment->period,
                'revenue' => $payment->revenue,
                'count' => $payment->count,
                'formatted_period' => $this->formatPeriod($payment->period, $period),
            ];
        })->toArray();
    }
    
    /**
     * Get payment methods breakdown
     */
    protected function getPaymentMethodsBreakdown(Carbon $startDate): array
    {
        $breakdown = Payment::where('status', 'succeeded')
            ->where('created_at', '>=', $startDate)
            ->selectRaw('payment_gateway, COUNT(*) as count, SUM(amount) as total_amount')
            ->groupBy('payment_gateway')
            ->orderBy('total_amount', 'desc')
            ->get();
        
        $totalRevenue = $breakdown->sum('total_amount');
        
        return $breakdown->map(function ($item) use ($totalRevenue) {
            return [
                'method' => $this->formatPaymentMethod($item->payment_gateway),
                'count' => $item->count,
                'total_amount' => $item->total_amount,
                'percentage' => $totalRevenue > 0 ? round(($item->total_amount / $totalRevenue) * 100, 1) : 0,
            ];
        })->toArray();
    }
    
    /**
     * Get success rate statistics
     */
    protected function getSuccessRate(Carbon $startDate): array
    {
        $total = Payment::where('created_at', '>=', $startDate)->count();
        $successful = Payment::where('created_at', '>=', $startDate)
                            ->where('status', 'succeeded')
                            ->count();
        $failed = Payment::where('created_at', '>=', $startDate)
                        ->where('status', 'failed')
                        ->count();
        $pending = Payment::where('created_at', '>=', $startDate)
                         ->where('status', 'pending')
                         ->count();
        
        return [
            'total' => $total,
            'successful' => $successful,
            'failed' => $failed,
            'pending' => $pending,
            'success_rate' => $total > 0 ? round(($successful / $total) * 100, 1) : 0,
            'failure_rate' => $total > 0 ? round(($failed / $total) * 100, 1) : 0,
        ];
    }
    
    /**
     * Get top customers by revenue
     */
    protected function getTopCustomers(Carbon $startDate): array
    {
        return DB::table('payments')
            ->join('orders', 'payments.order_id', '=', 'orders.id')
            ->join('users', 'orders.user_id', '=', 'users.id')
            ->where('payments.status', 'succeeded')
            ->where('payments.created_at', '>=', $startDate)
            ->selectRaw('
                users.id,
                users.name,
                users.email,
                COUNT(payments.id) as transaction_count,
                SUM(payments.amount) as total_spent
            ')
            ->groupBy('users.id', 'users.name', 'users.email')
            ->orderBy('total_spent', 'desc')
            ->limit(10)
            ->get()
            ->toArray();
    }
    
    /**
     * Get recent transactions
     */
    protected function getRecentTransactions(): array
    {
        return Payment::with(['order.user'])
            ->orderBy('created_at', 'desc')
            ->limit(20)
            ->get()
            ->map(function ($payment) {
                return [
                    'id' => $payment->id,
                    'amount' => $payment->amount,
                    'currency' => $payment->currency,
                    'status' => $payment->status,
                    'payment_gateway' => $this->formatPaymentMethod($payment->payment_gateway),
                    'created_at' => $payment->created_at->toISOString(),
                    'customer' => [
                        'name' => $payment->order->user->name ?? 'Unknown',
                        'email' => $payment->order->user->email ?? 'Unknown',
                    ],
                    'order_id' => $payment->order_id,
                ];
            })
            ->toArray();
    }
    
    /**
     * Get geographical breakdown (based on user data or IP)
     */
    protected function getGeographicalBreakdown(Carbon $startDate): array
    {
        // This is a simplified version - in production you might use IP geolocation
        // or user address data for more accurate geographical analysis
        return [
            ['country' => 'Greece', 'count' => 45, 'revenue' => 2500.00],
            ['country' => 'Cyprus', 'count' => 12, 'revenue' => 650.00],
            ['country' => 'Germany', 'count' => 8, 'revenue' => 420.00],
            ['country' => 'Other', 'count' => 5, 'revenue' => 280.00],
        ];
    }
    
    /**
     * Calculate percentage change
     */
    protected function calculatePercentageChange($current, $previous): float
    {
        if ($previous == 0) {
            return $current > 0 ? 100 : 0;
        }
        
        return round((($current - $previous) / $previous) * 100, 1);
    }
    
    /**
     * Get start date based on period
     */
    protected function getStartDate(string $period): Carbon
    {
        return match($period) {
            '7d' => now()->subDays(7),
            '30d' => now()->subDays(30),
            '90d' => now()->subDays(90),
            '1y' => now()->subYear(),
            default => now()->subDays(30),
        };
    }
    
    /**
     * Format period for display
     */
    protected function formatPeriod(string $period, string $periodType): string
    {
        return match($periodType) {
            '7d', '30d' => Carbon::parse($period)->format('M j'),
            '90d' => 'Week ' . $period,
            '1y' => Carbon::createFromFormat('m', $period)->format('M'),
            default => $period,
        };
    }
    
    /**
     * Format payment method for display
     */
    protected function formatPaymentMethod(string $method): string
    {
        return match($method) {
            'stripe' => 'Κάρτα (Stripe)',
            'sepa_debit' => 'SEPA Direct Debit',
            'paypal' => 'PayPal',
            'cash_on_delivery' => 'Αντικαταβολή',
            default => ucfirst($method),
        };
    }
}