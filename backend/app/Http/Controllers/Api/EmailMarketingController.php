<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use App\Models\User;
use App\Models\EmailCampaign;
use App\Models\EmailTemplate;
use App\Models\EmailSubscriber;
use App\Models\EmailCampaignStat;
use App\Mail\NewsletterMail;
use App\Mail\ProductPromotionMail;
use App\Mail\SeasonalOfferMail;
use Carbon\Carbon;

class EmailMarketingController extends Controller
{
    /**
     * Get email marketing dashboard
     */
    public function getDashboard(): JsonResponse
    {
        $stats = [
            'total_subscribers' => EmailSubscriber::where('is_active', true)->count(),
            'total_campaigns' => EmailCampaign::count(),
            'campaigns_this_month' => EmailCampaign::whereMonth('created_at', now()->month)->count(),
            'average_open_rate' => $this->getAverageOpenRate(),
            'average_click_rate' => $this->getAverageClickRate(),
            'recent_campaigns' => $this->getRecentCampaigns(),
            'subscriber_growth' => $this->getSubscriberGrowth(),
            'top_performing_campaigns' => $this->getTopPerformingCampaigns()
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    /**
     * Create a new email campaign
     */
    public function createCampaign(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'subject' => 'required|string|max:255',
            'template_id' => 'required|exists:email_templates,id',
            'segment' => 'required|in:all,customers,producers,b2b,inactive',
            'schedule_type' => 'required|in:immediate,scheduled',
            'scheduled_at' => 'required_if:schedule_type,scheduled|nullable|date|after:now',
            'content_variables' => 'nullable|array'
        ]);

        $campaign = EmailCampaign::create([
            'name' => $request->name,
            'subject' => $request->subject,
            'template_id' => $request->template_id,
            'segment' => $request->segment,
            'schedule_type' => $request->schedule_type,
            'scheduled_at' => $request->scheduled_at,
            'content_variables' => $request->content_variables ?? [],
            'status' => $request->schedule_type === 'immediate' ? 'sending' : 'scheduled',
            'created_by' => auth()->id()
        ]);

        // If immediate, start sending
        if ($request->schedule_type === 'immediate') {
            $this->sendCampaign($campaign);
        }

        return response()->json([
            'success' => true,
            'message' => 'Η καμπάνια email δημιουργήθηκε επιτυχώς',
            'data' => $campaign
        ]);
    }

    /**
     * Send email campaign
     */
    public function sendCampaign(EmailCampaign $campaign): JsonResponse
    {
        if ($campaign->status !== 'scheduled' && $campaign->status !== 'draft') {
            return response()->json([
                'success' => false,
                'message' => 'Η καμπάνια δεν μπορεί να σταλεί'
            ], 400);
        }

        // Get recipients based on segment
        $recipients = $this->getRecipientsBySegment($campaign->segment);
        
        $campaign->update([
            'status' => 'sending',
            'sent_at' => now(),
            'total_recipients' => $recipients->count()
        ]);

        // Send emails in batches
        $recipients->chunk(100, function ($batch) use ($campaign) {
            foreach ($batch as $recipient) {
                $this->sendEmailToRecipient($campaign, $recipient);
            }
        });

        $campaign->update(['status' => 'sent']);

        return response()->json([
            'success' => true,
            'message' => 'Η καμπάνια στάλθηκε επιτυχώς',
            'recipients_count' => $recipients->count()
        ]);
    }

