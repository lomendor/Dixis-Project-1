<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class EmailSubscriber extends Model
{
    use HasFactory;

    protected $fillable = [
        'email',
        'name',
        'user_id',
        'preferences',
        'is_active',
        'subscribed_at',
        'unsubscribed_at',
        'unsubscribe_token',
        'source',
        'last_activity',
        'email_verified_at'
    ];

    protected $casts = [
        'preferences' => 'array',
        'is_active' => 'boolean',
        'subscribed_at' => 'datetime',
        'unsubscribed_at' => 'datetime',
        'last_activity' => 'datetime',
        'email_verified_at' => 'datetime'
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($subscriber) {
            if (!$subscriber->unsubscribe_token) {
                $subscriber->unsubscribe_token = Str::random(32);
            }
        });
    }

    /**
     * Get the associated user
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope for active subscribers
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for inactive subscribers
     */
    public function scopeInactive($query)
    {
        return $query->where('is_active', false);
    }

    /**
     * Scope for verified email addresses
     */
    public function scopeVerified($query)
    {
        return $query->whereNotNull('email_verified_at');
    }

    /**
     * Scope for subscribers with specific preferences
     */
    public function scopeWithPreference($query, string $preference)
    {
        return $query->whereJsonContains('preferences', $preference);
    }

    /**
     * Scope for subscribers by source
     */
    public function scopeFromSource($query, string $source)
    {
        return $query->where('source', $source);
    }

    /**
     * Scope for recently active subscribers
     */
    public function scopeRecentlyActive($query, int $days = 30)
    {
        return $query->where('last_activity', '>=', now()->subDays($days));
    }

    /**
     * Check if subscriber has specific preference
     */
    public function hasPreference(string $preference): bool
    {
        return in_array($preference, $this->preferences ?? []);
    }

    /**
     * Add preference
     */
    public function addPreference(string $preference): void
    {
        $preferences = $this->preferences ?? [];
        
        if (!in_array($preference, $preferences)) {
            $preferences[] = $preference;
            $this->update(['preferences' => $preferences]);
        }
    }

    /**
     * Remove preference
     */
    public function removePreference(string $preference): void
    {
        $preferences = $this->preferences ?? [];
        $preferences = array_filter($preferences, fn($p) => $p !== $preference);
        
        $this->update(['preferences' => array_values($preferences)]);
    }

    /**
     * Update last activity
     */
    public function updateActivity(): void
    {
        $this->update(['last_activity' => now()]);
    }

    /**
     * Mark email as verified
     */
    public function markEmailAsVerified(): void
    {
        $this->update(['email_verified_at' => now()]);
    }

    /**
     * Unsubscribe
     */
    public function unsubscribe(): void
    {
        $this->update([
            'is_active' => false,
            'unsubscribed_at' => now()
        ]);
    }

    /**
     * Resubscribe
     */
    public function resubscribe(): void
    {
        $this->update([
            'is_active' => true,
            'unsubscribed_at' => null,
            'subscribed_at' => now()
        ]);
    }

    /**
     * Get formatted source
     */
    public function getFormattedSourceAttribute(): string
    {
        $sources = [
            'website' => 'Ιστοσελίδα',
            'checkout' => 'Checkout',
            'registration' => 'Εγγραφή',
            'import' => 'Εισαγωγή',
            'api' => 'API',
            'admin' => 'Διαχειριστής'
        ];

        return $sources[$this->source] ?? $this->source;
    }

    /**
     * Get subscriber status
     */
    public function getStatusAttribute(): string
    {
        if (!$this->is_active) {
            return 'unsubscribed';
        }

        if (!$this->email_verified_at) {
            return 'unverified';
        }

        if ($this->last_activity && $this->last_activity->lt(now()->subDays(90))) {
            return 'inactive';
        }

        return 'active';
    }

    /**
     * Get formatted status
     */
    public function getFormattedStatusAttribute(): string
    {
        $statuses = [
            'active' => 'Ενεργός',
            'inactive' => 'Ανενεργός',
            'unverified' => 'Μη επιβεβαιωμένος',
            'unsubscribed' => 'Απεγγραμμένος'
        ];

        return $statuses[$this->status] ?? $this->status;
    }

    /**
     * Get engagement level
     */
    public function getEngagementLevelAttribute(): string
    {
        if (!$this->last_activity) {
            return 'unknown';
        }

        $daysSinceActivity = $this->last_activity->diffInDays(now());

        if ($daysSinceActivity <= 7) {
            return 'high';
        } elseif ($daysSinceActivity <= 30) {
            return 'medium';
        } elseif ($daysSinceActivity <= 90) {
            return 'low';
        } else {
            return 'very_low';
        }
    }

    /**
     * Get formatted engagement level
     */
    public function getFormattedEngagementLevelAttribute(): string
    {
        $levels = [
            'high' => 'Υψηλή',
            'medium' => 'Μέτρια',
            'low' => 'Χαμηλή',
            'very_low' => 'Πολύ Χαμηλή',
            'unknown' => 'Άγνωστη'
        ];

        return $levels[$this->engagement_level] ?? $this->engagement_level;
    }

    /**
     * Get available preferences
     */
    public static function getAvailablePreferences(): array
    {
        return [
            'newsletter' => 'Newsletter',
            'promotions' => 'Προσφορές',
            'new_products' => 'Νέα Προϊόντα',
            'seasonal_offers' => 'Εποχιακές Προσφορές',
            'producer_updates' => 'Ενημερώσεις Παραγωγών',
            'order_updates' => 'Ενημερώσεις Παραγγελιών',
            'recommendations' => 'Προτάσεις Προϊόντων',
            'events' => 'Εκδηλώσεις',
            'tips' => 'Συμβουλές'
        ];
    }

    /**
     * Get subscriber segments
     */
    public static function getSegments(): array
    {
        return [
            'all' => 'Όλοι οι εγγεγραμμένοι',
            'active' => 'Ενεργοί',
            'inactive' => 'Ανενεργοί',
            'high_engagement' => 'Υψηλή δραστηριότητα',
            'new_subscribers' => 'Νέοι εγγεγραμμένοι',
            'customers' => 'Πελάτες',
            'producers' => 'Παραγωγοί',
            'b2b' => 'B2B Πελάτες'
        ];
    }

    /**
     * Get unsubscribe URL
     */
    public function getUnsubscribeUrlAttribute(): string
    {
        return route('newsletter.unsubscribe', [
            'email' => $this->email,
            'token' => $this->unsubscribe_token
        ]);
    }

    /**
     * Get subscription duration in days
     */
    public function getSubscriptionDurationAttribute(): int
    {
        if (!$this->subscribed_at) {
            return 0;
        }

        $endDate = $this->unsubscribed_at ?? now();
        return $this->subscribed_at->diffInDays($endDate);
    }
}
