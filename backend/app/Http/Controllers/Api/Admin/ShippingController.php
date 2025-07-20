<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ShippingZone;
use App\Models\PostalCodeZone;
use App\Models\WeightTier;
use App\Models\ShippingRate;
use App\Models\DeliveryMethod;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class ShippingController extends Controller
{
    /**
     * Display a listing of the shipping zones.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getZones(Request $request)
    {
        // Validate request parameters
        $request->validate([
            'is_active' => 'sometimes|boolean',
            'per_page' => 'sometimes|integer|min:5|max:100',
            'page' => 'sometimes|integer|min:1',
        ]);

        // Build query
        $query = ShippingZone::query();

        // Apply filters
        if ($request->has('is_active')) {
            $query->where('is_active', $request->is_active);
        }

        // Apply sorting
        $query->orderBy('name', 'asc');

        // Paginate results
        $perPage = $request->per_page ?? 15;
        $zones = $query->paginate($perPage);

        return response()->json($zones);
    }

    /**
     * Store a newly created shipping zone.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function storeZone(Request $request)
    {
        // Validate request
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        // Create shipping zone
        $zone = ShippingZone::create($validated);

        return response()->json([
            'message' => 'Shipping zone created successfully',
            'zone' => $zone,
        ], 201);
    }

    /**
     * Display the specified shipping zone.
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function showZone($id)
    {
        $zone = ShippingZone::findOrFail($id);

        return response()->json($zone);
    }

    /**
     * Update the specified shipping zone.
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateZone(Request $request, $id)
    {
        $zone = ShippingZone::findOrFail($id);

        // Validate request
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'sometimes|boolean',
        ]);

        // Update shipping zone
        $zone->update($validated);

        return response()->json([
            'message' => 'Shipping zone updated successfully',
            'zone' => $zone->fresh(),
        ]);
    }

    /**
     * Display a listing of postal code zones.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function indexPostalCodes(Request $request)
    {
        // Validate request parameters
        $request->validate([
            'zone_id' => 'sometimes|integer|exists:shipping_zones,id',
            'postal_code_prefix' => 'sometimes|string|max:10',
            'per_page' => 'sometimes|integer|min:5|max:100',
            'page' => 'sometimes|integer|min:1',
        ]);

        // Build query
        $query = PostalCodeZone::with('zone');

        // Apply filters
        if ($request->has('zone_id')) {
            $query->where('zone_id', $request->zone_id);
        }

        if ($request->has('postal_code_prefix') && $request->postal_code_prefix) {
            $query->where('postal_code_prefix', 'like', $request->postal_code_prefix . '%');
        }

        // Apply sorting
        $query->orderBy('postal_code_prefix', 'asc');

        // Paginate results
        $perPage = $request->per_page ?? 15;
        $postalCodes = $query->paginate($perPage);

        return response()->json($postalCodes);
    }

    /**
     * Store a newly created postal code zone.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function storePostalCode(Request $request)
    {
        // Validate request
        $validated = $request->validate([
            'postal_code_prefix' => 'required|string|max:10|unique:postal_code_zones',
            'zone_id' => 'required|integer|exists:shipping_zones,id',
        ]);

        // Create postal code zone
        $postalCode = PostalCodeZone::create($validated);

        return response()->json([
            'message' => 'Postal code zone created successfully',
            'postal_code' => $postalCode,
        ], 201);
    }

    /**
     * Update the specified postal code zone.
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function updatePostalCode(Request $request, $id)
    {
        $postalCode = PostalCodeZone::findOrFail($id);

        // Validate request
        $validated = $request->validate([
            'postal_code_prefix' => ['sometimes', 'string', 'max:10', Rule::unique('postal_code_zones')->ignore($postalCode->id)],
            'zone_id' => 'sometimes|integer|exists:shipping_zones,id',
        ]);

        // Update postal code zone
        $postalCode->update($validated);

        return response()->json([
            'message' => 'Postal code zone updated successfully',
            'postal_code' => $postalCode->fresh(['zone']),
        ]);
    }

    /**
     * Bulk import postal code zones.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function bulkImportPostalCodes(Request $request)
    {
        // Validate request
        $request->validate([
            'postal_codes' => 'required|array',
            'postal_codes.*.postal_code_prefix' => 'required|string|max:10',
            'postal_codes.*.zone_id' => 'required|integer|exists:shipping_zones,id',
        ]);

        // Start transaction
        DB::beginTransaction();

        try {
            $imported = 0;
            $skipped = 0;

            foreach ($request->postal_codes as $postalCodeData) {
                // Check if postal code already exists
                $exists = PostalCodeZone::where('postal_code_prefix', $postalCodeData['postal_code_prefix'])->exists();

                if ($exists) {
                    // Update existing postal code
                    PostalCodeZone::where('postal_code_prefix', $postalCodeData['postal_code_prefix'])
                        ->update(['zone_id' => $postalCodeData['zone_id']]);
                    $skipped++;
                } else {
                    // Create new postal code
                    PostalCodeZone::create([
                        'postal_code_prefix' => $postalCodeData['postal_code_prefix'],
                        'zone_id' => $postalCodeData['zone_id'],
                    ]);
                    $imported++;
                }
            }

            DB::commit();

            return response()->json([
                'message' => "Postal code zones imported successfully. Imported: {$imported}, Updated: {$skipped}",
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to import postal code zones: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Display a listing of weight tiers.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getWeightTiers(Request $request)
    {
        // Validate request parameters
        $request->validate([
            'per_page' => 'sometimes|integer|min:5|max:100',
            'page' => 'sometimes|integer|min:1',
        ]);

        // Build query
        $query = WeightTier::query();

        // Apply sorting
        $query->orderBy('min_weight_grams', 'asc');

        // Paginate results
        $perPage = $request->per_page ?? 15;
        $weightTiers = $query->paginate($perPage);

        return response()->json($weightTiers);
    }

    /**
     * Store a newly created weight tier.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function storeWeightTier(Request $request)
    {
        // Validate request
        $validated = $request->validate([
            'min_weight_grams' => 'required|integer|min:0',
            'max_weight_grams' => 'required|integer|gt:min_weight_grams',
            'description' => 'nullable|string',
        ]);

        // Create weight tier
        $weightTier = WeightTier::create($validated);

        return response()->json([
            'message' => 'Weight tier created successfully',
            'weight_tier' => $weightTier,
        ], 201);
    }

    /**
     * Update the specified weight tier.
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateWeightTier(Request $request, $id)
    {
        $weightTier = WeightTier::findOrFail($id);

        // Validate request
        $validated = $request->validate([
            'min_weight_grams' => 'sometimes|integer|min:0',
            'max_weight_grams' => 'sometimes|integer|gt:min_weight_grams',
            'description' => 'nullable|string',
        ]);

        // Update weight tier
        $weightTier->update($validated);

        return response()->json([
            'message' => 'Weight tier updated successfully',
            'weight_tier' => $weightTier->fresh(),
        ]);
    }

    /**
     * Display a listing of delivery methods.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getDeliveryMethods(Request $request)
    {
        // Validate request parameters
        $request->validate([
            'is_active' => 'sometimes|boolean',
            'per_page' => 'sometimes|integer|min:5|max:100',
            'page' => 'sometimes|integer|min:1',
        ]);

        // Build query
        $query = DeliveryMethod::query();

        // Apply filters
        if ($request->has('is_active')) {
            $query->where('is_active', $request->is_active);
        }

        // Apply sorting
        $query->orderBy('name', 'asc');

        // Paginate results
        $perPage = $request->per_page ?? 15;
        $deliveryMethods = $query->paginate($perPage);

        return response()->json($deliveryMethods);
    }

    /**
     * Store a newly created delivery method.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function storeDeliveryMethod(Request $request)
    {
        // Validate request
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'method_code' => 'required|string|max:50|unique:delivery_methods',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        // Create delivery method
        $deliveryMethod = DeliveryMethod::create($validated);

        return response()->json([
            'message' => 'Delivery method created successfully',
            'delivery_method' => $deliveryMethod,
        ], 201);
    }

    /**
     * Update the specified delivery method.
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateDeliveryMethod(Request $request, $id)
    {
        $deliveryMethod = DeliveryMethod::findOrFail($id);

        // Validate request
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'method_code' => ['sometimes', 'string', 'max:50', Rule::unique('delivery_methods')->ignore($deliveryMethod->id)],
            'description' => 'nullable|string',
            'is_active' => 'sometimes|boolean',
        ]);

        // Update delivery method
        $deliveryMethod->update($validated);

        return response()->json([
            'message' => 'Delivery method updated successfully',
            'delivery_method' => $deliveryMethod->fresh(),
        ]);
    }

    /**
     * Display a listing of shipping rates.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getRates(Request $request)
    {
        // Validate request parameters
        $request->validate([
            'shipping_zone_id' => 'sometimes|integer|exists:shipping_zones,id',
            'weight_tier_id' => 'sometimes|integer|exists:weight_tiers,id',
            'delivery_method_id' => 'sometimes|integer|exists:delivery_methods,id',
            'per_page' => 'sometimes|integer|min:5|max:100',
            'page' => 'sometimes|integer|min:1',
        ]);

        // Build query
        $query = ShippingRate::with(['shippingZone', 'weightTier', 'deliveryMethod']);

        // Apply filters
        if ($request->has('shipping_zone_id')) {
            $query->where('shipping_zone_id', $request->shipping_zone_id);
        }

        if ($request->has('weight_tier_id')) {
            $query->where('weight_tier_id', $request->weight_tier_id);
        }

        if ($request->has('delivery_method_id')) {
            $query->where('delivery_method_id', $request->delivery_method_id);
        }

        // Apply sorting
        $query->orderBy('shipping_zone_id', 'asc')
              ->orderBy('weight_tier_id', 'asc')
              ->orderBy('delivery_method_id', 'asc');

        // Paginate results
        $perPage = $request->per_page ?? 15;
        $shippingRates = $query->paginate($perPage);

        return response()->json($shippingRates);
    }

    /**
     * Store a newly created shipping rate.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function storeShippingRate(Request $request)
    {
        // Validate request
        $validated = $request->validate([
            'shipping_zone_id' => 'required|integer|exists:shipping_zones,id',
            'weight_tier_id' => 'required|integer|exists:weight_tiers,id',
            'delivery_method_id' => 'required|integer|exists:delivery_methods,id',
            'price' => 'required|numeric|min:0',
            'producer_id' => 'nullable|integer|exists:producers,id',
            'multi_producer_discount' => 'nullable|numeric|min:0|max:100',
            'min_producers_for_discount' => 'nullable|integer|min:2',
        ]);

        // Check if shipping rate already exists
        $exists = ShippingRate::where('shipping_zone_id', $validated['shipping_zone_id'])
            ->where('weight_tier_id', $validated['weight_tier_id'])
            ->where('delivery_method_id', $validated['delivery_method_id'])
            ->exists();

        if ($exists) {
            return response()->json([
                'message' => 'Shipping rate already exists for this zone, weight tier, and delivery method',
            ], 422);
        }

        // Create shipping rate
        $shippingRate = ShippingRate::create($validated);

        return response()->json([
            'message' => 'Shipping rate created successfully',
            'shipping_rate' => $shippingRate,
        ], 201);
    }

    /**
     * Update the specified shipping rate.
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateShippingRate(Request $request, $id)
    {
        $shippingRate = ShippingRate::findOrFail($id);

        // Validate request
        $validated = $request->validate([
            'shipping_zone_id' => 'sometimes|integer|exists:shipping_zones,id',
            'weight_tier_id' => 'sometimes|integer|exists:weight_tiers,id',
            'delivery_method_id' => 'sometimes|integer|exists:delivery_methods,id',
            'price' => 'sometimes|numeric|min:0',
            'producer_id' => 'sometimes|nullable|integer|exists:producers,id',
            'multi_producer_discount' => 'sometimes|nullable|numeric|min:0|max:100',
            'min_producers_for_discount' => 'sometimes|nullable|integer|min:2',
        ]);

        // Check if shipping rate already exists (if changing zone, weight tier, or delivery method)
        if (isset($validated['shipping_zone_id']) || isset($validated['weight_tier_id']) || isset($validated['delivery_method_id'])) {
            $zoneId = $validated['shipping_zone_id'] ?? $shippingRate->shipping_zone_id;
            $weightTierId = $validated['weight_tier_id'] ?? $shippingRate->weight_tier_id;
            $deliveryMethodId = $validated['delivery_method_id'] ?? $shippingRate->delivery_method_id;

            $exists = ShippingRate::where('shipping_zone_id', $zoneId)
                ->where('weight_tier_id', $weightTierId)
                ->where('delivery_method_id', $deliveryMethodId)
                ->where('id', '!=', $id)
                ->exists();

            if ($exists) {
                return response()->json([
                    'message' => 'Shipping rate already exists for this zone, weight tier, and delivery method',
                ], 422);
            }
        }

        // Update shipping rate
        $shippingRate->update($validated);

        return response()->json([
            'message' => 'Shipping rate updated successfully',
            'shipping_rate' => $shippingRate->fresh(['shippingZone', 'weightTier', 'deliveryMethod']),
        ]);
    }

    /**
     * Bulk import shipping rates.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function bulkImportShippingRates(Request $request)
    {
        // Validate request
        $request->validate([
            'shipping_rates' => 'required|array',
            'shipping_rates.*.shipping_zone_id' => 'required|integer|exists:shipping_zones,id',
            'shipping_rates.*.weight_tier_id' => 'required|integer|exists:weight_tiers,id',
            'shipping_rates.*.delivery_method_id' => 'required|integer|exists:delivery_methods,id',
            'shipping_rates.*.price' => 'required|numeric|min:0',
            'shipping_rates.*.producer_id' => 'nullable|integer|exists:producers,id',
            'shipping_rates.*.multi_producer_discount' => 'nullable|numeric|min:0|max:100',
            'shipping_rates.*.min_producers_for_discount' => 'nullable|integer|min:2',
        ]);

        // Start transaction
        DB::beginTransaction();

        try {
            $imported = 0;
            $updated = 0;

            foreach ($request->shipping_rates as $rateData) {
                // Check if shipping rate already exists
                $existingRate = ShippingRate::where('shipping_zone_id', $rateData['shipping_zone_id'])
                    ->where('weight_tier_id', $rateData['weight_tier_id'])
                    ->where('delivery_method_id', $rateData['delivery_method_id'])
                    ->first();

                if ($existingRate) {
                    // Update existing shipping rate
                    $updateData = ['price' => $rateData['price']];

                    // Add multi-producer discount data if provided
                    if (isset($rateData['multi_producer_discount'])) {
                        $updateData['multi_producer_discount'] = $rateData['multi_producer_discount'];
                    }

                    if (isset($rateData['min_producers_for_discount'])) {
                        $updateData['min_producers_for_discount'] = $rateData['min_producers_for_discount'];
                    }

                    $existingRate->update($updateData);
                    $updated++;
                } else {
                    // Create new shipping rate
                    $createData = [
                        'shipping_zone_id' => $rateData['shipping_zone_id'],
                        'weight_tier_id' => $rateData['weight_tier_id'],
                        'delivery_method_id' => $rateData['delivery_method_id'],
                        'price' => $rateData['price'],
                    ];

                    // Add producer_id if provided
                    if (isset($rateData['producer_id'])) {
                        $createData['producer_id'] = $rateData['producer_id'];
                    }

                    // Add multi-producer discount data if provided
                    if (isset($rateData['multi_producer_discount'])) {
                        $createData['multi_producer_discount'] = $rateData['multi_producer_discount'];
                    }

                    if (isset($rateData['min_producers_for_discount'])) {
                        $createData['min_producers_for_discount'] = $rateData['min_producers_for_discount'];
                    }

                    ShippingRate::create($createData);
                    $imported++;
                }
            }

            DB::commit();

            return response()->json([
                'message' => "Shipping rates imported successfully. Imported: {$imported}, Updated: {$updated}",
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to import shipping rates: ' . $e->getMessage()], 500);
        }
    }
}
