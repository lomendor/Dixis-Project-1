<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use App\Models\Security\ApiKey;
use Symfony\Component\HttpFoundation\Response;

class ApiKeyAuthentication
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Skip API key check for certain routes
        if ($this->shouldSkipApiKeyCheck($request)) {
            return $next($request);
        }

        $apiKey = $this->extractApiKey($request);

        if (!$apiKey) {
            return $this->unauthorizedResponse('API key required');
        }

        $keyData = $this->validateApiKey($apiKey);

        if (!$keyData) {
            return $this->unauthorizedResponse('Invalid API key');
        }

        // Check if API key is active
        if (!$keyData['is_active']) {
            return $this->unauthorizedResponse('API key is inactive');
        }

        // Check rate limits for this API key
        if (!$this->checkApiKeyRateLimit($keyData)) {
            return $this->rateLimitResponse();
        }

        // Add API key info to request
        $request->attributes->set('api_key_id', $keyData['id']);
        $request->attributes->set('api_key_name', $keyData['name']);
        $request->attributes->set('api_key_permissions', $keyData['permissions']);

        // Log API key usage
        $this->logApiKeyUsage($keyData, $request);

        return $next($request);
    }

    /**
     * Extract API key from request
     */
    private function extractApiKey(Request $request): ?string
    {
        // Check Authorization header (Bearer token)
        $authHeader = $request->header('Authorization');
        if ($authHeader && str_starts_with($authHeader, 'Bearer ')) {
            return substr($authHeader, 7);
        }

        // Check X-API-Key header
        $apiKeyHeader = $request->header('X-API-Key');
        if ($apiKeyHeader) {
            return $apiKeyHeader;
        }

        // Check query parameter (less secure, only for GET requests)
        if ($request->isMethod('GET')) {
            return $request->query('api_key');
        }

        return null;
    }

    /**
     * Validate API key and get key data
     */
    private function validateApiKey(string $apiKey): ?array
    {
        // Cache API key validation for performance
        $cacheKey = 'api_key:' . hash('sha256', $apiKey);
        
        return Cache::remember($cacheKey, 300, function () use ($apiKey) {
            $keyModel = ApiKey::where('key_hash', hash('sha256', $apiKey))
                ->where('is_active', true)
                ->where(function ($query) {
                    $query->whereNull('expires_at')
                          ->orWhere('expires_at', '>', now());
                })
                ->first();

            if (!$keyModel) {
                return null;
            }

            return [
                'id' => $keyModel->id,
                'name' => $keyModel->name,
                'is_active' => $keyModel->is_active,
                'permissions' => $keyModel->permissions ?? [],
                'rate_limit_per_minute' => $keyModel->rate_limit_per_minute,
                'rate_limit_per_hour' => $keyModel->rate_limit_per_hour,
                'rate_limit_per_day' => $keyModel->rate_limit_per_day,
                'user_id' => $keyModel->user_id
            ];
        });
    }

    /**
     * Check API key rate limits
     */
    private function checkApiKeyRateLimit(array $keyData): bool
    {
        $keyId = $keyData['id'];
        $now = now();

        // Check per-minute limit
        if ($keyData['rate_limit_per_minute']) {
            $minuteKey = "api_key_rate:{$keyId}:minute:" . $now->format('Y-m-d-H-i');
            $minuteCount = Cache::get($minuteKey, 0);
            
            if ($minuteCount >= $keyData['rate_limit_per_minute']) {
                return false;
            }
            
            Cache::put($minuteKey, $minuteCount + 1, 60);
        }

        // Check per-hour limit
        if ($keyData['rate_limit_per_hour']) {
            $hourKey = "api_key_rate:{$keyId}:hour:" . $now->format('Y-m-d-H');
            $hourCount = Cache::get($hourKey, 0);
            
            if ($hourCount >= $keyData['rate_limit_per_hour']) {
                return false;
            }
            
            Cache::put($hourKey, $hourCount + 1, 3600);
        }

        // Check per-day limit
        if ($keyData['rate_limit_per_day']) {
            $dayKey = "api_key_rate:{$keyId}:day:" . $now->format('Y-m-d');
            $dayCount = Cache::get($dayKey, 0);
            
            if ($dayCount >= $keyData['rate_limit_per_day']) {
                return false;
            }
            
            Cache::put($dayKey, $dayCount + 1, 86400);
        }

        return true;
    }

    /**
     * Log API key usage for monitoring
     */
    private function logApiKeyUsage(array $keyData, Request $request): void
    {
        // Increment usage counter
        $usageKey = "api_key_usage:{$keyData['id']}:" . now()->format('Y-m-d');
        Cache::increment($usageKey, 1);
        Cache::expire($usageKey, 86400 * 7); // Keep for 7 days

        // Log detailed usage for monitoring
        Log::channel('api_usage')->info('API key usage', [
            'api_key_id' => $keyData['id'],
            'api_key_name' => $keyData['name'],
            'user_id' => $keyData['user_id'],
            'method' => $request->method(),
            'url' => $request->url(),
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'timestamp' => now()->toISOString()
        ]);
    }

    /**
     * Check if API key check should be skipped
     */
    private function shouldSkipApiKeyCheck(Request $request): bool
    {
        // Skip for certain public routes
        $publicRoutes = [
            'api/v1/health',
            'api/v1/products',
            'api/v1/categories',
            'api/v1/producers',
            'api/stripe/webhook'
        ];

        $path = $request->path();
        
        foreach ($publicRoutes as $route) {
            if (str_starts_with($path, $route)) {
                return true;
            }
        }

        // Skip if API key requirement is disabled
        if (!config('security.api.api_key_required', false)) {
            return true;
        }

        // Skip if user is already authenticated via Sanctum
        if ($request->user()) {
            return true;
        }

        return false;
    }

    /**
     * Return unauthorized response
     */
    private function unauthorizedResponse(string $message): Response
    {
        return response()->json([
            'error' => 'Unauthorized',
            'message' => $message,
            'code' => 'API_KEY_REQUIRED'
        ], 401);
    }

    /**
     * Return rate limit response
     */
    private function rateLimitResponse(): Response
    {
        return response()->json([
            'error' => 'Rate limit exceeded',
            'message' => 'API key rate limit exceeded. Please try again later.',
            'code' => 'API_KEY_RATE_LIMIT'
        ], 429);
    }
}