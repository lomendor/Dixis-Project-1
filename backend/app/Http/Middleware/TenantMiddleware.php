<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\Tenant;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\View;

class TenantMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $tenant = $this->resolveTenant($request);
        
        if (!$tenant) {
            // If no tenant found and this is a subdomain request, show tenant not found
            if ($this->isSubdomainRequest($request)) {
                return response()->json([
                    'error' => 'Tenant not found',
                    'message' => 'The requested tenant does not exist or is inactive.'
                ], 404);
            }
            
            // For main domain, continue without tenant context
            return $next($request);
        }
        
        // Check if tenant is active
        if (!$this->isTenantActive($tenant)) {
            return response()->json([
                'error' => 'Tenant inactive',
                'message' => 'This tenant is currently inactive or suspended.',
                'status' => $tenant->status
            ], 403);
        }
        
        // Set tenant context
        $this->setTenantContext($tenant, $request);
        
        return $next($request);
    }

    /**
     * Resolve tenant from request
     */
    protected function resolveTenant(Request $request): ?Tenant
    {
        $host = $request->getHost();
        
        // Try to find tenant by domain or subdomain
        $tenant = Tenant::findByDomain($host);
        
        if (!$tenant) {
            // Try to get tenant from header (for API requests)
            $tenantId = $request->header('X-Tenant-ID');
            if ($tenantId) {
                $tenant = Tenant::find($tenantId);
            }
        }
        
        if (!$tenant) {
            // Try to get tenant from query parameter (for development)
            $tenantSlug = $request->query('tenant');
            if ($tenantSlug) {
                $tenant = Tenant::where('slug', $tenantSlug)->first();
            }
        }
        
        return $tenant;
    }

    /**
     * Check if this is a subdomain request
     */
    protected function isSubdomainRequest(Request $request): bool
    {
        $host = $request->getHost();
        $mainDomain = config('app.domain', 'dixis.gr');
        
        // Check if host is a subdomain of main domain
        return $host !== $mainDomain && str_ends_with($host, '.' . $mainDomain);
    }

    /**
     * Check if tenant is active
     */
    protected function isTenantActive(Tenant $tenant): bool
    {
        if ($tenant->status === Tenant::STATUS_SUSPENDED) {
            return false;
        }
        
        if ($tenant->status === Tenant::STATUS_INACTIVE) {
            return false;
        }
        
        // Check if trial has expired
        if ($tenant->status === Tenant::STATUS_TRIAL && $tenant->trial_ends_at && $tenant->trial_ends_at->isPast()) {
            return false;
        }
        
        // Check if subscription has expired
        if ($tenant->status === Tenant::STATUS_ACTIVE && $tenant->isSubscriptionExpired()) {
            return false;
        }
        
        return true;
    }

    /**
     * Set tenant context for the application
     */
    protected function setTenantContext(Tenant $tenant, Request $request): void
    {
        // Store tenant in request
        $request->attributes->set('tenant', $tenant);
        
        // Set tenant in config for easy access
        Config::set('tenant.current', $tenant);
        
        // Share tenant with all views
        View::share('currentTenant', $tenant);
        
        // Set database connection prefix if using tenant-specific tables
        if (config('tenant.use_tenant_prefix', false)) {
            $this->setTenantDatabasePrefix($tenant);
        }
        
        // Set tenant-specific cache prefix
        $this->setTenantCachePrefix($tenant);
        
        // Load tenant theme if available
        if ($tenant->theme) {
            View::share('tenantTheme', $tenant->theme);
            Config::set('tenant.theme', $tenant->theme->getThemeConfig());
        }
    }

    /**
     * Set tenant-specific database table prefix
     */
    protected function setTenantDatabasePrefix(Tenant $tenant): void
    {
        $prefix = "tenant_{$tenant->id}_";
        
        Config::set('database.connections.tenant.prefix', $prefix);
        
        // Switch to tenant connection
        Config::set('database.default', 'tenant');
    }

    /**
     * Set tenant-specific cache prefix
     */
    protected function setTenantCachePrefix(Tenant $tenant): void
    {
        $prefix = "tenant_{$tenant->id}_";
        
        Config::set('cache.prefix', $prefix);
    }

    /**
     * Get current tenant from request
     */
    public static function getCurrentTenant(Request $request = null): ?Tenant
    {
        if (!$request) {
            $request = request();
        }
        
        return $request->attributes->get('tenant') ?? Config::get('tenant.current');
    }

    /**
     * Check if request has tenant context
     */
    public static function hasTenantContext(Request $request = null): bool
    {
        return self::getCurrentTenant($request) !== null;
    }

    /**
     * Get tenant theme configuration
     */
    public static function getTenantTheme(): ?array
    {
        return Config::get('tenant.theme');
    }

    /**
     * Middleware for API routes that require tenant context
     */
    public static function requireTenant(): string
    {
        return static::class . ':required';
    }

    /**
     * Handle tenant-required requests
     */
    public function handleRequired(Request $request, Closure $next): Response
    {
        $tenant = $this->resolveTenant($request);
        
        if (!$tenant) {
            return response()->json([
                'error' => 'Tenant required',
                'message' => 'This endpoint requires a valid tenant context.'
            ], 400);
        }
        
        if (!$this->isTenantActive($tenant)) {
            return response()->json([
                'error' => 'Tenant inactive',
                'message' => 'This tenant is currently inactive or suspended.',
                'status' => $tenant->status
            ], 403);
        }
        
        $this->setTenantContext($tenant, $request);
        
        return $next($request);
    }
}

/**
 * Helper function to get current tenant
 */
if (!function_exists('current_tenant')) {
    function current_tenant(): ?Tenant
    {
        return TenantMiddleware::getCurrentTenant();
    }
}

/**
 * Helper function to check if we have tenant context
 */
if (!function_exists('has_tenant_context')) {
    function has_tenant_context(): bool
    {
        return TenantMiddleware::hasTenantContext();
    }
}

/**
 * Helper function to get tenant theme
 */
if (!function_exists('tenant_theme')) {
    function tenant_theme(): ?array
    {
        return TenantMiddleware::getTenantTheme();
    }
}
