<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redis;
use Symfony\Component\HttpFoundation\Response;

class AdvancedRateLimit
{
    /**
     * Advanced rate limiting with multiple strategies
     */
    public function handle(Request $request, Closure $next, string $limiter = 'default'): Response
    {
        $identifier = $this->getIdentifier($request);
        $config = $this->getLimiterConfig($limiter);
        
        // Check if request should be rate limited
        if (!$this->shouldRateLimit($request, $config)) {
            return $next($request);
        }

        // Apply rate limiting strategies
        $strategies = [
            'sliding_window' => $this->checkSlidingWindow($identifier, $config),
            'token_bucket' => $this->checkTokenBucket($identifier, $config),
            'adaptive' => $this->checkAdaptiveLimit($identifier, $config, $request)
        ];

        foreach ($strategies as $strategy => $result) {
            if (!$result['allowed']) {
                return $this->rateLimitResponse($result, $strategy);
            }
        }

        $response = $next($request);

        // Record successful request
        $this->recordRequest($identifier, $config, $response);

        // Add rate limit headers
        $this->addRateLimitHeaders($response, $identifier, $config);

        return $response;
    }

    /**
     * Get rate limiter configuration
     */
    private function getLimiterConfig(string $limiter): array
    {
        $configs = [
            'default' => [
                'requests_per_minute' => 60,
                'requests_per_hour' => 1000,
                'burst_allowance' => 10,
                'adaptive_enabled' => true,
                'token_bucket_size' => 100,
                'token_refill_rate' => 1 // tokens per second
            ],
            'auth' => [
                'requests_per_minute' => 5,
                'requests_per_hour' => 50,
                'burst_allowance' => 2,
                'adaptive_enabled' => false,
                'token_bucket_size' => 10,
                'token_refill_rate' => 0.1
            ],
            'payment' => [
                'requests_per_minute' => 10,
                'requests_per_hour' => 100,
                'burst_allowance' => 3,
                'adaptive_enabled' => true,
                'token_bucket_size' => 20,
                'token_refill_rate' => 0.2
            ],
            'upload' => [
                'requests_per_minute' => 5,
                'requests_per_hour' => 50,
                'burst_allowance' => 1,
                'adaptive_enabled' => false,
                'token_bucket_size' => 10,
                'token_refill_rate' => 0.1
            ],
            'search' => [
                'requests_per_minute' => 30,
                'requests_per_hour' => 500,
                'burst_allowance' => 5,
                'adaptive_enabled' => true,
                'token_bucket_size' => 50,
                'token_refill_rate' => 0.5
            ],
            'b2b' => [
                'requests_per_minute' => 120,
                'requests_per_hour' => 2000,
                'burst_allowance' => 20,
                'adaptive_enabled' => true,
                'token_bucket_size' => 200,
                'token_refill_rate' => 2
            ]
        ];

        return $configs[$limiter] ?? $configs['default'];
    }

    /**
     * Sliding window rate limiting
     */
    private function checkSlidingWindow(string $identifier, array $config): array
    {
        $now = time();
        $windowSize = 60; // 1 minute window
        $key = "sliding_window:{$identifier}";

        // Get current window data
        $windowData = Cache::get($key, []);
        
        // Remove old entries outside the window
        $windowData = array_filter($windowData, function($timestamp) use ($now, $windowSize) {
            return ($now - $timestamp) < $windowSize;
        });

        $currentCount = count($windowData);
        $limit = $config['requests_per_minute'];

        if ($currentCount >= $limit) {
            return [
                'allowed' => false,
                'limit' => $limit,
                'remaining' => 0,
                'reset_time' => $now + $windowSize,
                'retry_after' => $windowSize
            ];
        }

        // Add current request timestamp
        $windowData[] = $now;
        Cache::put($key, $windowData, $windowSize);

        return [
            'allowed' => true,
            'limit' => $limit,
            'remaining' => $limit - count($windowData),
            'reset_time' => $now + $windowSize
        ];
    }

    /**
     * Token bucket rate limiting
     */
    private function checkTokenBucket(string $identifier, array $config): array
    {
        $key = "token_bucket:{$identifier}";
        $bucketSize = $config['token_bucket_size'];
        $refillRate = $config['token_refill_rate'];
        $now = microtime(true);

        // Get current bucket state
        $bucket = Cache::get($key, [
            'tokens' => $bucketSize,
            'last_refill' => $now
        ]);

        // Calculate tokens to add based on time elapsed
        $timePassed = $now - $bucket['last_refill'];
        $tokensToAdd = $timePassed * $refillRate;
        $bucket['tokens'] = min($bucketSize, $bucket['tokens'] + $tokensToAdd);
        $bucket['last_refill'] = $now;

        if ($bucket['tokens'] < 1) {
            $retryAfter = (1 - $bucket['tokens']) / $refillRate;
            
            return [
                'allowed' => false,
                'limit' => $bucketSize,
                'remaining' => floor($bucket['tokens']),
                'retry_after' => ceil($retryAfter)
            ];
        }

        // Consume one token
        $bucket['tokens'] -= 1;
        Cache::put($key, $bucket, 3600); // Cache for 1 hour

        return [
            'allowed' => true,
            'limit' => $bucketSize,
            'remaining' => floor($bucket['tokens'])
        ];
    }

