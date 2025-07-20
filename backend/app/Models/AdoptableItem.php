<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AdoptableItem extends Model
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
        'type',
        'location',
        'status',
        'main_image',
        'gallery_images',
        'attributes',
        'featured',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'gallery_images' => 'array',
        'attributes' => 'array',
        'featured' => 'boolean',
    ];

    /**
     * Get the producer that owns the adoptable item.
     */
    public function producer(): BelongsTo
    {
        return $this->belongsTo(Producer::class);
    }

    /**
     * Get the adoption plans for the adoptable item.
     */
    public function adoptionPlans(): HasMany
    {
        return $this->hasMany(AdoptionPlan::class);
    }

    /**
     * Get the adoptions for the adoptable item.
     */
    public function adoptions(): HasMany
    {
        return $this->hasMany(Adoption::class);
    }

    /**
     * Get the active adoptions for the adoptable item.
     */
    public function activeAdoptions()
    {
        return $this->adoptions()->where('status', 'active');
    }

    /**
     * Check if the adoptable item is currently adopted.
     */
    public function isAdopted(): bool
    {
        return $this->status === 'adopted' || $this->activeAdoptions()->exists();
    }
}
