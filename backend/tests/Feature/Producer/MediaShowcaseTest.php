<?php

namespace Tests\Feature\Producer;

use App\Models\Producer;
use App\Models\ProducerMedia;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class MediaShowcaseTest extends TestCase
{
    use RefreshDatabase;
    use WithFaker;

    /**
     * Test getting producer media (public endpoint).
     */
    public function test_get_producer_media(): void
    {
        $producer = Producer::factory()->create();
        
        // Create some media items for the producer
        ProducerMedia::create([
            'producer_id' => $producer->id,
            'type' => 'image',
            'file_path' => 'producers/media/test1.jpg',
            'title' => 'Test Image 1',
            'description' => 'Test Description 1',
            'order' => 1,
        ]);
        
        ProducerMedia::create([
            'producer_id' => $producer->id,
            'type' => 'video',
            'file_path' => 'producers/media/test2.mp4',
            'title' => 'Test Video 1',
            'description' => 'Test Description 2',
            'order' => 2,
        ]);
        
        // Test the API endpoint
        $response = $this->getJson("/v1/producers/{$producer->id}/media");
        
        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'data' => [
                         '*' => [
                             'id',
                             'producer_id',
                             'type',
                             'file_path',
                             'title',
                             'description',
                             'order',
                             'created_at',
                             'updated_at',
                         ]
                     ]
                 ])
                 ->assertJsonCount(2, 'data');
    }
    
    /**
     * Test uploading media (requires auth).
     */
    public function test_upload_media(): void
    {
        Storage::fake('public');
        
        // Create user with producer role and associated producer
        $user = User::factory()->create(['role' => 'producer']);
        $producer = Producer::factory()->create(['user_id' => $user->id]);
        
        // Create a fake image
        $file = UploadedFile::fake()->image('test.jpg');
        
        // Send request with authentication
        $response = $this->actingAs($user)
                         ->postJson("/v1/producer/media/upload", [
                             'files' => [$file],
                             'title' => 'Test Upload',
                             'description' => 'Test Description'
                         ]);
        
        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'success',
                     'data' => [
                         '*' => [
                             'id',
                             'producer_id',
                             'type',
                             'file_path',
                             'title',
                             'description',
                             'order',
                         ]
                     ]
                 ]);
        
        // Verify that the file was stored
        $mediaItem = ProducerMedia::latest('id')->first();
        Storage::disk('public')->assertExists($mediaItem->file_path);
    }
    
    /**
     * Test updating media item (requires auth).
     */
    public function test_update_media(): void
    {
        // Create user with producer role and associated producer
        $user = User::factory()->create(['role' => 'producer']);
        $producer = Producer::factory()->create(['user_id' => $user->id]);
        
        // Create a media item
        $media = ProducerMedia::create([
            'producer_id' => $producer->id,
            'type' => 'image',
            'file_path' => 'producers/media/test1.jpg',
            'title' => 'Original Title',
            'description' => 'Original Description',
            'order' => 1,
        ]);
        
        // Send update request
        $response = $this->actingAs($user)
                         ->putJson("/v1/producer/media/{$media->id}", [
                             'title' => 'Updated Title',
                             'description' => 'Updated Description'
                         ]);
        
        $response->assertStatus(200)
                 ->assertJson([
                     'success' => true,
                     'data' => [
                         'title' => 'Updated Title',
                         'description' => 'Updated Description'
                     ]
                 ]);
        
        // Verify database update
        $this->assertDatabaseHas('producer_media', [
            'id' => $media->id,
            'title' => 'Updated Title',
            'description' => 'Updated Description'
        ]);
    }
    
    /**
     * Test deleting media item (requires auth).
     */
    public function test_delete_media(): void
    {
        Storage::fake('public');
        
        // Create user with producer role and associated producer
        $user = User::factory()->create(['role' => 'producer']);
        $producer = Producer::factory()->create(['user_id' => $user->id]);
        
        // Create a fake file
        $fakeImage = UploadedFile::fake()->image('test.jpg');
        $path = Storage::disk('public')->putFile("producers/{$producer->id}/media", $fakeImage);
        
        // Create a media item
        $media = ProducerMedia::create([
            'producer_id' => $producer->id,
            'type' => 'image',
            'file_path' => $path,
            'title' => 'Test Title',
            'description' => 'Test Description',
            'order' => 1,
        ]);
        
        // Send delete request
        $response = $this->actingAs($user)
                         ->deleteJson("/v1/producer/media/{$media->id}");
        
        $response->assertStatus(200)
                 ->assertJson([
                     'success' => true,
                     'message' => 'Media deleted successfully'
                 ]);
        
        // Verify the item was deleted from database
        $this->assertDatabaseMissing('producer_media', [
            'id' => $media->id,
        ]);
        
        // Verify the file was deleted from storage
        Storage::disk('public')->assertMissing($path);
    }
    
    /**
     * Test reordering media items (requires auth).
     */
    public function test_reorder_media(): void
    {
        // Create user with producer role and associated producer
        $user = User::factory()->create(['role' => 'producer']);
        $producer = Producer::factory()->create(['user_id' => $user->id]);
        
        // Create several media items
        $media1 = ProducerMedia::create([
            'producer_id' => $producer->id,
            'type' => 'image',
            'file_path' => 'producers/media/test1.jpg',
            'title' => 'Test Image 1',
            'description' => 'Test Description 1',
            'order' => 1,
        ]);
        
        $media2 = ProducerMedia::create([
            'producer_id' => $producer->id,
            'type' => 'image',
            'file_path' => 'producers/media/test2.jpg',
            'title' => 'Test Image 2',
            'description' => 'Test Description 2',
            'order' => 2,
        ]);
        
        $media3 = ProducerMedia::create([
            'producer_id' => $producer->id,
            'type' => 'image',
            'file_path' => 'producers/media/test3.jpg',
            'title' => 'Test Image 3',
            'description' => 'Test Description 3',
            'order' => 3,
        ]);
        
        // Send reorder request
        $response = $this->actingAs($user)
                         ->putJson("/v1/producer/media/reorder", [
                             'items' => [
                                 ['id' => $media1->id, 'order' => 3],
                                 ['id' => $media2->id, 'order' => 1],
                                 ['id' => $media3->id, 'order' => 2],
                             ]
                         ]);
        
        $response->assertStatus(200)
                 ->assertJson([
                     'success' => true,
                     'message' => 'Media order updated successfully'
                 ]);
        
        // Verify database updates
        $this->assertDatabaseHas('producer_media', [
            'id' => $media1->id,
            'order' => 3,
        ]);
        
        $this->assertDatabaseHas('producer_media', [
            'id' => $media2->id,
            'order' => 1,
        ]);
        
        $this->assertDatabaseHas('producer_media', [
            'id' => $media3->id,
            'order' => 2,
        ]);
    }
}