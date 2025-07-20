<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\Integrations\QuickBooksService;
use App\Models\IntegrationSetting;
use App\Models\User;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class IntegrationController extends Controller
{
    protected $quickBooksService;

    public function __construct(QuickBooksService $quickBooksService)
    {
        $this->quickBooksService = $quickBooksService;
    }

    /**
     * Get QuickBooks integration status
     */
    public function getQuickBooksStatus(): JsonResponse
    {
        try {
            $setting = IntegrationSetting::where('service', 'quickbooks')
                                        ->where('tenant_id', auth()->user()->tenant_id ?? 1)
                                        ->first();

            $connected = $setting && $setting->is_active;
            
            $status = [
                'connected' => $connected,
                'lastSync' => $setting?->last_sync_at,
                'companyName' => $setting ? $setting->getSetting('company_name') : null,
                'realmId' => $setting ? $setting->getSetting('realm_id') : null,
                'accessTokenExpiry' => $setting ? $setting->getSetting('access_token_expires_at') : null,
            ];

            $syncStats = [
                'customers' => [
                    'synced' => User::whereNotNull('quickbooks_customer_id')->count(),
                    'total' => User::count()
                ],
                'orders' => [
                    'synced' => Order::whereNotNull('quickbooks_invoice_id')->count(),
                    'total' => Order::count()
                ],
                'products' => [
                    'synced' => Product::whereNotNull('quickbooks_item_id')->count(),
                    'total' => Product::count()
                ]
            ];

            return response()->json([
                'status' => $status,
                'syncStats' => $syncStats
            ]);
        } catch (\Exception $e) {
            \Log::error('Error getting QuickBooks status: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to get status'], 500);
        }
    }

    /**
     * Initiate QuickBooks OAuth
     */
    public function initiateQuickBooksAuth(): JsonResponse
    {
        try {
            $authUrl = $this->quickBooksService->getAuthorizationUrl();
            
            return response()->json([
                'authUrl' => $authUrl
            ]);
        } catch (\Exception $e) {
            \Log::error('Error initiating QuickBooks auth: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to initiate authentication'], 500);
        }
    }

    /**
     * Disconnect QuickBooks integration
     */
    public function disconnectQuickBooks(): JsonResponse
    {
        try {
            $setting = IntegrationSetting::where('service', 'quickbooks')
                                        ->where('tenant_id', auth()->user()->tenant_id ?? 1)
                                        ->first();

            if ($setting) {
                $setting->update(['is_active' => false]);
                $setting->delete();
            }

            return response()->json(['message' => 'QuickBooks disconnected successfully']);
        } catch (\Exception $e) {
            \Log::error('Error disconnecting QuickBooks: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to disconnect'], 500);
        }
    }

    /**
     * Sync data with QuickBooks
     */
    public function syncQuickBooks(Request $request, $type): JsonResponse
    {
        try {
            $result = ['success' => false, 'message' => ''];

            switch ($type) {
                case 'customers':
                    $result = $this->syncCustomers();
                    break;
                case 'orders':
                    $result = $this->syncOrders();
                    break;
                case 'products':
                    $result = $this->syncProducts();
                    break;
                case 'all':
                    $customerResult = $this->syncCustomers();
                    $productResult = $this->syncProducts();
                    $orderResult = $this->syncOrders();
                    
                    $result = [
                        'success' => $customerResult['success'] && $productResult['success'] && $orderResult['success'],
                        'message' => 'All sync operations completed',
                        'details' => [
                            'customers' => $customerResult,
                            'products' => $productResult,
                            'orders' => $orderResult
                        ]
                    ];
                    break;
                default:
                    return response()->json(['error' => 'Invalid sync type'], 400);
            }

            // Update sync stats
            $syncStats = [
                'customers' => [
                    'synced' => User::whereNotNull('quickbooks_customer_id')->count(),
                    'total' => User::count()
                ],
                'orders' => [
                    'synced' => Order::whereNotNull('quickbooks_invoice_id')->count(),
                    'total' => Order::count()
                ],
                'products' => [
                    'synced' => Product::whereNotNull('quickbooks_item_id')->count(),
                    'total' => Product::count()
                ]
            ];

            return response()->json([
                'result' => $result,
                'syncStats' => $syncStats
            ]);
        } catch (\Exception $e) {
            \Log::error('Error syncing QuickBooks: ' . $e->getMessage());
            return response()->json(['error' => 'Sync failed'], 500);
        }
    }

    private function syncCustomers(): array
    {
        try {
            $users = User::whereNull('quickbooks_customer_id')->limit(10)->get();
            $synced = 0;

            foreach ($users as $user) {
                $result = $this->quickBooksService->createCustomer($user);
                if ($result['success']) {
                    $synced++;
                }
            }

            return [
                'success' => true,
                'message' => "Synced {$synced} customers",
                'synced' => $synced
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Customer sync failed: ' . $e->getMessage()
            ];
        }
    }

    private function syncProducts(): array
    {
        try {
            $products = Product::whereNull('quickbooks_item_id')->limit(10)->get();
            $synced = 0;

            foreach ($products as $product) {
                $result = $this->quickBooksService->createProduct($product);
                if ($result['success']) {
                    $synced++;
                }
            }

            return [
                'success' => true,
                'message' => "Synced {$synced} products",
                'synced' => $synced
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Product sync failed: ' . $e->getMessage()
            ];
        }
    }

    private function syncOrders(): array
    {
        try {
            $orders = Order::whereNull('quickbooks_invoice_id')->limit(10)->get();
            $synced = 0;

            foreach ($orders as $order) {
                $result = $this->quickBooksService->syncOrder($order);
                if ($result['success']) {
                    $synced++;
                }
            }

            return [
                'success' => true,
                'message' => "Synced {$synced} orders",
                'synced' => $synced
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Order sync failed: ' . $e->getMessage()
            ];
        }
    }
}
