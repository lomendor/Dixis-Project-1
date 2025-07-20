<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductQuestion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Log; // Add Log facade
class ProductQuestionController extends Controller
{
    /**
     * Display a listing of the questions for a specific product.
     * Publicly accessible (shows only public questions/answers).
     */
    public function index($slug)
    {
        Log::info("Attempting to fetch questions for product slug: {$slug}");

        $product = Product::where('slug', $slug)->first();

        if (!$product) {
            Log::warning("Product not found for slug: {$slug} in ProductQuestionController@index");
            return response()->json(['message' => 'Product not found.'], 404);
        }

        Log::info("Product found: {$product->name}. Fetching public questions.");

        $questions = $product->questions()
                             ->where('is_public', true)
                             ->with(['user:id,name', 'answeringProducer:id,business_name'])
                             ->orderBy('created_at', 'desc')
                             ->get();

        Log::info("Found " . $questions->count() . " public questions for product slug: {$slug}");

        return response()->json($questions);
    }

    /**
     * Get questions related to the authenticated producer's products.
     */
    public function getProducerQuestions(Request $request)
    {
        $user = Auth::user();
        $producer = $user->producer;

        if (!$producer) {
            return response()->json(['message' => 'Producer not found.'], 404);
        }

        // Get product IDs for this producer
        $productIds = $producer->products()->pluck('id');

        // Fetch questions for these products, eager loading related data
        $questions = ProductQuestion::whereIn('product_id', $productIds)
                                    ->with(['user:id,name', 'product:id,name,slug', 'answeringProducer:id,business_name'])
                                    ->orderBy('created_at', 'desc')
                                    // Optionally filter by unanswered: ->whereNull('answer')
                                    ->get();

        return response()->json($questions);
    }


    /**
     * Store a newly created question for a product.
     * Requires authentication.
     */
    public function store(Request $request, Product $product)
    {
        $request->validate([
            'question' => 'required|string|min:5|max:1000',
        ]);

        $user = Auth::user(); // Get authenticated user

        $question = $product->questions()->create([
            'user_id' => $user->id,
            'question' => $request->input('question'),
            'is_public' => true, // Default to public for now
        ]);

        // TODO: Notify producer about the new question?

        return response()->json($question->load('user:id,name'), 201); // Return created question with user info
    }


    /**
     * Allow a producer to answer a question about their product.
     */
    public function answer(Request $request, ProductQuestion $question) // Route model binding by question ID
    {
        // Authorization: Check if the authenticated user is the producer of the product this question belongs to
        $user = Auth::user();
        $producer = $user->producer;

        // Ensure the user is a producer and owns the product related to the question
        if (!$producer || $question->product->producer_id !== $producer->id) {
             return response()->json(['message' => 'Unauthorized to answer this question.'], 403);
        }

        $request->validate([
            'answer' => 'required|string|min:5|max:2000',
        ]);

        $question->update([
            'answer' => $request->input('answer'),
            'answered_by_producer_id' => $producer->id,
        ]);

         // TODO: Notify the user who asked the question?

        return response()->json($question->load(['user:id,name', 'answeringProducer:id,business_name']));
    }

     /**
     * Allow the user who asked or an admin to delete a question.
     * (Or maybe only hide it? TBD)
     */
    public function destroy(ProductQuestion $question)
    {
         // Authorization: Check if the authenticated user is the one who asked OR an admin
         $user = Auth::user();
         if ($user->id !== $question->user_id /* && $user->role !== 'admin' */) {
              return response()->json(['message' => 'Unauthorized to delete this question.'], 403);
         }

         $question->delete();

         return response()->json(['message' => 'Question deleted successfully.'], 200);
    }

    // Potential future methods:
    // - update() for editing a question/answer
    // - togglePublic() for admin/producer to hide/show a question
}
