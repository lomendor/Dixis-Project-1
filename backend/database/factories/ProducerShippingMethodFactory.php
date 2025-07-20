<?php

namespace Database\Factories;

use App\Models\DeliveryMethod;
use App\Models\Producer;
use App\Models\ProducerShippingMethod;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProducerShippingMethodFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = ProducerShippingMethod::class;

    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        return [
            'producer_id' => Producer::factory(),
            'delivery_method_id' => DeliveryMethod::factory(),
            'is_enabled' => true,
        ];
    }
}
