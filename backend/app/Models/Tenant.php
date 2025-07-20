<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Tenant extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'slug',
        'domain',
        'subdomain',
        'plan',
        'status',
        'owner_id',
        'settings',
        'subscription_expires_at',
        'trial_ends_at',
        'created_at',
        'updated_at'
    ];

    protected $casts = [
        'settings' => 'array',
        'subscription_expires_at' => 'datetime',
        'trial_ends_at' => 'datetime',
    ];

    // Plan types
    const PLAN_BASIC = 'basic';
    const PLAN_PREMIUM = 'premium';
    const PLAN_ENTERPRISE = 'enterprise';

    // Status types
    const STATUS_ACTIVE = 'active';
    const STATUS_INACTIVE = 'inactive';
    const STATUS_SUSPENDED = 'suspended';
    const STATUS_TRIAL = 'trial';

    /**
     * Get the tenant's theme customization
     */
    public function theme(): HasOne
    {
        return $this->hasOne(TenantTheme::class);
    }

    /**
     * Get the tenant's revenue shares
     */
    public function revenueShares(): HasMany
    {
        return $this->hasMany(RevenueShare::class);
    }

    /**
     * Get the tenant's users
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    /**
     * Get the tenant's products
     */
    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    /**
     * Get the tenant's orders
     */
    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    /**
     * Get the tenant owner
     */
    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    /**
     * Scope for active tenants
     */
    public function scopeActive($query)
    {
        return $query->where('status', self::STATUS_ACTIVE);
    }

    /**
     * Scope for trial tenants
     */
    public function scopeTrial($query)
    {
        return $query->where('status', self::STATUS_TRIAL);
    }

    /**
     * Check if tenant is on trial
     */
    public function isOnTrial(): bool
    {
        return $this->status === self::STATUS_TRIAL && 
               $this->trial_ends_at && 
               $this->trial_ends_at->isFuture();
    }

    /**
     * Check if tenant subscription is active
     */
    public function hasActiveSubscription(): bool
    {
        return $this->status === self::STATUS_ACTIVE && 
               $this->subscription_expires_at && 
               $this->subscription_expires_at->isFuture();
    }

    /**
     * Check if tenant subscription is expired
     */
    public function isSubscriptionExpired(): bool
    {
        return $this->subscription_expires_at && 
               $this->subscription_expires_at->isPast();
    }

    /**
     * Get plan features
     */
    public function getPlanFeatures(): array
    {
        $features = [
            self::PLAN_BASIC => [
                'max_products' => 100,
                'max_orders_per_month' => 500,
                'custom_domain' => false,
                'white_label' => false,
                'analytics' => 'basic',
                'support' => 'email',
                'commission_rate' => 15.0,
                'monthly_fee' => 99.00
            ],
            self::PLAN_PREMIUM => [
                'max_products' => 1000,
                'max_orders_per_month' => 2000,
                'custom_domain' => true,
                'white_label' => true,
                'analytics' => 'advanced',
                'support' => 'priority',
                'commission_rate' => 12.0,
                'monthly_fee' => 299.00
            ],
            self::PLAN_ENTERPRISE => [
                'max_products' => -1, // unlimited
                'max_orders_per_month' => -1, // unlimited
                'custom_domain' => true,
                'white_label' => true,
                'analytics' => 'enterprise',
                'support' => 'dedicated',
                'commission_rate' => 10.0,
                'monthly_fee' => 999.00
            ]
        ];

        return $features[$this->plan] ?? $features[self::PLAN_BASIC];
    }

    /**
     * Get commission rate for this tenant
     */
    public function getCommissionRate(): float
    {
        $features = $this->getPlanFeatures();
        return $features['commission_rate'];
    }

    /**
     * Get monthly fee for this tenant
     */
    public function getMonthlyFee(): float
    {
        $features = $this->getPlanFeatures();
        return $features['monthly_fee'];
    }

    /**
     * Check if tenant can add more products
     */
    public function canAddProducts(): bool
    {
        $features = $this->getPlanFeatures();
        $maxProducts = $features['max_products'];
        
        if ($maxProducts === -1) {
            return true; // unlimited
        }
        
        return $this->products()->count() < $maxProducts;
    }

    /**
     * Check if tenant can process more orders this month
     */
    public function canProcessOrders(): bool
    {
        $features = $this->getPlanFeatures();
        $maxOrders = $features['max_orders_per_month'];
        
        if ($maxOrders === -1) {
            return true; // unlimited
        }
        
        $currentMonthOrders = $this->orders()
            ->whereYear('created_at', now()->year)
            ->whereMonth('created_at', now()->month)
            ->count();
            
        return $currentMonthOrders < $maxOrders;
    }

    /**
     * Get tenant's total revenue this month
     */
    public function getMonthlyRevenue(): float
    {
        return $this->orders()
            ->whereYear('created_at', now()->year)
            ->whereMonth('created_at', now()->month)
            ->where('status', 'completed')
            ->sum('total_amount');
    }

    /**
     * Get tenant's commission owed this month
     */
    public function getMonthlyCommission(): float
    {
        $revenue = $this->getMonthlyRevenue();
        $commissionRate = $this->getCommissionRate() / 100;
        
        return $revenue * $commissionRate;
    }

    /**
     * Generate unique subdomain
     */
    public static function generateSubdomain(string $name): string
    {
        $baseSlug = \Str::slug($name);
        $slug = $baseSlug;
        $counter = 1;
        
        while (self::where('subdomain', $slug)->exists()) {
            $slug = $baseSlug . '-' . $counter;
            $counter++;
        }
        
        return $slug;
    }

    /**
     * Get tenant by domain or subdomain
     */
    public static function findByDomain(string $domain): ?self
    {
        // Try exact domain match first
        $tenant = self::where('domain', $domain)->first();
        
        if (!$tenant) {
            // Try subdomain match
            $subdomain = explode('.', $domain)[0];
            $tenant = self::where('subdomain', $subdomain)->first();
        }
        
        return $tenant;
    }

    /**
     * Get tenant's full URL
     */
    public function getUrl(): string
    {
        if ($this->domain) {
            return 'https://' . $this->domain;
        }
        
        return 'https://' . $this->subdomain . '.dixis.gr';
    }

    /**
     * Boot method for model events
     */
    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($tenant) {
            if (!$tenant->slug) {
                $tenant->slug = \Str::slug($tenant->name);
            }
            
            if (!$tenant->subdomain) {
                $tenant->subdomain = self::generateSubdomain($tenant->name);
            }
        });
        
        static::created(function ($tenant) {
            // Create default theme for new tenant
            $tenant->theme()->create([
                'primary_color' => '#16a34a',
                'secondary_color' => '#059669',
                'accent_color' => '#10b981',
                'background_color' => '#ffffff',
                'text_color' => '#1f2937',
                'font_family' => 'Inter',
                'logo_url' => null,
                'favicon_url' => null,
                'custom_css' => '',
                'settings' => [
                    'show_branding' => true,
                    'custom_footer' => false,
                    'social_links' => []
                ]
            ]);
        });
    }
}
