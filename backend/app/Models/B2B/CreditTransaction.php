<?php

namespace App\Models\B2B;

use App\Models\BusinessUser;
use App\Models\Order;
use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CreditTransaction extends Model
{
    use HasFactory, BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'business_user_id',
        'order_id',
        'type',
        'amount',
        'balance_before',
        'balance_after',
        'currency',
        'description',
        'reference',
        'processed_by'
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'balance_before' => 'decimal:2',
        'balance_after' => 'decimal:2'
    ];

    // Transaction types
    const TYPE_CREDIT = 'credit';           // Increase available credit
    const TYPE_DEBIT = 'debit';             // Decrease available credit
    const TYPE_HOLD = 'hold';               // Hold credit for pending order
    const TYPE_RELEASE = 'release';         // Release held credit
    const TYPE_CHARGE = 'charge';           // Charge for completed order
    const TYPE_REFUND = 'refund';           // Refund for cancelled order
    const TYPE_ADJUSTMENT = 'adjustment';    // Manual adjustment

    /**
     * Get the business user that owns this transaction
     */
    public function businessUser(): BelongsTo
    {
        return $this->belongsTo(BusinessUser::class);
    }

    /**
     * Get the order related to this transaction
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Get transaction type in Greek
     */
    public function getTypeInGreekAttribute(): string
    {
        $types = [
            self::TYPE_CREDIT => 'Πίστωση',
            self::TYPE_DEBIT => 'Χρέωση',
            self::TYPE_HOLD => 'Δέσμευση',
            self::TYPE_RELEASE => 'Απελευθέρωση',
            self::TYPE_CHARGE => 'Χρέωση Παραγγελίας',
            self::TYPE_REFUND => 'Επιστροφή',
            self::TYPE_ADJUSTMENT => 'Προσαρμογή'
        ];

        return $types[$this->type] ?? $this->type;
    }

    /**
     * Check if transaction increases credit
     */
    public function isCredit(): bool
    {
        return in_array($this->type, [self::TYPE_CREDIT, self::TYPE_RELEASE, self::TYPE_REFUND]);
    }

    /**
     * Check if transaction decreases credit
     */
    public function isDebit(): bool
    {
        return in_array($this->type, [self::TYPE_DEBIT, self::TYPE_HOLD, self::TYPE_CHARGE]);
    }
}