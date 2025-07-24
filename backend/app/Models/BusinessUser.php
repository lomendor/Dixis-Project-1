<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
// use App\Traits\BelongsToTenant; // Disabled for MVP - multi-tenancy not needed yet

class BusinessUser extends Model
{
    use HasFactory, SoftDeletes; // , BelongsToTenant disabled for MVP

    protected $fillable = [
        'tenant_id',
        'user_id',
        'business_name',
        'business_type',
        'tax_number',
        'registration_number',
        'industry',
        'annual_revenue',
        'employee_count',
        'business_address',
        'billing_address',
        'contact_person',
        'contact_phone',
        'contact_email',
        'website',
        'status',
        'verification_status',
        'credit_limit',
        'payment_terms',
        'discount_tier',
        'notes',
        'verified_at',
        'approved_at'
    ];

    protected $casts = [
        'business_address' => 'array',
        'billing_address' => 'array',
        'annual_revenue' => 'decimal:2',
        'credit_limit' => 'decimal:2',
        'verified_at' => 'datetime',
        'approved_at' => 'datetime',
    ];

    // Business types
    const TYPE_RESTAURANT = 'restaurant';
    const TYPE_HOTEL = 'hotel';
    const TYPE_CATERING = 'catering';
    const TYPE_RETAIL = 'retail';
    const TYPE_WHOLESALE = 'wholesale';
    const TYPE_DISTRIBUTOR = 'distributor';
    const TYPE_OTHER = 'other';

    // Status types
    const STATUS_PENDING = 'pending';
    const STATUS_ACTIVE = 'active';
    const STATUS_SUSPENDED = 'suspended';
    const STATUS_REJECTED = 'rejected';

    // Verification status
    const VERIFICATION_PENDING = 'pending';
    const VERIFICATION_VERIFIED = 'verified';
    const VERIFICATION_REJECTED = 'rejected';

    // Discount tiers
    const TIER_BRONZE = 'bronze';
    const TIER_SILVER = 'silver';
    const TIER_GOLD = 'gold';
    const TIER_PLATINUM = 'platinum';

    /**
     * Get the user that owns this business profile
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the business orders
     */
    public function orders(): HasMany
    {
        return $this->hasMany(Order::class, 'business_user_id');
    }

    /**
     * Get the business quotes
     */
    public function quotes(): HasMany
    {
        return $this->hasMany(Quote::class);
    }

    /**
     * Get the business contracts
     */
    public function contracts(): HasMany
    {
        return $this->hasMany(Contract::class);
    }

    /**
     * Scope for active business users
     */
    public function scopeActive($query)
    {
        return $query->where('status', self::STATUS_ACTIVE);
    }

    /**
     * Scope for verified business users
     */
    public function scopeVerified($query)
    {
        return $query->where('verification_status', self::VERIFICATION_VERIFIED);
    }

    /**
     * Scope for pending verification
     */
    public function scopePendingVerification($query)
    {
        return $query->where('verification_status', self::VERIFICATION_PENDING);
    }

    /**
     * Scope by business type
     */
    public function scopeOfType($query, string $type)
    {
        return $query->where('business_type', $type);
    }

    /**
     * Scope by discount tier
     */
    public function scopeOfTier($query, string $tier)
    {
        return $query->where('discount_tier', $tier);
    }

    /**
     * Check if business user is active
     */
    public function isActive(): bool
    {
        return $this->status === self::STATUS_ACTIVE;
    }

    /**
     * Check if business user is verified
     */
    public function isVerified(): bool
    {
        return $this->verification_status === self::VERIFICATION_VERIFIED;
    }

    /**
     * Check if business user can place orders
     */
    public function canPlaceOrders(): bool
    {
        return $this->isActive() && $this->isVerified();
    }

    /**
     * Get discount percentage based on tier
     */
    public function getDiscountPercentage(): float
    {
        $discounts = [
            self::TIER_BRONZE => 5.0,
            self::TIER_SILVER => 10.0,
            self::TIER_GOLD => 15.0,
            self::TIER_PLATINUM => 20.0,
        ];

        return $discounts[$this->discount_tier] ?? 0.0;
    }

    /**
     * Get payment terms in days
     */
    public function getPaymentTermsDays(): int
    {
        $terms = [
            'immediate' => 0,
            'net_7' => 7,
            'net_15' => 15,
            'net_30' => 30,
            'net_45' => 45,
            'net_60' => 60,
        ];

        return $terms[$this->payment_terms] ?? 0;
    }

