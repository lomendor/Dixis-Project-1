# 🚚 MULTI-CARRIER SHIPPING INTEGRATION - PART 1: CORE SERVICES

## 🎯 TASK 5 EXECUTION - GREEK SHIPPING CARRIERS

### **1. Shipping Provider Service Foundation**

**ShippingProviderService.php:**
```php
<?php

namespace App\Services\Integrations\Logistics;

use App\Models\Order;
use App\Models\Shipment;
use App\Models\ShippingRate;
use App\Services\Integrations\BaseIntegrationService;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class ShippingProviderService extends BaseIntegrationService
{
    private array $providers = [];
    
    public function __construct()
    {
        parent::__construct();
        $this->initializeProviders();
    }
    
    protected function getServiceConfig(): array
    {
        return config('integrations.shipping');
    }
    
    private function initializeProviders(): void
    {
        $providers = config('integrations.shipping.providers', []);
        
        foreach ($providers as $name => $config) {
            if ($config['enabled'] ?? false) {
                $className = "App\\Services\\Shipping\\Providers\\{$name}Provider";
                if (class_exists($className)) {
                    $this->providers[$name] = app($className);
                }
            }
        }
        
        Log::info('Shipping providers initialized', [
            'providers' => array_keys($this->providers)
        ]);
    }
    
    /**
     * Calculate shipping rates from all providers
     */
    public function calculateRates(Order $order): array
    {
        try {
            $rates = [];
            $errors = [];
            
            foreach ($this->providers as $name => $provider) {
                try {
                    $rate = $provider->calculateRate($order);
                    
                    if ($rate && isset($rate['cost'])) {
                        $rates[$name] = [
                            'provider' => $name,
                            'service_name' => $rate['service_name'] ?? 'Standard',
                            'cost' => (float) $rate['cost'],
                            'delivery_time' => $rate['delivery_time'] ?? 'Unknown',
                            'delivery_date' => $rate['delivery_date'] ?? null,
                            'currency' => $rate['currency'] ?? 'EUR',
                            'additional_info' => $rate['additional_info'] ?? []
                        ];
                        
                        Log::debug('Rate calculated successfully', [
                            'provider' => $name,
                            'order_id' => $order->id,
                            'cost' => $rate['cost']
                        ]);
                    }
                    
                } catch (\Exception $e) {
                    $errors[$name] = $e->getMessage();
                    
                    Log::warning('Rate calculation failed', [
                        'provider' => $name,
                        'order_id' => $order->id,
                        'error' => $e->getMessage()
                    ]);
                }
            }
            
            // Sort by cost (cheapest first)
            uasort($rates, function ($a, $b) {
                return $a['cost'] <=> $b['cost'];
            });
            
            return [
                'success' => !empty($rates),
                'rates' => $rates,
                'errors' => $errors,
                'order_id' => $order->id,
                'calculated_at' => now()->toISOString()
            ];
            
        } catch (\Exception $e) {
            Log::error('Rate calculation failed', [
                'order_id' => $order->id,
                'error' => $e->getMessage()
            ]);
            
            throw new \Exception('Failed to calculate shipping rates: ' . $e->getMessage());
        }
    }
    
    /**
     * Create shipment with selected provider
     */
    public function createShipment(Order $order, string $provider, array $options = []): Shipment
    {
        try {
            if (!isset($this->providers[$provider])) {
                throw new \Exception("Unknown shipping provider: {$provider}");
            }
            
            $providerService = $this->providers[$provider];
            
            // Prepare shipment data
            $shipmentData = $this->prepareShipmentData($order, $options);
            
            // Create shipment with provider
            $response = $providerService->createShipment($shipmentData);
            
            if (!$response || !isset($response['tracking_number'])) {
                throw new \Exception('Invalid response from shipping provider');
            }
            
            // Store shipment in database
            $shipment = Shipment::create([
                'order_id' => $order->id,
                'provider' => $provider,
                'tracking_number' => $response['tracking_number'],
                'label_url' => $response['label_url'] ?? null,
                'status' => 'created',
                'cost' => $response['cost'] ?? 0,
                'service_type' => $response['service_type'] ?? 'standard',
                'estimated_delivery' => $response['estimated_delivery'] ?? null,
                'provider_reference' => $response['provider_reference'] ?? null,
                'metadata' => json_encode($response)
            ]);
            
            // Update order shipping info
            $order->update([
                'shipping_provider' => $provider,
                'tracking_number' => $response['tracking_number'],
                'shipping_status' => 'shipped'
            ]);
            
            Log::info('Shipment created successfully', [
                'order_id' => $order->id,
                'provider' => $provider,
                'tracking_number' => $response['tracking_number'],
                'shipment_id' => $shipment->id
            ]);
            
            return $shipment;
            
        } catch (\Exception $e) {
            Log::error('Shipment creation failed', [
                'order_id' => $order->id,
                'provider' => $provider,
                'error' => $e->getMessage()
            ]);
            
            throw new \Exception("Failed to create shipment: {$e->getMessage()}");
        }
    }
    
    /**
     * Track shipment status
     */
    public function trackShipment(Shipment $shipment): array
    {
        try {
            if (!isset($this->providers[$shipment->provider])) {
                throw new \Exception("Provider {$shipment->provider} not available");
            }
            
            $provider = $this->providers[$shipment->provider];
            $trackingInfo = $provider->getTrackingStatus($shipment->tracking_number);
            
            // Update shipment status if changed
            if (isset($trackingInfo['status']) && $trackingInfo['status'] !== $shipment->status) {
                $shipment->update([
                    'status' => $trackingInfo['status'],
                    'last_tracked_at' => now()
                ]);
                
                // Update order status if delivered
                if ($trackingInfo['status'] === 'delivered') {
                    $shipment->order->update(['shipping_status' => 'delivered']);
                }
            }
            
            return [
                'success' => true,
                'tracking_number' => $shipment->tracking_number,
                'status' => $trackingInfo['status'] ?? 'unknown',
                'location' => $trackingInfo['location'] ?? null,
                'estimated_delivery' => $trackingInfo['estimated_delivery'] ?? null,
                'events' => $trackingInfo['events'] ?? [],
                'last_update' => $trackingInfo['last_update'] ?? null
            ];
            
        } catch (\Exception $e) {
            Log::error('Shipment tracking failed', [
                'shipment_id' => $shipment->id,
                'tracking_number' => $shipment->tracking_number,
                'error' => $e->getMessage()
            ]);
            
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }
    
    /**
     * Get available providers
     */
    public function getAvailableProviders(): array
    {
        return array_map(function ($provider, $name) {
            return [
                'name' => $name,
                'display_name' => $provider->getDisplayName(),
                'supported_services' => $provider->getSupportedServices(),
                'coverage_areas' => $provider->getCoverageAreas(),
                'features' => $provider->getFeatures()
            ];
        }, $this->providers, array_keys($this->providers));
    }
    
    /**
     * Validate shipping address
     */
    public function validateAddress(array $address): array
    {
        try {
            // Basic validation
            $required = ['address', 'city', 'postal_code'];
            $missing = [];
            
            foreach ($required as $field) {
                if (empty($address[$field])) {
                    $missing[] = $field;
                }
            }
            
            if (!empty($missing)) {
                return [
                    'valid' => false,
                    'errors' => ['Missing required fields: ' . implode(', ', $missing)]
                ];
            }
            
            // Greek postal code validation
            if (!preg_match('/^\d{5}$/', $address['postal_code'])) {
                return [
                    'valid' => false,
                    'errors' => ['Invalid Greek postal code format']
                ];
            }
            
            // Try to validate with providers
            foreach ($this->providers as $name => $provider) {
                try {
                    if (method_exists($provider, 'validateAddress')) {
                        $result = $provider->validateAddress($address);
                        if (isset($result['valid']) && $result['valid']) {
                            return $result;
                        }
                    }
                } catch (\Exception $e) {
                    Log::debug('Address validation failed for provider', [
                        'provider' => $name,
                        'error' => $e->getMessage()
                    ]);
                }
            }
            
            return [
                'valid' => true,
                'normalized_address' => $address
            ];
            
        } catch (\Exception $e) {
            Log::error('Address validation failed', [
                'address' => $address,
                'error' => $e->getMessage()
            ]);
            
            return [
                'valid' => false,
                'errors' => ['Validation failed: ' . $e->getMessage()]
            ];
        }
    }
    
    private function prepareShipmentData(Order $order, array $options): array
    {
        return [
            'order_id' => $order->id,
            'order_number' => $order->order_number,
            'sender' => [
                'name' => config('app.name'),
                'company' => config('company.name', 'Dixis Fresh'),
                'address' => config('company.address'),
                'city' => config('company.city'),
                'postal_code' => config('company.postal_code'),
                'phone' => config('company.phone'),
                'email' => config('company.email')
            ],
            'recipient' => [
                'name' => $order->shipping_name ?: $order->customer->name,
                'company' => $order->shipping_company,
                'address' => $order->shipping_address,
                'city' => $order->shipping_city,
                'postal_code' => $order->shipping_postal_code,
                'phone' => $order->shipping_phone ?: $order->customer->phone,
                'email' => $order->customer->email
            ],
            'package' => [
                'weight' => $order->total_weight ?: 1.0,
                'dimensions' => $order->package_dimensions ?: ['length' => 30, 'width' => 20, 'height' => 10],
                'declared_value' => $order->total_amount,
                'contents' => $order->items->pluck('product.name')->implode(', ')
            ],
            'service_options' => array_merge([
                'insurance' => $options['insurance'] ?? false,
                'signature_required' => $options['signature_required'] ?? false,
                'saturday_delivery' => $options['saturday_delivery'] ?? false
            ], $options)
        ];
    }
}
```

