<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

class ApiResponseCache
{
    /**
     * Handle an incoming request and implement intelligent API response caching.
     * 
     * Optimizes API performance by caching responses based on request patterns.
     * Target: <200ms response time for cached endpoints.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  $ttl Cache TTL in minutes (default: 5)
     * @param  string  $tags Cache tags for invalidation (comma-separated)
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function handle(Request $request, Closure $next, string $ttl = '5', string $tags = ''): SymfonyResponse
    {
        // Only cache GET requests
        if ($request->method() !== 'GET') {
            return $next($request);
        }

        // Skip caching for authenticated admin requests
        if ($request->user() && $request->user()->hasRole('admin')) {
            return $next($request);
        }

        // Generate cache key based on request
        $cacheKey = $this->generateCacheKey($request);
        
        // Parse cache tags
        $cacheTags = $this->parseCacheTags($tags);
        
        // Try to get cached response
        $cachedResponse = $this->getCachedResponse($cacheKey, $cacheTags);
        
        if ($cachedResponse) {
            // Add cache headers
            return $this->addCacheHeaders($cachedResponse, true);
        }

        // Process request
        $response = $next($request);

        // Only cache successful responses
        if ($response->getStatusCode() === 200) {
            $this->cacheResponse($cacheKey, $response, (int)$ttl, $cacheTags);
        }

        return $this->addCacheHeaders($response, false);
    }

    /**
     * Generate a unique cache key for the request.
     */
    private function generateCacheKey(Request $request): string
    {
        $key = 'api_cache:' . md5(
            $request->getPathInfo() . 
            '?' . http_build_query($request->query()) .
            ':user:' . ($request->user() ? $request->user()->id : 'guest')
        );

        return $key;
    }

    /**
     * Parse cache tags from middleware parameter.
     */
    private function parseCacheTags(string $tags): array
    {
        if (empty($tags)) {
            return [];
        }

        return array_map('trim', explode(',', $tags));
    }

    /**
     * Get cached response if available.
     */
    private function getCachedResponse(string $cacheKey, array $tags): ?Response
    {
        try {
            if (empty($tags)) {
                $cached = Cache::get($cacheKey);
            } else {
                $cached = Cache::tags($tags)->get($cacheKey);
            }

            if ($cached) {
                Log::debug('API Cache Hit', ['key' => $cacheKey, 'tags' => $tags]);
                
                return new Response(
                    $cached['content'],
                    $cached['status'],
                    $cached['headers']
                );
            }
        } catch (\Exception $e) {
            Log::warning('API Cache Read Error', [
                'key' => $cacheKey,
                'error' => $e->getMessage()
            ]);
        }

        return null;
    }

    /**
     * Cache the response.
     */
    private function cacheResponse(string $cacheKey, SymfonyResponse $response, int $ttl, array $tags): void
    {
        try {
            $cacheData = [
                'content' => $response->getContent(),
                'status' => $response->getStatusCode(),
                'headers' => $response->headers->all(),
                'cached_at' => now()->toISOString()
            ];

            if (empty($tags)) {
                Cache::put($cacheKey, $cacheData, now()->addMinutes($ttl));
            } else {
                Cache::tags($tags)->put($cacheKey, $cacheData, now()->addMinutes($ttl));
            }

            Log::debug('API Cache Store', [
                'key' => $cacheKey,
                'ttl' => $ttl,
                'tags' => $tags,
                'size' => strlen($response->getContent())
            ]);

        } catch (\Exception $e) {
            Log::warning('API Cache Store Error', [
                'key' => $cacheKey,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Add cache-related headers to response.
     */
    private function addCacheHeaders(SymfonyResponse $response, bool $fromCache): SymfonyResponse
    {
        $response->headers->set('X-Cache', $fromCache ? 'HIT' : 'MISS');
        $response->headers->set('X-Cache-Time', now()->toISOString());
        
        if ($fromCache) {
            $response->headers->set('X-Cache-Source', 'Redis');
        }

        // Add ETag for conditional requests
        if ($response->getStatusCode() === 200) {
            $etag = md5($response->getContent());
            $response->headers->set('ETag', '"' . $etag . '"');
        }

        return $response;
    }

    /**
     * Static method to invalidate cache by tags.
     */
    public static function invalidateByTags(array $tags): void
    {
        try {
            Cache::tags($tags)->flush();
            Log::info('API Cache Invalidated', ['tags' => $tags]);
        } catch (\Exception $e) {
            Log::error('API Cache Invalidation Error', [
                'tags' => $tags,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Static method to invalidate specific cache key.
     */
    public static function invalidateKey(string $key): void
    {
        try {
            Cache::forget($key);
            Log::info('API Cache Key Invalidated', ['key' => $key]);
        } catch (\Exception $e) {
            Log::error('API Cache Key Invalidation Error', [
                'key' => $key,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Get cache statistics.
     */
    public static function getStats(): array
    {
        try {
            // This would require Redis-specific commands
            // For now, return basic info
            return [
                'driver' => config('cache.default'),
                'timestamp' => now()->toISOString(),
                'status' => 'active'
            ];
        } catch (\Exception $e) {
            return [
                'driver' => config('cache.default'),
                'timestamp' => now()->toISOString(),
                'status' => 'error',
                'error' => $e->getMessage()
            ];
        }
    }
}
