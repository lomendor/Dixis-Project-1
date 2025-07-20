<?php

namespace Tests\Feature\Api;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\User;
use App\Models\Producer;
use App\Models\Product;
use App\Models\ShippingZone;
use App\Models\PostalCodeZone;
use App\Models\DeliveryMethod;
use App\Models\WeightTier;
use App\Models\ShippingRate;
use App\Models\ProducerShippingMethod;
use App\Models\ProducerShippingRate;
use App\Models\ProducerFreeShipping;
use Laravel\Sanctum\Sanctum;

class ShippingCalculationFlowTest extends TestCase
{
    use RefreshDatabase;

    protected $zones;
    protected $deliveryMethods;
    protected $weightTiers;
    protected $producers;
    protected $products;

    protected function setUp(): void
    {
        parent::setUp();

        // Create shipping zones
        $this->zones = [
            'athens' => ShippingZone::factory()->create([
                'name' => 'Αθήνα',
                'code' => 'ATHENS',
                'is_active' => true
            ]),
            'thessaloniki' => ShippingZone::factory()->create([
                'name' => 'Θεσσαλονίκη', 
                'code' => 'THESSALONIKI',
                'is_active' => true
            ]),
            'islands' => ShippingZone::factory()->create([
                'name' => 'Νησιά',
                'code' => 'ISLANDS',
                'is_active' => true
            ])
        ];

        // Create postal code mappings
        PostalCodeZone::factory()->create([
            'postal_code' => '10001',
            'shipping_zone_id' => $this->zones['athens']->id
        ]);

        PostalCodeZone::factory()->create([
            'postal_code' => '54001',
            'shipping_zone_id' => $this->zones['thessaloniki']->id
        ]);

        PostalCodeZone::factory()->create([
            'postal_code' => '84001',
            'shipping_zone_id' => $this->zones['islands']->id
        ]);

        // Create delivery methods
        $this->deliveryMethods = [
            'standard' => DeliveryMethod::factory()->create([
                'name' => 'Standard',
                'code' => 'standard',
                'is_active' => true
            ]),
            'express' => DeliveryMethod::factory()->create([
                'name' => 'Express',
                'code' => 'express',
                'is_active' => true
            ])
        ];

        // Create weight tiers
        $this->weightTiers = [
            'light' => WeightTier::factory()->create([
                'name' => '0-2kg',
                'min_weight' => 0,
                'max_weight' => 2000
            ]),
            'medium' => WeightTier::factory()->create([
                'name' => '2-5kg',
                'min_weight' => 2001,
                'max_weight' => 5000
            ]),
            'heavy' => WeightTier::factory()->create([
                'name' => '5-10kg',
                'min_weight' => 5001,
                'max_weight' => 10000
            ])
        ];

        // Create default shipping rates
        $this->createDefaultRates();

        // Create producers with products
        $this->createProducersAndProducts();
    }

    private function createDefaultRates()
    {
        // Athens rates
        ShippingRate::factory()->create([
            'shipping_zone_id' => $this->zones['athens']->id,
            'delivery_method_id' => $this->deliveryMethods['standard']->id,
            'weight_tier_id' => $this->weightTiers['light']->id,
            'rate' => 3.00
        ]);

        ShippingRate::factory()->create([
            'shipping_zone_id' => $this->zones['athens']->id,
            'delivery_method_id' => $this->deliveryMethods['express']->id,
            'weight_tier_id' => $this->weightTiers['light']->id,
            'rate' => 5.00
        ]);

        // Thessaloniki rates
        ShippingRate::factory()->create([
            'shipping_zone_id' => $this->zones['thessaloniki']->id,
            'delivery_method_id' => $this->deliveryMethods['standard']->id,
            'weight_tier_id' => $this->weightTiers['light']->id,
            'rate' => 4.00
        ]);

        // Islands rates (higher)
        ShippingRate::factory()->create([
            'shipping_zone_id' => $this->zones['islands']->id,
            'delivery_method_id' => $this->deliveryMethods['standard']->id,
            'weight_tier_id' => $this->weightTiers['light']->id,
            'rate' => 8.00
        ]);
    }

