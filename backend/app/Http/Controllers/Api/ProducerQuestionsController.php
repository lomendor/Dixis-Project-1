<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Producer;
use App\Models\ProducerQuestion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ProducerQuestionsController extends Controller
{
    /**
     * Display a listing of the producer's questions.
     *
     * @param Request $request
     * @param int $producerId
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request, $producerId)
    {
        $perPage = $request->per_page ?? 10;
        
        $questions = ProducerQuestion::with('user:id,name')
            ->where('producer_id', $producerId)
            ->public()
            ->answered()
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
            
        // Transform the data to include only necessary user info
        $questions->getCollection()->transform(function ($question) {
            $question->user_name = $question->user->name;
            unset($question->user);
            return $question;
        });
        
        return response()->json($questions);
    }
    
    /**
     * Submit a new question for a producer.
     *
     * @param Request $request
     * @param int $producerId
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request, $producerId)
    {
        // User must be logged in
        if (!auth()->check()) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }
        
        $validator = Validator::make($request->all(), [
            'question' => 'required|string|min:10|max:1000',
            'is_public' => 'boolean'
        ]);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        $producer = Producer::findOrFail($producerId);
        
        $question = ProducerQuestion::create([
            'producer_id' => $producerId,
            'user_id' => auth()->id(),
            'question' => $request->question,
            'is_public' => $request->is_public ?? true
        ]);
        
        // Add user name for the response
        $question->user_name = auth()->user()->name;
        
        return response()->json([
            'success' => true,
            'data' => $question
        ]);
    }
}