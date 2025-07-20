<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Adoption extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'adoptable_item_id',
        'adoption_plan_id',
        'status',
        'start_date',
        'end_date',
        'price_paid',
        'payment_status',
        'certificate_number',
        'certificate_file',
        'notes',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'price_paid' => 'decimal:2',
    ];

    /**
     * Get the user that owns the adoption.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the adoptable item that is being adopted.
     */
    public function adoptableItem(): BelongsTo
    {
        return $this->belongsTo(AdoptableItem::class);
    }

    /**
     * Get the adoption plan for the adoption.
     */
    public function adoptionPlan(): BelongsTo
    {
        return $this->belongsTo(AdoptionPlan::class);
    }

    /**
     * Get the updates for the adoption.
     */
    public function updates(): HasMany
    {
        return $this->hasMany(AdoptionUpdate::class);
    }

    /**
     * Check if the adoption is active.
     */
    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    /**
     * Check if the adoption has expired.
     */
    public function hasExpired(): bool
    {
        return $this->end_date->isPast();
    }
}
