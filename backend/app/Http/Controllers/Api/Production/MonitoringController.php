<?php

namespace App\Http\Controllers\Api\Production;

use App\Http\Controllers\Controller;
use App\Services\Production\HealthCheckService;
use App\Services\Security\SecurityMonitoringService;
use App\Services\Database\DatabaseOptimizationService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class MonitoringController extends Controller
{
    protected HealthCheckService $healthCheckService;
    protected SecurityMonitoringService $securityService;
    protected DatabaseOptimizationService $dbService;

    public function __construct(
        HealthCheckService $healthCheckService,
        SecurityMonitoringService $securityService,
        DatabaseOptimizationService $dbService
    ) {
        $this->healthCheckService = $healthCheckService;
        $this->securityService = $securityService;
        $this->dbService = $dbService;
    }

    /**
     * Get comprehensive system health status
     */
    public function health(): JsonResponse
    {
        try {
            $health = $this->healthCheckService->performHealthCheck();
            
            return response()->json([
                'status' => 'success',
                'data' => $health
            ], $health['status'] === 'healthy' ? 200 : 503);
        } catch (\Exception $e) {
            Log::error('Health check failed', ['error' => $e->getMessage()]);
            
            return response()->json([
                'status' => 'error',
                'message' => 'Health check failed',
                'error' => app()->environment('production') ? 'Internal server error' : $e->getMessage()
            ], 503);
        }
    }

    /**
     * Get basic health status (lightweight)
     */
    public function healthBasic(): JsonResponse
    {
        try {
            // Quick database check
            DB::connection()->getPdo();
            
            // Quick cache check
            Cache::put('health_basic_test', time(), 60);
            $cacheWorking = Cache::get('health_basic_test') !== null;
            Cache::forget('health_basic_test');
            
            $status = $cacheWorking ? 'healthy' : 'warning';
            
            return response()->json([
                'status' => $status,
                'timestamp' => now()->toISOString(),
                'uptime' => $this->getUptime(),
                'version' => config('app.version', '1.0.0')
            ], $status === 'healthy' ? 200 : 503);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'unhealthy',
                'timestamp' => now()->toISOString(),
                'error' => 'System check failed'
            ], 503);
        }
    }

    /**
     * Get security monitoring status
     */
    public function security(): JsonResponse
    {
        try {
            $security = $this->securityService->analyzeSecurityThreats();
            
            return response()->json([
                'status' => 'success',
                'data' => $security,
                'timestamp' => now()->toISOString()
            ]);
        } catch (\Exception $e) {
            Log::error('Security monitoring failed', ['error' => $e->getMessage()]);
            
            return response()->json([
                'status' => 'error',
                'message' => 'Security monitoring failed',
                'error' => app()->environment('production') ? 'Internal server error' : $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get database performance metrics
     */
    public function database(): JsonResponse
    {
        try {
            $dbMetrics = $this->dbService->analyzePerformance();
            
            return response()->json([
                'status' => 'success',
                'data' => $dbMetrics,
                'timestamp' => now()->toISOString()
            ]);
        } catch (\Exception $e) {
            Log::error('Database monitoring failed', ['error' => $e->getMessage()]);
            
            return response()->json([
                'status' => 'error',
                'message' => 'Database monitoring failed',
                'error' => app()->environment('production') ? 'Internal server error' : $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get system performance metrics
     */
    public function performance(): JsonResponse
    {
        try {
            $metrics = [
                'memory' => $this->getMemoryMetrics(),
                'cpu' => $this->getCpuMetrics(),
                'disk' => $this->getDiskMetrics(),
                'network' => $this->getNetworkMetrics(),
                'application' => $this->getApplicationMetrics()
            ];
            
            return response()->json([
                'status' => 'success',
                'data' => $metrics,
                'timestamp' => now()->toISOString()
            ]);
        } catch (\Exception $e) {
            Log::error('Performance monitoring failed', ['error' => $e->getMessage()]);
            
            return response()->json([
                'status' => 'error',
                'message' => 'Performance monitoring failed',
                'error' => app()->environment('production') ? 'Internal server error' : $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get application metrics
     */
    public function metrics(): JsonResponse
    {
        try {
            $metrics = [
                'users' => [
                    'total' => DB::table('users')->count(),
                    'active_today' => DB::table('users')
                        ->where('last_login_at', '>=', now()->subDay())
                        ->count(),
                    'registered_today' => DB::table('users')
                        ->whereDate('created_at', today())
                        ->count()
                ],
                'orders' => [
                    'total' => DB::table('orders')->count(),
                    'today' => DB::table('orders')
                        ->whereDate('created_at', today())
                        ->count(),
                    'pending' => DB::table('orders')
                        ->where('status', 'pending')
                        ->count(),
                    'revenue_today' => DB::table('orders')
                        ->whereDate('created_at', today())
                        ->where('status', 'completed')
                        ->sum('total_amount')
                ],
                'products' => [
                    'total' => DB::table('products')->count(),
                    'active' => DB::table('products')
                        ->where('is_active', true)
                        ->count(),
                    'out_of_stock' => DB::table('products')
                        ->where('stock', '<=', 0)
                        ->count()
                ],
                'producers' => [
                    'total' => DB::table('producers')->count(),
                    'verified' => DB::table('producers')
                        ->where('is_verified', true)
                        ->count(),
                    'active' => DB::table('producers')
                        ->where('is_active', true)
                        ->count()
                ]
            ];
            
            return response()->json([
                'status' => 'success',
                'data' => $metrics,
                'timestamp' => now()->toISOString()
            ]);
        } catch (\Exception $e) {
            Log::error('Metrics collection failed', ['error' => $e->getMessage()]);
            
            return response()->json([
                'status' => 'error',
                'message' => 'Metrics collection failed',
                'error' => app()->environment('production') ? 'Internal server error' : $e->getMessage()
            ], 500);
        }
    }

    // Helper methods

    private function getUptime(): string
    {
        if (function_exists('shell_exec')) {
            $uptime = shell_exec('uptime -p');
            return trim($uptime ?: 'Unknown');
        }
        
        return 'Unknown';
    }

    private function getMemoryMetrics(): array
    {
        return [
            'usage_bytes' => memory_get_usage(true),
            'peak_bytes' => memory_get_peak_usage(true),
            'limit_bytes' => $this->parseMemoryLimit(ini_get('memory_limit')),
            'usage_mb' => round(memory_get_usage(true) / (1024**2), 2),
            'peak_mb' => round(memory_get_peak_usage(true) / (1024**2), 2),
            'limit_mb' => round($this->parseMemoryLimit(ini_get('memory_limit')) / (1024**2), 2)
        ];
    }

    private function getCpuMetrics(): array
    {
        $loadAverage = null;
        if (function_exists('sys_getloadavg')) {
            $loadAverage = sys_getloadavg();
        }
        
        return [
            'load_average' => $loadAverage,
            'load_1min' => $loadAverage[0] ?? null,
            'load_5min' => $loadAverage[1] ?? null,
            'load_15min' => $loadAverage[2] ?? null
        ];
    }

    private function getDiskMetrics(): array
    {
        $path = storage_path();
        $freeBytes = disk_free_space($path);
        $totalBytes = disk_total_space($path);
        $usedBytes = $totalBytes - $freeBytes;
        
        return [
            'free_bytes' => $freeBytes,
            'used_bytes' => $usedBytes,
            'total_bytes' => $totalBytes,
            'free_gb' => round($freeBytes / (1024**3), 2),
            'used_gb' => round($usedBytes / (1024**3), 2),
            'total_gb' => round($totalBytes / (1024**3), 2),
            'usage_percent' => round(($usedBytes / $totalBytes) * 100, 2)
        ];
    }

    private function getNetworkMetrics(): array
    {
        // Basic network metrics - can be extended with more detailed monitoring
        return [
            'connections' => $this->getActiveConnections(),
            'requests_per_minute' => $this->getRequestsPerMinute()
        ];
    }

    private function getApplicationMetrics(): array
    {
        return [
            'php_version' => PHP_VERSION,
            'laravel_version' => app()->version(),
            'environment' => app()->environment(),
            'debug_mode' => config('app.debug'),
            'timezone' => config('app.timezone'),
            'locale' => config('app.locale')
        ];
    }

    private function getActiveConnections(): int
    {
        // This would require network monitoring - placeholder implementation
        return 0;
    }

    private function getRequestsPerMinute(): float
    {
        // This would require request tracking - placeholder implementation
        return 0.0;
    }

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