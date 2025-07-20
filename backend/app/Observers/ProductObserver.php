<?php

namespace App\Observers;

use App\Models\Product;
use App\Services\CacheInvalidationService;
use Illuminate\Support\Facades\Log;

class ProductObserver
{
    protected $cacheService;

    public function __construct(CacheInvalidationService $cacheService)
    {
        $this->cacheService = $cacheService;
    }

    /**
     * Handle the Product "created" event.
     */
    public function created(Product $product): void
    {
        try {
            $this->cacheService->invalidateProductCaches($product, 'created');
            
            Log::info('Product created, cache invalidated', [
                'product_id' => $product->id,
                'product_name' => $product->name,
                'producer_id' => $product->producer_id
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to handle product created event', [
                'product_id' => $product->id,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Handle the Product "updated" event.
     */
    public function updated(Product $product): void
    {
        try {
            $this->cacheService->invalidateProductCaches($product, 'updated');
            
            // Check if critical fields changed
            $criticalFields = ['is_active', 'is_featured', 'price', 'discount_price', 'stock'];
            $changedCriticalFields = array_intersect($criticalFields, array_keys($product->getDirty()));
            
            if (!empty($changedCriticalFields)) {
                Log::info('Product updated with critical changes, cache invalidated', [
                    'product_id' => $product->id,
                    'changed_fields' => $changedCriticalFields
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Failed to handle product updated event', [
                'product_id' => $product->id,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Handle the Product "deleted" event.
     */
    public function deleted(Product $product): void
    {
        try {
            $this->cacheService->invalidateProductCaches($product, 'deleted');
            
            Log::info('Product deleted, cache invalidated', [
                'product_id' => $product->id,
                'product_name' => $product->name
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to handle product deleted event', [
                'product_id' => $product->id,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Handle the Product "restored" event.
     */
    public function restored(Product $product): void
    {
        try {
            $this->cacheService->invalidateProductCaches($product, 'restored');
            
            Log::info('Product restored, cache invalidated', [
                'product_id' => $product->id,
                'product_name' => $product->name
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to handle product restored event', [
                'product_id' => $product->id,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Handle the Product "force deleted" event.
     */
    public function forceDeleted(Product $product): void
    {
        try {
            $this->cacheService->invalidateProductCaches($product, 'force_deleted');
            
            Log::info('Product force deleted, cache invalidated', [
                'product_id' => $product->id,
                'product_name' => $product->name
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to handle product force deleted event', [
                'product_id' => $product->id,
                'error' => $e->getMessage()
            ]);
        }
    }
}
