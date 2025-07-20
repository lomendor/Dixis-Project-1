<?php

namespace App\Services\Integrations\Shipping;

use App\Models\Order;
use App\Models\IntegrationSetting;
use App\Models\IntegrationLog;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class ShippingAutomationService
{
    protected $tenantId;
    protected $carriers = ['elta', 'acs', 'speedex', 'courier_center'];

    public function __construct()
    {
        $this->tenantId = auth()->user()->tenant_id ?? 1;
    }

    /**
     * Automated shipping label generation
     */
    public function generateShippingLabel(Order $order, string $carrier = 'acs'): array
    {
        try {
            $carrierConfig = $this->getCarrierConfig($carrier);
            if (!$carrierConfig) {
                throw new \Exception("Carrier {$carrier} not configured");
            }

            $labelData = $this->prepareShippingData($order);
            $response = $this->callCarrierAPI($carrier, 'create_shipment', $labelData);

            if ($response['success']) {
                // Update order with tracking information
                $order->update([
                    'tracking_number' => $response['tracking_number'],
                    'shipping_carrier' => $carrier,
                    'shipping_label_url' => $response['label_url'],
                    'status' => 'shipped'
                ]);

                $this->logActivity('label_generated', [
                    'order_id' => $order->id,
                    'carrier' => $carrier,
                    'tracking_number' => $response['tracking_number']
                ]);

                return [
                    'success' => true,
                    'tracking_number' => $response['tracking_number'],
                    'label_url' => $response['label_url'],
                    'estimated_delivery' => $response['estimated_delivery'] ?? null
                ];
            }

            throw new \Exception($response['error'] ?? 'Label generation failed');
        } catch (\Exception $e) {
            Log::error('Shipping label generation failed: ' . $e->getMessage());
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Automated tracking updates
     */
    public function updateTrackingStatus(Order $order): array
    {
        try {
            if (!$order->tracking_number || !$order->shipping_carrier) {
                throw new \Exception('Order missing tracking information');
            }

            $response = $this->callCarrierAPI($order->shipping_carrier, 'track_shipment', [
                'tracking_number' => $order->tracking_number
            ]);

            if ($response['success']) {
                $trackingData = $response['tracking_data'];
                
                // Update order status based on tracking
                $newStatus = $this->mapCarrierStatusToOrderStatus($trackingData['status']);
                if ($newStatus && $newStatus !== $order->status) {
                    $order->update(['status' => $newStatus]);
                    
                    // Trigger customer notification
                    $this->notifyCustomerOfStatusChange($order, $newStatus, $trackingData);
                }

                $this->logActivity('tracking_updated', [
                    'order_id' => $order->id,
                    'tracking_number' => $order->tracking_number,
                    'status' => $trackingData['status'],
                    'location' => $trackingData['location'] ?? null
                ]);

                return [
                    'success' => true,
                    'tracking_data' => $trackingData,
                    'order_status' => $order->status
                ];
            }

            throw new \Exception($response['error'] ?? 'Tracking update failed');
        } catch (\Exception $e) {
            Log::error('Tracking update failed: ' . $e->getMessage());
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Automated carrier selection based on destination and package
     */
    public function selectOptimalCarrier(Order $order): array
    {
        try {
            $destination = $order->shippingAddress;
            $packageWeight = $this->calculateOrderWeight($order);
            $packageValue = $order->total_amount;

            $carrierQuotes = [];
            foreach ($this->carriers as $carrier) {
                $quote = $this->getCarrierQuote($carrier, $destination, $packageWeight, $packageValue);
                if ($quote['success']) {
                    $carrierQuotes[] = [
                        'carrier' => $carrier,
                        'cost' => $quote['cost'],
                        'delivery_time' => $quote['delivery_time'],
                        'reliability_score' => $this->getCarrierReliabilityScore($carrier),
                        'total_score' => $this->calculateCarrierScore($quote, $carrier)
                    ];
                }
            }

            if (empty($carrierQuotes)) {
                throw new \Exception('No carriers available for this destination');
            }

            // Sort by total score (cost + delivery time + reliability)
            usort($carrierQuotes, fn($a, $b) => $b['total_score'] <=> $a['total_score']);
            $optimalCarrier = $carrierQuotes[0];

            $this->logActivity('carrier_selected', [
                'order_id' => $order->id,
                'selected_carrier' => $optimalCarrier['carrier'],
                'cost' => $optimalCarrier['cost'],
                'alternatives_count' => count($carrierQuotes) - 1
            ]);

            return [
                'success' => true,
                'recommended_carrier' => $optimalCarrier,
                'all_options' => $carrierQuotes
            ];
        } catch (\Exception $e) {
            Log::error('Carrier selection failed: ' . $e->getMessage());
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Bulk shipping operations for multiple orders
     */
    public function processBulkShipping(array $orderIds, string $carrier = 'acs'): array
    {
        try {
            $results = [];
            $successCount = 0;
            $failureCount = 0;

            foreach ($orderIds as $orderId) {
                $order = Order::find($orderId);
                if (!$order) {
                    $results[] = ['order_id' => $orderId, 'success' => false, 'error' => 'Order not found'];
                    $failureCount++;
                    continue;
                }

                $result = $this->generateShippingLabel($order, $carrier);
                $results[] = array_merge(['order_id' => $orderId], $result);
                
                if ($result['success']) {
                    $successCount++;
                } else {
                    $failureCount++;
                }
            }

            $this->logActivity('bulk_shipping', [
                'total_orders' => count($orderIds),
                'success_count' => $successCount,
                'failure_count' => $failureCount,
                'carrier' => $carrier
            ]);

            return [
                'success' => true,
                'summary' => [
                    'total_processed' => count($orderIds),
                    'successful' => $successCount,
                    'failed' => $failureCount
                ],
                'results' => $results
            ];
        } catch (\Exception $e) {
            Log::error('Bulk shipping failed: ' . $e->getMessage());
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Prepare shipping data for carrier API
     */
    private function prepareShippingData(Order $order): array
    {
        $shippingAddress = $order->shippingAddress;
        
        return [
            'order_id' => $order->id,
            'recipient' => [
                'name' => $shippingAddress->name,
                'address' => $shippingAddress->address_line_1,
                'address2' => $shippingAddress->address_line_2,
                'city' => $shippingAddress->city,
                'postal_code' => $shippingAddress->postal_code,
                'country' => $shippingAddress->country ?? 'GR',
                'phone' => $shippingAddress->phone
            ],
            'package' => [
                'weight' => $this->calculateOrderWeight($order),
                'value' => $order->total_amount,
                'description' => $this->generatePackageDescription($order),
                'cod_amount' => $order->payment_method === 'cod' ? $order->total_amount : 0
            ],
            'service_options' => [
                'signature_required' => $order->total_amount > 100,
                'insurance' => $order->total_amount > 50,
                'saturday_delivery' => false
            ]
        ];
    }

    /**
     * Call carrier API
     */
    private function callCarrierAPI(string $carrier, string $action, array $data): array
    {
        try {
            $config = $this->getCarrierConfig($carrier);
            $endpoint = $config['endpoints'][$action] ?? null;
            
            if (!$endpoint) {
                throw new \Exception("Action {$action} not supported for carrier {$carrier}");
            }

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $config['api_key'],
                'Content-Type' => 'application/json'
            ])->post($config['base_url'] . $endpoint, $data);

            if ($response->successful()) {
                return ['success' => true] + $response->json();
            }

            throw new \Exception('API call failed: ' . $response->body());
        } catch (\Exception $e) {
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Get carrier configuration
     */
    private function getCarrierConfig(string $carrier): ?array
    {
        $setting = IntegrationSetting::where('service', "shipping_{$carrier}")
                                    ->where('tenant_id', $this->tenantId)
                                    ->where('is_active', true)
                                    ->first();

        return $setting ? $setting->settings : null;
    }

    /**
     * Calculate order weight
     */
    private function calculateOrderWeight(Order $order): float
    {
        $totalWeight = 0;
        foreach ($order->items as $item) {
            $productWeight = $item->product->weight_grams ?? 500; // Default 500g
            $totalWeight += ($productWeight * $item->quantity);
        }
        
        return $totalWeight / 1000; // Convert to kg
    }

    /**
     * Generate package description
     */
    private function generatePackageDescription(Order $order): string
    {
        $itemCount = $order->items->count();
        $firstItem = $order->items->first();
        
        if ($itemCount === 1) {
            return $firstItem->product->name;
        }
        
        return $firstItem->product->name . " και {$itemCount} άλλα προϊόντα";
    }

    /**
     * Map carrier status to order status
     */
    private function mapCarrierStatusToOrderStatus(string $carrierStatus): ?string
    {
        $statusMap = [
            'picked_up' => 'processing',
            'in_transit' => 'shipped',
            'out_for_delivery' => 'shipped',
            'delivered' => 'delivered',
            'failed_delivery' => 'shipped',
            'returned' => 'cancelled'
        ];

        return $statusMap[$carrierStatus] ?? null;
    }

    /**
     * Get carrier reliability score
     */
    private function getCarrierReliabilityScore(string $carrier): float
    {
        // This would typically be calculated from historical data
        $scores = [
            'acs' => 8.5,
            'elta' => 7.0,
            'speedex' => 8.0,
            'courier_center' => 7.5
        ];

        return $scores[$carrier] ?? 5.0;
    }

    /**
     * Calculate carrier total score
     */
    private function calculateCarrierScore(array $quote, string $carrier): float
    {
        $costScore = 10 - ($quote['cost'] / 10); // Lower cost = higher score
        $speedScore = 10 - $quote['delivery_time']; // Faster = higher score
        $reliabilityScore = $this->getCarrierReliabilityScore($carrier);
        
        return ($costScore * 0.4) + ($speedScore * 0.3) + ($reliabilityScore * 0.3);
    }

    /**
     * Get carrier quote
     */
    private function getCarrierQuote(string $carrier, $destination, float $weight, float $value): array
    {
        // Mock implementation - would call actual carrier APIs
        $baseCosts = ['acs' => 5.0, 'elta' => 3.5, 'speedex' => 4.5, 'courier_center' => 4.0];
        $deliveryTimes = ['acs' => 2, 'elta' => 4, 'speedex' => 3, 'courier_center' => 3];
        
        $cost = $baseCosts[$carrier] + ($weight * 0.5) + ($value > 100 ? 2 : 0);
        
        return [
            'success' => true,
            'cost' => $cost,
            'delivery_time' => $deliveryTimes[$carrier]
        ];
    }

    /**
     * Notify customer of status change
     */
    private function notifyCustomerOfStatusChange(Order $order, string $newStatus, array $trackingData): void
    {
        // TODO: Implement notification system
        Log::info("Order {$order->id} status changed to {$newStatus}");
    }

    /**
     * Log integration activity
     */
    private function logActivity(string $action, array $data): void
    {
        IntegrationLog::create([
            'tenant_id' => $this->tenantId,
            'service' => 'shipping_automation',
            'action' => $action,
            'data' => $data,
            'status' => 'success',
            'created_at' => now()
        ]);
    }
}
