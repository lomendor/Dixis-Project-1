<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class DatabaseOptimization
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $startTime = microtime(true);
        $startQueries = $this->getQueryCount();

        // Enable query logging for this request
        DB::enableQueryLog();

        $response = $next($request);

        $endTime = microtime(true);
        $endQueries = $this->getQueryCount();
        
        $executionTime = ($endTime - $startTime) * 1000; // Convert to milliseconds
        $queryCount = $endQueries - $startQueries;
        $queries = DB::getQueryLog();

        // Log slow requests
        if ($executionTime > 1000) { // Slower than 1 second
            Log::warning('Slow request detected', [
                'url' => $request->fullUrl(),
                'method' => $request->method(),
                'execution_time' => $executionTime,
                'query_count' => $queryCount,
                'memory_usage' => memory_get_peak_usage(true),
                'user_id' => auth()->id()
            ]);
        }

        // Log queries with high execution time
        foreach ($queries as $query) {
            if ($query['time'] > 100) { // Slower than 100ms
                Log::warning('Slow query detected', [
                    'sql' => $query['query'],
                    'bindings' => $query['bindings'],
                    'time' => $query['time'],
                    'url' => $request->fullUrl()
                ]);
            }
        }

        // Log requests with too many queries (N+1 problem)
        if ($queryCount > 20) {
            Log::warning('High query count detected (possible N+1 problem)', [
                'url' => $request->fullUrl(),
                'method' => $request->method(),
                'query_count' => $queryCount,
                'queries' => array_slice($queries, 0, 5) // Log first 5 queries
            ]);
        }

        // Add performance headers for debugging
        if (config('app.debug')) {
            $response->headers->set('X-Query-Count', $queryCount);
            $response->headers->set('X-Execution-Time', round($executionTime, 2));
            $response->headers->set('X-Memory-Usage', memory_get_peak_usage(true));
        }

        // Clear query log to prevent memory leaks
        DB::flushQueryLog();

        return $response;
    }

    /**
     * Get current query count
     */
    private function getQueryCount(): int
    {
        return count(DB::getQueryLog());
    }
}
