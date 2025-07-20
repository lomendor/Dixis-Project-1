<?php

namespace Database\Factories;

use App\Models\DeliveryMethod;
use Illuminate\Database\Eloquent\Factories\Factory;

class DeliveryMethodFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = DeliveryMethod::class;

    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        $methods = [
            ['Home Delivery', 'HOME'],
            ['Pickup Point', 'PICKUP'],
            ['Locker', 'LOCKER']
        ];
        
        $method = $this->faker->randomElement($methods);
        
        return [
            'name' => $method[0],
            'code' => $method[1],
            'description' => $this->faker->sentence,
            'is_active' => true,
            'max_weight_grams' => $this->faker->numberBetween(5000, 30000),
            'max_length_cm' => $this->faker->numberBetween(50, 200),
            'max_width_cm' => $this->faker->numberBetween(30, 100),
            'max_height_cm' => $this->faker->numberBetween(20, 80),
            'suitable_for_perishable' => $this->faker->boolean(70),
            'suitable_for_fragile' => $this->faker->boolean(70),
            'supports_cod' => $this->faker->boolean(80),
        ];
    }
}
