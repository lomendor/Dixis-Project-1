<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Services\ShippingService; // Import the service
use App\Services\CacheInvalidationService; // Import cache service
use App\Models\Producer;
use App\Models\Product;
use App\Observers\ProducerObserver;
use App\Observers\ProductObserver;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Register ShippingService as a singleton
        $this->app->singleton(ShippingService::class, function ($app) {
            // Pass the paths to the CSV files if they are not in the default location
            // or if you want to make it configurable via .env
            // return new ShippingService(storage_path('app/shipping/postal_codes_to_zones.csv'), storage_path('app/shipping/default_shipping_rates.csv'));
            // If using default paths defined in the service constructor, just instantiate:
            return new ShippingService();
        });

        // Register CacheInvalidationService as a singleton
        $this->app->singleton(CacheInvalidationService::class, function ($app) {
            return new CacheInvalidationService();
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Register observers for cache invalidation
        Producer::observe(ProducerObserver::class);
        Product::observe(ProductObserver::class);
    }
}
