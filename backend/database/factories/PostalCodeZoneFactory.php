<?php

namespace Database\Factories;

use App\Models\PostalCodeZone;
use App\Models\ShippingZone;
use Illuminate\Database\Eloquent\Factories\Factory;

class PostalCodeZoneFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = PostalCodeZone::class;

    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        return [
            'postal_code_prefix' => $this->faker->numerify('###'),
            'shipping_zone_id' => ShippingZone::factory(),
            'description' => $this->faker->sentence,
        ];
    }
}
