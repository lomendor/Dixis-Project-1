<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Product;
use App\Models\ProductImage;
use App\Models\AdoptableItem;
use Illuminate\Support\Facades\Storage;

// Create a simple placeholder image for products
function createPlaceholderImage($filename, $text, $width = 800, $height = 600, $bgColor = [255, 255, 255], $textColor = [0, 0, 0]) {
    // Create image
    $image = imagecreatetruecolor($width, $height);
    
    // Set background color
    $bg = imagecolorallocate($image, $bgColor[0], $bgColor[1], $bgColor[2]);
    imagefill($image, 0, 0, $bg);
    
    // Set text color
    $color = imagecolorallocate($image, $textColor[0], $textColor[1], $textColor[2]);
    
    // Get text size
    $font = 5; // Built-in font
    $textWidth = imagefontwidth($font) * strlen($text);
    $textHeight = imagefontheight($font);
    
    // Center text
    $x = ($width - $textWidth) / 2;
    $y = ($height - $textHeight) / 2;
    
    // Add text
    imagestring($image, $font, $x, $y, $text, $color);
    
    // Save image
    imagepng($image, $filename);
    imagedestroy($image);
    
    echo "Created placeholder image: $filename\n";
}

// Update product images
$products = Product::all();
echo "Found " . $products->count() . " products\n";

foreach ($products as $product) {
    echo "Processing product: " . $product->name . " (ID: " . $product->id . ")\n";
    
    // Get product images
    $images = ProductImage::where('product_id', $product->id)->get();
    
    if ($images->count() > 0) {
        foreach ($images as $image) {
            $imagePath = storage_path('app/public/' . $image->image_path);
            $directory = dirname($imagePath);
            
            // Create directory if it doesn't exist
            if (!file_exists($directory)) {
                mkdir($directory, 0755, true);
            }
            
            // Create placeholder image
            createPlaceholderImage($imagePath, $product->name);
            
            echo "Updated image for product: " . $product->name . "\n";
        }
    } else {
        echo "No images found for product: " . $product->name . "\n";
    }
}

// Update adoptable item images
$adoptableItems = AdoptableItem::all();
echo "\nFound " . $adoptableItems->count() . " adoptable items\n";

foreach ($adoptableItems as $item) {
    echo "Processing adoptable item: " . $item->name . " (ID: " . $item->id . ")\n";
    
    // Create main image
    if ($item->main_image) {
        $imagePath = storage_path('app/public/' . $item->main_image);
        $directory = dirname($imagePath);
        
        // Create directory if it doesn't exist
        if (!file_exists($directory)) {
            mkdir($directory, 0755, true);
        }
        
        // Create placeholder image
        createPlaceholderImage($imagePath, $item->name, 800, 600, [200, 230, 255], [0, 0, 100]);
        
        echo "Updated main image for adoptable item: " . $item->name . "\n";
    }
    
    // Create gallery images
    if ($item->gallery_images) {
        $galleryImages = json_decode($item->gallery_images, true);
        
        if (is_array($galleryImages)) {
            foreach ($galleryImages as $index => $galleryImage) {
                $imagePath = storage_path('app/public/' . $galleryImage);
                $directory = dirname($imagePath);
                
                // Create directory if it doesn't exist
                if (!file_exists($directory)) {
                    mkdir($directory, 0755, true);
                }
                
                // Create placeholder image
                createPlaceholderImage($imagePath, $item->name . " " . ($index + 1), 800, 600, [200, 230, 255], [0, 0, 100]);
                
                echo "Updated gallery image for adoptable item: " . $item->name . "\n";
            }
        }
    }
}

echo "\nDone!\n";
