<?php

namespace Database\Factories;

use App\Models\ShippingZone;
use Illuminate\Database\Eloquent\Factories\Factory;

class ShippingZoneFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = ShippingZone::class;

    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        return [
            'name' => $this->faker->city,
            'description' => $this->faker->sentence,
            'color' => $this->faker->hexColor,
            'is_active' => true,
            'geojson' => json_encode([
                'type' => 'Feature',
                'properties' => [],
                'geometry' => [
                    'type' => 'Polygon',
                    'coordinates' => [
                        [
                            [23.6, 37.9],
                            [23.8, 37.9],
                            [23.8, 38.1],
                            [23.6, 38.1],
                            [23.6, 37.9],
                        ],
                    ],
                ],
            ])
        ];
    }
}
