<?php

namespace Tests\Feature\Api;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\User;
use App\Models\Producer;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Order;
use App\Models\Address;
use App\Models\ShippingZone;
use App\Models\DeliveryMethod;
use App\Models\WeightTier;
use App\Models\ShippingRate;
use Laravel\Sanctum\Sanctum;

class CartToOrderFlowTest extends TestCase
{
    use RefreshDatabase;

    protected $user;
    protected $producer;
    protected $products;
    protected $cart;
    protected $shippingZone;
    protected $deliveryMethod;

    protected function setUp(): void
    {
        parent::setUp();

        // Seed roles and permissions
        $this->seed(\Database\Seeders\RoleSeeder::class);

        // Create user
        $this->user = User::factory()->create();
        $this->user->assignRole('consumer');

        // Create producer
        $producerUser = User::factory()->create();
        $producerUser->assignRole('producer');
        $this->producer = Producer::factory()->create([
            'user_id' => $producerUser->id,
            'verified' => true
        ]);

        // Create shipping setup
        $this->shippingZone = ShippingZone::factory()->create([
            'name' => 'Test Zone ' . uniqid(),
            'is_active' => true
        ]);

        $this->deliveryMethod = DeliveryMethod::factory()->create([
            'name' => 'Home Delivery',
            'code' => 'HOME',
            'is_active' => true
        ]);

        $weightTier = WeightTier::factory()->create([
            'min_weight_grams' => 0,
            'max_weight_grams' => 5000
        ]);

        ShippingRate::factory()->create([
            'shipping_zone_id' => $this->shippingZone->id,
            'delivery_method_id' => $this->deliveryMethod->id,
            'weight_tier_id' => $weightTier->id,
            'price' => 5.00
        ]);

        // Create products
        $this->products = Product::factory()->count(3)->create([
            'producer_id' => $this->producer->id,
            'is_active' => true,
            'stock' => 100
        ]);

        // Add images to products
        foreach ($this->products as $product) {
            ProductImage::factory()->create([
                'product_id' => $product->id,
                'sort_order' => 1
            ]);
        }
    }

