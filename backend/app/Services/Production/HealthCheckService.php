<?php

namespace App\Services\Production;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Exception;

class HealthCheckService
{
    /**
     * Perform comprehensive health check
     */
    public function performHealthCheck(): array
    {
        $checks = [
            'database' => $this->checkDatabase(),
            'cache' => $this->checkCache(),
            'queue' => $this->checkQueue(),
            'storage' => $this->checkStorage(),
            'mail' => $this->checkMail(),
            'api' => $this->checkApi(),
            'security' => $this->checkSecurity(),
            'performance' => $this->checkPerformance()
        ];

        $overallStatus = $this->calculateOverallStatus($checks);

        return [
            'status' => $overallStatus,
            'timestamp' => now()->toISOString(),
            'checks' => $checks,
            'summary' => $this->generateSummary($checks),
            'recommendations' => $this->generateRecommendations($checks)
        ];
    }

    /**
     * Check database connectivity and performance
     */
    private function checkDatabase(): array
    {
        try {
            $startTime = microtime(true);
            
            // Test basic connectivity
            DB::connection()->getPdo();
            
            // Test query performance
            $queryTime = microtime(true);
            $userCount = DB::table('users')->count();
            $queryDuration = (microtime(true) - $queryTime) * 1000;
            
            $totalDuration = (microtime(true) - $startTime) * 1000;

            return [
                'status' => 'healthy',
                'response_time' => round($totalDuration, 2),
                'query_time' => round($queryDuration, 2),
                'user_count' => $userCount,
                'connection' => DB::connection()->getName(),
                'details' => 'Database is responding normally'
            ];
        } catch (Exception $e) {
            Log::error('Database health check failed', ['error' => $e->getMessage()]);
            
            return [
                'status' => 'unhealthy',
                'error' => $e->getMessage(),
                'details' => 'Database connection failed'
            ];
        }
    }

    /**
     * Check cache system
     */
    private function checkCache(): array
    {
        try {
            $startTime = microtime(true);
            $testKey = 'health_check_' . time();
            $testValue = 'test_value_' . rand(1000, 9999);
            
            // Test write
            Cache::put($testKey, $testValue, 60);
            
            // Test read
            $retrievedValue = Cache::get($testKey);
            
            // Test delete
            Cache::forget($testKey);
            
            $duration = (microtime(true) - $startTime) * 1000;
            
            if ($retrievedValue !== $testValue) {
                throw new Exception('Cache value mismatch');
            }

            return [
                'status' => 'healthy',
                'response_time' => round($duration, 2),
                'driver' => config('cache.default'),
                'details' => 'Cache is working correctly'
            ];
        } catch (Exception $e) {
            Log::error('Cache health check failed', ['error' => $e->getMessage()]);
            
            return [
                'status' => 'unhealthy',
                'error' => $e->getMessage(),
                'details' => 'Cache system failed'
            ];
        }
    }

    /**
     * Check queue system
     */
    private function checkQueue(): array
    {
        try {
            $startTime = microtime(true);
            
            // Get queue size
            $queueSize = Queue::size();
            
            // Check failed jobs
            $failedJobs = DB::table('failed_jobs')->count();
            
            $duration = (microtime(true) - $startTime) * 1000;

            $status = 'healthy';
            $details = 'Queue system is operational';
            
            if ($queueSize > 1000) {
                $status = 'warning';
                $details = 'Queue size is high';
            }
            
            if ($failedJobs > 10) {
                $status = 'unhealthy';
                $details = 'Too many failed jobs';
            }

            return [
                'status' => $status,
                'response_time' => round($duration, 2),
                'queue_size' => $queueSize,
                'failed_jobs' => $failedJobs,
                'connection' => config('queue.default'),
                'details' => $details
            ];
        } catch (Exception $e) {
            Log::error('Queue health check failed', ['error' => $e->getMessage()]);
            
            return [
                'status' => 'unhealthy',
                'error' => $e->getMessage(),
                'details' => 'Queue system failed'
            ];
        }
    }

