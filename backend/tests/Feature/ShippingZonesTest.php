<?php

namespace Tests\Feature;

use App\Models\ShippingZone;
use Tests\TestCase;

class ShippingZonesTest extends TestCase
{

    public function test_can_get_shipping_zones_geojson()
    {
        // Create shipping zones
        ShippingZone::factory()->create([
            'name' => 'Αθήνα',
            'is_active' => true,
            'color' => '#805AD5',
            'geojson' => json_encode([
                'type' => 'Feature',
                'properties' => [],
                'geometry' => [
                    'type' => 'Polygon',
                    'coordinates' => [
                        [
                            [23.6, 37.9],
                            [23.9, 37.9],
                            [23.9, 38.1],
                            [23.6, 38.1],
                            [23.6, 37.9],
                        ],
                    ],
                ],
            ])
        ]);

        ShippingZone::factory()->create([
            'name' => 'Θεσσαλονίκη',
            'is_active' => true,
            'color' => '#3182CE',
            'geojson' => json_encode([
                'type' => 'Feature',
                'properties' => [],
                'geometry' => [
                    'type' => 'Polygon',
                    'coordinates' => [
                        [
                            [22.9, 40.6],
                            [23.0, 40.6],
                            [23.0, 40.7],
                            [22.9, 40.7],
                            [22.9, 40.6],
                        ],
                    ],
                ],
            ])
        ]);

        // Create an inactive zone that shouldn't be returned
        ShippingZone::factory()->create([
            'name' => 'Inactive Zone',
            'is_active' => false
        ]);

        // Test getting shipping zones
        $response = $this->getJson('/api/shipping/zones-geojson');

        $response->assertStatus(200)
                ->assertJsonCount(2)
                ->assertJsonStructure([
                    '*' => [
                        'id',
                        'name',
                        'description',
                        'color',
                        'is_active',
                        'geojson'
                    ]
                ])
                ->assertJsonPath('0.name', 'Αθήνα')
                ->assertJsonPath('1.name', 'Θεσσαλονίκη');
    }
}
