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
    // Check if product has a cost breakdown
    if (!$product->costBreakdown) {
        echo "Product #" . $product->id . " (" . $product->name . ") doesn't have a cost breakdown, skipping\n";
        continue;
    }
    
    // Get the product price
    $price = $product->price;
    
    // Get the cost breakdown
    $breakdown = $product->costBreakdown;
    
    // Calculate new values
    
    // VAT (13% for food products in Greece)
    $vatRate = 13;
    $vat = round($price * $vatRate / 113, 2); // VAT is included in the price
    
    // Platform fee (5-10% of price without VAT)
    $priceWithoutVat = $price - $vat;
    $platformFeePercentage = rand(5, 10);
    $platformFee = round($priceWithoutVat * $platformFeePercentage / 100, 2);
    
    // Producer value (the rest)
    $producerValue = round($priceWithoutVat - $platformFee, 2);
    
    // Update the cost breakdown
    $breakdown->producer_value = $producerValue;
    $breakdown->platform_fee = $platformFee;
    $breakdown->platform_fee_percentage = $platformFeePercentage;
    $breakdown->vat = $vat;
    $breakdown->vat_rate = $vatRate;
    
    // Verify that the sum equals the price
    $sum = $producerValue + $platformFee + $vat;
    if (abs($sum - $price) > 0.01) {
        echo "Warning: Sum ($sum) doesn't equal price ($price) for product #" . $product->id . " (" . $product->name . ")\n";
        echo "Adjusting producer value to make it match...\n";
        $producerValue = round($producerValue + ($price - $sum), 2);
        $breakdown->producer_value = $producerValue;
        $sum = $producerValue + $platformFee + $vat;
        echo "New sum: $sum\n";
    }
    
    try {
        $breakdown->save();
        echo "Updated cost breakdown for product #" . $product->id . " (" . $product->name . ")\n";
        echo "  Price: $price\n";
        echo "  Producer value: $producerValue\n";
        echo "  Platform fee: $platformFee ($platformFeePercentage%)\n";
        echo "  VAT: $vat ($vatRate%)\n";
        echo "  Sum: $sum\n";
    } catch (\Exception $e) {
        echo "Error updating cost breakdown for product #" . $product->id . ": " . $e->getMessage() . "\n";
    }
}

echo "\nDone!\n";
