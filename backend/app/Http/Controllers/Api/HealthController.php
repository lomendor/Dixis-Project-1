<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Redis;
use App\Http\Middleware\PerformanceMonitor;
use App\Services\CacheInvalidationService;

class HealthController extends Controller
{
    /**
     * Basic health check endpoint.
     */
    public function index()
    {
        return response()->json([
            'status' => 'healthy',
            'timestamp' => now()->toISOString(),
            'version' => config('app.version', '1.0.0'),
            'environment' => config('app.env')
        ]);
    }

    /**
     * Comprehensive health check with all system components.
     */
    public function detailed()
    {
        $startTime = microtime(true);
        $health = [
            'status' => 'healthy',
            'timestamp' => now()->toISOString(),
            'version' => config('app.version', '1.0.0'),
            'environment' => config('app.env'),
            'checks' => []
        ];

        // Database health check
        $health['checks']['database'] = $this->checkDatabase();
        
        // Redis/Cache health check
        $health['checks']['cache'] = $this->checkCache();
        
        // Queue health check
        $health['checks']['queue'] = $this->checkQueue();
        
        // Storage health check
        $health['checks']['storage'] = $this->checkStorage();
        
        // Performance metrics
        $health['checks']['performance'] = $this->checkPerformance();

        // Overall status determination
        $allHealthy = collect($health['checks'])->every(function ($check) {
            return $check['status'] === 'healthy';
        });

        $health['status'] = $allHealthy ? 'healthy' : 'degraded';
        $health['response_time'] = round((microtime(true) - $startTime) * 1000, 2) . 'ms';

        $statusCode = $allHealthy ? 200 : 503;
        
        return response()->json($health, $statusCode);
    }

    /**
     * Check database connectivity and performance.
     */
    private function checkDatabase(): array
    {
        try {
            $startTime = microtime(true);
            
            // Test basic connectivity
            DB::connection()->getPdo();
            
            // Test a simple query
            $result = DB::select('SELECT 1 as test');
            
            // Test product table access
            $productCount = DB::table('products')->count();
            
            $responseTime = round((microtime(true) - $startTime) * 1000, 2);
            
            return [
                'status' => 'healthy',
                'response_time' => $responseTime . 'ms',
                'product_count' => $productCount,
                'connection' => 'active'
            ];
            
        } catch (\Exception $e) {
            return [
                'status' => 'unhealthy',
                'error' => $e->getMessage(),
                'connection' => 'failed'
            ];
        }
    }

    /**
     * Check Redis/Cache connectivity and performance.
     */
    private function checkCache(): array
    {
        try {
            $startTime = microtime(true);
            
            // Test cache write/read
            $testKey = 'health_check_' . time();
            $testValue = 'test_value_' . uniqid();
            
            Cache::put($testKey, $testValue, 60);
            $retrievedValue = Cache::get($testKey);
            Cache::forget($testKey);
            
            $responseTime = round((microtime(true) - $startTime) * 1000, 2);
            
            $status = ($retrievedValue === $testValue) ? 'healthy' : 'degraded';
            
            // Get cache driver info
            $driver = config('cache.default');
            
            return [
                'status' => $status,
                'response_time' => $responseTime . 'ms',
                'driver' => $driver,
                'read_write' => $status === 'healthy' ? 'working' : 'failed'
            ];
            
        } catch (\Exception $e) {
            return [
                'status' => 'unhealthy',
                'error' => $e->getMessage(),
                'driver' => config('cache.default', 'unknown')
            ];
        }
    }

    /**
     * Check queue system health.
     */
    private function checkQueue(): array
    {
        try {
            $queueConnection = config('queue.default');
            
            // Basic queue configuration check
            $queueConfig = config("queue.connections.{$queueConnection}");
            
            if (!$queueConfig) {
                return [
                    'status' => 'unhealthy',
                    'error' => 'Queue configuration not found',
                    'connection' => $queueConnection
                ];
            }
            
            // For Redis queue, test Redis connectivity
            if ($queueConnection === 'redis') {
                try {
                    Redis::ping();
                    $redisStatus = 'connected';
                } catch (\Exception $e) {
                    $redisStatus = 'disconnected';
                }
            } else {
                $redisStatus = 'not_applicable';
            }
            
            return [
                'status' => 'healthy',
                'connection' => $queueConnection,
                'redis_status' => $redisStatus,
                'driver' => $queueConfig['driver'] ?? 'unknown'
            ];
            
        } catch (\Exception $e) {
            return [
                'status' => 'unhealthy',
                'error' => $e->getMessage(),
                'connection' => config('queue.default', 'unknown')
            ];
        }
    }

