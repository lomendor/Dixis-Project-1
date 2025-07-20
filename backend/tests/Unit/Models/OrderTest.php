<?php

namespace Tests\Unit\Models;

use App\Models\Order;
use App\Models\User;
use App\Models\Address;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test that an order can be created.
     */
    public function test_order_can_be_created(): void
    {
        // Create a user
        $user = User::factory()->create();
        
        // Create addresses
        $shippingAddress = Address::factory()->create(['user_id' => $user->id]);
        $billingAddress = Address::factory()->create(['user_id' => $user->id]);

        $orderData = [
            'user_id' => $user->id,
            'order_number' => 'ORD-' . uniqid(),
            'status' => 'pending',
            'shipping_address_id' => $shippingAddress->id,
            'billing_address_id' => $billingAddress->id,
            'shipping_method' => 'standard',
            'shipping_cost' => 5.99,
            'subtotal' => 100.00,
            'tax' => 24.00,
            'total_amount' => 129.99,
            'payment_method' => 'card',
            'payment_status' => 'pending',
            'notes' => 'Test order',
        ];

        $order = Order::create($orderData);

        $this->assertInstanceOf(Order::class, $order);
        $this->assertEquals('pending', $order->status);
        $this->assertEquals(129.99, $order->total_amount);
    }

    /**
     * Test order relationships.
     */
    public function test_order_relationships(): void
    {
        $order = Order::factory()->create();

        // Test that the order has the expected relationships
        $this->assertIsObject($order->user);
        $this->assertIsObject($order->items);
        $this->assertIsObject($order->shippingAddress);
        $this->assertIsObject($order->billingAddress);
        $this->assertIsObject($order->payment);
        $this->assertIsObject($order->business);
    }

    /**
     * Test adding items to an order.
     */
    public function test_adding_items_to_order(): void
    {
        $order = Order::factory()->create();
        $product = Product::factory()->create(['price' => 25.99]);

        // Create an order item
        $orderItem = new OrderItem([
            'product_id' => $product->id,
            'quantity' => 2,
            'price' => $product->price,
            'subtotal' => $product->price * 2,
        ]);

        $order->items()->save($orderItem);

        $this->assertEquals(1, $order->items->count());
        $this->assertEquals(25.99 * 2, $order->items->first()->subtotal);
    }

    /**
     * Test order status transitions.
     */
    public function test_order_status_transitions(): void
    {
        $order = Order::factory()->create(['status' => 'pending']);

        // Update the status
        $order->status = 'processing';
        $order->save();

        $this->assertEquals('processing', $order->status);

        // Update to shipped
        $order->status = 'shipped';
        $order->save();

        $this->assertEquals('shipped', $order->status);
    }
}
