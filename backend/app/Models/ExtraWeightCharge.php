<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ExtraWeightCharge extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'extra_weight_charges';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'shipping_rate_id',
        'producer_shipping_rate_id',
        'charge_per_kg',
        'max_weight_kg', // Added based on migration
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'charge_per_kg' => 'decimal:2',
        'max_weight_kg' => 'integer', // Added based on migration
    ];

    /**
     * Get the base shipping rate associated with this extra charge (if applicable).
     */
    public function shippingRate(): BelongsTo
    {
        return $this->belongsTo(ShippingRate::class, 'shipping_rate_id');
    }

    /**
     * Get the producer-specific shipping rate associated with this extra charge (if applicable).
     */
    public function producerShippingRate(): BelongsTo
    {
        return $this->belongsTo(ProducerShippingRate::class, 'producer_shipping_rate_id');
    }
}
