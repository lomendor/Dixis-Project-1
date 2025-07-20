<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmailCampaignStat extends Model
{
    use HasFactory;

    protected $fillable = [
        'campaign_id',
        'total_sent',
        'total_delivered',
        'total_opened',
        'total_clicked',
        'total_bounced',
        'total_unsubscribed',
        'total_spam_reports',
        'open_rate',
        'click_rate',
        'bounce_rate',
        'unsubscribe_rate',
        'spam_rate',
        'delivery_rate',
        'engagement_score',
        'last_updated'
    ];

    protected $casts = [
        'open_rate' => 'decimal:2',
        'click_rate' => 'decimal:2',
        'bounce_rate' => 'decimal:2',
        'unsubscribe_rate' => 'decimal:2',
        'spam_rate' => 'decimal:2',
        'delivery_rate' => 'decimal:2',
        'engagement_score' => 'decimal:2',
        'last_updated' => 'datetime'
    ];

    /**
     * Get the campaign that owns the stats
     */
    public function campaign(): BelongsTo
    {
        return $this->belongsTo(EmailCampaign::class);
    }

    /**
     * Calculate and update all rates
     */
    public function calculateRates(): void
    {
        if ($this->total_sent > 0) {
            $this->delivery_rate = round(($this->total_delivered / $this->total_sent) * 100, 2);
            $this->open_rate = round(($this->total_opened / $this->total_sent) * 100, 2);
            $this->click_rate = round(($this->total_clicked / $this->total_sent) * 100, 2);
            $this->bounce_rate = round(($this->total_bounced / $this->total_sent) * 100, 2);
            $this->unsubscribe_rate = round(($this->total_unsubscribed / $this->total_sent) * 100, 2);
            $this->spam_rate = round(($this->total_spam_reports / $this->total_sent) * 100, 2);
        } else {
            $this->delivery_rate = 0;
            $this->open_rate = 0;
            $this->click_rate = 0;
            $this->bounce_rate = 0;
            $this->unsubscribe_rate = 0;
            $this->spam_rate = 0;
        }

        $this->engagement_score = $this->calculateEngagementScore();
        $this->last_updated = now();
        $this->save();
    }

    /**
     * Calculate engagement score (0-100)
     */
    private function calculateEngagementScore(): float
    {
        // Weighted scoring system
        $openWeight = 0.3;
        $clickWeight = 0.5;
        $bounceWeight = 0.1;
        $spamWeight = 0.1;

        $openScore = min($this->open_rate / 25 * 100, 100); // 25% open rate = 100 points
        $clickScore = min($this->click_rate / 5 * 100, 100); // 5% click rate = 100 points
        $bounceScore = max(100 - ($this->bounce_rate / 10 * 100), 0); // 10% bounce rate = 0 points
        $spamScore = max(100 - ($this->spam_rate / 1 * 100), 0); // 1% spam rate = 0 points

        return round(
            ($openScore * $openWeight) + 
            ($clickScore * $clickWeight) + 
            ($bounceScore * $bounceWeight) + 
            ($spamScore * $spamWeight)
        );
    }

    /**
     * Get performance grade (A-F)
     */
    public function getPerformanceGradeAttribute(): string
    {
        $score = $this->engagement_score;

        if ($score >= 90) return 'A+';
        if ($score >= 80) return 'A';
        if ($score >= 70) return 'B';
        if ($score >= 60) return 'C';
        if ($score >= 50) return 'D';
        return 'F';
    }

    /**
     * Get performance status
     */
    public function getPerformanceStatusAttribute(): string
    {
        $score = $this->engagement_score;

        if ($score >= 80) return 'excellent';
        if ($score >= 60) return 'good';
        if ($score >= 40) return 'average';
        if ($score >= 20) return 'poor';
        return 'very_poor';
    }

    /**
     * Get formatted performance status
     */
    public function getFormattedPerformanceStatusAttribute(): string
    {
        $statuses = [
            'excellent' => 'Εξαιρετική',
            'good' => 'Καλή',
            'average' => 'Μέτρια',
            'poor' => 'Κακή',
            'very_poor' => 'Πολύ Κακή'
        ];

        return $statuses[$this->performance_status] ?? $this->performance_status;
    }

    /**
     * Get click-to-open rate
     */
    public function getClickToOpenRateAttribute(): float
    {
        if ($this->total_opened == 0) {
            return 0;
        }

        return round(($this->total_clicked / $this->total_opened) * 100, 2);
    }

    /**
     * Get effective reach (delivered emails)
     */
    public function getEffectiveReachAttribute(): int
    {
        return $this->total_delivered;
    }

    /**
     * Get engagement count (opens + clicks)
     */
    public function getEngagementCountAttribute(): int
    {
        return $this->total_opened + $this->total_clicked;
    }

    /**
     * Check if campaign performed above average
     */
    public function isAboveAverage(): bool
    {
        // Industry averages (approximate)
        $avgOpenRate = 21.33;
        $avgClickRate = 2.62;

        return $this->open_rate > $avgOpenRate && $this->click_rate > $avgClickRate;
    }

    /**
     * Get comparison with industry averages
     */
    public function getIndustryComparisonAttribute(): array
    {
        // Industry averages for agricultural/food sector
        $industryAverages = [
            'open_rate' => 21.33,
            'click_rate' => 2.62,
            'bounce_rate' => 0.63,
            'unsubscribe_rate' => 0.26
        ];

        return [
            'open_rate_diff' => round($this->open_rate - $industryAverages['open_rate'], 2),
            'click_rate_diff' => round($this->click_rate - $industryAverages['click_rate'], 2),
            'bounce_rate_diff' => round($this->bounce_rate - $industryAverages['bounce_rate'], 2),
            'unsubscribe_rate_diff' => round($this->unsubscribe_rate - $industryAverages['unsubscribe_rate'], 2),
            'overall_performance' => $this->isAboveAverage() ? 'above_average' : 'below_average'
        ];
    }

    /**
     * Get recommendations based on performance
     */
    public function getRecommendationsAttribute(): array
    {
        $recommendations = [];

        if ($this->open_rate < 15) {
            $recommendations[] = 'Βελτιώστε το θέμα του email για καλύτερα ποσοστά ανοίγματος';
        }

        if ($this->click_rate < 2) {
            $recommendations[] = 'Προσθέστε πιο ελκυστικά call-to-action buttons';
        }

        if ($this->bounce_rate > 2) {
            $recommendations[] = 'Καθαρίστε τη λίστα email από μη έγκυρες διευθύνσεις';
        }

        if ($this->unsubscribe_rate > 0.5) {
            $recommendations[] = 'Επανεξετάστε τη συχνότητα και το περιεχόμενο των emails';
        }

        if ($this->spam_rate > 0.1) {
            $recommendations[] = 'Βελτιώστε την αξιοπιστία του αποστολέα και το περιεχόμενο';
        }

        if (empty($recommendations)) {
            $recommendations[] = 'Εξαιρετική απόδοση! Συνεχίστε με την ίδια στρατηγική';
        }

        return $recommendations;
    }

    /**
     * Update specific metric
     */
    public function incrementMetric(string $metric, int $amount = 1): void
    {
        if (in_array($metric, $this->fillable)) {
            $this->increment($metric, $amount);
            $this->calculateRates();
        }
    }

    /**
     * Get time-based performance data
     */
    public function getTimeBasedPerformanceAttribute(): array
    {
        // This would typically come from detailed tracking data
        // For now, return sample data structure
        return [
            'hourly_opens' => [],
            'daily_clicks' => [],
            'peak_engagement_time' => '10:00',
            'engagement_duration' => '3 days'
        ];
    }
}
