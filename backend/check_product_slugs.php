<?php

/**
 * Script για έλεγχο και διόρθωση product slugs
 * 
 * Εκτέλεση: php check_product_slugs.php
 */

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Product;
use Illuminate\Support\Str;

echo "=== Έλεγχος Product Slugs ===\n\n";

// Έλεγχος για products χωρίς slug
$productsWithoutSlug = Product::whereNull('slug')->orWhere('slug', '')->count();
echo "Products χωρίς slug: {$productsWithoutSlug}\n";

if ($productsWithoutSlug > 0) {
    echo "\nΔιόρθωση products χωρίς slug...\n";
    
    $products = Product::whereNull('slug')->orWhere('slug', '')->get();
    
    foreach ($products as $product) {
        $baseSlug = Str::slug($product->name);
        $slug = $baseSlug;
        $counter = 1;
        
        // Έλεγχος για μοναδικότητα
        while (Product::where('slug', $slug)->where('id', '!=', $product->id)->exists()) {
            $slug = $baseSlug . '-' . $counter;
            $counter++;
        }
        
        $product->slug = $slug;
        $product->save();
        
        echo "Product ID {$product->id}: '{$product->name}' -> slug: '{$slug}'\n";
    }
    
    echo "\nΔιόρθωση ολοκληρώθηκε!\n";
}

// Έλεγχος για διπλότυπα slugs
echo "\nΈλεγχος για διπλότυπα slugs...\n";
$duplicateSlugs = Product::select('slug')
    ->whereNotNull('slug')
    ->groupBy('slug')
    ->havingRaw('COUNT(*) > 1')
    ->pluck('slug');

if ($duplicateSlugs->count() > 0) {
    echo "Βρέθηκαν διπλότυπα slugs:\n";
    foreach ($duplicateSlugs as $slug) {
        $products = Product::where('slug', $slug)->get();
        echo "\nSlug '{$slug}' χρησιμοποιείται από:\n";
        foreach ($products as $product) {
            echo "  - ID {$product->id}: {$product->name}\n";
        }
    }
    
    echo "\nΔιόρθωση διπλότυπων...\n";
    foreach ($duplicateSlugs as $slug) {
        $products = Product::where('slug', $slug)->orderBy('id')->get();
        
        // Κρατάμε το πρώτο ως έχει
        foreach ($products->skip(1) as $index => $product) {
            $newSlug = $slug . '-' . ($index + 2);
            $product->slug = $newSlug;
            $product->save();
            echo "Product ID {$product->id} άλλαξε σε slug: '{$newSlug}'\n";
        }
    }
} else {
    echo "Δεν βρέθηκαν διπλότυπα slugs.\n";
}

// Τελική αναφορά
echo "\n=== Τελική Αναφορά ===\n";
$totalProducts = Product::count();
$productsWithSlug = Product::whereNotNull('slug')->where('slug', '!=', '')->count();
$uniqueSlugs = Product::whereNotNull('slug')->distinct('slug')->count('slug');

echo "Σύνολο products: {$totalProducts}\n";
echo "Products με slug: {$productsWithSlug}\n";
echo "Μοναδικά slugs: {$uniqueSlugs}\n";

if ($totalProducts === $productsWithSlug && $productsWithSlug === $uniqueSlugs) {
    echo "\n✅ Όλα τα products έχουν μοναδικά slugs!\n";
} else {
    echo "\n❌ Υπάρχουν ακόμα προβλήματα με τα slugs.\n";
}