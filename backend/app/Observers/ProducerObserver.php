<?php

namespace App\Observers;

use App\Models\Producer;
use App\Models\ShippingZone;
use App\Models\DeliveryMethod;
use App\Models\ProducerShippingMethod;
use App\Models\ProducerFreeShipping;
use App\Models\ShippingRate;
use App\Models\WeightTier;
use Illuminate\Support\Facades\Log;

class ProducerObserver
{
    /**
     * Handle the Producer "created" event.
     */
    public function created(Producer $producer): void
    {
        try {
            // 1. Enable all delivery methods for the producer
            $this->setupDeliveryMethods($producer);

            // 2. Create default free shipping rules
            $this->setupFreeShippingRules($producer);

            // 3. Create default shipping rates
            $this->setupShippingRates($producer);

            // 4. Update the producer to use custom shipping rates
            $producer->uses_custom_shipping_rates = true;
            $producer->save();

            Log::info("Default shipping settings created for producer ID: {$producer->id}");
        } catch (\Exception $e) {
            Log::error("Failed to create default shipping settings for producer ID: {$producer->id}", [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }
    }

    /**
     * Setup delivery methods for the producer.
     */
    private function setupDeliveryMethods(Producer $producer): void
    {
        // Get all active delivery methods
        $deliveryMethods = DeliveryMethod::where('is_active', true)->get();

        // Enable all delivery methods for the producer
        foreach ($deliveryMethods as $method) {
            ProducerShippingMethod::create([
                'producer_id' => $producer->id,
                'delivery_method_id' => $method->id,
                'is_enabled' => true,
            ]);
        }
    }

    /**
     * Setup free shipping rules for the producer.
     */
    private function setupFreeShippingRules(Producer $producer): void
    {
        // Create a default free shipping rule for orders over 50€
        ProducerFreeShipping::create([
            'producer_id' => $producer->id,
            'free_shipping_threshold' => 50.00,
            'shipping_zone_id' => null, // All zones
            'delivery_method_id' => null, // All methods
            'is_active' => true,
        ]);
    }

    /**
     * Setup shipping rates for the producer.
     */
    private function setupShippingRates(Producer $producer): void
    {
        // Get all shipping zones
        $zones = ShippingZone::all();

        // Get all delivery methods
        $methods = DeliveryMethod::where('is_active', true)->get();

        // Get all weight tiers
        $weightTiers = WeightTier::all();

        // Create shipping rates for each zone, method, and weight tier
        foreach ($zones as $zone) {
            foreach ($methods as $method) {
                foreach ($weightTiers as $weightTier) {
                    // Default price based on zone and weight tier
                    $price = 5.00; // Default price

                    // Adjust price based on zone (example: higher rates for islands)
                    if (strtolower($zone->name) === 'νησιά' || strtolower($zone->name) === 'islands') {
                        $price = 8.00;
                    }

                    // Adjust price based on weight tier
                    if ($weightTier->max_weight_grams > 1000) {
                        $price += ($weightTier->max_weight_grams / 1000) * 0.5; // Add 0.50€ per kg
                    }

                    // Create the shipping rate
                    ShippingRate::create([
                        'producer_id' => $producer->id,
                        'shipping_zone_id' => $zone->id,
                        'weight_tier_id' => $weightTier->id,
                        'delivery_method_id' => $method->id,
                        'price' => $price,
                    ]);
                }
            }
        }
    }
}
