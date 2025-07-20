<?php

namespace App\Services\Integrations\Shipping;

use App\Contracts\Integrations\ShippingProviderInterface;
use App\Models\Order;
use App\Models\Address;
use App\Services\Integrations\BaseIntegrationService;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Config;

/**
 * Greek Courier Integration Service
 * Manages ELTA, ACS, Speedex, and Courier Center integrations
 */
class GreekCourierService extends BaseIntegrationService
{
    protected array $providers = [];
    protected array $providerConfig = [];
    
    public function __construct()
    {
        parent::__construct();
        $this->providerConfig = Config::get('integrations.shipping.greek_couriers', []);
        $this->initializeProviders();
    }
    
    /**
     * Initialize all Greek courier providers
     */
    protected function initializeProviders(): void
    {
        $providerClasses = [
            'elta' => \App\Services\Integrations\Shipping\Providers\EltaProvider::class,
            'acs' => \App\Services\Integrations\Shipping\Providers\AcsProvider::class,
            'speedex' => \App\Services\Integrations\Shipping\Providers\SpeedexProvider::class,
            'courier_center' => \App\Services\Integrations\Shipping\Providers\CourierCenterProvider::class,
        ];
        
        foreach ($providerClasses as $key => $class) {
            if (class_exists($class) && $this->isProviderEnabled($key)) {
                try {
                    $this->providers[$key] = new $class();
                    Log::info("Greek courier provider initialized: {$key}");
                } catch (\Exception $e) {
                    Log::error("Failed to initialize Greek courier provider {$key}: " . $e->getMessage());
                }
            }
        }
    }
    
    /**
     * Check if provider is enabled in config
     */
    protected function isProviderEnabled(string $provider): bool
    {
        return $this->providerConfig[$provider]['enabled'] ?? false;
    }
    
    /**
     * Get all available providers
     */
    public function getAvailableProviders(): array
    {
        return array_keys($this->providers);
    }
    
    /**
     * Get provider instance
     */
    public function getProvider(string $provider): ?ShippingProviderInterface
    {
        return $this->providers[$provider] ?? null;
    }
    
    /**
     * Calculate rates from all providers for comparison
     */
    public function calculateRatesFromAllProviders(Order $order): array
    {
        $rates = [];
        
        foreach ($this->providers as $providerKey => $provider) {
            try {
                $rate = $provider->calculateRate($order);
                if ($rate['success']) {
                    $rates[$providerKey] = $rate;
                }
            } catch (\Exception $e) {
                Log::error("Rate calculation failed for {$providerKey}: " . $e->getMessage());
                $rates[$providerKey] = [
                    'success' => false,
                    'error' => $e->getMessage()
                ];
            }
        }
        
        return $rates;
    }
    
    /**
     * Get best rate from all providers
     */
    public function getBestRate(Order $order, array $criteria = []): ?array
    {
        $rates = $this->calculateRatesFromAllProviders($order);
        $validRates = array_filter($rates, fn($rate) => $rate['success']);
        
        if (empty($validRates)) {
            return null;
        }
        
        // Default sorting by cost (ascending)
        $sortBy = $criteria['sort_by'] ?? 'cost';
        
        uasort($validRates, function($a, $b) use ($sortBy) {
            switch ($sortBy) {
                case 'cost':
                    return $a['cost'] <=> $b['cost'];
                case 'delivery_time':
                    return $this->parseDeliveryTime($a['delivery_time']) <=> 
                           $this->parseDeliveryTime($b['delivery_time']);
                default:
                    return $a['cost'] <=> $b['cost'];
            }
        });
        
        $bestProvider = array_key_first($validRates);
        $bestRate = $validRates[$bestProvider];
        $bestRate['provider'] = $bestProvider;
        
        return $bestRate;
    }
    
    /**
     * Parse delivery time string to comparable value
     */
    protected function parseDeliveryTime(string $deliveryTime): int
    {
        // Extract number of days from strings like "1-2 εργάσιμες ημέρες"
        preg_match('/(\d+)/', $deliveryTime, $matches);
        return (int)($matches[1] ?? 999);
    }
    
