<?php

namespace Tests\Unit\Models;

use App\Models\PostalCodeZone;
use App\Models\ShippingZone;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PostalCodeZoneTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test that a postal code zone can be created.
     */
    public function test_postal_code_zone_can_be_created(): void
    {
        // Create a shipping zone first
        $shippingZone = ShippingZone::create([
            'name' => 'Test Zone',
            'description' => 'Test Description',
            'is_active' => true,
        ]);

        $postalCodeZoneData = [
            'postal_code_prefix' => '999',
            'shipping_zone_id' => $shippingZone->id,
        ];

        $postalCodeZone = PostalCodeZone::create($postalCodeZoneData);

        $this->assertInstanceOf(PostalCodeZone::class, $postalCodeZone);
        $this->assertEquals('999', $postalCodeZone->postal_code_prefix);
        $this->assertEquals($shippingZone->id, $postalCodeZone->shipping_zone_id);
    }

    /**
     * Test the relationship between PostalCodeZone and ShippingZone.
     */
    public function test_postal_code_zone_belongs_to_shipping_zone(): void
    {
        // Create a shipping zone
        $shippingZone = ShippingZone::create([
            'name' => 'Test Zone',
            'description' => 'Test Description',
            'is_active' => true,
        ]);

        // Create a postal code zone associated with the shipping zone
        $postalCodeZone = PostalCodeZone::create([
            'postal_code_prefix' => '998',
            'shipping_zone_id' => $shippingZone->id,
        ]);

        // Test the relationship
        $this->assertInstanceOf(ShippingZone::class, $postalCodeZone->shippingZone);
        $this->assertEquals($shippingZone->id, $postalCodeZone->shippingZone->id);
        $this->assertEquals('Test Zone', $postalCodeZone->shippingZone->name);
    }
}
