<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Product;
use App\Models\ProductCostBreakdown;

// Get all products
$products = Product::all();

echo "Found " . $products->count() . " products\n";

foreach ($products as $product) {
    // Check if product already has a cost breakdown
    if ($product->costBreakdown) {
        echo "Product #" . $product->id . " (" . $product->name . ") already has a cost breakdown\n";
        continue;
    }
    
    // Calculate random values for cost breakdown
    $price = $product->price;
    
    // Producer cost (40-60% of price)
    $producerCostPercentage = rand(40, 60) / 100;
    $producerCost = round($price * $producerCostPercentage, 2);
    
    // Packaging cost (5-15% of price)
    $packagingCostPercentage = rand(5, 15) / 100;
    $packagingCost = round($price * $packagingCostPercentage, 2);
    
    // Producer profit target (10-20% of price)
    $producerProfitPercentage = rand(10, 20) / 100;
    $producerProfit = round($price * $producerProfitPercentage, 2);
    
    // Platform fee percentage (5-10%)
    $platformFeePercentage = rand(5, 10);
    
    // Shipping estimate (2-5 euros)
    $shippingEstimate = round(rand(200, 500) / 100, 2);
    
    // Taxes estimate (13% VAT for food products in Greece)
    $taxesEstimate = round($price * 0.13, 2);
    
    // Create cost breakdown
    $breakdown = new ProductCostBreakdown();
    $breakdown->product_id = $product->id;
    $breakdown->producer_cost = $producerCost;
    $breakdown->packaging_cost = $packagingCost;
    $breakdown->producer_profit_target = $producerProfit;
    $breakdown->platform_fee_percentage = $platformFeePercentage;
    $breakdown->shipping_estimate = $shippingEstimate;
    $breakdown->taxes_estimate = $taxesEstimate;
    
    try {
        $breakdown->save();
        echo "Added cost breakdown for product #" . $product->id . " (" . $product->name . ")\n";
    } catch (\Exception $e) {
        echo "Error adding cost breakdown for product #" . $product->id . ": " . $e->getMessage() . "\n";
    }
}

echo "\nDone!\n";
