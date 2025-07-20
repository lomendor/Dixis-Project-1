<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Producer;
use App\Models\Product;
use Illuminate\Http\Request;

class ProducerSeasonalityController extends Controller
{
    /**
     * Get seasonality data for a producer's products.
     *
     * @param int $producerId
     * @return \Illuminate\Http\JsonResponse
     */
    public function index($producerId)
    {
        $products = Product::where('producer_id', $producerId)
            ->select('id', 'name', 'category_id', 'seasonality')
            ->with('categories:id,name')
            ->get()
            ->map(function ($product) {
                // Transform to include category name directly
                $categories = $product->categories->map(function($category) {
                    return $category->name;
                });
                
                $product->category = $categories->isNotEmpty() ? $categories->first() : null;
                unset($product->categories);
                return $product;
            });
            
        return response()->json([
            'products' => $products
        ]);
    }
}