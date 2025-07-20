<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProducerProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'business_name',
        'business_registration_number',
        'tax_number',
        'description',
        'specialties',
        'location_address',
        'location_city',
        'location_region',
        'location_postal_code',
        'location_lat',
        'location_lng',
        'website_url',
        'social_media',
        'farm_photos',
        'certification_documents',
        'verification_status',
        'verification_notes',
        'trust_level',
        'admin_notes',
        'verified_at',
        'verified_by',
        'payment_terms_days',
        'minimum_order_amount',
        'delivery_zones',
        'processing_time_days',
    ];

    protected $casts = [
        'specialties' => 'array',
        'social_media' => 'array',
        'farm_photos' => 'array',
        'certification_documents' => 'array',
        'delivery_zones' => 'array',
        'verified_at' => 'datetime',
        'minimum_order_amount' => 'decimal:2',
        'location_lat' => 'decimal:8',
        'location_lng' => 'decimal:8',
    ];

    /**
     * Get the user that owns the producer profile
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the admin who verified this producer
     */
    public function verifier()
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    /**
     * Get the producer's subscription
     */
    public function subscription()
    {
        return $this->hasOne(UserSubscription::class, 'user_id', 'user_id')
            ->where('status', 'active');
    }

    /**
     * Scope for verified producers
     */
    public function scopeVerified($query)
    {
        return $query->where('verification_status', 'verified');
    }

    /**
     * Scope for pending verification
     */
    public function scopePending($query)
    {
        return $query->where('verification_status', 'pending');
    }

    /**
     * Get display status
     */
    public function getDisplayStatusAttribute()
    {
        $statuses = [
            'pending' => 'Αναμονή Έγκρισης',
            'verified' => 'Εγκεκριμένος',
            'rejected' => 'Απορρίφθηκε',
        ];

        return $statuses[$this->verification_status] ?? $this->verification_status;
    }

    /**
     * Get trust level display
     */
    public function getTrustLevelDisplayAttribute()
    {
        $levels = [
            'new' => 'Νέος Παραγωγός',
            'trusted' => 'Έμπιστος Παραγωγός',
            'premium' => 'Premium Παραγωγός',
        ];

        return $levels[$this->trust_level] ?? $this->trust_level;
    }

    /**
     * Get commission rate based on subscription
     */
    public function getCommissionRateAttribute()
    {
        if ($this->subscription && $this->subscription->tier) {
            return $this->subscription->tier->commission_rate;
        }

        return 12.00; // Default rate without subscription
    }
}