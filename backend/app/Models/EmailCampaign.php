<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EmailCampaign extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'subject',
        'template_id',
        'segment',
        'schedule_type',
        'scheduled_at',
        'sent_at',
        'content_variables',
        'status',
        'total_recipients',
        'created_by'
    ];

    protected $casts = [
        'content_variables' => 'array',
        'scheduled_at' => 'datetime',
        'sent_at' => 'datetime'
    ];

    /**
     * Get the template associated with the campaign
     */
    public function template(): BelongsTo
    {
        return $this->belongsTo(EmailTemplate::class, 'template_id');
    }

    /**
     * Get the user who created the campaign
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the campaign statistics
     */
    public function stats(): HasOne
    {
        return $this->hasOne(EmailCampaignStat::class, 'campaign_id');
    }

    /**
     * Get the campaign events
     */
    public function events(): HasMany
    {
        return $this->hasMany(EmailCampaignEvent::class, 'campaign_id');
    }

    /**
     * Scope for active campaigns
     */
    public function scopeActive($query)
    {
        return $query->whereIn('status', ['scheduled', 'sending', 'sent']);
    }

    /**
     * Scope for scheduled campaigns
     */
    public function scopeScheduled($query)
    {
        return $query->where('status', 'scheduled');
    }

    /**
     * Scope for sent campaigns
     */
    public function scopeSent($query)
    {
        return $query->where('status', 'sent');
    }

    /**
     * Get campaigns ready to send
     */
    public function scopeReadyToSend($query)
    {
        return $query->where('status', 'scheduled')
                    ->where('scheduled_at', '<=', now());
    }

    /**
     * Check if campaign can be edited
     */
    public function canBeEdited(): bool
    {
        return in_array($this->status, ['draft', 'scheduled']);
    }

    /**
     * Check if campaign can be sent
     */
    public function canBeSent(): bool
    {
        return in_array($this->status, ['draft', 'scheduled']);
    }

    /**
     * Check if campaign is completed
     */
    public function isCompleted(): bool
    {
        return $this->status === 'sent';
    }

    /**
     * Get the open rate for this campaign
     */
    public function getOpenRateAttribute(): float
    {
        if (!$this->stats || $this->stats->total_sent == 0) {
            return 0;
        }

        return round(($this->stats->total_opened / $this->stats->total_sent) * 100, 2);
    }

    /**
     * Get the click rate for this campaign
     */
    public function getClickRateAttribute(): float
    {
        if (!$this->stats || $this->stats->total_sent == 0) {
            return 0;
        }

        return round(($this->stats->total_clicked / $this->stats->total_sent) * 100, 2);
    }

    /**
     * Get the bounce rate for this campaign
     */
    public function getBounceRateAttribute(): float
    {
        if (!$this->stats || $this->stats->total_sent == 0) {
            return 0;
        }

        return round(($this->stats->total_bounced / $this->stats->total_sent) * 100, 2);
    }

    /**
     * Get formatted status
     */
    public function getFormattedStatusAttribute(): string
    {
        $statuses = [
            'draft' => 'Πρόχειρο',
            'scheduled' => 'Προγραμματισμένο',
            'sending' => 'Αποστολή',
            'sent' => 'Στάλθηκε',
            'cancelled' => 'Ακυρώθηκε',
            'failed' => 'Αποτυχία'
        ];

        return $statuses[$this->status] ?? $this->status;
    }

    /**
     * Get formatted segment
     */
    public function getFormattedSegmentAttribute(): string
    {
        $segments = [
            'all' => 'Όλοι οι εγγεγραμμένοι',
            'customers' => 'Πελάτες',
            'producers' => 'Παραγωγοί',
            'b2b' => 'B2B Πελάτες',
            'inactive' => 'Ανενεργοί χρήστες'
        ];

        return $segments[$this->segment] ?? $this->segment;
    }

    /**
     * Get performance score (0-100)
     */
    public function getPerformanceScoreAttribute(): int
    {
        if (!$this->stats) {
            return 0;
        }

        $openWeight = 0.4;
        $clickWeight = 0.4;
        $bounceWeight = 0.2;

        $openScore = min($this->open_rate / 25 * 100, 100); // 25% open rate = 100 points
        $clickScore = min($this->click_rate / 5 * 100, 100); // 5% click rate = 100 points
        $bounceScore = max(100 - ($this->bounce_rate / 10 * 100), 0); // 10% bounce rate = 0 points

        return round(
            ($openScore * $openWeight) + 
            ($clickScore * $clickWeight) + 
            ($bounceScore * $bounceWeight)
        );
    }

    /**
     * Get estimated send time
     */
    public function getEstimatedSendTimeAttribute(): ?string
    {
        if (!$this->total_recipients) {
            return null;
        }

        // Estimate 100 emails per minute
        $minutes = ceil($this->total_recipients / 100);
        
        if ($minutes < 60) {
            return "{$minutes} λεπτά";
        }
        
        $hours = floor($minutes / 60);
        $remainingMinutes = $minutes % 60;
        
        if ($hours == 1) {
            return $remainingMinutes > 0 ? "1 ώρα και {$remainingMinutes} λεπτά" : "1 ώρα";
        }
        
        return $remainingMinutes > 0 ? "{$hours} ώρες και {$remainingMinutes} λεπτά" : "{$hours} ώρες";
    }
}
