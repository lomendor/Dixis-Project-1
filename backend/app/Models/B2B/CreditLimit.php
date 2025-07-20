<?php

namespace App\Models\B2B;

use App\Models\BusinessUser;
use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CreditLimit extends Model
{
    use HasFactory, BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'business_user_id',
        'credit_limit',
        'used_credit',
        'available_credit',
        'currency',
        'last_updated_by',
        'notes'
    ];

    protected $casts = [
        'credit_limit' => 'decimal:2',
        'used_credit' => 'decimal:2',
        'available_credit' => 'decimal:2'
    ];

    /**
     * Get the business user that owns this credit limit
     */
    public function businessUser(): BelongsTo
    {
        return $this->belongsTo(BusinessUser::class);
    }

    /**
     * Calculate available credit
     */
    public function calculateAvailableCredit(): float
    {
        return max(0, $this->credit_limit - $this->used_credit);
    }

    /**
     * Check if credit is available for amount
     */
    public function hasCreditAvailable(float $amount): bool
    {
        return $this->calculateAvailableCredit() >= $amount;
    }

    /**
     * Get credit utilization percentage
     */
    public function getCreditUtilizationPercentage(): float
    {
        if ($this->credit_limit <= 0) {
            return 0;
        }

        return round(($this->used_credit / $this->credit_limit) * 100, 2);
    }

    /**
     * Update available credit
     */
    public function updateAvailableCredit(): void
    {
        $this->available_credit = $this->calculateAvailableCredit();
        $this->save();
    }

    /**
     * Boot method for model events
     */
    protected static function boot()
    {
        parent::boot();
        
        static::saving(function ($creditLimit) {
            $creditLimit->available_credit = $creditLimit->calculateAvailableCredit();
        });
    }
}