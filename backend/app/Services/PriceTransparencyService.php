<?php

namespace App\Services;

use App\Models\Product;
use App\Models\ProductCostBreakdown;
use App\Services\ShippingService;

class PriceTransparencyService
{
    protected $shippingService;

    public function __construct(ShippingService $shippingService)
    {
        $this->shippingService = $shippingService;
    }

    /**
     * Calculate the cost breakdown for a product
     *
     * @param Product $product
     * @return array
     */
    public function calculateBreakdown(Product $product)
    {
        $breakdown = $product->costBreakdown;
        $price = $product->price;

        // Get platform fee percentage (default 7% for retail)
        $platformFeePercentage = $breakdown && $breakdown->platform_fee_percentage
            ? $breakdown->platform_fee_percentage
            : 7.0;

        // Calculate platform fee
        $platformFee = $price * ($platformFeePercentage / 100);

        // Get VAT rate (default 13% for food products in Greece)
        $vatRate = 13.0;

        // Calculate VAT (13% for food products in Greece)
        $vatRate = 13;
        $vat = round($price * $vatRate / 113, 2); // VAT is included in the price

        // Calculate price without VAT
        $priceWithoutVat = $price - $vat;

        // Calculate platform fee
        $platformFee = round($priceWithoutVat * $platformFeePercentage / 100, 2);

        // Calculate producer value (the rest)
        $producerValue = round($priceWithoutVat - $platformFee, 2);

        // Verify that the sum equals the price
        $sum = $producerValue + $platformFee + $vat;
        if (abs($sum - $price) > 0.01) {
            // Adjust producer value to make it match
            $producerValue = round($producerValue + ($price - $sum), 2);
        }

        return [
            'price' => $price,
            'producer_value' => $producerValue,
            'platform_fee' => $platformFee,
            'platform_fee_percentage' => $platformFeePercentage,
            'vat' => $vat,
            'vat_rate' => $vatRate,
        ];
    }

    /**
     * Estimate shipping cost for a product
     *
     * @param Product $product
     * @return float
     */
    protected function estimateShipping(Product $product)
    {
        // Default shipping zone (Zone 1)
        $zoneId = 1;

        // Default delivery method (HOME)
        $deliveryMethodId = 1;

        // Get product weight in grams
        $weightGrams = $product->weight_grams;

        // Convert to kg
        $weightKg = $weightGrams / 1000;

        try {
            // Try to calculate shipping using the ShippingService
            $shippingData = [
                'zone_id' => $zoneId,
                'delivery_method_id' => $deliveryMethodId,
                'weight_kg' => $weightKg,
                'producer_id' => $product->producer_id,
            ];

            // Create a mock collection for the product
            $mockCartItems = collect([
                [
                    'product_id' => $product->id,
                    'quantity' => 1,
                    'product' => $product
                ]
            ]);

            // Create a mock address
            $mockAddress = new \App\Models\Address([
                'postal_code' => '10000', // Default postal code for Athens
                'city' => 'Athens',
                'country' => 'Greece'
            ]);

            // Calculate shipping
            $shippingResult = $this->shippingService->calculateShipping($mockCartItems, $mockAddress);

            // Get the first producer's first option cost
            $cost = 0;
            if (!empty($shippingResult['producers']) && !empty($shippingResult['producers'][0]['options'])) {
                $cost = $shippingResult['producers'][0]['options'][0]['cost'] ?? 2.90;
            } else {
                $cost = 2.90; // Default if no options found
            }

            return $cost;
        } catch (\Exception $e) {
            // If shipping calculation fails, return a default value
            return 2.90; // Default shipping cost of €2.90
        }
    }

    /**
     * Save or update cost breakdown for a product
     *
     * @param Product $product
     * @param array $data
     * @return ProductCostBreakdown
     */
    public function saveBreakdown(Product $product, array $data)
    {
        $breakdown = $product->costBreakdown;

        if (!$breakdown) {
            $breakdown = new ProductCostBreakdown();
            $breakdown->product_id = $product->id;
        }

        $breakdown->producer_cost = $data['producer_cost'] ?? null;
        $breakdown->packaging_cost = $data['packaging_cost'] ?? null;
        $breakdown->producer_profit_target = $data['producer_profit_target'] ?? null;
        $breakdown->platform_fee_percentage = $data['platform_fee_percentage'] ?? 7.0;
        $breakdown->shipping_estimate = $data['shipping_estimate'] ?? null;
        $breakdown->taxes_estimate = $data['taxes_estimate'] ?? null;

        $breakdown->save();

        return $breakdown;
    }
}
