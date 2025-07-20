<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\BelongsToTenant;

class Contract extends Model
{
    use HasFactory, SoftDeletes, BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'business_user_id',
        'contract_number',
        'title',
        'description',
        'type',
        'status',
        'start_date',
        'end_date',
        'auto_renewal',
        'renewal_period',
        'minimum_order_value',
        'maximum_order_value',
        'discount_percentage',
        'payment_terms',
        'delivery_terms',
        'terms_and_conditions',
        'special_conditions',
        'created_by',
        'approved_by',
        'signed_at',
        'activated_at'
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'auto_renewal' => 'boolean',
        'minimum_order_value' => 'decimal:2',
        'maximum_order_value' => 'decimal:2',
        'discount_percentage' => 'decimal:2',
        'signed_at' => 'datetime',
        'activated_at' => 'datetime',
    ];

    // Contract types
    const TYPE_SUPPLY = 'supply';
    const TYPE_DISTRIBUTION = 'distribution';
    const TYPE_EXCLUSIVE = 'exclusive';
    const TYPE_VOLUME = 'volume';
    const TYPE_SEASONAL = 'seasonal';

    // Status types
    const STATUS_DRAFT = 'draft';
    const STATUS_PENDING = 'pending';
    const STATUS_ACTIVE = 'active';
    const STATUS_EXPIRED = 'expired';
    const STATUS_TERMINATED = 'terminated';
    const STATUS_SUSPENDED = 'suspended';

    // Renewal periods
    const RENEWAL_MONTHLY = 'monthly';
    const RENEWAL_QUARTERLY = 'quarterly';
    const RENEWAL_YEARLY = 'yearly';

    /**
     * Get the business user that owns this contract
     */
    public function businessUser(): BelongsTo
    {
        return $this->belongsTo(BusinessUser::class);
    }

    /**
     * Get the user who created this contract
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the user who approved this contract
     */
    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Get the contract products
     */
    public function products(): HasMany
    {
        return $this->hasMany(ContractProduct::class);
    }

    /**
     * Get orders under this contract
     */
    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    /**
     * Scope for active contracts
     */
    public function scopeActive($query)
    {
        return $query->where('status', self::STATUS_ACTIVE)
                    ->where('start_date', '<=', now())
                    ->where(function($q) {
                        $q->whereNull('end_date')
                          ->orWhere('end_date', '>=', now());
                    });
    }

    /**
     * Scope for expiring contracts
     */
    public function scopeExpiring($query, int $days = 30)
    {
        return $query->where('status', self::STATUS_ACTIVE)
                    ->whereBetween('end_date', [now(), now()->addDays($days)]);
    }

    /**
     * Check if contract is active
     */
    public function isActive(): bool
    {
        return $this->status === self::STATUS_ACTIVE &&
               $this->start_date <= now() &&
               ($this->end_date === null || $this->end_date >= now());
    }

    /**
     * Check if contract is expired
     */
    public function isExpired(): bool
    {
        return $this->end_date && $this->end_date->isPast();
    }

    /**
     * Check if contract is expiring soon
     */
    public function isExpiringSoon(int $days = 30): bool
    {
        return $this->end_date && 
               $this->end_date->isBetween(now(), now()->addDays($days));
    }

    /**
     * Generate contract number
     */
    public static function generateContractNumber(): string
    {
        $prefix = 'CT';
        $year = now()->year;
        
        $lastContract = self::whereYear('created_at', $year)
                           ->orderBy('id', 'desc')
                           ->first();
        
        $sequence = $lastContract ? 
            (int) substr($lastContract->contract_number, -4) + 1 : 1;
        
        return sprintf('%s%s%04d', $prefix, $year, $sequence);
    }

    /**
     * Activate contract
     */
    public function activate(): void
    {
        $this->update([
            'status' => self::STATUS_ACTIVE,
            'activated_at' => now()
        ]);
    }

    /**
     * Suspend contract
     */
    public function suspend(string $reason = null): void
    {
        $this->update([
            'status' => self::STATUS_SUSPENDED,
            'special_conditions' => $reason
        ]);
    }

    /**
     * Terminate contract
     */
    public function terminate(string $reason = null): void
    {
        $this->update([
            'status' => self::STATUS_TERMINATED,
            'end_date' => now(),
            'special_conditions' => $reason
        ]);
    }

    /**
     * Renew contract
     */
    public function renew(int $months = null): void
    {
        if (!$this->auto_renewal) {
            throw new \Exception('Contract does not have auto-renewal enabled');
        }

        $renewalMonths = $months ?? $this->getRenewalMonths();
        $newEndDate = $this->end_date ? 
            $this->end_date->addMonths($renewalMonths) : 
            now()->addMonths($renewalMonths);

        $this->update([
            'end_date' => $newEndDate,
            'status' => self::STATUS_ACTIVE
        ]);
    }

    /**
     * Get renewal period in months
     */
    private function getRenewalMonths(): int
    {
        return match ($this->renewal_period) {
            self::RENEWAL_MONTHLY => 1,
            self::RENEWAL_QUARTERLY => 3,
            self::RENEWAL_YEARLY => 12,
            default => 12
        };
    }

    /**
     * Check if order qualifies for contract terms
     */
    public function qualifiesOrder(Order $order): bool
    {
        if (!$this->isActive()) {
            return false;
        }

        // Check minimum order value
        if ($this->minimum_order_value && $order->total_amount < $this->minimum_order_value) {
            return false;
        }

        // Check maximum order value
        if ($this->maximum_order_value && $order->total_amount > $this->maximum_order_value) {
            return false;
        }

        // Check if order contains contract products
        if ($this->products()->exists()) {
            $contractProductIds = $this->products()->pluck('product_id');
            $orderProductIds = $order->items()->pluck('product_id');
            
            return $contractProductIds->intersect($orderProductIds)->isNotEmpty();
        }

        return true;
    }

    /**
     * Apply contract terms to order
     */
    public function applyToOrder(Order $order): void
    {
        if (!$this->qualifiesOrder($order)) {
            return;
        }

        // Apply contract discount
        if ($this->discount_percentage > 0) {
            $discountAmount = $order->subtotal * ($this->discount_percentage / 100);
            $order->update([
                'discount_amount' => $discountAmount,
                'contract_id' => $this->id
            ]);
            $order->recalculateTotal();
        }

        // Apply payment terms
        if ($this->payment_terms) {
            $order->update(['payment_terms' => $this->payment_terms]);
        }
    }

    /**
     * Get contract performance metrics
     */
    public function getPerformanceMetrics(): array
    {
        $orders = $this->orders()->where('status', 'completed');
        
        return [
            'total_orders' => $orders->count(),
            'total_value' => $orders->sum('total_amount'),
            'average_order_value' => $orders->avg('total_amount'),
            'monthly_average' => $this->getMonthlyAverage(),
            'compliance_rate' => $this->getComplianceRate()
        ];
    }

    /**
     * Get monthly average order value
     */
    private function getMonthlyAverage(): float
    {
        $months = $this->start_date->diffInMonths(now()) + 1;
        $totalValue = $this->orders()->where('status', 'completed')->sum('total_amount');
        
        return $months > 0 ? $totalValue / $months : 0;
    }

    /**
     * Get compliance rate (orders meeting minimum requirements)
     */
    private function getComplianceRate(): float
    {
        $totalOrders = $this->orders()->count();
        
        if ($totalOrders === 0) {
            return 0;
        }

        $compliantOrders = $this->orders()
            ->where('total_amount', '>=', $this->minimum_order_value ?? 0)
            ->count();

        return ($compliantOrders / $totalOrders) * 100;
    }

    /**
     * Auto-renew expiring contracts
     */
    public static function autoRenewContracts(): int
    {
        $renewed = 0;
        
        $expiringContracts = self::where('status', self::STATUS_ACTIVE)
            ->where('auto_renewal', true)
            ->where('end_date', '<=', now()->addDays(7))
            ->get();

        foreach ($expiringContracts as $contract) {
            try {
                $contract->renew();
                $renewed++;
            } catch (\Exception $e) {
                \Log::error("Failed to auto-renew contract {$contract->id}: " . $e->getMessage());
            }
        }

        return $renewed;
    }

    /**
     * Boot method for model events
     */
    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($contract) {
            if (!$contract->contract_number) {
                $contract->contract_number = self::generateContractNumber();
            }
            
            if (!$contract->status) {
                $contract->status = self::STATUS_DRAFT;
            }
        });
    }
}