    /**
     * Adaptive rate limiting based on system load and user behavior
     */
    private function checkAdaptiveLimit(string $identifier, array $config, Request $request): array
    {
        if (!$config['adaptive_enabled']) {
            return ['allowed' => true];
        }

        $adaptiveKey = "adaptive:{$identifier}";
        $systemLoadKey = "system_load";
        
        // Get user's recent behavior
        $userBehavior = Cache::get($adaptiveKey, [
            'error_rate' => 0,
            'avg_response_time' => 0,
            'suspicious_activity' => false
        ]);

        // Get system load
        $systemLoad = Cache::get($systemLoadKey, 0);

        // Calculate adaptive multiplier
        $multiplier = 1.0;

        // Reduce limit if high error rate
        if ($userBehavior['error_rate'] > 0.1) { // 10% error rate
            $multiplier *= 0.5;
        }

        // Reduce limit if system under high load
        if ($systemLoad > 0.8) { // 80% system load
            $multiplier *= 0.7;
        }

        // Reduce limit for suspicious activity
        if ($userBehavior['suspicious_activity']) {
            $multiplier *= 0.3;
        }

        // Apply adaptive limit
        $adaptiveLimit = floor($config['requests_per_minute'] * $multiplier);
        $adaptiveConfig = array_merge($config, ['requests_per_minute' => $adaptiveLimit]);

        return $this->checkSlidingWindow($identifier . ':adaptive', $adaptiveConfig);
    }

    /**
     * Record request for analytics and adaptive limiting
     */
    private function recordRequest(string $identifier, array $config, Response $response): void
    {
        $key = "request_analytics:{$identifier}";
        $analytics = Cache::get($key, [
            'total_requests' => 0,
            'error_count' => 0,
            'response_times' => [],
            'last_request' => null
        ]);

        $analytics['total_requests']++;
        $analytics['last_request'] = time();

        // Track errors
        if ($response->getStatusCode() >= 400) {
            $analytics['error_count']++;
        }

        // Calculate error rate
        $errorRate = $analytics['error_count'] / $analytics['total_requests'];

        // Update adaptive data
        $adaptiveKey = "adaptive:{$identifier}";
        Cache::put($adaptiveKey, [
            'error_rate' => $errorRate,
            'suspicious_activity' => $this->detectSuspiciousActivity($analytics)
        ], 3600);

        Cache::put($key, $analytics, 3600);
    }

    /**
     * Detect suspicious activity patterns
     */
    private function detectSuspiciousActivity(array $analytics): bool
    {
        // High error rate
        if ($analytics['error_count'] / max($analytics['total_requests'], 1) > 0.5) {
            return true;
        }

        // Too many requests in short time (potential bot)
        if ($analytics['total_requests'] > 1000) {
            return true;
        }

        return false;
    }

    /**
     * Get unique identifier for rate limiting
     */
    private function getIdentifier(Request $request): string
    {
        // Use API key if available
        $apiKeyId = $request->attributes->get('api_key_id');
        if ($apiKeyId) {
            return "api_key:{$apiKeyId}";
        }

        // Use user ID if authenticated
        if ($request->user()) {
            return "user:{$request->user()->id}";
        }

        // Use IP address with additional fingerprinting
        $ip = $request->ip();
        $userAgent = $request->userAgent();
        $fingerprint = substr(md5($userAgent), 0, 8);

        return "ip:{$ip}:fp:{$fingerprint}";
    }

    /**
     * Check if request should be rate limited
     */
    private function shouldRateLimit(Request $request, array $config): bool
    {
        // Skip rate limiting for certain conditions
        if ($request->user() && $request->user()->hasRole('admin')) {
            return false;
        }

        // Skip for health checks
        if (str_contains($request->path(), 'health')) {
            return false;
        }

        return true;
    }

    /**
     * Add rate limit headers to response
     */
    private function addRateLimitHeaders(Response $response, string $identifier, array $config): void
    {
        $slidingWindow = $this->checkSlidingWindow($identifier, $config);
        
        $response->headers->set('X-RateLimit-Limit', $config['requests_per_minute']);
        $response->headers->set('X-RateLimit-Remaining', $slidingWindow['remaining']);
        $response->headers->set('X-RateLimit-Reset', $slidingWindow['reset_time']);
        $response->headers->set('X-RateLimit-Strategy', 'advanced');
    }

    /**
     * Return rate limit exceeded response
     */
    private function rateLimitResponse(array $result, string $strategy): Response
    {
        Log::warning('Advanced rate limit exceeded', [
            'strategy' => $strategy,
            'limit' => $result['limit'] ?? 'unknown',
            'remaining' => $result['remaining'] ?? 0,
            'retry_after' => $result['retry_after'] ?? 60
        ]);

        $response = response()->json([
            'error' => 'Rate limit exceeded',
            'message' => 'Too many requests. Please try again later.',
            'strategy' => $strategy,
            'retry_after' => $result['retry_after'] ?? 60
        ], 429);

        // Add rate limit headers
        $response->headers->set('X-RateLimit-Limit', $result['limit'] ?? 'unknown');
        $response->headers->set('X-RateLimit-Remaining', $result['remaining'] ?? 0);
        $response->headers->set('Retry-After', $result['retry_after'] ?? 60);

        return $response;
    }
}