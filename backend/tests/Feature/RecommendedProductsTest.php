<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\Producer;
use App\Models\User;
use Tests\TestCase;

class RecommendedProductsTest extends TestCase
{

    public function test_can_get_recommended_products()
    {
        // Create a producer
        $user = User::factory()->create(['role' => 'producer']);
        $producer = Producer::factory()->create(['user_id' => $user->id]);

        // Create a category
        $category = Category::factory()->create();

        // Create some products
        $product1 = Product::factory()->create([
            'producer_id' => $producer->id,
            'is_active' => true
        ]);
        $product1->categories()->attach($category->id);

        $product2 = Product::factory()->create([
            'producer_id' => $producer->id,
            'is_active' => true
        ]);
        $product2->categories()->attach($category->id);

        // Create an inactive product that shouldn't be returned
        $inactiveProduct = Product::factory()->create([
            'producer_id' => $producer->id,
            'is_active' => false
        ]);
        $inactiveProduct->categories()->attach($category->id);

        // Test getting recommended products
        $response = $this->getJson('/api/products/recommended?limit=2');

        $response->assertStatus(200)
                ->assertJsonCount(2)
                ->assertJsonStructure([
                    '*' => [
                        'id',
                        'name',
                        'slug',
                        'price',
                        'producer' => [
                            'id',
                            'business_name'
                        ]
                    ]
                ]);
    }

    public function test_can_get_recommended_products_by_category()
    {
        // Create a producer
        $user = User::factory()->create(['role' => 'producer']);
        $producer = Producer::factory()->create(['user_id' => $user->id]);

        // Create categories
        $category1 = Category::factory()->create();
        $category2 = Category::factory()->create();

        // Create products in category 1
        $product1 = Product::factory()->create([
            'producer_id' => $producer->id,
            'is_active' => true
        ]);
        $product1->categories()->attach($category1->id);

        $product2 = Product::factory()->create([
            'producer_id' => $producer->id,
            'is_active' => true
        ]);
        $product2->categories()->attach($category1->id);

        // Create product in category 2
        $product3 = Product::factory()->create([
            'producer_id' => $producer->id,
            'is_active' => true
        ]);
        $product3->categories()->attach($category2->id);

        // Test getting recommended products by category
        $response = $this->getJson('/api/products/recommended?category_id=' . $category1->id);

        $response->assertStatus(200)
                ->assertJsonPath('0.categories.0.id', $category1->id);
    }

    public function test_can_get_similar_products()
    {
        // Create a producer
        $user = User::factory()->create(['role' => 'producer']);
        $producer = Producer::factory()->create(['user_id' => $user->id]);

        // Create a category
        $category = Category::factory()->create();

        // Create a product
        $product = Product::factory()->create([
            'producer_id' => $producer->id,
            'is_active' => true
        ]);
        $product->categories()->attach($category->id);

        // Create similar products in the same category
        $similarProduct1 = Product::factory()->create([
            'producer_id' => $producer->id,
            'is_active' => true
        ]);
        $similarProduct1->categories()->attach($category->id);

        $similarProduct2 = Product::factory()->create([
            'producer_id' => $producer->id,
            'is_active' => true
        ]);
        $similarProduct2->categories()->attach($category->id);

        // Test getting similar products
        $response = $this->getJson('/api/products/recommended?product_id=' . $product->id);

        $response->assertStatus(200)
                ->assertJsonCount(2)
                ->assertJsonMissing(['id' => $product->id]); // Should not include the original product
    }
}
