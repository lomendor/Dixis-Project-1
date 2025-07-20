<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Models\ProducerReview;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ReviewController extends Controller
{
    /**
     * Display a listing of all reviews (products and producers)
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        // Get product reviews
        $productReviewsQuery = Review::with(['product', 'user']);
        
        // Get producer reviews
        $producerReviewsQuery = ProducerReview::with(['producer', 'user']);

        // Apply filters
        if ($request->has('status')) {
            $status = $request->get('status');
            $productReviewsQuery->where('status', $status);
            $producerReviewsQuery->where('status', $status);
        }

        if ($request->has('rating')) {
            $rating = $request->get('rating');
            $productReviewsQuery->where('rating', $rating);
            $producerReviewsQuery->where('rating', $rating);
        }

        if ($request->has('search')) {
            $search = $request->get('search');
            $productReviewsQuery->where(function ($q) use ($search) {
                $q->where('comment', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%");
                  })
                  ->orWhereHas('product', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%");
                  });
            });
            
            $producerReviewsQuery->where(function ($q) use ($search) {
                $q->where('comment', 'like', "%{$search}%")
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
            $productReviewsQuery->whereDate('created_at', '>=', $dateFrom);
            $producerReviewsQuery->whereDate('created_at', '>=', $dateFrom);
        }

        if ($request->has('date_to')) {
            $dateTo = $request->get('date_to');
            $productReviewsQuery->whereDate('created_at', '<=', $dateTo);
            $producerReviewsQuery->whereDate('created_at', '<=', $dateTo);
        }

        // Get reviews
        $productReviews = $productReviewsQuery->latest()->limit(50)->get()->map(function ($review) {
            $review->type = 'product';
            return $review;
        });

        $producerReviews = $producerReviewsQuery->latest()->limit(50)->get()->map(function ($review) {
            $review->type = 'producer';
            return $review;
        });

        // Combine and sort by created_at
        $allReviews = $productReviews->concat($producerReviews)
            ->sortByDesc('created_at')
            ->values();

        // Pagination logic
        $perPage = $request->get('per_page', 15);
        $page = $request->get('page', 1);
        $total = $allReviews->count();
        $reviews = $allReviews->forPage($page, $perPage);

        return response()->json([
            'data' => $reviews,
            'total' => $total,
            'per_page' => $perPage,
            'current_page' => $page,
            'last_page' => ceil($total / $perPage)
        ]);
    }

    /**
     * Get pending reviews
     *
     * @return JsonResponse
     */
    public function getPendingReviews(): JsonResponse
    {
        $productReviews = Review::with(['product', 'user'])
            ->where('status', 'pending')
            ->latest()
            ->get()
            ->map(function ($review) {
                $review->type = 'product';
                return $review;
            });

        $producerReviews = ProducerReview::with(['producer', 'user'])
            ->where('status', 'pending')
            ->latest()
            ->get()
            ->map(function ($review) {
                $review->type = 'producer';
                return $review;
            });

        $pendingReviews = $productReviews->concat($producerReviews)
            ->sortByDesc('created_at')
            ->values();

        return response()->json([
            'reviews' => $pendingReviews,
            'total' => $pendingReviews->count()
        ]);
    }

    /**
     * Display the specified review
     *
     * @param int $id
     * @param Request $request
     * @return JsonResponse
     */
    public function show(int $id, Request $request): JsonResponse
    {
        $type = $request->get('type', 'product');
        
        if ($type === 'producer') {
            $review = ProducerReview::with(['producer', 'user'])->findOrFail($id);
            $review->type = 'producer';
        } else {
            $review = Review::with(['product', 'user'])->findOrFail($id);
            $review->type = 'product';
        }

        return response()->json($review);
    }

    /**
     * Update the specified review
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'type' => 'required|in:product,producer',
            'status' => 'sometimes|required|in:pending,approved,rejected',
            'admin_notes' => 'nullable|string'
        ]);

        $type = $validated['type'];
        
        if ($type === 'producer') {
            $review = ProducerReview::findOrFail($id);
        } else {
            $review = Review::findOrFail($id);
        }

        if (isset($validated['status'])) {
            $review->status = $validated['status'];
        }

        if (isset($validated['admin_notes'])) {
            $review->admin_notes = $validated['admin_notes'];
        }

        $review->save();

        return response()->json([
            'message' => 'Η αξιολόγηση ενημερώθηκε επιτυχώς',
            'review' => $review
        ]);
    }

    /**
     * Remove the specified review
     *
     * @param int $id
     * @param Request $request
     * @return JsonResponse
     */
    public function destroy(int $id, Request $request): JsonResponse
    {
        $type = $request->get('type', 'product');
        
        if ($type === 'producer') {
            $review = ProducerReview::findOrFail($id);
        } else {
            $review = Review::findOrFail($id);
        }

        $review->delete();

        return response()->json([
            'message' => 'Η αξιολόγηση διαγράφηκε επιτυχώς'
        ]);
    }

    /**
     * Approve a review
     *
     * @param int $id
     * @param Request $request
     * @return JsonResponse
     */
    public function approve(int $id, Request $request): JsonResponse
    {
        $type = $request->get('type', 'product');
        
        if ($type === 'producer') {
            $review = ProducerReview::findOrFail($id);
        } else {
            $review = Review::findOrFail($id);
        }

        $review->status = 'approved';
        $review->approved_at = now();
        $review->save();

        return response()->json([
            'message' => 'Η αξιολόγηση εγκρίθηκε επιτυχώς',
            'review' => $review
        ]);
    }

    /**
     * Reject a review
     *
     * @param int $id
     * @param Request $request
     * @return JsonResponse
     */
    public function reject(int $id, Request $request): JsonResponse
    {
        $validated = $request->validate([
            'type' => 'required|in:product,producer',
            'rejection_reason' => 'required|string'
        ]);

        $type = $validated['type'];
        
        if ($type === 'producer') {
            $review = ProducerReview::findOrFail($id);
        } else {
            $review = Review::findOrFail($id);
        }

        $review->status = 'rejected';
        $review->admin_notes = $validated['rejection_reason'];
        $review->save();

        return response()->json([
            'message' => 'Η αξιολόγηση απορρίφθηκε',
            'review' => $review
        ]);
    }
}