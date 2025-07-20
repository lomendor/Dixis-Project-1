<?php

namespace Tests\Feature\Producer;

use App\Models\Producer;
use App\Models\ProducerQuestion;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class QASystemTest extends TestCase
{
    use RefreshDatabase;
    use WithFaker;

    /**
     * Test getting producer questions (public endpoint).
     */
    public function test_get_producer_questions(): void
    {
        $producer = Producer::factory()->create();
        $user = User::factory()->create();
        
        // Create some answered questions for the producer
        $question1 = ProducerQuestion::create([
            'producer_id' => $producer->id,
            'user_id' => $user->id,
            'question' => 'Test Question 1',
            'answer' => 'Test Answer 1',
            'is_public' => true,
            'answered_at' => now(),
            'created_at' => now()->subDays(2),
            'updated_at' => now()->subDays(1),
        ]);
        
        $question2 = ProducerQuestion::create([
            'producer_id' => $producer->id,
            'user_id' => $user->id,
            'question' => 'Test Question 2',
            'answer' => 'Test Answer 2',
            'is_public' => true,
            'answered_at' => now(),
            'created_at' => now()->subDays(4),
            'updated_at' => now()->subDays(3),
        ]);
        
        // Create an unanswered question that shouldn't be returned
        ProducerQuestion::create([
            'producer_id' => $producer->id,
            'user_id' => $user->id,
            'question' => 'Test Question 3',
            'answer' => null,
            'is_public' => true,
            'answered_at' => null,
        ]);
        
        // Test the API endpoint
        $response = $this->getJson("/v1/producers/{$producer->id}/questions");
        
        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'data' => [
                         '*' => [
                             'id',
                             'producer_id',
                             'user_id',
                             'user_name',
                             'question',
                             'answer',
                             'is_public',
                             'created_at',
                             'updated_at',
                             'answered_at',
                         ]
                     ],
                     'current_page',
                     'last_page',
                     'per_page',
                     'total'
                 ])
                 ->assertJsonCount(2, 'data');
    }
    
    /**
     * Test submitting a question (requires auth).
     */
    public function test_submit_question(): void
    {
        $producer = Producer::factory()->create();
        $user = User::factory()->create();
        
        // Send request with authentication
        $response = $this->actingAs($user)
                         ->postJson("/v1/producers/{$producer->id}/questions", [
                             'question' => 'This is a test question?',
                             'is_public' => true
                         ]);
        
        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'success',
                     'data' => [
                         'id',
                         'producer_id',
                         'user_id',
                         'user_name',
                         'question',
                         'is_public',
                         'created_at',
                         'updated_at',
                     ]
                 ])
                 ->assertJson([
                     'success' => true,
                     'data' => [
                         'producer_id' => $producer->id,
                         'user_id' => $user->id,
                         'question' => 'This is a test question?',
                         'is_public' => true,
                     ]
                 ]);
        
        // Verify database entry
        $this->assertDatabaseHas('producer_questions', [
            'producer_id' => $producer->id,
            'user_id' => $user->id,
            'question' => 'This is a test question?',
            'is_public' => true,
        ]);
    }
    
    /**
     * Test getting producer's questions dashboard (requires producer auth).
     */
    public function test_get_producer_questions_dashboard(): void
    {
        // Create user with producer role and associated producer
        $producer_user = User::factory()->create(['role' => 'producer']);
        $producer = Producer::factory()->create(['user_id' => $producer_user->id]);
        
        $regular_user = User::factory()->create();
        
        // Create questions
        ProducerQuestion::create([
            'producer_id' => $producer->id,
            'user_id' => $regular_user->id,
            'question' => 'Answered Question',
            'answer' => 'This is an answer',
            'is_public' => true,
            'answered_at' => now()->subDay(),
        ]);
        
        ProducerQuestion::create([
            'producer_id' => $producer->id,
            'user_id' => $regular_user->id,
            'question' => 'Unanswered Question',
            'answer' => null,
            'is_public' => true,
            'answered_at' => null,
        ]);
        
        // Test accessing the dashboard with producer authentication
        $response = $this->actingAs($producer_user)
                         ->getJson("/v1/producer/questions");
        
        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'data' => [
                         '*' => [
                             'id',
                             'producer_id',
                             'user_id',
                             'question',
                             'answer',
                             'is_public',
                             'created_at',
                             'updated_at',
                             'answered_at',
                             'user' => [
                                 'id',
                                 'name'
                             ]
                         ]
                     ],
                     'current_page',
                     'last_page',
                     'per_page',
                     'total'
                 ])
                 ->assertJsonCount(2, 'data');
        
        // Test filtering by status
        $response = $this->actingAs($producer_user)
                         ->getJson("/v1/producer/questions?status=unanswered");
        
        $response->assertStatus(200)
                 ->assertJsonCount(1, 'data')
                 ->assertJson([
                     'data' => [
                         [
                             'question' => 'Unanswered Question',
                             'answer' => null,
                         ]
                     ]
                 ]);
    }
    
    /**
     * Test answering a question (requires producer auth).
     */
    public function test_answer_question(): void
    {
        // Create user with producer role and associated producer
        $producer_user = User::factory()->create(['role' => 'producer']);
        $producer = Producer::factory()->create(['user_id' => $producer_user->id]);
        
        $regular_user = User::factory()->create();
        
        // Create a question
        $question = ProducerQuestion::create([
            'producer_id' => $producer->id,
            'user_id' => $regular_user->id,
            'question' => 'Test Question',
            'answer' => null,
            'is_public' => true,
            'answered_at' => null,
        ]);
        
        // Send answer request
        $response = $this->actingAs($producer_user)
                         ->postJson("/v1/producer/questions/{$question->id}/answer", [
                             'answer' => 'This is a test answer.'
                         ]);
        
        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'success',
                     'data' => [
                         'id',
                         'producer_id',
                         'question',
                         'answer',
                         'is_public',
                         'created_at',
                         'updated_at',
                         'answered_at',
                         'user' => [
                             'id',
                             'name'
                         ]
                     ]
                 ])
                 ->assertJson([
                     'success' => true,
                     'data' => [
                         'id' => $question->id,
                         'answer' => 'This is a test answer.',
                     ]
                 ]);
        
        // Verify database update
        $this->assertDatabaseHas('producer_questions', [
            'id' => $question->id,
            'answer' => 'This is a test answer.',
        ]);
        
        // Ensure answered_at is set
        $updatedQuestion = ProducerQuestion::find($question->id);
        $this->assertNotNull($updatedQuestion->answered_at);
    }
    
    /**
     * Test getting question statistics (requires producer auth).
     */
    public function test_get_question_stats(): void
    {
        // Create user with producer role and associated producer
        $producer_user = User::factory()->create(['role' => 'producer']);
        $producer = Producer::factory()->create(['user_id' => $producer_user->id]);
        
        $regular_user = User::factory()->create();
        
        // Create 5 questions: 3 answered, 2 unanswered
        for ($i = 0; $i < 3; $i++) {
            ProducerQuestion::create([
                'producer_id' => $producer->id,
                'user_id' => $regular_user->id,
                'question' => "Answered Question {$i}",
                'answer' => "This is answer {$i}",
                'is_public' => true,
                'answered_at' => Carbon::now()->subDays(1)->subHours($i),
                'created_at' => Carbon::now()->subDays(2)->subHours($i),
            ]);
        }
        
        for ($i = 0; $i < 2; $i++) {
            ProducerQuestion::create([
                'producer_id' => $producer->id,
                'user_id' => $regular_user->id,
                'question' => "Unanswered Question {$i}",
                'answer' => null,
                'is_public' => true,
                'answered_at' => null,
                'created_at' => Carbon::now()->subDays(1),
            ]);
        }
        
        // Test stats endpoint
        $response = $this->actingAs($producer_user)
                         ->getJson("/v1/producer/questions/stats");
        
        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'total',
                     'answered',
                     'unanswered',
                     'response_rate',
                     'average_response_time'
                 ])
                 ->assertJson([
                     'total' => 5,
                     'answered' => 3,
                     'unanswered' => 2,
                     'response_rate' => 60, // 3/5 = 60%
                 ]);
    }
}