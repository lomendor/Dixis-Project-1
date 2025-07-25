<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\GreekShippingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class ShippingController extends Controller
{
    protected GreekShippingService $shippingService;

    public function __construct(GreekShippingService $shippingService)
    {
        $this->shippingService = $shippingService;
    }

    /**
     * Calculate shipping rates for Greek market
     */
    public function calculateRates(Request $request)
    {
        $validatedData = $request->validate([
            'shipping_postcode' => 'required|string|size:5',
            'weight' => 'sometimes|numeric|min:0.1|max:50',
            'total' => 'required|numeric|min:0',
            'cod' => 'sometimes|boolean',
            'items' => 'sometimes|array'
        ]);

        try {
            $rates = $this->shippingService->calculateShippingRates($validatedData);

            return response()->json([
                'success' => true,
                'rates' => $rates['rates'],
                'zone' => $rates['zone'],
                'zone_name' => $this->getZoneDisplayName($rates['zone']),
                'free_shipping_eligible' => $rates['free_shipping_eligible'],
                'free_shipping_threshold' => $rates['free_shipping_threshold'],
                'message' => 'Shipping rates calculated successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Shipping rate calculation error: ' . $e->getMessage(), [
                'request_data' => $validatedData,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error calculating shipping rates: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Track shipment
     */
    public function trackShipment(Request $request)
    {
        $validatedData = $request->validate([
            'tracking_number' => 'required|string',
            'carrier' => 'sometimes|string|in:acs,elta,speedex,geniki'
        ]);

        try {
            $trackingInfo = $this->shippingService->trackShipment(
                $validatedData['tracking_number'],
                $validatedData['carrier'] ?? null
            );

            if (!$trackingInfo['success']) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tracking information not available'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'tracking' => $trackingInfo
            ]);

        } catch (\Exception $e) {
            Log::error('Shipment tracking error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Error retrieving tracking information'
            ], 500);
        }
    }

    /**
     * Get shipping zones for Greek market
     */
    public function getShippingZones()
    {
        try {
            $zones = [
                'athens' => [
                    'name' => 'Αθήνα & Περιχώρα',
                    'description' => 'Αττική - Ταχύτερη παράδοση',
                    'postcodes' => ['10*', '11*', '12*', '13*'],
                    'delivery_time' => '1-2 εργάσιμες μέρες',
                    'base_cost' => 3.0
                ],
                'thessaloniki' => [
                    'name' => 'Θεσσαλονίκη & Περιχώρα',
                    'description' => 'Μακεδονία - Ταχύτερη παράδοση',
                    'postcodes' => ['54*', '55*', '56*'],
                    'delivery_time' => '1-2 εργάσιμες μέρες',
                    'base_cost' => 3.0
                ],
                'mainland' => [
                    'name' => 'Υπόλοιπη Ελλάδα',
                    'description' => 'Ηπειρωτική Ελλάδα',
                    'postcodes' => ['20*-69*'],
                    'delivery_time' => '2-3 εργάσιμες μέρες',
                    'base_cost' => 4.0
                ],
                'islands' => [
                    'name' => 'Νησιά',
                    'description' => 'Ελληνικά νησιά',
                    'postcodes' => ['70*-85*'],
                    'delivery_time' => '3-5 εργάσιμες μέρες',
                    'base_cost' => 6.5
                ]
            ];

            return response()->json([
                'success' => true,
                'zones' => $zones,
                'free_shipping_threshold' => 50.0,
                'cod_fee' => 3.0
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving shipping zones'
            ], 500);
        }
    }

    /**
     * Get available carriers
     */
    public function getCarriers()
    {
        try {
            $carriers = [
                'acs' => [
                    'name' => 'ACS Courier',
                    'description' => 'Ταχύτερη παράδοση σε αστικές περιοχές',
                    'features' => ['Γρήγορη παράδοση', 'SMS ενημερώσεις']
                ],
                'elta' => [
                    'name' => 'ΕΛΤΑ Courier',
                    'description' => 'Καλύπτει όλη την Ελλάδα και τα νησιά',
                    'features' => ['Πανελλαδική κάλυψη', 'Παράδοση σε νησιά']
                ],
                'speedex' => [
                    'name' => 'Speedex',
                    'description' => 'Εξπρές παραδόσεις',
                    'features' => ['24ωρη παράδοση', 'SMS ενημερώσεις']
                ]
            ];

            return response()->json([
                'success' => true,
                'carriers' => $carriers
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving carriers'
            ], 500);
        }
    }

    private function getZoneDisplayName(string $zone): string
    {
        $zoneNames = [
            'athens' => 'Αθήνα & Περιχώρα',
            'thessaloniki' => 'Θεσσαλονίκη & Περιχώρα',
            'mainland' => 'Υπόλοιπη Ελλάδα',
            'islands' => 'Νησιά'
        ];

        return $zoneNames[$zone] ?? 'Άγνωστη περιοχή';
    }
}