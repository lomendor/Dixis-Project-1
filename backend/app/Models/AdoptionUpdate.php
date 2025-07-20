<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AdoptionUpdate extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'adoption_id',
        'title',
        'content',
        'images',
        'status',
        'notify_adopter',
        'published_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'images' => 'array',
        'notify_adopter' => 'boolean',
        'published_at' => 'datetime',
    ];

    /**
     * Get the adoption that owns the update.
     */
    public function adoption(): BelongsTo
    {
        return $this->belongsTo(Adoption::class);
    }

    /**
     * Scope a query to only include published updates.
     */
    public function scopePublished($query)
    {
        return $query->where('status', 'published');
    }
}
