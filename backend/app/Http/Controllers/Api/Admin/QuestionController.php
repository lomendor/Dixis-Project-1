<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ProductQuestion;
use App\Models\ProducerQuestion;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class QuestionController extends Controller
{
    /**
     * Display a listing of all questions (products and producers)
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        // Get product questions
        $productQuestionsQuery = ProductQuestion::with(['product', 'user']);
        
        // Get producer questions  
        $producerQuestionsQuery = ProducerQuestion::with(['producer', 'user']);

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
                  ->orWhere('answer', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%");
                  })
                  ->orWhereHas('product', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%");
                  });
            });
            
            $producerQuestionsQuery->where(function ($q) use ($search) {
                $q->where('question', 'like', "%{$search}%")
                  ->orWhere('answer', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%");
                  })
                  ->orWhereHas('producer', function ($q) use ($search) {
                    $q->where('business_name', 'like', "%{$search}%");
                  });
            });
        }

        // Filter by date range
        if ($request->has('date_from')) {
            $dateFrom = $request->get('date_from');
            $productQuestionsQuery->whereDate('created_at', '>=', $dateFrom);
            $producerQuestionsQuery->whereDate('created_at', '>=', $dateFrom);
        }

        if ($request->has('date_to')) {
            $dateTo = $request->get('date_to');
            $productQuestionsQuery->whereDate('created_at', '<=', $dateTo);
            $producerQuestionsQuery->whereDate('created_at', '<=', $dateTo);
        }

        // Get questions
        $productQuestions = $productQuestionsQuery->latest()->limit(50)->get()->map(function ($question) {
            $question->type = 'product';
            return $question;
        });

        $producerQuestions = $producerQuestionsQuery->latest()->limit(50)->get()->map(function ($question) {
            $question->type = 'producer';
            return $question;
        });

        // Combine and sort by created_at
        $allQuestions = $productQuestions->concat($producerQuestions)
            ->sortByDesc('created_at')
            ->values();

        // Pagination logic
        $perPage = $request->get('per_page', 15);
        $page = $request->get('page', 1);
        $total = $allQuestions->count();
        $questions = $allQuestions->forPage($page, $perPage);

        return response()->json([
            'data' => $questions,
            'total' => $total,
            'per_page' => $perPage,
            'current_page' => $page,
            'last_page' => ceil($total / $perPage)
        ]);
    }

    /**
     * Get unanswered questions
     *
     * @return JsonResponse
     */
    public function getUnansweredQuestions(): JsonResponse
    {
        $productQuestions = ProductQuestion::with(['product', 'user'])
            ->whereNull('answer')
            ->latest()
            ->get()
            ->map(function ($question) {
                $question->type = 'product';
                return $question;
            });

        $producerQuestions = ProducerQuestion::with(['producer', 'user'])
            ->whereNull('answer')
            ->latest()
            ->get()
            ->map(function ($question) {
                $question->type = 'producer';
                return $question;
            });

        $unansweredQuestions = $productQuestions->concat($producerQuestions)
            ->sortByDesc('created_at')
            ->values();

        return response()->json([
            'questions' => $unansweredQuestions,
            'total' => $unansweredQuestions->count()
        ]);
    }

    /**
     * Display the specified question
     *
     * @param int $id
     * @param Request $request
     * @return JsonResponse
     */
    public function show(int $id, Request $request): JsonResponse
    {
        $type = $request->get('type', 'product');
        
        if ($type === 'producer') {
            $question = ProducerQuestion::with(['producer', 'user'])->findOrFail($id);
            $question->type = 'producer';
        } else {
            $question = ProductQuestion::with(['product', 'user'])->findOrFail($id);
            $question->type = 'product';
        }

        return response()->json($question);
    }

    /**
     * Update the specified question
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'type' => 'required|in:product,producer',
            'question' => 'sometimes|required|string',
            'answer' => 'nullable|string',
            'is_visible' => 'sometimes|required|boolean'
        ]);

        $type = $validated['type'];
        
        if ($type === 'producer') {
            $question = ProducerQuestion::findOrFail($id);
        } else {
            $question = ProductQuestion::findOrFail($id);
        }

        if (isset($validated['question'])) {
            $question->question = $validated['question'];
        }

        if (array_key_exists('answer', $validated)) {
            $question->answer = $validated['answer'];
            if ($validated['answer']) {
                $question->answered_at = now();
                $question->answered_by = auth()->id();
            } else {
                $question->answered_at = null;
                $question->answered_by = null;
            }
        }

        if (isset($validated['is_visible'])) {
            $question->is_visible = $validated['is_visible'];
        }

        $question->save();

        return response()->json([
            'message' => 'Η ερώτηση ενημερώθηκε επιτυχώς',
            'question' => $question
        ]);
    }

    /**
     * Remove the specified question
     *
     * @param int $id
     * @param Request $request
     * @return JsonResponse
     */
    public function destroy(int $id, Request $request): JsonResponse
    {
        $type = $request->get('type', 'product');
        
        if ($type === 'producer') {
            $question = ProducerQuestion::findOrFail($id);
        } else {
            $question = ProductQuestion::findOrFail($id);
        }

        $question->delete();

        return response()->json([
            'message' => 'Η ερώτηση διαγράφηκε επιτυχώς'
        ]);
    }
}