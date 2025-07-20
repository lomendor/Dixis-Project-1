<?php

namespace App\Http\Controllers\Api\Producer;

use App\Http\Controllers\Controller;
use App\Models\AdoptableItem;
use App\Models\AdoptionPlan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AdoptableItemController extends Controller
{
    /**
     * Display a listing of the producer's adoptable items.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $producer = $user->producer;

        if (!$producer) {
            return response()->json(['message' => 'Producer not found.'], 404);
        }

        $adoptableItems = $producer->adoptableItems()
            ->with('adoptionPlans')
            ->orderBy('created_at', 'desc')
            ->paginate($request->input('per_page', 10));

        return response()->json($adoptableItems);
    }

    /**
     * Store a newly created adoptable item.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $user = Auth::user();
        $producer = $user->producer;

        if (!$producer) {
            return response()->json(['message' => 'Producer not found.'], 404);
        }

        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'type' => 'required|string|in:olive_tree,vineyard,beehive,fruit_tree',
            'location' => 'required|string|max:255',
            'main_image' => 'nullable|image|max:2048',
            'gallery_images.*' => 'nullable|image|max:2048',
            'attributes' => 'nullable|json',
            'featured' => 'nullable|boolean',
        ]);

        // Handle main image upload
        if ($request->hasFile('main_image')) {
            $validatedData['main_image'] = $request->file('main_image')->store('adoptable_items', 'public');
        }

        // Handle gallery images upload
        $galleryImages = [];
        if ($request->hasFile('gallery_images')) {
            foreach ($request->file('gallery_images') as $image) {
                $galleryImages[] = $image->store('adoptable_items', 'public');
            }
        }
        $validatedData['gallery_images'] = $galleryImages;

        // Parse attributes JSON
        if (isset($validatedData['attributes'])) {
            $validatedData['attributes'] = json_decode($validatedData['attributes'], true);
        }

        // Generate slug
        $validatedData['slug'] = Str::slug($validatedData['name'] . '-' . uniqid());

        // Set status to available
        $validatedData['status'] = 'available';

        // Create the adoptable item
        $adoptableItem = $producer->adoptableItems()->create($validatedData);

        return response()->json($adoptableItem, 201);
    }

    /**
     * Display the specified adoptable item.
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $user = Auth::user();
        $producer = $user->producer;

        if (!$producer) {
            return response()->json(['message' => 'Producer not found.'], 404);
        }

        $adoptableItem = $producer->adoptableItems()
            ->with('adoptionPlans')
            ->findOrFail($id);

        return response()->json($adoptableItem);
    }

    /**
     * Update the specified adoptable item.
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $user = Auth::user();
        $producer = $user->producer;

        if (!$producer) {
            return response()->json(['message' => 'Producer not found.'], 404);
        }

        $adoptableItem = $producer->adoptableItems()->findOrFail($id);

        $validatedData = $request->validate([
            'name' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'type' => 'nullable|string|in:olive_tree,vineyard,beehive,fruit_tree',
            'location' => 'nullable|string|max:255',
            'main_image' => 'nullable|image|max:2048',
            'gallery_images.*' => 'nullable|image|max:2048',
            'attributes' => 'nullable|json',
            'featured' => 'nullable|boolean',
            'status' => 'nullable|string|in:available,adopted,unavailable',
        ]);

        // Handle main image upload
        if ($request->hasFile('main_image')) {
            // Delete old image if exists
            if ($adoptableItem->main_image) {
                Storage::disk('public')->delete($adoptableItem->main_image);
            }

            $validatedData['main_image'] = $request->file('main_image')->store('adoptable_items', 'public');
        }

        // Handle gallery images upload
        if ($request->hasFile('gallery_images')) {
            $galleryImages = $adoptableItem->gallery_images ?? [];

            foreach ($request->file('gallery_images') as $image) {
                $galleryImages[] = $image->store('adoptable_items', 'public');
            }

            $validatedData['gallery_images'] = $galleryImages;
        }

        // Parse attributes JSON
        if (isset($validatedData['attributes'])) {
            $validatedData['attributes'] = json_decode($validatedData['attributes'], true);
        }

        // Update the adoptable item
        $adoptableItem->update($validatedData);

        return response()->json($adoptableItem);
    }

    /**
     * Remove the specified adoptable item.
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        $user = Auth::user();
        $producer = $user->producer;

        if (!$producer) {
            return response()->json(['message' => 'Producer not found.'], 404);
        }

        $adoptableItem = $producer->adoptableItems()->findOrFail($id);

        // Check if the adoptable item has active adoptions
        if ($adoptableItem->adoptions()->where('status', 'active')->exists()) {
            return response()->json(['message' => 'Cannot delete an adoptable item with active adoptions.'], 400);
        }

        // Delete images
        if ($adoptableItem->main_image) {
            Storage::disk('public')->delete($adoptableItem->main_image);
        }

        if ($adoptableItem->gallery_images) {
            foreach ($adoptableItem->gallery_images as $image) {
                Storage::disk('public')->delete($image);
            }
        }

        // Delete adoption plans
        $adoptableItem->adoptionPlans()->delete();

        // Delete the adoptable item
        $adoptableItem->delete();

        return response()->json(['message' => 'Adoptable item deleted successfully.']);
    }

    /**
     * Get all adoption plans for an adoptable item.
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function getPlans($id)
    {
        $user = Auth::user();
        $producer = $user->producer;

        if (!$producer) {
            return response()->json(['message' => 'Producer not found.'], 404);
        }

        $adoptableItem = $producer->adoptableItems()->findOrFail($id);
        $adoptionPlans = $adoptableItem->adoptionPlans;

        return response()->json($adoptionPlans);
    }

    /**
     * Store a newly created adoption plan for the adoptable item.
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function storePlan(Request $request, $id)
    {
        $user = Auth::user();
        $producer = $user->producer;

        if (!$producer) {
            return response()->json(['message' => 'Producer not found.'], 404);
        }

        $adoptableItem = $producer->adoptableItems()->findOrFail($id);

        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'duration_months' => 'required|integer|min:1',
            'benefits' => 'nullable|array',
            'active' => 'nullable|boolean',
        ]);

        // Create the adoption plan
        $adoptionPlan = $adoptableItem->adoptionPlans()->create($validatedData);

        return response()->json($adoptionPlan, 201);
    }

    /**
     * Update the specified adoption plan.
     *
     * @param Request $request
     * @param int $id
     * @param int $planId
     * @return \Illuminate\Http\JsonResponse
     */
    public function updatePlan(Request $request, $id, $planId)
    {
        $user = Auth::user();
        $producer = $user->producer;

        if (!$producer) {
            return response()->json(['message' => 'Producer not found.'], 404);
        }

        $adoptableItem = $producer->adoptableItems()->findOrFail($id);
        $adoptionPlan = $adoptableItem->adoptionPlans()->findOrFail($planId);

        $validatedData = $request->validate([
            'name' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'price' => 'nullable|numeric|min:0',
            'duration_months' => 'nullable|integer|min:1',
            'benefits' => 'nullable|array',
            'active' => 'nullable|boolean',
        ]);

        // Update the adoption plan
        $adoptionPlan->update($validatedData);

        return response()->json($adoptionPlan);
    }

    /**
     * Remove the specified adoption plan.
     *
     * @param int $id
     * @param int $planId
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroyPlan($id, $planId)
    {
        $user = Auth::user();
        $producer = $user->producer;

        if (!$producer) {
            return response()->json(['message' => 'Producer not found.'], 404);
        }

        $adoptableItem = $producer->adoptableItems()->findOrFail($id);
        $adoptionPlan = $adoptableItem->adoptionPlans()->findOrFail($planId);

        // Check if the adoption plan has active adoptions
        if ($adoptionPlan->adoptions()->where('status', 'active')->exists()) {
            return response()->json(['message' => 'Cannot delete an adoption plan with active adoptions.'], 400);
        }

        // Delete the adoption plan
        $adoptionPlan->delete();

        return response()->json(['message' => 'Adoption plan deleted successfully.']);
    }
}
