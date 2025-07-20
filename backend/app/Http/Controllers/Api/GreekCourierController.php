<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Integrations\Shipping\GreekCourierService;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

/**
 * Greek Courier API Controller
 * Handles ELTA, ACS, Speedex, and Courier Center integrations
 */
class GreekCourierController extends Controller
{
    protected GreekCourierService $courierService;
    
    public function __construct(GreekCourierService $courierService)
    {
        $this->courierService = $courierService;
    }
    
    /**
     * Get available Greek courier providers
     */
    public function getProviders(): JsonResponse
    {
        try {
            $providers = $this->courierService->getAvailableProviders();
            $statistics = $this->courierService->getProviderStatistics();
            
            return response()->json([
                'success' => true,
                'providers' => $providers,
                'statistics' => $statistics
            ]);
            
        } catch (\Exception $e) {
            Log::error('Failed to get Greek courier providers: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'error' => 'Failed to retrieve providers'
            ], 500);
        }
    }
    
    /**
     * Calculate shipping rates from all providers
     */
    public function calculateRates(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'order_id' => 'required|exists:orders,id',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        try {
            $order = Order::with(['shippingAddress', 'orderItems.product'])->findOrFail($request->order_id);
            $rates = $this->courierService->calculateRatesFromAllProviders($order);
            
            return response()->json([
                'success' => true,
                'rates' => $rates,
                'order_id' => $order->id
            ]);
            
        } catch (\Exception $e) {
            Log::error('Failed to calculate Greek courier rates: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'error' => 'Failed to calculate shipping rates'
            ], 500);
        }
    }
    
    /**
     * Get best rate from all providers
     */
    public function getBestRate(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'order_id' => 'required|exists:orders,id',
            'sort_by' => 'sometimes|in:cost,delivery_time',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        try {
            $order = Order::with(['shippingAddress', 'orderItems.product'])->findOrFail($request->order_id);
            $criteria = ['sort_by' => $request->get('sort_by', 'cost')];
            $bestRate = $this->courierService->getBestRate($order, $criteria);
            
            if (!$bestRate) {
                return response()->json([
                    'success' => false,
                    'error' => 'No shipping rates available'
                ], 404);
            }
            
            return response()->json([
                'success' => true,
                'best_rate' => $bestRate,
                'order_id' => $order->id
            ]);
            
        } catch (\Exception $e) {
            Log::error('Failed to get best Greek courier rate: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'error' => 'Failed to get best rate'
            ], 500);
        }
    }
    
    /**
     * Create shipment with specified provider
     */
    public function createShipment(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'provider' => 'required|string|in:elta,acs,speedex,courier_center',
            'order_id' => 'required|exists:orders,id',
            'service_type' => 'sometimes|string',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        try {
            $order = Order::with(['shippingAddress', 'orderItems.product'])->findOrFail($request->order_id);
            
            $shipmentData = $this->prepareShipmentData($order, $request->get('service_type', 'standard'));
            $result = $this->courierService->createShipment($request->provider, $shipmentData);
            
            if ($result['success']) {
                // Update order with tracking information
                $order->update([
                    'tracking_number' => $result['tracking_number'],
                    'shipping_provider' => $request->provider,
                    'shipping_cost' => $result['cost'],
                    'status' => 'shipped'
                ]);
                
                Log::info("Shipment created successfully", [
                    'order_id' => $order->id,
                    'provider' => $request->provider,
                    'tracking_number' => $result['tracking_number']
                ]);
            }
            
            return response()->json($result);
            
        } catch (\Exception $e) {
            Log::error('Failed to create Greek courier shipment: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'error' => 'Failed to create shipment'
            ], 500);
        }
    }
    
    /**
     * Track shipment
     */
    public function trackShipment(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'tracking_number' => 'required|string',
            'provider' => 'sometimes|string|in:elta,acs,speedex,courier_center',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        try {
            $result = $this->courierService->trackShipment(
                $request->tracking_number,
                $request->get('provider')
            );
            
            return response()->json($result);
            
        } catch (\Exception $e) {
            Log::error('Failed to track Greek courier shipment: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'error' => 'Failed to track shipment'
            ], 500);
        }
    }
    
    /**
     * Cancel shipment
     */
    public function cancelShipment(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'tracking_number' => 'required|string',
            'provider' => 'required|string|in:elta,acs,speedex,courier_center',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        try {
            $provider = $this->courierService->getProvider($request->provider);
            
            if (!$provider) {
                return response()->json([
                    'success' => false,
                    'error' => 'Provider not available'
                ], 404);
            }
            
            $result = $provider->cancelShipment($request->tracking_number);
            
            if ($result['success'] && $result['cancelled']) {
                // Update order status
                $order = Order::where('tracking_number', $request->tracking_number)->first();
                if ($order) {
                    $order->update(['status' => 'cancelled']);
                }
                
                Log::info("Shipment cancelled successfully", [
                    'tracking_number' => $request->tracking_number,
                    'provider' => $request->provider
                ]);
            }
            
            return response()->json($result);
            
        } catch (\Exception $e) {
            Log::error('Failed to cancel Greek courier shipment: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'error' => 'Failed to cancel shipment'
            ], 500);
        }
    }
    
    /**
     * Validate Greek address
     */
    public function validateAddress(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'address_line_1' => 'required|string',
            'city' => 'required|string',
            'postal_code' => 'required|string',
            'address_line_2' => 'sometimes|string',
            'phone' => 'sometimes|string',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        try {
            $result = $this->courierService->validateGreekAddress($request->all());
            
            return response()->json($result);
            
        } catch (\Exception $e) {
            Log::error('Failed to validate Greek address: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'error' => 'Failed to validate address'
            ], 500);
        }
    }
    
    /**
     * Test provider connections
     */
    public function testConnections(): JsonResponse
    {
        try {
            $providers = $this->courierService->getAvailableProviders();
            $results = [];
            
            foreach ($providers as $providerKey) {
                $provider = $this->courierService->getProvider($providerKey);
                if ($provider) {
                    $results[$providerKey] = [
                        'name' => $provider->getDisplayName(),
                        'connected' => $provider->testConnection()
                    ];
                }
            }
            
            return response()->json([
                'success' => true,
                'connections' => $results
            ]);
            
        } catch (\Exception $e) {
            Log::error('Failed to test Greek courier connections: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'error' => 'Failed to test connections'
            ], 500);
        }
    }
    
    /**
     * Prepare shipment data from order
     */
    protected function prepareShipmentData(Order $order, string $serviceType = 'standard'): array
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
            'service_type' => $serviceType,
            'service_options' => [
                'signature_required' => $order->total_amount > 100,
                'insurance' => $order->total_amount > 50,
                'saturday_delivery' => false
            ]
        ];
    }
    
    /**
     * Calculate total order weight in grams
     */
    protected function calculateOrderWeight(Order $order): int
    {
        $totalWeight = 0;
        
        foreach ($order->orderItems as $item) {
            $productWeight = $item->product->weight_grams ?? 500; // Default 500g
            $totalWeight += $productWeight * $item->quantity;
        }
        
        return max($totalWeight, 100); // Minimum 100g
    }
    
    /**
     * Generate package description from order items
     */
    protected function generatePackageDescription(Order $order): string
    {
        $items = $order->orderItems->take(3)->map(function ($item) {
            return $item->product->name;
        })->toArray();
        
        $description = implode(', ', $items);
        
        if ($order->orderItems->count() > 3) {
            $description .= ' και άλλα προϊόντα';
        }
        
        return $description;
    }
}
