# 📦 INVENTORY MANAGEMENT - PART 2: EXTERNAL PROVIDERS & JOBS

## 🔗 EXTERNAL INVENTORY PROVIDERS

### **1. TradeGecko/Cin7 Provider**

**TradeGeckoProvider.php:**
```php
<?php

namespace App\Services\Inventory\Providers;

use App\Contracts\Integrations\InventoryProviderInterface;
use GuzzleHttp\Client;
use Illuminate\Support\Facades\Log;

class TradeGeckoProvider implements InventoryProviderInterface
{
    private Client $client;
    private string $apiToken;
    private string $baseUrl;
    
    public function __construct()
    {
        $this->client = new Client();
        $this->apiToken = config('integrations.inventory.providers.tradegecko.api_token');
        $this->baseUrl = config('integrations.inventory.providers.tradegecko.base_url', 'https://api.tradegecko.com');
    }
    
    public function getStockLevel(string $externalId): int
    {
        try {
            $response = $this->client->get("{$this->baseUrl}/stock_levels", [
                'headers' => $this->getHeaders(),
                'query' => ['variant_id' => $externalId]
            ]);
            
            $data = json_decode($response->getBody(), true);
            
            if (isset($data['stock_levels'][0]['stock_on_hand'])) {
                return (int) $data['stock_levels'][0]['stock_on_hand'];
            }
            
            return 0;
            
        } catch (\Exception $e) {
            Log::error('TradeGecko stock level retrieval failed', [
                'external_id' => $externalId,
                'error' => $e->getMessage()
            ]);
            
            throw new \Exception('Failed to get stock level from TradeGecko: ' . $e->getMessage());
        }
    }
    
    public function updateStock(string $externalId, int $quantity): bool
    {
        try {
            $response = $this->client->put("{$this->baseUrl}/stock_adjustments", [
                'headers' => $this->getHeaders(),
                'json' => [
                    'stock_adjustment' => [
                        'variant_id' => $externalId,
                        'quantity' => $quantity,
                        'adjustment_type' => 'absolute',
                        'notes' => 'Updated from Dixis Fresh'
                    ]
                ]
            ]);
            
            return $response->getStatusCode() === 200;
            
        } catch (\Exception $e) {
            Log::error('TradeGecko stock update failed', [
                'external_id' => $externalId,
                'quantity' => $quantity,
                'error' => $e->getMessage()
            ]);
            
            return false;
        }
    }
    
    public function getProductInfo(string $externalId): ?array
    {
        try {
            $response = $this->client->get("{$this->baseUrl}/variants/{$externalId}", [
                'headers' => $this->getHeaders()
            ]);
            
            $data = json_decode($response->getBody(), true);
            
            if (isset($data['variant'])) {
                return [
                    'id' => $data['variant']['id'],
                    'name' => $data['variant']['product_name'],
                    'sku' => $data['variant']['sku'],
                    'price' => $data['variant']['wholesale_price']
                ];
            }
            
            return null;
            
        } catch (\Exception $e) {
            Log::error('TradeGecko product info retrieval failed', [
                'external_id' => $externalId,
                'error' => $e->getMessage()
            ]);
            
            return null;
        }
    }
    
    public function syncAllProducts(): array
    {
        try {
            $response = $this->client->get("{$this->baseUrl}/variants", [
                'headers' => $this->getHeaders(),
                'query' => ['limit' => 250]
            ]);
            
            $data = json_decode($response->getBody(), true);
            
            return $data['variants'] ?? [];
            
        } catch (\Exception $e) {
            Log::error('TradeGecko product sync failed', [
                'error' => $e->getMessage()
            ]);
            
            throw new \Exception('Failed to sync products from TradeGecko: ' . $e->getMessage());
        }
    }
    
    public function testConnection(): bool
    {
        try {
            $response = $this->client->get("{$this->baseUrl}/account", [
                'headers' => $this->getHeaders()
            ]);
            
            return $response->getStatusCode() === 200;
            
        } catch (\Exception $e) {
            Log::error('TradeGecko connection test failed', [
                'error' => $e->getMessage()
            ]);
            
            return false;
        }
    }
    
    private function getHeaders(): array
    {
        return [
            'Authorization' => "Bearer {$this->apiToken}",
            'Content-Type' => 'application/json',
            'Accept' => 'application/json'
        ];
    }
}
```

