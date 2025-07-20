<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\Category;

class QuickProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('🌱 Creating categories...');
        
        // Create categories
        $categories = [
            ['name' => 'Φρούτα', 'slug' => 'frouta', 'description' => 'Φρέσκα εποχιακά φρούτα'],
            ['name' => 'Λαχανικά', 'slug' => 'lachanika', 'description' => 'Φρέσκα λαχανικά από τον κήπο'],
            ['name' => 'Ελαιόλαδο', 'slug' => 'elaiolado', 'description' => 'Εξαιρετικό παρθένο ελαιόλαδο'],
            ['name' => 'Τυριά', 'slug' => 'tyria', 'description' => 'Παραδοσιακά ελληνικά τυριά'],
            ['name' => 'Μέλι', 'slug' => 'meli', 'description' => 'Φυσικό μέλι από ελληνικά βουνά'],
        ];

        foreach ($categories as $category) {
            Category::firstOrCreate(['slug' => $category['slug']], $category);
        }

        $this->command->info('🛍️ Creating products...');

        // Get existing categories
        $fruitCategory = Category::where('slug', 'frouta')->first();
        $vegetableCategory = Category::where('slug', 'lachanika')->first();
        $oilCategory = Category::where('slug', 'elaiolado')->first();
        $cheeseCategory = Category::where('slug', 'tyria')->first();
        $honeyCategory = Category::where('slug', 'meli')->first();

        // Create many products
        $products = [
            // Φρούτα
            ['name' => 'Πορτοκάλια Βαλέντσια Κρήτης', 'category_id' => $fruitCategory->id, 'price' => 2.50],
            ['name' => 'Λεμόνια Αργολίδας', 'category_id' => $fruitCategory->id, 'price' => 3.20],
            ['name' => 'Μήλα Ζαγοράς', 'category_id' => $fruitCategory->id, 'price' => 4.50],
            ['name' => 'Κεράσια Ροδοχωρίου', 'category_id' => $fruitCategory->id, 'price' => 12.00],
            ['name' => 'Ακτινίδια Πιερίας', 'category_id' => $fruitCategory->id, 'price' => 5.80],
            ['name' => 'Ροδάκινα Νάουσας', 'category_id' => $fruitCategory->id, 'price' => 3.90],
            ['name' => 'Βερίκοκα Αργολίδας', 'category_id' => $fruitCategory->id, 'price' => 4.20],
            ['name' => 'Σταφύλια Κορινθίας', 'category_id' => $fruitCategory->id, 'price' => 6.50],
            ['name' => 'Αχλάδια Τριπόλεως', 'category_id' => $fruitCategory->id, 'price' => 3.80],
            ['name' => 'Καρπούζια Τυρνάβου', 'category_id' => $fruitCategory->id, 'price' => 1.20],
            
            // Λαχανικά
            ['name' => 'Βιολογικές Ντομάτες Καλαμάτας', 'category_id' => $vegetableCategory->id, 'price' => 3.50],
            ['name' => 'Κολοκυθάκια Κρήτης', 'category_id' => $vegetableCategory->id, 'price' => 2.80],
            ['name' => 'Αγγούρια Θεσσαλίας', 'category_id' => $vegetableCategory->id, 'price' => 2.20],
            ['name' => 'Πιπεριές Φλωρίνης', 'category_id' => $vegetableCategory->id, 'price' => 4.50],
            ['name' => 'Μελιτζάνες Τσακώνικες', 'category_id' => $vegetableCategory->id, 'price' => 3.20],
            ['name' => 'Κρεμμύδια Σκοπέλου', 'category_id' => $vegetableCategory->id, 'price' => 1.80],
            ['name' => 'Πατάτες Νάξου', 'category_id' => $vegetableCategory->id, 'price' => 2.50],
            ['name' => 'Καρότα Κρήτης', 'category_id' => $vegetableCategory->id, 'price' => 2.10],
            ['name' => 'Σπανάκι Βιολογικό', 'category_id' => $vegetableCategory->id, 'price' => 3.80],
            ['name' => 'Μαρούλι Παγόβουνο', 'category_id' => $vegetableCategory->id, 'price' => 1.50],
            
            // Ελαιόλαδο
            ['name' => 'Βιολογικό Ελαιόλαδο Καλαμάτας', 'category_id' => $oilCategory->id, 'price' => 12.50],
            ['name' => 'Εξαιρετικό Παρθένο Κρήτης', 'category_id' => $oilCategory->id, 'price' => 15.80],
            ['name' => 'Ελαιόλαδο Κορωνείας', 'category_id' => $oilCategory->id, 'price' => 11.20],
            ['name' => 'Βιολογικό Λάδι Λέσβου', 'category_id' => $oilCategory->id, 'price' => 14.50],
            ['name' => 'Παρθένο Ελαιόλαδο Χίου', 'category_id' => $oilCategory->id, 'price' => 13.90],
            ['name' => 'Ελαιόλαδο Μάνης', 'category_id' => $oilCategory->id, 'price' => 16.20],
            ['name' => 'Βιολογικό Λάδι Ζακύνθου', 'category_id' => $oilCategory->id, 'price' => 12.80],
            ['name' => 'Εξαιρετικό Λάδι Αμφίσσης', 'category_id' => $oilCategory->id, 'price' => 14.20],
            ['name' => 'Παρθένο Λάδι Αίγινας', 'category_id' => $oilCategory->id, 'price' => 15.50],
            ['name' => 'Ελαιόλαδο Μυτιλήνης', 'category_id' => $oilCategory->id, 'price' => 13.20],
            
            // Τυριά
            ['name' => 'Φέτα ΠΟΠ Μετσόβου', 'category_id' => $cheeseCategory->id, 'price' => 8.90],
            ['name' => 'Κασέρι Κρήτης', 'category_id' => $cheeseCategory->id, 'price' => 12.50],
            ['name' => 'Γραβιέρα Νάξου', 'category_id' => $cheeseCategory->id, 'price' => 15.80],
            ['name' => 'Κεφαλοτύρι Κρήτης', 'category_id' => $cheeseCategory->id, 'price' => 14.20],
            ['name' => 'Μυζήθρα Κρήτης', 'category_id' => $cheeseCategory->id, 'price' => 6.50],
            ['name' => 'Ανθότυρο Κρήτης', 'category_id' => $cheeseCategory->id, 'price' => 7.80],
            ['name' => 'Μανούρι Κρήτης', 'category_id' => $cheeseCategory->id, 'price' => 9.20],
            ['name' => 'Κατσικίσιο Τυρί Μήλου', 'category_id' => $cheeseCategory->id, 'price' => 11.50],
            ['name' => 'Φορμαέλλα Αράχωβας', 'category_id' => $cheeseCategory->id, 'price' => 13.80],
            ['name' => 'Λαδοτύρι Μυτιλήνης', 'category_id' => $cheeseCategory->id, 'price' => 16.20],
            
            // Μέλι
            ['name' => 'Μέλι Ελάτης Αρκαδίας', 'category_id' => $honeyCategory->id, 'price' => 15.00],
            ['name' => 'Μέλι Θυμαρίσιο Κρήτης', 'category_id' => $honeyCategory->id, 'price' => 18.50],
            ['name' => 'Μέλι Πεύκου Εύβοιας', 'category_id' => $honeyCategory->id, 'price' => 16.80],
            ['name' => 'Μέλι Ανθέων Νάξου', 'category_id' => $honeyCategory->id, 'price' => 12.20],
            ['name' => 'Μέλι Κάστανου Πηλίου', 'category_id' => $honeyCategory->id, 'price' => 14.50],
            ['name' => 'Μέλι Ερείκης Κρήτης', 'category_id' => $honeyCategory->id, 'price' => 19.80],
            ['name' => 'Μέλι Πορτοκαλιάς Αργολίδας', 'category_id' => $honeyCategory->id, 'price' => 13.90],
            ['name' => 'Μέλι Λεβάντας Χίου', 'category_id' => $honeyCategory->id, 'price' => 22.50],
            ['name' => 'Μέλι Δάσους Ροδόπης', 'category_id' => $honeyCategory->id, 'price' => 17.20],
            ['name' => 'Μέλι Βουνού Ολύμπου', 'category_id' => $honeyCategory->id, 'price' => 20.80],
        ];

        $productCount = 0;
        
        foreach ($products as $productData) {
            $slug = \Str::slug($productData['name']);
            
            // Check if product already exists
            if (!Product::where('slug', $slug)->exists()) {
                Product::create([
                    'name' => $productData['name'],
                    'slug' => $slug,
                    'description' => 'Εξαιρετικό προϊόν υψηλής ποιότητας από Ελληνικούς παραγωγούς. Φρέσκο και νόστιμο.',
                    'price' => $productData['price'],
                    'wholesale_price' => round($productData['price'] * 0.85, 2),
                    'stock' => rand(50, 200),
                    'category_id' => $productData['category_id'],
                    'producer_id' => 1, // Use existing producer
                    'main_image' => 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500',
                    'is_featured' => rand(0, 1) == 1,
                    'is_seasonal' => rand(0, 1) == 1,
                    'status' => 'active',
                    'is_active' => true,
                    'weight_grams' => rand(100, 2000)
                ]);
                
                $productCount++;
            }
        }

        $this->command->info("✅ Created {$productCount} products successfully!");
        $this->command->info('🎉 Quick product seeding completed!');
    }
}
