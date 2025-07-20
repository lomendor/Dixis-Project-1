<?php

namespace App\Models\Invoice;

use App\Models\Product;
use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InvoiceItem extends Model
{
    use HasFactory, BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'invoice_id',
        'product_id',
        'description',
        'quantity',
        'unit_price',
        'discount_amount',
        'tax_rate',
        'tax_amount',
        'total_amount',
        'product_sku',
        'product_name',
        'unit_of_measure'
    ];

    protected $casts = [
        'quantity' => 'decimal:3',
        'unit_price' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'tax_rate' => 'decimal:4',
        'tax_amount' => 'decimal:2',
        'total_amount' => 'decimal:2',
    ];

    /**
     * Get the invoice that owns the item
     */
    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }

    /**
     * Get the product
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Calculate line total
     */
    public function calculateTotal(): float
    {
        $subtotal = $this->quantity * $this->unit_price;
        $afterDiscount = $subtotal - $this->discount_amount;
        return round($afterDiscount + $this->tax_amount, 2);
    }

    /**
     * Calculate Greek VAT for this item
     */
    public function calculateGreekVAT(): float
    {
        $vatRate = 0.24; // 24% VAT for Greece
        $subtotal = ($this->quantity * $this->unit_price) - $this->discount_amount;
        return round($subtotal * $vatRate, 2);
    }

    /**
     * Boot method for model events
     */
    protected static function boot()
    {
        parent::boot();
        
        static::saving(function ($item) {
            // Auto-calculate tax amount if not set
            if (!$item->tax_amount && $item->tax_rate) {
                $subtotal = ($item->quantity * $item->unit_price) - $item->discount_amount;
                $item->tax_amount = round($subtotal * ($item->tax_rate / 100), 2);
            }
            
            // Auto-calculate total
            $item->total_amount = $item->calculateTotal();
        });
    }
}