<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Str;

class SimpleGreekProductsSeeder extends Seeder
{
    public function run()
    {
        // Get first user or create a default producer
        $producer = User::where('role', 'producer')->first();
        
        if (!$producer) {
            $producer = User::create([
                'name' => 'Ελληνικά Προϊόντα ΑΕ',
                'email' => 'producer@dixis.io',
                'password' => bcrypt('password123'),
                'role' => 'producer',
                'email_verified_at' => now(),
            ]);
        }

        $producerId = $producer->id;

        // Greek products - 85 items
        $products = [
            // Μέλι (10 items)
            ['name' => 'Μέλι Θυμαρίσιο Κρήτης', 'price' => 12.50, 'stock' => 50],
            ['name' => 'Μέλι Ανθέων Ορεινό', 'price' => 10.00, 'stock' => 75],
            ['name' => 'Μέλι Πεύκου', 'price' => 11.50, 'stock' => 60],
            ['name' => 'Μέλι Καστανιάς Πηλίου', 'price' => 13.00, 'stock' => 40],
            ['name' => 'Μέλι Ελάτης', 'price' => 14.00, 'stock' => 35],
            ['name' => 'Μέλι με Κηρήθρα', 'price' => 15.00, 'stock' => 30],
            ['name' => 'Μέλι Πορτοκαλιάς', 'price' => 9.50, 'stock' => 80],
            ['name' => 'Βιολογικό Μέλι Θυμάρι', 'price' => 16.00, 'stock' => 25],
            ['name' => 'Μέλι με Γύρη', 'price' => 18.00, 'stock' => 20],
            ['name' => 'Μέλι με Βασιλικό Πολτό', 'price' => 25.00, 'stock' => 15],
            
            // Ελαιόλαδο (10 items)
            ['name' => 'Εξαιρετικό Παρθένο Ελαιόλαδο Κρήτης', 'price' => 18.00, 'stock' => 100],
            ['name' => 'Βιολογικό Ελαιόλαδο Καλαμάτας', 'price' => 20.00, 'stock' => 80],
            ['name' => 'Ελαιόλαδο Λέσβου ΠΟΠ', 'price' => 17.50, 'stock' => 90],
            ['name' => 'Αγουρέλαιο Πρώιμης Συγκομιδής', 'price' => 22.00, 'stock' => 50],
            ['name' => 'Ελαιόλαδο με Λεμόνι', 'price' => 19.00, 'stock' => 60],
            ['name' => 'Ελαιόλαδο με Πορτοκάλι', 'price' => 19.00, 'stock' => 55],
            ['name' => 'Ελαιόλαδο με Μανταρίνι', 'price' => 19.50, 'stock' => 45],
            ['name' => 'Ελαιόλαδο με Βασιλικό', 'price' => 18.50, 'stock' => 65],
            ['name' => 'Ελαιόλαδο Κορωνέικη', 'price' => 21.00, 'stock' => 70],
            ['name' => 'Ελαιόλαδο Μανάκι', 'price' => 23.00, 'stock' => 40],
            
            // Ελιές (10 items)
            ['name' => 'Ελιές Καλαμών Μεσσηνίας', 'price' => 5.50, 'stock' => 150],
            ['name' => 'Πράσινες Ελιές Χαλκιδικής', 'price' => 6.00, 'stock' => 120],
            ['name' => 'Ελιές Θρούμπες Θάσου', 'price' => 7.00, 'stock' => 100],
            ['name' => 'Ελιές Αμφίσσης ΠΟΠ', 'price' => 6.50, 'stock' => 110],
            ['name' => 'Πάστα Ελιάς Καλαμών', 'price' => 4.50, 'stock' => 80],
            ['name' => 'Ελιές Γεμιστές με Πιπεριά', 'price' => 8.00, 'stock' => 60],
            ['name' => 'Ελιές Γεμιστές με Αμύγδαλο', 'price' => 9.00, 'stock' => 50],
            ['name' => 'Ελιές Γεμιστές με Σκόρδο', 'price' => 7.50, 'stock' => 70],
            ['name' => 'Ελιές Ψητές', 'price' => 8.50, 'stock' => 40],
            ['name' => 'Ελιές σε Άλμη', 'price' => 5.00, 'stock' => 130],
            
            // Τυριά (10 items)
            ['name' => 'Φέτα ΠΟΠ Βαρελίσια', 'price' => 8.50, 'stock' => 100],
            ['name' => 'Κεφαλογραβιέρα Άγραφα', 'price' => 12.00, 'stock' => 80],
            ['name' => 'Μανούρι Φρέσκο', 'price' => 9.00, 'stock' => 60],
            ['name' => 'Γραβιέρα Νάξου ΠΟΠ', 'price' => 14.00, 'stock' => 70],
            ['name' => 'Κασέρι Ξανθής', 'price' => 10.50, 'stock' => 90],
            ['name' => 'Μυζήθρα Γλυκιά', 'price' => 6.00, 'stock' => 50],
            ['name' => 'Ανθότυρο', 'price' => 5.50, 'stock' => 40],
            ['name' => 'Κοπανιστή Μυκόνου', 'price' => 11.00, 'stock' => 30],
            ['name' => 'Σφέλα Λακωνίας', 'price' => 9.50, 'stock' => 55],
            ['name' => 'Μετσοβόνε', 'price' => 13.50, 'stock' => 45],
            
            // Όσπρια (10 items)
            ['name' => 'Φασόλια Γίγαντες Πρεσπών ΠΓΕ', 'price' => 6.50, 'stock' => 80],
            ['name' => 'Φακές Εγκλουβής', 'price' => 4.50, 'stock' => 100],
            ['name' => 'Ρεβίθια Ελασσόνας', 'price' => 4.00, 'stock' => 90],
            ['name' => 'Φάβα Σαντορίνης ΠΟΠ', 'price' => 5.50, 'stock' => 70],
            ['name' => 'Μαυρομάτικα Φασόλια Καστοριάς', 'price' => 3.50, 'stock' => 110],
            ['name' => 'Φασόλια Πλακέ', 'price' => 4.00, 'stock' => 95],
            ['name' => 'Φασόλια Μέτρια', 'price' => 3.80, 'stock' => 105],
            ['name' => 'Φασολάκια Ξερά', 'price' => 5.00, 'stock' => 60],
            ['name' => 'Λαθούρι', 'price' => 4.20, 'stock' => 75],
            ['name' => 'Μπιζέλια Ξερά', 'price' => 3.50, 'stock' => 85],
            
            // Ξηροί Καρποί (10 items)
            ['name' => 'Αμύγδαλα Θάσου', 'price' => 8.00, 'stock' => 60],
            ['name' => 'Καρύδια Πηλίου', 'price' => 9.50, 'stock' => 50],
            ['name' => 'Φιστίκια Αιγίνης ΠΟΠ', 'price' => 18.00, 'stock' => 40],
            ['name' => 'Κουκουνάρι Αρκαδίας', 'price' => 25.00, 'stock' => 20],
            ['name' => 'Φουντούκια Βόλου', 'price' => 7.50, 'stock' => 70],
            ['name' => 'Κάστανα Βόλου', 'price' => 6.00, 'stock' => 30],
            ['name' => 'Ηλιόσποροι', 'price' => 3.00, 'stock' => 100],
            ['name' => 'Κολοκυθόσποροι', 'price' => 8.50, 'stock' => 45],
            ['name' => 'Σταφίδα Κορινθιακή', 'price' => 4.00, 'stock' => 90],
            ['name' => 'Σύκα Ξερά Ευβοίας', 'price' => 5.50, 'stock' => 65],
            
            // Μαρμελάδες & Γλυκά (10 items)
            ['name' => 'Μαρμελάδα Βερίκοκο', 'price' => 4.50, 'stock' => 80],
            ['name' => 'Μαρμελάδα Φράουλα Πολίτικη', 'price' => 5.00, 'stock' => 90],
            ['name' => 'Γλυκό Κουταλιού Κεράσι', 'price' => 6.00, 'stock' => 60],
            ['name' => 'Μαρμελάδα Σύκο', 'price' => 5.50, 'stock' => 70],
            ['name' => 'Γλυκό Κουταλιού Μαστίχα', 'price' => 7.00, 'stock' => 50],
            ['name' => 'Μαρμελάδα Πορτοκάλι', 'price' => 4.00, 'stock' => 100],
            ['name' => 'Γλυκό Κουταλιού Βύσσινο', 'price' => 6.50, 'stock' => 55],
            ['name' => 'Μαρμελάδα Ροδάκινο', 'price' => 4.50, 'stock' => 85],
            ['name' => 'Γλυκό Κουταλιού Καρύδι', 'price' => 8.00, 'stock' => 35],
            ['name' => 'Μαρμελάδα Κυδώνι', 'price' => 5.00, 'stock' => 75],
            
            // Αρωματικά & Μπαχαρικά (10 items)
            ['name' => 'Ρίγανη Κρήτης', 'price' => 3.00, 'stock' => 120],
            ['name' => 'Τσάι του Βουνού Ολύμπου', 'price' => 4.00, 'stock' => 100],
            ['name' => 'Δίκταμο Κρήτης', 'price' => 5.00, 'stock' => 80],
            ['name' => 'Φασκόμηλο', 'price' => 3.50, 'stock' => 110],
            ['name' => 'Θυμάρι', 'price' => 3.00, 'stock' => 130],
            ['name' => 'Δεντρολίβανο', 'price' => 3.20, 'stock' => 95],
            ['name' => 'Μέντα', 'price' => 2.80, 'stock' => 105],
            ['name' => 'Βασιλικός', 'price' => 2.50, 'stock' => 115],
            ['name' => 'Δάφνη', 'price' => 3.00, 'stock' => 100],
            ['name' => 'Μαστίχα Χίου', 'price' => 15.00, 'stock' => 40],
            
            // Παραδοσιακά Προϊόντα (5 items)
            ['name' => 'Χυλοπίτες', 'price' => 4.50, 'stock' => 90],
            ['name' => 'Τραχανάς Γλυκός', 'price' => 5.00, 'stock' => 80],
            ['name' => 'Τραχανάς Ξινός', 'price' => 5.00, 'stock' => 80],
            ['name' => 'Πετιμέζι Σταφυλιού', 'price' => 6.50, 'stock' => 60],
            ['name' => 'Ταχίνι', 'price' => 7.00, 'stock' => 70],
        ];

        foreach ($products as $index => $productData) {
            Product::create([
                'producer_id' => $producerId,
                'name' => $productData['name'],
                'slug' => Str::slug($productData['name']),
                'description' => 'Αυθεντικό ελληνικό προϊόν υψηλής ποιότητας. ' . $productData['name'] . ' από επιλεγμένους Έλληνες παραγωγούς με αγάπη και μεράκι για την ελληνική γη.',
                'price' => $productData['price'],
                'stock' => $productData['stock'],
                'is_active' => true,
                'is_featured' => $index < 10, // First 10 are featured
                'discount_price' => ($index % 5 === 0) ? $productData['price'] * 0.9 : null, // Every 5th has discount
            ]);
        }

        $this->command->info('✅ Created ' . count($products) . ' Greek products!');
    }
}