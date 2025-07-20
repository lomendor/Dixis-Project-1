<?php

namespace App\Http\Controllers\Api\Consumer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Adoption;
use App\Models\AdoptionUpdate;

class AdoptionUpdateController extends Controller
{
    /**
     * Get all updates for an adoption
     *
     * @param  int  $adoptionId
     * @return \Illuminate\Http\JsonResponse
     */
    public function index($adoptionId)
    {
        $adoption = Adoption::findOrFail($adoptionId);
        
        // Check if the adoption belongs to the user
        if ($adoption->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        $updates = AdoptionUpdate::where('adoption_id', $adoptionId)
            ->orderBy('created_at', 'desc')
            ->get();
        
        return response()->json($updates);
    }
    
    /**
     * Get a specific update
     *
     * @param  int  $adoptionId
     * @param  int  $updateId
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($adoptionId, $updateId)
    {
        $adoption = Adoption::findOrFail($adoptionId);
        
        // Check if the adoption belongs to the user
        if ($adoption->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        $update = AdoptionUpdate::where('adoption_id', $adoptionId)
            ->findOrFail($updateId);
        
        return response()->json($update);
    }
}
