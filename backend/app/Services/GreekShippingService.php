<?php

namespace App\Services;

use App\Models\Order;
use App\Models\ShippingRate;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

/**
 * Greek Shipping Service for AfterSalesPro Integration
 * 
 * Handles shipping via AfterSalesPro unified API for all major Greek couriers:
 * - ACS Courier
 * - ELTA (Greek Post)
 * - Speedex
 * - Geniki Taxydromiki
 */
class GreekShippingService
{
    protected string $apiKey;
    protected string $apiSecret;
    protected string $baseUrl;
    protected bool $isSandbox;

    public function __construct()
    {
        $this->apiKey = config('services.aftersales_pro.api_key');
        $this->apiSecret = config('services.aftersales_pro.api_secret');
        $this->isSandbox = config('services.aftersales_pro.sandbox', true);
        $this->baseUrl = $this->isSandbox 
            ? 'https://api-sandbox.aftersalespro.gr/v1' 
            : 'https://api.aftersalespro.gr/v1';
    }

    /**
     * Calculate shipping rates for an order
     * 
     * @param array $orderData
     * @return array
     */
    public function calculateShippingRates(array $orderData): array
    {
        try {
            // Extract necessary data
            $destinationPostcode = $orderData['shipping_postcode'] ?? '';
            $weight = $orderData['weight'] ?? 1.0; // kg
            $orderValue = $orderData['total'] ?? 0;
            $items = $orderData['items'] ?? [];

            // Determine shipping zone
            $zone = $this->determineShippingZone($destinationPostcode);
            
            // Get available carriers for this zone
            $carriers = $this->getAvailableCarriers($zone, $weight);
            
            $rates = [];
            
            foreach ($carriers as $carrier) {
                // Calculate base rate
                $baseRate = $this->calculateBaseRate($carrier, $zone, $weight);
                
                // Add COD fee if requested
                $codFee = ($orderData['cod'] ?? false) ? 3.0 : 0;
                
                // Calculate delivery time
                $deliveryTime = $this->estimateDeliveryTime($carrier, $zone);
                
                $rates[] = [
                    'carrier' => $carrier,
                    'carrier_name' => $this->getCarrierDisplayName($carrier),
                    'service_type' => 'standard',
                    'cost' => $baseRate + $codFee,
                    'cod_fee' => $codFee,
                    'delivery_time' => $deliveryTime,
                    'delivery_time_text' => $this->getDeliveryTimeText($deliveryTime),
                    'supports_cod' => true,
                    'supports_tracking' => true,
                    'zone' => $zone,
                    'features' => $this->getCarrierFeatures($carrier)
                ];
            }

            // Apply free shipping if applicable
            $freeShippingThreshold = 50.0; // €50
            if ($orderValue >= $freeShippingThreshold) {
                foreach ($rates as &$rate) {
                    $rate['original_cost'] = $rate['cost'];
                    $rate['cost'] = $rate['cod_fee']; // Only COD fee if free shipping applies
                    $rate['free_shipping'] = true;
                }
            }

            // Sort by cost (cheapest first)
            usort($rates, function($a, $b) {
                return $a['cost'] <=> $b['cost'];
            });

            return [
                'success' => true,
                'rates' => $rates,
                'zone' => $zone,
                'free_shipping_eligible' => $orderValue >= $freeShippingThreshold,
                'free_shipping_threshold' => $freeShippingThreshold
            ];

        } catch (\Exception $e) {
            Log::error('Greek shipping rate calculation failed', [
                'order_data' => $orderData,
                'error' => $e->getMessage()
            ]);

            throw new \Exception('Failed to calculate shipping rates: ' . $e->getMessage());
        }
    }

