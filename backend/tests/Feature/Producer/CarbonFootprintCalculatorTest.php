<?php

namespace Tests\Feature\Producer;

use App\Models\Producer;
use App\Models\ProducerEnvironmentalStat;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class CarbonFootprintCalculatorTest extends TestCase
{
    use RefreshDatabase;
    use WithFaker;

    /**
     * Test getting environmental data for a producer.
     */
    public function test_get_environmental_data(): void
    {
        $producer = Producer::factory()->create();
        
        // Create environmental stats for the producer
        ProducerEnvironmentalStat::create([
            'producer_id' => $producer->id,
            'distance' => 35.5,
            'co2_saved' => 0.75,
            'water_saved' => 120.0,
            'packaging_saved' => 0.3
        ]);
        
        // Test the API endpoint
        $response = $this->getJson("/v1/producers/{$producer->id}/environmental");
        
        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'stats' => [
                         'distance',
                         'co2_saved',
                         'water_saved',
                         'packaging_saved'
                     ],
                     'comparison' => [
                         'conventional' => [
                             'distance',
                             'co2_emitted',
                             'water_usage',
                             'packaging_usage'
                         ],
                         'local' => [
                             'distance',
                             'co2_emitted',
                             'water_usage',
                             'packaging_usage'
                         ]
                     ]
                 ])
                 ->assertJson([
                     'stats' => [
                         'distance' => 35.5,
                         'co2_saved' => 0.75,
                         'water_saved' => 120.0,
                         'packaging_saved' => 0.3
                     ]
                 ]);
    }
    
    /**
     * Test getting default environmental data when no stats exist.
     */
    public function test_get_default_environmental_data(): void
    {
        $producer = Producer::factory()->create();
        
        // Test the API endpoint without creating stats
        $response = $this->getJson("/v1/producers/{$producer->id}/environmental");
        
        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'stats' => [
                         'distance',
                         'co2_saved',
                         'water_saved',
                         'packaging_saved'
                     ],
                     'comparison' => [
                         'conventional' => [
                             'distance',
                             'co2_emitted',
                             'water_usage',
                             'packaging_usage'
                         ],
                         'local' => [
                             'distance',
                             'co2_emitted',
                             'water_usage',
                             'packaging_usage'
                         ]
                     ]
                 ]);
                 
        // Should return default values
        $stats = $response->json('stats');
        $this->assertEquals(50, $stats['distance']);
        $this->assertEquals(0.5, $stats['co2_saved']);
        $this->assertEquals(100, $stats['water_saved']);
        $this->assertEquals(0.2, $stats['packaging_saved']);
    }
    
    /**
     * Test updating environmental data (requires admin auth).
     */
    public function test_update_environmental_data(): void
    {
        // Create admin user
        $admin = User::factory()->create(['role' => 'admin']);
        
        $producer = Producer::factory()->create();
        
        // Create initial environmental stats
        ProducerEnvironmentalStat::create([
            'producer_id' => $producer->id,
            'distance' => 50.0,
            'co2_saved' => 0.5,
            'water_saved' => 100.0,
            'packaging_saved' => 0.2
        ]);
        
        // Update stats through API
        $response = $this->actingAs($admin)
                         ->putJson("/v1/admin/producers/{$producer->id}/environmental", [
                             'stats' => [
                                 'distance' => 35.5,
                                 'co2_saved' => 0.75,
                                 'water_saved' => 120.0,
                                 'packaging_saved' => 0.3
                             ]
                         ]);
        
        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'success',
                     'data' => [
                         'id',
                         'producer_id',
                         'distance',
                         'co2_saved',
                         'water_saved',
                         'packaging_saved',
                         'created_at',
                         'updated_at'
                     ]
                 ])
                 ->assertJson([
                     'success' => true,
                     'data' => [
                         'producer_id' => $producer->id,
                         'distance' => 35.5,
                         'co2_saved' => 0.75,
                         'water_saved' => 120.0,
                         'packaging_saved' => 0.3
                     ]
                 ]);
                 
        // Verify database update
        $this->assertDatabaseHas('producer_environmental_stats', [
            'producer_id' => $producer->id,
            'distance' => 35.5,
            'co2_saved' => 0.75,
            'water_saved' => 120.0,
            'packaging_saved' => 0.3
        ]);
    }
    
    /**
     * Test creating environmental data when none exists (requires admin auth).
     */
    public function test_create_environmental_data(): void
    {
        // Create admin user
        $admin = User::factory()->create(['role' => 'admin']);
        
        $producer = Producer::factory()->create();
        
        // Create stats through API
        $response = $this->actingAs($admin)
                         ->putJson("/v1/admin/producers/{$producer->id}/environmental", [
                             'stats' => [
                                 'distance' => 35.5,
                                 'co2_saved' => 0.75,
                                 'water_saved' => 120.0,
                                 'packaging_saved' => 0.3
                             ]
                         ]);
        
        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'success',
                     'data' => [
                         'id',
                         'producer_id',
                         'distance',
                         'co2_saved',
                         'water_saved',
                         'packaging_saved',
                         'created_at',
                         'updated_at'
                     ]
                 ])
                 ->assertJson([
                     'success' => true,
                     'data' => [
                         'producer_id' => $producer->id,
                         'distance' => 35.5,
                         'co2_saved' => 0.75,
                         'water_saved' => 120.0,
                         'packaging_saved' => 0.3
                     ]
                 ]);
                 
        // Verify database entry was created
        $this->assertDatabaseHas('producer_environmental_stats', [
            'producer_id' => $producer->id,
            'distance' => 35.5,
            'co2_saved' => 0.75,
            'water_saved' => 120.0,
            'packaging_saved' => 0.3
        ]);
        
        // Verify only one entry exists
        $this->assertEquals(1, ProducerEnvironmentalStat::where('producer_id', $producer->id)->count());
    }
    
    /**
     * Test unauthorized access to update environmental data.
     */
    public function test_unauthorized_environmental_update(): void
    {
        // Create regular user (not an admin)
        $user = User::factory()->create(['role' => 'customer']);
        
        $producer = Producer::factory()->create();
        
        // Attempt to update environmental stats
        $response = $this->actingAs($user)
                         ->putJson("/v1/admin/producers/{$producer->id}/environmental", [
                             'stats' => [
                                 'distance' => 35.5,
                                 'co2_saved' => 0.75,
                                 'water_saved' => 120.0,
                                 'packaging_saved' => 0.3
                             ]
                         ]);
                         
        // Should fail with 403 Forbidden
        $response->assertStatus(403);
        
        // Try with producer user (also should not have access)
        $producer_user = User::factory()->create(['role' => 'producer']);
        
        $response = $this->actingAs($producer_user)
                         ->putJson("/v1/admin/producers/{$producer->id}/environmental", [
                             'stats' => [
                                 'distance' => 35.5,
                                 'co2_saved' => 0.75,
                                 'water_saved' => 120.0,
                                 'packaging_saved' => 0.3
                             ]
                         ]);
                         
        // Should fail with 403 Forbidden
        $response->assertStatus(403);
    }
}