<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserBehaviorEvent extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'user_behavior_events';

    /**
     * Indicates if the model should be timestamped.
     *
     * @var bool
     */
    public $timestamps = false;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'session_id',
        'event_type',
        'product_id',
        'category_id',
        'producer_id',
        'search_query',
        'page_url',
        'referrer',
        'user_agent',
        'ip_address',
        'device_type',
        'browser',
        'os',
        'metadata',
        'created_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'metadata' => 'array',
        'created_at' => 'datetime',
    ];

    /**
     * Get the user that performed the event.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the product associated with the event.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Get the category associated with the event.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Get the producer associated with the event.
     */
    public function producer(): BelongsTo
    {
        return $this->belongsTo(Producer::class);
    }

    /**
     * Scope for product view events
     */
    public function scopeProductViews($query)
    {
        return $query->where('event_type', 'product_view');
    }

    /**
     * Scope for purchase events
     */
    public function scopePurchases($query)
    {
        return $query->where('event_type', 'purchase');
    }

    /**
     * Scope for add to cart events
     */
    public function scopeAddToCart($query)
    {
        return $query->where('event_type', 'add_to_cart');
    }

    /**
     * Scope for producer-specific events
     */
    public function scopeForProducer($query, int $producerId)
    {
        return $query->where('producer_id', $producerId);
    }

    /**
     * Scope for events within date range
     */
    public function scopeWithinDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('created_at', [$startDate, $endDate]);
    }
}