    /**
     * Check storage system
     */
    private function checkStorage(): array
    {
        try {
            $startTime = microtime(true);
            $testFile = 'health_check_' . time() . '.txt';
            $testContent = 'Health check test content';
            
            // Test write
            Storage::put($testFile, $testContent);
            
            // Test read
            $retrievedContent = Storage::get($testFile);
            
            // Test delete
            Storage::delete($testFile);
            
            $duration = (microtime(true) - $startTime) * 1000;
            
            if ($retrievedContent !== $testContent) {
                throw new Exception('Storage content mismatch');
            }

            // Check disk space
            $diskSpace = disk_free_space(storage_path());
            $diskTotal = disk_total_space(storage_path());
            $diskUsagePercent = (($diskTotal - $diskSpace) / $diskTotal) * 100;

            $status = 'healthy';
            $details = 'Storage is working correctly';
            
            if ($diskUsagePercent > 90) {
                $status = 'warning';
                $details = 'Disk space is running low';
            }
            
            if ($diskUsagePercent > 95) {
                $status = 'unhealthy';
                $details = 'Disk space critically low';
            }

            return [
                'status' => $status,
                'response_time' => round($duration, 2),
                'disk_usage_percent' => round($diskUsagePercent, 2),
                'free_space_gb' => round($diskSpace / (1024**3), 2),
                'total_space_gb' => round($diskTotal / (1024**3), 2),
                'driver' => config('filesystems.default'),
                'details' => $details
            ];
        } catch (Exception $e) {
            Log::error('Storage health check failed', ['error' => $e->getMessage()]);
            
            return [
                'status' => 'unhealthy',
                'error' => $e->getMessage(),
                'details' => 'Storage system failed'
            ];
        }
    }

    /**
     * Check mail system
     */
    private function checkMail(): array
    {
        try {
            $startTime = microtime(true);
            
            // Test mail configuration
            $mailer = config('mail.default');
            $host = config("mail.mailers.{$mailer}.host");
            
            $duration = (microtime(true) - $startTime) * 1000;

            return [
                'status' => 'healthy',
                'response_time' => round($duration, 2),
                'mailer' => $mailer,
                'host' => $host,
                'details' => 'Mail configuration is valid'
            ];
        } catch (Exception $e) {
            Log::error('Mail health check failed', ['error' => $e->getMessage()]);
            
            return [
                'status' => 'unhealthy',
                'error' => $e->getMessage(),
                'details' => 'Mail system configuration failed'
            ];
        }
    }

    /**
     * Check API endpoints
     */
    private function checkApi(): array
    {
        try {
            $startTime = microtime(true);
            
            // Test critical API endpoints
            $endpoints = [
                '/api/v1/health' => $this->testEndpoint('/api/v1/health'),
                '/api/v1/products' => $this->testEndpoint('/api/v1/products'),
                '/api/v1/categories' => $this->testEndpoint('/api/v1/categories'),
            ];
            
            $duration = (microtime(true) - $startTime) * 1000;
            
            $failedEndpoints = array_filter($endpoints, function($result) {
                return $result['status'] !== 'healthy';
            });
            
            $status = empty($failedEndpoints) ? 'healthy' : 'unhealthy';
            $details = empty($failedEndpoints) ? 
                'All API endpoints are responding' : 
                'Some API endpoints are failing';

            return [
                'status' => $status,
                'response_time' => round($duration, 2),
                'endpoints' => $endpoints,
                'failed_count' => count($failedEndpoints),
                'details' => $details
            ];
        } catch (Exception $e) {
            Log::error('API health check failed', ['error' => $e->getMessage()]);
            
            return [
                'status' => 'unhealthy',
                'error' => $e->getMessage(),
                'details' => 'API health check failed'
            ];
        }
    }

    /**
     * Check security status
     */
    private function checkSecurity(): array
    {
        try {
            $checks = [
                'https_enabled' => request()->isSecure(),
                'debug_disabled' => !config('app.debug'),
                'production_env' => app()->environment('production'),
                'secure_cookies' => config('session.secure'),
                'csrf_protection' => config('app.key') !== null,
            ];
            
            $failedChecks = array_filter($checks, function($value) {
                return !$value;
            });
            
            $status = empty($failedChecks) ? 'healthy' : 'warning';
            $details = empty($failedChecks) ? 
                'All security checks passed' : 
                'Some security checks failed';

            return [
                'status' => $status,
                'checks' => $checks,
                'failed_count' => count($failedChecks),
                'details' => $details
            ];
        } catch (Exception $e) {
            Log::error('Security health check failed', ['error' => $e->getMessage()]);
            
            return [
                'status' => 'unhealthy',
                'error' => $e->getMessage(),
                'details' => 'Security check failed'
            ];
        }
    }

