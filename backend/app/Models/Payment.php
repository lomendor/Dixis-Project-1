<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'order_id',
        'user_id',
        'transaction_id',
        'stripe_payment_intent_id',
        'status',
        'payment_gateway',
        'payment_method',
        'amount',
        'currency',
        'stripe_data',
        'details',
        'payment_date',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'amount' => 'decimal:2',
        'stripe_data' => 'array',
        'details' => 'array',
        'payment_date' => 'datetime',
    ];

    /**
     * Get the order that owns the payment.
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Get the user associated with the payment.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the subscription associated with the payment.
     */
    public function subscription()
    {
        return $this->hasOne(Subscription::class);
    }

    /**
     * Check if the payment is succeeded (Stripe status).
     *
     * @return bool
     */
    public function isSucceeded(): bool
    {
        return $this->status === 'succeeded';
    }

    /**
     * Check if the payment is completed (legacy).
     *
     * @return bool
     */
    public function isCompleted(): bool
    {
        return $this->status === 'succeeded';
    }

    /**
     * Check if the payment is pending.
     *
     * @return bool
     */
    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    /**
     * Check if the payment is failed.
     *
     * @return bool
     */
    public function isFailed(): bool
    {
        return $this->status === 'failed';
    }

    /**
     * Check if the payment is canceled.
     *
     * @return bool
     */
    public function isCanceled(): bool
    {
        return $this->status === 'canceled';
    }

    /**
     * Get the formatted amount.
     *
     * @return string
     */
    public function getFormattedAmountAttribute(): string
    {
        return number_format($this->amount, 2) . ' ' . ($this->currency ?? 'EUR');
    }
}