    /**
     * Get email templates
     */
    public function getTemplates(): JsonResponse
    {
        $templates = EmailTemplate::select('id', 'name', 'description', 'type', 'preview_image')
            ->where('is_active', true)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $templates
        ]);
    }

    /**
     * Create email template
     */
    public function createTemplate(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:newsletter,promotion,seasonal,announcement,welcome',
            'subject_template' => 'required|string',
            'html_content' => 'required|string',
            'text_content' => 'nullable|string',
            'variables' => 'nullable|array'
        ]);

        $template = EmailTemplate::create([
            'name' => $request->name,
            'description' => $request->description,
            'type' => $request->type,
            'subject_template' => $request->subject_template,
            'html_content' => $request->html_content,
            'text_content' => $request->text_content,
            'variables' => $request->variables ?? [],
            'created_by' => auth()->id()
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Το template δημιουργήθηκε επιτυχώς',
            'data' => $template
        ]);
    }

    /**
     * Subscribe user to newsletter
     */
    public function subscribe(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'name' => 'nullable|string|max:255',
            'preferences' => 'nullable|array'
        ]);

        $subscriber = EmailSubscriber::updateOrCreate(
            ['email' => $request->email],
            [
                'name' => $request->name,
                'preferences' => $request->preferences ?? [],
                'is_active' => true,
                'subscribed_at' => now(),
                'source' => 'website'
            ]
        );

        // Send welcome email
        $this->sendWelcomeEmail($subscriber);

        return response()->json([
            'success' => true,
            'message' => 'Εγγραφήκατε επιτυχώς στο newsletter!'
        ]);
    }

    /**
     * Unsubscribe user from newsletter
     */
    public function unsubscribe(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'token' => 'required|string'
        ]);

        $subscriber = EmailSubscriber::where('email', $request->email)
            ->where('unsubscribe_token', $request->token)
            ->first();

        if (!$subscriber) {
            return response()->json([
                'success' => false,
                'message' => 'Μη έγκυρος σύνδεσμος απεγγραφής'
            ], 400);
        }

        $subscriber->update([
            'is_active' => false,
            'unsubscribed_at' => now()
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Απεγγραφήκατε επιτυχώς από το newsletter'
        ]);
    }

    /**
     * Get campaign analytics
     */
    public function getCampaignAnalytics(EmailCampaign $campaign): JsonResponse
    {
        $stats = EmailCampaignStat::where('campaign_id', $campaign->id)->first();
        
        if (!$stats) {
            $stats = $this->calculateCampaignStats($campaign);
        }

        $analytics = [
            'campaign' => $campaign,
            'stats' => [
                'total_sent' => $stats->total_sent ?? 0,
                'total_delivered' => $stats->total_delivered ?? 0,
                'total_opened' => $stats->total_opened ?? 0,
                'total_clicked' => $stats->total_clicked ?? 0,
                'total_bounced' => $stats->total_bounced ?? 0,
                'total_unsubscribed' => $stats->total_unsubscribed ?? 0,
                'open_rate' => $stats->open_rate ?? 0,
                'click_rate' => $stats->click_rate ?? 0,
                'bounce_rate' => $stats->bounce_rate ?? 0,
                'unsubscribe_rate' => $stats->unsubscribe_rate ?? 0
            ],
            'timeline' => $this->getCampaignTimeline($campaign),
            'top_links' => $this->getTopClickedLinks($campaign),
            'geographic_data' => $this->getGeographicData($campaign)
        ];

        return response()->json([
            'success' => true,
            'data' => $analytics
        ]);
    }

    /**
     * Get automated email sequences
     */
    public function getAutomatedSequences(): JsonResponse
    {
        $sequences = [
            'welcome_series' => $this->getWelcomeSeriesStats(),
            'abandoned_cart' => $this->getAbandonedCartStats(),
            'product_recommendations' => $this->getProductRecommendationStats(),
            'seasonal_campaigns' => $this->getSeasonalCampaignStats()
        ];

        return response()->json([
            'success' => true,
            'data' => $sequences
        ]);
    }

    // Private helper methods

    private function getRecipientsBySegment(string $segment)
    {
        switch ($segment) {
            case 'all':
                return EmailSubscriber::where('is_active', true)->get();
            case 'customers':
                return EmailSubscriber::where('is_active', true)
                    ->whereHas('user', function ($q) {
                        $q->where('role', 'customer');
                    })->get();
            case 'producers':
                return EmailSubscriber::where('is_active', true)
                    ->whereHas('user', function ($q) {
                        $q->where('role', 'producer');
                    })->get();
            case 'b2b':
                return EmailSubscriber::where('is_active', true)
                    ->whereHas('user', function ($q) {
                        $q->where('role', 'b2b');
                    })->get();
            case 'inactive':
                return EmailSubscriber::where('is_active', true)
                    ->where('last_activity', '<', now()->subDays(30))
                    ->get();
            default:
                return collect();
        }
    }

    private function sendEmailToRecipient(EmailCampaign $campaign, EmailSubscriber $recipient)
    {
        try {
            $template = $campaign->template;
            $variables = array_merge($campaign->content_variables, [
                'recipient_name' => $recipient->name,
                'recipient_email' => $recipient->email,
                'unsubscribe_url' => route('newsletter.unsubscribe', [
                    'email' => $recipient->email,
                    'token' => $recipient->unsubscribe_token
                ])
            ]);

            // Replace variables in content
            $htmlContent = $this->replaceVariables($template->html_content, $variables);
            $subject = $this->replaceVariables($campaign->subject, $variables);

            Mail::to($recipient->email)->send(new NewsletterMail(
                $subject,
                $htmlContent,
                $campaign->id,
                $recipient->id
            ));

            // Track sending
            $this->trackEmailEvent($campaign->id, $recipient->id, 'sent');

        } catch (\Exception $e) {
            // Track bounce
            $this->trackEmailEvent($campaign->id, $recipient->id, 'bounced');
            \Log::error('Email sending failed: ' . $e->getMessage());
        }
    }

    private function replaceVariables(string $content, array $variables): string
    {
        foreach ($variables as $key => $value) {
            $content = str_replace("{{$key}}", $value, $content);
        }
        return $content;
    }

    private function trackEmailEvent(int $campaignId, int $recipientId, string $event)
    {
        // Implementation for tracking email events
        // This would typically use a dedicated email tracking service
    }

    private function sendWelcomeEmail(EmailSubscriber $subscriber)
    {
        $welcomeTemplate = EmailTemplate::where('type', 'welcome')->first();
        
        if ($welcomeTemplate) {
            Mail::to($subscriber->email)->send(new NewsletterMail(
                'Καλώς ήρθατε στο Dixis!',
                $welcomeTemplate->html_content,
                null,
                $subscriber->id
            ));
        }
    }

    private function getAverageOpenRate(): float
    {
        return EmailCampaignStat::avg('open_rate') ?? 0;
    }

    private function getAverageClickRate(): float
    {
        return EmailCampaignStat::avg('click_rate') ?? 0;
    }

    private function getRecentCampaigns()
    {
        return EmailCampaign::with('template')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();
    }

    private function getSubscriberGrowth()
    {
        return EmailSubscriber::selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->where('created_at', '>=', now()->subDays(30))
            ->groupBy('date')
            ->orderBy('date')
            ->get();
    }

    private function getTopPerformingCampaigns()
    {
        return EmailCampaign::join('email_campaign_stats', 'email_campaigns.id', '=', 'email_campaign_stats.campaign_id')
            ->orderBy('email_campaign_stats.open_rate', 'desc')
            ->limit(5)
            ->get();
    }

    private function calculateCampaignStats(EmailCampaign $campaign)
    {
        // Implementation for calculating campaign statistics
        // This would typically query email tracking data
        return new \stdClass();
    }

    private function getCampaignTimeline(EmailCampaign $campaign)
    {
        // Implementation for getting campaign timeline
        return [];
    }

    private function getTopClickedLinks(EmailCampaign $campaign)
    {
        // Implementation for getting top clicked links
        return [];
    }

    private function getGeographicData(EmailCampaign $campaign)
    {
        // Implementation for getting geographic data
        return [];
    }

    private function getWelcomeSeriesStats()
    {
        return [
            'total_sent' => 0,
            'completion_rate' => 0,
            'average_open_rate' => 0
        ];
    }

    private function getAbandonedCartStats()
    {
        return [
            'total_sent' => 0,
            'recovery_rate' => 0,
            'revenue_recovered' => 0
        ];
    }

    private function getProductRecommendationStats()
    {
        return [
            'total_sent' => 0,
            'click_through_rate' => 0,
            'conversion_rate' => 0
        ];
    }

    private function getSeasonalCampaignStats()
    {
        return [
            'active_campaigns' => 0,
            'average_performance' => 0,
            'seasonal_revenue' => 0
        ];
    }
}
