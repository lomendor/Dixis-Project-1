<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\AdoptableItem;
use App\Models\Producer;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class AdoptableItemController extends Controller
{
    /**
     * Display a listing of the adoptable items.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $query = AdoptableItem::with(['producer:id,business_name']);

        // Filter by producer
        if ($request->has('producer_id')) {
            $query->where('producer_id', $request->producer_id);
        }

        // Filter by type
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Search by name
        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        // Sort
        $sortField = $request->input('sort_field', 'created_at');
        $sortDirection = $request->input('sort_direction', 'desc');
        $query->orderBy($sortField, $sortDirection);

        // Paginate
        $perPage = $request->input('per_page', 15);
        $adoptableItems = $query->paginate($perPage);

        return response()->json($adoptableItems);
    }

    /**
     * Store a newly created adoptable item.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'type' => 'required|string|max:50',
            'location' => 'required|string|max:255',
            'status' => 'required|string|in:available,adopted,unavailable',
            'producer_id' => 'required|exists:producers,id',
            'attributes' => 'nullable|array',
            'featured' => 'boolean',
            'main_image' => 'nullable|image|max:2048',
            'gallery_images.*' => 'nullable|image|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Generate slug
        $slug = Str::slug($request->name);
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
            $mainImagePath = $request->file('main_image')->store('adoptable-items', 'public');
        }

        // Handle gallery images upload
        $galleryImages = [];
        if ($request->hasFile('gallery_images')) {
            foreach ($request->file('gallery_images') as $image) {
                $galleryImages[] = $image->store('adoptable-items', 'public');
            }
        }

        // Create adoptable item
        $adoptableItem = AdoptableItem::create([
            'name' => $request->name,
            'slug' => $slug,
            'description' => $request->description,
            'type' => $request->type,
            'location' => $request->location,
            'status' => $request->status,
            'producer_id' => $request->producer_id,
            'main_image' => $mainImagePath,
            'gallery_images' => $galleryImages,
            'attributes' => $request->attributes ?? [],
            'featured' => $request->featured ?? false,
        ]);

        return response()->json($adoptableItem, 201);
    }

    /**
     * Display the specified adoptable item.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $adoptableItem = AdoptableItem::with(['producer:id,business_name,logo,description'])->findOrFail($id);
        return response()->json($adoptableItem);
    }

    /**
     * Update the specified adoptable item.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $adoptableItem = AdoptableItem::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'type' => 'sometimes|required|string|max:50',
            'location' => 'sometimes|required|string|max:255',
            'status' => 'sometimes|required|string|in:available,adopted,unavailable',
            'producer_id' => 'sometimes|required|exists:producers,id',
            'attributes' => 'nullable|array',
            'featured' => 'boolean',
            'main_image' => 'nullable|image|max:2048',
            'gallery_images.*' => 'nullable|image|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Update slug if name is changed
        if ($request->has('name') && $request->name !== $adoptableItem->name) {
            $slug = Str::slug($request->name);
            $baseSlug = $slug;
            $counter = 1;

            // Ensure slug is unique
            while (AdoptableItem::where('slug', $slug)->where('id', '!=', $id)->exists()) {
                $slug = $baseSlug . '-' . $counter;
                $counter++;
            }

            $adoptableItem->slug = $slug;
        }

        // Handle main image upload
        if ($request->hasFile('main_image')) {
            // Delete old image if exists
            if ($adoptableItem->main_image) {
                Storage::disk('public')->delete($adoptableItem->main_image);
            }

            $mainImagePath = $request->file('main_image')->store('adoptable-items', 'public');
            $adoptableItem->main_image = $mainImagePath;
        }

        // Handle gallery images upload
        if ($request->hasFile('gallery_images')) {
            // Delete old gallery images if exists
            if (!empty($adoptableItem->gallery_images)) {
                foreach ($adoptableItem->gallery_images as $image) {
                    Storage::disk('public')->delete($image);
                }
            }

            $galleryImages = [];
            foreach ($request->file('gallery_images') as $image) {
                $galleryImages[] = $image->store('adoptable-items', 'public');
            }

            $adoptableItem->gallery_images = $galleryImages;
        }

        // Update other fields
        $fillable = [
            'name', 'description', 'type', 'location', 'status',
            'producer_id', 'attributes', 'featured'
        ];

        foreach ($fillable as $field) {
            if ($request->has($field)) {
                $adoptableItem->$field = $request->$field;
            }
        }

        $adoptableItem->save();

        return response()->json($adoptableItem);
    }

    /**
     * Remove the specified adoptable item.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        $adoptableItem = AdoptableItem::findOrFail($id);

        // Check if the item has active adoptions
        if ($adoptableItem->adoptions()->where('status', 'active')->exists()) {
            return response()->json([
                'message' => 'Cannot delete adoptable item with active adoptions'
            ], 422);
        }

        // Delete images
        if ($adoptableItem->main_image) {
            Storage::disk('public')->delete($adoptableItem->main_image);
        }

        if (!empty($adoptableItem->gallery_images)) {
            foreach ($adoptableItem->gallery_images as $image) {
                Storage::disk('public')->delete($image);
            }
        }

        $adoptableItem->delete();

        return response()->json(null, 204);
    }
}
