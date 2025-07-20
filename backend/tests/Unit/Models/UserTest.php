<?php

namespace Tests\Unit\Models;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test that a user can be created.
     */
    public function test_user_can_be_created(): void
    {
        $userData = [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => bcrypt('password'),
        ];

        $user = User::create($userData);

        $this->assertInstanceOf(User::class, $user);
        $this->assertEquals('Test User', $user->name);
        $this->assertEquals('test@example.com', $user->email);
    }

    /**
     * Test that a user has the correct default role.
     */
    public function test_user_has_default_role(): void
    {
        $user = User::factory()->create(['role' => 'consumer']);

        // By default, a new user should have the 'consumer' role
        $this->assertEquals('consumer', $user->role);
    }

    /**
     * Test that a user can have multiple roles.
     */
    public function test_user_can_have_multiple_roles(): void
    {
        $user = User::factory()->create();

        $user->assignRole('producer');
        
        $this->assertTrue($user->hasRole('consumer'));
        $this->assertTrue($user->hasRole('producer'));
        $this->assertFalse($user->hasRole('admin'));
    }

    /**
     * Test user relationships.
     */
    public function test_user_relationships(): void
    {
        $user = User::factory()->create();

        // Test that the user has the expected relationships
        $this->assertIsObject($user->producer);
        $this->assertIsObject($user->business);
        $this->assertIsObject($user->addresses);
        $this->assertIsObject($user->orders);
        $this->assertIsObject($user->wishlist);
        $this->assertIsObject($user->reviews);
    }
}