    /**
     * Create shipping label via AfterSalesPro API
     * 
     * @param Order $order
     * @param string $carrier
     * @param array $options
     * @return array
     */
    public function createShippingLabel(Order $order, string $carrier, array $options = []): array
    {
        try {
            // Prepare shipment data
            $shipmentData = [
                'carrier' => $carrier,
                'service_type' => $options['service_type'] ?? 'standard',
                'sender' => [
                    'name' => config('app.company_name', 'Dixis'),
                    'company' => 'Dixis Greek Marketplace',
                    'address' => config('app.company_address'),
                    'city' => config('app.company_city'),
                    'postcode' => config('app.company_postcode'),
                    'country' => 'GR',
                    'phone' => config('app.company_phone'),
                    'email' => config('app.company_email')
                ],
                'recipient' => [
                    'name' => $order->shipping_name ?? $order->user->name,
                    'company' => $order->shipping_company ?? '',
                    'address' => $order->shipping_address,
                    'city' => $order->shipping_city,
                    'postcode' => $order->shipping_postcode,
                    'country' => 'GR',
                    'phone' => $order->shipping_phone ?? $order->user->phone,
                    'email' => $order->user->email
                ],
                'package' => [
                    'weight' => $this->calculatePackageWeight($order),
                    'dimensions' => $this->estimatePackageDimensions($order),
                    'description' => 'Traditional Greek Products',
                    'value' => $order->total,
                    'currency' => 'EUR'
                ],
                'options' => [
                    'cod' => $options['cod'] ?? false,
                    'cod_amount' => $options['cod'] ? $order->total : 0,
                    'insurance' => $order->total > 100 ? $order->total : 0,
                    'signature_required' => $order->total > 200,
                    'sms_notification' => true,
                    'email_notification' => true
                ],
                'reference' => $order->order_number,
                'notes' => $options['notes'] ?? ''
            ];

            // Create shipment via AfterSalesPro API
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->getAccessToken(),
                'Content-Type' => 'application/json',
                'Accept' => 'application/json'
            ])->post("{$this->baseUrl}/shipments", $shipmentData);

            if (!$response->successful()) {
                throw new \Exception('AfterSalesPro API error: ' . $response->body());
            }

            $result = $response->json();

            // Save tracking information to order
            $order->tracking_number = $result['tracking_number'];
            $order->shipping_carrier = $carrier;
            $order->shipping_label_url = $result['label_url'] ?? null;
            $order->shipping_cost = $options['shipping_cost'] ?? 0;
            $order->save();

            Log::info('Greek shipping label created', [
                'order_id' => $order->id,
                'carrier' => $carrier,
                'tracking_number' => $result['tracking_number']
            ]);

