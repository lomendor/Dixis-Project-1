<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuoteItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'quote_id',
        'product_id',
        'quantity',
        'unit_price',
        'total_price',
        'discount_percentage',
        'discount_amount',
        'notes'
    ];

    protected $casts = [
        'quantity' => 'decimal:2',
        'unit_price' => 'decimal:2',
        'total_price' => 'decimal:2',
        'discount_percentage' => 'decimal:2',
        'discount_amount' => 'decimal:2',
    ];

    /**
     * Get the quote that owns this item
     */
    public function quote(): BelongsTo
    {
        return $this->belongsTo(Quote::class);
    }

    /**
     * Get the product
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Calculate total price
     */
    public function calculateTotal(): void
    {
        $subtotal = $this->quantity * $this->unit_price;
        $discountAmount = $subtotal * ($this->discount_percentage / 100);
        $totalPrice = $subtotal - $discountAmount;
        
        $this->update([
            'discount_amount' => $discountAmount,
            'total_price' => $totalPrice
        ]);
    }

    /**
     * Boot method for model events
     */
    protected static function boot()
    {
        parent::boot();
        
        static::saving(function ($item) {
            // Auto-calculate total price
            $subtotal = $item->quantity * $item->unit_price;
            $discountAmount = $subtotal * (($item->discount_percentage ?? 0) / 100);
            $item->discount_amount = $discountAmount;
            $item->total_price = $subtotal - $discountAmount;
        });
        
        static::saved(function ($item) {
            // Recalculate quote totals
            $item->quote->calculateTotals();
        });
        
        static::deleted(function ($item) {
            // Recalculate quote totals
            $item->quote->calculateTotals();
        });
    }
}
