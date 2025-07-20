<?php

namespace App\Services\Analytics;

use App\Models\User;
use App\Models\Product;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

/**
 * Advanced User Behavior Tracking Service
 * Collects and analyzes user interactions for AI/ML models
 */
class UserBehaviorTracker
{
    /**
     * Track user behavior event
     */
    public function trackEvent(array $eventData): bool
    {
        try {
            $event = [
                'user_id' => $eventData['user_id'] ?? null,
                'session_id' => $eventData['session_id'],
                'event_type' => $eventData['type'],
                'product_id' => $eventData['product_id'] ?? null,
                'category_id' => $eventData['category_id'] ?? null,
                'producer_id' => $eventData['producer_id'] ?? null,
                'search_query' => $eventData['search_query'] ?? null,
                'page_url' => $eventData['page_url'] ?? null,
                'referrer' => $eventData['referrer'] ?? null,
                'user_agent' => $eventData['user_agent'] ?? null,
                'ip_address' => $eventData['ip_address'] ?? null,
                'metadata' => json_encode($eventData['metadata'] ?? []),
                'created_at' => now(),
            ];

            DB::table('user_behavior_events')->insert($event);

            // Update real-time user profile
            $this->updateUserProfile($eventData);

            // Cache recent events for quick access
            $this->cacheRecentEvent($eventData);

            return true;
        } catch (\Exception $e) {
            Log::error('Error tracking user behavior: ' . $e->getMessage(), $eventData);
            return false;
        }
    }

    /**
     * Track product view
     */
    public function trackProductView(int $productId, ?int $userId = null, string $sessionId = ''): void
    {
        $this->trackEvent([
            'type' => 'product_view',
            'product_id' => $productId,
            'user_id' => $userId,
            'session_id' => $sessionId,
            'metadata' => [
                'timestamp' => now()->toISOString(),
                'source' => 'product_page'
            ]
        ]);

        // Update product view count
        $this->incrementProductViews($productId);
    }

    /**
     * Track search behavior
     */
    public function trackSearch(string $query, array $results, ?int $userId = null, string $sessionId = ''): void
    {
        $this->trackEvent([
            'type' => 'search',
            'search_query' => $query,
            'user_id' => $userId,
            'session_id' => $sessionId,
            'metadata' => [
                'results_count' => count($results),
                'query_length' => strlen($query),
                'has_results' => !empty($results),
                'timestamp' => now()->toISOString()
            ]
        ]);
    }

    /**
     * Track add to cart
     */
    public function trackAddToCart(int $productId, int $quantity, ?int $userId = null, string $sessionId = ''): void
    {
        $this->trackEvent([
            'type' => 'add_to_cart',
            'product_id' => $productId,
            'user_id' => $userId,
            'session_id' => $sessionId,
            'metadata' => [
                'quantity' => $quantity,
                'timestamp' => now()->toISOString()
            ]
        ]);
    }

    /**
     * Track purchase
     */
    public function trackPurchase(int $orderId, array $items, int $userId): void
    {
        foreach ($items as $item) {
            $this->trackEvent([
                'type' => 'purchase',
                'product_id' => $item['product_id'],
                'user_id' => $userId,
                'session_id' => session()->getId(),
                'metadata' => [
                    'order_id' => $orderId,
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                    'total' => $item['quantity'] * $item['price'],
                    'timestamp' => now()->toISOString()
                ]
            ]);
        }
    }

    /**
     * Get user behavior profile
     */
    public function getUserProfile(?int $userId = null, string $sessionId = ''): array
    {
        if (!$userId && !$sessionId) {
            return [];
        }

        $cacheKey = $userId ? "user_profile_{$userId}" : "session_profile_{$sessionId}";
        
        return Cache::remember($cacheKey, 3600, function () use ($userId, $sessionId) {
            $query = DB::table('user_behavior_events')
                ->where('created_at', '>=', now()->subDays(30));

            if ($userId) {
                $query->where('user_id', $userId);
            } else {
                $query->where('session_id', $sessionId);
            }

            $events = $query->get();

            return [
                'total_events' => $events->count(),
                'product_views' => $events->where('event_type', 'product_view')->count(),
                'searches' => $events->where('event_type', 'search')->count(),
                'cart_additions' => $events->where('event_type', 'add_to_cart')->count(),
                'purchases' => $events->where('event_type', 'purchase')->count(),
                'viewed_products' => $events->where('event_type', 'product_view')
                    ->pluck('product_id')->unique()->values()->toArray(),
                'search_queries' => $events->where('event_type', 'search')
                    ->pluck('search_query')->filter()->unique()->values()->toArray(),
                'preferred_categories' => $this->getPreferredCategories($events),
                'activity_score' => $this->calculateActivityScore($events),
                'last_activity' => $events->max('created_at'),
            ];
        });
    }

