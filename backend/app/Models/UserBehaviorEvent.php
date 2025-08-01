<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * DIXIS PLATFORM - Enhanced User Behavior Event Model
 * AI-powered analytics for Greek marketplace with ML training data collection
 * 
 * Features:
 * - Greek market context tracking
 * - AI/ML training data storage
 * - Real-time personalization data
 * - GDPR-compliant privacy protection
 * - Advanced event categorization
 */
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
        // User identification
        'user_id',
        'session_id',
        
        // Event classification
        'event_type',
        'event_category',
        'event_data',
        
        // Legacy compatibility
        'product_id',
        'category_id',
        'producer_id',
        'search_query',
        
        // Context information
        'page_url',
        'referrer',
        'user_agent',
        'ip_address',
        'device_type',
        'browser',
        'os',
        'metadata',
        
        // Greek market & AI features
        'greek_context',
        'ai_training_data',
        
        // Timestamps
        'created_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'metadata' => 'array',
        'event_data' => 'array',
        'greek_context' => 'array',
        'ai_training_data' => 'array',
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

    /**
     * Scope for Greek market specific events
     */
    public function scopeGreekMarketEvents($query)
    {
        return $query->whereIn('event_type', [
            'viva_wallet_payment',
            'greek_shipping_select', 
            'island_delivery_select',
            'traditional_product_interest',
            'seasonal_search',
            'orthodox_calendar_view'
        ]);
    }

    /**
     * Scope for AI training data events
     */
    public function scopeForAITraining($query)
    {
        return $query->whereNotNull('ai_training_data')
                    ->whereNotNull('greek_context');
    }

    /**
     * Scope for events by region
     */
    public function scopeByRegion($query, string $region)
    {
        return $query->whereJsonContains('greek_context->user_region', $region);
    }

    /**
     * Scope for tourism season events
     */
    public function scopeTourismSeason($query)
    {
        return $query->whereJsonContains('greek_context->is_tourism_season', true);
    }

    /**
     * Scope for conversion events (high-value actions)
     */
    public function scopeConversionEvents($query)
    {
        return $query->whereIn('event_type', [
            'cart_add',
            'checkout_start', 
            'checkout_complete',
            'viva_wallet_payment',
            'producer_contact'
        ]);
    }

    /**
     * Scope for personalization events
     */
    public function scopePersonalizationEvents($query)
    {
        return $query->whereIn('event_type', [
            'recommendation_view',
            'recommendation_click',
            'personalization_interaction'
        ]);
    }

    /**
     * Get events for ML feature extraction
     */
    public function scopeForMLFeatures($query, int $days = 30)
    {
        return $query->where('created_at', '>=', now()->subDays($days))
                    ->whereNotNull('ai_training_data')
                    ->select([
                        'id',
                        'user_id',
                        'session_id',
                        'event_type',
                        'event_category',
                        'greek_context',
                        'ai_training_data',
                        'created_at'
                    ]);
    }

    /**
     * Get Greek market analytics data
     */
    public function scopeGreekAnalytics($query, int $days = 7)
    {
        return $query->where('created_at', '>=', now()->subDays($days))
                    ->whereNotNull('greek_context')
                    ->select([
                        'event_type',
                        'greek_context',
                        'created_at'
                    ]);
    }
}