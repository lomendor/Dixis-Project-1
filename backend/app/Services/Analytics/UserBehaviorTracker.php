<?php

namespace App\Services\Analytics;

use App\Models\User;
use App\Models\Product;
use App\Models\UserBehaviorEvent;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

/**
 * DIXIS PLATFORM - Advanced User Behavior Tracking Service
 * AI-powered analytics for Greek marketplace with ML training data collection
 * 
 * Features:
 * - Greek market context tracking
 * - AI/ML training data preparation
 * - Real-time personalization data
 * - GDPR-compliant privacy protection
 * - Orthodox calendar integration
 * - Seasonal behavior analysis
 */
class UserBehaviorTracker
{
    // Enhanced event types for Greek marketplace AI training
    const EVENT_TYPES = [
        // Core interaction events
        'product_view' => 'Product viewed',
        'product_search' => 'Product searched', 
        'product_filter' => 'Product filtered',
        'product_click' => 'Product clicked',
        'product_share' => 'Product shared',
        'product_favorite' => 'Product favorited',
        'cart_add' => 'Item added to cart',
        'cart_remove' => 'Item removed from cart',
        'checkout_start' => 'Checkout started',
        'checkout_complete' => 'Checkout completed',
        
        // Greek market specific events
        'viva_wallet_payment' => 'Viva Wallet payment initiated',
        'greek_shipping_select' => 'Greek shipping method selected',
        'island_delivery_select' => 'Island delivery selected', 
        'producer_profile_view' => 'Producer profile viewed',
        'producer_contact' => 'Producer contacted',
        'traditional_product_interest' => 'Traditional Greek product interest',
        'seasonal_search' => 'Seasonal product search',
        'orthodox_calendar_view' => 'Orthodox calendar viewed',
        
        // AI personalization events
        'recommendation_view' => 'AI recommendation viewed',
        'recommendation_click' => 'AI recommendation clicked',
        'personalization_interaction' => 'Personalization feature used',
    ];

    // Greek regional contexts
    const GREEK_REGIONS = [
        'athens' => 'Athens Metropolitan',
        'thessaloniki' => 'Thessaloniki', 
        'crete' => 'Crete',
        'peloponnese' => 'Peloponnese',
        'macedonia' => 'Macedonia',
        'islands' => 'Greek Islands',
        'mainland' => 'Mainland Greece',
    ];

    /**
     * Enhanced tracking with Greek market context and AI training data
     */
    public function trackAdvanced(array $eventData): bool
    {
        try {
            // Validate and enrich event data
            $enrichedData = $this->enrichWithGreekContext($eventData);
            
            // Store in UserBehaviorEvent model for AI training
            $behaviorEvent = UserBehaviorEvent::create([
                'user_id' => $enrichedData['user_id'] ?? null,
                'session_id' => $enrichedData['session_id'] ?? session()->getId(),
                'event_type' => $enrichedData['event_type'],
                'event_category' => $this->categorizeEvent($enrichedData['event_type']),
                'event_data' => json_encode($enrichedData['event_data'] ?? []),
                'page_url' => $enrichedData['page_url'] ?? request()->fullUrl(),
                'user_agent' => request()->userAgent(),
                'ip_address' => $this->hashIpAddress(request()->ip()),
                'referrer' => request()->header('referer'),
                'greek_context' => json_encode($enrichedData['greek_context'] ?? []),
                'ai_training_data' => json_encode($this->prepareAITrainingData($enrichedData)),
                'created_at' => now(),
            ]);

            // Cache for real-time personalization
            $this->cacheUserBehavior($behaviorEvent);
            
            // Update real-time analytics
            $this->updateRealTimeAnalytics($behaviorEvent);
            
            Log::info('Enhanced user behavior tracked', [
                'event_id' => $behaviorEvent->id,
                'event_type' => $enrichedData['event_type'],
                'user_id' => $enrichedData['user_id'] ?? 'anonymous',
            ]);
            
            return true;
            
        } catch (\Exception $e) {
            Log::error('Failed to track enhanced user behavior', [
                'error' => $e->getMessage(),
                'event_data' => $eventData,
            ]);
            
            return false;
        }
    }

