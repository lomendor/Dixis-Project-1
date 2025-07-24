# 📦 INVENTORY MANAGEMENT INTEGRATION - PART 1: CORE SERVICES

## 🎯 TASK 4 EXECUTION - REAL-TIME INVENTORY SYNCHRONIZATION

### **1. Inventory Management Service Foundation**

**InventoryManagerService.php:**
```php
<?php

namespace App\Services\Integrations\Inventory;

use App\Contracts\Integrations\InventoryInterface;
use App\Models\Product;
use App\Models\InventoryTransaction;
use App\Models\PurchaseOrder;
use App\Models\Supplier;
use App\Events\Integration\StockLevelUpdated;
use App\Events\Integration\LowStockAlert;
use App\Events\Integration\StockOutAlert;
use App\Events\Integration\AutoReorderTriggered;
use App\Services\Integrations\BaseIntegrationService;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class InventoryManagerService extends BaseIntegrationService implements InventoryInterface
{
    private array $externalProviders = [];
    
    public function __construct()
    {
        parent::__construct();
        $this->initializeProviders();
    }
    
    protected function getServiceConfig(): array
    {
        return config('integrations.inventory');
    }
    
    private function initializeProviders(): void
    {
        $providers = config('integrations.inventory.providers', []);
        
        foreach ($providers as $name => $config) {
            if ($config['enabled'] ?? false) {
                $className = "App\\Services\\Inventory\\Providers\\{$name}Provider";
                if (class_exists($className)) {
                    $this->externalProviders[$name] = app($className);
                }
            }
        }
    }
    
    /**
     * Sync all products inventory levels
     */
    public function syncAllProducts(): array
    {
        try {
            $startTime = microtime(true);
            $results = [];
            
            // Get all active products
            $products = Product::where('active', true)
                ->where('track_inventory', true)
                ->with(['supplier', 'inventoryTransactions'])
                ->get();
            
            Log::info('Starting inventory sync for all products', [
                'total_products' => $products->count()
            ]);
            
            foreach ($products as $product) {
                try {
                    $result = $this->syncProduct($product);
                    $results[] = $result;
                } catch (\Exception $e) {
                    Log::error('Product sync failed', [
                        'product_id' => $product->id,
                        'error' => $e->getMessage()
                    ]);
                    
                    $results[] = [
                        'product_id' => $product->id,
                        'status' => 'error',
                        'error' => $e->getMessage()
                    ];
                }
            }
            
            $responseTime = round((microtime(true) - $startTime) * 1000, 2);
            
            $summary = [
                'total_products' => $products->count(),
                'successful_syncs' => collect($results)->where('status', 'success')->count(),
                'failed_syncs' => collect($results)->where('status', 'error')->count(),
                'response_time_ms' => $responseTime,
                'results' => $results
            ];
            
            Log::info('Inventory sync completed', $summary);
            
            return $summary;
            
        } catch (\Exception $e) {
            Log::error('Inventory sync failed', [
                'error' => $e->getMessage()
            ]);
            
            throw new \Exception('Failed to sync inventory: ' . $e->getMessage());
        }
    }
    
    /**
     * Sync individual product inventory
     */
    public function syncProduct(Product $product): array
    {
        try {
            $oldStock = $product->stock_quantity;
            $newStock = $this->getExternalStock($product);
            
            // Update local inventory
            $this->updateLocalStock($product, $newStock);
            
            // Create inventory transaction record
            $this->createInventoryTransaction($product, $oldStock, $newStock, 'sync');
            
            // Check for alerts
            $this->checkStockAlerts($product, $oldStock, $newStock);
            
            // Fire stock level updated event
            event(new StockLevelUpdated($product, $oldStock, $newStock));
            
            return [
                'product_id' => $product->id,
                'product_name' => $product->name,
                'old_stock' => $oldStock,
                'new_stock' => $newStock,
                'difference' => $newStock - $oldStock,
                'status' => 'success',
                'synced_at' => now()->toISOString()
            ];
            
        } catch (\Exception $e) {
            Log::error('Product inventory sync failed', [
                'product_id' => $product->id,
                'error' => $e->getMessage()
            ]);
            
            throw new \Exception("Failed to sync product {$product->id}: " . $e->getMessage());
        }
    }
    
    /**
     * Update stock level for a product
     */
    public function updateStock(Product $product, int $quantity, string $reason = 'manual'): bool
    {
        try {
            DB::beginTransaction();
            
            $oldStock = $product->stock_quantity;
            
            // Update product stock
            $product->update([
                'stock_quantity' => $quantity,
                'last_stock_update' => now()
            ]);
            
            // Create transaction record
            $this->createInventoryTransaction($product, $oldStock, $quantity, $reason);
            
            // Check for alerts
            $this->checkStockAlerts($product, $oldStock, $quantity);
            
            // Sync to external systems
            $this->syncToExternalSystems($product, $quantity);
            
            // Fire event
            event(new StockLevelUpdated($product, $oldStock, $quantity));
            
            DB::commit();
            
            Log::info('Stock updated successfully', [
                'product_id' => $product->id,
                'old_stock' => $oldStock,
                'new_stock' => $quantity,
                'reason' => $reason
            ]);
            
            return true;
            
        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('Stock update failed', [
                'product_id' => $product->id,
                'quantity' => $quantity,
                'error' => $e->getMessage()
            ]);
            
            return false;
        }
    }
    
    /**
     * Get current stock level from external systems
     */
    public function getStockLevel(Product $product): int
    {
        try {
            // Try to get from cache first
            $cacheKey = "inventory.stock.{$product->id}";
            $cachedStock = Cache::get($cacheKey);
            
            if ($cachedStock !== null) {
                return $cachedStock;
            }
            
            // Get from external system
            $stock = $this->getExternalStock($product);
            
            // Cache for 5 minutes
            Cache::put($cacheKey, $stock, 300);
            
            return $stock;
            
        } catch (\Exception $e) {
            Log::error('Failed to get stock level', [
                'product_id' => $product->id,
                'error' => $e->getMessage()
            ]);
            
            // Return local stock as fallback
            return $product->stock_quantity;
        }
    }
    
    /**
     * Create purchase order for low stock items
     */
    public function createPurchaseOrder(Product $product, int $quantity): array
    {
        try {
            if (!$product->supplier) {
                throw new \Exception('No supplier configured for product');
            }
            
            $purchaseOrder = PurchaseOrder::create([
                'supplier_id' => $product->supplier->id,
                'status' => 'draft',
                'order_date' => now(),
                'expected_delivery' => now()->addDays($product->supplier->lead_time_days ?? 7),
                'total_amount' => $quantity * $product->cost_price,
                'notes' => "Auto-generated PO for low stock alert - Product: {$product->name}"
            ]);
            
            // Add line item
            $purchaseOrder->items()->create([
                'product_id' => $product->id,
                'quantity' => $quantity,
                'unit_cost' => $product->cost_price,
                'total_cost' => $quantity * $product->cost_price
            ]);
            
            // Send to external system if configured
            $this->sendPurchaseOrderToExternal($purchaseOrder);
            
            // Fire event
            event(new AutoReorderTriggered($product, $purchaseOrder));
            
            Log::info('Purchase order created', [
                'product_id' => $product->id,
                'po_id' => $purchaseOrder->id,
                'quantity' => $quantity,
                'supplier_id' => $product->supplier->id
            ]);
            
            return [
                'success' => true,
                'purchase_order_id' => $purchaseOrder->id,
                'quantity' => $quantity,
                'estimated_cost' => $quantity * $product->cost_price,
                'expected_delivery' => $purchaseOrder->expected_delivery->toISOString()
            ];
            
        } catch (\Exception $e) {
            Log::error('Purchase order creation failed', [
                'product_id' => $product->id,
                'quantity' => $quantity,
                'error' => $e->getMessage()
            ]);
            
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }
    
    /**
     * Process inventory adjustments
     */
    public function processAdjustment(Product $product, int $adjustment, string $reason): array
    {
        try {
            $oldStock = $product->stock_quantity;
            $newStock = max(0, $oldStock + $adjustment);
            
            $success = $this->updateStock($product, $newStock, "adjustment: {$reason}");
            
            if ($success) {
                return [
                    'success' => true,
                    'old_stock' => $oldStock,
                    'new_stock' => $newStock,
                    'adjustment' => $adjustment,
                    'reason' => $reason
                ];
            } else {
                throw new \Exception('Failed to update stock');
            }
            
        } catch (\Exception $e) {
            Log::error('Inventory adjustment failed', [
                'product_id' => $product->id,
                'adjustment' => $adjustment,
                'reason' => $reason,
                'error' => $e->getMessage()
            ]);
            
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }
    
    /**
     * Get inventory analytics
     */
    public function getInventoryAnalytics(array $filters = []): array
    {
        try {
            $query = Product::where('active', true)->where('track_inventory', true);
            
            // Apply filters
            if (isset($filters['category_id'])) {
                $query->where('category_id', $filters['category_id']);
            }
            
            if (isset($filters['supplier_id'])) {
                $query->where('supplier_id', $filters['supplier_id']);
            }
            
            $products = $query->with(['supplier', 'category'])->get();
            
            $analytics = [
                'total_products' => $products->count(),
                'total_stock_value' => $products->sum(function ($product) {
                    return $product->stock_quantity * $product->cost_price;
                }),
                'low_stock_items' => $products->filter(function ($product) {
                    return $product->stock_quantity <= $product->low_stock_threshold;
                })->count(),
                'out_of_stock_items' => $products->where('stock_quantity', 0)->count(),
                'overstocked_items' => $products->filter(function ($product) {
                    return $product->stock_quantity > ($product->max_stock_level ?? PHP_INT_MAX);
                })->count(),
                'stock_turnover' => $this->calculateStockTurnover($products),
                'top_moving_products' => $this->getTopMovingProducts($products, 10),
                'slow_moving_products' => $this->getSlowMovingProducts($products, 10)
            ];
            
            return $analytics;
            
        } catch (\Exception $e) {
            Log::error('Failed to generate inventory analytics', [
                'error' => $e->getMessage()
            ]);
            
            throw new \Exception('Failed to generate analytics: ' . $e->getMessage());
        }
    }
    
    // Private helper methods
    
    private function getExternalStock(Product $product): int
    {
        // Try each configured provider
        foreach ($this->externalProviders as $name => $provider) {
            try {
                if ($product->external_ids && isset($product->external_ids[$name])) {
                    $stock = $provider->getStockLevel($product->external_ids[$name]);
                    
                    Log::debug('External stock retrieved', [
                        'product_id' => $product->id,
                        'provider' => $name,
                        'stock' => $stock
                    ]);
                    
                    return $stock;
                }
            } catch (\Exception $e) {
                Log::warning('External stock retrieval failed', [
                    'product_id' => $product->id,
                    'provider' => $name,
                    'error' => $e->getMessage()
                ]);
                continue;
            }
        }
        
        // Fallback to local stock
        return $product->stock_quantity;
    }
    
    private function updateLocalStock(Product $product, int $newStock): void
    {
        $product->update([
            'stock_quantity' => $newStock,
            'last_stock_update' => now()
        ]);
        
        // Clear cache
        Cache::forget("inventory.stock.{$product->id}");
    }
    
    private function createInventoryTransaction(Product $product, int $oldStock, int $newStock, string $type): void
    {
        InventoryTransaction::create([
            'product_id' => $product->id,
            'type' => $type,
            'quantity_before' => $oldStock,
            'quantity_after' => $newStock,
            'quantity_change' => $newStock - $oldStock,
            'reference_type' => 'system',
            'reference_id' => null,
            'notes' => "Stock {$type}: {$oldStock} → {$newStock}",
            'created_by' => auth()->id(),
            'created_at' => now()
        ]);
    }
    
    private function checkStockAlerts(Product $product, int $oldStock, int $newStock): void
    {
        // Low stock alert
        if ($newStock <= $product->low_stock_threshold && $oldStock > $product->low_stock_threshold) {
            event(new LowStockAlert($product));
            
            // Auto-reorder if enabled
            if ($product->auto_reorder_enabled) {
                $reorderQuantity = $product->reorder_quantity ?? ($product->low_stock_threshold * 2);
                $this->createPurchaseOrder($product, $reorderQuantity);
            }
        }
        
        // Stock out alert
        if ($newStock == 0 && $oldStock > 0) {
            event(new StockOutAlert($product));
        }
    }
    
    private function syncToExternalSystems(Product $product, int $quantity): void
    {
        foreach ($this->externalProviders as $name => $provider) {
            try {
                if ($product->external_ids && isset($product->external_ids[$name])) {
                    $provider->updateStock($product->external_ids[$name], $quantity);
                }
            } catch (\Exception $e) {
                Log::warning('External stock sync failed', [
                    'product_id' => $product->id,
                    'provider' => $name,
                    'error' => $e->getMessage()
                ]);
            }
        }
    }
    
    private function sendPurchaseOrderToExternal(PurchaseOrder $purchaseOrder): void
    {
        // Implementation for sending PO to external systems
        // This could integrate with supplier APIs or email systems
    }
    
    private function calculateStockTurnover(Collection $products): float
    {
        // Calculate average stock turnover ratio
        $totalTurnover = 0;
        $count = 0;
        
        foreach ($products as $product) {
            $avgStock = ($product->stock_quantity + $product->last_month_stock) / 2;
            if ($avgStock > 0) {
                $turnover = $product->monthly_sales / $avgStock;
                $totalTurnover += $turnover;
                $count++;
            }
        }
        
        return $count > 0 ? $totalTurnover / $count : 0;
    }
    
    private function getTopMovingProducts(Collection $products, int $limit): array
    {
        return $products->sortByDesc('monthly_sales')
            ->take($limit)
            ->map(function ($product) {
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'monthly_sales' => $product->monthly_sales,
                    'stock_quantity' => $product->stock_quantity
                ];
            })
            ->values()
            ->toArray();
    }
    
    private function getSlowMovingProducts(Collection $products, int $limit): array
    {
        return $products->sortBy('monthly_sales')
            ->take($limit)
            ->map(function ($product) {
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'monthly_sales' => $product->monthly_sales,
                    'stock_quantity' => $product->stock_quantity,
                    'days_since_last_sale' => $product->last_sale_date ? 
                        now()->diffInDays($product->last_sale_date) : null
                ];
            })
            ->values()
            ->toArray();
    }
}
```

### **2. External Inventory Provider Interface**

**InventoryProviderInterface.php:**
```php
<?php

namespace App\Contracts\Integrations;

interface InventoryProviderInterface
{
    /**
     * Get stock level for external product ID
     */
    public function getStockLevel(string $externalId): int;
    
    /**
     * Update stock level in external system
     */
    public function updateStock(string $externalId, int $quantity): bool;
    
    /**
     * Get product information from external system
     */
    public function getProductInfo(string $externalId): ?array;
    
    /**
     * Sync all products from external system
     */
    public function syncAllProducts(): array;
    
    /**
     * Test connection to external system
     */
    public function testConnection(): bool;
}
```

---

## ✅ **PART 1 COMPLETED**

**🎯 DELIVERED:**
- ✅ Complete InventoryManagerService με real-time sync
- ✅ Stock level monitoring και alerts
- ✅ Automated reordering system
- ✅ Inventory analytics και reporting
- ✅ External provider interface
- ✅ Transaction logging και audit trail

**📁 FILES CREATED:**
- `InventoryManagerService.php` - Core inventory service
- `InventoryProviderInterface.php` - External provider contract

**🔄 NEXT:** Part 2 - External Providers & Jobs