    /**
     * Get trending products based on recent views
     */
    public function getTrendingProducts(int $limit = 10, int $hours = 24): array
    {
        return Cache::remember("trending_products_{$hours}h", 1800, function () use ($limit, $hours) {
            return DB::table('user_behavior_events')
                ->where('event_type', 'product_view')
                ->where('created_at', '>=', now()->subHours($hours))
                ->select('product_id', DB::raw('COUNT(*) as view_count'))
                ->groupBy('product_id')
                ->orderBy('view_count', 'desc')
                ->limit($limit)
                ->get()
                ->toArray();
        });
    }

    /**
     * Get popular search queries
     */
    public function getPopularSearches(int $limit = 20, int $days = 7): array
    {
        return Cache::remember("popular_searches_{$days}d", 3600, function () use ($limit, $days) {
            return DB::table('user_behavior_events')
                ->where('event_type', 'search')
                ->where('created_at', '>=', now()->subDays($days))
                ->whereNotNull('search_query')
                ->select('search_query', DB::raw('COUNT(*) as search_count'))
                ->groupBy('search_query')
                ->orderBy('search_count', 'desc')
                ->limit($limit)
                ->get()
                ->toArray();
        });
    }

    /**
     * Get conversion funnel data
     */
    public function getConversionFunnel(int $days = 30): array
    {
        $startDate = now()->subDays($days);

        $views = DB::table('user_behavior_events')
            ->where('event_type', 'product_view')
            ->where('created_at', '>=', $startDate)
            ->distinct('session_id')
            ->count();

        $cartAdditions = DB::table('user_behavior_events')
            ->where('event_type', 'add_to_cart')
            ->where('created_at', '>=', $startDate)
            ->distinct('session_id')
            ->count();

        $purchases = DB::table('user_behavior_events')
            ->where('event_type', 'purchase')
            ->where('created_at', '>=', $startDate)
            ->distinct('session_id')
            ->count();

        return [
            'product_views' => $views,
            'cart_additions' => $cartAdditions,
            'purchases' => $purchases,
            'view_to_cart_rate' => $views > 0 ? round(($cartAdditions / $views) * 100, 2) : 0,
            'cart_to_purchase_rate' => $cartAdditions > 0 ? round(($purchases / $cartAdditions) * 100, 2) : 0,
            'overall_conversion_rate' => $views > 0 ? round(($purchases / $views) * 100, 2) : 0,
        ];
    }

    /**
     * Private helper methods
     */
    private function updateUserProfile(array $eventData): void
    {
        if (!isset($eventData['user_id'])) return;

        $userId = $eventData['user_id'];
        $cacheKey = "user_profile_{$userId}";
        
        Cache::forget($cacheKey);
    }

    private function cacheRecentEvent(array $eventData): void
    {
        $key = 'recent_events';
        $events = Cache::get($key, []);
        
        array_unshift($events, $eventData);
        $events = array_slice($events, 0, 100); // Keep last 100 events
        
        Cache::put($key, $events, 3600);
    }

    private function incrementProductViews(int $productId): void
    {
        $key = "product_views_{$productId}";
        $views = Cache::get($key, 0);
        Cache::put($key, $views + 1, 86400);
    }

    private function getPreferredCategories($events): array
    {
        $categoryViews = $events->where('event_type', 'product_view')
            ->whereNotNull('category_id')
            ->groupBy('category_id')
            ->map->count()
            ->sortDesc()
            ->take(5);

        return $categoryViews->keys()->toArray();
    }

    private function calculateActivityScore($events): int
    {
        $score = 0;
        $score += $events->where('event_type', 'product_view')->count() * 1;
        $score += $events->where('event_type', 'search')->count() * 2;
        $score += $events->where('event_type', 'add_to_cart')->count() * 5;
        $score += $events->where('event_type', 'purchase')->count() * 10;

        return min($score, 100); // Cap at 100
    }
}
