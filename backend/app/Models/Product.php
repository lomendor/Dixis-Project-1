<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Product extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'producer_id',
        'name',
        'slug',
        'description',
        'seasonality', // Προσθήκη του πεδίου seasonality
        'short_description',
        'price',
        'discount_price',
        'stock',
        'stock_quantity', // Προσθήκη για συμβατότητα με το frontend
        'sku',
        'weight',
        'weight_grams',
        'dimensions',
        'main_image',
        'is_active',
        'is_featured',
        'featured', // Προσθήκη για συμβατότητα με το frontend
        'is_seasonal',
        'season_start',
        'season_end',
        'is_limited_edition',
        'limited_quantity',
        'allow_wishlist_notifications',
        'attributes', // Add attributes to fillable
        'status',
        'is_organic',
        'is_vegan',
        'is_gluten_free',
        'category_id',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'dimensions' => 'array',
        'seasonality' => 'array', // Cast seasonality JSON column to array
        'is_active' => 'boolean',
        'is_featured' => 'boolean',
        'is_seasonal' => 'boolean',
        'season_start' => 'date',
        'season_end' => 'date',
        'is_limited_edition' => 'boolean',
        'allow_wishlist_notifications' => 'boolean',
        'attributes' => 'array', // Cast attributes JSON column to array
        'price' => 'float',
        'discount_price' => 'float',
    ];

    /**
     * Get the route key for the model.
     * Allows route model binding by id.
     *
     * @return string
     */
    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    /**
     * Custom route model binding με fallback support για legacy IDs
     *
     * @param mixed $value
     * @param string|null $field
     * @return \Illuminate\Database\Eloquent\Model|null
     */
    public function resolveRouteBinding($value, $field = null)
    {
        // Αν έχει καθοριστεί συγκεκριμένο field, χρησιμοποίησέ το
        if ($field) {
            return $this->where($field, $value)->firstOrFail();
        }

        // Πρώτα δοκίμασε με slug
        $product = $this->where('slug', $value)->first();
        
        // Αν είναι αριθμός και δεν βρέθηκε με slug, δοκίμασε με ID
        if (!$product && is_numeric($value)) {
            $product = $this->find($value);
        }
        
        return $product ?: abort(404);
    }

    /**
     * Get the producer that owns the product.
     */
    public function producer(): BelongsTo
    {
        return $this->belongsTo(Producer::class);
    }

    /**
     * Get the images for the product.
     */
    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class);
    }

    /**
     * Get the category that owns the product.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'category_id');
    }

    /**
     * The categories that belong to the product.
     */
    public function categories(): BelongsToMany
    {
        // Using the pivot table 'product_category_relations'
        return $this->belongsToMany(Category::class, 'product_category_relations', 'product_id', 'category_id')
                    ->withTimestamps(); // Optionally include timestamps for the pivot table
    }

    /**
     * Get the questions for the product.
     */
    public function questions(): HasMany
    {
        return $this->hasMany(ProductQuestion::class);
    }

    /**
     * The attributes that belong to the product.
     */
    public function attributes(): BelongsToMany
    {
        return $this->belongsToMany(ProductAttribute::class, 'product_attribute_values', 'product_id', 'attribute_id')
                    ->withPivot('value')
                    ->withTimestamps();
    }

    /**
     * Get the attribute values for the product.
     */
    public function attributeValues(): HasMany
    {
        return $this->hasMany(ProductAttributeValue::class);
    }

    /**
     * Get the reviews for the product.
     */
    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    /**
     * Get the order items for the product.
     */
    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * Get the cost breakdown for the product.
     */
    public function costBreakdown()
    {
        return $this->hasOne(ProductCostBreakdown::class);
    }

    /**
     * Accessor για το πεδίο stock_quantity (για συμβατότητα με το frontend)
     */
    public function getStockQuantityAttribute()
    {
        return $this->stock;
    }

    /**
     * Mutator για το πεδίο stock_quantity (για συμβατότητα με το frontend)
     */
    public function setStockQuantityAttribute($value)
    {
        $this->attributes['stock'] = $value;
    }

    /**
     * Accessor για το πεδίο featured (για συμβατότητα με το frontend)
     */
    public function getFeaturedAttribute()
    {
        return $this->is_featured;
    }

    /**
     * Mutator για το πεδίο featured (για συμβατότητα με το frontend)
     */
    public function setFeaturedAttribute($value)
    {
        $this->attributes['is_featured'] = $value;
    }

    /**
     * Accessor για το πεδίο sale_price (για συμβατότητα με το frontend)
     */
    public function getSalePriceAttribute()
    {
        return $this->discount_price;
    }

    /**
     * Mutator για το πεδίο sale_price (για συμβατότητα με το frontend)
     */
    public function setSalePriceAttribute($value)
    {
        $this->attributes['discount_price'] = $value;
    }
}
