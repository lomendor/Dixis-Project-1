<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class Producer extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'business_name',
        'tax_id',
        'tax_office',
        'description',
        'address',
        'city',
        'postal_code',
        'region',
        'latitude',
        'longitude',
        'map_description',
        'logo',
        'cover_image',
        'website',
        'social_media',
        'bio',
        'verified',
        'rating',
        'uses_custom_shipping_rates',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'social_media' => 'array', // Cast JSON column to array
        'verified' => 'boolean',
        'uses_custom_shipping_rates' => 'boolean',
        'latitude' => 'float',
        'longitude' => 'float',
    ];

    /**
     * Get the user that owns the producer profile.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the products associated with the producer.
     */
    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    /**
     * Get the adoptable items for the producer.
     */
    public function adoptableItems(): HasMany
    {
        return $this->hasMany(AdoptableItem::class);
    }

    /**
     * Get the shipping methods for the producer.
     */
    public function shippingMethods(): HasMany
    {
        return $this->hasMany(ProducerShippingMethod::class);
    }

    /**
     * Get the free shipping rules for the producer.
     */
    public function freeShippingRules(): HasMany
    {
        return $this->hasMany(ProducerFreeShipping::class);
    }

    /**
     * Get the producer-specific shipping rates.
     */
    public function shippingRates(): HasMany
    {
        return $this->hasMany(ProducerShippingRate::class);
    }

    /**
     * Get the documents associated with the producer.
     */
    public function documents(): HasMany
    {
        return $this->hasMany(ProducerDocument::class);
    }

    /**
     * Get the reviews for the producer.
     */
    public function reviews(): HasMany
    {
        return $this->hasMany(ProducerReview::class);
    }
    
    /**
     * Get the media items for the producer.
     */
    public function media(): HasMany
    {
        return $this->hasMany(ProducerMedia::class);
    }
    
    /**
     * Get the questions for the producer.
     */
    public function questions(): HasMany
    {
        return $this->hasMany(ProducerQuestion::class);
    }
    
    /**
     * Get the environmental statistics for the producer.
     */
    public function environmentalStats()
    {
        return $this->hasOne(ProducerEnvironmentalStat::class);
    }

    /**
     * Check if the producer has valid coordinates.
     */
    public function hasValidCoordinates(): bool
    {
        return !is_null($this->latitude) && !is_null($this->longitude);
    }
}
