<?php

namespace App\Http\Controllers\Api\Producer;

use App\Http\Controllers\Controller;
use App\Models\ProducerQuestion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class QuestionsController extends Controller
{
    /**
     * Display a listing of the producer's questions.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        // Get the producer ID from the authenticated user
        $producerId = auth()->user()->producer->id;
        
        $perPage = $request->per_page ?? 10;
        $status = $request->status ?? 'all';
        $search = $request->search ?? '';
        
        $query = ProducerQuestion::with('user:id,name')
            ->where('producer_id', $producerId);
            
        // Filter by status
        if ($status === 'answered') {
            $query->answered();
        } elseif ($status === 'unanswered') {
            $query->unanswered();
        }
        
        // Search in questions
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('question', 'like', "%{$search}%")
                  ->orWhere('answer', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($userQuery) use ($search) {
                      $userQuery->where('name', 'like', "%{$search}%");
                  });
            });
        }
        
        $questions = $query->orderBy('created_at', 'desc')
            ->paginate($perPage);
            
        return response()->json($questions);
    }
    
    /**
     * Answer a question.
     *
     * @param Request $request
     * @param int $questionId
     * @return \Illuminate\Http\JsonResponse
     */
    public function answer(Request $request, $questionId)
    {
        $validator = Validator::make($request->all(), [
            'answer' => 'required|string|min:10|max:2000'
        ]);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        // Get the producer ID from the authenticated user
        $producerId = auth()->user()->producer->id;
        
        $question = ProducerQuestion::where('id', $questionId)
            ->where('producer_id', $producerId)
            ->firstOrFail();
            
        $question->update([
            'answer' => $request->answer,
            'answered_at' => now()
        ]);
        
        // Load the user for the response
        $question->load('user:id,name');
        
        return response()->json([
            'success' => true,
            'data' => $question
        ]);
    }
    
    /**
     * Get question statistics.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function stats()
    {
        // Get the producer ID from the authenticated user
        $producerId = auth()->user()->producer->id;
        
        $total = ProducerQuestion::where('producer_id', $producerId)->count();
        $answered = ProducerQuestion::where('producer_id', $producerId)->answered()->count();
        $unanswered = $total - $answered;
        
        $responseRate = $total > 0 ? round(($answered / $total) * 100) : 0;
        
        // Calculate average response time for answered questions
        $avgResponseTime = '0 days';
        
        if ($answered > 0) {
            $answeredQuestions = ProducerQuestion::where('producer_id', $producerId)
                ->answered()
                ->get();
                
            $totalResponseTimeHours = 0;
            
            foreach ($answeredQuestions as $question) {
                $created = Carbon::parse($question->created_at);
                $answered = Carbon::parse($question->answered_at);
                $totalResponseTimeHours += $created->diffInHours($answered);
            }
            
            $avgHours = round($totalResponseTimeHours / $answered);
            
            if ($avgHours < 24) {
                $avgResponseTime = "{$avgHours} hours";
            } else {
                $avgDays = round($avgHours / 24);
                $avgResponseTime = "{$avgDays} days";
            }
        }
        
        return response()->json([
            'total' => $total,
            'answered' => $answered,
            'unanswered' => $unanswered,
            'response_rate' => $responseRate,
            'average_response_time' => $avgResponseTime
        ]);
    }
}