<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ProductCategory;
use Illuminate\Support\Facades\DB;

class CleanCategoriesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * Clean up categories to keep only 10 main ones
     */
    public function run(): void
    {
        // Define the 10 main categories we want to keep
        $mainCategories = [
            [
                'name' => 'Ελαιόλαδο',
                'slug' => 'elaiolado',
                'description' => 'Εξαιρετικό παρθένο ελαιόλαδο από όλη την Ελλάδα',
                'image' => null,
                'is_active' => true,
                'order' => 1,
            ],
            [
                'name' => 'Ελιές',
                'slug' => 'elies',
                'description' => 'Επιτραπέζιες ελιές και προϊόντα ελιάς',
                'image' => null,
                'is_active' => true,
                'order' => 2,
            ],
            [
                'name' => 'Μέλι',
                'slug' => 'meli',
                'description' => 'Φυσικό μέλι και προϊόντα κυψέλης',
                'image' => null,
                'is_active' => true,
                'order' => 3,
            ],
            [
                'name' => 'Τυριά',
                'slug' => 'tyria',
                'description' => 'Παραδοσιακά ελληνικά τυριά',
                'image' => null,
                'is_active' => true,
                'order' => 4,
            ],
            [
                'name' => 'Κρασί',
                'slug' => 'krasi',
                'description' => 'Ελληνικά κρασιά από επιλεγμένους αμπελώνες',
                'image' => null,
                'is_active' => true,
                'order' => 5,
            ],
            [
                'name' => 'Ζυμαρικά',
                'slug' => 'zymarika',
                'description' => 'Χειροποίητα και παραδοσιακά ζυμαρικά',
                'image' => null,
                'is_active' => true,
                'order' => 6,
            ],
            [
                'name' => 'Μαρμελάδες',
                'slug' => 'marmelades',
                'description' => 'Σπιτικές μαρμελάδες και γλυκά κουταλιού',
                'image' => null,
                'is_active' => true,
                'order' => 7,
            ],
            [
                'name' => 'Μπαχαρικά',
                'slug' => 'baharika',
                'description' => 'Αρωματικά βότανα και μπαχαρικά',
                'image' => null,
                'is_active' => true,
                'order' => 8,
            ],
            [
                'name' => 'Ξηροί Καρποί',
                'slug' => 'xiroi-karpoi',
                'description' => 'Ξηροί καρποί και αποξηραμένα φρούτα',
                'image' => null,
                'is_active' => true,
                'order' => 9,
            ],
            [
                'name' => 'Άλευρα',
                'slug' => 'aleura',
                'description' => 'Παραδοσιακά άλευρα και δημητριακά',
                'image' => null,
                'is_active' => true,
                'order' => 10,
            ],
        ];

        $this->command->info('🧹 Starting categories cleanup...');

        // Start transaction
        DB::beginTransaction();

        try {
            // Step 1: Get existing products and their categories
            $this->command->info('📊 Analyzing existing data...');

            $existingProducts = DB::table('products')->count();
            $existingCategories = DB::table('product_categories')->count();

            $this->command->info("Found {$existingProducts} products and {$existingCategories} categories");

            // Step 2: Clear all category relationships
            $this->command->info('🔗 Clearing category relationships...');
            DB::table('product_category_relations')->delete();

            // Step 3: Delete all existing categories
            $this->command->info('🗑️ Removing old categories...');
            DB::table('product_categories')->delete();

            // Step 4: Create new clean categories
            $this->command->info('✨ Creating new categories...');

            $categoryIds = [];
            foreach ($mainCategories as $category) {
                $id = DB::table('product_categories')->insertGetId([
                    'name' => $category['name'],
                    'slug' => $category['slug'],
                    'description' => $category['description'],
                    'image' => $category['image'],
                    'is_active' => $category['is_active'],
                    'order' => $category['order'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                $categoryIds[$category['slug']] = $id;
                $this->command->info("✅ Created: {$category['name']} (ID: {$id})");
            }

            // Step 5: Assign products to appropriate categories based on their names
            $this->command->info('🔗 Reassigning products to categories...');

            $products = DB::table('products')->get();
            $assignmentCount = 0;

            foreach ($products as $product) {
                $categoryId = $this->determineCategoryForProduct($product, $categoryIds);

                if ($categoryId) {
                    DB::table('product_category_relations')->insert([
                        'product_id' => $product->id,
                        'category_id' => $categoryId,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                    $assignmentCount++;
                }
            }

            $this->command->info("🔗 Assigned {$assignmentCount} products to categories");

            // Commit transaction
            DB::commit();

            $this->command->info('🎉 Categories cleanup completed successfully!');
            $this->command->info('📊 Final stats:');
            $this->command->info('   - Categories: ' . count($mainCategories));
            $this->command->info('   - Product assignments: ' . $assignmentCount);

        } catch (\Exception $e) {
            DB::rollback();
            $this->command->error('❌ Error during cleanup: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Determine the best category for a product based on its name
     */
    private function determineCategoryForProduct($product, $categoryIds): ?int
    {
        $productName = strtolower($product->name);

        // Category mapping based on product name keywords
        $categoryMappings = [
            'elaiolado' => ['ελαιόλαδο', 'λάδι', 'olive oil'],
            'elies' => ['ελιές', 'ελιά', 'olives', 'πάστα ελιάς'],
            'meli' => ['μέλι', 'honey', 'κερί', 'πρόπολη', 'γύρη'],
            'tyria' => ['τυρί', 'τυριά', 'φέτα', 'κασέρι', 'γραβιέρα', 'cheese'],
            'krasi' => ['κρασί', 'wine', 'οίνος', 'αμπέλι'],
            'zymarika' => ['ζυμαρικά', 'μακαρόνια', 'pasta', 'χιλοπίτες'],
            'marmelades' => ['μαρμελάδα', 'γλυκό κουταλιού', 'jam', 'preserve'],
            'baharika' => ['μπαχαρικό', 'βότανο', 'spice', 'herb', 'ρίγανη', 'θυμάρι'],
            'xiroi-karpoi' => ['καρπός', 'αμύγδαλο', 'καρύδι', 'σταφίδα', 'nuts'],
            'aleura' => ['άλευρο', 'flour', 'σιτάρι', 'βρώμη', 'δημητριακό'],
        ];

        // Find the best matching category
        foreach ($categoryMappings as $slug => $keywords) {
            foreach ($keywords as $keyword) {
                if (str_contains($productName, $keyword)) {
                    return $categoryIds[$slug] ?? null;
                }
            }
        }

        // Default to first category if no match found
        return $categoryIds['elaiolado'] ?? null;
    }
}
