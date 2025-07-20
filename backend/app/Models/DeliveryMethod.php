<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DeliveryMethod extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'delivery_methods';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'code', // Added
        'name',
        'description',
        'is_active',
        'max_weight_kg', // Added
        'max_length_cm', // Added
        'max_width_cm', // Added
        'max_height_cm', // Added
        'supports_cod', // Added
        'suitable_for_perishable', // Added
        'suitable_for_fragile', // Added
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_active' => 'boolean',
        'max_weight_kg' => 'decimal:2', // Added
        'max_length_cm' => 'decimal:2', // Added
        'max_width_cm' => 'decimal:2', // Added
        'max_height_cm' => 'decimal:2', // Added
        'supports_cod' => 'boolean', // Added
        'suitable_for_perishable' => 'boolean', // Added
        'suitable_for_fragile' => 'boolean', // Added
    ];

    /**
     * Indicates if the model should be timestamped.
     *
     * @var bool
     */
    public $timestamps = false; // Assuming no timestamps based on migration

    /**
     * Get the default shipping rates associated with this delivery method.
     */
    public function shippingRates(): HasMany
    {
        return $this->hasMany(ShippingRate::class, 'delivery_method_id');
    }

    /**
     * Get the producer-specific shipping methods associated with this delivery method.
     */
    public function producerShippingMethods(): HasMany
    {
        return $this->hasMany(ProducerShippingMethod::class, 'delivery_method_id');
    }

    /**
     * Get the producer shipping rates associated with this delivery method.
     */
    public function producerShippingRates(): HasMany
    {
        return $this->hasMany(ProducerShippingRate::class, 'delivery_method_id');
    }
}
