<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\Category;
use App\Models\Producer;

class SimpleProductSeeder extends Seeder
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
            ['name' => 'Κρέας', 'slug' => 'kreas', 'description' => 'Φρέσκο κρέας από ελληνικές φάρμες'],
            ['name' => 'Ψάρια', 'slug' => 'psaria', 'description' => 'Φρέσκα ψάρια από ελληνικές θάλασσες'],
            ['name' => 'Αρτοποιήματα', 'slug' => 'artopoiimata', 'description' => 'Φρέσκο ψωμί και αρτοποιήματα'],
        ];

        foreach ($categories as $category) {
            Category::firstOrCreate(['slug' => $category['slug']], $category);
        }

        $this->command->info('🏭 Creating producers...');

        // Create producers
        $producers = [
            [
                'business_name' => 'Αγρόκτημα Παπαδόπουλου',
                'description' => 'Οικογενειακό αγρόκτημα με παράδοση 3 γενεών.',
                'address' => 'Καλαμάτα',
                'city' => 'Καλαμάτα',
                'region' => 'Μεσσηνία',
                'user_id' => 2
            ],
            [
                'business_name' => 'Κτήμα Γεωργιάδη',
                'description' => 'Παραδοσιακό κτήμα στη Κρήτη.',
                'address' => 'Χανιά',
                'city' => 'Χανιά',
                'region' => 'Κρήτη',
                'user_id' => 2
            ],
        ];

        foreach ($producers as $producer) {
            Producer::firstOrCreate(['business_name' => $producer['business_name']], $producer);
        }

        $this->command->info('🛍️ Creating products...');

        // Create many products
        $productTemplates = [
            [
                'name' => 'Βιολογικό Ελαιόλαδο Εξαιρετικό Παρθένο',
                'category' => 'elaiolado',
                'price_range' => [10, 15],
                'image_base' => 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500'
            ],
            [
                'name' => 'Φέτα ΠΟΠ',
                'category' => 'tyria',
                'price_range' => [7, 12],
                'image_base' => 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=500'
            ],
            [
                'name' => 'Μέλι Ελάτης',
                'category' => 'meli',
                'price_range' => [12, 18],
                'image_base' => 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=500'
            ],
            [
                'name' => 'Βιολογικές Ντομάτες',
                'category' => 'lachanika',
                'price_range' => [2, 5],
                'image_base' => 'https://images.unsplash.com/photo-1546470427-e26264be0b0d?w=500'
            ],
            [
                'name' => 'Πορτοκάλια Βαλέντσια',
                'category' => 'frouta',
                'price_range' => [1.5, 3],
                'image_base' => 'https://images.unsplash.com/photo-1547514701-42782101795e?w=500'
            ],
            [
                'name' => 'Λεμόνια Κρήτης',
                'category' => 'frouta',
                'price_range' => [2, 4],
                'image_base' => 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500'
            ],
            [
                'name' => 'Κολοκυθάκια',
                'category' => 'lachanika',
                'price_range' => [1.8, 3.5],
                'image_base' => 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=500'
            ],
            [
                'name' => 'Αγγούρια',
                'category' => 'lachanika',
                'price_range' => [1.2, 2.5],
                'image_base' => 'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=500'
            ],
            [
                'name' => 'Μήλα Ζαγοράς',
                'category' => 'frouta',
                'price_range' => [2.5, 4.5],
                'image_base' => 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500'
            ],
            [
                'name' => 'Κεράσια Ροδοχωρίου',
                'category' => 'frouta',
                'price_range' => [8, 12],
                'image_base' => 'https://images.unsplash.com/photo-1528821128474-27f963b062bf?w=500'
            ]
        ];

        $locations = ['Καλαμάτας', 'Κρήτης', 'Πελοποννήσου', 'Μακεδονίας', 'Θεσσαλίας', 'Ηπείρου', 'Αττικής'];
        $qualities = ['Βιολογικό', 'Παραδοσιακό', 'Εκλεκτό', 'Πρώτης Ποιότητας', 'Φρέσκο'];

        $productCount = 0;
        
        // Create variations of each product template
        foreach ($productTemplates as $template) {
            $category = Category::where('slug', $template['category'])->first();
            
            for ($i = 1; $i <= 10; $i++) {
                $location = $locations[array_rand($locations)];
                $quality = $qualities[array_rand($qualities)];
                
                $name = $quality . ' ' . $template['name'] . ' ' . $location;
                $price = round(rand($template['price_range'][0] * 100, $template['price_range'][1] * 100) / 100, 2);
                $stock = rand(10, 200);
                $producer_id = rand(1, 2);
                
                Product::create([
                    'name' => $name,
                    'slug' => \Str::slug($name . '-' . $i),
                    'description' => 'Εξαιρετικό προϊόν ' . strtolower($quality) . ' από ' . $location . '. Φρέσκο και υψηλής ποιότητας.',
                    'price' => $price,
                    'wholesale_price' => round($price * 0.85, 2),
                    'stock' => $stock,
                    'category_id' => $category->id,
                    'producer_id' => $producer_id,
                    'main_image' => $template['image_base'],
                    'is_featured' => rand(0, 1) == 1,
                    'is_seasonal' => rand(0, 1) == 1,
                    'status' => 'active',
                    'is_active' => true
                ]);
                
                $productCount++;
            }
        }

        $this->command->info("✅ Created {$productCount} products successfully!");
        $this->command->info('🎉 Simple product seeding completed!');
    }
}
