<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProducerDocument extends Model
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
        'file_path',
        'type',
        'status',
        'notes',
    ];

    /**
     * Get the producer that owns the document.
     */
    public function producer(): BelongsTo
    {
        return $this->belongsTo(Producer::class);
    }
}
