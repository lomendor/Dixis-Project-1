<?php

require __DIR__ . '/vendor/autoload.php';

use App\Models\Product;
use App\Models\ProductCategory;
use Illuminate\Support\Facades\DB;

// Load Laravel application
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "Starting to add products to categories...\n";

// Get all products
$products = Product::all();
echo "Found " . $products->count() . " products.\n";

// Get all categories
$categories = ProductCategory::all();
echo "Found " . $categories->count() . " categories.\n";

// Mapping of product names to category slugs
$productCategoryMap = [
    'Φέτα ΠΟΠ' => 'tyri',
    'Μέλι Ανθέων' => 'meli',
    'Βιολογικές Ελιές Καλαμών' => 'epitrapezies-elies',
    // Add more mappings as needed
];

// Add products to categories
foreach ($products as $product) {
    echo "Processing product: " . $product->name . " (ID: " . $product->id . ")\n";
    
    // Check if product already has categories
    $existingCategories = $product->categories()->count();
    if ($existingCategories > 0) {
        echo "  Product already has " . $existingCategories . " categories. Skipping.\n";
        continue;
    }
    
    // Find matching category based on product name
    $categorySlug = $productCategoryMap[$product->name] ?? null;
    
    if ($categorySlug) {
        $category = $categories->where('slug', $categorySlug)->first();
        
        if ($category) {
            echo "  Adding product to category: " . $category->name . " (ID: " . $category->id . ")\n";
            $product->categories()->attach($category->id);
        } else {
            echo "  No matching category found for slug: " . $categorySlug . "\n";
            
            // Fallback: Add to a default category
            $defaultCategory = $categories->first();
            if ($defaultCategory) {
                echo "  Adding product to default category: " . $defaultCategory->name . " (ID: " . $defaultCategory->id . ")\n";
                $product->categories()->attach($defaultCategory->id);
            }
        }
    } else {
        echo "  No category mapping found for product: " . $product->name . "\n";
        
        // Try to find a matching category based on product name
        $matchFound = false;
        foreach ($categories as $category) {
            if (stripos($product->name, $category->name) !== false || 
                stripos($category->name, $product->name) !== false) {
                echo "  Found matching category by name: " . $category->name . " (ID: " . $category->id . ")\n";
                $product->categories()->attach($category->id);
                $matchFound = true;
                break;
            }
        }
        
        // If no match found, add to the first category
        if (!$matchFound) {
            $defaultCategory = $categories->first();
            if ($defaultCategory) {
                echo "  Adding product to default category: " . $defaultCategory->name . " (ID: " . $defaultCategory->id . ")\n";
                $product->categories()->attach($defaultCategory->id);
            }
        }
    }
}

echo "Finished adding products to categories.\n";