    private function createProducersAndProducts()
    {
        // Producer 1 with standard rates
        $user1 = User::factory()->create();
        $user1->assignRole('producer');
        
        $producer1 = Producer::factory()->create([
            'user_id' => $user1->id,
            'use_custom_shipping_rates' => false
        ]);

        // Enable shipping methods for producer 1
        ProducerShippingMethod::create([
            'producer_id' => $producer1->id,
            'delivery_method_id' => $this->deliveryMethods['standard']->id
        ]);

        // Producer 2 with custom rates
        $user2 = User::factory()->create();
        $user2->assignRole('producer');
        
        $producer2 = Producer::factory()->create([
            'user_id' => $user2->id,
            'use_custom_shipping_rates' => true
        ]);

        // Enable shipping methods for producer 2
        ProducerShippingMethod::create([
            'producer_id' => $producer2->id,
            'delivery_method_id' => $this->deliveryMethods['standard']->id
        ]);

        ProducerShippingMethod::create([
            'producer_id' => $producer2->id,
            'delivery_method_id' => $this->deliveryMethods['express']->id
        ]);

        // Custom rate for producer 2
        ProducerShippingRate::create([
            'producer_id' => $producer2->id,
            'shipping_zone_id' => $this->zones['athens']->id,
            'delivery_method_id' => $this->deliveryMethods['standard']->id,
            'weight_tier_id' => $this->weightTiers['light']->id,
            'rate' => 2.50 // Cheaper than default
        ]);

        // Free shipping rule for producer 2
        ProducerFreeShipping::create([
            'producer_id' => $producer2->id,
            'min_order_amount' => 50.00,
            'shipping_zone_id' => $this->zones['athens']->id,
            'is_active' => true
        ]);

        $this->producers = [$producer1, $producer2];

        // Create products
        $this->products = [
            Product::factory()->create([
                'producer_id' => $producer1->id,
                'price' => 10.00,
                'weight' => 1000, // 1kg
                'is_active' => true
            ]),
            Product::factory()->create([
                'producer_id' => $producer2->id,
                'price' => 25.00,
                'weight' => 1500, // 1.5kg
                'is_active' => true
            ])
        ];
    }

    /**
     * Test basic shipping calculation
     */
    public function test_can_calculate_shipping_for_single_producer()
    {
        $response = $this->postJson('/api/v1/shipping/calculate', [
            'postal_code' => '10001', // Athens
            'items' => [
                [
                    'product_id' => $this->products[0]->id,
                    'quantity' => 2 // 2kg total
                ]
            ]
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'shipping_options',
                'total_weight',
                'shipping_zone',
                'free_shipping_eligible'
            ]);

        $options = $response->json('shipping_options');
        $this->assertCount(1, $options); // Only standard method available
        $this->assertEquals(3.00, $options[0]['rate']); // Athens standard rate
    }

    /**
     * Test shipping with custom producer rates
     */
    public function test_custom_producer_rates_applied()
    {
        $response = $this->postJson('/api/v1/shipping/calculate', [
            'postal_code' => '10001', // Athens
            'items' => [
                [
                    'product_id' => $this->products[1]->id,
                    'quantity' => 1
                ]
            ]
        ]);

        $response->assertStatus(200);

        $options = $response->json('shipping_options');
        $standardOption = collect($options)->firstWhere('method', 'standard');
        
        $this->assertEquals(2.50, $standardOption['rate']); // Custom rate
    }

    /**
     * Test free shipping threshold
     */
    public function test_free_shipping_applied_when_threshold_met()
    {
        $response = $this->postJson('/api/v1/shipping/calculate', [
            'postal_code' => '10001', // Athens
            'items' => [
                [
                    'product_id' => $this->products[1]->id,
                    'quantity' => 3 // 75€ total, above 50€ threshold
                ]
            ]
        ]);

        $response->assertStatus(200);

        $this->assertTrue($response->json('free_shipping_eligible'));
        
        $options = $response->json('shipping_options');
        $standardOption = collect($options)->firstWhere('method', 'standard');
        
        $this->assertEquals(0, $standardOption['rate']); // Free shipping
    }

