<?php

namespace App\Http\Controllers\Api;

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
     * Display a listing of adoptable items.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $query = AdoptableItem::with(['producer', 'adoptionPlans'])
            ->where('status', 'available');
        
        // Apply filters
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }
        
        if ($request->has('producer_id')) {
            $query->where('producer_id', $request->producer_id);
        }
        
        if ($request->has('featured') && $request->featured) {
            $query->where('featured', true);
        }
        
        // Apply sorting
        $sortBy = $request->sort_by ?? 'created_at';
        $sortOrder = $request->sort_order ?? 'desc';
        $query->orderBy($sortBy, $sortOrder);
        
        // Paginate results
        $perPage = $request->per_page ?? 12;
        $adoptableItems = $query->paginate($perPage);
        
        return response()->json($adoptableItems);
    }
    
    /**
     * Display the specified adoptable item.
     *
     * @param string $slug
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(string $slug)
    {
        $adoptableItem = AdoptableItem::with(['producer', 'adoptionPlans'])
            ->where('slug', $slug)
            ->firstOrFail();
        
        return response()->json($adoptableItem);
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
            return response()->json(['message' => 'You must be a producer to create adoptable items.'], 403);
        }
        
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'type' => 'required|string|max:255',
            'location' => 'required|string|max:255',
            'main_image' => 'nullable|image|max:2048',
            'gallery_images.*' => 'nullable|image|max:2048',
            'attributes' => 'nullable|array',
            'featured' => 'nullable|boolean',
        ]);
        
        // Generate slug
        $slug = Str::slug($validatedData['name']);
        $baseSlug = $slug;
        $counter = 1;
        
        // Ensure slug is unique
        while (AdoptableItem::where('slug', $slug)->exists()) {
            $slug = $baseSlug . '-' . $counter;
            $counter++;
        }
        
        // Handle main image upload
        $mainImagePath = null;
        if ($request->hasFile('main_image')) {
            $mainImagePath = $request->file('main_image')->store('adoptable_items', 'public');
        }
        
        // Handle gallery images upload
        $galleryImagePaths = [];
        if ($request->hasFile('gallery_images')) {
            foreach ($request->file('gallery_images') as $image) {
                $galleryImagePaths[] = $image->store('adoptable_items', 'public');
            }
        }
        
        // Create adoptable item
        $adoptableItem = new AdoptableItem([
            'producer_id' => $producer->id,
            'name' => $validatedData['name'],
            'slug' => $slug,
            'description' => $validatedData['description'],
            'type' => $validatedData['type'],
            'location' => $validatedData['location'],
            'status' => 'available',
            'main_image' => $mainImagePath,
            'gallery_images' => $galleryImagePaths,
            'attributes' => $validatedData['attributes'] ?? null,
            'featured' => $validatedData['featured'] ?? false,
        ]);
        
        $adoptableItem->save();
        
        return response()->json($adoptableItem, 201);
    }
    
    /**
     * Update the specified adoptable item.
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, int $id)
    {
        $user = Auth::user();
        $producer = $user->producer;
        
        if (!$producer) {
            return response()->json(['message' => 'You must be a producer to update adoptable items.'], 403);
        }
        
        $adoptableItem = AdoptableItem::findOrFail($id);
        
        // Check if the adoptable item belongs to the producer
        if ($adoptableItem->producer_id !== $producer->id) {
            return response()->json(['message' => 'You do not have permission to update this adoptable item.'], 403);
        }
        
        $validatedData = $request->validate([
            'name' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'type' => 'nullable|string|max:255',
            'location' => 'nullable|string|max:255',
            'status' => 'nullable|in:available,unavailable',
            'main_image' => 'nullable|image|max:2048',
            'gallery_images.*' => 'nullable|image|max:2048',
            'attributes' => 'nullable|array',
            'featured' => 'nullable|boolean',
        ]);
        
        // Update slug if name is changed
        if (isset($validatedData['name']) && $validatedData['name'] !== $adoptableItem->name) {
            $slug = Str::slug($validatedData['name']);
            $baseSlug = $slug;
            $counter = 1;
            
            // Ensure slug is unique
            while (AdoptableItem::where('slug', $slug)->where('id', '!=', $id)->exists()) {
                $slug = $baseSlug . '-' . $counter;
                $counter++;
            }
            
            $validatedData['slug'] = $slug;
        }
        
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
            // Delete old images if exists
            if ($adoptableItem->gallery_images) {
                foreach ($adoptableItem->gallery_images as $image) {
                    Storage::disk('public')->delete($image);
                }
            }
            
            $galleryImagePaths = [];
            foreach ($request->file('gallery_images') as $image) {
                $galleryImagePaths[] = $image->store('adoptable_items', 'public');
            }
            
            $validatedData['gallery_images'] = $galleryImagePaths;
        }
        
        // Update adoptable item
        $adoptableItem->update($validatedData);
        
        return response()->json($adoptableItem);
    }
    
    /**
     * Remove the specified adoptable item.
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(int $id)
    {
        $user = Auth::user();
        $producer = $user->producer;
        
        if (!$producer) {
            return response()->json(['message' => 'You must be a producer to delete adoptable items.'], 403);
        }
        
        $adoptableItem = AdoptableItem::findOrFail($id);
        
        // Check if the adoptable item belongs to the producer
        if ($adoptableItem->producer_id !== $producer->id) {
            return response()->json(['message' => 'You do not have permission to delete this adoptable item.'], 403);
        }
        
        // Check if the adoptable item has active adoptions
        if ($adoptableItem->activeAdoptions()->exists()) {
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
        
        // Delete adoptable item
        $adoptableItem->delete();
        
        return response()->json(['message' => 'Adoptable item deleted successfully.']);
    }
    
    /**
     * Store a new adoption plan for an adoptable item.
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function storePlan(Request $request, int $id)
    {
        $user = Auth::user();
        $producer = $user->producer;
        
        if (!$producer) {
            return response()->json(['message' => 'You must be a producer to create adoption plans.'], 403);
        }
        
        $adoptableItem = AdoptableItem::findOrFail($id);
        
        // Check if the adoptable item belongs to the producer
        if ($adoptableItem->producer_id !== $producer->id) {
            return response()->json(['message' => 'You do not have permission to create adoption plans for this adoptable item.'], 403);
        }
        
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'duration_months' => 'required|integer|min:1',
            'benefits' => 'nullable|array',
            'active' => 'nullable|boolean',
        ]);
        
        // Create adoption plan
        $adoptionPlan = new AdoptionPlan([
            'adoptable_item_id' => $adoptableItem->id,
            'name' => $validatedData['name'],
            'description' => $validatedData['description'],
            'price' => $validatedData['price'],
            'duration_months' => $validatedData['duration_months'],
            'benefits' => $validatedData['benefits'] ?? null,
            'active' => $validatedData['active'] ?? true,
        ]);
        
        $adoptionPlan->save();
        
        return response()->json($adoptionPlan, 201);
    }
    
    /**
     * Update an adoption plan.
     *
     * @param Request $request
     * @param int $id
     * @param int $planId
     * @return \Illuminate\Http\JsonResponse
     */
    public function updatePlan(Request $request, int $id, int $planId)
    {
        $user = Auth::user();
        $producer = $user->producer;
        
        if (!$producer) {
            return response()->json(['message' => 'You must be a producer to update adoption plans.'], 403);
        }
        
        $adoptableItem = AdoptableItem::findOrFail($id);
        
        // Check if the adoptable item belongs to the producer
        if ($adoptableItem->producer_id !== $producer->id) {
            return response()->json(['message' => 'You do not have permission to update adoption plans for this adoptable item.'], 403);
        }
        
        $adoptionPlan = AdoptionPlan::where('adoptable_item_id', $id)
            ->where('id', $planId)
            ->firstOrFail();
        
        $validatedData = $request->validate([
            'name' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'price' => 'nullable|numeric|min:0',
            'duration_months' => 'nullable|integer|min:1',
            'benefits' => 'nullable|array',
            'active' => 'nullable|boolean',
        ]);
        
        // Update adoption plan
        $adoptionPlan->update($validatedData);
        
        return response()->json($adoptionPlan);
    }
    
    /**
     * Remove an adoption plan.
     *
     * @param int $id
     * @param int $planId
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroyPlan(int $id, int $planId)
    {
        $user = Auth::user();
        $producer = $user->producer;
        
        if (!$producer) {
            return response()->json(['message' => 'You must be a producer to delete adoption plans.'], 403);
        }
        
        $adoptableItem = AdoptableItem::findOrFail($id);
        
        // Check if the adoptable item belongs to the producer
        if ($adoptableItem->producer_id !== $producer->id) {
            return response()->json(['message' => 'You do not have permission to delete adoption plans for this adoptable item.'], 403);
        }
        
        $adoptionPlan = AdoptionPlan::where('adoptable_item_id', $id)
            ->where('id', $planId)
            ->firstOrFail();
        
        // Check if the adoption plan has active adoptions
        if ($adoptionPlan->adoptions()->where('status', 'active')->exists()) {
            return response()->json(['message' => 'Cannot delete an adoption plan with active adoptions.'], 400);
        }
        
        // Delete adoption plan
        $adoptionPlan->delete();
        
        return response()->json(['message' => 'Adoption plan deleted successfully.']);
    }
}