    /**
     * Track Greek market specific product interaction
     */
    public function trackGreekProductInteraction(int $productId, string $interactionType, ?int $userId = null, array $context = []): bool
    {
        return $this->trackAdvanced([
            'user_id' => $userId,
            'event_type' => $interactionType,
            'event_data' => [
                'product_id' => $productId,
                'interaction_type' => $interactionType,
                'context' => $context,
                'timestamp' => now()->toISOString(),
            ],
            'greek_context' => [
                'is_traditional_product' => $this->isTraditionalGreekProduct($productId),
                'producer_region' => $this->getProducerRegion($productId),
                'seasonal_relevance' => $this->getSeasonalRelevance($productId),
                'certification_level' => $this->getCertificationLevel($productId),
            ],
        ]);
    }

    /**
     * Track search with Greek language processing
     */
    public function trackGreekSearch(string $query, array $filters = [], array $results = [], ?int $userId = null): bool
    {
        return $this->trackAdvanced([
            'user_id' => $userId,
            'event_type' => 'product_search',
            'event_data' => [
                'search_query' => $query,
                'filters_applied' => $filters,
                'results_count' => count($results),
                'greek_terms_detected' => $this->detectGreekTerms($query),
                'seasonal_context' => $this->getSeasonalContext(),
                'query_intent' => $this->analyzeSearchIntent($query),
                'timestamp' => now()->toISOString(),
            ],
            'greek_context' => [
                'query_language' => $this->detectLanguage($query),
                'traditional_products_searched' => $this->containsTraditionalTerms($query),
                'regional_interest' => $this->detectRegionalInterest($query),
                'seasonal_timing' => $this->getCurrentSeason(),
            ],
        ]);
    }

    /**
     * Get AI training dataset for ML models
     */
    public function getAITrainingDataset(int $days = 30): array
    {
        $events = UserBehaviorEvent::where('created_at', '>=', now()->subDays($days))->get();
        
        return [
            'total_events' => $events->count(),
            'unique_users' => $events->whereNotNull('user_id')->unique('user_id')->count(),
            'event_distribution' => $events->groupBy('event_type')->map->count(),
            'greek_context_stats' => $this->analyzeGreekContextStats($events),
            'training_features' => $this->extractMLFeatures($events),
            'ready_for_training' => $this->assessTrainingReadiness($events->count()),
        ];
    }

    /**
     * Greek market context enrichment
     */
    private function enrichWithGreekContext(array $eventData): array
    {
        $eventData['greek_context'] = [
            'user_region' => $this->detectUserRegion(),
            'is_tourism_season' => $this->isTourismSeason(),
            'orthodox_calendar_context' => $this->getOrthodoxCalendarContext(),
            'seasonal_context' => $this->getCurrentSeason(),
            'is_greek_holiday' => $this->isGreekHoliday(),
            'cultural_relevance' => $this->calculateCulturalRelevance($eventData),
            'market_segment' => $this->identifyMarketSegment($eventData),
        ];
        
        return $eventData;
    }

    /**
     * Prepare data for AI/ML training
     */
    private function prepareAITrainingData(array $eventData): array
    {
        return [
            'features' => [
                'event_type' => $eventData['event_type'],
                'hour_of_day' => now()->hour,
                'day_of_week' => now()->dayOfWeek,
                'is_weekend' => now()->isWeekend(),
                'is_tourism_season' => $this->isTourismSeason(),
                'is_orthodox_fasting' => $this->isOrthodoxFastingPeriod(),
                'session_duration' => $this->estimateSessionDuration($eventData['session_id'] ?? null),
                'device_type' => $this->getDeviceType(request()->userAgent()),
                'user_segment' => $this->getUserSegment($eventData['user_id'] ?? null),
            ],
            'labels' => [
                'conversion_potential' => $this->calculateConversionPotential($eventData),
                'engagement_score' => $this->calculateEngagementScore($eventData),
                'greek_market_fit' => $this->calculateGreekMarketFit($eventData),
            ],
            'metadata' => [
                'data_version' => '2.0.0',
                'privacy_compliant' => true,
                'gdpr_consent' => $this->hasGDPRConsent($eventData['user_id'] ?? null),
            ],
        ];
    }

