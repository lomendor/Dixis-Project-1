<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AdditionalCharge extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'additional_charges';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'shipping_rate_id',
        'producer_shipping_rate_id',
        'charge_type', // e.g., 'fragile', 'remote_area', 'fuel_surcharge'
        'amount',
        'description',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'amount' => 'decimal:2',
    ];

    /**
     * Indicates if the model should be timestamped.
     *
     * @var bool
     */
    public $timestamps = false; // Assuming no timestamps based on migration

    /**
     * Get the base shipping rate associated with this additional charge (if applicable).
     */
    public function shippingRate(): BelongsTo
    {
        return $this->belongsTo(ShippingRate::class, 'shipping_rate_id');
    }

    /**
     * Get the producer-specific shipping rate associated with this additional charge (if applicable).
     */
    public function producerShippingRate(): BelongsTo
    {
        return $this->belongsTo(ProducerShippingRate::class, 'producer_shipping_rate_id');
    }
}
