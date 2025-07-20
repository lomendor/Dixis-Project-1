<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductCostBreakdown extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'product_id',
        'producer_cost',
        'packaging_cost',
        'producer_profit_target',
        'platform_fee_percentage',
        'shipping_estimate',
        'taxes_estimate',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'producer_cost' => 'decimal:2',
        'packaging_cost' => 'decimal:2',
        'producer_profit_target' => 'decimal:2',
        'platform_fee_percentage' => 'decimal:2',
        'shipping_estimate' => 'decimal:2',
        'taxes_estimate' => 'decimal:2',
    ];

    /**
     * Get the product that owns the cost breakdown.
     */
    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
