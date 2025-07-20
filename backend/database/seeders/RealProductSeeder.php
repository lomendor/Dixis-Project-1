<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\Producer;
use App\Models\Category;

class RealProductSeeder extends Seeder
{
    public function run(): void
    {
        // Ensure we have categories
        $categories = [
            ['name' => 'Ελαιόλαδο & Λάδια', 'slug' => 'elaiolado-ladia'],
            ['name' => 'Ελιές & Τουρσιά', 'slug' => 'elies-toursia'],
            ['name' => 'Μέλι & Γλυκά', 'slug' => 'meli-glyka'],
            ['name' => 'Τυριά & Γαλακτοκομικά', 'slug' => 'tyria-galaktokomika'],
            ['name' => 'Κρέας & Αλλαντικά', 'slug' => 'kreas-allantika'],
            ['name' => 'Φρούτα & Λαχανικά', 'slug' => 'frouta-laxanika'],
            ['name' => 'Αρτοποιία & Ζυμαρικά', 'slug' => 'artopoiia-zymarika'],
            ['name' => 'Κρασιά & Ποτά', 'slug' => 'krasia-pota'],
        ];

        foreach ($categories as $categoryData) {
            Category::firstOrCreate(
                ['slug' => $categoryData['slug']],
                $categoryData
            );
        }

        // Get first producer or create one
        $producer = Producer::first();
        if (!$producer) {
            $producer = Producer::create([
                'business_name' => 'Αγρόκτημα Παπαδόπουλος',
                'description' => 'Παραδοσιακά προϊόντα από την Κρήτη',
                'location' => 'Χανιά, Κρήτη',
                'phone' => '+30 28210 12345',
                'email' => 'info@papadopoulos-farm.gr',
            ]);
        }

        // Real Greek products with proper descriptions
        $products = [
            // Ελαιόλαδο & Λάδια
            [
                'name' => 'Εξτραπάρθενο Ελαιόλαδο Κορωνέικη',
                'slug' => 'extraparteno-elaiolado-koroneiki',
                'description' => 'Εξαιρετικής ποιότητας εξτραπάρθενο ελαιόλαδο από ελιές Κορωνέικη. Ψυχρή εκχύλιση, χαμηλή οξύτητα 0.2%. Ιδανικό για σαλάτες και μαγείρεμα.',
                'short_description' => 'Εξτραπάρθενο ελαιόλαδο Κορωνέικη, ψυχρή εκχύλιση',
                'price' => 12.50,
                'stock_quantity' => 150,
                'weight_grams' => 500,
                'category_slug' => 'elaiolado-ladia',
                'main_image' => 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&h=500&fit=crop',
                'is_featured' => true,
            ],
            [
                'name' => 'Βιολογικό Ελαιόλαδο Καλαμών',
                'slug' => 'viologiko-elaiolado-kalamon',
                'description' => 'Βιολογικό εξτραπάρθενο ελαιόλαδο από ελιές Καλαμών. Πιστοποιημένο βιολογικό προϊόν με έντονο άρωμα και γεύση.',
                'short_description' => 'Βιολογικό ελαιόλαδο Καλαμών, πιστοποιημένο',
                'price' => 15.80,
                'stock_quantity' => 80,
                'weight_grams' => 750,
                'category_slug' => 'elaiolado-ladia',
                'main_image' => 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500&h=500&fit=crop',
            ],

            // Ελιές & Τουρσιά
            [
                'name' => 'Ελιές Καλαμών Εξαιρετικές',
                'slug' => 'elies-kalamon-exairetikes',
                'description' => 'Εκλεκτές ελιές Καλαμών, μεγάλου μεγέθους, παραδοσιακής επεξεργασίας. Ιδανικές για μεζέδες και σαλάτες.',
                'short_description' => 'Εκλεκτές ελιές Καλαμών μεγάλου μεγέθους',
                'price' => 8.90,
                'stock_quantity' => 200,
                'weight_grams' => 400,
                'category_slug' => 'elies-toursia',
                'main_image' => 'https://images.unsplash.com/photo-1611171711912-e0be6da4e3c4?w=500&h=500&fit=crop',
                'is_featured' => true,
            ],
            [
                'name' => 'Ελιές Χαλκιδικής Γεμιστές',
                'slug' => 'elies-xalkidikis-gemistes',
                'description' => 'Πράσινες ελιές Χαλκιδικής γεμιστές με αμύγδαλο. Τραγανές και νόστιμες, ιδανικές για απεριτίφ.',
                'short_description' => 'Πράσινες ελιές Χαλκιδικής γεμιστές με αμύγδαλο',
                'price' => 6.50,
                'stock_quantity' => 120,
                'weight_grams' => 350,
                'category_slug' => 'elies-toursia',
                'main_image' => 'https://images.unsplash.com/photo-1605207616227-7c4b6b5b3b8a?w=500&h=500&fit=crop',
            ],

            // Μέλι & Γλυκά
            [
                'name' => 'Μέλι Θυμαρίσιο Κρήτης',
                'slug' => 'meli-thymarisio-kritis',
                'description' => 'Αγνό θυμαρίσιο μέλι από τα βουνά της Κρήτης. Πλούσιο σε αντιοξειδωτικά και θρεπτικά συστατικά.',
                'short_description' => 'Αγνό θυμαρίσιο μέλι από τα βουνά της Κρήτης',
                'price' => 18.00,
                'stock_quantity' => 60,
                'weight_grams' => 450,
                'category_slug' => 'meli-glyka',
                'main_image' => 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=500&h=500&fit=crop',
                'is_featured' => true,
            ],
            [
                'name' => 'Μέλι Πεύκου Εύβοιας',
                'slug' => 'meli-peukoy-evvoias',
                'description' => 'Σπάνιο μέλι πεύκου από τα δάση της Εύβοιας. Σκούρο χρώμα, έντονη γεύση και υψηλή θρεπτική αξία.',
                'short_description' => 'Σπάνιο μέλι πεύκου από τα δάση της Εύβοιας',
                'price' => 22.50,
                'stock_quantity' => 40,
                'weight_grams' => 450,
                'category_slug' => 'meli-glyka',
                'main_image' => 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=500&h=500&fit=crop',
            ],

            // Τυριά & Γαλακτοκομικά
            [
                'name' => 'Φέτα ΠΟΠ Δωδεκανήσου',
                'slug' => 'feta-pop-dodekanisoy',
                'description' => 'Παραδοσιακή φέτα ΠΟΠ από αιγοπρόβειο γάλα. Κρεμώδης υφή, αλμυρή γεύση, ιδανική για ελληνική σαλάτα.',
                'short_description' => 'Παραδοσιακή φέτα ΠΟΠ από αιγοπρόβειο γάλα',
                'price' => 14.20,
                'stock_quantity' => 90,
                'weight_grams' => 400,
                'category_slug' => 'tyria-galaktokomika',
                'main_image' => 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=500&h=500&fit=crop',
            ],
            [
                'name' => 'Κασέρι Μετσόβου ΠΟΠ',
                'slug' => 'kaseri-metsovoy-pop',
                'description' => 'Αυθεντικό κασέρι Μετσόβου ΠΟΠ από αιγοπρόβειο γάλα. Σκληρό τυρί με έντονη γεύση και άρωμα.',
                'short_description' => 'Αυθεντικό κασέρι Μετσόβου ΠΟΠ',
                'price' => 19.80,
                'stock_quantity' => 50,
                'weight_grams' => 300,
                'category_slug' => 'tyria-galaktokomika',
                'main_image' => 'https://images.unsplash.com/photo-1452195100486-9cc805987862?w=500&h=500&fit=crop',
            ],

            // Φρούτα & Λαχανικά
            [
                'name' => 'Ντομάτες Σαντορίνης',
                'slug' => 'ntomates-santorinis',
                'description' => 'Μικρές γλυκές ντομάτες από τη Σαντορίνη. Εξαιρετική γεύση λόγω του ηφαιστειογενούς εδάφους.',
                'short_description' => 'Μικρές γλυκές ντομάτες από τη Σαντορίνη',
                'price' => 7.50,
                'stock_quantity' => 80,
                'weight_grams' => 500,
                'category_slug' => 'frouta-laxanika',
                'main_image' => 'https://images.unsplash.com/photo-1546470427-e26264be0b0d?w=500&h=500&fit=crop',
            ],
            [
                'name' => 'Πορτοκάλια Αργολίδας',
                'slug' => 'portokalia-argolidas',
                'description' => 'Φρέσκα πορτοκάλια από τους κήπους της Αργολίδας. Ζουμερά και γλυκά, πλούσια σε βιταμίνη C.',
                'short_description' => 'Φρέσκα πορτοκάλια από την Αργολίδα',
                'price' => 3.20,
                'stock_quantity' => 200,
                'weight_grams' => 1000,
                'category_slug' => 'frouta-laxanika',
                'main_image' => 'https://images.unsplash.com/photo-1547514701-42782101795e?w=500&h=500&fit=crop',
                'is_featured' => true,
            ],
        ];

        foreach ($products as $productData) {
            $category = Category::where('slug', $productData['category_slug'])->first();
            
            if ($category) {
                Product::updateOrCreate(
                    ['slug' => $productData['slug']],
                    [
                        'producer_id' => $producer->id,
                        'category_id' => $category->id,
                        'name' => $productData['name'],
                        'description' => $productData['description'],
                        'short_description' => $productData['short_description'],
                        'price' => $productData['price'],
                        'stock_quantity' => $productData['stock_quantity'],
                        'weight_grams' => $productData['weight_grams'],
                        'main_image' => $productData['main_image'],
                        'is_active' => true,
                        'is_featured' => $productData['is_featured'] ?? false,
                        'is_organic' => rand(0, 1),
                        'is_seasonal' => rand(0, 1),
                    ]
                );
            }
        }

        $this->command->info('✅ Created ' . count($products) . ' real Greek products with images!');
    }
}