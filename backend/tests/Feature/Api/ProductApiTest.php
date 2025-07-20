<?php

namespace Tests\Feature\Api;

use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ProductApiTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test getting a list of products.
     */
    public function test_can_get_products_list(): void
    {
        // Create some products
        Product::factory()->count(5)->create();

        // Make the request
        $response = $this->getJson('/api/products');

        // Assert the response
        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'name',
                        'slug',
                        'description',
                        'price',
                        'main_image',
                        'producer' => [
                            'id',
                            'name',
                        ],
                    ],
                ],
                'meta',
                'links',
            ]);
    }

    /**
     * Test getting a single product.
     */
    public function test_can_get_single_product(): void
    {
        // Create a product
        $product = Product::factory()->create();

        // Make the request
        $response = $this->getJson("/api/products/{$product->slug}");

        // Assert the response
        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'id' => $product->id,
                    'name' => $product->name,
                    'slug' => $product->slug,
                ],
            ]);
    }

    /**
     * Test creating a product (requires authentication).
     */
    public function test_can_create_product(): void
    {
        // Create and authenticate a user with producer role
        $user = User::factory()->create();
        $user->assignRole('producer');
        Sanctum::actingAs($user);

        // Create a producer profile for the user
        $producer = $user->producer()->create([
            'name' => 'Test Producer',
            'description' => 'Test Description',
            'logo' => 'test.jpg',
            'is_verified' => true,
        ]);

        // Create a category
        $category = \App\Models\ProductCategory::factory()->create();

        // Product data
        $productData = [
            'category_id' => $category->id,
            'name' => 'New Test Product',
            'description' => 'This is a new test product',
            'price' => 15.99,
            'stock' => 50,
            'weight' => 2.0,
            'is_active' => true,
        ];

        // Make the request
        $response = $this->postJson('/api/producer/products', $productData);

        // Assert the response
        $response->assertStatus(201)
            ->assertJson([
                'data' => [
                    'name' => 'New Test Product',
                    'price' => 15.99,
                ],
            ]);

        // Check that the product was created in the database
        $this->assertDatabaseHas('products', [
            'name' => 'New Test Product',
            'producer_id' => $producer->id,
        ]);
    }

    /**
     * Test updating a product (requires authentication).
     */
    public function test_can_update_product(): void
    {
        // Create and authenticate a user with producer role
        $user = User::factory()->create();
        $user->assignRole('producer');
        Sanctum::actingAs($user);

        // Create a producer profile for the user
        $producer = $user->producer()->create([
            'name' => 'Test Producer',
            'description' => 'Test Description',
            'logo' => 'test.jpg',
            'is_verified' => true,
        ]);

        // Create a product owned by the producer
        $product = Product::factory()->create([
            'producer_id' => $producer->id,
            'name' => 'Original Product Name',
        ]);

        // Update data
        $updateData = [
            'name' => 'Updated Product Name',
            'price' => 25.99,
        ];

        // Make the request
        $response = $this->putJson("/api/producer/products/{$product->id}", $updateData);

        // Assert the response
        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'name' => 'Updated Product Name',
                    'price' => 25.99,
                ],
            ]);

        // Check that the product was updated in the database
        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'name' => 'Updated Product Name',
        ]);
    }

    /**
     * Test deleting a product (requires authentication).
     */
    public function test_can_delete_product(): void
    {
        // Create and authenticate a user with producer role
        $user = User::factory()->create();
        $user->assignRole('producer');
        Sanctum::actingAs($user);

        // Create a producer profile for the user
        $producer = $user->producer()->create([
            'name' => 'Test Producer',
            'description' => 'Test Description',
            'logo' => 'test.jpg',
            'is_verified' => true,
        ]);

        // Create a product owned by the producer
        $product = Product::factory()->create([
            'producer_id' => $producer->id,
        ]);

        // Make the request
        $response = $this->deleteJson("/api/producer/products/{$product->id}");

        // Assert the response
        $response->assertStatus(200);

        // Check that the product was deleted from the database
        $this->assertDatabaseMissing('products', [
            'id' => $product->id,
            'deleted_at' => null,
        ]);
    }
}
