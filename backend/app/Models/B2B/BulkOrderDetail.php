<?php

namespace App\Models\B2B;

use App\Models\Order;
use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BulkOrderDetail extends Model
{
    use HasFactory, BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'order_id',
        'source',
        'original_filename',
        'total_products',
        'total_quantity',
        'processing_notes',
        'approval_notes',
        'approved_by',
        'approved_at',
        'rejected_by',
        'rejected_at',
        'rejection_reason'
    ];

    protected $casts = [
        'total_products' => 'integer',
        'total_quantity' => 'integer',
        'approved_at' => 'datetime',
        'rejected_at' => 'datetime'
    ];

    // Source types
    const SOURCE_CSV = 'csv';
    const SOURCE_MANUAL = 'manual';
    const SOURCE_API = 'api';
    const SOURCE_TEMPLATE = 'template';

    /**
     * Get the order that owns this bulk order detail
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Check if bulk order is approved
     */
    public function isApproved(): bool
    {
        return !is_null($this->approved_at);
    }

    /**
     * Check if bulk order is rejected
     */
    public function isRejected(): bool
    {
        return !is_null($this->rejected_at);
    }

    /**
     * Check if bulk order is pending approval
     */
    public function isPendingApproval(): bool
    {
        return is_null($this->approved_at) && is_null($this->rejected_at);
    }

    /**
     * Get source in Greek
     */
    public function getSourceInGreekAttribute(): string
    {
        $sources = [
            self::SOURCE_CSV => 'Αρχείο CSV',
            self::SOURCE_MANUAL => 'Χειροκίνητη Εισαγωγή',
            self::SOURCE_API => 'API',
            self::SOURCE_TEMPLATE => 'Πρότυπο'
        ];

        return $sources[$this->source] ?? $this->source;
    }
}