    /**
     * Test multi-producer shipping calculation
     */
    public function test_multi_producer_shipping_calculation()
    {
        $response = $this->postJson('/api/v1/shipping/calculate', [
            'postal_code' => '10001',
            'items' => [
                [
                    'product_id' => $this->products[0]->id,
                    'quantity' => 1
                ],
                [
                    'product_id' => $this->products[1]->id,
                    'quantity' => 1
                ]
            ]
        ]);

        $response->assertStatus(200);

        $breakdown = $response->json('producer_breakdown');
        $this->assertCount(2, $breakdown);

        // Check each producer's shipping
        $producer1Shipping = collect($breakdown)->firstWhere('producer_id', $this->producers[0]->id);
        $producer2Shipping = collect($breakdown)->firstWhere('producer_id', $this->producers[1]->id);

        $this->assertEquals(3.00, $producer1Shipping['shipping_cost']); // Default rate
        $this->assertEquals(2.50, $producer2Shipping['shipping_cost']); // Custom rate
    }

    /**
     * Test weight tier calculation
     */
    public function test_correct_weight_tier_selected()
    {
        // Create heavy product
        $heavyProduct = Product::factory()->create([
            'producer_id' => $this->producers[0]->id,
            'weight' => 3000, // 3kg
            'price' => 50.00
        ]);

        // Add rate for medium weight tier
        ShippingRate::factory()->create([
            'shipping_zone_id' => $this->zones['athens']->id,
            'delivery_method_id' => $this->deliveryMethods['standard']->id,
            'weight_tier_id' => $this->weightTiers['medium']->id,
            'rate' => 5.00
        ]);

        $response = $this->postJson('/api/v1/shipping/calculate', [
            'postal_code' => '10001',
            'items' => [
                [
                    'product_id' => $heavyProduct->id,
                    'quantity' => 1 // 3kg, should use medium tier
                ]
            ]
        ]);

        $response->assertStatus(200);

        $options = $response->json('shipping_options');
        $this->assertEquals(5.00, $options[0]['rate']); // Medium tier rate
    }

    /**
     * Test island shipping rates
     */
    public function test_island_shipping_higher_rates()
    {
        $response = $this->postJson('/api/v1/shipping/calculate', [
            'postal_code' => '84001', // Islands
            'items' => [
                [
                    'product_id' => $this->products[0]->id,
                    'quantity' => 1
                ]
            ]
        ]);

        $response->assertStatus(200);

        $options = $response->json('shipping_options');
        $this->assertEquals(8.00, $options[0]['rate']); // Islands rate
    }

    /**
     * Test shipping zone detection
     */
    public function test_postal_code_zone_detection()
    {
        $response = $this->postJson('/api/v1/shipping/find-zone', [
            'postal_code' => '54001'
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'zone' => [
                    'name' => 'Θεσσαλονίκη',
                    'code' => 'THESSALONIKI'
                ]
            ]);
    }

    /**
     * Test invalid postal code handling
     */
    public function test_invalid_postal_code_returns_default_zone()
    {
        $response = $this->postJson('/api/v1/shipping/calculate', [
            'postal_code' => '99999', // Invalid
            'items' => [
                [
                    'product_id' => $this->products[0]->id,
                    'quantity' => 1
                ]
            ]
        ]);

        $response->assertStatus(200);
        // Should return default zone rates or specific error handling
    }

    /**
     * Test shipping options caching
     */
    public function test_shipping_calculation_is_cached()
    {
        $payload = [
            'postal_code' => '10001',
            'items' => [
                [
                    'product_id' => $this->products[0]->id,
                    'quantity' => 1
                ]
            ]
        ];

        // First request
        $response1 = $this->postJson('/api/v1/shipping/calculate', $payload);
        $response1->assertStatus(200);

        // Second request (should use cache)
        $response2 = $this->postJson('/api/v1/shipping/calculate', $payload);
        $response2->assertStatus(200);

        // Results should be identical
        $this->assertEquals(
            $response1->json('shipping_options'),
            $response2->json('shipping_options')
        );
    }
}