    /**
     * Cache user behavior for real-time personalization
     */
    private function cacheUserBehavior($event): void
    {
        if ($event->user_id) {
            $cacheKey = "user_behavior_v2:{$event->user_id}";
            $recentBehavior = Cache::get($cacheKey, []);
            
            array_unshift($recentBehavior, [
                'event_type' => $event->event_type,
                'event_data' => json_decode($event->event_data, true),
                'greek_context' => json_decode($event->greek_context, true),
                'timestamp' => $event->created_at->toISOString(),
            ]);
            
            // Keep last 100 events for personalization
            $recentBehavior = array_slice($recentBehavior, 0, 100);
            
            Cache::put($cacheKey, $recentBehavior, now()->addHours(24));
        }
    }

    /**
     * Update real-time analytics for Greek market dashboard
     */
    private function updateRealTimeAnalytics($event): void
    {
        $redis = app('redis');
        $date = now()->format('Y-m-d');
        $hour = now()->hour;
        
        // General metrics
        $redis->zincrby("daily_events:{$date}", 1, $event->event_type);
        $redis->zincrby("hourly_events:{$date}:{$hour}", 1, $event->event_type);
        
        // Greek market specific metrics
        $greekContext = json_decode($event->greek_context, true);
        if ($greekContext['user_region'] ?? false) {
            $redis->zincrby("regional_events:{$date}", 1, $greekContext['user_region']);
        }
        
        if ($greekContext['is_tourism_season'] ?? false) {
            $redis->incr("tourism_events:{$date}");
        }
        
        // AI training metrics
        $redis->incr("ai_training_events:{$date}");
        
        // Set expiration for data cleanup
        $redis->expire("daily_events:{$date}", 86400 * 30); // 30 days
        $redis->expire("hourly_events:{$date}:{$hour}", 86400 * 2); // 2 days
    }

    /**
     * Track user behavior event (enhanced backward compatibility)
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

    // ===============================================
    // Greek Market Context Helper Methods
    // ===============================================

    /**
     * Categorize event for AI training
     */
    private function categorizeEvent(string $eventType): string
    {
        $categories = [
            'product_view' => 'engagement',
            'product_search' => 'discovery',
            'product_filter' => 'discovery',
            'cart_add' => 'conversion',
            'checkout_start' => 'conversion',
            'checkout_complete' => 'purchase',
            'viva_wallet_payment' => 'payment',
            'greek_shipping_select' => 'fulfillment',
            'producer_profile_view' => 'engagement',
            'recommendation_view' => 'personalization',
        ];

        return $categories[$eventType] ?? 'other';
    }

    /**
     * Hash IP address for GDPR compliance
     */
    private function hashIpAddress(?string $ip): ?string
    {
        return $ip ? hash('sha256', $ip . config('app.key')) : null;
    }

    /**
     * Detect user region from IP/context
     */
    private function detectUserRegion(): ?string
    {
        // Implement IP geolocation or use session data
        // For now, return null - to be implemented with GeoIP service
        return session('user_region', null);
    }

    /**
     * Check if current period is tourism season
     */
    private function isTourismSeason(): bool
    {
        $month = now()->month;
        // Greek tourism season: April-October
        return $month >= 4 && $month <= 10;
    }

    /**
     * Get Orthodox calendar context
     */
    private function getOrthodoxCalendarContext(): array
    {
        $today = now();
        return [
            'is_fasting_period' => $this->isOrthodoxFastingPeriod(),
            'is_major_feast' => $this->isOrthodoxMajorFeast($today),
            'liturgical_season' => $this->getOrthodoxLiturgicalSeason($today),
        ];
    }

    /**
     * Get current season context
     */
    private function getCurrentSeason(): string
    {
        $month = now()->month;
        $seasons = [
            12 => 'winter', 1 => 'winter', 2 => 'winter',
            3 => 'spring', 4 => 'spring', 5 => 'spring',
            6 => 'summer', 7 => 'summer', 8 => 'summer',
            9 => 'autumn', 10 => 'autumn', 11 => 'autumn',
        ];
        return $seasons[$month];
    }

    /**
     * Check if today is a Greek holiday
     */
    private function isGreekHoliday(): bool
    {
        $today = now()->format('m-d');
        $greekHolidays = [
            '01-01', '01-06', '03-25', '05-01', '08-15', 
            '10-28', '12-25', '12-26'
            // Add more Greek holidays as needed
        ];
        return in_array($today, $greekHolidays);
    }

