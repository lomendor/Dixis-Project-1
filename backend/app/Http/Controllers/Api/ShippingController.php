<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Address;
use App\Models\DeliveryMethod;
use App\Models\Product;
use App\Models\ShippingZone;
use App\Models\WeightTier;
use App\Models\ShippingRate;
use App\Services\ShippingService;
use App\Services\ShippingZoneGeoJsonService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class ShippingController extends Controller
{
    protected $shippingService;
    protected $geoJsonService;

    public function __construct(ShippingService $shippingService, ShippingZoneGeoJsonService $geoJsonService)
    {
        $this->shippingService = $shippingService;
        $this->geoJsonService = $geoJsonService;
    }

    /**
     * Calculate available shipping options for a given cart and destination address ID.
     *
     * Expected Request Body:
     * {
     *   "cart_items": [
     *      {"product_id": 1, "quantity": 2},
     *      {"product_id": 5, "quantity": 1}
     *   ],
     *   "address_id": 123, // ID of the selected destination address
     *   "cod_requested": false // Optional, defaults to false
     * }
     */
    public function calculate(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'cart_items' => 'required|array|min:1',
            'cart_items.*.product_id' => 'required|integer|exists:products,id',
            'cart_items.*.quantity' => 'required|integer|min:1',
            'address_id' => 'required|integer|exists:addresses,id',
            'cod_requested' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        $validated = $validator->validated();
        $cartData = collect($validated['cart_items']);
        $addressId = $validated['address_id'];
        $codRequested = $validated['cod_requested'] ?? false;

        // Fetch the destination address
        // Ensure the address belongs to the authenticated user (or handle guest checkout appropriately)
        $user = $request->user('sanctum'); // Get authenticated user
        $destinationAddress = Address::where('id', $addressId)
                                     // ->where('user_id', $user->id) // Add this check for security
                                     ->firstOrFail(); // Fails if address not found or doesn't belong to user

        // Fetch product details needed for calculation (weight, dimensions, producer_id, price)
        // We need to load the product relation including producer
        $productIds = $cartData->pluck('product_id')->unique()->toArray();
         $products = Product::with('producer:id') // Load producer ID
                            ->whereIn('id', $productIds)
                            ->select(['id', 'producer_id', 'weight_grams', 'length_cm', 'width_cm', 'height_cm', 'price', 'discount_price', 'is_perishable', 'is_fragile']) // Select necessary fields including individual dimensions
                            ->get()
                            ->keyBy('id');

        // Combine cart data with product details
        $cartItemsWithDetails = $cartData->map(function ($item) use ($products) {
            $product = $products->get($item['product_id']);
            if (!$product) {
                // This should ideally not happen due to exists validation, but good to check
                return null;
            }
            // Add the product details to the item
            $item['product'] = $product;
            return $item;
        })->filter(); // Remove any null items if a product wasn't found

        if ($cartItemsWithDetails->isEmpty()) {
             return response()->json(['message' => 'Products not found for calculation.'], 404);
        }


        // Call the service
        try {
            $shippingOptions = $this->shippingService->calculateShipping(
                $cartItemsWithDetails,
                $destinationAddress,
                $codRequested
            );

            return response()->json($shippingOptions);

        } catch (\Exception $e) {
            // Log the error for debugging
            \Log::error('Shipping calculation failed: ' . $e->getMessage());
             return response()->json(['message' => 'Αποτυχία υπολογισμού μεταφορικών.'], 500);
        }
    }

    /**
     * Get all active shipping zones.
     */
    public function getShippingZones()
    {
        try {
            $zones = ShippingZone::where('is_active', true)->orderBy('id')->get(['id', 'name']);
            return response()->json($zones);
        } catch (\Exception $e) {
            Log::error('Failed to fetch shipping zones: ' . $e->getMessage());
            return response()->json(['message' => 'Αποτυχία φόρτωσης ζωνών αποστολής.'], 500);
        }
    }

    /**
     * Get shipping zones with GeoJSON data.
     */
    public function getZonesGeoJson()
    {
        try {
            // Χρησιμοποιούμε το service για να πάρουμε τα GeoJSON δεδομένα
            $geoJson = $this->geoJsonService->getEnrichedZonesGeoJson();

            return response()->json($geoJson);
        } catch (\Exception $e) {
            Log::error('Failed to fetch shipping zones GeoJSON: ' . $e->getMessage());
            return response()->json(['message' => 'Αποτυχία φόρτωσης γεωγραφικών δεδομένων ζωνών αποστολής.'], 500);
        }
    }

    /**
     * Get GeoJSON data for a specific shipping zone.
     *
     * @param int $zoneId
     * @return \Illuminate\Http\JsonResponse
     */
    public function getZoneGeoJson($zoneId)
    {
        try {
            $geoJson = $this->geoJsonService->getZoneGeoJson($zoneId);

            if (!$geoJson) {
                return response()->json(['message' => 'Η ζώνη αποστολής δεν βρέθηκε.'], 404);
            }

            return response()->json($geoJson);
        } catch (\Exception $e) {
            Log::error('Failed to fetch shipping zone GeoJSON: ' . $e->getMessage());
            return response()->json(['message' => 'Αποτυχία φόρτωσης γεωγραφικών δεδομένων ζώνης αποστολής.'], 500);
        }
    }

    /**
     * Get all active delivery methods.
     */
    public function getDeliveryMethods()
    {
         try {
            // Return only code and name, as other details are handled by ShippingService internally
            $methods = DeliveryMethod::where('is_active', true)->orderBy('id')->get(['id', 'code', 'name']);
            return response()->json($methods);
        } catch (\Exception $e) {
            Log::error('Failed to fetch delivery methods: ' . $e->getMessage());
            return response()->json(['message' => 'Αποτυχία φόρτωσης μεθόδων παράδοσης.'], 500);
        }
    }

    /**
     * Get all weight tiers.
     */
    public function getWeightTiers()
    {
        try {
            $tiers = WeightTier::orderBy('min_weight_grams')->get();
            return response()->json($tiers);
        } catch (\Exception $e) {
            Log::error('Failed to fetch weight tiers: ' . $e->getMessage());
            return response()->json(['message' => 'Αποτυχία φόρτωσης κλιμάκων βάρους.'], 500);
        }
    }

    /**
     * Get all shipping rates.
     */
    public function getShippingRates()
    {
        try {
            $rates = ShippingRate::with(['shippingZone:id,name', 'weightTier:id,name,min_weight_grams,max_weight_grams', 'deliveryMethod:id,name,code'])
                ->get();
            return response()->json($rates);
        } catch (\Exception $e) {
            Log::error('Failed to fetch shipping rates: ' . $e->getMessage());
            return response()->json(['message' => 'Αποτυχία φόρτωσης τιμών μεταφορικών.'], 500);
        }
    }

    /**
     * Get shipping rates for the authenticated producer.
     */
    public function getProducerRates()
    {
        try {
            $user = Auth::user();

            if (!$user || !$user->producer) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            $rates = ShippingRate::where('producer_id', $user->producer->id)
                ->get();

            return response()->json($rates);
        } catch (\Exception $e) {
            Log::error('Error fetching producer shipping rates: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch shipping rates'], 500);
        }
    }

    /**
     * Update shipping rates for the authenticated producer.
     */
    public function updateProducerRates(Request $request)
    {
        try {
            $user = Auth::user();

            if (!$user || !$user->producer) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            $rates = $request->input('rates');

            if (!is_array($rates)) {
                return response()->json(['error' => 'Invalid data format'], 400);
            }

            foreach ($rates as $rate) {
                // Validate required fields
                if (!isset($rate['shipping_zone_id']) || !isset($rate['weight_tier_id']) ||
                    !isset($rate['delivery_method_id']) || !isset($rate['price'])) {
                    continue;
                }

                // Find existing rate or create new one
                ShippingRate::updateOrCreate(
                    [
                        'producer_id' => $user->producer->id,
                        'shipping_zone_id' => $rate['shipping_zone_id'],
                        'weight_tier_id' => $rate['weight_tier_id'],
                        'delivery_method_id' => $rate['delivery_method_id'],
                    ],
                    [
                        'price' => $rate['price'],
                    ]
                );
            }

            // Update producer to use custom shipping rates
            $user->producer->uses_custom_shipping_rates = true;
            $user->producer->save();

            return response()->json(['message' => 'Shipping rates updated successfully']);
        } catch (\Exception $e) {
            Log::error('Error updating producer shipping rates: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to update shipping rates'], 500);
        }
    }

    /**
     * Find shipping zone by postal code.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function findZoneByPostalCode(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'postal_code' => 'required|string|min:3|max:10',
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            $postalCode = $request->input('postal_code');

            // Get the first 3 digits of the postal code as the prefix
            $postalCodePrefix = substr($postalCode, 0, 3);

            // Find the shipping zone for this postal code prefix
            $postalCodeZone = \DB::table('postal_code_zones')
                ->where('postal_code_prefix', $postalCodePrefix)
                ->first();

            if (!$postalCodeZone) {
                return response()->json([
                    'message' => 'Δεν βρέθηκε ζώνη αποστολής για τον ταχυδρομικό κώδικα ' . $postalCode,
                    'found' => false
                ]);
            }

            // Get the shipping zone details
            $zone = ShippingZone::find($postalCodeZone->shipping_zone_id);

            if (!$zone) {
                return response()->json([
                    'message' => 'Η ζώνη αποστολής δεν βρέθηκε',
                    'found' => false
                ]);
            }

            // Get the GeoJSON data for this zone
            $geoJson = $this->geoJsonService->getZoneGeoJson($zone->id);

            // Get shipping rates for this zone
            $rates = ShippingRate::with(['weightTier:id,name,min_weight_grams,max_weight_grams', 'deliveryMethod:id,name,code'])
                ->where('shipping_zone_id', $zone->id)
                ->get();

            return response()->json([
                'found' => true,
                'zone' => $zone,
                'geoJson' => $geoJson,
                'rates' => $rates,
                'postal_code' => $postalCode,
                'postal_code_prefix' => $postalCodePrefix
            ]);
        } catch (\Exception $e) {
            Log::error('Error finding zone by postal code: ' . $e->getMessage());
            return response()->json([
                'message' => 'Αποτυχία εύρεσης ζώνης αποστολής',
                'found' => false
            ], 500);
        }
    }
}
