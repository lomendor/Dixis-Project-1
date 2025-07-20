<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Producer;
use App\Models\Product;
use App\Models\ProductCategory;
use Illuminate\Support\Facades\DB;

class ComprehensiveDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * Creates realistic Greek producers and products with proper relationships
     */
    public function run(): void
    {
        $this->command->info('🌱 Starting comprehensive data seeding...');

        DB::beginTransaction();

        try {
            // Step 1: Create 15 realistic Greek producers
            $this->command->info('👨‍🌾 Creating 15 Greek producers...');
            $producers = Producer::factory()->count(15)->create();
            $this->command->info("✅ Created {$producers->count()} producers");

            // Step 2: Get our clean categories
            $categories = ProductCategory::all()->keyBy('slug');
            $this->command->info("📂 Found {$categories->count()} categories");

            // Step 3: Create products for each category
            $this->command->info('🏭 Creating products by category...');

            $categoryProductCounts = [
                'elaiolado' => 12,    // Olive oil - most popular
                'elies' => 10,        // Olives
                'meli' => 8,          // Honey
                'tyria' => 10,        // Cheeses
                'krasi' => 8,         // Wine
                'zymarika' => 8,      // Pasta
                'marmelades' => 6,    // Jams
                'baharika' => 6,      // Spices
                'xiroi-karpoi' => 6,  // Nuts
                'aleura' => 6         // Flours
            ];

            $totalProducts = 0;
            foreach ($categoryProductCounts as $categorySlug => $count) {
                if (!isset($categories[$categorySlug])) {
                    $this->command->warn("⚠️ Category {$categorySlug} not found, skipping...");
                    continue;
                }

                $category = $categories[$categorySlug];

                // Create products for this category with category-specific names
                $products = Product::factory()
                    ->count($count)
                    ->forCategory($categorySlug)
                    ->create([
                        'producer_id' => $producers->random()->id
                    ]);

                // Attach products to category
                foreach ($products as $product) {
                    DB::table('product_category_relations')->insert([
                        'product_id' => $product->id,
                        'category_id' => $category->id,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }

                $totalProducts += $count;
                $this->command->info("✅ Created {$count} products for {$category->name}");
            }

            // Step 4: Create some products with multiple categories (realistic scenario)
            $this->command->info('🔗 Creating products with multiple categories...');

            $multiCategoryProducts = Product::factory()->count(5)->create([
                'producer_id' => $producers->random()->id
            ]);

            foreach ($multiCategoryProducts as $product) {
                // Assign 2-3 random categories to each product
                $randomCategories = $categories->random(rand(2, 3));

                foreach ($randomCategories as $category) {
                    DB::table('product_category_relations')->insert([
                        'product_id' => $product->id,
                        'category_id' => $category->id,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }

            $totalProducts += 5;

            // Step 5: Update producer ratings based on their products
            $this->command->info('⭐ Updating producer ratings...');

            foreach ($producers as $producer) {
                $productCount = $producer->products()->count();

                // Producers with more products get slightly better ratings
                $baseRating = 3.5;
                $bonusRating = min(1.5, $productCount * 0.1);
                $finalRating = round($baseRating + $bonusRating + (rand(-5, 10) / 10), 1);

                $producer->update(['rating' => max(3.0, min(5.0, $finalRating))]);
            }

            DB::commit();

            // Final statistics
            $this->command->info('🎉 Comprehensive data seeding completed successfully!');
            $this->command->info('📊 Final Statistics:');
            $this->command->info("   - Producers: {$producers->count()}");
            $this->command->info("   - Products: {$totalProducts}");
            $this->command->info("   - Categories: {$categories->count()}");
            $this->command->info("   - Product-Category Relations: " . DB::table('product_category_relations')->count());

            // Show distribution
            $this->command->info('📈 Product Distribution by Category:');
            foreach ($categories as $category) {
                $productCount = DB::table('product_category_relations')
                    ->where('category_id', $category->id)
                    ->count();
                $this->command->info("   - {$category->name}: {$productCount} products");
            }

        } catch (\Exception $e) {
            DB::rollback();
            $this->command->error('❌ Error during seeding: ' . $e->getMessage());
            throw $e;
        }
    }
}
