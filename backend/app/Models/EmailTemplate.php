<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EmailTemplate extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'type',
        'subject_template',
        'html_content',
        'text_content',
        'variables',
        'preview_image',
        'is_active',
        'created_by'
    ];

    protected $casts = [
        'variables' => 'array',
        'is_active' => 'boolean'
    ];

    /**
     * Get the user who created the template
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get campaigns using this template
     */
    public function campaigns(): HasMany
    {
        return $this->hasMany(EmailCampaign::class, 'template_id');
    }

    /**
     * Scope for active templates
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope by template type
     */
    public function scopeOfType($query, string $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Get formatted type
     */
    public function getFormattedTypeAttribute(): string
    {
        $types = [
            'newsletter' => 'Newsletter',
            'promotion' => 'Προσφορά',
            'seasonal' => 'Εποχιακό',
            'announcement' => 'Ανακοίνωση',
            'welcome' => 'Καλωσόρισμα',
            'abandoned_cart' => 'Εγκαταλελειμμένο Καλάθι',
            'product_recommendation' => 'Προτάσεις Προϊόντων',
            'order_confirmation' => 'Επιβεβαίωση Παραγγελίας',
            'shipping_notification' => 'Ειδοποίηση Αποστολής'
        ];

        return $types[$this->type] ?? $this->type;
    }

    /**
     * Get available variables for this template
     */
    public function getAvailableVariablesAttribute(): array
    {
        $defaultVariables = [
            'recipient_name' => 'Όνομα παραλήπτη',
            'recipient_email' => 'Email παραλήπτη',
            'company_name' => 'Όνομα εταιρείας',
            'company_logo' => 'Logo εταιρείας',
            'unsubscribe_url' => 'Σύνδεσμος απεγγραφής',
            'current_date' => 'Τρέχουσα ημερομηνία',
            'current_year' => 'Τρέχον έτος'
        ];

        return array_merge($defaultVariables, $this->variables ?? []);
    }

    /**
     * Replace variables in content
     */
    public function renderContent(array $variables = []): string
    {
        $content = $this->html_content;
        $allVariables = array_merge($this->getDefaultVariableValues(), $variables);

        foreach ($allVariables as $key => $value) {
            $content = str_replace("{{$key}}", $value, $content);
        }

        return $content;
    }

    /**
     * Replace variables in subject
     */
    public function renderSubject(array $variables = []): string
    {
        $subject = $this->subject_template;
        $allVariables = array_merge($this->getDefaultVariableValues(), $variables);

        foreach ($allVariables as $key => $value) {
            $subject = str_replace("{{$key}}", $value, $subject);
        }

        return $subject;
    }

    /**
     * Get default variable values
     */
    private function getDefaultVariableValues(): array
    {
        return [
            'company_name' => config('app.name', 'Dixis'),
            'company_logo' => asset('images/logo.png'),
            'current_date' => now()->format('d/m/Y'),
            'current_year' => now()->year,
            'support_email' => config('mail.from.address'),
            'website_url' => config('app.url')
        ];
    }

    /**
     * Generate preview with sample data
     */
    public function generatePreview(): string
    {
        $sampleVariables = [
            'recipient_name' => 'Γιάννης Παπαδόπουλος',
            'recipient_email' => 'giannis@example.com',
            'order_number' => 'DX-2024-001',
            'order_total' => '€45.50',
            'product_name' => 'Βιολογικό Ελαιόλαδο',
            'producer_name' => 'Αγρόκτημα Καλαμάτας',
            'discount_code' => 'WELCOME10',
            'discount_amount' => '10%'
        ];

        return $this->renderContent($sampleVariables);
    }

    /**
     * Validate template content
     */
    public function validateContent(): array
    {
        $errors = [];

        // Check for required elements
        if (!str_contains($this->html_content, '{{unsubscribe_url}}')) {
            $errors[] = 'Το template πρέπει να περιέχει σύνδεσμο απεγγραφής {{unsubscribe_url}}';
        }

        // Check for balanced HTML tags
        $openTags = preg_match_all('/<([a-z]+)(?:\s[^>]*)?>/', $this->html_content, $openMatches);
        $closeTags = preg_match_all('/<\/([a-z]+)>/', $this->html_content, $closeMatches);

        if ($openTags !== $closeTags) {
            $errors[] = 'Το HTML περιέχει μη ισορροπημένα tags';
        }

        // Check for undefined variables
        preg_match_all('/\{\{([^}]+)\}\}/', $this->html_content, $variableMatches);
        $usedVariables = $variableMatches[1];
        $availableVariables = array_keys($this->getAvailableVariablesAttribute());

        $undefinedVariables = array_diff($usedVariables, $availableVariables);
        if (!empty($undefinedVariables)) {
            $errors[] = 'Μη ορισμένες μεταβλητές: ' . implode(', ', $undefinedVariables);
        }

        return $errors;
    }

    /**
     * Clone template
     */
    public function cloneTemplate(string $newName): self
    {
        $clone = $this->replicate();
        $clone->name = $newName;
        $clone->is_active = false; // New clones start as inactive
        $clone->created_by = auth()->id();
        $clone->save();

        return $clone;
    }

    /**
     * Get usage statistics
     */
    public function getUsageStatsAttribute(): array
    {
        $campaigns = $this->campaigns();
        
        return [
            'total_campaigns' => $campaigns->count(),
            'active_campaigns' => $campaigns->whereIn('status', ['scheduled', 'sending'])->count(),
            'sent_campaigns' => $campaigns->where('status', 'sent')->count(),
            'total_recipients' => $campaigns->sum('total_recipients'),
            'last_used' => $campaigns->latest('created_at')->first()?->created_at
        ];
    }

    /**
     * Get performance metrics
     */
    public function getPerformanceMetricsAttribute(): array
    {
        $campaigns = $this->campaigns()->where('status', 'sent')->with('stats')->get();
        
        if ($campaigns->isEmpty()) {
            return [
                'average_open_rate' => 0,
                'average_click_rate' => 0,
                'average_bounce_rate' => 0,
                'total_opens' => 0,
                'total_clicks' => 0
            ];
        }

        $totalSent = $campaigns->sum(function ($campaign) {
            return $campaign->stats?->total_sent ?? 0;
        });

        $totalOpened = $campaigns->sum(function ($campaign) {
            return $campaign->stats?->total_opened ?? 0;
        });

        $totalClicked = $campaigns->sum(function ($campaign) {
            return $campaign->stats?->total_clicked ?? 0;
        });

        $totalBounced = $campaigns->sum(function ($campaign) {
            return $campaign->stats?->total_bounced ?? 0;
        });

        return [
            'average_open_rate' => $totalSent > 0 ? round(($totalOpened / $totalSent) * 100, 2) : 0,
            'average_click_rate' => $totalSent > 0 ? round(($totalClicked / $totalSent) * 100, 2) : 0,
            'average_bounce_rate' => $totalSent > 0 ? round(($totalBounced / $totalSent) * 100, 2) : 0,
            'total_opens' => $totalOpened,
            'total_clicks' => $totalClicked
        ];
    }
}