### **2. Background Jobs για Inventory Operations**

**SyncInventoryLevels.php:**
```php
<?php

namespace App\Jobs\Integration;

use App\Services\Integrations\Inventory\InventoryManagerService;
use App\Models\Product;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SyncInventoryLevels implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;
    
    public $tries = 3;
    public $backoff = [60, 300, 900];
    public $timeout = 300; // 5 minutes
    
    public function __construct(
        private ?int $productId = null
    ) {
        $this->onQueue('inventory');
    }
    
    public function handle(InventoryManagerService $inventoryService): void
    {
        try {
            if ($this->productId) {
                // Sync specific product
                $product = Product::findOrFail($this->productId);
                $result = $inventoryService->syncProduct($product);
                
                Log::info('Product inventory synced', [
                    'product_id' => $this->productId,
                    'result' => $result
                ]);
            } else {
                // Sync all products
                $result = $inventoryService->syncAllProducts();
                
                Log::info('All inventory synced', [
                    'total_products' => $result['total_products'],
                    'successful_syncs' => $result['successful_syncs'],
                    'failed_syncs' => $result['failed_syncs']
                ]);
            }
            
        } catch (\Exception $e) {
            Log::error('Inventory sync job failed', [
                'product_id' => $this->productId,
                'error' => $e->getMessage()
            ]);
            
            throw $e;
        }
    }
    
    public function failed(\Throwable $exception): void
    {
        Log::error('Inventory sync job permanently failed', [
            'product_id' => $this->productId,
            'error' => $exception->getMessage(),
            'attempts' => $this->attempts
        ]);
    }
}
```

**ProcessLowStockAlert.php:**
```php
<?php

namespace App\Jobs\Integration;

use App\Models\Product;
use App\Services\Integrations\Inventory\InventoryManagerService;
use App\Notifications\LowStockNotification;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Notification;

class ProcessLowStockAlert implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;
    
    public function __construct(
        private Product $product
    ) {
        $this->onQueue('alerts');
    }
    
    public function handle(InventoryManagerService $inventoryService): void
    {
        try {
            // Check if auto-reorder is enabled
            if ($this->product->auto_reorder_enabled) {
                $reorderQuantity = $this->product->reorder_quantity ?? 
                    ($this->product->low_stock_threshold * 2);
                
                $result = $inventoryService->createPurchaseOrder($this->product, $reorderQuantity);
                
                if ($result['success']) {
                    Log::info('Auto-reorder triggered', [
                        'product_id' => $this->product->id,
                        'po_id' => $result['purchase_order_id'],
                        'quantity' => $reorderQuantity
                    ]);
                }
            }
            
            // Send notifications to admins
            $admins = \App\Models\User::role('admin')->get();
            Notification::send($admins, new LowStockNotification($this->product));
            
        } catch (\Exception $e) {
            Log::error('Low stock alert processing failed', [
                'product_id' => $this->product->id,
                'error' => $e->getMessage()
            ]);
        }
    }
}
```

### **3. Event Listeners για Inventory Events**

**StockLevelUpdatedListener.php:**
```php
<?php

namespace App\Listeners\Integration;

use App\Events\Integration\StockLevelUpdated;
use App\Jobs\Integration\UpdateExternalInventory;
use Illuminate\Support\Facades\Log;

class StockLevelUpdatedListener
{
    public function handle(StockLevelUpdated $event): void
    {
        try {
            $product = $event->product;
            $oldStock = $event->oldStock;
            $newStock = $event->newStock;
            
            // Log the stock change
            Log::info('Stock level updated', [
                'product_id' => $product->id,
                'product_name' => $product->name,
                'old_stock' => $oldStock,
                'new_stock' => $newStock,
                'difference' => $newStock - $oldStock
            ]);
            
            // Update external systems
            UpdateExternalInventory::dispatch($product, $newStock);
            
            // Update product search index if using search
            if (class_exists('\Laravel\Scout\Searchable')) {
                $product->searchable();
            }
            
            // Clear related caches
            \Cache::forget("product.{$product->id}.stock");
            \Cache::forget("category.{$product->category_id}.products");
            
        } catch (\Exception $e) {
            Log::error('Stock level updated listener failed', [
                'product_id' => $event->product->id,
                'error' => $e->getMessage()
            ]);
        }
    }
}
```

