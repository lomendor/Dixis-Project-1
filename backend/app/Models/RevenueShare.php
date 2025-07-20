<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RevenueShare extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'order_id',
        'transaction_type',
        'gross_amount',
        'commission_rate',
        'commission_amount',
        'net_amount',
        'platform_fee',
        'payment_processor_fee',
        'status',
        'processed_at',
        'payout_date',
        'payout_reference',
        'notes'
    ];

    protected $casts = [
        'gross_amount' => 'decimal:2',
        'commission_rate' => 'decimal:2',
        'commission_amount' => 'decimal:2',
        'net_amount' => 'decimal:2',
        'platform_fee' => 'decimal:2',
        'payment_processor_fee' => 'decimal:2',
        'processed_at' => 'datetime',
        'payout_date' => 'datetime',
    ];

    // Transaction types
    const TYPE_ORDER = 'order';
    const TYPE_SUBSCRIPTION = 'subscription';
    const TYPE_SETUP_FEE = 'setup_fee';
    const TYPE_REFUND = 'refund';
    const TYPE_CHARGEBACK = 'chargeback';

    // Status types
    const STATUS_PENDING = 'pending';
    const STATUS_CALCULATED = 'calculated';
    const STATUS_APPROVED = 'approved';
    const STATUS_PAID = 'paid';
    const STATUS_DISPUTED = 'disputed';
    const STATUS_CANCELLED = 'cancelled';

    /**
     * Get the tenant that owns this revenue share
     */
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    /**
     * Get the order associated with this revenue share
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Scope for pending revenue shares
     */
    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    /**
     * Scope for approved revenue shares
     */
    public function scopeApproved($query)
    {
        return $query->where('status', self::STATUS_APPROVED);
    }

    /**
     * Scope for paid revenue shares
     */
    public function scopePaid($query)
    {
        return $query->where('status', self::STATUS_PAID);
    }

    /**
     * Scope for specific transaction type
     */
    public function scopeOfType($query, string $type)
    {
        return $query->where('transaction_type', $type);
    }

    /**
     * Scope for date range
     */
    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('created_at', [$startDate, $endDate]);
    }

    /**
     * Calculate commission for an order
     */
    public static function calculateForOrder(Order $order): array
    {
        $tenant = $order->tenant;
        $grossAmount = $order->total_amount;
        $commissionRate = $tenant->getCommissionRate();
        
        // Calculate fees
        $commissionAmount = $grossAmount * ($commissionRate / 100);
        $platformFee = $grossAmount * 0.02; // 2% platform fee
        $paymentProcessorFee = $grossAmount * 0.029 + 0.30; // Stripe-like fees
        
        $netAmount = $grossAmount - $commissionAmount - $platformFee - $paymentProcessorFee;
        
        return [
            'gross_amount' => $grossAmount,
            'commission_rate' => $commissionRate,
            'commission_amount' => $commissionAmount,
            'platform_fee' => $platformFee,
            'payment_processor_fee' => $paymentProcessorFee,
            'net_amount' => $netAmount
        ];
    }

    /**
     * Create revenue share record for an order
     */
    public static function createForOrder(Order $order): self
    {
        $calculation = self::calculateForOrder($order);
        
        return self::create([
            'tenant_id' => $order->tenant_id,
            'order_id' => $order->id,
            'transaction_type' => self::TYPE_ORDER,
            'gross_amount' => $calculation['gross_amount'],
            'commission_rate' => $calculation['commission_rate'],
            'commission_amount' => $calculation['commission_amount'],
            'platform_fee' => $calculation['platform_fee'],
            'payment_processor_fee' => $calculation['payment_processor_fee'],
            'net_amount' => $calculation['net_amount'],
            'status' => self::STATUS_PENDING,
            'processed_at' => now()
        ]);
    }

    /**
     * Create revenue share for subscription fee
     */
    public static function createForSubscription(Tenant $tenant, float $amount): self
    {
        return self::create([
            'tenant_id' => $tenant->id,
            'order_id' => null,
            'transaction_type' => self::TYPE_SUBSCRIPTION,
            'gross_amount' => $amount,
            'commission_rate' => 0,
            'commission_amount' => $amount, // Full subscription fee goes to platform
            'platform_fee' => 0,
            'payment_processor_fee' => $amount * 0.029 + 0.30,
            'net_amount' => 0,
            'status' => self::STATUS_PENDING,
            'processed_at' => now()
        ]);
    }

    /**
     * Process refund for revenue share
     */
    public function processRefund(float $refundAmount): self
    {
        $refundRatio = $refundAmount / $this->gross_amount;
        
        return self::create([
            'tenant_id' => $this->tenant_id,
            'order_id' => $this->order_id,
            'transaction_type' => self::TYPE_REFUND,
            'gross_amount' => -$refundAmount,
            'commission_rate' => $this->commission_rate,
            'commission_amount' => -($this->commission_amount * $refundRatio),
            'platform_fee' => -($this->platform_fee * $refundRatio),
            'payment_processor_fee' => -($this->payment_processor_fee * $refundRatio),
            'net_amount' => -($this->net_amount * $refundRatio),
            'status' => self::STATUS_PENDING,
            'processed_at' => now(),
            'notes' => "Refund for revenue share #{$this->id}"
        ]);
    }

    /**
     * Approve revenue share for payout
     */
    public function approve(): void
    {
        $this->update([
            'status' => self::STATUS_APPROVED,
            'processed_at' => now()
        ]);
    }

    /**
     * Mark as paid
     */
    public function markAsPaid(string $payoutReference = null): void
    {
        $this->update([
            'status' => self::STATUS_PAID,
            'payout_date' => now(),
            'payout_reference' => $payoutReference
        ]);
    }

    /**
     * Get revenue share summary for tenant
     */
    public static function getSummaryForTenant(Tenant $tenant, $startDate = null, $endDate = null): array
    {
        $query = self::where('tenant_id', $tenant->id);
        
        if ($startDate && $endDate) {
            $query->whereBetween('created_at', [$startDate, $endDate]);
        }
        
        $summary = $query->selectRaw('
            transaction_type,
            status,
            COUNT(*) as count,
            SUM(gross_amount) as total_gross,
            SUM(commission_amount) as total_commission,
            SUM(platform_fee) as total_platform_fee,
            SUM(payment_processor_fee) as total_processor_fee,
            SUM(net_amount) as total_net
        ')
        ->groupBy('transaction_type', 'status')
        ->get();
        
        $result = [
            'total_transactions' => $summary->sum('count'),
            'total_gross_revenue' => $summary->sum('total_gross'),
            'total_commission_owed' => $summary->sum('total_commission'),
            'total_platform_fees' => $summary->sum('total_platform_fee'),
            'total_processor_fees' => $summary->sum('total_processor_fee'),
            'total_net_payout' => $summary->sum('total_net'),
            'by_type' => [],
            'by_status' => []
        ];
        
        foreach ($summary as $item) {
            $result['by_type'][$item->transaction_type] = [
                'count' => $item->count,
                'gross' => $item->total_gross,
                'commission' => $item->total_commission,
                'net' => $item->total_net
            ];
            
            $result['by_status'][$item->status] = [
                'count' => $item->count,
                'gross' => $item->total_gross,
                'commission' => $item->total_commission,
                'net' => $item->total_net
            ];
        }
        
        return $result;
    }

    /**
     * Get pending payouts for all tenants
     */
    public static function getPendingPayouts(): array
    {
        $payouts = self::where('status', self::STATUS_APPROVED)
            ->selectRaw('
                tenant_id,
                COUNT(*) as transaction_count,
                SUM(net_amount) as total_payout
            ')
            ->groupBy('tenant_id')
            ->having('total_payout', '>', 0)
            ->with('tenant')
            ->get();
        
        return $payouts->map(function ($payout) {
            return [
                'tenant_id' => $payout->tenant_id,
                'tenant_name' => $payout->tenant->name,
                'transaction_count' => $payout->transaction_count,
                'total_payout' => $payout->total_payout,
                'tenant_plan' => $payout->tenant->plan
            ];
        })->toArray();
    }

    /**
     * Process batch payout
     */
    public static function processBatchPayout(array $tenantIds, string $payoutReference): int
    {
        $processed = 0;
        
        foreach ($tenantIds as $tenantId) {
            $revenueShares = self::where('tenant_id', $tenantId)
                ->where('status', self::STATUS_APPROVED)
                ->get();
            
            foreach ($revenueShares as $revenueShare) {
                $revenueShare->markAsPaid($payoutReference);
                $processed++;
            }
        }
        
        return $processed;
    }

    /**
     * Get monthly revenue report
     */
    public static function getMonthlyReport(int $year, int $month): array
    {
        $startDate = \Carbon\Carbon::create($year, $month, 1)->startOfMonth();
        $endDate = $startDate->copy()->endOfMonth();
        
        $data = self::whereBetween('created_at', [$startDate, $endDate])
            ->selectRaw('
                DATE(created_at) as date,
                transaction_type,
                COUNT(*) as count,
                SUM(gross_amount) as gross,
                SUM(commission_amount) as commission,
                SUM(net_amount) as net
            ')
            ->groupBy('date', 'transaction_type')
            ->orderBy('date')
            ->get();
        
        return $data->groupBy('date')->map(function ($dayData) {
            return $dayData->groupBy('transaction_type');
        })->toArray();
    }
}
