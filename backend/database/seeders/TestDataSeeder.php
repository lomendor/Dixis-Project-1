<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Producer;
use App\Models\ProductCategory as Category;
use App\Models\Product;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class TestDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create roles if they don't exist
        if (Role::count() === 0) {
            Role::create(['name' => 'admin']);
            Role::create(['name' => 'producer']);
            Role::create(['name' => 'consumer']);
            Role::create(['name' => 'business_user']);
        }

        // Create user and producer
        $user = User::where('email', 'producer@dixis.io')->first();
        if (!$user) {
            $user = User::create([
                'name' => 'Producer',
                'email' => 'producer@dixis.io',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]);
            $user->assignRole('producer');
        }

        $producer = Producer::where('user_id', $user->id)->first();
        if (!$producer) {
            $producer = Producer::create([
                'user_id' => $user->id,
                'business_name' => 'Test Producer',
                'tax_id' => '123456789',
                'tax_office' => 'Test Tax Office',
                'address' => 'Test Address',
                'city' => 'Test City',
                'postal_code' => '12345',
                'region' => 'Test Region',
                'verified' => true,
            ]);
        }

        // Create categories
        $categories = [
            ['name' => 'Ελιές', 'slug' => 'elies'],
            ['name' => 'Λάδι', 'slug' => 'ladi'],
            ['name' => 'Μέλι', 'slug' => 'meli'],
            ['name' => 'Τυρί', 'slug' => 'tyri'],
            ['name' => 'Κρασί', 'slug' => 'krasi'],
        ];

        foreach ($categories as $categoryData) {
            Category::updateOrCreate(
                ['slug' => $categoryData['slug']],
                ['name' => $categoryData['name']]
            );
        }

        // Create products
        $products = [
            [
                'name' => 'Ελιές Καλαμών',
                'slug' => 'elies-kalamwn',
                'description' => 'Ελιές Καλαμών από την Μεσσηνία',
                'price' => 5.99,
                'stock' => 100,
                'status' => 'active',
                'category_slug' => 'elies',
            ],
            [
                'name' => 'Ελαιόλαδο Εξαιρετικό Παρθένο',
                'slug' => 'elaiolado-exairetiko-partheno',
                'description' => 'Εξαιρετικό παρθένο ελαιόλαδο από την Μεσσηνία',
                'price' => 9.99,
                'stock' => 50,
                'status' => 'active',
                'category_slug' => 'ladi',
            ],
            [
                'name' => 'Μέλι Θυμαρίσιο',
                'slug' => 'meli-thymarisio',
                'description' => 'Θυμαρίσιο μέλι από την Κρήτη',
                'price' => 7.99,
                'stock' => 30,
                'status' => 'active',
                'category_slug' => 'meli',
            ],
            [
                'name' => 'Φέτα ΠΟΠ',
                'slug' => 'feta-pop',
                'description' => 'Φέτα ΠΟΠ από αιγοπρόβειο γάλα',
                'price' => 8.99,
                'stock' => 40,
                'status' => 'active',
                'category_slug' => 'tyri',
            ],
            [
                'name' => 'Κρασί Αγιωργίτικο',
                'slug' => 'krasi-agiorgitiko',
                'description' => 'Αγιωργίτικο κρασί από την Νεμέα',
                'price' => 12.99,
                'stock' => 20,
                'status' => 'active',
                'category_slug' => 'krasi',
            ],
        ];

        foreach ($products as $productData) {
            $category = Category::where('slug', $productData['category_slug'])->first();
            if ($category) {
                $product = Product::updateOrCreate(
                    ['slug' => $productData['slug']],
                    [
                        'producer_id' => $producer->id,
                        'name' => $productData['name'],
                        'description' => $productData['description'],
                        'price' => $productData['price'],
                        'stock' => $productData['stock'],
                        'is_active' => $productData['status'] === 'active',
                    ]
                );

                // Attach the category to the product
                $product->categories()->sync([$category->id]);
            }
        }

        // Skip creating orders for now due to address requirements
        // We'll focus on products and categories which are enough for the dashboard
    }
}
