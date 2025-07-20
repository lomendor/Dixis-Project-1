<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\Producer;
use App\Models\ProductCategory;
use Illuminate\Support\Str;

class TestProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create a producer if none exists
        $producer = Producer::first();
        if (!$producer) {
            $producer = Producer::create([
                'business_name' => 'Test Producer',
                'user_id' => 1, // Assuming user with ID 1 exists
                'description' => 'Test Producer Description',
                'address' => 'Test Address',
                'city' => 'Test City',
                'postal_code' => '12345',
                'country' => 'Greece',
                'phone' => '1234567890',
                'email' => 'test@producer.com',
                'website' => 'https://testproducer.com',
                'status' => 'verified',
            ]);
        }

        // Create a category if none exists
        $category = ProductCategory::first();
        if (!$category) {
            $category = ProductCategory::create([
                'name' => 'Test Category',
                'slug' => 'test-category',
                'description' => 'Test Category Description',
            ]);
        }

        // Create a test product
        $product = Product::create([
            'name' => 'Test Product',
            'slug' => 'test-product',
            'description' => 'Test Product Description',
            'short_description' => 'Test Product Short Description',
            'price' => 10.99,
            'discount_price' => 8.99,
            'stock' => 100,
            'sku' => 'TEST-' . Str::random(6),
            'weight_grams' => 500,
            'producer_id' => $producer->id,
            'is_active' => true,
            'is_featured' => false,
        ]);

        // Attach category to product
        $product->categories()->attach($category->id);

        $this->command->info('Test product created with ID: ' . $product->id);
    }
}
