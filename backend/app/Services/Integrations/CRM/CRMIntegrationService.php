<?php

namespace App\Services\Integrations\CRM;

use App\Models\User;
use App\Models\Order;
use App\Models\Producer;
use App\Models\IntegrationSetting;
use App\Models\IntegrationLog;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class CRMIntegrationService
{
    protected $tenantId;
    protected $supportedCRMs = ['hubspot', 'salesforce', 'pipedrive'];

    public function __construct()
    {
        $this->tenantId = auth()->user()->tenant_id ?? 1;
    }

    /**
     * Sync customer data to CRM
     */
    public function syncCustomerToCRM(User $user, string $crmSystem = 'hubspot'): array
    {
        try {
            $crmConfig = $this->getCRMConfig($crmSystem);
            if (!$crmConfig) {
                throw new \Exception("CRM {$crmSystem} not configured");
            }

            $customerData = $this->prepareCustomerData($user);
            $response = $this->callCRMAPI($crmSystem, 'create_contact', $customerData);

            if ($response['success']) {
                // Update user with CRM ID
                $user->update([
                    $crmSystem . '_contact_id' => $response['contact_id'],
                    $crmSystem . '_synced_at' => now()
                ]);

                $this->logActivity('customer_synced', [
                    'user_id' => $user->id,
                    'crm_system' => $crmSystem,
                    'crm_contact_id' => $response['contact_id']
                ]);

                return [
                    'success' => true,
                    'crm_contact_id' => $response['contact_id'],
                    'crm_system' => $crmSystem
                ];
            }

            throw new \Exception($response['error'] ?? 'Customer sync failed');
        } catch (\Exception $e) {
            Log::error('CRM customer sync failed: ' . $e->getMessage());
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Sync producer data to CRM as company/account
     */
    public function syncProducerToCRM(Producer $producer, string $crmSystem = 'hubspot'): array
    {
        try {
            $crmConfig = $this->getCRMConfig($crmSystem);
            if (!$crmConfig) {
                throw new \Exception("CRM {$crmSystem} not configured");
            }

            $companyData = $this->prepareProducerData($producer);
            $response = $this->callCRMAPI($crmSystem, 'create_company', $companyData);

            if ($response['success']) {
                // Update producer with CRM ID
                $producer->update([
                    $crmSystem . '_company_id' => $response['company_id'],
                    $crmSystem . '_synced_at' => now()
                ]);

                // Also sync the producer's user as a contact
                if ($producer->user) {
                    $contactResult = $this->syncCustomerToCRM($producer->user, $crmSystem);
                    if ($contactResult['success']) {
                        // Associate contact with company
                        $this->associateContactWithCompany(
                            $crmSystem,
                            $contactResult['crm_contact_id'],
                            $response['company_id']
                        );
                    }
                }

                $this->logActivity('producer_synced', [
                    'producer_id' => $producer->id,
                    'crm_system' => $crmSystem,
                    'crm_company_id' => $response['company_id']
                ]);

                return [
                    'success' => true,
                    'crm_company_id' => $response['company_id'],
                    'crm_system' => $crmSystem
                ];
            }

            throw new \Exception($response['error'] ?? 'Producer sync failed');
        } catch (\Exception $e) {
            Log::error('CRM producer sync failed: ' . $e->getMessage());
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Sync order data to CRM as deal/opportunity
     */
    public function syncOrderToCRM(Order $order, string $crmSystem = 'hubspot'): array
    {
        try {
            $crmConfig = $this->getCRMConfig($crmSystem);
            if (!$crmConfig) {
                throw new \Exception("CRM {$crmSystem} not configured");
            }

            // Ensure customer is synced first
            $customerCRMId = $order->user->{$crmSystem . '_contact_id'};
            if (!$customerCRMId) {
                $customerSync = $this->syncCustomerToCRM($order->user, $crmSystem);
                if (!$customerSync['success']) {
                    throw new \Exception('Failed to sync customer before order');
                }
                $customerCRMId = $customerSync['crm_contact_id'];
            }

            $dealData = $this->prepareOrderData($order, $customerCRMId);
            $response = $this->callCRMAPI($crmSystem, 'create_deal', $dealData);

            if ($response['success']) {
                // Update order with CRM ID
                $order->update([
                    $crmSystem . '_deal_id' => $response['deal_id'],
                    $crmSystem . '_synced_at' => now()
                ]);

                $this->logActivity('order_synced', [
                    'order_id' => $order->id,
                    'crm_system' => $crmSystem,
                    'crm_deal_id' => $response['deal_id'],
                    'order_value' => $order->total_amount
                ]);

                return [
                    'success' => true,
                    'crm_deal_id' => $response['deal_id'],
                    'crm_system' => $crmSystem
                ];
            }

            throw new \Exception($response['error'] ?? 'Order sync failed');
        } catch (\Exception $e) {
            Log::error('CRM order sync failed: ' . $e->getMessage());
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Update CRM contact with latest customer activity
     */
    public function updateCustomerActivity(User $user, string $activity, array $data = []): array
    {
        try {
            $results = [];
            
            foreach ($this->supportedCRMs as $crmSystem) {
                $crmContactId = $user->{$crmSystem . '_contact_id'};
                if ($crmContactId) {
                    $activityData = $this->prepareActivityData($activity, $data);
                    $response = $this->callCRMAPI($crmSystem, 'log_activity', [
                        'contact_id' => $crmContactId,
                        'activity' => $activityData
                    ]);
                    
                    $results[$crmSystem] = $response;
                }
            }

            $this->logActivity('activity_logged', [
                'user_id' => $user->id,
                'activity_type' => $activity,
                'crm_results' => $results
            ]);

            return [
                'success' => true,
                'activity' => $activity,
                'crm_results' => $results
            ];
        } catch (\Exception $e) {
            Log::error('CRM activity update failed: ' . $e->getMessage());
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Bulk sync customers to CRM
     */
    public function bulkSyncCustomers(string $crmSystem = 'hubspot', int $limit = 100): array
    {
        try {
            $unsyncedUsers = User::whereNull($crmSystem . '_contact_id')
                                ->where('role', 'consumer')
                                ->limit($limit)
                                ->get();

            $results = [];
            $successCount = 0;
            $failureCount = 0;

            foreach ($unsyncedUsers as $user) {
                $result = $this->syncCustomerToCRM($user, $crmSystem);
                $results[] = array_merge(['user_id' => $user->id], $result);
                
                if ($result['success']) {
                    $successCount++;
                } else {
                    $failureCount++;
                }
            }

            $this->logActivity('bulk_customer_sync', [
                'crm_system' => $crmSystem,
                'total_processed' => count($unsyncedUsers),
                'success_count' => $successCount,
                'failure_count' => $failureCount
            ]);

            return [
                'success' => true,
                'summary' => [
                    'total_processed' => count($unsyncedUsers),
                    'successful' => $successCount,
                    'failed' => $failureCount
                ],
                'results' => $results
            ];
        } catch (\Exception $e) {
            Log::error('Bulk customer sync failed: ' . $e->getMessage());
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Generate CRM analytics and insights
     */
    public function getCRMAnalytics(): array
    {
        try {
            $analytics = [];

            foreach ($this->supportedCRMs as $crmSystem) {
                $syncedCustomers = User::whereNotNull($crmSystem . '_contact_id')->count();
                $syncedProducers = Producer::whereNotNull($crmSystem . '_company_id')->count();
                $syncedOrders = Order::whereNotNull($crmSystem . '_deal_id')->count();
                
                $totalCustomers = User::where('role', 'consumer')->count();
                $totalProducers = Producer::count();
                $totalOrders = Order::count();

                $analytics[$crmSystem] = [
                    'customers' => [
                        'synced' => $syncedCustomers,
                        'total' => $totalCustomers,
                        'sync_percentage' => $totalCustomers > 0 ? round(($syncedCustomers / $totalCustomers) * 100, 2) : 0
                    ],
                    'producers' => [
                        'synced' => $syncedProducers,
                        'total' => $totalProducers,
                        'sync_percentage' => $totalProducers > 0 ? round(($syncedProducers / $totalProducers) * 100, 2) : 0
                    ],
                    'orders' => [
                        'synced' => $syncedOrders,
                        'total' => $totalOrders,
                        'sync_percentage' => $totalOrders > 0 ? round(($syncedOrders / $totalOrders) * 100, 2) : 0
                    ]
                ];
            }

            return [
                'success' => true,
                'analytics' => $analytics,
                'generated_at' => now()->toISOString()
            ];
        } catch (\Exception $e) {
            Log::error('CRM analytics failed: ' . $e->getMessage());
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Prepare customer data for CRM
     */
    private function prepareCustomerData(User $user): array
    {
        $lastOrder = $user->orders()->latest()->first();
        
        return [
            'email' => $user->email,
            'first_name' => explode(' ', $user->name)[0] ?? '',
            'last_name' => implode(' ', array_slice(explode(' ', $user->name), 1)) ?: '',
            'phone' => $user->phone ?? '',
            'created_date' => $user->created_at->toISOString(),
            'last_activity_date' => $user->updated_at->toISOString(),
            'total_orders' => $user->orders()->count(),
            'total_spent' => $user->orders()->sum('total_amount'),
            'last_order_date' => $lastOrder?->created_at->toISOString(),
            'customer_segment' => $this->determineCustomerSegment($user),
            'lifecycle_stage' => $this->determineLifecycleStage($user)
        ];
    }

    /**
     * Prepare producer data for CRM
     */
    private function prepareProducerData(Producer $producer): array
    {
        return [
            'name' => $producer->business_name,
            'description' => $producer->description ?? '',
            'website' => $producer->website ?? '',
            'phone' => $producer->phone ?? '',
            'address' => $producer->address ?? '',
            'city' => $producer->city ?? '',
            'postal_code' => $producer->postal_code ?? '',
            'created_date' => $producer->created_at->toISOString(),
            'verification_status' => $producer->verification_status,
            'total_products' => $producer->products()->count(),
            'total_orders' => $producer->products()->withCount('orderItems')->get()->sum('order_items_count'),
            'producer_type' => $producer->producer_type ?? 'standard'
        ];
    }

    /**
     * Prepare order data for CRM
     */
    private function prepareOrderData(Order $order, string $contactId): array
    {
        return [
            'contact_id' => $contactId,
            'deal_name' => "Order #{$order->id} - {$order->user->name}",
            'amount' => $order->total_amount,
            'currency' => 'EUR',
            'stage' => $this->mapOrderStatusToCRMStage($order->status),
            'close_date' => $order->created_at->toISOString(),
            'order_id' => $order->id,
            'order_status' => $order->status,
            'payment_method' => $order->payment_method,
            'shipping_cost' => $order->shipping_cost,
            'items_count' => $order->items()->count(),
            'producer_names' => $order->items()->with('product.producer')->get()
                                    ->pluck('product.producer.business_name')->unique()->implode(', ')
        ];
    }

    /**
     * Prepare activity data for CRM
     */
    private function prepareActivityData(string $activity, array $data): array
    {
        $activityMap = [
            'product_viewed' => 'Product View',
            'cart_updated' => 'Cart Updated',
            'order_placed' => 'Order Placed',
            'review_submitted' => 'Review Submitted',
            'support_ticket' => 'Support Contact'
        ];

        return [
            'activity_type' => $activityMap[$activity] ?? $activity,
            'activity_date' => now()->toISOString(),
            'description' => $this->generateActivityDescription($activity, $data),
            'properties' => $data
        ];
    }

    /**
     * Generate activity description
     */
    private function generateActivityDescription(string $activity, array $data): string
    {
        switch ($activity) {
            case 'product_viewed':
                return "Viewed product: {$data['product_name']} (ID: {$data['product_id']})";
            case 'cart_updated':
                return "Updated cart - {$data['action']} {$data['quantity']} x {$data['product_name']}";
            case 'order_placed':
                return "Placed order #{$data['order_id']} worth €{$data['total_amount']}";
            case 'review_submitted':
                return "Submitted {$data['rating']}-star review for {$data['product_name']}";
            default:
                return "Customer activity: {$activity}";
        }
    }

    /**
     * Determine customer segment
     */
    private function determineCustomerSegment(User $user): string
    {
        $totalSpent = $user->orders()->sum('total_amount');
        $orderCount = $user->orders()->count();

        if ($totalSpent > 500 && $orderCount >= 5) {
            return 'VIP';
        } elseif ($totalSpent > 200 && $orderCount >= 3) {
            return 'Loyal';
        } elseif ($orderCount >= 2) {
            return 'Regular';
        } elseif ($orderCount === 1) {
            return 'New Customer';
        } else {
            return 'Prospect';
        }
    }

    /**
     * Determine lifecycle stage
     */
    private function determineLifecycleStage(User $user): string
    {
        $orderCount = $user->orders()->count();
        $lastOrderDate = $user->orders()->latest()->first()?->created_at;

        if ($orderCount === 0) {
            return 'lead';
        } elseif ($orderCount === 1) {
            return 'customer';
        } elseif ($lastOrderDate && $lastOrderDate->diffInDays(now()) > 90) {
            return 'inactive';
        } else {
            return 'active_customer';
        }
    }

    /**
     * Map order status to CRM deal stage
     */
    private function mapOrderStatusToCRMStage(string $orderStatus): string
    {
        $stageMap = [
            'pending' => 'proposal',
            'processing' => 'negotiation',
            'shipped' => 'closed_won',
            'delivered' => 'closed_won',
            'cancelled' => 'closed_lost',
            'refunded' => 'closed_lost'
        ];

        return $stageMap[$orderStatus] ?? 'proposal';
    }

    /**
     * Call CRM API
     */
    private function callCRMAPI(string $crmSystem, string $action, array $data): array
    {
        try {
            $config = $this->getCRMConfig($crmSystem);
            $endpoint = $config['endpoints'][$action] ?? null;
            
            if (!$endpoint) {
                throw new \Exception("Action {$action} not supported for CRM {$crmSystem}");
            }

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $config['api_key'],
                'Content-Type' => 'application/json'
            ])->post($config['base_url'] . $endpoint, $data);

            if ($response->successful()) {
                return ['success' => true] + $response->json();
            }

            throw new \Exception('CRM API call failed: ' . $response->body());
        } catch (\Exception $e) {
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Get CRM configuration
     */
    private function getCRMConfig(string $crmSystem): ?array
    {
        $setting = IntegrationSetting::where('service', "crm_{$crmSystem}")
                                    ->where('tenant_id', $this->tenantId)
                                    ->where('is_active', true)
                                    ->first();

        return $setting ? $setting->settings : null;
    }

    /**
     * Associate contact with company in CRM
     */
    private function associateContactWithCompany(string $crmSystem, string $contactId, string $companyId): array
    {
        return $this->callCRMAPI($crmSystem, 'associate_contact_company', [
            'contact_id' => $contactId,
            'company_id' => $companyId
        ]);
    }

    /**
     * Log integration activity
     */
    private function logActivity(string $action, array $data): void
    {
        IntegrationLog::create([
            'tenant_id' => $this->tenantId,
            'service' => 'crm_integration',
            'action' => $action,
            'data' => $data,
            'status' => 'success',
            'created_at' => now()
        ]);
    }
}
