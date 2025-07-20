<?php

namespace Tests\Unit\Services;

use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Producer;
use App\Models\User;
use App\Services\RecommendationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RecommendationServiceTest extends TestCase
{
    use RefreshDatabase;

    protected RecommendationService $recommendationService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->recommendationService = new RecommendationService();
    }

    public function test_get_similar_products()
    {
        // Create a producer
        $user = User::factory()->create(['role' => 'producer']);
        $producer = Producer::factory()->create(['user_id' => $user->id]);

        // Create a category
        $category = Category::factory()->create();

        // Create a product
        $product = Product::factory()->create([
            'producer_id' => $producer->id,
            'is_active' => true
        ]);
        $product->categories()->attach($category->id);

        // Create similar products
        $similarProduct1 = Product::factory()->create([
            'producer_id' => $producer->id,
            'is_active' => true
        ]);
        $similarProduct1->categories()->attach($category->id);

        $similarProduct2 = Product::factory()->create([
            'producer_id' => $producer->id,
            'is_active' => true
        ]);
        $similarProduct2->categories()->attach($category->id);

        // Create a product in a different category
        $otherCategory = Category::factory()->create();
        $otherProduct = Product::factory()->create([
            'producer_id' => $producer->id,
            'is_active' => true
        ]);
        $otherProduct->categories()->attach($otherCategory->id);

        // Get similar products
        $similarProducts = $this->recommendationService->getSimilarProducts($product->id, 2);

        // Assert that we get 2 similar products
        $this->assertCount(2, $similarProducts);

        // Assert that the similar products are in the same category
        $this->assertTrue($similarProducts->contains('id', $similarProduct1->id));
        $this->assertTrue($similarProducts->contains('id', $similarProduct2->id));

        // Assert that the original product is not included
        $this->assertFalse($similarProducts->contains('id', $product->id));

        // Assert that the product from a different category is not included
        $this->assertFalse($similarProducts->contains('id', $otherProduct->id));
    }

    public function test_get_category_products()
    {
        // Create a producer
        $user = User::factory()->create(['role' => 'producer']);
        $producer = Producer::factory()->create(['user_id' => $user->id]);

        // Create categories
        $category1 = Category::factory()->create();
        $category2 = Category::factory()->create();

        // Create products in category 1
        $product1 = Product::factory()->create([
            'producer_id' => $producer->id,
            'is_active' => true
        ]);
        $product1->categories()->attach($category1->id);

        $product2 = Product::factory()->create([
            'producer_id' => $producer->id,
            'is_active' => true
        ]);
        $product2->categories()->attach($category1->id);

        // Create a product in category 2
        $product3 = Product::factory()->create([
            'producer_id' => $producer->id,
            'is_active' => true
        ]);
        $product3->categories()->attach($category2->id);

        // Get products from category 1
        $categoryProducts = $this->recommendationService->getCategoryProducts($category1->id, 2);

        // Assert that we get 2 products from category 1
        $this->assertCount(2, $categoryProducts);

        // Assert that the products are from category 1
        $this->assertTrue($categoryProducts->contains('id', $product1->id));
        $this->assertTrue($categoryProducts->contains('id', $product2->id));

        // Assert that the product from category 2 is not included
        $this->assertFalse($categoryProducts->contains('id', $product3->id));
    }

    public function test_get_frequently_bought_together()
    {
        // Create a producer
        $user = User::factory()->create(['role' => 'producer']);
        $producer = Producer::factory()->create(['user_id' => $user->id]);

        // Create products
        $product1 = Product::factory()->create([
            'producer_id' => $producer->id,
            'is_active' => true
        ]);

        $product2 = Product::factory()->create([
            'producer_id' => $producer->id,
            'is_active' => true
        ]);

        $product3 = Product::factory()->create([
            'producer_id' => $producer->id,
            'is_active' => true
        ]);

        // Create a customer
        $customer = User::factory()->create(['role' => 'customer']);

        // Create orders where product1 and product2 are bought together
        $order1 = Order::factory()->create([
            'user_id' => $customer->id,
            'status' => 'completed'
        ]);

        OrderItem::factory()->create([
            'order_id' => $order1->id,
            'product_id' => $product1->id,
            'quantity' => 1,
            'price' => 10.00
        ]);

        OrderItem::factory()->create([
            'order_id' => $order1->id,
            'product_id' => $product2->id,
            'quantity' => 1,
            'price' => 15.00
        ]);

        $order2 = Order::factory()->create([
            'user_id' => $customer->id,
            'status' => 'completed'
        ]);

        OrderItem::factory()->create([
            'order_id' => $order2->id,
            'product_id' => $product1->id,
            'quantity' => 1,
            'price' => 10.00
        ]);

        OrderItem::factory()->create([
            'order_id' => $order2->id,
            'product_id' => $product3->id,
            'quantity' => 1,
            'price' => 20.00
        ]);

        // Get frequently bought together products for product1
        $frequentlyBoughtTogether = $this->recommendationService->getFrequentlyBoughtTogether($product1->id, 2);

        // Assert that we get 2 products
        $this->assertCount(2, $frequentlyBoughtTogether);

        // Assert that product2 and product3 are included
        $this->assertTrue($frequentlyBoughtTogether->contains('id', $product2->id));
        $this->assertTrue($frequentlyBoughtTogether->contains('id', $product3->id));

        // Assert that product1 is not included
        $this->assertFalse($frequentlyBoughtTogether->contains('id', $product1->id));
    }

    public function test_get_popular_products()
    {
        // Create a producer
        $user = User::factory()->create(['role' => 'producer']);
        $producer = Producer::factory()->create(['user_id' => $user->id]);

        // Create products
        $product1 = Product::factory()->create([
            'producer_id' => $producer->id,
            'is_active' => true
        ]);

        $product2 = Product::factory()->create([
            'producer_id' => $producer->id,
            'is_active' => true
        ]);

        $product3 = Product::factory()->create([
            'producer_id' => $producer->id,
            'is_active' => true
        ]);

        // Create a customer
        $customer = User::factory()->create(['role' => 'customer']);

        // Create orders with different products
        $order1 = Order::factory()->create([
            'user_id' => $customer->id,
            'status' => 'completed'
        ]);

        // Product1 is ordered twice
        OrderItem::factory()->create([
            'order_id' => $order1->id,
            'product_id' => $product1->id,
            'quantity' => 1,
            'price' => 10.00
        ]);

        $order2 = Order::factory()->create([
            'user_id' => $customer->id,
            'status' => 'completed'
        ]);

        OrderItem::factory()->create([
            'order_id' => $order2->id,
            'product_id' => $product1->id,
            'quantity' => 1,
            'price' => 10.00
        ]);

        // Product2 is ordered once
        OrderItem::factory()->create([
            'order_id' => $order2->id,
            'product_id' => $product2->id,
            'quantity' => 1,
            'price' => 15.00
        ]);

        // Product3 is not ordered

        // Get popular products
        $popularProducts = $this->recommendationService->getPopularProducts(2);

        // Assert that we get 2 products
        $this->assertCount(2, $popularProducts);

        // Assert that product1 and product2 are included (in order of popularity)
        $this->assertEquals($product1->id, $popularProducts[0]->id);
        $this->assertEquals($product2->id, $popularProducts[1]->id);

        // Assert that product3 is not included
        $this->assertFalse($popularProducts->contains('id', $product3->id));
    }
}