    /**
     * Test complete cart to order flow
     */
    public function test_complete_purchase_flow()
    {
        Sanctum::actingAs($this->user);

        // Step 1: Add items to cart
        $response = $this->postJson('/api/v1/cart', [
            'product_id' => $this->products[0]->id,
            'quantity' => 2
        ]);

        $response->assertStatus(200);
        
        $response = $this->postJson('/api/v1/cart', [
            'product_id' => $this->products[1]->id,
            'quantity' => 1
        ]);

        $response->assertStatus(200);

        // Step 2: Get cart
        $response = $this->getJson('/api/v1/cart');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'id',
                'items',
                'subtotal',
                'total'
            ]);

        $cart = $response->json();
        $this->assertCount(2, $cart['items']);

        // Step 3: Create address for shipping calculation
        $shippingAddress = Address::factory()->create([
            'user_id' => $this->user->id,
            'postal_code' => '10001',
            'is_default_shipping' => true
        ]);

        // Step 3: Calculate shipping
        $response = $this->postJson('/api/v1/shipping/calculate', [
            'address_id' => $shippingAddress->id,
            'cart_items' => [
                [
                    'product_id' => $this->products[0]->id,
                    'quantity' => 2
                ],
                [
                    'product_id' => $this->products[1]->id,
                    'quantity' => 1
                ]
            ]
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'producers',
                'cod_cost'
            ]);

        $shippingData = $response->json();
        $this->assertArrayHasKey('producers', $shippingData);
        $this->assertArrayHasKey('cod_cost', $shippingData);

        // Step 4: Create order
        $shippingAddress = Address::factory()->create([
            'user_id' => $this->user->id,
            'is_default_shipping' => true
        ]);

        $billingAddress = Address::factory()->create([
            'user_id' => $this->user->id,
            'is_default_billing' => true
        ]);

        $response = $this->postJson('/api/v1/orders', [
            'shipping_address_id' => $shippingAddress->id,
            'billing_address_id' => $billingAddress->id,
            'delivery_method_id' => $this->deliveryMethod->id,
            'payment_method' => 'stripe',
            'shipping_method_code' => $this->deliveryMethod->code,
            'shipping_cost' => 5.00,
            'notes' => 'Test order'
        ]);

        if ($response->status() !== 201) {
            echo "Order creation failed with status: " . $response->status() . "\n";
            echo "Response: " . $response->getContent() . "\n";
        }

        $response->assertStatus(201)
            ->assertJsonStructure([
                'id',
                'status',
                'total_amount',
                'shipping_cost',
                'items'
            ]);

        $order = Order::find($response->json('id'));
        $this->assertNotNull($order);
        $this->assertEquals('pending', $order->status);
        $this->assertCount(2, $order->items);

        // Verify cart is cleared
        $response = $this->getJson('/api/v1/cart');
        $response->assertStatus(200);
        $this->assertCount(0, $response->json('items'));
    }

    /**
     * Test guest cart flow
     */
    public function test_guest_can_create_cart_and_merge_after_login()
    {
        // Step 1: Create guest cart
        $response = $this->postJson('/api/v1/cart/guest');
        
        $response->assertStatus(201)
            ->assertJsonStructure([
                'cart_id',
                'message'
            ]);

        $guestCartId = $response->json('cart_id');

        // Step 2: Add items to guest cart
        $response = $this->postJson("/api/v1/cart/{$guestCartId}/items", [
            'product_id' => $this->products[0]->id,
            'quantity' => 3
        ]);

        $response->assertStatus(200);

        // Step 3: Login and merge cart
        Sanctum::actingAs($this->user);
        
        $response = $this->postJson("/api/v1/cart/merge/{$guestCartId}");
        
        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Το καλάθι συγχωνεύτηκε επιτυχώς'
            ]);

        // Step 4: Verify merged cart
        $response = $this->getJson('/api/v1/cart');

        $response->assertStatus(200);
        $this->assertCount(1, $response->json('items'));
        $this->assertEquals(3, $response->json('items.0.quantity'));
    }

    /**
     * Test cart item updates
     */
    public function test_user_can_update_cart_items()
    {
        Sanctum::actingAs($this->user);

        // Add item
        $response = $this->postJson('/api/v1/cart', [
            'product_id' => $this->products[0]->id,
            'quantity' => 1
        ]);

        $response->assertStatus(200);
        $cartItem = $response->json('cart.items.0');

        // Update quantity
        $response = $this->putJson("/api/v1/cart/items/{$cartItem['id']}", [
            'quantity' => 5
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Το προϊόν ενημερώθηκε'
            ]);

        // Verify update
        $response = $this->getJson('/api/v1/cart');
        $this->assertEquals(5, $response->json('items.0.quantity'));

        // Remove item
        $response = $this->deleteJson("/api/v1/cart/items/{$cartItem['id']}");
        
        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Το προϊόν αφαιρέθηκε από το καλάθι'
            ]);

        // Verify removal
        $response = $this->getJson('/api/v1/cart');
        $this->assertCount(0, $response->json('items'));
    }

    /**
     * Test stock validation
     */
    public function test_cannot_add_more_than_available_stock()
    {
        Sanctum::actingAs($this->user);

        $product = Product::factory()->create([
            'producer_id' => $this->producer->id,
            'stock' => 5,
            'is_active' => true
        ]);

        $response = $this->postJson('/api/v1/cart', [
            'product_id' => $product->id,
            'quantity' => 10
        ]);

        $response->assertStatus(422)
            ->assertJson([
                'message' => 'Δεν υπάρχει επαρκές απόθεμα'
            ]);
    }

    /**
     * Test order cannot be created with empty cart
     */
    public function test_cannot_create_order_with_empty_cart()
    {
        Sanctum::actingAs($this->user);

        $shippingAddress = Address::factory()->create([
            'user_id' => $this->user->id
        ]);

        $response = $this->postJson('/api/v1/orders', [
            'shipping_address_id' => $shippingAddress->id,
            'billing_address_id' => $shippingAddress->id,
            'delivery_method_id' => $this->deliveryMethod->id
        ]);

        $response->assertStatus(422)
            ->assertJson([
                'message' => 'Το καλάθι είναι άδειο'
            ]);
    }

    /**
     * Test order creation reduces product stock
     */
    public function test_order_creation_reduces_stock()
    {
        Sanctum::actingAs($this->user);

        $initialStock = $this->products[0]->stock;
        $quantity = 3;

        // Add to cart
        $this->postJson('/api/v1/cart', [
            'product_id' => $this->products[0]->id,
            'quantity' => $quantity
        ]);

        // Create order
        $shippingAddress = Address::factory()->create([
            'user_id' => $this->user->id
        ]);

        $this->postJson('/api/v1/orders', [
            'shipping_address_id' => $shippingAddress->id,
            'billing_address_id' => $shippingAddress->id,
            'delivery_method_id' => $this->deliveryMethod->id
        ]);

        // Verify stock reduced
        $this->products[0]->refresh();
        $this->assertEquals($initialStock - $quantity, $this->products[0]->stock);
    }

    /**
     * Test multi-producer order handling
     */
    public function test_multi_producer_order_splits_correctly()
    {
        Sanctum::actingAs($this->user);

        // Create second producer with products
        $producer2User = User::factory()->create();
        $producer2User->assignRole('producer');
        $producer2 = Producer::factory()->create([
            'user_id' => $producer2User->id,
            'verified' => true
        ]);

        $producer2Product = Product::factory()->create([
            'producer_id' => $producer2->id,
            'is_active' => true
        ]);

        // Add products from both producers
        $this->postJson('/api/v1/cart', [
            'product_id' => $this->products[0]->id,
            'quantity' => 2
        ]);

        $this->postJson('/api/v1/cart', [
            'product_id' => $producer2Product->id,
            'quantity' => 1
        ]);

        // Create order
        $shippingAddress = Address::factory()->create([
            'user_id' => $this->user->id
        ]);

        $response = $this->postJson('/api/v1/orders', [
            'shipping_address_id' => $shippingAddress->id,
            'billing_address_id' => $shippingAddress->id,
            'delivery_method_id' => $this->deliveryMethod->id
        ]);

        $response->assertStatus(201);

        $order = Order::find($response->json('order.id'));
        
        // Verify order has items from both producers
        $producerIds = $order->items->map(function ($item) {
            return $item->product->producer_id;
        })->unique();

        $this->assertCount(2, $producerIds);
        $this->assertTrue($producerIds->contains($this->producer->id));
        $this->assertTrue($producerIds->contains($producer2->id));
    }
}