<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TenantTheme extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'primary_color',
        'secondary_color',
        'accent_color',
        'background_color',
        'text_color',
        'font_family',
        'logo_url',
        'favicon_url',
        'custom_css',
        'settings'
    ];

    protected $casts = [
        'settings' => 'array',
    ];

    /**
     * Get the tenant that owns this theme
     */
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    /**
     * Get available font families
     */
    public static function getAvailableFonts(): array
    {
        return [
            'Inter' => 'Inter',
            'Roboto' => 'Roboto',
            'Open Sans' => 'Open Sans',
            'Lato' => 'Lato',
            'Montserrat' => 'Montserrat',
            'Poppins' => 'Poppins',
            'Source Sans Pro' => 'Source Sans Pro',
            'Nunito' => 'Nunito',
            'Raleway' => 'Raleway',
            'Ubuntu' => 'Ubuntu'
        ];
    }

    /**
     * Get predefined color schemes
     */
    public static function getColorSchemes(): array
    {
        return [
            'green' => [
                'name' => 'Dixis Green',
                'primary_color' => '#16a34a',
                'secondary_color' => '#059669',
                'accent_color' => '#10b981',
                'background_color' => '#ffffff',
                'text_color' => '#1f2937'
            ],
            'blue' => [
                'name' => 'Ocean Blue',
                'primary_color' => '#2563eb',
                'secondary_color' => '#1d4ed8',
                'accent_color' => '#3b82f6',
                'background_color' => '#ffffff',
                'text_color' => '#1f2937'
            ],
            'purple' => [
                'name' => 'Royal Purple',
                'primary_color' => '#7c3aed',
                'secondary_color' => '#6d28d9',
                'accent_color' => '#8b5cf6',
                'background_color' => '#ffffff',
                'text_color' => '#1f2937'
            ],
            'orange' => [
                'name' => 'Sunset Orange',
                'primary_color' => '#ea580c',
                'secondary_color' => '#dc2626',
                'accent_color' => '#f97316',
                'background_color' => '#ffffff',
                'text_color' => '#1f2937'
            ],
            'teal' => [
                'name' => 'Fresh Teal',
                'primary_color' => '#0d9488',
                'secondary_color' => '#0f766e',
                'accent_color' => '#14b8a6',
                'background_color' => '#ffffff',
                'text_color' => '#1f2937'
            ],
            'dark' => [
                'name' => 'Dark Mode',
                'primary_color' => '#10b981',
                'secondary_color' => '#059669',
                'accent_color' => '#34d399',
                'background_color' => '#111827',
                'text_color' => '#f9fafb'
            ]
        ];
    }

    /**
     * Apply color scheme to theme
     */
    public function applyColorScheme(string $scheme): void
    {
        $schemes = self::getColorSchemes();
        
        if (!isset($schemes[$scheme])) {
            throw new \InvalidArgumentException("Color scheme '{$scheme}' not found");
        }
        
        $colors = $schemes[$scheme];
        
        $this->update([
            'primary_color' => $colors['primary_color'],
            'secondary_color' => $colors['secondary_color'],
            'accent_color' => $colors['accent_color'],
            'background_color' => $colors['background_color'],
            'text_color' => $colors['text_color']
        ]);
    }

    /**
     * Generate CSS variables for the theme
     */
    public function generateCssVariables(): string
    {
        $css = ":root {\n";
        $css .= "  --color-primary: {$this->primary_color};\n";
        $css .= "  --color-secondary: {$this->secondary_color};\n";
        $css .= "  --color-accent: {$this->accent_color};\n";
        $css .= "  --color-background: {$this->background_color};\n";
        $css .= "  --color-text: {$this->text_color};\n";
        $css .= "  --font-family: '{$this->font_family}', sans-serif;\n";
        $css .= "}\n\n";
        
        // Add custom CSS if provided
        if ($this->custom_css) {
            $css .= $this->custom_css;
        }
        
        return $css;
    }

    /**
     * Get theme configuration for frontend
     */
    public function getThemeConfig(): array
    {
        return [
            'colors' => [
                'primary' => $this->primary_color,
                'secondary' => $this->secondary_color,
                'accent' => $this->accent_color,
                'background' => $this->background_color,
                'text' => $this->text_color
            ],
            'typography' => [
                'fontFamily' => $this->font_family
            ],
            'branding' => [
                'logoUrl' => $this->logo_url,
                'faviconUrl' => $this->favicon_url
            ],
            'customCss' => $this->custom_css,
            'settings' => $this->settings ?? []
        ];
    }

    /**
     * Validate color format
     */
    public static function isValidColor(string $color): bool
    {
        return preg_match('/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/', $color);
    }

    /**
     * Upload and store logo
     */
    public function uploadLogo($file): string
    {
        $filename = 'tenant-' . $this->tenant_id . '-logo-' . time() . '.' . $file->getClientOriginalExtension();
        $path = $file->storeAs('tenant-themes/logos', $filename, 'public');
        
        $this->update(['logo_url' => '/storage/' . $path]);
        
        return $this->logo_url;
    }

    /**
     * Upload and store favicon
     */
    public function uploadFavicon($file): string
    {
        $filename = 'tenant-' . $this->tenant_id . '-favicon-' . time() . '.' . $file->getClientOriginalExtension();
        $path = $file->storeAs('tenant-themes/favicons', $filename, 'public');
        
        $this->update(['favicon_url' => '/storage/' . $path]);
        
        return $this->favicon_url;
    }

    /**
     * Get default settings
     */
    public static function getDefaultSettings(): array
    {
        return [
            'show_branding' => true,
            'custom_footer' => false,
            'social_links' => [
                'facebook' => '',
                'instagram' => '',
                'twitter' => '',
                'linkedin' => ''
            ],
            'contact_info' => [
                'email' => '',
                'phone' => '',
                'address' => ''
            ],
            'seo' => [
                'meta_title' => '',
                'meta_description' => '',
                'meta_keywords' => ''
            ],
            'features' => [
                'show_producer_info' => true,
                'show_reviews' => true,
                'show_related_products' => true,
                'enable_wishlist' => true,
                'enable_compare' => false
            ]
        ];
    }

    /**
     * Merge settings with defaults
     */
    public function getSettings(): array
    {
        $defaults = self::getDefaultSettings();
        $current = $this->settings ?? [];
        
        return array_merge_recursive($defaults, $current);
    }

    /**
     * Update specific setting
     */
    public function updateSetting(string $key, $value): void
    {
        $settings = $this->getSettings();
        
        // Support dot notation for nested keys
        $keys = explode('.', $key);
        $current = &$settings;
        
        foreach ($keys as $k) {
            if (!isset($current[$k])) {
                $current[$k] = [];
            }
            $current = &$current[$k];
        }
        
        $current = $value;
        
        $this->update(['settings' => $settings]);
    }

    /**
     * Get specific setting value
     */
    public function getSetting(string $key, $default = null)
    {
        $settings = $this->getSettings();
        
        // Support dot notation for nested keys
        $keys = explode('.', $key);
        $current = $settings;
        
        foreach ($keys as $k) {
            if (!isset($current[$k])) {
                return $default;
            }
            $current = $current[$k];
        }
        
        return $current;
    }

    /**
     * Boot method for model events
     */
    protected static function boot()
    {
        parent::boot();
        
        static::saving(function ($theme) {
            // Validate colors before saving
            $colorFields = ['primary_color', 'secondary_color', 'accent_color', 'background_color', 'text_color'];
            
            foreach ($colorFields as $field) {
                if ($theme->$field && !self::isValidColor($theme->$field)) {
                    throw new \InvalidArgumentException("Invalid color format for {$field}: {$theme->$field}");
                }
            }
            
            // Ensure settings has default structure
            if (!$theme->settings) {
                $theme->settings = self::getDefaultSettings();
            }
        });
    }
}
