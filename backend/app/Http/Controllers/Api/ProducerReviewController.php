<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProducerReview;
use App\Models\Producer;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class ProducerReviewController extends Controller
{
    /**
     * Get reviews for a producer
     *
     * @param  int  $producerId
     * @return \Illuminate\Http\Response
     */
    public function getProducerReviews($producerId)
    {
        $producer = Producer::findOrFail($producerId);
        
        $reviews = ProducerReview::with('user:id,name')
            ->where('producer_id', $producer->id)
            ->where('is_approved', true)
            ->orderBy('created_at', 'desc')
            ->get();
        
        return response()->json($reviews);
    }
    
    /**
     * Get review statistics for a producer
     *
     * @param  int  $producerId
     * @return \Illuminate\Http\Response
     */
    public function getProducerReviewStats($producerId)
    {
        $producer = Producer::findOrFail($producerId);
        
        $stats = [
            'average_rating' => 0,
            'total_reviews' => 0,
            'rating_distribution' => [
                1 => 0,
                2 => 0,
                3 => 0,
                4 => 0,
                5 => 0
            ]
        ];
        
        $reviews = ProducerReview::where('producer_id', $producer->id)
            ->where('is_approved', true)
            ->get();
        
        $stats['total_reviews'] = $reviews->count();
        
        if ($stats['total_reviews'] > 0) {
            $stats['average_rating'] = $reviews->avg('rating');
            
            // Calculate rating distribution
            foreach ($reviews as $review) {
                $stats['rating_distribution'][$review->rating]++;
            }
        }
        
        return response()->json($stats);
    }
    
    /**
     * Store a new producer review
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'producer_id' => 'required|exists:producers,id',
            'rating' => 'required|integer|min:1|max:5',
            'title' => 'nullable|string|max:255',
            'comment' => 'nullable|string|max:1000',
        ]);
        
        if ($validator->fails()) {
            return response()->json(['message' => 'Validation error', 'errors' => $validator->errors()], 422);
        }
        
        // Check if user has already reviewed this producer
        $existingReview = ProducerReview::where('user_id', Auth::id())
            ->where('producer_id', $request->producer_id)
            ->first();
        
        if ($existingReview) {
            return response()->json(['message' => 'Έχετε ήδη αξιολογήσει αυτόν τον παραγωγό.'], 422);
        }
        
        // Check if user has purchased from this producer
        $hasPurchased = Order::where('user_id', Auth::id())
            ->whereHas('items', function ($query) use ($request) {
                $query->whereHas('product', function ($q) use ($request) {
                    $q->where('producer_id', $request->producer_id);
                });
            })
            ->exists();
        
        $review = new ProducerReview();
        $review->user_id = Auth::id();
        $review->producer_id = $request->producer_id;
        $review->rating = $request->rating;
        $review->title = $request->title;
        $review->comment = $request->comment;
        $review->is_verified_customer = $hasPurchased;
        
        // Auto-approve reviews for now
        $review->is_approved = true;
        
        $review->save();
        
        // Update producer's average rating
        $this->updateProducerRating($request->producer_id);
        
        return response()->json($review, 201);
    }
    
    /**
     * Update an existing producer review
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $review = ProducerReview::findOrFail($id);
        
        // Check if the review belongs to the authenticated user
        if ($review->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        $validator = Validator::make($request->all(), [
            'rating' => 'required|integer|min:1|max:5',
            'title' => 'nullable|string|max:255',
            'comment' => 'nullable|string|max:1000',
        ]);
        
        if ($validator->fails()) {
            return response()->json(['message' => 'Validation error', 'errors' => $validator->errors()], 422);
        }
        
        $review->rating = $request->rating;
        $review->title = $request->title;
        $review->comment = $request->comment;
        
        // Reset approval status when a review is updated
        $review->is_approved = true; // Auto-approve for now
        
        $review->save();
        
        // Update producer's average rating
        $this->updateProducerRating($review->producer_id);
        
        return response()->json($review);
    }
    
    /**
     * Delete a producer review
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $review = ProducerReview::findOrFail($id);
        
        // Check if the review belongs to the authenticated user
        if ($review->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        $producerId = $review->producer_id;
        
        $review->delete();
        
        // Update producer's average rating
        $this->updateProducerRating($producerId);
        
        return response()->json(['message' => 'Review deleted successfully']);
    }
    
    /**
     * Get reviews by the authenticated user
     *
     * @return \Illuminate\Http\Response
     */
    public function getUserProducerReviews()
    {
        $reviews = ProducerReview::with('producer:id,business_name,logo')
            ->where('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->get();
        
        return response()->json($reviews);
    }
    
    /**
     * Update a producer's average rating
     *
     * @param  int  $producerId
     * @return void
     */
    private function updateProducerRating($producerId)
    {
        $avgRating = ProducerReview::where('producer_id', $producerId)
            ->where('is_approved', true)
            ->avg('rating');
        
        $producer = Producer::find($producerId);
        if ($producer) {
            $producer->rating = $avgRating ?: 0;
            $producer->save();
        }
    }
}