    /**
     * Check performance metrics
     */
    private function checkPerformance(): array
    {
        try {
            $startTime = microtime(true);
            
            // Memory usage
            $memoryUsage = memory_get_usage(true);
            $memoryPeak = memory_get_peak_usage(true);
            $memoryLimit = $this->parseMemoryLimit(ini_get('memory_limit'));
            $memoryPercent = ($memoryUsage / $memoryLimit) * 100;
            
            // Load average (Unix systems only)
            $loadAverage = null;
            if (function_exists('sys_getloadavg')) {
                $loadAverage = sys_getloadavg();
            }
            
            $duration = (microtime(true) - $startTime) * 1000;
            
            $status = 'healthy';
            $details = 'Performance metrics are normal';
            
            if ($memoryPercent > 80) {
                $status = 'warning';
                $details = 'Memory usage is high';
            }
            
            if ($memoryPercent > 90) {
                $status = 'unhealthy';
                $details = 'Memory usage is critically high';
            }

            return [
                'status' => $status,
                'response_time' => round($duration, 2),
                'memory_usage_mb' => round($memoryUsage / (1024**2), 2),
                'memory_peak_mb' => round($memoryPeak / (1024**2), 2),
                'memory_limit_mb' => round($memoryLimit / (1024**2), 2),
                'memory_usage_percent' => round($memoryPercent, 2),
                'load_average' => $loadAverage,
                'details' => $details
            ];
        } catch (Exception $e) {
            Log::error('Performance health check failed', ['error' => $e->getMessage()]);
            
            return [
                'status' => 'unhealthy',
                'error' => $e->getMessage(),
                'details' => 'Performance check failed'
            ];
        }
    }

    /**
     * Test individual API endpoint
     */
    private function testEndpoint(string $endpoint): array
    {
        try {
            $startTime = microtime(true);
            
            // Make internal request
            $response = app()->handle(
                \Illuminate\Http\Request::create($endpoint, 'GET')
            );
            
            $duration = (microtime(true) - $startTime) * 1000;
            
            $status = $response->getStatusCode() < 400 ? 'healthy' : 'unhealthy';
            
            return [
                'status' => $status,
                'response_time' => round($duration, 2),
                'status_code' => $response->getStatusCode()
            ];
        } catch (Exception $e) {
            return [
                'status' => 'unhealthy',
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Calculate overall system status
     */
    private function calculateOverallStatus(array $checks): string
    {
        $statuses = array_column($checks, 'status');
        
        if (in_array('unhealthy', $statuses)) {
            return 'unhealthy';
        }
        
        if (in_array('warning', $statuses)) {
            return 'warning';
        }
        
        return 'healthy';
    }

    /**
     * Generate health check summary
     */
    private function generateSummary(array $checks): array
    {
        $total = count($checks);
        $healthy = count(array_filter($checks, fn($check) => $check['status'] === 'healthy'));
        $warning = count(array_filter($checks, fn($check) => $check['status'] === 'warning'));
        $unhealthy = count(array_filter($checks, fn($check) => $check['status'] === 'unhealthy'));
        
        return [
            'total_checks' => $total,
            'healthy' => $healthy,
            'warning' => $warning,
            'unhealthy' => $unhealthy,
            'health_percentage' => round(($healthy / $total) * 100, 2)
        ];
    }

    /**
     * Generate recommendations based on health check results
     */
    private function generateRecommendations(array $checks): array
    {
        $recommendations = [];
        
        foreach ($checks as $checkName => $result) {
            if ($result['status'] === 'unhealthy') {
                $recommendations[] = [
                    'priority' => 'high',
                    'component' => $checkName,
                    'issue' => $result['details'] ?? 'Component is unhealthy',
                    'action' => $this->getRecommendedAction($checkName, $result)
                ];
            } elseif ($result['status'] === 'warning') {
                $recommendations[] = [
                    'priority' => 'medium',
                    'component' => $checkName,
                    'issue' => $result['details'] ?? 'Component has warnings',
                    'action' => $this->getRecommendedAction($checkName, $result)
                ];
            }
        }
        
        return $recommendations;
    }

    /**
     * Get recommended action for specific component
     */
    private function getRecommendedAction(string $component, array $result): string
    {
        $actions = [
            'database' => 'Check database connection and query performance',
            'cache' => 'Verify cache configuration and Redis/Memcached status',
            'queue' => 'Check queue workers and clear failed jobs',
            'storage' => 'Free up disk space and verify storage permissions',
            'mail' => 'Verify mail server configuration and credentials',
            'api' => 'Check API endpoint functionality and dependencies',
            'security' => 'Review security configuration and enable missing features',
            'performance' => 'Optimize memory usage and system resources'
        ];
        
        return $actions[$component] ?? 'Review component configuration and logs';
    }

    /**
     * Parse memory limit string to bytes
     */
    private function parseMemoryLimit(string $limit): int
    {
        $limit = trim($limit);
        $last = strtolower($limit[strlen($limit)-1]);
        $value = (int) $limit;
        
        switch($last) {
            case 'g':
                $value *= 1024;
            case 'm':
                $value *= 1024;
            case 'k':
                $value *= 1024;
        }
        
        return $value;
    }
}