<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class ApiRateLimit
{
    /**
     * Rate limit configurations
     */
    private const LIMITS = [
        'auth' => ['requests' => 5, 'window' => 60], // 5 requests per minute for auth endpoints
        'api' => ['requests' => 100, 'window' => 60], // 100 requests per minute for general API
        'upload' => ['requests' => 10, 'window' => 60], // 10 uploads per minute
        'search' => ['requests' => 50, 'window' => 60], // 50 searches per minute
    ];

    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $type = 'api'): Response
    {
        $identifier = $this->getIdentifier($request);
        $limit = self::LIMITS[$type] ?? self::LIMITS['api'];
        
        $key = "rate_limit:{$type}:{$identifier}";
        $current = Cache::get($key, 0);
        
        if ($current >= $limit['requests']) {
            Log::warning('Rate limit exceeded', [
                'type' => $type,
                'identifier' => $identifier,
                'current' => $current,
                'limit' => $limit['requests'],
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'url' => $request->fullUrl()
            ]);
            
            return response()->json([
                'error' => 'Rate limit exceeded',
                'message' => 'Too many requests. Please try again later.',
                'retry_after' => $limit['window']
            ], 429);
        }
        
        // Increment counter
        Cache::put($key, $current + 1, $limit['window']);
        
        $response = $next($request);
        
        // Add rate limit headers
        $response->headers->set('X-RateLimit-Limit', $limit['requests']);
        $response->headers->set('X-RateLimit-Remaining', max(0, $limit['requests'] - $current - 1));
        $response->headers->set('X-RateLimit-Reset', now()->addSeconds($limit['window'])->timestamp);
        
        return $response;
    }

    /**
     * Get unique identifier for rate limiting
     */
    private function getIdentifier(Request $request): string
    {
        // Use user ID if authenticated, otherwise use IP
        if ($request->user()) {
            return 'user:' . $request->user()->id;
        }
        
        return 'ip:' . $request->ip();
    }
}
