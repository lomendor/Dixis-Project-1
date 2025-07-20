<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Symfony\Component\HttpFoundation\Response;

class StripeRateLimit
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $type = 'payment_creation'): Response
    {
        $config = config("stripe.rate_limiting.{$type}", [
            'max_attempts' => 5,
            'decay_minutes' => 1,
        ]);
        
        $key = $this->resolveRequestSignature($request, $type);
        
        if (RateLimiter::tooManyAttempts($key, $config['max_attempts'])) {
            $seconds = RateLimiter::availableIn($key);
            
            return response()->json([
                'error' => 'Too many requests',
                'message' => 'Πάρα πολλές προσπάθειες. Παρακαλώ περιμένετε λίγα λεπτά.',
                'retry_after' => $seconds,
            ], 429);
        }
        
        RateLimiter::hit($key, $config['decay_minutes'] * 60);
        
        $response = $next($request);
        
        return $response->header('X-RateLimit-Limit', $config['max_attempts'])
                       ->header('X-RateLimit-Remaining', RateLimiter::remaining($key, $config['max_attempts']));
    }
    
    /**
     * Resolve request signature for rate limiting.
     */
    protected function resolveRequestSignature(Request $request, string $type): string
    {
        if ($request->user()) {
            return "stripe:{$type}:user:{$request->user()->id}";
        }
        
        return "stripe:{$type}:ip:{$request->ip()}";
    }
}