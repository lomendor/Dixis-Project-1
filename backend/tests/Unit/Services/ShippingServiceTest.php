<?php

namespace Tests\Unit\Services;

use App\Models\Address;
use App\Models\DeliveryMethod;
use App\Models\PostalCodeZone;
use App\Models\Producer;
use App\Models\Product;
use App\Models\ProducerShippingMethod;
use App\Models\ShippingRate;
use App\Models\ShippingZone;
use App\Models\User;
use App\Models\WeightTier;
use App\Services\ShippingService;
use Illuminate\Support\Collection;
use Tests\TestCase;

class ShippingServiceTest extends TestCase
{

    protected ShippingService $shippingService;
    protected ShippingZone $zone;
    protected WeightTier $weightTier;
    protected DeliveryMethod $deliveryMethod;
    protected Producer $producer1;
    protected Producer $producer2;
    protected Address $address;

    protected function setUp(): void
    {
        parent::setUp();

        $this->shippingService = new ShippingService();

        // Create shipping zone
        $this->zone = ShippingZone::factory()->create([
            'name' => 'Test Zone',
            'is_active' => true
        ]);

        // Create postal code mapping
        PostalCodeZone::factory()->create([
            'postal_code_prefix' => '104',
            'shipping_zone_id' => $this->zone->id
        ]);

        // Create weight tier
        $this->weightTier = WeightTier::factory()->create([
            'name' => 'Up to 1kg',
            'min_weight_grams' => 0,
            'max_weight_grams' => 1000
        ]);

        // Create delivery method
        $this->deliveryMethod = DeliveryMethod::factory()->create([
            'name' => 'Home Delivery',
            'code' => 'HOME',
            'is_active' => true,
            'supports_cod' => true
        ]);

        // Create producers
        $user1 = User::factory()->create(['role' => 'producer']);
        $this->producer1 = Producer::factory()->create(['user_id' => $user1->id]);

        $user2 = User::factory()->create(['role' => 'producer']);
        $this->producer2 = Producer::factory()->create(['user_id' => $user2->id]);

        // Enable shipping methods for producers
        ProducerShippingMethod::factory()->create([
            'producer_id' => $this->producer1->id,
            'delivery_method_id' => $this->deliveryMethod->id,
            'is_enabled' => true
        ]);

        ProducerShippingMethod::factory()->create([
            'producer_id' => $this->producer2->id,
            'delivery_method_id' => $this->deliveryMethod->id,
            'is_enabled' => true
        ]);

        // Create shipping rates
        ShippingRate::factory()->create([
            'shipping_zone_id' => $this->zone->id,
            'weight_tier_id' => $this->weightTier->id,
            'delivery_method_id' => $this->deliveryMethod->id,
            'producer_id' => $this->producer1->id,
            'price' => 5.00,
            'multi_producer_discount' => 20.00,
            'min_producers_for_discount' => 2
        ]);

        ShippingRate::factory()->create([
            'shipping_zone_id' => $this->zone->id,
            'weight_tier_id' => $this->weightTier->id,
            'delivery_method_id' => $this->deliveryMethod->id,
            'producer_id' => $this->producer2->id,
            'price' => 6.00,
            'multi_producer_discount' => 15.00,
            'min_producers_for_discount' => 2
        ]);

        // Create address
        $this->address = Address::factory()->create([
            'postal_code' => '10431'
        ]);
    }

    public function test_get_zone_id_for_postal_code()
    {
        $zoneId = $this->shippingService->getZoneIdForPostalCode('10431');
        $this->assertEquals($this->zone->id, $zoneId);

        // Test with unknown postal code (should return default)
        $zoneId = $this->shippingService->getZoneIdForPostalCode('99999');
        $this->assertEquals(3, $zoneId); // Default zone ID is 3
    }

    public function test_multi_producer_discount_is_applied()
    {
        // Create products
        $product1 = Product::factory()->create([
            'producer_id' => $this->producer1->id,
            'weight_grams' => 500,
            'price' => 10.00
        ]);

        $product2 = Product::factory()->create([
            'producer_id' => $this->producer2->id,
            'weight_grams' => 500,
            'price' => 15.00
        ]);

        // Create cart items
        $cartItems = new Collection([
            [
                'product_id' => $product1->id,
                'quantity' => 1,
                'product' => $product1
            ],
            [
                'product_id' => $product2->id,
                'quantity' => 1,
                'product' => $product2
            ]
        ]);

        // Calculate shipping
        $result = $this->shippingService->calculateShipping($cartItems, $this->address);

        // Check that we have results for both producers
        $this->assertCount(2, $result['producers']);

        // Check that discounts were applied
        $producer1Result = collect($result['producers'])->firstWhere('producer_id', $this->producer1->id);
        $producer2Result = collect($result['producers'])->firstWhere('producer_id', $this->producer2->id);

        $this->assertNotNull($producer1Result);
        $this->assertNotNull($producer2Result);

        // Get the selected shipping option for each producer
        $producer1Option = collect($producer1Result['options'])->firstWhere('method_id', $this->deliveryMethod->id);
        $producer2Option = collect($producer2Result['options'])->firstWhere('method_id', $this->deliveryMethod->id);

        $this->assertNotNull($producer1Option);
        $this->assertNotNull($producer2Option);

        // Check that the costs are discounted
        // Producer 1: 5.00 - 20% = 4.00
        // Producer 2: 6.00 - 15% = 5.10
        $this->assertEquals(4.00, $producer1Option['cost']);
        $this->assertEquals(5.10, $producer2Option['cost']);

        // Check that original costs are stored
        $this->assertEquals(5.00, $producer1Option['original_cost']);
        $this->assertEquals(6.00, $producer2Option['original_cost']);

        // Check that discount info is stored
        $this->assertEquals(20.00, $producer1Option['discount_applied']['percentage']);
        $this->assertEquals(15.00, $producer2Option['discount_applied']['percentage']);

        $this->assertEquals(1.00, $producer1Option['discount_applied']['amount']);
        $this->assertEquals(0.90, $producer2Option['discount_applied']['amount']);
    }
}
