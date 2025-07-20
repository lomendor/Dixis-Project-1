<?php

namespace Database\Factories;

use App\Models\ProductImage;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProductImageFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = ProductImage::class;

    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        return [
            'product_id' => Product::factory(),
            'image_path' => 'products/' . $this->faker->uuid() . '.jpg',
            'alt_text' => $this->faker->sentence(3),
            'sort_order' => $this->faker->numberBetween(1, 10),
        ];
    }
}
