<?php

namespace Database\Factories;

use App\Models\DeliveryMethod;
use App\Models\Producer;
use App\Models\ShippingRate;
use App\Models\ShippingZone;
use App\Models\WeightTier;
use Illuminate\Database\Eloquent\Factories\Factory;

class ShippingRateFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = ShippingRate::class;

    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        return [
            'shipping_zone_id' => ShippingZone::factory(),
            'weight_tier_id' => WeightTier::factory(),
            'delivery_method_id' => DeliveryMethod::factory(),
            'price' => $this->faker->randomFloat(2, 2, 20),
            'multi_producer_discount' => $this->faker->optional(0.7)->randomFloat(2, 5, 30),
            'min_producers_for_discount' => $this->faker->optional(0.7)->numberBetween(2, 5),
        ];
    }
}
