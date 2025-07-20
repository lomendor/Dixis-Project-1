<?php

namespace Database\Factories;

use App\Models\WeightTier;
use Illuminate\Database\Eloquent\Factories\Factory;

class WeightTierFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = WeightTier::class;

    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        $minWeight = $this->faker->numberBetween(0, 5000);
        $maxWeight = $this->faker->numberBetween($minWeight + 1000, $minWeight + 5000);

        return [
            'code' => 'TIER_' . $this->faker->unique()->randomNumber(4),
            'min_weight_grams' => $minWeight,
            'max_weight_grams' => $maxWeight,
            'description' => $this->faker->sentence,
        ];
    }
}
