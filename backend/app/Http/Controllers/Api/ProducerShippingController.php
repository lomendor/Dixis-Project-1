<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DeliveryMethod;
use App\Models\ProducerShippingMethod;
use Illuminate\Http\Request;
use App\Http\Requests\StoreFreeShippingRuleRequest; // Import Form Request
use App\Models\ProducerFreeShipping; // Import Model
use Illuminate\Support\Facades\Auth;
use App\Http\Requests\UploadProducerRatesRequest; // Import new request
use App\Models\ProducerShippingRate; // Import model
use App\Models\ShippingZone;
use App\Models\WeightTier; // Needed for validation/lookup
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log; // For logging errors
use Illuminate\Support\Facades\Validator; // For row validation
use Illuminate\Validation\Rule;
use League\Csv\Reader; // Import CSV reader
use League\Csv\Statement;

class ProducerShippingController extends Controller
{
    /**
     * Get the available delivery methods and the producer's current settings.
     */
    public function getMethods(Request $request)
    {
        $producer = $request->user()->producer;
        if (!$producer) {
            return response()->json(['message' => 'Producer profile not found.'], 404);
        }

        // Get all globally active delivery methods
        $allMethods = DeliveryMethod::where('is_active', true)->get(['id', 'code', 'name', 'description']); // Fetch ID as well

        // Get the producer's current settings using IDs
        $producerMethods = ProducerShippingMethod::where('producer_id', $producer->id)
            ->pluck('is_enabled', 'delivery_method_id'); // Get id => is_enabled map

        // Combine the data
        $result = $allMethods->map(function ($method) use ($producerMethods) {
            return [
                'id' => $method->id, // Include ID for updates
                'code' => $method->code,
                'name' => $method->name,
                'description' => $method->description,
                'is_enabled' => $producerMethods->get($method->id, false), // Use ID for lookup, default false
            ];
        });

        return response()->json($result);
    }

    /**
     * Update the enabled status for delivery methods for the authenticated producer.
     * Expects an array like: [{ "id": 1, "is_enabled": true }, { "id": 2, "is_enabled": false }]
     */
    public function updateMethods(Request $request)
    {
        $producer = $request->user()->producer;
        if (!$producer) {
            return response()->json(['message' => 'Producer profile not found.'], 404);
        }

        // Validate the input: should be an array of objects, each with 'id' and 'is_enabled'
        $validated = $request->validate([
            'methods' => 'required|array',
            'methods.*.id' => ['required', 'integer', Rule::exists('delivery_methods', 'id')->where('is_active', true)],
            'methods.*.is_enabled' => 'required|boolean',
        ]);

        $methodSettings = $validated['methods'];

        DB::transaction(function () use ($producer, $methodSettings) {
            // Get all currently active method IDs for safety check
            $activeMethodIds = DeliveryMethod::where('is_active', true)->pluck('id')->toArray();

            foreach ($methodSettings as $setting) {
                 $methodId = $setting['id'];
                 $isEnabled = $setting['is_enabled'];

                 // Ensure we only update active methods
                 if (!in_array($methodId, $activeMethodIds)) {
                     Log::warning("Attempted to update non-active/invalid delivery method ID {$methodId} for producer {$producer->id}");
                     continue; // Skip this entry
                 }

                 ProducerShippingMethod::updateOrCreate(
                     [ // Attributes to find the record
                         'producer_id' => $producer->id,
                         'delivery_method_id' => $methodId,
                     ],
                     [ // Attributes to update or create with
                         'producer_id' => $producer->id, // Include producer_id here as well
                         'delivery_method_id' => $methodId, // Include delivery_method_id here
                         'is_enabled' => $isEnabled,
                     ]
                 );
            }
             // Optional: Ensure methods not included in the request are disabled?
             // This depends on whether the request must be exhaustive or partial.
             // Assuming exhaustive for now: Disable methods not present in the request.
             $providedMethodIds = array_column($methodSettings, 'id');
             ProducerShippingMethod::where('producer_id', $producer->id)
                 ->whereNotIn('delivery_method_id', $providedMethodIds)
                 ->whereIn('delivery_method_id', $activeMethodIds) // Only disable active methods
                 ->update(['is_enabled' => false]);

        });

        // Return the updated list of methods for confirmation
        return $this->getMethods($request); // getMethods now returns IDs
    }

     /**
      * Get the producer's free shipping rules.
      */
     public function getFreeShippingRules(Request $request)
     {
         $producer = $request->user()->producer;
         if (!$producer) {
             return response()->json(['message' => 'Producer profile not found.'], 404);
         }

         $rules = ProducerFreeShipping::where('producer_id', $producer->id)
             ->with(['shippingZone:id,name', 'deliveryMethod:id,code,name']) // Eager load zone and method
             ->orderBy('shipping_zone_id') // Order for consistency
             ->orderBy('delivery_method_id') // Order by ID now
             ->get();

         // Optionally format the response if needed, e.g., include method code/name directly
         // For now, returning the Eloquent collection with loaded relations

         return response()->json($rules);
     }

