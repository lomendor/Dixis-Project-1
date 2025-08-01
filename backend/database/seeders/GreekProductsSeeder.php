<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Str;

class GreekProductsSeeder extends Seeder
{
    public function run()
    {
        // Create producers if they don't exist
        $producers = [
            [
                'name' => 'Κτήμα Παπαδόπουλου',
                'email' => 'papadopoulos@dixis.io',
                'role' => 'producer'
            ],
            [
                'name' => 'Μελισσοκομία Χατζή',
                'email' => 'hatzi@dixis.io', 
                'role' => 'producer'
            ],
            [
                'name' => 'Ελαιώνες Κρήτης',
                'email' => 'crete-olives@dixis.io',
                'role' => 'producer'
            ],
            [
                'name' => 'Οινοποιείο Νέμεα',
                'email' => 'nemea-wines@dixis.io',
                'role' => 'producer'
            ],
            [
                'name' => 'Τυροκομείο Μετσόβου',
                'email' => 'metsovo@dixis.io',
                'role' => 'producer'
            ]
        ];

        $producerIds = [];
        foreach ($producers as $producerData) {
            $producer = User::firstOrCreate(
                ['email' => $producerData['email']],
                array_merge($producerData, [
                    'password' => bcrypt('password123'),
                    'email_verified_at' => now(),
                ])
            );
            $producerIds[] = $producer->id;
        }

        // Greek products data
        $products = [
            // Μέλι - Honey
            ['name' => 'Μέλι Θυμαρίσιο Κρήτης', 'price' => 12.50, 'stock' => 50, 'producer' => 1],
            ['name' => 'Μέλι Ανθέων', 'price' => 10.00, 'stock' => 75, 'producer' => 1],
            ['name' => 'Μέλι Πεύκου', 'price' => 11.50, 'stock' => 60, 'producer' => 1],
            ['name' => 'Μέλι Καστανιάς', 'price' => 13.00, 'stock' => 40, 'producer' => 1],
            ['name' => 'Μέλι με Κηρήθρα', 'price' => 15.00, 'stock' => 30, 'producer' => 1],
            
            // Ελαιόλαδο - Olive Oil
            ['name' => 'Εξαιρετικό Παρθένο Ελαιόλαδο Κρήτης', 'price' => 18.00, 'stock' => 100, 'producer' => 2],
            ['name' => 'Βιολογικό Ελαιόλαδο Καλαμάτας', 'price' => 20.00, 'stock' => 80, 'producer' => 2],
            ['name' => 'Ελαιόλαδο Λέσβου', 'price' => 17.50, 'stock' => 90, 'producer' => 2],
            ['name' => 'Αγουρέλαιο', 'price' => 22.00, 'stock' => 50, 'producer' => 2],
            ['name' => 'Ελαιόλαδο με Λεμόνι', 'price' => 19.00, 'stock' => 60, 'producer' => 2],
            
            // Ελιές - Olives
            ['name' => 'Ελιές Καλαμών', 'price' => 5.50, 'stock' => 150, 'producer' => 2],
            ['name' => 'Πράσινες Ελιές Χαλκιδικής', 'price' => 6.00, 'stock' => 120, 'producer' => 2],
            ['name' => 'Ελιές Θρούμπες', 'price' => 7.00, 'stock' => 100, 'producer' => 2],
            ['name' => 'Ελιές Αμφίσσης', 'price' => 6.50, 'stock' => 110, 'producer' => 2],
            ['name' => 'Πάστα Ελιάς', 'price' => 4.50, 'stock' => 80, 'producer' => 2],
            
            // Τυριά - Cheese
            ['name' => 'Φέτα ΠΟΠ', 'price' => 8.50, 'stock' => 100, 'producer' => 4],
            ['name' => 'Κεφαλογραβιέρα', 'price' => 12.00, 'stock' => 80, 'producer' => 4],
            ['name' => 'Μανούρι', 'price' => 9.00, 'stock' => 60, 'producer' => 4],
            ['name' => 'Γραβιέρα Νάξου', 'price' => 14.00, 'stock' => 70, 'producer' => 4],
            ['name' => 'Κασέρι', 'price' => 10.50, 'stock' => 90, 'producer' => 4],
            
            // Κρασιά - Wines
            ['name' => 'Αγιωργίτικο Νεμέας', 'price' => 15.00, 'stock' => 50, 'producer' => 3],
            ['name' => 'Ασύρτικο Σαντορίνης', 'price' => 18.00, 'stock' => 40, 'producer' => 3],
            ['name' => 'Μοσχοφίλερο Μαντινείας', 'price' => 12.00, 'stock' => 60, 'producer' => 3],
            ['name' => 'Ξινόμαυρο Νάουσας', 'price' => 20.00, 'stock' => 30, 'producer' => 3],
            ['name' => 'Ρετσίνα Αττικής', 'price' => 8.00, 'stock' => 100, 'producer' => 3],
            
            // Όσπρια - Legumes
            ['name' => 'Φασόλια Γίγαντες Πρεσπών', 'price' => 6.50, 'stock' => 80, 'producer' => 0],
            ['name' => 'Φακές Εγκλουβής', 'price' => 4.50, 'stock' => 100, 'producer' => 0],
            ['name' => 'Ρεβίθια Ελασσόνας', 'price' => 4.00, 'stock' => 90, 'producer' => 0],
            ['name' => 'Φάβα Σαντορίνης', 'price' => 5.50, 'stock' => 70, 'producer' => 0],
            ['name' => 'Μαυρομάτικα Φασόλια', 'price' => 3.50, 'stock' => 110, 'producer' => 0],
            
            // Ξηροί Καρποί - Nuts
            ['name' => 'Αμύγδαλα Θάσου', 'price' => 8.00, 'stock' => 60, 'producer' => 0],
            ['name' => 'Καρύδια Πηλίου', 'price' => 9.50, 'stock' => 50, 'producer' => 0],
            ['name' => 'Φιστίκια Αιγίνης ΠΟΠ', 'price' => 18.00, 'stock' => 40, 'producer' => 0],
            ['name' => 'Κουκουνάρι', 'price' => 25.00, 'stock' => 20, 'producer' => 0],
            ['name' => 'Φουντούκια', 'price' => 7.50, 'stock' => 70, 'producer' => 0],
            
            // Μαρμελάδες - Jams
            ['name' => 'Μαρμελάδα Βερίκοκο', 'price' => 4.50, 'stock' => 80, 'producer' => 0],
            ['name' => 'Μαρμελάδα Φράουλα', 'price' => 5.00, 'stock' => 90, 'producer' => 0],
            ['name' => 'Γλυκό Κουταλιού Κεράσι', 'price' => 6.00, 'stock' => 60, 'producer' => 0],
            ['name' => 'Μαρμελάδα Σύκο', 'price' => 5.50, 'stock' => 70, 'producer' => 0],
            ['name' => 'Γλυκό Κουταλιού Μαστίχα', 'price' => 7.00, 'stock' => 50, 'producer' => 0],
            
            // Αρωματικά - Herbs
            ['name' => 'Ρίγανη Κρήτης', 'price' => 3.00, 'stock' => 120, 'producer' => 0],
            ['name' => 'Τσάι του Βουνού', 'price' => 4.00, 'stock' => 100, 'producer' => 0],
            ['name' => 'Δίκταμο Κρήτης', 'price' => 5.00, 'stock' => 80, 'producer' => 0],
            ['name' => 'Φασκόμηλο', 'price' => 3.50, 'stock' => 110, 'producer' => 0],
            ['name' => 'Θυμάρι', 'price' => 3.00, 'stock' => 130, 'producer' => 0],
            
            // Παραδοσιακά Προϊόντα - Traditional Products
            ['name' => 'Χυλοπίτες', 'price' => 4.50, 'stock' => 90, 'producer' => 0],
            ['name' => 'Τραχανάς Γλυκός', 'price' => 5.00, 'stock' => 80, 'producer' => 0],
            ['name' => 'Τραχανάς Ξινός', 'price' => 5.00, 'stock' => 80, 'producer' => 0],
            ['name' => 'Μαστίχα Χίου', 'price' => 15.00, 'stock' => 40, 'producer' => 0],
            ['name' => 'Πετιμέζι', 'price' => 6.50, 'stock' => 60, 'producer' => 0],
            
            // Αλλαντικά - Deli Meats
            ['name' => 'Λουκάνικα Χωριάτικα', 'price' => 12.00, 'stock' => 50, 'producer' => 0],
            ['name' => 'Απάκι Κρήτης', 'price' => 18.00, 'stock' => 30, 'producer' => 0],
            ['name' => 'Σύγκλινο Μάνης', 'price' => 20.00, 'stock' => 25, 'producer' => 0],
            ['name' => 'Λούζα Μυκόνου', 'price' => 22.00, 'stock' => 20, 'producer' => 0],
            ['name' => 'Καπνιστό Μετσόβου', 'price' => 16.00, 'stock' => 35, 'producer' => 0],
            
            // Γλυκίσματα - Sweets
            ['name' => 'Παστέλι Σουσάμι', 'price' => 3.50, 'stock' => 100, 'producer' => 0],
            ['name' => 'Χαλβάς Φαρσάλων', 'price' => 8.00, 'stock' => 60, 'producer' => 0],
            ['name' => 'Λουκούμια Σύρου', 'price' => 6.00, 'stock' => 80, 'producer' => 0],
            ['name' => 'Αμυγδαλωτά', 'price' => 10.00, 'stock' => 40, 'producer' => 0],
            ['name' => 'Μελομακάρονα', 'price' => 8.50, 'stock' => 50, 'producer' => 0],
            
            // Ποτά - Beverages
            ['name' => 'Ούζο Πλωμαρίου', 'price' => 14.00, 'stock' => 40, 'producer' => 3],
            ['name' => 'Τσίπουρο', 'price' => 12.00, 'stock' => 50, 'producer' => 3],
            ['name' => 'Λικέρ Μαστίχα', 'price' => 16.00, 'stock' => 30, 'producer' => 3],
            ['name' => 'Ρακόμελο', 'price' => 10.00, 'stock' => 60, 'producer' => 3],
            ['name' => 'Σούμα', 'price' => 18.00, 'stock' => 20, 'producer' => 3],
            
            // Καλλυντικά - Cosmetics
            ['name' => 'Σαπούνι Ελαιολάδου', 'price' => 4.00, 'stock' => 100, 'producer' => 0],
            ['name' => 'Κρέμα με Μέλι', 'price' => 12.00, 'stock' => 50, 'producer' => 0],
            ['name' => 'Λάδι Αργκάν', 'price' => 15.00, 'stock' => 40, 'producer' => 0],
            ['name' => 'Σαμπουάν με Ελιά', 'price' => 8.00, 'stock' => 60, 'producer' => 0],
            ['name' => 'Αλοιφή Πρόπολης', 'price' => 10.00, 'stock' => 45, 'producer' => 0],
        ];

        foreach ($products as $productData) {
            $producerId = $productData['producer'] < count($producerIds) 
                ? $producerIds[$productData['producer']] 
                : $producerIds[0];

            Product::create([
                'producer_id' => $producerId,
                'name' => $productData['name'],
                'slug' => Str::slug($productData['name']),
                'description' => 'Αυθεντικό ελληνικό προϊόν υψηλής ποιότητας. ' . $productData['name'] . ' από επιλεγμένους Έλληνες παραγωγούς.',
                'price' => $productData['price'],
                'stock' => $productData['stock'],
                'is_active' => true,
                'is_featured' => rand(0, 10) > 7, // 30% featured
                'discount_price' => rand(0, 10) > 8 ? $productData['price'] * 0.9 : null, // 20% have discount
            ]);
        }

        $this->command->info('Created ' . count($products) . ' Greek products!');
    }
}