    /**
     * Calculate cultural relevance score
     */
    private function calculateCulturalRelevance(array $eventData): float
    {
        $score = 0.0;
        
        if ($this->isTraditionalGreekProduct($eventData['product_id'] ?? null)) {
            $score += 0.3;
        }
        
        if ($this->isTourismSeason()) {
            $score += 0.2;
        }
        
        if ($this->isGreekHoliday()) {
            $score += 0.3;
        }
        
        if ($this->isOrthodoxFastingPeriod()) {
            $score += 0.2;
        }
        
        return min($score, 1.0);
    }

    /**
     * Identify market segment
     */
    private function identifyMarketSegment(array $eventData): string
    {
        $userId = $eventData['user_id'] ?? null;
        
        if (!$userId) {
            return 'anonymous';
        }
        
        // Analyze user behavior patterns
        $recentEvents = Cache::get("user_behavior_v2:{$userId}", []);
        
        $conversionEvents = collect($recentEvents)->whereIn('event_type', [
            'cart_add', 'checkout_complete', 'viva_wallet_payment'
        ])->count();
        
        $engagementEvents = collect($recentEvents)->whereIn('event_type', [
            'product_view', 'product_search', 'producer_profile_view'
        ])->count();
        
        if ($conversionEvents >= 3) {
            return 'high_value_customer';
        } elseif ($engagementEvents >= 10) {
            return 'engaged_browser';
        } elseif ($this->isTourismSeason()) {
            return 'tourist_visitor';
        }
        
        return 'casual_visitor';
    }

    // ===============================================
    // AI Training Data Helper Methods
    // ===============================================

    /**
     * Check if Orthodox fasting period
     */
    private function isOrthodoxFastingPeriod(): bool
    {
        // Simplified Orthodox fasting calendar
        $today = now();
        $month = $today->month;
        $day = $today->day;
        
        // Great Lent (approximate - varies by year)
        if ($month >= 2 && $month <= 4) {
            return true;
        }
        
        // Advent Fast (November 15 - December 24)
        if ($month == 11 && $day >= 15) {
            return true;
        }
        if ($month == 12 && $day <= 24) {
            return true;
        }
        
        // Wednesdays and Fridays
        if (in_array($today->dayOfWeek, [3, 5])) {
            return true;
        }
        
        return false;
    }

    /**
     * Estimate session duration
     */
    private function estimateSessionDuration(?string $sessionId): int
    {
        if (!$sessionId) {
            return 0;
        }
        
        $firstEvent = DB::table('user_behavior_events')
            ->where('session_id', $sessionId)
            ->orderBy('created_at')
            ->first();
            
        if (!$firstEvent) {
            return 0;
        }
        
        return now()->diffInMinutes($firstEvent->created_at);
    }

    /**
     * Get device type from user agent
     */
    private function getDeviceType(?string $userAgent): string
    {
        if (!$userAgent) {
            return 'unknown';
        }
        
        $userAgent = strtolower($userAgent);
        
        if (strpos($userAgent, 'mobile') !== false || strpos($userAgent, 'android') !== false) {
            return 'mobile';
        } elseif (strpos($userAgent, 'tablet') !== false || strpos($userAgent, 'ipad') !== false) {
            return 'tablet';
        }
        
        return 'desktop';
    }

    /**
     * Get user segment based on behavior
     */
    private function getUserSegment(?int $userId): string
    {
        if (!$userId) {
            return 'anonymous';
        }
        
        $profile = $this->getUserProfile($userId);
        
        if ($profile['purchases'] >= 3) {
            return 'loyal_customer';
        } elseif ($profile['purchases'] >= 1) {
            return 'converted_customer';
        } elseif ($profile['cart_additions'] >= 2) {
            return 'active_browser';
        }
        
        return 'casual_visitor';
    }

    /**
     * Calculate conversion potential
     */
    private function calculateConversionPotential(array $eventData): float
    {
        $score = 0.0;
        
        // High-intent events
        if (in_array($eventData['event_type'], ['cart_add', 'checkout_start'])) {
            $score += 0.7;
        }
        
        // Engagement events
        if (in_array($eventData['event_type'], ['product_view', 'producer_profile_view'])) {
            $score += 0.3;
        }
        
        // Greek market context
        if ($eventData['greek_context']['is_tourism_season'] ?? false) {
            $score += 0.2;
        }
        
        // Session activity
        $sessionDuration = $this->estimateSessionDuration($eventData['session_id'] ?? null);
        if ($sessionDuration > 5) {
            $score += 0.3;
        }
        
        return min($score, 1.0);
    }

