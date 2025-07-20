<?php

namespace App\Http\Controllers\Api\Producer;

use App\Http\Controllers\Controller;
use App\Models\Producer;
use App\Models\ProducerShippingMethod;
use App\Models\ProducerShippingRate;
use App\Models\ProducerFreeShipping;
use App\Models\DeliveryMethod;
use App\Models\ShippingZone;
use App\Models\WeightTier;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class ShippingController extends Controller
{
    /**
     * Get producer's shipping methods
     *
     * @return JsonResponse
     */
    public function getMethods(): JsonResponse
    {
        $producer = auth()->user()->producer;
        
        if (!$producer) {
            return response()->json(['message' => 'Δεν βρέθηκε ο παραγωγός'], 404);
        }

        $methods = ProducerShippingMethod::where('producer_id', $producer->id)
            ->with('deliveryMethod')
            ->get();

        $availableMethods = DeliveryMethod::where('is_active', true)->get();

        return response()->json([
            'enabled_methods' => $methods,
            'available_methods' => $availableMethods
        ]);
    }

    /**
     * Store producer's shipping methods
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function storeMethods(Request $request): JsonResponse
    {
        $producer = auth()->user()->producer;
        
        if (!$producer) {
            return response()->json(['message' => 'Δεν βρέθηκε ο παραγωγός'], 404);
        }

        $validated = $request->validate([
            'methods' => 'required|array',
            'methods.*' => 'exists:delivery_methods,id'
        ]);

        // Delete existing methods
        ProducerShippingMethod::where('producer_id', $producer->id)->delete();

        // Create new methods
        foreach ($validated['methods'] as $methodId) {
            ProducerShippingMethod::create([
                'producer_id' => $producer->id,
                'delivery_method_id' => $methodId,
                'is_active' => true
            ]);
        }

        return response()->json([
            'message' => 'Οι μέθοδοι αποστολής ενημερώθηκαν επιτυχώς',
            'methods' => ProducerShippingMethod::where('producer_id', $producer->id)
                ->with('deliveryMethod')
                ->get()
        ]);
    }

    /**
     * Get producer's free shipping rules
     *
     * @return JsonResponse
     */
    public function getFreeShippingRules(): JsonResponse
    {
        $producer = auth()->user()->producer;
        
        if (!$producer) {
            return response()->json(['message' => 'Δεν βρέθηκε ο παραγωγός'], 404);
        }

        $rules = ProducerFreeShipping::where('producer_id', $producer->id)->get();

        return response()->json($rules);
    }

    /**
     * Store producer's free shipping rules
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function storeFreeShippingRules(Request $request): JsonResponse
    {
        $producer = auth()->user()->producer;
        
        if (!$producer) {
            return response()->json(['message' => 'Δεν βρέθηκε ο παραγωγός'], 404);
        }

        $validated = $request->validate([
            'rules' => 'required|array',
            'rules.*.min_order_amount' => 'required|numeric|min:0',
            'rules.*.shipping_zone_id' => 'nullable|exists:shipping_zones,id',
            'rules.*.is_active' => 'required|boolean'
        ]);

        // Delete existing rules
        ProducerFreeShipping::where('producer_id', $producer->id)->delete();

        // Create new rules
        $rules = [];
        foreach ($validated['rules'] as $ruleData) {
            $rules[] = ProducerFreeShipping::create([
                'producer_id' => $producer->id,
                'min_order_amount' => $ruleData['min_order_amount'],
                'shipping_zone_id' => $ruleData['shipping_zone_id'] ?? null,
                'is_active' => $ruleData['is_active']
            ]);
        }

        return response()->json([
            'message' => 'Οι κανόνες δωρεάν αποστολής ενημερώθηκαν επιτυχώς',
            'rules' => $rules
        ]);
    }

    /**
     * Get producer's custom shipping rates
     *
     * @return JsonResponse
     */
    public function getCustomRates(): JsonResponse
    {
        $producer = auth()->user()->producer;
        
        if (!$producer) {
            return response()->json(['message' => 'Δεν βρέθηκε ο παραγωγός'], 404);
        }

        $rates = ProducerShippingRate::where('producer_id', $producer->id)
            ->with(['shippingZone', 'deliveryMethod', 'weightTier'])
            ->get();

        $useCustomRates = $producer->use_custom_shipping_rates ?? false;

        return response()->json([
            'rates' => $rates,
            'use_custom_rates' => $useCustomRates,
            'zones' => ShippingZone::where('is_active', true)->get(),
            'delivery_methods' => DeliveryMethod::where('is_active', true)->get(),
            'weight_tiers' => WeightTier::orderBy('min_weight')->get()
        ]);
    }

    /**
     * Store producer's custom shipping rates
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function storeCustomRates(Request $request): JsonResponse
    {
        $producer = auth()->user()->producer;
        
        if (!$producer) {
            return response()->json(['message' => 'Δεν βρέθηκε ο παραγωγός'], 404);
        }

        $validated = $request->validate([
            'rates' => 'required|array',
            'rates.*.shipping_zone_id' => 'required|exists:shipping_zones,id',
            'rates.*.delivery_method_id' => 'required|exists:delivery_methods,id',
            'rates.*.weight_tier_id' => 'required|exists:weight_tiers,id',
            'rates.*.rate' => 'required|numeric|min:0'
        ]);

        DB::beginTransaction();
        try {
            // Delete existing rates
            ProducerShippingRate::where('producer_id', $producer->id)->delete();

            // Create new rates
            foreach ($validated['rates'] as $rateData) {
                ProducerShippingRate::create([
                    'producer_id' => $producer->id,
                    'shipping_zone_id' => $rateData['shipping_zone_id'],
                    'delivery_method_id' => $rateData['delivery_method_id'],
                    'weight_tier_id' => $rateData['weight_tier_id'],
                    'rate' => $rateData['rate']
                ]);
            }

            DB::commit();

            return response()->json([
                'message' => 'Οι προσαρμοσμένες χρεώσεις ενημερώθηκαν επιτυχώς',
                'rates' => ProducerShippingRate::where('producer_id', $producer->id)
                    ->with(['shippingZone', 'deliveryMethod', 'weightTier'])
                    ->get()
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Σφάλμα κατά την ενημέρωση των χρεώσεων',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Upload custom rates via CSV
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function uploadCustomRates(Request $request): JsonResponse
    {
        $producer = auth()->user()->producer;
        
        if (!$producer) {
            return response()->json(['message' => 'Δεν βρέθηκε ο παραγωγός'], 404);
        }

        $request->validate([
            'file' => 'required|file|mimes:csv,txt|max:2048'
        ]);

        $file = $request->file('file');
        $rates = [];
        
        // Parse CSV
        if (($handle = fopen($file->getPathname(), 'r')) !== FALSE) {
            $headers = fgetcsv($handle);
            
            while (($data = fgetcsv($handle)) !== FALSE) {
                if (count($data) >= 4) {
                    $rates[] = [
                        'shipping_zone_id' => $data[0],
                        'delivery_method_id' => $data[1],
                        'weight_tier_id' => $data[2],
                        'rate' => $data[3]
                    ];
                }
            }
            fclose($handle);
        }

        // Validate and store rates
        DB::beginTransaction();
        try {
            ProducerShippingRate::where('producer_id', $producer->id)->delete();

            foreach ($rates as $rate) {
                ProducerShippingRate::create([
                    'producer_id' => $producer->id,
                    'shipping_zone_id' => $rate['shipping_zone_id'],
                    'delivery_method_id' => $rate['delivery_method_id'],
                    'weight_tier_id' => $rate['weight_tier_id'],
                    'rate' => $rate['rate']
                ]);
            }

            DB::commit();

            return response()->json([
                'message' => 'Οι χρεώσεις εισήχθησαν επιτυχώς',
                'count' => count($rates)
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Σφάλμα κατά την εισαγωγή των χρεώσεων',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Toggle use of custom rates
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function toggleCustomRates(Request $request): JsonResponse
    {
        $producer = auth()->user()->producer;
        
        if (!$producer) {
            return response()->json(['message' => 'Δεν βρέθηκε ο παραγωγός'], 404);
        }

        $validated = $request->validate([
            'use_custom_rates' => 'required|boolean'
        ]);

        $producer->use_custom_shipping_rates = $validated['use_custom_rates'];
        $producer->save();

        return response()->json([
            'message' => 'Η ρύθμιση ενημερώθηκε επιτυχώς',
            'use_custom_rates' => $producer->use_custom_shipping_rates
        ]);
    }

    /**
     * Delete a custom rate
     *
     * @param int $id
     * @return JsonResponse
     */
    public function deleteCustomRate(int $id): JsonResponse
    {
        $producer = auth()->user()->producer;
        
        if (!$producer) {
            return response()->json(['message' => 'Δεν βρέθηκε ο παραγωγός'], 404);
        }

        $rate = ProducerShippingRate::where('producer_id', $producer->id)
            ->where('id', $id)
            ->firstOrFail();

        $rate->delete();

        return response()->json([
            'message' => 'Η χρέωση διαγράφηκε επιτυχώς'
        ]);
    }
}