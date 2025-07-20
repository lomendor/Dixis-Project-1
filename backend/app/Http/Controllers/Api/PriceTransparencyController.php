<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Product;
use App\Services\PriceTransparencyService;
use Illuminate\Support\Facades\Validator;

class PriceTransparencyController extends Controller
{
    protected $priceTransparencyService;

    public function __construct(PriceTransparencyService $priceTransparencyService)
    {
        $this->priceTransparencyService = $priceTransparencyService;
    }

    /**
     * Get the cost breakdown for a product
     *
     * @param  string  $slug
     * @return \Illuminate\Http\JsonResponse
     */
    public function getBreakdown($slug)
    {
        $product = Product::where('slug', $slug)->firstOrFail();
        
        $breakdown = $this->priceTransparencyService->calculateBreakdown($product);
        
        return response()->json($breakdown);
    }
    
    /**
     * Save the cost breakdown for a product
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $productId
     * @return \Illuminate\Http\JsonResponse
     */
    public function saveBreakdown(Request $request, $productId)
    {
        // Check if the user is the producer of the product or an admin
        $product = Product::findOrFail($productId);
        
        if (auth()->user()->hasRole('producer') && auth()->user()->producer->id !== $product->producer_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        if (!auth()->user()->hasRole('producer') && !auth()->user()->hasRole('admin')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        // Validate the request
        $validator = Validator::make($request->all(), [
            'producer_cost' => 'nullable|numeric|min:0',
            'packaging_cost' => 'nullable|numeric|min:0',
            'producer_profit_target' => 'nullable|numeric|min:0',
            'platform_fee_percentage' => 'nullable|numeric|min:0|max:100',
            'shipping_estimate' => 'nullable|numeric|min:0',
            'taxes_estimate' => 'nullable|numeric|min:0',
        ]);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        // Save the breakdown
        $breakdown = $this->priceTransparencyService->saveBreakdown($product, $request->all());
        
        // Calculate the updated breakdown
        $calculatedBreakdown = $this->priceTransparencyService->calculateBreakdown($product);
        
        return response()->json([
            'breakdown' => $breakdown,
            'calculated' => $calculatedBreakdown,
        ]);
    }
}
