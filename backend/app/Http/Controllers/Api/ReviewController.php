<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Models\Product;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class ReviewController extends Controller
{
    /**
     * Get reviews for a product
     *
     * @param  string  $productSlug
     * @return \Illuminate\Http\Response
     */
    public function getProductReviews($productSlug)
    {
        $product = Product::where('slug', $productSlug)->firstOrFail();
        
        $reviews = Review::with('user:id,name')
            ->where('product_id', $product->id)
            ->where('is_approved', true)
            ->orderBy('created_at', 'desc')
            ->get();
        
        return response()->json($reviews);
    }
    
    /**
     * Get review statistics for a product
     *
     * @param  string  $productSlug
     * @return \Illuminate\Http\Response
     */
    public function getProductReviewStats($productSlug)
    {
        $product = Product::where('slug', $productSlug)->firstOrFail();
        
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
        
        $reviews = Review::where('product_id', $product->id)
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
     * Store a new review
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'product_id' => 'required|exists:products,id',
            'rating' => 'required|integer|min:1|max:5',
            'title' => 'nullable|string|max:255',
            'comment' => 'nullable|string|max:1000',
        ]);
        
        if ($validator->fails()) {
            return response()->json(['message' => 'Validation error', 'errors' => $validator->errors()], 422);
        }
        
        // Check if user has already reviewed this product
        $existingReview = Review::where('user_id', Auth::id())
            ->where('product_id', $request->product_id)
            ->first();
        
        if ($existingReview) {
            return response()->json(['message' => 'Έχετε ήδη αξιολογήσει αυτό το προϊόν.'], 422);
        }
        
        // Check if user has purchased this product
        $hasPurchased = Order::where('user_id', Auth::id())
            ->whereHas('items', function ($query) use ($request) {
                $query->where('product_id', $request->product_id);
            })
            ->exists();
        
        $review = new Review();
        $review->user_id = Auth::id();
        $review->product_id = $request->product_id;
        $review->rating = $request->rating;
        $review->title = $request->title;
        $review->comment = $request->comment;
        $review->is_verified_purchase = $hasPurchased;
        
        // Auto-approve reviews for now
        // In a production environment, you might want to set this to false and have an admin approve reviews
        $review->is_approved = true;
        
        $review->save();
        
        return response()->json($review, 201);
    }
    
    /**
     * Update an existing review
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $review = Review::findOrFail($id);
        
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
        
        return response()->json($review);
    }
    
    /**
     * Delete a review
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $review = Review::findOrFail($id);
        
        // Check if the review belongs to the authenticated user
        if ($review->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        $review->delete();
        
        return response()->json(['message' => 'Review deleted successfully']);
    }
    
    /**
     * Get reviews by the authenticated user
     *
     * @return \Illuminate\Http\Response
     */
    public function getUserReviews()
    {
        $reviews = Review::with('product:id,name,slug,main_image')
            ->where('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->get();
        
        return response()->json($reviews);
    }
}
