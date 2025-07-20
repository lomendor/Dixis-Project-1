<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ShippingZone extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'shipping_zones';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'description',
        'is_active',
        'color',
        'geojson',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_active' => 'boolean',
        'geojson' => 'array',
    ];

    /**
     * Get the postal code zones for the shipping zone.
     */
    public function postalCodeZones(): HasMany
    {
        return $this->hasMany(PostalCodeZone::class, 'shipping_zone_id');
    }

    /**
     * Get the shipping rates for the shipping zone.
     */
    public function shippingRates(): HasMany
    {
        return $this->hasMany(ShippingRate::class, 'shipping_zone_id');
    }

    /**
     * Get the producer-specific shipping methods for the shipping zone.
     */
    public function producerShippingMethods(): HasMany
    {
        return $this->hasMany(ProducerShippingMethod::class, 'shipping_zone_id');
    }
}
