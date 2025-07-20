<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\BelongsToTenant;

class Quote extends Model
{
    use HasFactory, SoftDeletes, BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'business_user_id',
        'quote_number',
        'title',
        'description',
        'status',
        'subtotal',
        'discount_amount',
        'discount_percentage',
        'tax_amount',
        'total_amount',
        'currency',
        'valid_until',
        'terms_and_conditions',
        'notes',
        'created_by',
        'approved_by',
        'approved_at',
        'converted_to_order_id'
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'discount_percentage' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'valid_until' => 'datetime',
        'approved_at' => 'datetime',
    ];

    // Status types
    const STATUS_DRAFT = 'draft';
    const STATUS_SENT = 'sent';
    const STATUS_VIEWED = 'viewed';
    const STATUS_ACCEPTED = 'accepted';
    const STATUS_REJECTED = 'rejected';
    const STATUS_EXPIRED = 'expired';
    const STATUS_CONVERTED = 'converted';

    /**
     * Get the business user that owns this quote
     */
    public function businessUser(): BelongsTo
    {
        return $this->belongsTo(BusinessUser::class);
    }

    /**
     * Get the user who created this quote
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the user who approved this quote
     */
    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Get the quote items
     */
    public function items(): HasMany
    {
        return $this->hasMany(QuoteItem::class);
    }

    /**
     * Get the converted order
     */
    public function convertedOrder(): BelongsTo
    {
        return $this->belongsTo(Order::class, 'converted_to_order_id');
    }

    /**
     * Scope for active quotes
     */
    public function scopeActive($query)
    {
        return $query->whereNotIn('status', [self::STATUS_EXPIRED, self::STATUS_CONVERTED]);
    }

    /**
     * Scope for pending quotes
     */
    public function scopePending($query)
    {
        return $query->whereIn('status', [self::STATUS_SENT, self::STATUS_VIEWED]);
    }

    /**
     * Scope for expired quotes
     */
    public function scopeExpired($query)
    {
        return $query->where('valid_until', '<', now())
                    ->where('status', '!=', self::STATUS_CONVERTED);
    }

    /**
     * Check if quote is expired
     */
    public function isExpired(): bool
    {
        return $this->valid_until && $this->valid_until->isPast() && 
               $this->status !== self::STATUS_CONVERTED;
    }

    /**
     * Check if quote can be accepted
     */
    public function canBeAccepted(): bool
    {
        return in_array($this->status, [self::STATUS_SENT, self::STATUS_VIEWED]) && 
               !$this->isExpired();
    }

    /**
     * Check if quote can be converted to order
     */
    public function canBeConverted(): bool
    {
        return $this->status === self::STATUS_ACCEPTED && !$this->isExpired();
    }

    /**
     * Generate quote number
     */
    public static function generateQuoteNumber(): string
    {
        $prefix = 'QT';
        $year = now()->year;
        $month = now()->format('m');
        
        $lastQuote = self::whereYear('created_at', $year)
                        ->whereMonth('created_at', now()->month)
                        ->orderBy('id', 'desc')
                        ->first();
        
        $sequence = $lastQuote ? 
            (int) substr($lastQuote->quote_number, -4) + 1 : 1;
        
        return sprintf('%s%s%s%04d', $prefix, $year, $month, $sequence);
    }

    /**
     * Calculate totals
     */
    public function calculateTotals(): void
    {
        $subtotal = $this->items()->sum(\DB::raw('quantity * unit_price'));
        
        // Apply business user discount
        $discountPercentage = $this->businessUser->getDiscountPercentage();
        $discountAmount = $subtotal * ($discountPercentage / 100);
        
        // Calculate tax (24% VAT in Greece)
        $taxableAmount = $subtotal - $discountAmount;
        $taxAmount = $taxableAmount * 0.24;
        
        $totalAmount = $taxableAmount + $taxAmount;
        
        $this->update([
            'subtotal' => $subtotal,
            'discount_percentage' => $discountPercentage,
            'discount_amount' => $discountAmount,
            'tax_amount' => $taxAmount,
            'total_amount' => $totalAmount
        ]);
    }

    /**
     * Send quote to business user
     */
    public function send(): void
    {
        $this->update([
            'status' => self::STATUS_SENT,
            'valid_until' => now()->addDays(30) // Valid for 30 days
        ]);
        
        // TODO: Send email notification
    }

    /**
     * Mark quote as viewed
     */
    public function markAsViewed(): void
    {
        if ($this->status === self::STATUS_SENT) {
            $this->update(['status' => self::STATUS_VIEWED]);
        }
    }

    /**
     * Accept quote
     */
    public function accept(): void
    {
        if ($this->canBeAccepted()) {
            $this->update([
                'status' => self::STATUS_ACCEPTED,
                'approved_at' => now()
            ]);
        }
    }

    /**
     * Reject quote
     */
    public function reject(string $reason = null): void
    {
        $this->update([
            'status' => self::STATUS_REJECTED,
            'notes' => $reason
        ]);
    }

    /**
     * Convert quote to order
     */
    public function convertToOrder(): Order
    {
        if (!$this->canBeConverted()) {
            throw new \Exception('Quote cannot be converted to order');
        }

        \DB::beginTransaction();
        
        try {
            // Create order
            $order = Order::create([
                'tenant_id' => $this->tenant_id,
                'user_id' => $this->businessUser->user_id,
                'business_user_id' => $this->business_user_id,
                'order_number' => Order::generateOrderNumber(),
                'status' => 'pending',
                'subtotal' => $this->subtotal,
                'discount_amount' => $this->discount_amount,
                'tax_amount' => $this->tax_amount,
                'total_amount' => $this->total_amount,
                'currency' => $this->currency,
                'payment_method' => 'credit', // B2B orders use credit terms
                'payment_status' => 'pending',
                'notes' => "Converted from quote #{$this->quote_number}"
            ]);

            // Copy quote items to order items
            foreach ($this->items as $quoteItem) {
                $order->items()->create([
                    'product_id' => $quoteItem->product_id,
                    'quantity' => $quoteItem->quantity,
                    'unit_price' => $quoteItem->unit_price,
                    'total_price' => $quoteItem->total_price,
                    'notes' => $quoteItem->notes
                ]);
            }

            // Update quote status
            $this->update([
                'status' => self::STATUS_CONVERTED,
                'converted_to_order_id' => $order->id
            ]);

            \DB::commit();
            
            return $order;
            
        } catch (\Exception $e) {
            \DB::rollBack();
            throw $e;
        }
    }

    /**
     * Mark expired quotes
     */
    public static function markExpiredQuotes(): int
    {
        return self::where('valid_until', '<', now())
                  ->whereNotIn('status', [self::STATUS_EXPIRED, self::STATUS_CONVERTED])
                  ->update(['status' => self::STATUS_EXPIRED]);
    }

    /**
     * Boot method for model events
     */
    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($quote) {
            if (!$quote->quote_number) {
                $quote->quote_number = self::generateQuoteNumber();
            }
            
            if (!$quote->currency) {
                $quote->currency = 'EUR';
            }
            
            if (!$quote->status) {
                $quote->status = self::STATUS_DRAFT;
            }
        });
        
        static::saved(function ($quote) {
            // Recalculate totals when items change
            if ($quote->wasRecentlyCreated || $quote->items()->exists()) {
                $quote->calculateTotals();
            }
        });
    }
}
