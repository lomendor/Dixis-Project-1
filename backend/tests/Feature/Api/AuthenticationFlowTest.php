<?php

namespace Tests\Feature\Api;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\User;
use App\Models\Producer;
use Laravel\Sanctum\Sanctum;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;

class AuthenticationFlowTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test complete registration flow
     */
    public function test_user_can_register_successfully()
    {
        $response = $this->postJson('/api/v1/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'consumer'
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'message',
                'user' => [
                    'id',
                    'name',
                    'email',
                    'role'
                ],
                'token'
            ]);

        $this->assertDatabaseHas('users', [
            'email' => 'test@example.com',
            'name' => 'Test User'
        ]);

        // Verify user has consumer role
        $user = User::where('email', 'test@example.com')->first();
        $this->assertTrue($user->hasRole('consumer'));
    }

    /**
     * Test producer registration with additional data
     */
    public function test_producer_can_register_with_business_details()
    {
        $response = $this->postJson('/api/v1/register', [
            'name' => 'Producer Name',
            'email' => 'producer@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'producer',
            'business_name' => 'My Farm',
            'tax_id' => '123456789',
            'phone' => '+302101234567',
            'address' => '123 Farm Road',
            'city' => 'Athens',
            'region' => 'Attica',
            'postal_code' => '10001'
        ]);

        $response->assertStatus(201);

        $user = User::where('email', 'producer@example.com')->first();
        $this->assertTrue($user->hasRole('producer'));
        
        $this->assertDatabaseHas('producers', [
            'user_id' => $user->id,
            'business_name' => 'My Farm',
            'tax_id' => '123456789'
        ]);
    }

    /**
     * Test login flow
     */
    public function test_user_can_login_with_correct_credentials()
    {
        $user = User::factory()->create([
            'email' => 'user@example.com',
            'password' => Hash::make('password123')
        ]);

        $response = $this->postJson('/api/v1/login', [
            'email' => 'user@example.com',
            'password' => 'password123'
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'user',
                'token',
                'message'
            ]);

        $this->assertNotNull($response->json('token'));
    }

    /**
     * Test login fails with incorrect credentials
     */
    public function test_login_fails_with_incorrect_credentials()
    {
        $user = User::factory()->create([
            'password' => Hash::make('password123')
        ]);

        $response = $this->postJson('/api/v1/login', [
            'email' => $user->email,
            'password' => 'wrongpassword'
        ]);

        $response->assertStatus(401)
            ->assertJson([
                'message' => 'Τα στοιχεία σύνδεσης δεν είναι σωστά'
            ]);
    }

    /**
     * Test authenticated user can get profile
     */
    public function test_authenticated_user_can_get_profile()
    {
        $user = User::factory()->create();
        $user->assignRole('consumer');
        
        Sanctum::actingAs($user);

        $response = $this->getJson('/api/v1/user');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'id',
                'name',
                'email',
                'roles',
                'permissions'
            ]);
    }

    /**
     * Test unauthenticated user cannot access protected routes
     */
    public function test_unauthenticated_user_cannot_access_protected_routes()
    {
        $response = $this->getJson('/api/v1/user');

        $response->assertStatus(401);
    }

    /**
     * Test user can logout
     */
    public function test_user_can_logout()
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/v1/logout');

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Αποσυνδεθήκατε επιτυχώς'
            ]);
    }

    /**
     * Test password reset flow
     */
    public function test_user_can_request_password_reset()
    {
        $user = User::factory()->create([
            'email' => 'reset@example.com'
        ]);

        $response = $this->postJson('/api/v1/forgot-password', [
            'email' => 'reset@example.com'
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Σας στείλαμε ένα email με τον σύνδεσμο επαναφοράς κωδικού!'
            ]);
    }

    /**
     * Test user can update profile
     */
    public function test_user_can_update_profile()
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->putJson('/api/v1/user/profile', [
            'name' => 'Updated Name',
            'email' => 'updated@example.com'
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Το προφίλ ενημερώθηκε επιτυχώς'
            ]);

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'name' => 'Updated Name',
            'email' => 'updated@example.com'
        ]);
    }

    /**
     * Test user can change password
     */
    public function test_user_can_change_password()
    {
        $user = User::factory()->create([
            'password' => Hash::make('oldpassword')
        ]);
        Sanctum::actingAs($user);

        $response = $this->putJson('/api/v1/user/password', [
            'current_password' => 'oldpassword',
            'password' => 'newpassword123',
            'password_confirmation' => 'newpassword123'
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Ο κωδικός πρόσβασης άλλαξε επιτυχώς'
            ]);

        // Verify new password works
        $this->assertTrue(Hash::check('newpassword123', $user->fresh()->password));
    }

    /**
     * Test registration validation
     */
    public function test_registration_requires_valid_data()
    {
        $response = $this->postJson('/api/v1/register', [
            'name' => '', // Empty name
            'email' => 'invalid-email', // Invalid email
            'password' => '123', // Too short
            'password_confirmation' => '456', // Doesn't match
            'role' => 'invalid' // Invalid role
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'email', 'password', 'role']);
    }

    /**
     * Test email verification flow
     */
    public function test_user_can_verify_email()
    {
        $user = User::factory()->unverified()->create();
        
        $verificationUrl = URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(60),
            ['id' => $user->id, 'hash' => sha1($user->email)]
        );

        $response = $this->postJson($verificationUrl);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Το email επαληθεύτηκε επιτυχώς'
            ]);

        $this->assertNotNull($user->fresh()->email_verified_at);
    }
}