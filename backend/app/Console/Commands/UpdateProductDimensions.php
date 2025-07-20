<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Product;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class UpdateProductDimensions extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'products:update-dimensions';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Update individual dimension columns from JSON dimensions field';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting to update product dimensions...');
        
        $products = Product::all();
        $updatedCount = 0;
        
        foreach ($products as $product) {
            $dimensions = null;
            
            // Parse dimensions from JSON if it's a string
            if (is_string($product->dimensions) && !empty($product->dimensions)) {
                $dimensions = json_decode($product->dimensions, true);
            } elseif (is_array($product->dimensions)) {
                $dimensions = $product->dimensions;
            }
            
            if ($dimensions) {
                $this->info("Updating dimensions for product #{$product->id}: {$product->name}");
                
                // Update individual columns from dimensions JSON
                $product->length_cm = $dimensions['length_cm'] ?? null;
                $product->width_cm = $dimensions['width_cm'] ?? null;
                $product->height_cm = $dimensions['height_cm'] ?? null;
                
                $product->save();
                $updatedCount++;
            }
        }
        
        $this->info("Completed! Updated dimensions for {$updatedCount} products.");
    }
}
