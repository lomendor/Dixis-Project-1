<?php

namespace App\Http\Controllers\Api\Producer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Adoption;
use App\Models\AdoptableItem;

class AdoptionController extends Controller
{
    /**
     * Get all adoptions for the producer
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $producer = auth()->user()->producer;
        
        $query = Adoption::whereHas('adoptableItem', function ($query) use ($producer) {
            $query->where('producer_id', $producer->id);
        })->with(['user', 'adoptableItem', 'adoptionPlan']);
        
        // Filter by status if provided
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }
        
        $adoptions = $query->orderBy('created_at', 'desc')->paginate(10);
        
        return response()->json($adoptions);
    }
    
    /**
     * Get a specific adoption
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $producer = auth()->user()->producer;
        
        $adoption = Adoption::with(['user', 'adoptableItem', 'adoptionPlan'])
            ->whereHas('adoptableItem', function ($query) use ($producer) {
                $query->where('producer_id', $producer->id);
            })
            ->findOrFail($id);
        
        return response()->json($adoption);
    }
    
    /**
     * Get statistics for adoptions
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getStats()
    {
        $producer = auth()->user()->producer;
        
        // Get total adoptions
        $totalAdoptions = Adoption::whereHas('adoptableItem', function ($query) use ($producer) {
            $query->where('producer_id', $producer->id);
        })->count();
        
        // Get active adoptions
        $activeAdoptions = Adoption::whereHas('adoptableItem', function ($query) use ($producer) {
            $query->where('producer_id', $producer->id);
        })->where('status', 'active')->count();
        
        // Get expired adoptions
        $expiredAdoptions = Adoption::whereHas('adoptableItem', function ($query) use ($producer) {
            $query->where('producer_id', $producer->id);
        })->where('status', 'expired')->count();
        
        // Get total revenue from adoptions
        $totalRevenue = Adoption::whereHas('adoptableItem', function ($query) use ($producer) {
            $query->where('producer_id', $producer->id);
        })->sum('price_paid');
        
        // Get total adoptable items
        $totalAdoptableItems = AdoptableItem::where('producer_id', $producer->id)->count();
        
        // Get available adoptable items
        $availableAdoptableItems = AdoptableItem::where('producer_id', $producer->id)
            ->where('status', 'available')
            ->count();
        
        return response()->json([
            'total_adoptions' => $totalAdoptions,
            'active_adoptions' => $activeAdoptions,
            'expired_adoptions' => $expiredAdoptions,
            'total_revenue' => $totalRevenue,
            'total_adoptable_items' => $totalAdoptableItems,
            'available_adoptable_items' => $availableAdoptableItems,
        ]);
    }
}
