<?php

namespace Database\Factories;

use App\Models\Address;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class AddressFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Address::class;

    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        return [
            'user_id' => User::factory(), // Automatically create a user if not provided
            'name' => $this->faker->name,
            'address_line_1' => $this->faker->streetAddress,
            'city' => $this->faker->city,
            'postal_code' => $this->faker->postcode,
            'region' => $this->faker->state, // Or use a specific list of Greek regions
            'country' => 'Ελλάδα',
            'phone' => $this->faker->phoneNumber,
            'is_default_shipping' => false,
            'is_default_billing' => false,
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }
}
