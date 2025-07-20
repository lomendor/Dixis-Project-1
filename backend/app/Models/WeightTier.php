<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class WeightTier extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'weight_tiers';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'code',
        'min_weight_grams',
        'max_weight_grams',
        'description',
    ];

    /**
     * Indicates if the model should be timestamped.
     *
     * @var bool
     */
    public $timestamps = false; // Assuming no timestamps based on migration

    /**
     * Get the shipping rates for the weight tier.
     */
    public function shippingRates(): HasMany
    {
        return $this->hasMany(ShippingRate::class, 'weight_tier_id');
    }

    /**
     * Get the producer-specific shipping methods for the weight tier.
     */
    public function producerShippingMethods(): HasMany
    {
        return $this->hasMany(ProducerShippingMethod::class, 'weight_tier_id');
    }
}