### **4. Inventory Analytics Service**

**InventoryAnalyticsService.php:**
```php
<?php

namespace App\Services\Integrations\Inventory;

use App\Models\Product;
use App\Models\InventoryTransaction;
use App\Models\Order;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class InventoryAnalyticsService
{
    /**
     * Generate comprehensive inventory report
     */
    public function generateInventoryReport(array $filters = []): array
    {
        $cacheKey = 'inventory.report.' . md5(serialize($filters));
        
        return Cache::remember($cacheKey, 300, function () use ($filters) {
            return [
                'summary' => $this->getInventorySummary($filters),
                'stock_levels' => $this->getStockLevelAnalysis($filters),
                'movement_analysis' => $this->getMovementAnalysis($filters),
                'reorder_recommendations' => $this->getReorderRecommendations($filters),
                'abc_analysis' => $this->getABCAnalysis($filters),
                'generated_at' => now()->toISOString()
            ];
        });
    }
    
    private function getInventorySummary(array $filters): array
    {
        $query = Product::where('active', true)->where('track_inventory', true);
        
        if (isset($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }
        
        $products = $query->get();
        
        return [
            'total_products' => $products->count(),
            'total_stock_value' => $products->sum(function ($product) {
                return $product->stock_quantity * $product->cost_price;
            }),
            'total_retail_value' => $products->sum(function ($product) {
                return $product->stock_quantity * $product->price;
            }),
            'low_stock_count' => $products->filter(function ($product) {
                return $product->stock_quantity <= $product->low_stock_threshold;
            })->count(),
            'out_of_stock_count' => $products->where('stock_quantity', 0)->count(),
            'average_stock_days' => $this->calculateAverageStockDays($products)
        ];
    }
    
    private function getStockLevelAnalysis(array $filters): array
    {
        $query = Product::where('active', true)->where('track_inventory', true);
        
        if (isset($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }
        
        $products = $query->get();
        
        $stockRanges = [
            'out_of_stock' => $products->where('stock_quantity', 0)->count(),
            'low_stock' => $products->filter(function ($product) {
                return $product->stock_quantity > 0 && $product->stock_quantity <= $product->low_stock_threshold;
            })->count(),
            'normal_stock' => $products->filter(function ($product) {
                return $product->stock_quantity > $product->low_stock_threshold && 
                       $product->stock_quantity <= ($product->max_stock_level ?? PHP_INT_MAX);
            })->count(),
            'overstock' => $products->filter(function ($product) {
                return $product->stock_quantity > ($product->max_stock_level ?? PHP_INT_MAX);
            })->count()
        ];
        
        return $stockRanges;
    }
    
    private function getMovementAnalysis(array $filters): array
    {
        $startDate = isset($filters['start_date']) ? 
            \Carbon\Carbon::parse($filters['start_date']) : 
            now()->subDays(30);
            
        $endDate = isset($filters['end_date']) ? 
            \Carbon\Carbon::parse($filters['end_date']) : 
            now();
        
        $movements = InventoryTransaction::whereBetween('created_at', [$startDate, $endDate])
            ->select('type', DB::raw('COUNT(*) as count'), DB::raw('SUM(ABS(quantity_change)) as total_quantity'))
            ->groupBy('type')
            ->get();
        
        return $movements->mapWithKeys(function ($movement) {
            return [$movement->type => [
                'count' => $movement->count,
                'total_quantity' => $movement->total_quantity
            ]];
        })->toArray();
    }
    
    private function getReorderRecommendations(array $filters): array
    {
        $query = Product::where('active', true)
            ->where('track_inventory', true)
            ->whereRaw('stock_quantity <= low_stock_threshold');
        
        if (isset($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }
        
        return $query->with('supplier')
            ->get()
            ->map(function ($product) {
                $recommendedQuantity = $this->calculateRecommendedOrderQuantity($product);
                
                return [
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'current_stock' => $product->stock_quantity,
                    'low_stock_threshold' => $product->low_stock_threshold,
                    'recommended_quantity' => $recommendedQuantity,
                    'estimated_cost' => $recommendedQuantity * $product->cost_price,
                    'supplier' => $product->supplier?->name,
                    'lead_time_days' => $product->supplier?->lead_time_days ?? 7
                ];
            })
            ->toArray();
    }
    
    private function getABCAnalysis(array $filters): array
    {
        // ABC Analysis based on sales value
        $query = Product::where('active', true)
            ->where('track_inventory', true)
            ->select('id', 'name', 'stock_quantity', 'cost_price', 'price')
            ->selectRaw('(SELECT COALESCE(SUM(oi.quantity * oi.price), 0) 
                         FROM order_items oi 
                         JOIN orders o ON oi.order_id = o.id 
                         WHERE oi.product_id = products.id 
                         AND o.created_at >= ?) as sales_value', [now()->subDays(90)]);
        
        if (isset($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }
        
        $products = $query->get()->sortByDesc('sales_value');
        $totalSalesValue = $products->sum('sales_value');
        
        $cumulativePercentage = 0;
        $classification = [];
        
        foreach ($products as $product) {
            $percentage = $totalSalesValue > 0 ? ($product->sales_value / $totalSalesValue) * 100 : 0;
            $cumulativePercentage += $percentage;
            
            $class = 'C';
            if ($cumulativePercentage <= 80) {
                $class = 'A';
            } elseif ($cumulativePercentage <= 95) {
                $class = 'B';
            }
            
            $classification[] = [
                'product_id' => $product->id,
                'product_name' => $product->name,
                'sales_value' => $product->sales_value,
                'percentage' => round($percentage, 2),
                'cumulative_percentage' => round($cumulativePercentage, 2),
                'class' => $class
            ];
        }
        
        return $classification;
    }
    
    private function calculateAverageStockDays(Collection $products): float
    {
        $totalDays = 0;
        $count = 0;
        
        foreach ($products as $product) {
            $dailySales = $this->getDailySalesRate($product);
            if ($dailySales > 0) {
                $stockDays = $product->stock_quantity / $dailySales;
                $totalDays += $stockDays;
                $count++;
            }
        }
        
        return $count > 0 ? round($totalDays / $count, 1) : 0;
    }
    
    private function getDailySalesRate(Product $product): float
    {
        $salesLast30Days = DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('order_items.product_id', $product->id)
            ->where('orders.created_at', '>=', now()->subDays(30))
            ->sum('order_items.quantity');
        
        return $salesLast30Days / 30;
    }
    
    private function calculateRecommendedOrderQuantity(Product $product): int
    {
        $dailySalesRate = $this->getDailySalesRate($product);
        $leadTimeDays = $product->supplier?->lead_time_days ?? 7;
        $safetyStock = $product->low_stock_threshold;
        
        // Economic Order Quantity calculation
        $demandDuringLeadTime = $dailySalesRate * $leadTimeDays;
        $recommendedQuantity = $demandDuringLeadTime + $safetyStock;
        
        return max((int) $recommendedQuantity, $product->reorder_quantity ?? 1);
    }
}
```

---

## ✅ **PART 2 COMPLETED**

**🎯 DELIVERED:**
- ✅ TradeGecko/Cin7 external provider implementation
- ✅ Background jobs για inventory sync και alerts
- ✅ Event listeners για real-time updates
- ✅ Comprehensive analytics service με ABC analysis
- ✅ Reorder recommendations system
- ✅ Stock movement tracking

**📁 FILES CREATED:**
- `TradeGeckoProvider.php` - External inventory provider
- `SyncInventoryLevels.php` - Background sync job
- `ProcessLowStockAlert.php` - Alert processing job
- `StockLevelUpdatedListener.php` - Event listener
- `InventoryAnalyticsService.php` - Analytics service

**🔄 NEXT:** Part 3 - Admin Dashboard & Configuration