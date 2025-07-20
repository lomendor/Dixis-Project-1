<?php

namespace App\Http\Controllers\Api\Producer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Adoption;
use App\Models\AdoptionUpdate;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

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
        
        // Check if the adoption belongs to the producer
        if ($adoption->adoptableItem->producer_id !== auth()->user()->producer->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        $updates = AdoptionUpdate::where('adoption_id', $adoptionId)
            ->orderBy('created_at', 'desc')
            ->get();
        
        return response()->json($updates);
    }
    
    /**
     * Store a new update for an adoption
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $adoptionId
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request, $adoptionId)
    {
        $adoption = Adoption::findOrFail($adoptionId);
        
        // Check if the adoption belongs to the producer
        if ($adoption->adoptableItem->producer_id !== auth()->user()->producer->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'images.*' => 'nullable|image|max:2048',
        ]);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        // Handle image uploads
        $images = [];
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $path = $image->store('adoption-updates', 'public');
                $images[] = $path;
            }
        }
        
        $update = AdoptionUpdate::create([
            'adoption_id' => $adoptionId,
            'title' => $request->title,
            'content' => $request->content,
            'images' => $images,
        ]);
        
        return response()->json($update, 201);
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
        
        // Check if the adoption belongs to the producer
        if ($adoption->adoptableItem->producer_id !== auth()->user()->producer->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        $update = AdoptionUpdate::where('adoption_id', $adoptionId)
            ->findOrFail($updateId);
        
        return response()->json($update);
    }
    
    /**
     * Update a specific update
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $adoptionId
     * @param  int  $updateId
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $adoptionId, $updateId)
    {
        $adoption = Adoption::findOrFail($adoptionId);
        
        // Check if the adoption belongs to the producer
        if ($adoption->adoptableItem->producer_id !== auth()->user()->producer->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        $update = AdoptionUpdate::where('adoption_id', $adoptionId)
            ->findOrFail($updateId);
        
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'images.*' => 'nullable|image|max:2048',
        ]);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        // Handle image uploads
        $images = $update->images ?? [];
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $path = $image->store('adoption-updates', 'public');
                $images[] = $path;
            }
        }
        
        $update->update([
            'title' => $request->title,
            'content' => $request->content,
            'images' => $images,
        ]);
        
        return response()->json($update);
    }
    
    /**
     * Delete a specific update
     *
     * @param  int  $adoptionId
     * @param  int  $updateId
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($adoptionId, $updateId)
    {
        $adoption = Adoption::findOrFail($adoptionId);
        
        // Check if the adoption belongs to the producer
        if ($adoption->adoptableItem->producer_id !== auth()->user()->producer->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        $update = AdoptionUpdate::where('adoption_id', $adoptionId)
            ->findOrFail($updateId);
        
        // Delete images
        if (!empty($update->images)) {
            foreach ($update->images as $image) {
                Storage::disk('public')->delete($image);
            }
        }
        
        $update->delete();
        
        return response()->json(null, 204);
    }
}