    /**
     * Create shipment with specified provider
     */
    public function createShipment(string $provider, array $shipmentData): array
    {
        $providerInstance = $this->getProvider($provider);
        
        if (!$providerInstance) {
            return [
                'success' => false,
                'error' => "Provider {$provider} not available"
            ];
        }
        
        try {
            return $providerInstance->createShipment($shipmentData);
        } catch (\Exception $e) {
            Log::error("Shipment creation failed for {$provider}: " . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }
    
    /**
     * Track shipment across all providers
     */
    public function trackShipment(string $trackingNumber, ?string $provider = null): array
    {
        if ($provider) {
            $providerInstance = $this->getProvider($provider);
            if ($providerInstance) {
                return $providerInstance->getTrackingStatus($trackingNumber);
            }
        }
        
        // Try all providers if no specific provider given
        foreach ($this->providers as $providerKey => $providerInstance) {
            try {
                $result = $providerInstance->getTrackingStatus($trackingNumber);
                if ($result['success']) {
                    $result['provider'] = $providerKey;
                    return $result;
                }
            } catch (\Exception $e) {
                Log::debug("Tracking failed for {$providerKey}: " . $e->getMessage());
            }
        }
        
        return [
            'success' => false,
            'error' => 'Tracking number not found in any provider'
        ];
    }
    
    /**
     * Validate Greek address
     */
    public function validateGreekAddress(array $address): array
    {
        // Basic Greek address validation
        $required = ['address_line_1', 'city', 'postal_code'];
        $missing = array_diff($required, array_keys($address));
        
        if (!empty($missing)) {
            return [
                'valid' => false,
                'error' => 'Missing required fields: ' . implode(', ', $missing)
            ];
        }
        
        // Validate Greek postal code (5 digits)
        if (!preg_match('/^\d{5}$/', $address['postal_code'])) {
            return [
                'valid' => false,
                'error' => 'Invalid Greek postal code format'
            ];
        }
        
        return [
            'valid' => true,
            'normalized_address' => $this->normalizeGreekAddress($address)
        ];
    }
    
    /**
     * Normalize Greek address
     */
    protected function normalizeGreekAddress(array $address): array
    {
        return [
            'address_line_1' => trim($address['address_line_1']),
            'address_line_2' => trim($address['address_line_2'] ?? ''),
            'city' => trim($address['city']),
            'postal_code' => trim($address['postal_code']),
            'country' => 'GR',
            'phone' => $this->normalizeGreekPhone($address['phone'] ?? '')
        ];
    }
    
    /**
     * Normalize Greek phone number
     */
    protected function normalizeGreekPhone(string $phone): string
    {
        $phone = preg_replace('/[^\d+]/', '', $phone);
        
        // Add +30 if missing
        if (!str_starts_with($phone, '+30') && !str_starts_with($phone, '0030')) {
            if (str_starts_with($phone, '30')) {
                $phone = '+' . $phone;
            } elseif (strlen($phone) === 10) {
                $phone = '+30' . $phone;
            }
        }
        
        return $phone;
    }
    
    /**
     * Get provider statistics
     */
    public function getProviderStatistics(): array
    {
        $stats = [];

        foreach ($this->providers as $key => $provider) {
            $stats[$key] = [
                'name' => $provider->getDisplayName(),
                'services' => $provider->getSupportedServices(),
                'coverage' => $provider->getCoverageAreas(),
                'features' => $provider->getFeatures(),
                'connection_status' => $provider->testConnection()
            ];
        }

        return $stats;
    }

    /**
     * Get service configuration (required by BaseIntegrationService)
     */
    public function getServiceConfig(): array
    {
        return [
            'service_name' => 'Greek Courier Service',
            'version' => '1.0.0',
            'providers' => array_keys($this->providers),
            'enabled_providers' => array_filter(
                array_keys($this->providerConfig),
                fn($key) => $this->isProviderEnabled($key)
            ),
            'features' => [
                'rate_comparison',
                'shipment_creation',
                'tracking',
                'address_validation'
            ],
            'supported_countries' => ['GR'],
            'configuration' => $this->providerConfig
        ];
    }
}
