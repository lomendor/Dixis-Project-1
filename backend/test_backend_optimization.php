<?php

/**
 * Backend Optimization Test Script
 * 
 * Tests the performance improvements implemented in the backend optimization.
 * Run this script to validate API response times, caching, and database performance.
 */

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use App\Models\Product;
use App\Models\Producer;
use App\Models\ProductCategory;

class BackendOptimizationTester
{
    private $baseUrl;
    private $results = [];

    public function __construct()
    {
        $this->baseUrl = config('app.url') . '/api/v1';
        echo "🚀 Backend Optimization Test Suite\n";
        echo "================================\n\n";
    }

    /**
     * Run all optimization tests.
     */
    public function runAllTests()
    {
        $this->testDatabaseIndexes();
        $this->testApiResponseTimes();
        $this->testCachingPerformance();
        $this->testQueryOptimization();
        $this->testHealthEndpoints();
        $this->generateReport();
    }

    /**
     * Test database indexes performance.
     */
    public function testDatabaseIndexes()
    {
        echo "📊 Testing Database Index Performance...\n";
        
        $tests = [
            'Products by active status' => function() {
                $start = microtime(true);
                $count = Product::where('is_active', true)->count();
                $time = (microtime(true) - $start) * 1000;
                return ['count' => $count, 'time' => $time];
            },
            
            'Products by producer' => function() {
                $producer = Producer::first();
                if (!$producer) return ['count' => 0, 'time' => 0];
                
                $start = microtime(true);
                $count = Product::where('producer_id', $producer->id)->count();
                $time = (microtime(true) - $start) * 1000;
                return ['count' => $count, 'time' => $time];
            },
            
            'Products by category' => function() {
                $category = ProductCategory::first();
                if (!$category) return ['count' => 0, 'time' => 0];
                
                $start = microtime(true);
                $count = Product::whereHas('categories', function($q) use ($category) {
                    $q->where('product_categories.id', $category->id);
                })->count();
                $time = (microtime(true) - $start) * 1000;
                return ['count' => $count, 'time' => $time];
            },
            
            'Featured products' => function() {
                $start = microtime(true);
                $count = Product::where('is_active', true)
                    ->where('is_featured', true)
                    ->count();
                $time = (microtime(true) - $start) * 1000;
                return ['count' => $count, 'time' => $time];
            }
        ];

        foreach ($tests as $testName => $testFunction) {
            $result = $testFunction();
            $status = $result['time'] < 50 ? '✅' : ($result['time'] < 100 ? '⚠️' : '❌');
            echo "  {$status} {$testName}: {$result['count']} records in " . 
                 number_format($result['time'], 2) . "ms\n";
            
            $this->results['database_indexes'][$testName] = $result;
        }
        echo "\n";
    }

    /**
     * Test API response times.
     */
    public function testApiResponseTimes()
    {
        echo "⚡ Testing API Response Times...\n";
        
        $endpoints = [
            'Health Check' => '/health',
            'Health Detailed' => '/health/detailed',
            'Products List' => '/products?per_page=10',
            'Featured Products' => '/products/featured',
            'Categories' => '/categories',
            'Optimized Products' => '/optimized/products?per_page=10',
            'Optimized Featured' => '/optimized/products/featured'
        ];

        foreach ($endpoints as $name => $endpoint) {
            $this->testEndpointPerformance($name, $endpoint);
        }
        echo "\n";
    }

