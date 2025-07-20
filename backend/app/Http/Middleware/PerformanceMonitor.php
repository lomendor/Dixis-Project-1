<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Symfony\Component\HttpFoundation\Response;

class PerformanceMonitor
{
    /**
     * Handle an incoming request and monitor performance metrics.
     * 
     * Tracks API response times, database queries, memory usage for optimization.
     * Target: Identify bottlenecks and maintain <200ms response time.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function handle(Request $request, Closure $next): Response
    {
        $startTime = microtime(true);
        $startMemory = memory_get_usage(true);
        $startQueries = $this->getQueryCount();

        // Enable query logging for this request
        DB::enableQueryLog();

        // Process the request
        $response = $next($request);

        // Calculate metrics
        $endTime = microtime(true);
        $endMemory = memory_get_usage(true);
        $endQueries = $this->getQueryCount();

        $metrics = [
            'request_id' => $this->generateRequestId(),
            'method' => $request->method(),
            'path' => $request->getPathInfo(),
            'status_code' => $response->getStatusCode(),
            'response_time_ms' => round(($endTime - $startTime) * 1000, 2),
            'memory_usage_mb' => round(($endMemory - $startMemory) / 1024 / 1024, 2),
            'peak_memory_mb' => round(memory_get_peak_usage(true) / 1024 / 1024, 2),
            'query_count' => $endQueries - $startQueries,
            'query_time_ms' => $this->calculateQueryTime(),
            'user_id' => $request->user() ? $request->user()->id : null,
            'user_role' => $request->user() ? $request->user()->role : 'guest',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'timestamp' => now()->toISOString(),
        ];

        // Add performance headers to response
        $this->addPerformanceHeaders($response, $metrics);

        // Log performance data
        $this->logPerformanceMetrics($metrics);

        // Store metrics for analytics
        $this->storeMetrics($metrics);

        // Check for performance alerts
        $this->checkPerformanceAlerts($metrics);

        return $response;
    }

    /**
     * Generate unique request ID for tracking.
     */
    private function generateRequestId(): string
    {
        return 'req_' . uniqid() . '_' . substr(md5(microtime()), 0, 8);
    }

    /**
     * Get current query count.
     */
    private function getQueryCount(): int
    {
        return count(DB::getQueryLog());
    }

    /**
     * Calculate total query execution time.
     */
    private function calculateQueryTime(): float
    {
        $queries = DB::getQueryLog();
        $totalTime = 0;

        foreach ($queries as $query) {
            $totalTime += $query['time'];
        }

        return round($totalTime, 2);
    }

    /**
     * Add performance headers to response.
     */
    private function addPerformanceHeaders(Response $response, array $metrics): void
    {
        $response->headers->set('X-Request-ID', $metrics['request_id']);
        $response->headers->set('X-Response-Time', $metrics['response_time_ms'] . 'ms');
        $response->headers->set('X-Query-Count', $metrics['query_count']);
        $response->headers->set('X-Query-Time', $metrics['query_time_ms'] . 'ms');
        $response->headers->set('X-Memory-Usage', $metrics['memory_usage_mb'] . 'MB');
        $response->headers->set('X-Peak-Memory', $metrics['peak_memory_mb'] . 'MB');
    }

    /**
     * Log performance metrics based on thresholds.
     */
    private function logPerformanceMetrics(array $metrics): void
    {
        $logLevel = $this->determineLogLevel($metrics);
        $context = [
            'performance' => $metrics,
            'queries' => $this->getSlowQueries($metrics['query_time_ms'])
        ];

        switch ($logLevel) {
            case 'critical':
                Log::critical('Critical Performance Issue', $context);
                break;
            case 'warning':
                Log::warning('Performance Warning', $context);
                break;
            case 'info':
                Log::info('Performance Metrics', $context);
                break;
            default:
                Log::debug('Performance Debug', $context);
        }
    }

    /**
     * Determine log level based on performance metrics.
     */
    private function determineLogLevel(array $metrics): string
    {
        // Critical thresholds
        if ($metrics['response_time_ms'] > 2000 || 
            $metrics['query_count'] > 50 || 
            $metrics['memory_usage_mb'] > 256) {
            return 'critical';
        }

        // Warning thresholds
        if ($metrics['response_time_ms'] > 500 || 
            $metrics['query_count'] > 20 || 
            $metrics['memory_usage_mb'] > 128) {
            return 'warning';
        }

        // Info for slower responses
        if ($metrics['response_time_ms'] > 200) {
            return 'info';
        }

        return 'debug';
    }

    /**
     * Get slow queries for analysis.
     */
    private function getSlowQueries(float $threshold = 50): array
    {
        $queries = DB::getQueryLog();
        $slowQueries = [];

        foreach ($queries as $query) {
            if ($query['time'] > $threshold) {
                $slowQueries[] = [
                    'sql' => $query['query'],
                    'bindings' => $query['bindings'],
                    'time' => $query['time'] . 'ms'
                ];
            }
        }

        return $slowQueries;
    }

