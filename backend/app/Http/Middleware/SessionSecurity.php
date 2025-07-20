<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class SessionSecurity
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Check for session hijacking
        if ($this->isSessionHijacked($request)) {
            Log::warning('Potential session hijacking detected', [
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'user_id' => Auth::id(),
                'session_id' => session()->getId()
            ]);
            
            // Invalidate session and logout user
            Auth::logout();
            session()->invalidate();
            session()->regenerateToken();
            
            return response()->json([
                'error' => 'Session security violation',
                'message' => 'Your session has been terminated for security reasons.'
            ], 401);
        }

        // Regenerate session ID periodically for authenticated users
        if (Auth::check() && $this->shouldRegenerateSession()) {
            session()->regenerate();
        }

        $response = $next($request);

        // Set secure session cookies
        if ($response instanceof \Illuminate\Http\Response) {
            $this->setSecureSessionCookies($response);
        }

        return $response;
    }

    /**
     * Check if session might be hijacked
     */
    private function isSessionHijacked(Request $request): bool
    {
        if (!Auth::check()) {
            return false;
        }

        $sessionKey = 'session_fingerprint_' . Auth::id();
        $storedFingerprint = session($sessionKey);
        $currentFingerprint = $this->generateFingerprint($request);

        // First time - store fingerprint
        if (!$storedFingerprint) {
            session([$sessionKey => $currentFingerprint]);
            return false;
        }

        // Check if fingerprint matches
        return $storedFingerprint !== $currentFingerprint;
    }

    /**
     * Generate session fingerprint
     */
    private function generateFingerprint(Request $request): string
    {
        $components = [
            $request->userAgent(),
            $request->header('Accept-Language'),
            $request->header('Accept-Encoding'),
            // Note: We don't include IP as it might change legitimately
        ];

        return hash('sha256', implode('|', array_filter($components)));
    }

    /**
     * Check if session should be regenerated
     */
    private function shouldRegenerateSession(): bool
    {
        $lastRegeneration = session('last_regeneration', 0);
        $regenerationInterval = 30 * 60; // 30 minutes

        return (time() - $lastRegeneration) > $regenerationInterval;
    }

    /**
     * Set secure session cookies
     */
    private function setSecureSessionCookies(Response $response): void
    {
        $sessionName = config('session.cookie');
        
        if ($sessionName && $response->headers->getCookies()) {
            foreach ($response->headers->getCookies() as $cookie) {
                if ($cookie->getName() === $sessionName) {
                    // Ensure session cookie is secure
                    $cookie->setSecure(true);
                    $cookie->setHttpOnly(true);
                    $cookie->setSameSite('Strict');
                }
            }
        }
    }
}
