<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Log;

class InputValidation
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Sanitize input data
        $this->sanitizeInput($request);
        
        // Check for malicious patterns
        if ($this->containsMaliciousPatterns($request)) {
            Log::warning('Malicious input detected', [
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'url' => $request->fullUrl(),
                'input' => $request->all()
            ]);
            
            return response()->json([
                'error' => 'Invalid input detected',
                'message' => 'Your request contains invalid characters or patterns.'
            ], 400);
        }

        return $next($request);
    }

    /**
     * Sanitize input data
     */
    private function sanitizeInput(Request $request): void
    {
        $input = $request->all();
        
        array_walk_recursive($input, function (&$value) {
            if (is_string($value)) {
                // Remove null bytes
                $value = str_replace("\0", '', $value);
                
                // Trim whitespace
                $value = trim($value);
                
                // Remove control characters except newlines and tabs
                $value = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/', '', $value);
            }
        });
        
        $request->replace($input);
    }

    /**
     * Check for malicious patterns
     */
    private function containsMaliciousPatterns(Request $request): bool
    {
        $input = json_encode($request->all());
        
        // SQL Injection patterns
        $sqlPatterns = [
            '/(\bunion\b.*\bselect\b)/i',
            '/(\bselect\b.*\bfrom\b)/i',
            '/(\binsert\b.*\binto\b)/i',
            '/(\bdelete\b.*\bfrom\b)/i',
            '/(\bdrop\b.*\btable\b)/i',
            '/(\bupdate\b.*\bset\b)/i',
            '/(\'|\")(\s*)(or|and)(\s*)(\'|\")/i',
            '/(\bor\b|\band\b)(\s*)(\'|\")(\s*)(\d+)(\s*)(\'|\")/i'
        ];

        // XSS patterns
        $xssPatterns = [
            '/<script[^>]*>.*?<\/script>/is',
            '/<iframe[^>]*>.*?<\/iframe>/is',
            '/javascript:/i',
            '/on\w+\s*=/i',
            '/<object[^>]*>.*?<\/object>/is',
            '/<embed[^>]*>/i'
        ];

        // Path traversal patterns
        $pathTraversalPatterns = [
            '/\.\.\//',
            '/\.\.\\\\/',
            '/\.\.\%2f/i',
            '/\.\.\%5c/i'
        ];

        $allPatterns = array_merge($sqlPatterns, $xssPatterns, $pathTraversalPatterns);

        foreach ($allPatterns as $pattern) {
            if (preg_match($pattern, $input)) {
                return true;
            }
        }

        return false;
    }
}