    /**
     * Calculate engagement score
     */
    private function calculateEngagementScore(array $eventData): float
    {
        $weights = [
            'product_view' => 0.1,
            'product_search' => 0.2,
            'cart_add' => 0.5,
            'producer_profile_view' => 0.3,
            'recommendation_click' => 0.4,
        ];
        
        return $weights[$eventData['event_type']] ?? 0.0;
    }

    /**
     * Calculate Greek market fit score
     */
    private function calculateGreekMarketFit(array $eventData): float
    {
        $score = 0.0;
        
        // Traditional product interest
        if ($eventData['event_type'] === 'traditional_product_interest') {
            $score += 0.4;
        }
        
        // Greek shipping/payment methods
        if (in_array($eventData['event_type'], ['viva_wallet_payment', 'greek_shipping_select'])) {
            $score += 0.5;
        }
        
        // Cultural context
        if ($this->isOrthodoxFastingPeriod()) {
            $score += 0.2;
        }
        
        if ($this->isGreekHoliday()) {
            $score += 0.3;
        }
        
        return min($score, 1.0);
    }

    /**
     * Check GDPR consent
     */
    private function hasGDPRConsent(?int $userId): bool
    {
        if (!$userId) {
            return false;
        }
        
        // Check user's GDPR consent status
        return DB::table('users')
            ->where('id', $userId)
            ->where('gdpr_consent', true)
            ->exists();
    }

    // ===============================================
    // Product & Search Analysis Methods
    // ===============================================

    /**
     * Check if product is traditional Greek product
     */
    private function isTraditionalGreekProduct(?int $productId): bool
    {
        if (!$productId) {
            return false;
        }
        
        return Cache::remember("traditional_product_{$productId}", 3600, function () use ($productId) {
            return DB::table('products')
                ->where('id', $productId)
                ->where(function ($query) {
                    $query->whereJsonContains('tags', 'traditional')
                          ->orWhereJsonContains('tags', 'greek')
                          ->orWhereJsonContains('categories', 'traditional');
                })
                ->exists();
        });
    }

    /**
     * Get producer region
     */
    private function getProducerRegion(?int $productId): ?string
    {
        if (!$productId) {
            return null;
        }
        
        return Cache::remember("producer_region_{$productId}", 3600, function () use ($productId) {
            return DB::table('products')
                ->join('producers', 'products.producer_id', '=', 'producers.id')
                ->where('products.id', $productId)
                ->value('producers.region');
        });
    }

    /**
     * Get seasonal relevance
     */
    private function getSeasonalRelevance(?int $productId): array
    {
        if (!$productId) {
            return [];
        }
        
        $currentSeason = $this->getCurrentSeason();
        
        // Simple seasonal mapping - can be enhanced
        $seasonalProducts = [
            'spring' => ['herbs', 'greens', 'early_fruits'],
            'summer' => ['tomatoes', 'cucumbers', 'stone_fruits'],
            'autumn' => ['olives', 'grapes', 'nuts'],
            'winter' => ['citrus', 'root_vegetables', 'preserves'],
        ];
        
        return [
            'current_season' => $currentSeason,
            'is_seasonal' => true, // Simplified - should check product categories
            'peak_season' => $currentSeason,
        ];
    }

    /**
     * Get product certification level
     */
    private function getCertificationLevel(?int $productId): string
    {
        if (!$productId) {
            return 'none';
        }
        
        return Cache::remember("certification_{$productId}", 3600, function () use ($productId) {
            $product = DB::table('products')
                ->select('certifications')
                ->where('id', $productId)
                ->first();
                
            if (!$product || !$product->certifications) {
                return 'none';
            }
            
            $certifications = json_decode($product->certifications, true);
            
            if (in_array('organic', $certifications)) {
                return 'organic';
            } elseif (in_array('pdo', $certifications)) {
                return 'pdo';
            } elseif (in_array('fair_trade', $certifications)) {
                return 'fair_trade';
            }
            
            return 'standard';
        });
    }