     /**
      * Store a new free shipping rule for the producer.
      */
     public function storeFreeShippingRule(StoreFreeShippingRuleRequest $request) // Use Form Request
     {
         $producer = $request->user()->producer;
         if (!$producer) {
             return response()->json(['message' => 'Producer profile not found.'], 404);
         }

         $validated = $request->validated();

         // TODO: Add check for duplicate rules before creating (consider unique constraint)

         // No mapping needed now, model expects 'free_shipping_threshold'
         $createData = [
             'producer_id' => $producer->id,
             'free_shipping_threshold' => $validated['free_shipping_threshold'], // Pass validated data directly
             'shipping_zone_id' => $validated['shipping_zone_id'] ?? null,
             'delivery_method_id' => $validated['delivery_method_id'] ?? null,
             'is_active' => $validated['is_active'] ?? true,
         ];

         $rule = ProducerFreeShipping::create($createData);

         return response()->json($rule->load(['shippingZone:id,name', 'deliveryMethod:id,name']), 201);
     }

     /**
      * Update an existing free shipping rule.
      * Using Route Model Binding for $rule
      */
     public function updateFreeShippingRule(StoreFreeShippingRuleRequest $request, ProducerFreeShipping $rule)
     {
         $producer = $request->user()->producer;
         // Authorization: Ensure the rule belongs to the authenticated producer
         if (!$producer || $rule->producer_id !== $producer->id) {
             return response()->json(['message' => 'Unauthorized or rule not found.'], 403);
         }

         $validated = $request->validated();

         // TODO: Add check for duplicate rules before updating (excluding the current rule, consider unique constraint)

         // No mapping needed for update either
         $updateData = [
             'free_shipping_threshold' => $validated['free_shipping_threshold'], // Pass validated data directly
             'shipping_zone_id' => $validated['shipping_zone_id'] ?? null,
             'delivery_method_id' => $validated['delivery_method_id'] ?? null,
             'is_active' => $validated['is_active'] ?? $rule->is_active,
         ];

         $rule->update($updateData);

         return response()->json($rule->fresh()->load(['shippingZone:id,name', 'deliveryMethod:id,name']));
     }

     /**
      * Delete a free shipping rule.
      * Using Route Model Binding for $rule
      */
     public function destroyFreeShippingRule(Request $request, ProducerFreeShipping $rule)
     {
         $producer = $request->user()->producer;
         // Authorization: Ensure the rule belongs to the authenticated producer
         if (!$producer || $rule->producer_id !== $producer->id) {
             return response()->json(['message' => 'Unauthorized or rule not found.'], 403);
         }

         $rule->delete();

         return response()->json(null, 204); // No content response on successful delete
     }

