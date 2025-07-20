<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\ProductCategory;
use Illuminate\Support\Str;

class ProductCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Main Product Categories
        $mainCategories = [
            [
                'name' => 'Προϊόντα Ελιάς',
                'type' => 'product',
                'order' => 10,
                'subcategories' => [
                    ['name' => 'Ελαιόλαδο', 'order' => 1],
                    ['name' => 'Επιτραπέζιες Ελιές', 'order' => 2],
                    ['name' => 'Πάστα Ελιάς', 'order' => 3],
                ]
            ],
            [
                'name' => 'Δημητριακά, Άλευρα & Αρτοσκευάσματα',
                'type' => 'product',
                'order' => 20,
                'subcategories' => [
                    ['name' => 'Δημητριακά', 'order' => 1],
                    ['name' => 'Άλευρα', 'order' => 2],
                    ['name' => 'Ψωμί & Αρτοσκευάσματα', 'order' => 3],
                ]
            ],
            [
                'name' => 'Όσπρια',
                'type' => 'product',
                'order' => 30,
                'subcategories' => [
                    ['name' => 'Φασόλια', 'order' => 1],
                    ['name' => 'Φακές', 'order' => 2],
                    ['name' => 'Ρεβίθια', 'order' => 3],
                    ['name' => 'Φάβα', 'order' => 4],
                ]
            ],
            [
                'name' => 'Ζυμαρικά',
                'type' => 'product',
                'order' => 40,
                'subcategories' => [
                    ['name' => 'Παραδοσιακά Ζυμαρικά', 'order' => 1],
                    ['name' => 'Χειροποίητα Ζυμαρικά', 'order' => 2],
                    ['name' => 'Ζυμαρικά Χωρίς Γλουτένη', 'order' => 3],
                ]
            ],
            [
                'name' => 'Μπαχαρικά & Βότανα',
                'type' => 'product',
                'order' => 50,
                'subcategories' => [
                    ['name' => 'Μπαχαρικά', 'order' => 1],
                    ['name' => 'Βότανα', 'order' => 2],
                    ['name' => 'Αρωματικά Φυτά', 'order' => 3],
                ]
            ],
            [
                'name' => 'Προϊόντα Μελιού',
                'type' => 'product',
                'order' => 60,
                'subcategories' => [
                    ['name' => 'Μέλι', 'order' => 1],
                    ['name' => 'Γύρη', 'order' => 2],
                    ['name' => 'Πρόπολη', 'order' => 3],
                    ['name' => 'Βασιλικός Πολτός', 'order' => 4],
                ]
            ],
            [
                'name' => 'Ξηροί Καρποί & Αποξηραμένα Φρούτα',
                'type' => 'product',
                'order' => 70,
                'subcategories' => [
                    ['name' => 'Ξηροί Καρποί', 'order' => 1],
                    ['name' => 'Αποξηραμένα Φρούτα', 'order' => 2],
                ]
            ],
            [
                'name' => 'Αλείμματα & Σάλτσες',
                'type' => 'product',
                'order' => 80,
                'subcategories' => [
                    ['name' => 'Μαρμελάδες', 'order' => 1],
                    ['name' => 'Σάλτσες', 'order' => 2],
                    ['name' => 'Γλυκά Κουταλιού', 'order' => 3],
                ]
            ],
            [
                'name' => 'Μανιτάρια & Τρούφες',
                'type' => 'product',
                'order' => 90,
                'subcategories' => [
                    ['name' => 'Μανιτάρια', 'order' => 1],
                    ['name' => 'Τρούφες', 'order' => 2],
                ]
            ],
            [
                'name' => 'Γαλακτοκομικά & Τυροκομικά',
                'type' => 'product',
                'order' => 100,
                'subcategories' => [
                    ['name' => 'Τυριά', 'order' => 1],
                    ['name' => 'Γιαούρτι', 'order' => 2],
                    ['name' => 'Βούτυρο', 'order' => 3],
                ]
            ],
            [
                'name' => 'Ποτά',
                'type' => 'product',
                'order' => 110,
                'subcategories' => [
                    ['name' => 'Κρασί', 'order' => 1],
                    ['name' => 'Τσίπουρο & Ούζο', 'order' => 2],
                    ['name' => 'Λικέρ', 'order' => 3],
                    ['name' => 'Μπύρα', 'order' => 4],
                ]
            ],
            [
                'name' => 'Φυσικά Καλλυντικά & Προϊόντα Περιποίησης',
                'type' => 'product',
                'order' => 120,
                'subcategories' => [
                    ['name' => 'Σαπούνια', 'order' => 1],
                    ['name' => 'Έλαια Περιποίησης', 'order' => 2],
                    ['name' => 'Κρέμες', 'order' => 3],
                ]
            ],
        ];

        // Functional Categories
        $functionalCategories = [
            [
                'name' => 'Ειδικές Συλλογές',
                'type' => 'functional',
                'order' => 1000,
                'subcategories' => [
                    ['name' => 'Βιολογικά Προϊόντα', 'type' => 'functional', 'order' => 1],
                    ['name' => 'Προϊόντα ΠΟΠ/ΠΓΕ', 'type' => 'functional', 'order' => 2],
                    ['name' => 'Εποχικά Προϊόντα', 'type' => 'functional', 'order' => 3],
                    ['name' => 'Προϊόντα Χωρίς Γλουτένη', 'type' => 'functional', 'order' => 4],
                    ['name' => 'Vegan Επιλογές', 'type' => 'functional', 'order' => 5],
                    ['name' => 'Συσκευασίες Δώρου', 'type' => 'functional', 'order' => 6],
                    ['name' => 'Προσφορές', 'type' => 'functional', 'order' => 7],
                    ['name' => 'Νέες Αφίξεις', 'type' => 'functional', 'order' => 8],
                ]
            ],
            [
                'name' => 'Υιοθεσίες & Συνδρομές',
                'type' => 'functional',
                'order' => 2000,
                'subcategories' => [
                    ['name' => 'Υιοθεσία Ελαιόδεντρου', 'type' => 'functional', 'order' => 1],
                    ['name' => 'Υιοθεσία Κυψέλης', 'type' => 'functional', 'order' => 2],
                    ['name' => 'Υιοθεσία Αγροτεμαχίου', 'type' => 'functional', 'order' => 3],
                    ['name' => 'Κουτιά Συνδρομής', 'type' => 'functional', 'order' => 4],
                ]
            ],
        ];

        // Create main categories and their subcategories
        foreach (array_merge($mainCategories, $functionalCategories) as $categoryData) {
            $category = ProductCategory::create([
                'name' => $categoryData['name'],
                'slug' => Str::slug($categoryData['name']),
                'type' => $categoryData['type'],
                'order' => $categoryData['order'],
                'is_active' => true,
            ]);

            // Create subcategories
            if (isset($categoryData['subcategories'])) {
                foreach ($categoryData['subcategories'] as $subcategoryData) {
                    ProductCategory::create([
                        'name' => $subcategoryData['name'],
                        'slug' => Str::slug($subcategoryData['name']),
                        'parent_id' => $category->id,
                        'type' => $subcategoryData['type'] ?? $categoryData['type'],
                        'order' => $subcategoryData['order'],
                        'is_active' => true,
                    ]);
                }
            }
        }
    }
}
