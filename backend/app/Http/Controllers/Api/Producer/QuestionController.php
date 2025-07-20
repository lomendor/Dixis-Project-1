<?php

namespace App\Http\Controllers\Api\Producer;

use App\Http\Controllers\Controller;
use App\Models\ProductQuestion;
use App\Models\ProducerQuestion;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class QuestionController extends Controller
{
    /**
     * Display a listing of questions for the authenticated producer
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $producer = auth()->user()->producer;
        
        if (!$producer) {
            return response()->json(['message' => 'Δεν βρέθηκε ο παραγωγός'], 404);
        }

        // Get product questions
        $productQuestionsQuery = ProductQuestion::whereHas('product', function ($q) use ($producer) {
            $q->where('producer_id', $producer->id);
        })->with(['product', 'user']);

        // Get producer questions
        $producerQuestionsQuery = ProducerQuestion::where('producer_id', $producer->id)
            ->with('user');

        // Apply filters
        if ($request->has('status')) {
            $status = $request->get('status');
            if ($status === 'answered') {
                $productQuestionsQuery->whereNotNull('answer');
                $producerQuestionsQuery->whereNotNull('answer');
            } elseif ($status === 'unanswered') {
                $productQuestionsQuery->whereNull('answer');
                $producerQuestionsQuery->whereNull('answer');
            }
        }

        if ($request->has('search')) {
            $search = $request->get('search');
            $productQuestionsQuery->where(function ($q) use ($search) {
                $q->where('question', 'like', "%{$search}%")
                  ->orWhere('answer', 'like', "%{$search}%");
            });
            
            $producerQuestionsQuery->where(function ($q) use ($search) {
                $q->where('question', 'like', "%{$search}%")
                  ->orWhere('answer', 'like', "%{$search}%");
            });
        }

        // Get questions
        $productQuestions = $productQuestionsQuery->latest()->get()->map(function ($question) {
            $question->type = 'product';
            return $question;
        });

        $producerQuestions = $producerQuestionsQuery->latest()->get()->map(function ($question) {
            $question->type = 'producer';
            return $question;
        });

        // Combine and sort
        $allQuestions = $productQuestions->concat($producerQuestions)
            ->sortByDesc('created_at')
            ->values();

        // Pagination
        $perPage = $request->get('per_page', 15);
        $page = $request->get('page', 1);
        $total = $allQuestions->count();
        $questions = $allQuestions->forPage($page, $perPage);

        return response()->json([
            'data' => $questions,
            'total' => $total,
            'per_page' => $perPage,
            'current_page' => $page,
            'last_page' => ceil($total / $perPage),
            'unanswered_count' => $allQuestions->filter(function ($q) {
                return !$q->answer;
            })->count()
        ]);
    }

    /**
     * Display the specified question
     *
     * @param int $id
     * @return JsonResponse
     */
    public function show(int $id): JsonResponse
    {
        $producer = auth()->user()->producer;
        
        if (!$producer) {
            return response()->json(['message' => 'Δεν βρέθηκε ο παραγωγός'], 404);
        }

        // Try to find as product question first
        $question = ProductQuestion::where('id', $id)
            ->whereHas('product', function ($q) use ($producer) {
                $q->where('producer_id', $producer->id);
            })
            ->with(['product', 'user'])
            ->first();

        if ($question) {
            $question->type = 'product';
            return response()->json($question);
        }

        // Try as producer question
        $question = ProducerQuestion::where('id', $id)
            ->where('producer_id', $producer->id)
            ->with('user')
            ->first();

        if ($question) {
            $question->type = 'producer';
            return response()->json($question);
        }

        return response()->json(['message' => 'Η ερώτηση δεν βρέθηκε'], 404);
    }

    /**
     * Answer a question
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function answer(Request $request, int $id): JsonResponse
    {
        $producer = auth()->user()->producer;
        
        if (!$producer) {
            return response()->json(['message' => 'Δεν βρέθηκε ο παραγωγός'], 404);
        }

        $validated = $request->validate([
            'answer' => 'required|string|min:10',
            'type' => 'required|in:product,producer'
        ]);

        if ($validated['type'] === 'product') {
            $question = ProductQuestion::where('id', $id)
                ->whereHas('product', function ($q) use ($producer) {
                    $q->where('producer_id', $producer->id);
                })
                ->firstOrFail();
        } else {
            $question = ProducerQuestion::where('id', $id)
                ->where('producer_id', $producer->id)
                ->firstOrFail();
        }

        // Check if already answered
        if ($question->answer) {
            return response()->json([
                'message' => 'Αυτή η ερώτηση έχει ήδη απαντηθεί'
            ], 422);
        }

        $question->answer = $validated['answer'];
        $question->answered_at = now();
        $question->answered_by = auth()->id();
        $question->save();

        // Send notification to user who asked
        $question->user->notify(new \App\Notifications\QuestionAnswered($question));

        return response()->json([
            'message' => 'Η απάντηση καταχωρήθηκε επιτυχώς',
            'question' => $question
        ]);
    }

    /**
     * Get question statistics
     *
     * @return JsonResponse
     */
    public function statistics(): JsonResponse
    {
        $producer = auth()->user()->producer;
        
        if (!$producer) {
            return response()->json(['message' => 'Δεν βρέθηκε ο παραγωγός'], 404);
        }

        $productQuestions = ProductQuestion::whereHas('product', function ($q) use ($producer) {
            $q->where('producer_id', $producer->id);
        });

        $producerQuestions = ProducerQuestion::where('producer_id', $producer->id);

        $stats = [
            'total_questions' => $productQuestions->count() + $producerQuestions->count(),
            'product_questions' => $productQuestions->count(),
            'producer_questions' => $producerQuestions->count(),
            'answered_questions' => $productQuestions->whereNotNull('answer')->count() + 
                                   $producerQuestions->whereNotNull('answer')->count(),
            'unanswered_questions' => $productQuestions->whereNull('answer')->count() + 
                                     $producerQuestions->whereNull('answer')->count(),
            'average_response_time' => null,
            'questions_this_month' => $productQuestions->whereMonth('created_at', now()->month)->count() + 
                                     $producerQuestions->whereMonth('created_at', now()->month)->count()
        ];

        // Calculate average response time
        $answeredQuestions = collect([
            ...$productQuestions->whereNotNull('answer')->get(),
            ...$producerQuestions->whereNotNull('answer')->get()
        ]);

        if ($answeredQuestions->count() > 0) {
            $totalResponseTime = $answeredQuestions->sum(function ($q) {
                return $q->answered_at->diffInHours($q->created_at);
            });
            $stats['average_response_time'] = round($totalResponseTime / $answeredQuestions->count(), 1);
        }

        return response()->json($stats);
    }
}