    /**
     * Additional analysis methods for Greek market
     */
    private function detectGreekTerms(string $query): array
    {
        $greekTerms = [
            'φέτα', 'feta', 'ελιά', 'olive', 'τζατζίκι', 'tzatziki',
            'μέλι', 'honey', 'κρητικός', 'cretan', 'μακεδονικός'
        ];
        
        $detected = [];
        foreach ($greekTerms as $term) {
            if (stripos($query, $term) !== false) {
                $detected[] = $term;
            }
        }
        
        return $detected;
    }

    private function getSeasonalContext(): array
    {
        return [
            'season' => $this->getCurrentSeason(),
            'month' => now()->month,
            'is_tourism_season' => $this->isTourismSeason(),
            'is_fasting_period' => $this->isOrthodoxFastingPeriod(),
        ];
    }

    private function analyzeSearchIntent(string $query): string
    {
        $query = strtolower($query);
        
        if (strpos($query, 'buy') !== false || strpos($query, 'order') !== false) {
            return 'purchase';
        } elseif (strpos($query, 'recipe') !== false || strpos($query, 'how to') !== false) {
            return 'educational';
        } elseif (strpos($query, 'organic') !== false || strpos($query, 'bio') !== false) {
            return 'quality_focused';
        }
        
        return 'general_discovery';
    }

    private function detectLanguage(string $query): string
    {
        // Simple Greek character detection
        if (preg_match('/[\x{0370}-\x{03FF}]/u', $query)) {
            return 'greek';
        }
        return 'english';
    }

    private function containsTraditionalTerms(string $query): bool
    {
        $traditionalTerms = ['traditional', 'παραδοσιακό', 'artisan', 'handmade'];
        foreach ($traditionalTerms as $term) {
            if (stripos($query, $term) !== false) {
                return true;
            }
        }
        return false;
    }

    private function detectRegionalInterest(string $query): ?string
    {
        $regions = [
            'crete' => ['crete', 'κρήτη', 'cretan'],
            'macedonia' => ['macedonia', 'μακεδονία'],
            'peloponnese' => ['peloponnese', 'πελοπόννησος'],
        ];
        
        foreach ($regions as $region => $terms) {
            foreach ($terms as $term) {
                if (stripos($query, $term) !== false) {
                    return $region;
                }
            }
        }
        
        return null;
    }

    private function analyzeGreekContextStats($events): array
    {
        $stats = [
            'total_greek_events' => 0,
            'tourism_season_events' => 0,
            'fasting_period_events' => 0,
            'regional_distribution' => [],
        ];
        
        foreach ($events as $event) {
            $greekContext = json_decode($event->greek_context ?? '{}', true);
            
            if (!empty($greekContext)) {
                $stats['total_greek_events']++;
                
                if ($greekContext['is_tourism_season'] ?? false) {
                    $stats['tourism_season_events']++;
                }
                
                if ($greekContext['is_orthodox_fasting'] ?? false) {
                    $stats['fasting_period_events']++;
                }
                
                $region = $greekContext['user_region'] ?? 'unknown';
                $stats['regional_distribution'][$region] = 
                    ($stats['regional_distribution'][$region] ?? 0) + 1;
            }
        }
        
        return $stats;
    }

    private function extractMLFeatures($events): array
    {
        $features = [];
        
        foreach ($events as $event) {
            $aiData = json_decode($event->ai_training_data ?? '{}', true);
            if (!empty($aiData['features'])) {
                $features[] = $aiData['features'];
            }
        }
        
        return $features;
    }

    private function assessTrainingReadiness(int $eventCount): array
    {
        return [
            'ready' => $eventCount >= 1000,
            'confidence' => min($eventCount / 10000, 1.0),
            'recommended_actions' => $eventCount < 1000 ? 
                ['Collect more user interaction data'] : 
                ['Ready for ML model training'],
        ];
    }

    private function isOrthodoxMajorFeast($date): bool
    {
        // Major Orthodox feasts - simplified calendar
        $majorFeasts = [
            '01-06', // Epiphany
            '03-25', // Annunciation
            '08-15', // Assumption
            '12-25', // Christmas
        ];
        
        return in_array($date->format('m-d'), $majorFeasts);
    }

    private function getOrthodoxLiturgicalSeason($date): string
    {
        $month = $date->month;
        
        if ($month >= 12 || $month <= 1) {
            return 'nativity';
        } elseif ($month >= 2 && $month <= 4) {
            return 'lent';
        } elseif ($month >= 4 && $month <= 6) {
            return 'easter';
        }
        
        return 'ordinary';
    }
}