    /**
     * Check storage system health.
     */
    private function checkStorage(): array
    {
        try {
            $disk = config('filesystems.default');
            $diskConfig = config("filesystems.disks.{$disk}");
            
            // Test storage write/read for local disk
            if ($disk === 'local' || $disk === 'public') {
                $testFile = 'health_check_' . time() . '.txt';
                $testContent = 'Health check test content';
                
                \Storage::disk($disk)->put($testFile, $testContent);
                $retrievedContent = \Storage::disk($disk)->get($testFile);
                \Storage::disk($disk)->delete($testFile);
                
                $writeReadStatus = ($retrievedContent === $testContent) ? 'working' : 'failed';
            } else {
                $writeReadStatus = 'not_tested';
            }
            
            return [
                'status' => 'healthy',
                'disk' => $disk,
                'driver' => $diskConfig['driver'] ?? 'unknown',
                'write_read' => $writeReadStatus
            ];
            
        } catch (\Exception $e) {
            return [
                'status' => 'unhealthy',
                'error' => $e->getMessage(),
                'disk' => config('filesystems.default', 'unknown')
            ];
        }
    }

    /**
     * Check performance metrics.
     */
    private function checkPerformance(): array
    {
        try {
            // Get performance stats from monitoring middleware
            $stats = PerformanceMonitor::getStats();
            
            // Memory usage
            $memoryUsage = round(memory_get_usage(true) / 1024 / 1024, 2);
            $peakMemory = round(memory_get_peak_usage(true) / 1024 / 1024, 2);
            
            // Determine status based on thresholds
            $status = 'healthy';
            if (isset($stats['average_response_time']) && $stats['average_response_time'] > 500) {
                $status = 'degraded';
            }
            if ($memoryUsage > 256) {
                $status = 'degraded';
            }
            
            return [
                'status' => $status,
                'memory_usage_mb' => $memoryUsage,
                'peak_memory_mb' => $peakMemory,
                'stats' => $stats
            ];
            
        } catch (\Exception $e) {
            return [
                'status' => 'unknown',
                'error' => $e->getMessage(),
                'memory_usage_mb' => round(memory_get_usage(true) / 1024 / 1024, 2)
            ];
        }
    }

    /**
     * Performance metrics endpoint.
     */
    public function performance()
    {
        try {
            $stats = PerformanceMonitor::getStats();
            
            return response()->json([
                'status' => 'success',
                'data' => $stats,
                'timestamp' => now()->toISOString()
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'error' => $e->getMessage(),
                'timestamp' => now()->toISOString()
            ], 500);
        }
    }

    /**
     * Cache statistics endpoint.
     */
    public function cache()
    {
        try {
            $cacheService = app(CacheInvalidationService::class);
            $stats = $cacheService->getCacheStats();
            
            return response()->json([
                'status' => 'success',
                'data' => $stats,
                'timestamp' => now()->toISOString()
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'error' => $e->getMessage(),
                'timestamp' => now()->toISOString()
            ], 500);
        }
    }

    /**
     * System information endpoint.
     */
    public function system()
    {
        return response()->json([
            'php_version' => PHP_VERSION,
            'laravel_version' => app()->version(),
            'environment' => config('app.env'),
            'debug_mode' => config('app.debug'),
            'timezone' => config('app.timezone'),
            'locale' => config('app.locale'),
            'cache_driver' => config('cache.default'),
            'queue_driver' => config('queue.default'),
            'database_driver' => config('database.default'),
            'memory_limit' => ini_get('memory_limit'),
            'max_execution_time' => ini_get('max_execution_time'),
            'timestamp' => now()->toISOString()
        ]);
    }
}