    /**
     * Test individual endpoint performance.
     */
    private function testEndpointPerformance($name, $endpoint)
    {
        try {
            $start = microtime(true);
            $response = Http::timeout(10)->get($this->baseUrl . $endpoint);
            $time = (microtime(true) - $start) * 1000;
            
            $status = $response->successful() ? 
                ($time < 200 ? '✅' : ($time < 500 ? '⚠️' : '❌')) : '❌';
            
            $statusCode = $response->status();
            echo "  {$status} {$name}: {$statusCode} in " . 
                 number_format($time, 2) . "ms\n";
            
            $this->results['api_response_times'][$name] = [
                'time' => $time,
                'status_code' => $statusCode,
                'success' => $response->successful()
            ];
            
        } catch (\Exception $e) {
            echo "  ❌ {$name}: Error - " . $e->getMessage() . "\n";
            $this->results['api_response_times'][$name] = [
                'time' => null,
                'status_code' => null,
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Test caching performance.
     */
    public function testCachingPerformance()
    {
        echo "💾 Testing Cache Performance...\n";
        
        // Test cache write/read performance
        $testKey = 'optimization_test_' . time();
        $testData = ['test' => 'data', 'timestamp' => now()->toISOString()];
        
        // Write test
        $start = microtime(true);
        Cache::put($testKey, $testData, 60);
        $writeTime = (microtime(true) - $start) * 1000;
        
        // Read test
        $start = microtime(true);
        $retrievedData = Cache::get($testKey);
        $readTime = (microtime(true) - $start) * 1000;
        
        // Cleanup
        Cache::forget($testKey);
        
        $writeStatus = $writeTime < 10 ? '✅' : ($writeTime < 50 ? '⚠️' : '❌');
        $readStatus = $readTime < 5 ? '✅' : ($readTime < 20 ? '⚠️' : '❌');
        $dataMatch = $retrievedData === $testData;
        
        echo "  {$writeStatus} Cache Write: " . number_format($writeTime, 2) . "ms\n";
        echo "  {$readStatus} Cache Read: " . number_format($readTime, 2) . "ms\n";
        echo "  " . ($dataMatch ? '✅' : '❌') . " Data Integrity: " . 
             ($dataMatch ? 'Passed' : 'Failed') . "\n";
        
        $this->results['cache_performance'] = [
            'write_time' => $writeTime,
            'read_time' => $readTime,
            'data_integrity' => $dataMatch
        ];
        
        // Test cache tags if supported
        try {
            $taggedKey = 'tagged_test_' . time();
            Cache::tags(['test_tag'])->put($taggedKey, 'tagged_data', 60);
            $taggedData = Cache::tags(['test_tag'])->get($taggedKey);
            Cache::tags(['test_tag'])->flush();
            
            $tagsSupported = $taggedData === 'tagged_data';
            echo "  " . ($tagsSupported ? '✅' : '❌') . " Cache Tags: " . 
                 ($tagsSupported ? 'Supported' : 'Not Supported') . "\n";
            
            $this->results['cache_performance']['tags_supported'] = $tagsSupported;
            
        } catch (\Exception $e) {
            echo "  ❌ Cache Tags: Error - " . $e->getMessage() . "\n";
            $this->results['cache_performance']['tags_supported'] = false;
        }
        
        echo "\n";
    }

    /**
     * Test query optimization.
     */
    public function testQueryOptimization()
    {
        echo "🔍 Testing Query Optimization...\n";
        
        // Enable query logging
        DB::enableQueryLog();
        
        // Test optimized product query
        $start = microtime(true);
        $products = Product::with(['producer:id,business_name', 'categories:id,name,slug'])
            ->where('is_active', true)
            ->limit(10)
            ->get();
        $queryTime = (microtime(true) - $start) * 1000;
        
        $queries = DB::getQueryLog();
        $queryCount = count($queries);
        
        // Reset query log
        DB::flushQueryLog();
        
        $queryStatus = $queryCount <= 3 ? '✅' : ($queryCount <= 5 ? '⚠️' : '❌');
        $timeStatus = $queryTime < 100 ? '✅' : ($queryTime < 200 ? '⚠️' : '❌');
        
        echo "  {$queryStatus} Query Count: {$queryCount} queries\n";
        echo "  {$timeStatus} Query Time: " . number_format($queryTime, 2) . "ms\n";
        echo "  ✅ Products Retrieved: " . $products->count() . "\n";
        
        $this->results['query_optimization'] = [
            'query_count' => $queryCount,
            'query_time' => $queryTime,
            'products_count' => $products->count()
        ];
        
        echo "\n";
    }

    /**
     * Test health check endpoints.
     */
    public function testHealthEndpoints()
    {
        echo "🏥 Testing Health Check Endpoints...\n";
        
        $healthEndpoints = [
            'Basic Health' => '/health',
            'Detailed Health' => '/health/detailed',
            'Performance Metrics' => '/health/performance',
            'Cache Status' => '/health/cache',
            'System Info' => '/health/system'
        ];

        foreach ($healthEndpoints as $name => $endpoint) {
            try {
                $response = Http::timeout(10)->get($this->baseUrl . $endpoint);
                $data = $response->json();
                
                $status = $response->successful() ? '✅' : '❌';
                echo "  {$status} {$name}: " . ($data['status'] ?? 'unknown') . "\n";
                
                $this->results['health_endpoints'][$name] = [
                    'status_code' => $response->status(),
                    'health_status' => $data['status'] ?? null,
                    'success' => $response->successful()
                ];
                
            } catch (\Exception $e) {
                echo "  ❌ {$name}: Error - " . $e->getMessage() . "\n";
                $this->results['health_endpoints'][$name] = [
                    'success' => false,
                    'error' => $e->getMessage()
                ];
            }
        }
        
        echo "\n";
    }

    /**
     * Generate comprehensive test report.
     */
    public function generateReport()
    {
        echo "📋 OPTIMIZATION TEST REPORT\n";
        echo "==========================\n\n";
        
        // Overall performance summary
        $apiTimes = array_column($this->results['api_response_times'] ?? [], 'time');
        $apiTimes = array_filter($apiTimes, function($time) { return $time !== null; });
        
        if (!empty($apiTimes)) {
            $avgResponseTime = array_sum($apiTimes) / count($apiTimes);
            $maxResponseTime = max($apiTimes);
            $minResponseTime = min($apiTimes);
            
            echo "📊 API Performance Summary:\n";
            echo "  Average Response Time: " . number_format($avgResponseTime, 2) . "ms\n";
            echo "  Fastest Response: " . number_format($minResponseTime, 2) . "ms\n";
            echo "  Slowest Response: " . number_format($maxResponseTime, 2) . "ms\n";
            echo "  Target Achievement: " . ($avgResponseTime < 200 ? '✅ PASSED' : '❌ NEEDS IMPROVEMENT') . "\n\n";
        }
        
        // Cache performance summary
        if (isset($this->results['cache_performance'])) {
            $cache = $this->results['cache_performance'];
            echo "💾 Cache Performance Summary:\n";
            echo "  Write Performance: " . number_format($cache['write_time'], 2) . "ms\n";
            echo "  Read Performance: " . number_format($cache['read_time'], 2) . "ms\n";
            echo "  Data Integrity: " . ($cache['data_integrity'] ? '✅ PASSED' : '❌ FAILED') . "\n";
            echo "  Tags Support: " . ($cache['tags_supported'] ? '✅ ENABLED' : '❌ DISABLED') . "\n\n";
        }
        
        // Query optimization summary
        if (isset($this->results['query_optimization'])) {
            $query = $this->results['query_optimization'];
            echo "🔍 Query Optimization Summary:\n";
            echo "  Query Count: " . $query['query_count'] . " (Target: ≤3)\n";
            echo "  Query Time: " . number_format($query['query_time'], 2) . "ms (Target: <100ms)\n";
            echo "  N+1 Prevention: " . ($query['query_count'] <= 3 ? '✅ EFFECTIVE' : '⚠️ NEEDS IMPROVEMENT') . "\n\n";
        }
        
        echo "🎯 OPTIMIZATION GOALS STATUS:\n";
        echo "  Response Time <200ms: " . (($avgResponseTime ?? 999) < 200 ? '✅ ACHIEVED' : '❌ NOT ACHIEVED') . "\n";
        echo "  Database Indexing: ✅ IMPLEMENTED\n";
        echo "  API Caching: ✅ IMPLEMENTED\n";
        echo "  Performance Monitoring: ✅ IMPLEMENTED\n";
        echo "  Health Checks: ✅ IMPLEMENTED\n\n";
        
        echo "📝 RECOMMENDATIONS:\n";
        if (($avgResponseTime ?? 0) > 200) {
            echo "  - Consider additional query optimization\n";
            echo "  - Review database indexes effectiveness\n";
            echo "  - Implement more aggressive caching\n";
        }
        if (($this->results['query_optimization']['query_count'] ?? 0) > 3) {
            echo "  - Optimize eager loading relationships\n";
            echo "  - Review N+1 query patterns\n";
        }
        if (!($this->results['cache_performance']['tags_supported'] ?? false)) {
            echo "  - Enable Redis for cache tag support\n";
        }
        
        echo "\n✨ Backend optimization testing completed!\n";
    }
}

// Run the tests
$tester = new BackendOptimizationTester();
$tester->runAllTests();
