<?php

namespace App\Models\Invoice;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InvoicePayment extends Model
{
    use HasFactory, BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'invoice_id',
        'payment_method',
        'amount',
        'currency',
        'payment_date',
        'transaction_id',
        'reference_number',
        'notes',
        'status'
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'payment_date' => 'datetime',
    ];

    // Payment methods
    const METHOD_CASH = 'cash';
    const METHOD_BANK_TRANSFER = 'bank_transfer';
    const METHOD_CREDIT_CARD = 'credit_card';
    const METHOD_STRIPE = 'stripe';
    const METHOD_PAYPAL = 'paypal';

    // Payment statuses
    const STATUS_PENDING = 'pending';
    const STATUS_COMPLETED = 'completed';
    const STATUS_FAILED = 'failed';
    const STATUS_REFUNDED = 'refunded';

    /**
     * Get the invoice that owns the payment
     */
    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }

    /**
     * Get payment method in Greek
     */
    public function getMethodInGreekAttribute(): string
    {
        $methods = [
            self::METHOD_CASH => 'Μετρητά',
            self::METHOD_BANK_TRANSFER => 'Τραπεζική Μεταφορά',
            self::METHOD_CREDIT_CARD => 'Πιστωτική Κάρτα',
            self::METHOD_STRIPE => 'Stripe',
            self::METHOD_PAYPAL => 'PayPal'
        ];

        return $methods[$this->payment_method] ?? $this->payment_method;
    }
}