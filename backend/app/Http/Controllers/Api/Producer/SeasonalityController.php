<?php

namespace App\Http\Controllers\Api\Producer;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SeasonalityController extends Controller
{
    /**
     * Update seasonality data for producer's products.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'seasonality' => 'required|array',
            'seasonality.*' => 'array',
            'seasonality.*.*' => 'in:high,medium,low,none'
        ]);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        // Get the producer ID from the authenticated user
        $producerId = auth()->user()->producer->id;
        
        $seasonalityData = $request->seasonality;
        
        foreach ($seasonalityData as $productId => $seasonality) {
            // Ensure the product belongs to this producer
            $product = Product::where('id', $productId)
                ->where('producer_id', $producerId)
                ->first();
                
            if ($product) {
                $product->update(['seasonality' => $seasonality]);
            }
        }
        
        return response()->json([
            'success' => true,
            'message' => 'Seasonality updated successfully'
        ]);
    }
}