            return [
                'success' => true,
                'tracking_number' => $result['tracking_number'],
                'label_url' => $result['label_url'] ?? null,
                'carrier' => $carrier,
                'estimated_delivery' => $result['estimated_delivery'] ?? null,
                'cost' => $options['shipping_cost'] ?? 0
            ];

        } catch (\Exception $e) {
            Log::error('Greek shipping label creation failed', [
                'order_id' => $order->id,
                'carrier' => $carrier,
                'error' => $e->getMessage()
            ]);

            throw $e;
        }
    }

    /**
     * Track shipment status
     * 
     * @param string $trackingNumber
     * @param string $carrier
     * @return array
     */
    public function trackShipment(string $trackingNumber, string $carrier = null): array
    {
        try {
            $cacheKey = "tracking_{$trackingNumber}";
            
            return Cache::remember($cacheKey, 300, function() use ($trackingNumber, $carrier) { // 5 min cache
                $response = Http::withHeaders([
                    'Authorization' => 'Bearer ' . $this->getAccessToken(),
                    'Accept' => 'application/json'
                ])->get("{$this->baseUrl}/tracking/{$trackingNumber}");

                if (!$response->successful()) {
                    throw new \Exception('Tracking request failed: ' . $response->body());
                }

                $trackingData = $response->json();

                return [
                    'success' => true,
                    'tracking_number' => $trackingNumber,
                    'carrier' => $trackingData['carrier'] ?? $carrier,
                    'status' => $trackingData['status'] ?? 'unknown',
                    'status_text' => $this->getGreekStatusText($trackingData['status'] ?? 'unknown'),
                    'last_update' => $trackingData['last_update'] ?? now(),
                    'estimated_delivery' => $trackingData['estimated_delivery'] ?? null,
                    'events' => array_map(function($event) {
                        return [
                            'date' => $event['date'],
                            'status' => $event['status'],
                            'description' => $this->translateEventToGreek($event['description']),
                            'location' => $event['location'] ?? ''
                        ];
                    }, $trackingData['events'] ?? [])
                ];
            });

        } catch (\Exception $e) {
            Log::error('Shipment tracking failed', [
                'tracking_number' => $trackingNumber,
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
                'tracking_number' => $trackingNumber
            ];
        }
    }

    /**
     * Get Greek shipping zones based on postcode
     * 
     * @param string $postcode
     * @return string
     */
    protected function determineShippingZone(string $postcode): string
    {
        $postcode = preg_replace('/\D/', '', $postcode); // Keep only digits
        
        if (empty($postcode)) {
            return 'mainland'; // Default fallback
        }

        $firstTwo = substr($postcode, 0, 2);
        $firstThree = substr($postcode, 0, 3);

        // Athens Area (Attica)
        $athensPostcodes = ['10', '11', '12', '13', '14', '15', '16', '17', '18', '19'];
        if (in_array($firstTwo, $athensPostcodes)) {
            return 'athens';
        }

        // Thessaloniki Area
        $thessalonikiPostcodes = ['54', '55', '56', '57'];
        if (in_array($firstTwo, $thessalonikiPostcodes)) {
            return 'thessaloniki';
        }

        // Greek Islands
        $islandPostcodes = [
            // Crete
            '70', '71', '72', '73', '74',
            // Rhodes, Kos (Dodecanese)
            '851', '852', '853', '854', '855',
            // Lesbos, Chios, Samos (North Aegean)
            '811', '812', '821', '831',
            // Corfu, Zakynthos, Kefalonia (Ionian)
            '28', '29', '491',
            // Cyclades (Santorini, Mykonos, etc.)
            '840', '841', '842', '843', '844', '845', '846', '847', '848', '849'
        ];

        foreach ($islandPostcodes as $islandCode) {
            if (strpos($postcode, $islandCode) === 0) {
                return 'islands';
            }
        }

        // Default to mainland
        return 'mainland';
    }

    /**
     * Get available carriers for zone
     * 
     * @param string $zone
     * @param float $weight
     * @return array
     */
    protected function getAvailableCarriers(string $zone, float $weight): array
    {
        $carriers = [];

        switch ($zone) {
            case 'athens':
            case 'thessaloniki':
                $carriers = ['acs', 'speedex', 'elta']; // All carriers available
                break;
            case 'mainland':
                $carriers = ['acs', 'elta', 'geniki']; // Good coverage
                break;
            case 'islands':
                $carriers = ['elta', 'acs']; // Limited to these for islands
                break;
            default:
                $carriers = ['elta']; // ELTA as fallback
        }

        // Filter by weight restrictions
        if ($weight > 30) {
            $carriers = array_filter($carriers, function($carrier) {
                return in_array($carrier, ['elta', 'acs']); // Only these handle heavy packages
            });
        }

        return $carriers;
    }

    /**
     * Calculate base shipping rate
     * 
     * @param string $carrier
     * @param string $zone
     * @param float $weight
     * @return float
     */
    protected function calculateBaseRate(string $carrier, string $zone, float $weight): float
    {
        $rates = [
            'athens' => [
                'acs' => 3.5,
                'speedex' => 3.0,
                'elta' => 4.0
            ],
            'thessaloniki' => [
                'acs' => 3.5,
                'speedex' => 3.0,
                'elta' => 4.0
            ],
            'mainland' => [
                'acs' => 4.5,
                'elta' => 4.0,
                'geniki' => 4.2
            ],
            'islands' => [
                'elta' => 6.5,
                'acs' => 7.0
            ]
        ];

        $baseRate = $rates[$zone][$carrier] ?? 5.0;

        // Weight surcharges
        if ($weight > 2) {
            $baseRate += ($weight - 2) * 0.5; // €0.50 per kg over 2kg
        }

        return round($baseRate, 2);
    }

    /**
     * Estimate delivery time in days
     * 
     * @param string $carrier
     * @param string $zone
     * @return int
     */
    protected function estimateDeliveryTime(string $carrier, string $zone): int
    {
        $deliveryTimes = [
            'athens' => [
                'acs' => 1,
                'speedex' => 1,
                'elta' => 2
            ],
            'thessaloniki' => [
                'acs' => 1,
                'speedex' => 1,
                'elta' => 2
            ],
            'mainland' => [
                'acs' => 2,
                'elta' => 2,
                'geniki' => 3
            ],
            'islands' => [
                'elta' => 4,
                'acs' => 5
            ]
        ];

        return $deliveryTimes[$zone][$carrier] ?? 3;
    }

    /**
     * Get carrier display name in Greek
     * 
     * @param string $carrier
     * @return string
     */
    protected function getCarrierDisplayName(string $carrier): string
    {
        $names = [
            'acs' => 'ACS Courier',
            'elta' => 'ΕΛΤΑ Courier',
            'speedex' => 'Speedex',
            'geniki' => 'Γενική Ταχυδρομική'
        ];

        return $names[$carrier] ?? ucfirst($carrier);
    }

    /**
     * Get delivery time text in Greek
     * 
     * @param int $days
     * @return string
     */
    protected function getDeliveryTimeText(int $days): string
    {
        if ($days == 1) {
            return '1 εργάσιμη μέρα';
        } elseif ($days <= 3) {
            return "{$days} εργάσιμες μέρες";
        } else {
            return "{$days} μέρες";
        }
    }

    /**
     * Get carrier features
     * 
     * @param string $carrier
     * @return array
     */
    protected function getCarrierFeatures(string $carrier): array
    {
        $features = [
            'acs' => [
                'express_available' => true,
                'sms_notifications' => true,
                'best_for' => 'urban_areas',
                'reliability' => 'high'
            ],
            'elta' => [
                'express_available' => false,
                'sms_notifications' => true,
                'best_for' => 'islands_rural',
                'reliability' => 'medium'
            ],
            'speedex' => [
                'express_available' => true,
                'sms_notifications' => true,
                'best_for' => 'speed',
                'reliability' => 'high'
            ],
            'geniki' => [
                'express_available' => false,
                'sms_notifications' => false,
                'best_for' => 'cost_effective',
                'reliability' => 'medium'
            ]
        ];

        return $features[$carrier] ?? [];
    }

    /**
     * Calculate package weight from order
     * 
     * @param Order $order
     * @return float
     */
    protected function calculatePackageWeight(Order $order): float
    {
        $weight = 0;
        
        foreach ($order->items as $item) {
            $productWeight = $item->product->weight ?? 0.5; // Default 0.5kg
            $weight += $productWeight * $item->quantity;
        }

        // Add packaging weight
        $weight += 0.2; // 200g for packaging

        return round($weight, 2);
    }

    /**
     * Estimate package dimensions
     * 
     * @param Order $order
     * @return array
     */
    protected function estimatePackageDimensions(Order $order): array
    {
        $itemCount = $order->items->sum('quantity');
        
        // Simple dimension estimation based on item count
        if ($itemCount <= 3) {
            return ['length' => 25, 'width' => 20, 'height' => 10]; // cm
        } elseif ($itemCount <= 6) {
            return ['length' => 35, 'width' => 25, 'height' => 15]; // cm
        } else {
            return ['length' => 45, 'width' => 35, 'height' => 20]; // cm
        }
    }

    /**
     * Get Greek status text for tracking
     * 
     * @param string $status
     * @return string
     */
    protected function getGreekStatusText(string $status): string
    {
        $statusTexts = [
            'pending' => 'Εκκρεμής',
            'picked_up' => 'Παραλήφθηκε',
            'in_transit' => 'Σε μεταφορά', 
            'out_for_delivery' => 'Σε διανομή',
            'delivered' => 'Παραδόθηκε',
            'failed_delivery' => 'Αποτυχημένη παράδοση',
            'returned' => 'Επιστράφηκε'
        ];

        return $statusTexts[$status] ?? 'Άγνωστη κατάσταση';
    }

    /**
     * Translate tracking event to Greek
     * 
     * @param string $description
     * @return string
     */
    protected function translateEventToGreek(string $description): string
    {
        $translations = [
            'Package picked up' => 'Το δέμα παραλήφθηκε',
            'In transit' => 'Σε μεταφορά',
            'Arrived at facility' => 'Έφτασε στο κέντρο διανομής',
            'Out for delivery' => 'Σε διανομή προς τον παραλήπτη',
            'Delivered' => 'Παραδόθηκε επιτυχώς',
            'Delivery failed' => 'Η παράδοση απέτυχε'
        ];

        foreach ($translations as $english => $greek) {
            if (stripos($description, $english) !== false) {
                return $greek;
            }
        }

        return $description; // Return original if no translation found
    }

    /**
     * Get API access token
     * 
     * @return string
     */
    protected function getAccessToken(): string
    {
        return Cache::remember('aftersales_token', 3600, function() { // 1 hour cache
            $response = Http::asForm()->post("{$this->baseUrl}/auth/token", [
                'grant_type' => 'client_credentials',
                'client_id' => $this->apiKey,
                'client_secret' => $this->apiSecret,
                'scope' => 'shipping'
            ]);

            if (!$response->successful()) {
                throw new \Exception('Failed to get AfterSalesPro access token');
            }

            $tokenData = $response->json();
            return $tokenData['access_token'];
        });
    }
}