<?php

namespace Tests\Feature\Producer;

use App\Models\Producer;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class SeasonalityCalendarTest extends TestCase
{
    use RefreshDatabase;
    use WithFaker;

    /**
     * Test getting seasonality data for a producer's products.
     */
    public function test_get_seasonality_data(): void
    {
        // Create a producer with categories and products
        $producer = Producer::factory()->create();
        $category = ProductCategory::factory()->create(['name' => 'Vegetables']);
        
        // Create products with seasonality data
        $product1 = Product::factory()->create([
            'producer_id' => $producer->id,
            'name' => 'Tomatoes',
            'seasonality' => [
                'Ιανουάριος' => 'none',
                'Φεβρουάριος' => 'none',
                'Μάρτιος' => 'low',
                'Απρίλιος' => 'medium',
                'Μάιος' => 'high',
                'Ιούνιος' => 'high',
                'Ιούλιος' => 'high',
                'Αύγουστος' => 'high',
                'Σεπτέμβριος' => 'medium',
                'Οκτώβριος' => 'low',
                'Νοέμβριος' => 'none',
                'Δεκέμβριος' => 'none'
            ]
        ]);
        
        $product2 = Product::factory()->create([
            'producer_id' => $producer->id,
            'name' => 'Cucumbers',
            'seasonality' => [
                'Ιανουάριος' => 'none',
                'Φεβρουάριος' => 'none',
                'Μάρτιος' => 'none',
                'Απρίλιος' => 'low',
                'Μάιος' => 'medium',
                'Ιούνιος' => 'high',
                'Ιούλιος' => 'high',
                'Αύγουστος' => 'high',
                'Σεπτέμβριος' => 'medium',
                'Οκτώβριος' => 'low',
                'Νοέμβριος' => 'none',
                'Δεκέμβριος' => 'none'
            ]
        ]);
        
        // Add products to category
        $product1->categories()->attach($category->id);
        $product2->categories()->attach($category->id);
        
        // Test the API endpoint
        $response = $this->getJson("/v1/producers/{$producer->id}/seasonality");
        
        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'products' => [
                         '*' => [
                             'id',
                             'name',
                             'category_id',
                             'category',
                             'seasonality'
                         ]
                     ]
                 ])
                 ->assertJsonCount(2, 'products')
                 ->assertJson([
                     'products' => [
                         [
                             'name' => 'Tomatoes',
                             'category' => 'Vegetables',
                             'seasonality' => [
                                 'Μάιος' => 'high',
                                 'Ιούνιος' => 'high',
                                 'Ιούλιος' => 'high',
                                 'Αύγουστος' => 'high',
                             ]
                         ],
                         [
                             'name' => 'Cucumbers',
                             'category' => 'Vegetables',
                             'seasonality' => [
                                 'Ιούνιος' => 'high',
                                 'Ιούλιος' => 'high',
                                 'Αύγουστος' => 'high',
                             ]
                         ]
                     ]
                 ]);
    }
    
    /**
     * Test updating seasonality data (requires producer auth).
     */
    public function test_update_seasonality_data(): void
    {
        // Create user with producer role and associated producer
        $producer_user = User::factory()->create(['role' => 'producer']);
        $producer = Producer::factory()->create(['user_id' => $producer_user->id]);
        
        // Create products
        $product1 = Product::factory()->create([
            'producer_id' => $producer->id,
            'name' => 'Tomatoes',
            'seasonality' => null
        ]);
        
        $product2 = Product::factory()->create([
            'producer_id' => $producer->id,
            'name' => 'Cucumbers',
            'seasonality' => null
        ]);
        
        // Prepare seasonality data
        $seasonalityData = [
            $product1->id => [
                'Ιανουάριος' => 'none',
                'Φεβρουάριος' => 'none',
                'Μάρτιος' => 'low',
                'Απρίλιος' => 'medium',
                'Μάιος' => 'high',
                'Ιούνιος' => 'high',
                'Ιούλιος' => 'high',
                'Αύγουστος' => 'high',
                'Σεπτέμβριος' => 'medium',
                'Οκτώβριος' => 'low',
                'Νοέμβριος' => 'none',
                'Δεκέμβριος' => 'none'
            ],
            $product2->id => [
                'Ιανουάριος' => 'none',
                'Φεβρουάριος' => 'none',
                'Μάρτιος' => 'none',
                'Απρίλιος' => 'low',
                'Μάιος' => 'medium',
                'Ιούνιος' => 'high',
                'Ιούλιος' => 'high',
                'Αύγουστος' => 'high',
                'Σεπτέμβριος' => 'medium',
                'Οκτώβριος' => 'low',
                'Νοέμβριος' => 'none',
                'Δεκέμβριος' => 'none'
            ]
        ];
        
        // Update seasonality
        $response = $this->actingAs($producer_user)
                         ->postJson("/v1/producer/seasonality", [
                             'seasonality' => $seasonalityData
                         ]);
                         
        $response->assertStatus(200)
                 ->assertJson([
                     'success' => true,
                     'message' => 'Seasonality updated successfully'
                 ]);
                 
        // Verify database updates
        $this->assertDatabaseHas('products', [
            'id' => $product1->id,
        ]);
        
        $this->assertDatabaseHas('products', [
            'id' => $product2->id,
        ]);
        
        // Fetch products to check seasonality
        $updatedProduct1 = Product::find($product1->id);
        $updatedProduct2 = Product::find($product2->id);
        
        $this->assertEquals($seasonalityData[$product1->id], $updatedProduct1->seasonality);
        $this->assertEquals($seasonalityData[$product2->id], $updatedProduct2->seasonality);
    }
    
    /**
     * Test unauthorized access to seasonality update.
     */
    public function test_unauthorized_seasonality_update(): void
    {
        // Create regular user (not a producer)
        $user = User::factory()->create(['role' => 'customer']);
        
        // Create a producer and product
        $producer = Producer::factory()->create();
        $product = Product::factory()->create([
            'producer_id' => $producer->id,
            'name' => 'Apples',
            'seasonality' => null
        ]);
        
        // Attempt to update seasonality
        $response = $this->actingAs($user)
                         ->postJson("/v1/producer/seasonality", [
                             'seasonality' => [
                                 $product->id => [
                                     'Ιανουάριος' => 'high',
                                     'Φεβρουάριος' => 'high',
                                 ]
                             ]
                         ]);
                         
        // Should fail with 403 Forbidden
        $response->assertStatus(403);
    }
    
    /**
     * Test updating seasonality for another producer's products.
     */
    public function test_update_other_producers_products(): void
    {
        // Create two producers with their own users
        $producer_user1 = User::factory()->create(['role' => 'producer']);
        $producer1 = Producer::factory()->create(['user_id' => $producer_user1->id]);
        
        $producer_user2 = User::factory()->create(['role' => 'producer']);
        $producer2 = Producer::factory()->create(['user_id' => $producer_user2->id]);
        
        // Create a product for producer2
        $product = Product::factory()->create([
            'producer_id' => $producer2->id,
            'name' => 'Oranges',
            'seasonality' => null
        ]);
        
        // Producer1 tries to update producer2's product
        $response = $this->actingAs($producer_user1)
                         ->postJson("/v1/producer/seasonality", [
                             'seasonality' => [
                                 $product->id => [
                                     'Ιανουάριος' => 'high',
                                     'Φεβρουάριος' => 'high',
                                 ]
                             ]
                         ]);
                         
        $response->assertStatus(200); // The API succeeds but should not update the product
        
        // Verify product was not updated (seasonality should still be null)
        $updatedProduct = Product::find($product->id);
        $this->assertNull($updatedProduct->seasonality);
    }
}