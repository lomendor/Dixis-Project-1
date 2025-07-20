<?php

namespace App\Services\Integrations\Inventory;

use App\Models\Product;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\IntegrationSetting;
use App\Models\IntegrationLog;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class InventoryManagementService
{
    protected $tenantId;

    public function __construct()
    {
        $this->tenantId = auth()->user()->tenant_id ?? 1;
    }

    /**
     * Automated stock level monitoring and alerts
     */
    public function monitorStockLevels(): array
    {
        try {
            $lowStockProducts = Product::where('stock', '<=', DB::raw('low_stock_threshold'))
                                     ->where('is_active', true)
                                     ->with('producer')
                                     ->get();

            $outOfStockProducts = Product::where('stock', '<=', 0)
                                        ->where('is_active', true)
                                        ->with('producer')
                                        ->get();

            $alerts = [];

            foreach ($lowStockProducts as $product) {
                $alerts[] = [
                    'type' => 'low_stock',
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'producer_name' => $product->producer->business_name,
                    'current_stock' => $product->stock,
                    'threshold' => $product->low_stock_threshold ?? 10,
                    'severity' => 'warning'
                ];
            }

            foreach ($outOfStockProducts as $product) {
                $alerts[] = [
                    'type' => 'out_of_stock',
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'producer_name' => $product->producer->business_name,
                    'current_stock' => $product->stock,
                    'severity' => 'critical'
                ];
            }

            // Log monitoring activity
            $this->logActivity('stock_monitoring', [
                'low_stock_count' => $lowStockProducts->count(),
                'out_of_stock_count' => $outOfStockProducts->count(),
                'total_alerts' => count($alerts)
            ]);

            return [
                'success' => true,
                'alerts' => $alerts,
                'summary' => [
                    'low_stock_products' => $lowStockProducts->count(),
                    'out_of_stock_products' => $outOfStockProducts->count(),
                    'total_alerts' => count($alerts)
                ]
            ];
        } catch (\Exception $e) {
            Log::error('Inventory monitoring failed: ' . $e->getMessage());
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Automated reorder suggestions based on sales velocity
     */
    public function generateReorderSuggestions(): array
    {
        try {
            $suggestions = [];
            $products = Product::where('is_active', true)
                              ->with(['producer', 'orderItems' => function($query) {
                                  $query->where('created_at', '>=', Carbon::now()->subDays(30));
                              }])
                              ->get();

            foreach ($products as $product) {
                $salesVelocity = $this->calculateSalesVelocity($product);
                $daysUntilStockout = $this->calculateDaysUntilStockout($product, $salesVelocity);
                
                if ($daysUntilStockout <= 14 && $daysUntilStockout > 0) {
                    $suggestions[] = [
                        'product_id' => $product->id,
                        'product_name' => $product->name,
                        'producer_name' => $product->producer->business_name,
                        'current_stock' => $product->stock,
                        'sales_velocity' => $salesVelocity,
                        'days_until_stockout' => $daysUntilStockout,
                        'suggested_reorder_quantity' => $this->calculateReorderQuantity($product, $salesVelocity),
                        'priority' => $daysUntilStockout <= 7 ? 'high' : 'medium'
                    ];
                }
            }

            // Sort by priority and days until stockout
            usort($suggestions, function($a, $b) {
                if ($a['priority'] === $b['priority']) {
                    return $a['days_until_stockout'] <=> $b['days_until_stockout'];
                }
                return $a['priority'] === 'high' ? -1 : 1;
            });

            $this->logActivity('reorder_suggestions', [
                'suggestions_count' => count($suggestions),
                'high_priority' => count(array_filter($suggestions, fn($s) => $s['priority'] === 'high'))
            ]);

            return [
                'success' => true,
                'suggestions' => $suggestions,
                'summary' => [
                    'total_suggestions' => count($suggestions),
                    'high_priority' => count(array_filter($suggestions, fn($s) => $s['priority'] === 'high')),
                    'medium_priority' => count(array_filter($suggestions, fn($s) => $s['priority'] === 'medium'))
                ]
            ];
        } catch (\Exception $e) {
            Log::error('Reorder suggestions failed: ' . $e->getMessage());
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Automated stock adjustments based on order fulfillment
     */
    public function processStockAdjustments(Order $order): array
    {
        try {
            DB::beginTransaction();

            $adjustments = [];
            foreach ($order->items as $item) {
                $product = $item->product;
                $oldStock = $product->stock;
                $newStock = max(0, $oldStock - $item->quantity);
                
                $product->update(['stock' => $newStock]);
                
                $adjustments[] = [
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'old_stock' => $oldStock,
                    'new_stock' => $newStock,
                    'adjustment' => -$item->quantity,
                    'reason' => 'order_fulfillment',
                    'order_id' => $order->id
                ];

                // Check if product needs reorder alert
                if ($newStock <= ($product->low_stock_threshold ?? 10)) {
                    $this->triggerLowStockAlert($product);
                }
            }

            DB::commit();

            $this->logActivity('stock_adjustment', [
                'order_id' => $order->id,
                'adjustments_count' => count($adjustments),
                'total_quantity_reduced' => array_sum(array_column($adjustments, 'adjustment'))
            ]);

            return [
                'success' => true,
                'adjustments' => $adjustments,
                'order_id' => $order->id
            ];
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Stock adjustment failed: ' . $e->getMessage());
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Calculate sales velocity (units per day)
     */
    private function calculateSalesVelocity(Product $product): float
    {
        $totalSold = $product->orderItems()
                            ->where('created_at', '>=', Carbon::now()->subDays(30))
                            ->sum('quantity');
        
        return $totalSold / 30; // units per day
    }

    /**
     * Calculate days until stockout
     */
    private function calculateDaysUntilStockout(Product $product, float $salesVelocity): int
    {
        if ($salesVelocity <= 0) {
            return 999; // Effectively infinite
        }
        
        return (int) ceil($product->stock / $salesVelocity);
    }

    /**
     * Calculate suggested reorder quantity
     */
    private function calculateReorderQuantity(Product $product, float $salesVelocity): int
    {
        // Suggest 30 days worth of inventory plus safety stock
        $safetyStock = $salesVelocity * 7; // 7 days safety stock
        $reorderQuantity = ($salesVelocity * 30) + $safetyStock;
        
        return max(10, (int) ceil($reorderQuantity)); // Minimum 10 units
    }

    /**
     * Trigger low stock alert
     */
    private function triggerLowStockAlert(Product $product): void
    {
        // This would typically send notifications to producers/admins
        Log::info("Low stock alert for product: {$product->name} (ID: {$product->id})");
        
        // TODO: Implement notification system
        // - Email to producer
        // - Admin dashboard notification
        // - SMS alert if critical
    }

    /**
     * Log integration activity
     */
    private function logActivity(string $action, array $data): void
    {
        IntegrationLog::create([
            'tenant_id' => $this->tenantId,
            'service' => 'inventory_management',
            'action' => $action,
            'data' => $data,
            'status' => 'success',
            'created_at' => now()
        ]);
    }

    /**
     * Get inventory analytics
     */
    public function getInventoryAnalytics(): array
    {
        try {
            $totalProducts = Product::where('is_active', true)->count();
            $lowStockProducts = Product::where('stock', '<=', DB::raw('COALESCE(low_stock_threshold, 10)'))
                                      ->where('is_active', true)
                                      ->count();
            $outOfStockProducts = Product::where('stock', '<=', 0)
                                        ->where('is_active', true)
                                        ->count();
            
            $totalInventoryValue = Product::where('is_active', true)
                                         ->selectRaw('SUM(stock * price) as total_value')
                                         ->first()
                                         ->total_value ?? 0;

            $topSellingProducts = Product::withCount(['orderItems' => function($query) {
                                            $query->where('created_at', '>=', Carbon::now()->subDays(30));
                                        }])
                                        ->orderBy('order_items_count', 'desc')
                                        ->limit(10)
                                        ->get();

            return [
                'success' => true,
                'analytics' => [
                    'total_products' => $totalProducts,
                    'low_stock_products' => $lowStockProducts,
                    'out_of_stock_products' => $outOfStockProducts,
                    'stock_health_percentage' => $totalProducts > 0 ? 
                        round((($totalProducts - $lowStockProducts) / $totalProducts) * 100, 2) : 0,
                    'total_inventory_value' => $totalInventoryValue,
                    'top_selling_products' => $topSellingProducts
                ]
            ];
        } catch (\Exception $e) {
            Log::error('Inventory analytics failed: ' . $e->getMessage());
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }
}