    /**
     * Upload and process a CSV file containing producer-specific shipping rates.
     */
    public function uploadRates(UploadProducerRatesRequest $request)
    {
        $producer = $request->user()->producer;
        if (!$producer) {
            return response()->json(['message' => 'Producer profile not found.'], 404);
        }

        $file = $request->file('rates_file');
        $path = $file->getRealPath();

        $processedCount = 0;
        $errorCount = 0;
        $errors = [];

        try {
            $csv = Reader::createFromPath($path, 'r');
            $csv->setHeaderOffset(0); // Assumes first row is header

            // Define expected headers for the new format
            $expectedHeaders = ['shipping_zone_id', 'weight_tier_code', 'delivery_method_code', 'price'];
            $actualHeaders = $csv->getHeader();

            if (count(array_diff($expectedHeaders, $actualHeaders)) > 0 || count(array_diff($actualHeaders, $expectedHeaders)) > 0) {
                 return response()->json(['message' => 'CSV headers do not match the expected format.', 'expected' => $expectedHeaders, 'actual' => $actualHeaders], 422);
            }

            $records = Statement::create()->process($csv);

            // Get valid IDs/codes for validation lookup
            $validZoneIds = ShippingZone::pluck('id')->toArray();
            $validMethodMap = DeliveryMethod::pluck('id', 'code'); // code => id
            $validTierMap = WeightTier::pluck('id', 'code'); // code => id

            $validRows = []; // Store validated rows for DB insertion

            // --- Pre-validation Phase ---
            foreach ($records as $index => $record) {
                $rowNumber = $index + 2; // +1 for 0-based index, +1 for header row

                // Map codes to IDs and validate
                $deliveryMethodId = $validMethodMap->get($record['delivery_method_code'] ?? null);
                $weightTierId = $validTierMap->get($record['weight_tier_code'] ?? null);

                // Prepare data for validation (including mapped IDs)
                $validationData = $record + [
                    'delivery_method_id' => $deliveryMethodId,
                    'weight_tier_id' => $weightTierId,
                ];

                // Validate each row's data
                $validator = Validator::make($validationData, [
                    'shipping_zone_id' => ['required', 'integer', Rule::in($validZoneIds)],
                    'weight_tier_code' => ['required', 'string'], // Validate code presence
                    'weight_tier_id' => ['required', 'integer'], // Validate mapped ID
                    'delivery_method_code' => ['required', 'string'], // Validate code presence
                    'delivery_method_id' => ['required', 'integer'], // Validate mapped ID
                    'price' => ['required', 'numeric', 'min:0'],
                ], [
                    // Custom messages for mapped ID failures
                    'weight_tier_id.required' => "Invalid or unknown weight_tier_code '{$record['weight_tier_code']}'.",
                    'delivery_method_id.required' => "Invalid or unknown delivery_method_code '{$record['delivery_method_code']}'.",
                ]);

                if ($validator->fails()) {
                    $errorCount++;
                    $errors[$rowNumber] = $validator->errors()->all();
                } else {
                    // Store the validated record data using IDs for later insertion
                    $validRows[] = [
                        'producer_id' => $producer->id,
                        'shipping_zone_id' => $validationData['shipping_zone_id'],
                        'weight_tier_id' => $validationData['weight_tier_id'],
                        'delivery_method_id' => $validationData['delivery_method_id'],
                        'price' => $validationData['price'],
                        // Add timestamps if your table uses them
                        // 'created_at' => now(),
                        // 'updated_at' => now(),
                    ];
                }
            }

            // --- Decision Phase ---
            if ($errorCount > 0) {
                return response()->json([
                    'message' => 'Validation failed. Please check the errors below.',
                    'processed_rows' => 0,
                    'skipped_rows' => $errorCount,
                    'errors' => $errors,
                ], 422);
            }

            // --- Database Transaction Phase ---
            DB::transaction(function () use ($producer, $validRows, &$processedCount) {
                ProducerShippingRate::where('producer_id', $producer->id)->delete();
                if (!empty($validRows)) {
                    ProducerShippingRate::insert($validRows);
                    $processedCount = count($validRows);
                } else {
                    $processedCount = 0;
                }
            });

        } catch (\League\Csv\Exception $e) {
             Log::error("CSV Parsing Error during producer rates upload: " . $e->getMessage(), ['producer_id' => $producer->id]);
             return response()->json(['message' => 'Error reading or parsing the CSV file.', 'details' => $e->getMessage()], 400);
        } catch (\Illuminate\Database\QueryException $e) {
             Log::error("Database Error during producer rates upload: " . $e->getMessage(), ['producer_id' => $producer->id]);
             return response()->json(['message' => 'A database error occurred while saving the rates.'], 500);
        } catch (\Exception $e) {
            Log::error("Unexpected Error processing producer rates CSV upload: " . $e->getMessage(), ['producer_id' => $producer->id, 'trace' => $e->getTraceAsString()]);
            return response()->json(['message' => 'An unexpected error occurred.'], 500);
        }

        // --- Success Response ---
        return response()->json([
            'message' => "Successfully processed CSV and updated rates.",
            'processed_rows' => $processedCount,
            'skipped_rows' => $errorCount, // Should be 0 if we reached here
            'errors' => $errors, // Should be empty if we reached here
         ]);
     }

    /**
     * Get the producer's custom shipping rates.
     */
    public function getRates(Request $request)
    {
        $producer = $request->user()->producer;
        if (!$producer) {
            return response()->json(['message' => 'Producer profile not found.'], 404);
        }

        // Retrieve all rates for this producer
        $rates = ProducerShippingRate::where('producer_id', $producer->id)
            ->with(['shippingZone:id,name', 'deliveryMethod:id,code,name', 'weightTier:id,code,description']) // Eager load relations
            ->orderBy('shipping_zone_id')
            ->orderBy('delivery_method_id') // Order by ID
            ->orderBy('weight_tier_id') // Order by ID
            ->get();

        // Format response to include codes/names directly if needed by frontend
        $formattedRates = $rates->map(function ($rate) {
            return [
                'id' => $rate->id,
                'producer_id' => $rate->producer_id,
                'shipping_zone_id' => $rate->shipping_zone_id,
                'shipping_zone_name' => $rate->shippingZone?->name,
                'weight_tier_id' => $rate->weight_tier_id,
                'weight_tier_code' => $rate->weightTier?->code,
                'weight_tier_description' => $rate->weightTier?->description,
                'delivery_method_id' => $rate->delivery_method_id,
                'delivery_method_code' => $rate->deliveryMethod?->code,
                'delivery_method_name' => $rate->deliveryMethod?->name,
                'price' => $rate->price,
            ];
        });


        return response()->json($formattedRates);
    }

}
