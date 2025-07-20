<?php

namespace Tests\Feature\Api;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\User;
use App\Models\Producer;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductCategory;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\ProductQuestion;
use App\Models\ProducerShippingMethod;
use App\Models\DeliveryMethod;
use Laravel\Sanctum\Sanctum;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class ProducerDashboardFlowTest extends TestCase
{
    use RefreshDatabase;

    protected $producerUser;
    protected $producer;
    protected $category;

    protected function setUp(): void
    {
        parent::setUp();

        // Create producer user and producer
        $this->producerUser = User::factory()->create();
        $this->producerUser->assignRole('producer');
        
        $this->producer = Producer::factory()->create([
            'user_id' => $this->producerUser->id,
            'is_verified' => true
        ]);

        // Create category
        $this->category = ProductCategory::factory()->create([
            'name' => 'Λαχανικά',
            'type' => 'main'
        ]);

        // Setup storage
        Storage::fake('public');
    }

    /**
     * Test producer can access dashboard
     */
    public function test_producer_can_access_dashboard_stats()
    {
        Sanctum::actingAs($this->producerUser);

        $response = $this->getJson('/api/v1/producer/dashboard/stats');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'overview' => [
                    'total_products',
                    'active_products',
                    'total_orders',
                    'pending_orders',
                    'total_revenue',
                    'revenue_this_month'
                ],
                'recent_orders',
                'popular_products',
                'low_stock_products',
                'unanswered_questions'
            ]);
    }

    /**
     * Test complete product management flow
     */
    public function test_producer_can_manage_products()
    {
        Sanctum::actingAs($this->producerUser);

        // Step 1: Create product
        $response = $this->postJson('/api/v1/producer/products', [
            'name' => 'Τομάτες Βιολογικές',
            'description' => 'Φρέσκες βιολογικές τομάτες από τον κήπο μας',
            'price' => 3.50,
            'stock' => 100,
            'unit' => 'kg',
            'category_id' => $this->category->id,
            'is_featured' => true,
            'weight' => 1000
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'message',
                'product' => [
                    'id',
                    'name',
                    'slug',
                    'price',
                    'stock'
                ]
            ]);

        $productId = $response->json('product.id');

        // Step 2: Upload product images
        $response = $this->postJson("/api/v1/producer/products/{$productId}/images", [
            'images' => [
                UploadedFile::fake()->image('tomato1.jpg'),
                UploadedFile::fake()->image('tomato2.jpg')
            ],
            'main_image_index' => 0
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Οι εικόνες ανέβηκαν επιτυχώς'
            ]);

        // Step 3: Update product
        $response = $this->putJson("/api/v1/producer/products/{$productId}", [
            'price' => 3.80,
            'stock' => 150
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Το προϊόν ενημερώθηκε επιτυχώς'
            ]);

        // Step 4: Get products list
        $response = $this->getJson('/api/v1/producer/products');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data',
                'total',
                'per_page'
            ]);

        $this->assertCount(1, $response->json('data'));

        // Step 5: Add cost breakdown
        $response = $this->postJson("/api/v1/producer/products/{$productId}/costs", [
            'production_cost' => 1.50,
            'packaging_cost' => 0.30,
            'labor_cost' => 0.80,
            'transportation_cost' => 0.20,
            'platform_fee' => 0.40,
            'profit_margin' => 0.60,
            'notes' => 'Βιολογική καλλιέργεια'
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Η ανάλυση κόστους ενημερώθηκε επιτυχώς'
            ]);
    }

    /**
     * Test producer order management
     */
    public function test_producer_can_manage_orders()
    {
        Sanctum::actingAs($this->producerUser);

        // Create product and order
        $product = Product::factory()->create([
            'producer_id' => $this->producer->id
        ]);

        $customer = User::factory()->create();
        $order = Order::factory()->create([
            'user_id' => $customer->id,
            'status' => 'pending'
        ]);

        $orderItem = OrderItem::factory()->create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'quantity' => 5,
            'price' => $product->price
        ]);

        // Get orders
        $response = $this->getJson('/api/v1/producer/orders');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data',
                'total'
            ]);

        $this->assertEquals(1, $response->json('total'));

        // Update order status
        $response = $this->putJson("/api/v1/producer/orders/{$order->id}/status", [
            'status' => 'processing',
            'notes' => 'Ξεκίνησε η προετοιμασία'
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Η κατάσταση της παραγγελίας ενημερώθηκε επιτυχώς'
            ]);

        // Verify status changed
        $order->refresh();
        $this->assertEquals('processing', $orderItem->fresh()->status);
    }

    /**
     * Test producer question answering
     */
    public function test_producer_can_answer_questions()
    {
        Sanctum::actingAs($this->producerUser);

        // Create product with question
        $product = Product::factory()->create([
            'producer_id' => $this->producer->id
        ]);

        $customer = User::factory()->create();
        $question = ProductQuestion::factory()->create([
            'product_id' => $product->id,
            'user_id' => $customer->id,
            'question' => 'Είναι βιολογικές οι τομάτες;',
            'answer' => null
        ]);

        // Get questions
        $response = $this->getJson('/api/v1/producer/questions');

        $response->assertStatus(200);
        $this->assertEquals(1, $response->json('unanswered_count'));

        // Answer question
        $response = $this->postJson("/api/v1/producer/questions/{$question->id}/answer", [
            'answer' => 'Ναι, όλα τα προϊόντα μας είναι πιστοποιημένα βιολογικά!',
            'type' => 'product'
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Η απάντηση καταχωρήθηκε επιτυχώς'
            ]);

        // Verify answer saved
        $question->refresh();
        $this->assertNotNull($question->answer);
        $this->assertNotNull($question->answered_at);
    }

    /**
     * Test producer shipping configuration
     */
    public function test_producer_can_configure_shipping()
    {
        Sanctum::actingAs($this->producerUser);

        // Create delivery methods
        $standardDelivery = DeliveryMethod::factory()->create([
            'name' => 'Standard',
            'code' => 'standard',
            'is_active' => true
        ]);

        $expressDelivery = DeliveryMethod::factory()->create([
            'name' => 'Express',
            'code' => 'express',
            'is_active' => true
        ]);

        // Enable shipping methods
        $response = $this->postJson('/api/v1/producer/shipping/methods', [
            'methods' => [$standardDelivery->id, $expressDelivery->id]
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Οι μέθοδοι αποστολής ενημερώθηκαν επιτυχώς'
            ]);

        // Set free shipping rules
        $response = $this->postJson('/api/v1/producer/shipping/free-shipping', [
            'rules' => [
                [
                    'min_order_amount' => 50.00,
                    'shipping_zone_id' => null,
                    'is_active' => true
                ]
            ]
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Οι κανόνες δωρεάν αποστολής ενημερώθηκαν επιτυχώς'
            ]);

        // Toggle custom rates
        $response = $this->postJson('/api/v1/producer/shipping/custom-rates/toggle', [
            'use_custom_rates' => true
        ]);

        $response->assertStatus(200);
        
        $this->producer->refresh();
        $this->assertTrue($this->producer->use_custom_shipping_rates);
    }

    /**
     * Test producer profile management
     */
    public function test_producer_can_manage_profile()
    {
        Sanctum::actingAs($this->producerUser);

        // Get profile
        $response = $this->getJson('/api/v1/producer/profile');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'producer',
                'stats'
            ]);

        // Update profile
        $response = $this->putJson('/api/v1/producer/profile', [
            'description' => 'Παραγωγός βιολογικών προϊόντων από το 1990',
            'website' => 'https://myfarm.gr',
            'social_media' => [
                'facebook' => 'https://facebook.com/myfarm',
                'instagram' => 'https://instagram.com/myfarm'
            ],
            'certifications' => ['BIO', 'ISO 22000'],
            'founded_year' => 1990
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Το προφίλ ενημερώθηκε επιτυχώς'
            ]);

        // Upload logo
        $response = $this->postJson('/api/v1/producer/profile/logo', [
            'logo' => UploadedFile::fake()->image('logo.png')
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Το λογότυπο ανέβηκε επιτυχώς'
            ]);

        Storage::disk('public')->assertExists($this->producer->fresh()->logo);
    }

    /**
     * Test producer document management
     */
    public function test_producer_can_manage_documents()
    {
        Sanctum::actingAs($this->producerUser);

        // Upload document
        $response = $this->postJson('/api/v1/producer/documents', [
            'title' => 'Πιστοποιητικό BIO',
            'description' => 'Πιστοποιητικό βιολογικής καλλιέργειας',
            'type' => 'certificate',
            'document' => UploadedFile::fake()->create('bio-cert.pdf', 1000),
            'expiry_date' => now()->addYear()->format('Y-m-d'),
            'is_public' => true
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'message',
                'document' => [
                    'id',
                    'title',
                    'type',
                    'file_name'
                ]
            ]);

        $documentId = $response->json('document.id');

        // Get documents
        $response = $this->getJson('/api/v1/producer/documents');

        $response->assertStatus(200);
        $this->assertCount(1, $response->json());

        // Get statistics
        $response = $this->getJson('/api/v1/producer/documents/statistics');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'total_documents',
                'by_type',
                'expiring_soon',
                'expired',
                'total_size'
            ]);
    }

    /**
     * Test unverified producer has limited access
     */
    public function test_unverified_producer_has_limited_access()
    {
        // Create unverified producer
        $unverifiedUser = User::factory()->create();
        $unverifiedUser->assignRole('producer');
        
        $unverifiedProducer = Producer::factory()->create([
            'user_id' => $unverifiedUser->id,
            'is_verified' => false
        ]);

        Sanctum::actingAs($unverifiedUser);

        // Try to create product
        $response = $this->postJson('/api/v1/producer/products', [
            'name' => 'Test Product',
            'price' => 10.00,
            'stock' => 100,
            'category_id' => $this->category->id
        ]);

        // Should fail or return limited functionality message
        $response->assertStatus(403);
    }
}