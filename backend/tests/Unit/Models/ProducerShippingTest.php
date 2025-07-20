<?php

namespace Tests\Unit\Models;

use App\Models\Producer;
use App\Models\ProducerShippingMethod;
use App\Models\ProducerShippingRate;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProducerShippingTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test the relationship between Producer and ProducerShippingMethod.
     */
    public function test_producer_has_many_shipping_methods(): void
    {
        // Create a user with producer role
        $user = User::factory()->create(['role' => 'producer']);
        
        // Create a producer
        $producer = Producer::create([
            'user_id' => $user->id,
            'business_name' => 'Test Producer',
            'tax_id' => '123456789',
            'tax_office' => 'Test Tax Office',
            'description' => 'Test Description',
            'verified' => true,
        ]);

        // Create shipping methods for the producer
        ProducerShippingMethod::create([
            'producer_id' => $producer->id,
            'delivery_method_id' => 1, // Assuming delivery method with ID 1 exists
            'is_enabled' => true,
        ]);

        ProducerShippingMethod::create([
            'producer_id' => $producer->id,
            'delivery_method_id' => 2, // Assuming delivery method with ID 2 exists
            'is_enabled' => false,
        ]);

        // Test the relationship
        $this->assertCount(2, $producer->shippingMethods);
        $this->assertInstanceOf(ProducerShippingMethod::class, $producer->shippingMethods->first());
        $this->assertTrue($producer->shippingMethods->first()->is_enabled);
    }

    /**
     * Test the relationship between Producer and ProducerShippingRate.
     */
    public function test_producer_has_many_shipping_rates(): void
    {
        // Create a user with producer role
        $user = User::factory()->create(['role' => 'producer']);
        
        // Create a producer
        $producer = Producer::create([
            'user_id' => $user->id,
            'business_name' => 'Test Producer',
            'tax_id' => '123456789',
            'tax_office' => 'Test Tax Office',
            'description' => 'Test Description',
            'verified' => true,
        ]);

        // Create shipping rates for the producer
        ProducerShippingRate::create([
            'producer_id' => $producer->id,
            'shipping_zone_id' => 1, // Assuming shipping zone with ID 1 exists
            'weight_tier_id' => 1, // Assuming weight tier with ID 1 exists
            'delivery_method_id' => 1, // Assuming delivery method with ID 1 exists
            'price' => 5.99,
        ]);

        ProducerShippingRate::create([
            'producer_id' => $producer->id,
            'shipping_zone_id' => 2, // Assuming shipping zone with ID 2 exists
            'weight_tier_id' => 1, // Assuming weight tier with ID 1 exists
            'delivery_method_id' => 1, // Assuming delivery method with ID 1 exists
            'price' => 7.99,
        ]);

        // Test the relationship
        $this->assertCount(2, $producer->shippingRates);
        $this->assertInstanceOf(ProducerShippingRate::class, $producer->shippingRates->first());
        $this->assertEquals(5.99, $producer->shippingRates->first()->price);
    }
}
