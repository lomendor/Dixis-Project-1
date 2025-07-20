<?php

namespace App\Http\Controllers\Api\Producer;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductCostBreakdown;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ProductCostController extends Controller
{
    /**
     * Store or update cost breakdown for a product
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function store(Request $request, int $id): JsonResponse
    {
        $producer = auth()->user()->producer;
        
        if (!$producer) {
            return response()->json(['message' => 'Δεν βρέθηκε ο παραγωγός'], 404);
        }

        // Find product and verify ownership
        $product = Product::where('id', $id)
            ->where('producer_id', $producer->id)
            ->firstOrFail();

        $validated = $request->validate([
            'production_cost' => 'required|numeric|min:0',
            'packaging_cost' => 'required|numeric|min:0',
            'labor_cost' => 'required|numeric|min:0',
            'transportation_cost' => 'required|numeric|min:0',
            'platform_fee' => 'required|numeric|min:0',
            'other_costs' => 'nullable|numeric|min:0',
            'profit_margin' => 'required|numeric|min:0',
            'notes' => 'nullable|string|max:1000',
            'breakdown_details' => 'nullable|array',
            'breakdown_details.*.category' => 'required_with:breakdown_details|string|max:255',
            'breakdown_details.*.description' => 'required_with:breakdown_details|string|max:500',
            'breakdown_details.*.amount' => 'required_with:breakdown_details|numeric|min:0',
        ]);

        // Calculate total cost
        $totalCost = $validated['production_cost'] + 
                    $validated['packaging_cost'] + 
                    $validated['labor_cost'] + 
                    $validated['transportation_cost'] + 
                    $validated['platform_fee'] + 
                    ($validated['other_costs'] ?? 0);

        // Calculate final price
        $finalPrice = $totalCost + $validated['profit_margin'];

        // Create or update cost breakdown
        $costBreakdown = ProductCostBreakdown::updateOrCreate(
            ['product_id' => $product->id],
            [
                'production_cost' => $validated['production_cost'],
                'packaging_cost' => $validated['packaging_cost'],
                'labor_cost' => $validated['labor_cost'],
                'transportation_cost' => $validated['transportation_cost'],
                'platform_fee' => $validated['platform_fee'],
                'other_costs' => $validated['other_costs'] ?? 0,
                'profit_margin' => $validated['profit_margin'],
                'total_cost' => $totalCost,
                'final_price' => $finalPrice,
                'notes' => $validated['notes'] ?? null,
                'breakdown_details' => $validated['breakdown_details'] ?? null,
            ]
        );

        // Update product price if different
        if ($product->price != $finalPrice) {
            $product->price = $finalPrice;
            $product->save();
        }

        return response()->json([
            'message' => 'Η ανάλυση κόστους ενημερώθηκε επιτυχώς',
            'cost_breakdown' => $costBreakdown,
            'product' => $product
        ]);
    }

    /**
     * Get cost breakdown for a product
     *
     * @param int $id
     * @return JsonResponse
     */
    public function show(int $id): JsonResponse
    {
        $producer = auth()->user()->producer;
        
        if (!$producer) {
            return response()->json(['message' => 'Δεν βρέθηκε ο παραγωγός'], 404);
        }

        $product = Product::where('id', $id)
            ->where('producer_id', $producer->id)
            ->with('costBreakdown')
            ->firstOrFail();

        if (!$product->costBreakdown) {
            return response()->json([
                'message' => 'Δεν υπάρχει ανάλυση κόστους για αυτό το προϊόν',
                'product' => $product
            ], 404);
        }

        return response()->json([
            'product' => $product,
            'cost_breakdown' => $product->costBreakdown,
            'cost_percentage' => $this->calculateCostPercentages($product->costBreakdown)
        ]);
    }

    /**
     * Delete cost breakdown for a product
     *
     * @param int $id
     * @return JsonResponse
     */
    public function destroy(int $id): JsonResponse
    {
        $producer = auth()->user()->producer;
        
        if (!$producer) {
            return response()->json(['message' => 'Δεν βρέθηκε ο παραγωγός'], 404);
        }

        $product = Product::where('id', $id)
            ->where('producer_id', $producer->id)
            ->firstOrFail();

        $costBreakdown = ProductCostBreakdown::where('product_id', $product->id)->first();

        if (!$costBreakdown) {
            return response()->json(['message' => 'Δεν υπάρχει ανάλυση κόστους για διαγραφή'], 404);
        }

        $costBreakdown->delete();

        return response()->json([
            'message' => 'Η ανάλυση κόστους διαγράφηκε επιτυχώς'
        ]);
    }

    /**
     * Calculate cost percentages for visualization
     *
     * @param ProductCostBreakdown $costBreakdown
     * @return array
     */
    private function calculateCostPercentages(ProductCostBreakdown $costBreakdown): array
    {
        $total = $costBreakdown->total_cost;
        
        if ($total == 0) {
            return [];
        }

        return [
            'production' => round(($costBreakdown->production_cost / $total) * 100, 2),
            'packaging' => round(($costBreakdown->packaging_cost / $total) * 100, 2),
            'labor' => round(($costBreakdown->labor_cost / $total) * 100, 2),
            'transportation' => round(($costBreakdown->transportation_cost / $total) * 100, 2),
            'platform_fee' => round(($costBreakdown->platform_fee / $total) * 100, 2),
            'other' => round(($costBreakdown->other_costs / $total) * 100, 2),
        ];
    }
}