    /**
     * Calculate available credit
     */
    public function getAvailableCredit(): float
    {
        $usedCredit = $this->orders()
            ->whereIn('status', ['pending', 'confirmed', 'processing'])
            ->sum('total_amount');

        return max(0, $this->credit_limit - $usedCredit);
    }

    /**
     * Check if business user has sufficient credit
     */
    public function hasSufficientCredit(float $amount): bool
    {
        return $this->getAvailableCredit() >= $amount;
    }

    /**
     * Get monthly order volume
     */
    public function getMonthlyOrderVolume(): float
    {
        return $this->orders()
            ->whereYear('created_at', now()->year)
            ->whereMonth('created_at', now()->month)
            ->where('status', 'completed')
            ->sum('total_amount');
    }

    /**
     * Get total order volume
     */
    public function getTotalOrderVolume(): float
    {
        return $this->orders()
            ->where('status', 'completed')
            ->sum('total_amount');
    }

    /**
     * Upgrade discount tier based on volume
     */
    public function upgradeDiscountTier(): void
    {
        $totalVolume = $this->getTotalOrderVolume();
        
        $newTier = match (true) {
            $totalVolume >= 50000 => self::TIER_PLATINUM,
            $totalVolume >= 25000 => self::TIER_GOLD,
            $totalVolume >= 10000 => self::TIER_SILVER,
            $totalVolume >= 2500 => self::TIER_BRONZE,
            default => $this->discount_tier
        };

        if ($newTier !== $this->discount_tier) {
            $this->update(['discount_tier' => $newTier]);
        }
    }

    /**
     * Verify business user
     */
    public function verify(): void
    {
        $this->update([
            'verification_status' => self::VERIFICATION_VERIFIED,
            'verified_at' => now()
        ]);
    }

    /**
     * Approve business user
     */
    public function approve(): void
    {
        $this->update([
            'status' => self::STATUS_ACTIVE,
            'approved_at' => now()
        ]);
    }

    /**
     * Suspend business user
     */
    public function suspend(): void
    {
        $this->update(['status' => self::STATUS_SUSPENDED]);
    }

    /**
     * Reject business user
     */
    public function reject(string $reason = null): void
    {
        $this->update([
            'status' => self::STATUS_REJECTED,
            'verification_status' => self::VERIFICATION_REJECTED,
            'notes' => $reason
        ]);
    }

    /**
     * Get business types
     */
    public static function getBusinessTypes(): array
    {
        return [
            self::TYPE_RESTAURANT => 'Εστιατόριο',
            self::TYPE_HOTEL => 'Ξενοδοχείο',
            self::TYPE_CATERING => 'Catering',
            self::TYPE_RETAIL => 'Λιανική',
            self::TYPE_WHOLESALE => 'Χονδρική',
            self::TYPE_DISTRIBUTOR => 'Διανομέας',
            self::TYPE_OTHER => 'Άλλο'
        ];
    }

    /**
     * Get discount tiers
     */
    public static function getDiscountTiers(): array
    {
        return [
            self::TIER_BRONZE => 'Bronze (5%)',
            self::TIER_SILVER => 'Silver (10%)',
            self::TIER_GOLD => 'Gold (15%)',
            self::TIER_PLATINUM => 'Platinum (20%)'
        ];
    }

    /**
     * Get payment terms options
     */
    public static function getPaymentTerms(): array
    {
        return [
            'immediate' => 'Άμεση πληρωμή',
            'net_7' => 'Net 7 ημέρες',
            'net_15' => 'Net 15 ημέρες',
            'net_30' => 'Net 30 ημέρες',
            'net_45' => 'Net 45 ημέρες',
            'net_60' => 'Net 60 ημέρες'
        ];
    }

    /**
     * Boot method for model events
     */
    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($businessUser) {
            if (!$businessUser->discount_tier) {
                $businessUser->discount_tier = self::TIER_BRONZE;
            }
            
            if (!$businessUser->payment_terms) {
                $businessUser->payment_terms = 'net_30';
            }
            
            if (!$businessUser->credit_limit) {
                $businessUser->credit_limit = 5000.00; // Default credit limit
            }
        });
        
        static::updated(function ($businessUser) {
            // Auto-upgrade tier based on volume
            if ($businessUser->wasChanged('status') && $businessUser->status === self::STATUS_ACTIVE) {
                $businessUser->upgradeDiscountTier();
            }
        });
    }
}
