<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Analytics\UserBehaviorTracker;
use App\Services\Analytics\AnalyticsService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

/**
 * Analytics API Controller
 * Handles behavior tracking and analytics data collection
 */
class AnalyticsController extends Controller
{
    private UserBehaviorTracker $behaviorTracker;
    private AnalyticsService $analyticsService;

    public function __construct(
        UserBehaviorTracker $behaviorTracker,
        AnalyticsService $analyticsService
    ) {
        $this->behaviorTracker = $behaviorTracker;
        $this->analyticsService = $analyticsService;
    }

    /**
     * Track user behavior events
     */
    public function track(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'events' => 'required|array|min:1|max:50',
                'events.*.type' => 'required|string|in:product_view,category_view,producer_view,search,search_click,add_to_cart,remove_from_cart,add_to_wishlist,remove_from_wishlist,purchase,page_view,click,scroll,time_on_page',
                'events.*.session_id' => 'required|string|max:100',
                'events.*.product_id' => 'nullable|integer|exists:products,id',
                'events.*.category_id' => 'nullable|integer|exists:categories,id',
                'events.*.producer_id' => 'nullable|integer|exists:producers,id',
                'events.*.search_query' => 'nullable|string|max:500',
                'events.*.page_url' => 'nullable|string|max:1000',
                'events.*.referrer' => 'nullable|string|max:1000',
                'events.*.metadata' => 'nullable|array',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $events = $request->input('events');
            $successCount = 0;
            $errors = [];

            foreach ($events as $index => $eventData) {
                try {
                    // Add request metadata
                    $eventData['user_id'] = auth()->id();
                    $eventData['ip_address'] = $request->ip();
                    $eventData['user_agent'] = $request->userAgent();

                    // Detect device type, browser, OS
                    $deviceInfo = $this->parseUserAgent($request->userAgent());
                    $eventData['device_type'] = $deviceInfo['device_type'];
                    $eventData['browser'] = $deviceInfo['browser'];
                    $eventData['os'] = $deviceInfo['os'];

                    $success = $this->behaviorTracker->trackEvent($eventData);
                    
                    if ($success) {
                        $successCount++;
                    } else {
                        $errors[] = "Failed to track event at index {$index}";
                    }
                } catch (\Exception $e) {
                    Log::error("Error tracking event at index {$index}: " . $e->getMessage());
                    $errors[] = "Error tracking event at index {$index}: " . $e->getMessage();
                }
            }

            return response()->json([
                'success' => true,
                'message' => "Successfully tracked {$successCount} out of " . count($events) . " events",
                'tracked_count' => $successCount,
                'total_count' => count($events),
                'errors' => $errors
            ]);

        } catch (\Exception $e) {
            Log::error('Analytics tracking error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Internal server error',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get analytics summary
     */
    public function getSummary(Request $request): JsonResponse
    {
        try {
            $user = auth()->user();

            // Basic summary data
            $summary = [
                'user' => [
                    'total_orders' => 0,
                    'total_spent' => 0,
                    'favorite_products' => 0,
                    'reviews_count' => 0,
                ],
                'platform' => [
                    'total_products' => \App\Models\Product::count(),
                    'total_categories' => \App\Models\Category::count(),
                    'total_producers' => \App\Models\User::where('role', 'producer')->count(),
                ],
                'recent_activity' => []
            ];

            if ($user) {
                // Add user-specific data if authenticated
                $summary['user']['total_orders'] = $user->orders()->count() ?? 0;
                $summary['user']['total_spent'] = $user->orders()->sum('total') ?? 0;
                $summary['user']['reviews_count'] = $user->reviews()->count() ?? 0;
            }

            return response()->json([
                'success' => true,
                'data' => $summary
            ]);

        } catch (\Exception $e) {
            Log::error('Error getting analytics summary: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to get analytics summary',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get user behavior profile
     */
    public function getUserProfile(Request $request): JsonResponse
    {
        try {
            $userId = auth()->id();
            $sessionId = $request->input('session_id');

            if (!$userId && !$sessionId) {
                return response()->json([
                    'success' => false,
                    'message' => 'User ID or session ID required'
                ], 400);
            }

            $profile = $this->behaviorTracker->getUserProfile($userId, $sessionId);

            return response()->json([
                'success' => true,
                'data' => $profile
            ]);

        } catch (\Exception $e) {
            Log::error('Error getting user profile: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to get user profile',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get trending products
     */
    public function getTrendingProducts(Request $request): JsonResponse
    {
        try {
            $limit = $request->input('limit', 10);
            $hours = $request->input('hours', 24);

            $trending = $this->behaviorTracker->getTrendingProducts($limit, $hours);

            return response()->json([
                'success' => true,
                'data' => $trending
            ]);

        } catch (\Exception $e) {
            Log::error('Error getting trending products: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to get trending products',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get popular searches
     */
    public function getPopularSearches(Request $request): JsonResponse
    {
        try {
            $limit = $request->input('limit', 20);
            $days = $request->input('days', 7);

            $searches = $this->behaviorTracker->getPopularSearches($limit, $days);

            return response()->json([
                'success' => true,
                'data' => $searches
            ]);

        } catch (\Exception $e) {
            Log::error('Error getting popular searches: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to get popular searches',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get conversion funnel data
     */
    public function getConversionFunnel(Request $request): JsonResponse
    {
        try {
            $days = $request->input('days', 30);

            $funnel = $this->behaviorTracker->getConversionFunnel($days);

            return response()->json([
                'success' => true,
                'data' => $funnel
            ]);

        } catch (\Exception $e) {
            Log::error('Error getting conversion funnel: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to get conversion funnel',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get dashboard analytics
     */
    public function getDashboardAnalytics(Request $request): JsonResponse
    {
        try {
            $days = $request->input('days', 30);

            $analytics = $this->analyticsService->getDashboardAnalytics($days);

            return response()->json([
                'success' => true,
                'data' => $analytics
            ]);

        } catch (\Exception $e) {
            Log::error('Error getting dashboard analytics: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to get dashboard analytics',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get product performance analytics
     */
    public function getProductPerformance(Request $request, int $productId): JsonResponse
    {
        try {
            $days = $request->input('days', 30);

            $performance = $this->analyticsService->getProductPerformance($productId, $days);

            return response()->json([
                'success' => true,
                'data' => $performance
            ]);

        } catch (\Exception $e) {
            Log::error('Error getting product performance: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to get product performance',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get user segmentation data
     */
    public function getUserSegmentation(Request $request): JsonResponse
    {
        try {
            $segmentation = $this->analyticsService->getUserSegmentation();

            return response()->json([
                'success' => true,
                'data' => $segmentation
            ]);

        } catch (\Exception $e) {
            Log::error('Error getting user segmentation: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to get user segmentation',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get search analytics
     */
    public function getSearchAnalytics(Request $request): JsonResponse
    {
        try {
            $days = $request->input('days', 30);

            $analytics = $this->analyticsService->getSearchAnalytics($days);

            return response()->json([
                'success' => true,
                'data' => $analytics
            ]);

        } catch (\Exception $e) {
            Log::error('Error getting search analytics: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to get search analytics',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Parse user agent to extract device info
     */
    private function parseUserAgent(?string $userAgent): array
    {
        if (!$userAgent) {
            return [
                'device_type' => 'unknown',
                'browser' => 'unknown',
                'os' => 'unknown'
            ];
        }

        // Simple user agent parsing (in production, use a proper library)
        $deviceType = 'desktop';
        if (preg_match('/Mobile|Android|iPhone|iPad/', $userAgent)) {
            $deviceType = 'mobile';
        } elseif (preg_match('/Tablet|iPad/', $userAgent)) {
            $deviceType = 'tablet';
        }

        $browser = 'unknown';
        if (preg_match('/Chrome/', $userAgent)) {
            $browser = 'chrome';
        } elseif (preg_match('/Firefox/', $userAgent)) {
            $browser = 'firefox';
        } elseif (preg_match('/Safari/', $userAgent)) {
            $browser = 'safari';
        } elseif (preg_match('/Edge/', $userAgent)) {
            $browser = 'edge';
        }

        $os = 'unknown';
        if (preg_match('/Windows/', $userAgent)) {
            $os = 'windows';
        } elseif (preg_match('/Mac OS/', $userAgent)) {
            $os = 'macos';
        } elseif (preg_match('/Linux/', $userAgent)) {
            $os = 'linux';
        } elseif (preg_match('/Android/', $userAgent)) {
            $os = 'android';
        } elseif (preg_match('/iOS/', $userAgent)) {
            $os = 'ios';
        }

        return [
            'device_type' => $deviceType,
            'browser' => $browser,
            'os' => $os
        ];
    }
}