### **2. Shipping Provider Interface**

**ShippingProviderInterface.php:**
```php
<?php

namespace App\Contracts\Integrations;

use App\Models\Order;

interface ShippingProviderInterface
{
    /**
     * Calculate shipping rate for order
     */
    public function calculateRate(Order $order): array;
    
    /**
     * Create shipment and return tracking info
     */
    public function createShipment(array $shipmentData): array;
    
    /**
     * Get tracking status for shipment
     */
    public function getTrackingStatus(string $trackingNumber): array;
    
    /**
     * Cancel shipment if possible
     */
    public function cancelShipment(string $trackingNumber): bool;
    
    /**
     * Get provider display name
     */
    public function getDisplayName(): string;
    
    /**
     * Get supported service types
     */
    public function getSupportedServices(): array;
    
    /**
     * Get coverage areas
     */
    public function getCoverageAreas(): array;
    
    /**
     * Get provider features
     */
    public function getFeatures(): array;
    
    /**
     * Test provider connection
     */
    public function testConnection(): bool;
}
```

---

## ✅ **PART 1 COMPLETED**

**🎯 DELIVERED:**
- ✅ Complete ShippingProviderService με multi-carrier support
- ✅ Rate calculation από όλους τους providers
- ✅ Shipment creation και tracking
- ✅ Address validation για Greek addresses
- ✅ Provider interface για consistent implementation
- ✅ Comprehensive error handling και logging

**📁 FILES CREATED:**
- `ShippingProviderService.php` - Core shipping service
- `ShippingProviderInterface.php` - Provider contract

**🔄 NEXT:** Part 2 - Greek Carrier Implementations (ELTA, ACS, Speedex, Courier Center)