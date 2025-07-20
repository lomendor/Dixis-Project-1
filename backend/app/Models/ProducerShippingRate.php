<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProducerShippingRate extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'producer_shipping_rates';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'producer_id',
        'shipping_zone_id',
        'weight_tier_id', // Corrected
        'delivery_method_id', // Corrected
        'price', // Corrected
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'price' => 'decimal:2', // Corrected
    ];

    /**
     * Indicates if the model should be timestamped.
     *
     * @var bool
     */
    public $timestamps = false; // Assuming no timestamps based on migration

    /**
     * Get the producer this rate belongs to.
     */
    public function producer(): BelongsTo
    {
        return $this->belongsTo(Producer::class);
    }

    /**
     * Get the shipping zone this rate belongs to.
     */
    public function shippingZone(): BelongsTo
    {
        // Assuming the foreign key in producer_shipping_rates is shipping_zone_id
        return $this->belongsTo(ShippingZone::class, 'shipping_zone_id');
    }

    /**
     * Get the delivery method this rate belongs to.
     */
    public function deliveryMethod(): BelongsTo
    {
        return $this->belongsTo(DeliveryMethod::class, 'delivery_method_id');
    }

    /**
     * Get the weight tier this rate belongs to.
     */
    public function weightTier(): BelongsTo
    {
        return $this->belongsTo(WeightTier::class, 'weight_tier_id');
    }
}
