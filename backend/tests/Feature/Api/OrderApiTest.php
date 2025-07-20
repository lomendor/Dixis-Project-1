<?php

namespace Tests\Feature\Api;

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Models\Address;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class OrderApiTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test getting a list of user orders (requires authentication).
     */
    public function test_can_get_user_orders(): void
    {
        // Create and authenticate a user
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        // Create some orders for the user
        Order::factory()->count(3)->create([
            'user_id' => $user->id,
        ]);

        // Make the request
        $response = $this->getJson('/api/orders');

        // Assert the response
        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'order_number',
                        'status',
                        'total_amount',
                        'created_at',
                    ],
                ],
                'meta',
                'links',
            ]);
    }

    /**
     * Test getting a single order (requires authentication).
     */
    public function test_can_get_single_order(): void
    {
        // Create and authenticate a user
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        // Create an order for the user
        $order = Order::factory()->create([
            'user_id' => $user->id,
        ]);

        // Make the request
        $response = $this->getJson("/api/orders/{$order->id}");

        // Assert the response
        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'id' => $order->id,
                    'order_number' => $order->order_number,
                    'status' => $order->status,
                ],
            ]);
    }

    /**
     * Test creating a new order (requires authentication).
     */
    public function test_can_create_order(): void
    {
        // Create and authenticate a user
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        // Create addresses for the user
        $shippingAddress = Address::factory()->create(['user_id' => $user->id]);
        $billingAddress = Address::factory()->create(['user_id' => $user->id]);

        // Create some products
        $product1 = Product::factory()->create(['price' => 10.99]);
        $product2 = Product::factory()->create(['price' => 15.99]);

        // Order data
        $orderData = [
            'shipping_address_id' => $shippingAddress->id,
            'billing_address_id' => $billingAddress->id,
            'shipping_method' => 'standard',
            'payment_method' => 'card',
            'notes' => 'Test order notes',
            'items' => [
                [
                    'product_id' => $product1->id,
                    'quantity' => 2,
                ],
                [
                    'product_id' => $product2->id,
                    'quantity' => 1,
                ],
            ],
        ];

        // Make the request
        $response = $this->postJson('/api/orders', $orderData);

        // Assert the response
        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'order_number',
                    'status',
                    'total_amount',
                    'items',
                ],
            ]);

        // Check that the order was created in the database
        $this->assertDatabaseHas('orders', [
            'user_id' => $user->id,
            'shipping_address_id' => $shippingAddress->id,
            'billing_address_id' => $billingAddress->id,
        ]);
    }

    /**
     * Test cancelling an order (requires authentication).
     */
    public function test_can_cancel_order(): void
    {
        // Create and authenticate a user
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        // Create an order for the user with 'pending' status
        $order = Order::factory()->create([
            'user_id' => $user->id,
            'status' => 'pending',
        ]);

        // Make the request
        $response = $this->postJson("/api/orders/{$order->id}/cancel");

        // Assert the response
        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'id' => $order->id,
                    'status' => 'cancelled',
                ],
            ]);

        // Check that the order status was updated in the database
        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'status' => 'cancelled',
        ]);
    }

    /**
     * Test that a user cannot access another user's order.
     */
    public function test_cannot_access_other_users_order(): void
    {
        // Create two users
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        // Authenticate as user1
        Sanctum::actingAs($user1);

        // Create an order for user2
        $order = Order::factory()->create([
            'user_id' => $user2->id,
        ]);

        // Make the request
        $response = $this->getJson("/api/orders/{$order->id}");

        // Assert the response (should be forbidden)
        $response->assertStatus(403);
    }
}
