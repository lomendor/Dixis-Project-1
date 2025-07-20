<?php

namespace App\Services\Integrations\Marketing;

use App\Models\User;
use App\Models\Order;
use App\Models\Product;
use App\Models\IntegrationSetting;
use App\Models\IntegrationLog;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class MarketingAutomationService
{
    protected $tenantId;

    public function __construct()
    {
        $this->tenantId = auth()->user()->tenant_id ?? 1;
    }

    /**
     * Automated customer journey workflows
     */
    public function processCustomerJourney(User $user, string $trigger): array
    {
        try {
            $workflows = $this->getActiveWorkflows($trigger);
            $executedWorkflows = [];

            foreach ($workflows as $workflow) {
                if ($this->shouldExecuteWorkflow($user, $workflow)) {
                    $result = $this->executeWorkflow($user, $workflow);
                    $executedWorkflows[] = $result;
                }
            }

            $this->logActivity('customer_journey', [
                'user_id' => $user->id,
                'trigger' => $trigger,
                'workflows_executed' => count($executedWorkflows)
            ]);

            return [
                'success' => true,
                'executed_workflows' => $executedWorkflows,
                'trigger' => $trigger
            ];
        } catch (\Exception $e) {
            Log::error('Customer journey processing failed: ' . $e->getMessage());
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Automated email campaigns based on customer behavior
     */
    public function triggerBehavioralEmail(User $user, string $behavior, array $context = []): array
    {
        try {
            $emailTemplate = $this->getEmailTemplate($behavior);
            if (!$emailTemplate) {
                throw new \Exception("No email template found for behavior: {$behavior}");
            }

            $personalizedContent = $this->personalizeEmailContent($emailTemplate, $user, $context);
            
            // Send email
            Mail::send('emails.behavioral.' . $behavior, $personalizedContent, function ($message) use ($user, $emailTemplate) {
                $message->to($user->email, $user->name)
                       ->subject($emailTemplate['subject']);
            });

            $this->logActivity('behavioral_email', [
                'user_id' => $user->id,
                'behavior' => $behavior,
                'template' => $emailTemplate['name'],
                'context' => $context
            ]);

            return [
                'success' => true,
                'email_sent' => true,
                'behavior' => $behavior,
                'template' => $emailTemplate['name']
            ];
        } catch (\Exception $e) {
            Log::error('Behavioral email failed: ' . $e->getMessage());
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Automated abandoned cart recovery
     */
    public function processAbandonedCarts(): array
    {
        try {
            $abandonedCarts = $this->getAbandonedCarts();
            $recoveryEmails = [];

            foreach ($abandonedCarts as $cart) {
                $user = $cart->user;
                $hoursSinceAbandonment = Carbon::parse($cart->updated_at)->diffInHours(now());

                // Send different emails based on time elapsed
                if ($hoursSinceAbandonment >= 1 && $hoursSinceAbandonment < 2) {
                    $result = $this->sendAbandonedCartEmail($user, $cart, 'immediate');
                    $recoveryEmails[] = $result;
                } elseif ($hoursSinceAbandonment >= 24 && $hoursSinceAbandonment < 25) {
                    $result = $this->sendAbandonedCartEmail($user, $cart, 'reminder');
                    $recoveryEmails[] = $result;
                } elseif ($hoursSinceAbandonment >= 72 && $hoursSinceAbandonment < 73) {
                    $result = $this->sendAbandonedCartEmail($user, $cart, 'final_offer');
                    $recoveryEmails[] = $result;
                }
            }

            $this->logActivity('abandoned_cart_recovery', [
                'abandoned_carts_found' => count($abandonedCarts),
                'emails_sent' => count($recoveryEmails)
            ]);

            return [
                'success' => true,
                'abandoned_carts' => count($abandonedCarts),
                'recovery_emails_sent' => count($recoveryEmails),
                'results' => $recoveryEmails
            ];
        } catch (\Exception $e) {
            Log::error('Abandoned cart recovery failed: ' . $e->getMessage());
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Automated product recommendations
     */
    public function generateProductRecommendations(User $user): array
    {
        try {
            $recommendations = [];

            // Collaborative filtering recommendations
            $collaborativeRecs = $this->getCollaborativeRecommendations($user);
            $recommendations['collaborative'] = $collaborativeRecs;

            // Content-based recommendations
            $contentRecs = $this->getContentBasedRecommendations($user);
            $recommendations['content_based'] = $contentRecs;

            // Trending products
            $trendingRecs = $this->getTrendingProducts();
            $recommendations['trending'] = $trendingRecs;

            // Seasonal recommendations
            $seasonalRecs = $this->getSeasonalRecommendations();
            $recommendations['seasonal'] = $seasonalRecs;

            $this->logActivity('product_recommendations', [
                'user_id' => $user->id,
                'collaborative_count' => count($collaborativeRecs),
                'content_based_count' => count($contentRecs),
                'trending_count' => count($trendingRecs),
                'seasonal_count' => count($seasonalRecs)
            ]);

            return [
                'success' => true,
                'recommendations' => $recommendations,
                'user_id' => $user->id
            ];
        } catch (\Exception $e) {
            Log::error('Product recommendations failed: ' . $e->getMessage());
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Automated customer segmentation
     */
    public function segmentCustomers(): array
    {
        try {
            $segments = [
                'high_value' => $this->getHighValueCustomers(),
                'frequent_buyers' => $this->getFrequentBuyers(),
                'at_risk' => $this->getAtRiskCustomers(),
                'new_customers' => $this->getNewCustomers(),
                'seasonal_buyers' => $this->getSeasonalBuyers()
            ];

            $totalCustomers = User::where('role', 'consumer')->count();
            $segmentSummary = [];

            foreach ($segments as $segmentName => $customers) {
                $segmentSummary[$segmentName] = [
                    'count' => count($customers),
                    'percentage' => $totalCustomers > 0 ? round((count($customers) / $totalCustomers) * 100, 2) : 0
                ];
            }

            $this->logActivity('customer_segmentation', [
                'total_customers' => $totalCustomers,
                'segments' => $segmentSummary
            ]);

            return [
                'success' => true,
                'segments' => $segments,
                'summary' => $segmentSummary,
                'total_customers' => $totalCustomers
            ];
        } catch (\Exception $e) {
            Log::error('Customer segmentation failed: ' . $e->getMessage());
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Get active workflows for a trigger
     */
    private function getActiveWorkflows(string $trigger): array
    {
        // Mock workflows - would be stored in database
        $workflows = [
            'user_registered' => [
                ['name' => 'welcome_series', 'delay' => 0, 'type' => 'email'],
                ['name' => 'onboarding_tips', 'delay' => 24, 'type' => 'email']
            ],
            'first_purchase' => [
                ['name' => 'thank_you', 'delay' => 1, 'type' => 'email'],
                ['name' => 'product_care_tips', 'delay' => 48, 'type' => 'email']
            ],
            'order_delivered' => [
                ['name' => 'review_request', 'delay' => 72, 'type' => 'email'],
                ['name' => 'related_products', 'delay' => 168, 'type' => 'email']
            ]
        ];

        return $workflows[$trigger] ?? [];
    }

    /**
     * Check if workflow should be executed
     */
    private function shouldExecuteWorkflow(User $user, array $workflow): bool
    {
        // Check if user has already received this workflow recently
        $recentLog = IntegrationLog::where('service', 'marketing_automation')
                                  ->where('action', 'workflow_executed')
                                  ->where('data->user_id', $user->id)
                                  ->where('data->workflow_name', $workflow['name'])
                                  ->where('created_at', '>=', Carbon::now()->subDays(30))
                                  ->exists();

        return !$recentLog;
    }

    /**
     * Execute workflow
     */
    private function executeWorkflow(User $user, array $workflow): array
    {
        try {
            switch ($workflow['type']) {
                case 'email':
                    return $this->triggerBehavioralEmail($user, $workflow['name']);
                case 'sms':
                    return $this->sendSMS($user, $workflow['name']);
                default:
                    throw new \Exception("Unknown workflow type: {$workflow['type']}");
            }
        } catch (\Exception $e) {
            return ['success' => false, 'error' => $e->getMessage(), 'workflow' => $workflow['name']];
        }
    }

    /**
     * Get email template
     */
    private function getEmailTemplate(string $behavior): ?array
    {
        $templates = [
            'welcome_series' => [
                'name' => 'Welcome to Dixis',
                'subject' => 'Καλώς ήρθατε στο Dixis - Ανακαλύψτε αυθεντικά ελληνικά προϊόντα'
            ],
            'abandoned_cart_immediate' => [
                'name' => 'Forgot Something?',
                'subject' => 'Ξεχάσατε κάτι στο καλάθι σας;'
            ],
            'abandoned_cart_reminder' => [
                'name' => 'Still Interested?',
                'subject' => 'Τα προϊόντα σας σας περιμένουν'
            ],
            'abandoned_cart_final_offer' => [
                'name' => 'Last Chance + Discount',
                'subject' => 'Τελευταία ευκαιρία με 10% έκπτωση'
            ]
        ];

        return $templates[$behavior] ?? null;
    }

    /**
     * Personalize email content
     */
    private function personalizeEmailContent(array $template, User $user, array $context): array
    {
        return [
            'user' => $user,
            'template' => $template,
            'context' => $context,
            'recommendations' => $this->generateProductRecommendations($user)['recommendations'] ?? []
        ];
    }

    /**
     * Get abandoned carts
     */
    private function getAbandonedCarts(): \Illuminate\Database\Eloquent\Collection
    {
        return \App\Models\Cart::whereHas('items')
                              ->where('updated_at', '<=', Carbon::now()->subHour())
                              ->where('updated_at', '>=', Carbon::now()->subDays(7))
                              ->with(['user', 'items.product'])
                              ->get();
    }

    /**
     * Send abandoned cart email
     */
    private function sendAbandonedCartEmail(User $user, $cart, string $type): array
    {
        return $this->triggerBehavioralEmail($user, "abandoned_cart_{$type}", [
            'cart' => $cart,
            'cart_value' => $cart->items->sum(fn($item) => $item->quantity * $item->price),
            'discount_code' => $type === 'final_offer' ? 'COMEBACK10' : null
        ]);
    }

    /**
     * Get collaborative recommendations
     */
    private function getCollaborativeRecommendations(User $user): array
    {
        // Simplified collaborative filtering
        $userOrders = $user->orders()->with('items.product')->get();
        $purchasedProductIds = $userOrders->flatMap(fn($order) => $order->items->pluck('product_id'))->unique();

        // Find similar users
        $similarUsers = User::whereHas('orders.items', function($query) use ($purchasedProductIds) {
            $query->whereIn('product_id', $purchasedProductIds);
        })->where('id', '!=', $user->id)->limit(10)->get();

        // Get products bought by similar users
        $recommendations = Product::whereHas('orderItems.order', function($query) use ($similarUsers) {
            $query->whereIn('user_id', $similarUsers->pluck('id'));
        })->whereNotIn('id', $purchasedProductIds)->limit(5)->get();

        return $recommendations->toArray();
    }

    /**
     * Get content-based recommendations
     */
    private function getContentBasedRecommendations(User $user): array
    {
        $userOrders = $user->orders()->with('items.product.categories')->get();
        $preferredCategories = $userOrders->flatMap(fn($order) => 
            $order->items->flatMap(fn($item) => $item->product->categories->pluck('id'))
        )->countBy()->sortDesc()->take(3)->keys();

        $recommendations = Product::whereHas('categories', function($query) use ($preferredCategories) {
            $query->whereIn('category_id', $preferredCategories);
        })->limit(5)->get();

        return $recommendations->toArray();
    }

    /**
     * Get trending products
     */
    private function getTrendingProducts(): array
    {
        return Product::withCount(['orderItems' => function($query) {
            $query->where('created_at', '>=', Carbon::now()->subDays(7));
        }])->orderBy('order_items_count', 'desc')->limit(5)->get()->toArray();
    }

    /**
     * Get seasonal recommendations
     */
    private function getSeasonalRecommendations(): array
    {
        $currentMonth = Carbon::now()->format('F');
        return Product::where('is_seasonal', true)
                     ->whereJsonContains('seasonality->' . $currentMonth, 'high')
                     ->limit(5)
                     ->get()
                     ->toArray();
    }

    /**
     * Get high value customers
     */
    private function getHighValueCustomers(): array
    {
        return User::whereHas('orders')
                  ->withSum('orders', 'total_amount')
                  ->having('orders_sum_total_amount', '>', 500)
                  ->get()
                  ->toArray();
    }

    /**
     * Get frequent buyers
     */
    private function getFrequentBuyers(): array
    {
        return User::withCount(['orders' => function($query) {
            $query->where('created_at', '>=', Carbon::now()->subMonths(6));
        }])->having('orders_count', '>=', 3)->get()->toArray();
    }

    /**
     * Get at-risk customers
     */
    private function getAtRiskCustomers(): array
    {
        return User::whereHas('orders', function($query) {
            $query->where('created_at', '<=', Carbon::now()->subDays(60));
        })->whereDoesntHave('orders', function($query) {
            $query->where('created_at', '>=', Carbon::now()->subDays(60));
        })->get()->toArray();
    }

    /**
     * Get new customers
     */
    private function getNewCustomers(): array
    {
        return User::where('created_at', '>=', Carbon::now()->subDays(30))->get()->toArray();
    }

    /**
     * Get seasonal buyers
     */
    private function getSeasonalBuyers(): array
    {
        return User::whereHas('orders.items.product', function($query) {
            $query->where('is_seasonal', true);
        })->get()->toArray();
    }

    /**
     * Send SMS
     */
    private function sendSMS(User $user, string $template): array
    {
        // Mock SMS implementation
        Log::info("SMS sent to {$user->phone}: {$template}");
        return ['success' => true, 'type' => 'sms', 'template' => $template];
    }

    /**
     * Log integration activity
     */
    private function logActivity(string $action, array $data): void
    {
        IntegrationLog::create([
            'tenant_id' => $this->tenantId,
            'service' => 'marketing_automation',
            'action' => $action,
            'data' => $data,
            'status' => 'success',
            'created_at' => now()
        ]);
    }
}
