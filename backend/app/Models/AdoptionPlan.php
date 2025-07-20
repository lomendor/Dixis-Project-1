<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AdoptionPlan extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'adoptable_item_id',
        'name',
        'description',
        'price',
        'duration_months',
        'benefits',
        'active',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'price' => 'decimal:2',
        'duration_months' => 'integer',
        'benefits' => 'array',
        'active' => 'boolean',
    ];

    /**
     * Get the adoptable item that owns the adoption plan.
     */
    public function adoptableItem(): BelongsTo
    {
        return $this->belongsTo(AdoptableItem::class);
    }

    /**
     * Get the adoptions for the adoption plan.
     */
    public function adoptions(): HasMany
    {
        return $this->hasMany(Adoption::class);
    }
}