    /**
     * Store metrics for analytics and monitoring.
     */
    private function storeMetrics(array $metrics): void
    {
        try {
            // Store in cache for real-time monitoring
            $cacheKey = 'performance_metrics:' . date('Y-m-d-H');
            $existingMetrics = Cache::get($cacheKey, []);
            $existingMetrics[] = $metrics;
            
            // Keep only last 1000 requests per hour
            if (count($existingMetrics) > 1000) {
                $existingMetrics = array_slice($existingMetrics, -1000);
            }
            
            Cache::put($cacheKey, $existingMetrics, now()->addHours(24));

            // Store aggregated metrics
            $this->updateAggregatedMetrics($metrics);

        } catch (\Exception $e) {
            Log::error('Failed to store performance metrics', [
                'error' => $e->getMessage(),
                'metrics' => $metrics
            ]);
        }
    }

    /**
     * Update aggregated performance metrics.
     */
    private function updateAggregatedMetrics(array $metrics): void
    {
        $aggregateKey = 'performance_aggregate:' . date('Y-m-d-H');
        $aggregate = Cache::get($aggregateKey, [
            'total_requests' => 0,
            'total_response_time' => 0,
            'total_queries' => 0,
            'total_memory' => 0,
            'max_response_time' => 0,
            'max_queries' => 0,
            'max_memory' => 0,
            'status_codes' => [],
            'endpoints' => []
        ]);

        // Update counters
        $aggregate['total_requests']++;
        $aggregate['total_response_time'] += $metrics['response_time_ms'];
        $aggregate['total_queries'] += $metrics['query_count'];
        $aggregate['total_memory'] += $metrics['memory_usage_mb'];

        // Update maximums
        $aggregate['max_response_time'] = max($aggregate['max_response_time'], $metrics['response_time_ms']);
        $aggregate['max_queries'] = max($aggregate['max_queries'], $metrics['query_count']);
        $aggregate['max_memory'] = max($aggregate['max_memory'], $metrics['memory_usage_mb']);

        // Track status codes
        $statusCode = $metrics['status_code'];
        $aggregate['status_codes'][$statusCode] = ($aggregate['status_codes'][$statusCode] ?? 0) + 1;

        // Track endpoints
        $endpoint = $metrics['method'] . ' ' . $metrics['path'];
        if (!isset($aggregate['endpoints'][$endpoint])) {
            $aggregate['endpoints'][$endpoint] = [
                'count' => 0,
                'total_time' => 0,
                'max_time' => 0
            ];
        }
        $aggregate['endpoints'][$endpoint]['count']++;
        $aggregate['endpoints'][$endpoint]['total_time'] += $metrics['response_time_ms'];
        $aggregate['endpoints'][$endpoint]['max_time'] = max(
            $aggregate['endpoints'][$endpoint]['max_time'], 
            $metrics['response_time_ms']
        );

        Cache::put($aggregateKey, $aggregate, now()->addHours(24));
    }

    /**
     * Check for performance alerts and trigger notifications.
     */
    private function checkPerformanceAlerts(array $metrics): void
    {
        $alerts = [];

        // Response time alert
        if ($metrics['response_time_ms'] > 1000) {
            $alerts[] = [
                'type' => 'slow_response',
                'message' => "Slow API response: {$metrics['response_time_ms']}ms",
                'threshold' => 1000,
                'value' => $metrics['response_time_ms']
            ];
        }

        // Query count alert
        if ($metrics['query_count'] > 30) {
            $alerts[] = [
                'type' => 'high_query_count',
                'message' => "High query count: {$metrics['query_count']} queries",
                'threshold' => 30,
                'value' => $metrics['query_count']
            ];
        }

        // Memory usage alert
        if ($metrics['memory_usage_mb'] > 200) {
            $alerts[] = [
                'type' => 'high_memory_usage',
                'message' => "High memory usage: {$metrics['memory_usage_mb']}MB",
                'threshold' => 200,
                'value' => $metrics['memory_usage_mb']
            ];
        }

        // Log alerts
        if (!empty($alerts)) {
            Log::warning('Performance Alerts Triggered', [
                'request_id' => $metrics['request_id'],
                'alerts' => $alerts,
                'metrics' => $metrics
            ]);
        }
    }

    /**
     * Get performance statistics.
     */
    public static function getStats(string $period = 'hour'): array
    {
        try {
            $cacheKey = 'performance_aggregate:' . date('Y-m-d-H');
            $aggregate = Cache::get($cacheKey, []);

            if (empty($aggregate)) {
                return ['message' => 'No performance data available'];
            }

            return [
                'period' => $period,
                'total_requests' => $aggregate['total_requests'],
                'average_response_time' => round($aggregate['total_response_time'] / $aggregate['total_requests'], 2),
                'average_queries' => round($aggregate['total_queries'] / $aggregate['total_requests'], 2),
                'average_memory' => round($aggregate['total_memory'] / $aggregate['total_requests'], 2),
                'max_response_time' => $aggregate['max_response_time'],
                'max_queries' => $aggregate['max_queries'],
                'max_memory' => $aggregate['max_memory'],
                'status_codes' => $aggregate['status_codes'],
                'top_endpoints' => array_slice($aggregate['endpoints'], 0, 10, true),
                'timestamp' => now()->toISOString()
            ];
        } catch (\Exception $e) {
            return [
                'error' => 'Failed to retrieve performance stats',
                'message' => $e->getMessage()
            ];
        }
    }
}
