<?php

namespace Tests\Feature\Api;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\User;
use App\Models\Producer;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\Order;
use App\Models\Review;
use App\Models\ProductQuestion;
use App\Models\ProducerReview;
use Laravel\Sanctum\Sanctum;

class AdminDashboardFlowTest extends TestCase
{
    use RefreshDatabase;

    protected $adminUser;

    protected function setUp(): void
    {
        parent::setUp();

        // Create admin user
        $this->adminUser = User::factory()->create();
        $this->adminUser->assignRole('admin');
    }

    /**
     * Test admin can access dashboard statistics
     */
    public function test_admin_can_access_dashboard_stats()
    {
        Sanctum::actingAs($this->adminUser);

        // Create some test data
        User::factory()->count(10)->create();
        Producer::factory()->count(5)->create();
        Product::factory()->count(20)->create();
        Order::factory()->count(15)->create();

        $response = $this->getJson('/api/v1/admin/dashboard/stats');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'overview' => [
                    'total_users',
                    'total_producers',
                    'total_products',
                    'total_orders',
                    'total_revenue',
                    'pending_producers',
                    'pending_reviews'
                ],
                'charts' => [
                    'revenue_chart',
                    'orders_chart',
                    'users_chart'
                ],
                'recent_activities'
            ]);
    }

    /**
     * Test admin producer verification workflow
     */
    public function test_admin_can_verify_producers()
    {
        Sanctum::actingAs($this->adminUser);

        // Create pending producer
        $producerUser = User::factory()->create();
        $producerUser->assignRole('producer');
        
        $producer = Producer::factory()->create([
            'user_id' => $producerUser->id,
            'is_verified' => false,
            'verification_status' => 'pending'
        ]);

        // Get pending producers
        $response = $this->getJson('/api/v1/admin/producers/pending');

        $response->assertStatus(200);
        $this->assertGreaterThan(0, count($response->json('producers')));

        // Verify producer
        $response = $this->postJson("/api/v1/admin/producers/{$producer->id}/verify", [
            'notes' => 'Όλα τα έγγραφα είναι εντάξει'
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Ο παραγωγός επαληθεύτηκε επιτυχώς'
            ]);

        // Check producer is verified
        $producer->refresh();
        $this->assertTrue($producer->is_verified);
        $this->assertEquals('approved', $producer->verification_status);

        // Alternatively, test rejection
        $producer2 = Producer::factory()->create([
            'is_verified' => false,
            'verification_status' => 'pending'
        ]);

        $response = $this->postJson("/api/v1/admin/producers/{$producer2->id}/reject", [
            'reason' => 'Ελλιπή έγγραφα'
        ]);

        $response->assertStatus(200);
        
        $producer2->refresh();
        $this->assertFalse($producer2->is_verified);
        $this->assertEquals('rejected', $producer2->verification_status);
    }

    /**
     * Test admin category management
     */
    public function test_admin_can_manage_categories()
    {
        Sanctum::actingAs($this->adminUser);

        // Create category
        $response = $this->postJson('/api/v1/admin/categories', [
            'name' => 'Γαλακτοκομικά',
            'description' => 'Προϊόντα γάλακτος',
            'type' => 'main',
            'order' => 1
        ]);

        $response->assertStatus(201)
            ->assertJson([
                'message' => 'Η κατηγορία δημιουργήθηκε επιτυχώς'
            ]);

        $categoryId = $response->json('category.id');

        // Create subcategory
        $response = $this->postJson('/api/v1/admin/categories', [
            'name' => 'Τυριά',
            'parent_id' => $categoryId,
            'type' => 'sub'
        ]);

        $response->assertStatus(201);

        // Update category
        $response = $this->putJson("/api/v1/admin/categories/{$categoryId}", [
            'name' => 'Γαλακτοκομικά & Τυροκομικά'
        ]);

        $response->assertStatus(200);

        // Get categories with hierarchy
        $response = $this->getJson('/api/v1/admin/categories');

        $response->assertStatus(200);
        
        $mainCategory = collect($response->json('data'))->firstWhere('id', $categoryId);
        $this->assertNotNull($mainCategory);
        $this->assertCount(1, $mainCategory['children']);
    }

    /**
     * Test admin review moderation
     */
    public function test_admin_can_moderate_reviews()
    {
        Sanctum::actingAs($this->adminUser);

        // Create pending reviews
        $product = Product::factory()->create();
        $user = User::factory()->create();
        
        $productReview = Review::factory()->create([
            'product_id' => $product->id,
            'user_id' => $user->id,
            'status' => 'pending',
            'rating' => 5,
            'comment' => 'Εξαιρετικό προϊόν!'
        ]);

        $producer = Producer::factory()->create();
        $producerReview = ProducerReview::factory()->create([
            'producer_id' => $producer->id,
            'user_id' => $user->id,
            'status' => 'pending',
            'rating' => 5
        ]);

        // Get pending reviews
        $response = $this->getJson('/api/v1/admin/reviews/pending');

        $response->assertStatus(200);
        $this->assertEquals(2, $response->json('total'));

        // Approve product review
        $response = $this->postJson("/api/v1/admin/reviews/{$productReview->id}/approve", [
            'type' => 'product'
        ]);

        $response->assertStatus(200);
        
        $productReview->refresh();
        $this->assertEquals('approved', $productReview->status);

        // Reject producer review
        $response = $this->postJson("/api/v1/admin/reviews/{$producerReview->id}/reject", [
            'type' => 'producer',
            'rejection_reason' => 'Περιεχόμενο spam'
        ]);

        $response->assertStatus(200);
        
        $producerReview->refresh();
        $this->assertEquals('rejected', $producerReview->status);
    }

    /**
     * Test admin user management
     */
    public function test_admin_can_manage_users()
    {
        Sanctum::actingAs($this->adminUser);

        // Create test user
        $user = User::factory()->create([
            'is_active' => true
        ]);
        $user->assignRole('consumer');

        // Get users with filters
        $response = $this->getJson('/api/v1/admin/users?role=consumer');

        $response->assertStatus(200);
        $this->assertGreaterThan(0, count($response->json('data')));

        // Update user
        $response = $this->putJson("/api/v1/admin/users/{$user->id}", [
            'is_active' => false,
            'notes' => 'Suspicious activity'
        ]);

        $response->assertStatus(200);
        
        $user->refresh();
        $this->assertFalse($user->is_active);

        // Assign role
        $response = $this->postJson("/api/v1/admin/users/{$user->id}/roles", [
            'roles' => ['producer']
        ]);

        $response->assertStatus(200);
        
        $this->assertTrue($user->hasRole('producer'));
        $this->assertFalse($user->hasRole('consumer'));
    }

    /**
     * Test admin order management
     */
    public function test_admin_can_manage_orders()
    {
        Sanctum::actingAs($this->adminUser);

        // Create order
        $user = User::factory()->create();
        $order = Order::factory()->create([
            'user_id' => $user->id,
            'status' => 'pending'
        ]);

        // Get orders
        $response = $this->getJson('/api/v1/admin/orders');

        $response->assertStatus(200);
        $this->assertGreaterThan(0, $response->json('total'));

        // Update order status
        $response = $this->putJson("/api/v1/admin/orders/{$order->id}/status", [
            'status' => 'cancelled',
            'reason' => 'Customer request'
        ]);

        $response->assertStatus(200);
        
        $order->refresh();
        $this->assertEquals('cancelled', $order->status);
    }

    /**
     * Test admin shipping configuration
     */
    public function test_admin_can_configure_shipping()
    {
        Sanctum::actingAs($this->adminUser);

        // Create shipping zone
        $response = $this->postJson('/api/v1/admin/shipping/zones', [
            'name' => 'Κρήτη',
            'region' => 'Νησιά',
            'is_active' => true
        ]);

        $response->assertStatus(201);
        $zoneId = $response->json('zone.id');

        // Create delivery method
        $response = $this->postJson('/api/v1/admin/shipping/delivery-methods', [
            'name' => 'Next Day Delivery',
            'code' => 'next_day',
            'description' => 'Παράδοση την επόμενη μέρα',
            'is_active' => true
        ]);

        $response->assertStatus(201);
        $methodId = $response->json('method.id');

        // Create weight tier
        $response = $this->postJson('/api/v1/admin/shipping/weight-tiers', [
            'name' => 'Light',
            'min_weight' => 0,
            'max_weight' => 1000
        ]);

        $response->assertStatus(201);
        $tierId = $response->json('tier.id');

        // Create shipping rate
        $response = $this->postJson('/api/v1/admin/shipping/rates', [
            'shipping_zone_id' => $zoneId,
            'delivery_method_id' => $methodId,
            'weight_tier_id' => $tierId,
            'rate' => 7.50
        ]);

        $response->assertStatus(201);
    }

    /**
     * Test admin product approval workflow
     */
    public function test_admin_can_approve_products()
    {
        Sanctum::actingAs($this->adminUser);

        // Create product needing approval
        $producer = Producer::factory()->create(['is_verified' => true]);
        $product = Product::factory()->create([
            'producer_id' => $producer->id,
            'status' => 'pending_approval',
            'is_active' => false
        ]);

        // Approve product
        $response = $this->postJson("/api/v1/admin/products/{$product->id}/approve");

        $response->assertStatus(200);
        
        $product->refresh();
        $this->assertEquals('approved', $product->status);
        $this->assertTrue($product->is_active);

        // Test rejection
        $product2 = Product::factory()->create([
            'status' => 'pending_approval',
            'is_active' => false
        ]);

        $response = $this->postJson("/api/v1/admin/products/{$product2->id}/reject", [
            'reason' => 'Ακατάλληλες φωτογραφίες'
        ]);

        $response->assertStatus(200);
        
        $product2->refresh();
        $this->assertEquals('rejected', $product2->status);
        $this->assertFalse($product2->is_active);
    }

    /**
     * Test admin settings management
     */
    public function test_admin_can_manage_settings()
    {
        Sanctum::actingAs($this->adminUser);

        // Get settings
        $response = $this->getJson('/api/v1/admin/settings');

        $response->assertStatus(200);

        // Update settings
        $response = $this->putJson('/api/v1/admin/settings', [
            'settings' => [
                [
                    'key' => 'platform_fee_percentage',
                    'value' => '15'
                ],
                [
                    'key' => 'min_order_amount',
                    'value' => '20'
                ]
            ]
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Οι ρυθμίσεις ενημερώθηκαν επιτυχώς'
            ]);
    }
}