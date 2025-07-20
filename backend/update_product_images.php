<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Support\Facades\DB;

// Update product main_image field
$products = Product::all();
echo "Found " . $products->count() . " products\n";

foreach ($products as $product) {
    echo "Processing product: " . $product->name . " (ID: " . $product->id . ")\n";
    
    // Get product images
    $images = ProductImage::where('product_id', $product->id)->get();
    
    if ($images->count() > 0) {
        // Get the first image
        $image = $images->first();
        
        // Update the product's main_image field
        $product->main_image = $image->image_path;
        $product->save();
        
        echo "Updated main_image for product: " . $product->name . " to " . $image->image_path . "\n";
    } else {
        echo "No images found for product: " . $product->name . "\n";
    }
}

echo "\nDone!\n";
