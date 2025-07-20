<?php

namespace App\Models\Invoice;

use App\Models\Order;
use App\Models\User;
use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Invoice extends Model
{
    use HasFactory, SoftDeletes, BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'order_id',
        'user_id',
        'invoice_number',
        'invoice_type',
        'status',
        'issue_date',
        'due_date',
        'paid_date',
        'subtotal',
        'tax_amount',
        'discount_amount',
        'total_amount',
        'currency',
        'payment_terms',
        'notes',
        'pdf_path',
        'pdf_url',
        'email_sent_at',
        'quickbooks_id',
        'xero_id',
        'created_by',
        'approved_by',
        'approved_at'
    ];

    protected $casts = [
        'issue_date' => 'date',
        'due_date' => 'date',
        'paid_date' => 'date',
        'subtotal' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'email_sent_at' => 'datetime',
        'approved_at' => 'datetime',
    ];

    // Invoice types
    const TYPE_STANDARD = 'standard';
    const TYPE_PROFORMA = 'proforma';
    const TYPE_CREDIT_NOTE = 'credit_note';
    const TYPE_DEBIT_NOTE = 'debit_note';

    // Invoice statuses
    const STATUS_DRAFT = 'draft';
    const STATUS_SENT = 'sent';
    const STATUS_VIEWED = 'viewed';
    const STATUS_PAID = 'paid';
    const STATUS_OVERDUE = 'overdue';
    const STATUS_CANCELLED = 'cancelled';
    const STATUS_REFUNDED = 'refunded';

    /**
     * Get the order that owns the invoice
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Get the user that owns the invoice
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the invoice items
     */
    public function items(): HasMany
    {
        return $this->hasMany(InvoiceItem::class);
    }

    /**
     * Get the invoice payments
     */
    public function payments(): HasMany
    {
        return $this->hasMany(InvoicePayment::class);
    }

    /**
     * Generate unique invoice number
     */
    public static function generateInvoiceNumber(): string
    {
        $year = date('Y');
        $month = date('m');
        
        // Get the last invoice number for this month
        $lastInvoice = self::whereYear('created_at', $year)
            ->whereMonth('created_at', $month)
            ->orderBy('id', 'desc')
            ->first();

        if ($lastInvoice && preg_match('/INV-(\d{4})(\d{2})-(\d{4})/', $lastInvoice->invoice_number, $matches)) {
            $sequence = intval($matches[3]) + 1;
        } else {
            $sequence = 1;
        }

        return sprintf('INV-%s%s-%04d', $year, $month, $sequence);
    }

    /**
     * Calculate Greek VAT (24%)
     */
    public function calculateGreekVAT(): float
    {
        $vatRate = 0.24; // 24% VAT for Greece
        return round($this->subtotal * $vatRate, 2);
    }

    /**
     * Calculate total with Greek tax
     */
    public function calculateTotal(): float
    {
        return round($this->subtotal + $this->tax_amount - $this->discount_amount, 2);
    }

    /**
     * Check if invoice is overdue
     */
    public function isOverdue(): bool
    {
        return $this->status !== self::STATUS_PAID && 
               $this->due_date && 
               $this->due_date->isPast();
    }

    /**
     * Get days until due or overdue
     */
    public function getDaysUntilDue(): int
    {
        if (!$this->due_date) {
            return 0;
        }

        return now()->diffInDays($this->due_date, false);
    }

    /**
     * Mark invoice as paid
     */
    public function markAsPaid(): void
    {
        $this->update([
            'status' => self::STATUS_PAID,
            'paid_date' => now()
        ]);
    }

    /**
     * Mark invoice as sent
     */
    public function markAsSent(): void
    {
        $this->update([
            'status' => self::STATUS_SENT,
            'email_sent_at' => now()
        ]);
    }

    /**
     * Get formatted invoice number for display
     */
    public function getFormattedNumberAttribute(): string
    {
        return $this->invoice_number;
    }

    /**
     * Get invoice status in Greek
     */
    public function getStatusInGreekAttribute(): string
    {
        $statuses = [
            self::STATUS_DRAFT => 'Πρόχειρο',
            self::STATUS_SENT => 'Απεσταλμένο',
            self::STATUS_VIEWED => 'Προβλήθηκε',
            self::STATUS_PAID => 'Πληρωμένο',
            self::STATUS_OVERDUE => 'Εκπρόθεσμο',
            self::STATUS_CANCELLED => 'Ακυρωμένο',
            self::STATUS_REFUNDED => 'Επιστροφή'
        ];

        return $statuses[$this->status] ?? $this->status;
    }

    /**
     * Boot method for model events
     */
    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($invoice) {
            if (!$invoice->invoice_number) {
                $invoice->invoice_number = self::generateInvoiceNumber();
            }
            
            if (!$invoice->currency) {
                $invoice->currency = 'EUR';
            }
            
            if (!$invoice->status) {
                $invoice->status = self::STATUS_DRAFT;
            }

            if (!$invoice->issue_date) {
                $invoice->issue_date = now();
            }

            if (!$invoice->due_date && $invoice->payment_terms) {
                $days = intval($invoice->payment_terms);
                $invoice->due_date = now()->addDays($days);
            }
        });
        
        static::saved(function ($invoice) {
            // Recalculate totals when items change
            if ($invoice->wasRecentlyCreated || $invoice->items()->exists()) {
                $invoice->recalculateTotals();
            }
        });
    }

    /**
     * Recalculate invoice totals from items
     */
    public function recalculateTotals(): void
    {
        $subtotal = $this->items()->sum(\DB::raw('quantity * unit_price'));
        $taxAmount = $this->calculateGreekVAT();
        $total = $this->calculateTotal();

        $this->update([
            'subtotal' => $subtotal,
            'tax_amount' => $taxAmount,
            'total_amount' => $total
        ]);
    }
}