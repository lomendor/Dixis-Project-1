<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Subscription extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'plan_id',
        'subscribable_id',
        'subscribable_type',
        'status',
        'start_date',
        'end_date',
        'auto_renew',
        'payment_id',
        'last_payment_date',
        'next_payment_date',
        'cancellation_reason',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'last_payment_date' => 'datetime',
        'next_payment_date' => 'datetime',
        'auto_renew' => 'boolean',
    ];

    /**
     * Get the subscription plan.
     */
    public function plan(): BelongsTo
    {
        return $this->belongsTo(SubscriptionPlan::class, 'plan_id');
    }

    /**
     * Get the subscribable entity (producer or business).
     */
    public function subscribable(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Get the payment for the subscription.
     */
    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class, 'payment_id');
    }

    /**
     * Check if the subscription is active.
     *
     * @return bool
     */
    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    /**
     * Check if the subscription is pending.
     *
     * @return bool
     */
    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    /**
     * Check if the subscription is cancelled.
     *
     * @return bool
     */
    public function isCancelled(): bool
    {
        return $this->status === 'cancelled';
    }

    /**
     * Check if the subscription is expired.
     *
     * @return bool
     */
    public function isExpired(): bool
    {
        return $this->status === 'expired';
    }

    /**
     * Check if the subscription has ended.
     *
     * @return bool
     */
    public function hasEnded(): bool
    {
        return $this->end_date && now()->greaterThan($this->end_date);
    }

    /**
     * Cancel the subscription.
     *
     * @param string|null $reason
     * @return bool
     */
    public function cancel(?string $reason = null): bool
    {
        $this->status = 'cancelled';
        $this->auto_renew = false;
        $this->cancellation_reason = $reason;
        return $this->save();
    }

    /**
     * Renew the subscription.
     *
     * @param int $durationMonths
     * @return bool
     */
    public function renew(int $durationMonths = 1): bool
    {
        $startDate = $this->end_date ?? now();
        $this->start_date = $startDate;
        $this->end_date = $startDate->copy()->addMonths($durationMonths);
        $this->status = 'active';
        $this->last_payment_date = now();
        $this->next_payment_date = $this->end_date;
        return $this->save();
    }
}
