<?php

namespace App\Http\Controllers\Api\Producer;

use App\Http\Controllers\Controller;
use App\Models\Producer;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProfileController extends Controller
{
    /**
     * Get producer profile
     *
     * @return JsonResponse
     */
    public function show(): JsonResponse
    {
        $producer = auth()->user()->producer;
        
        if (!$producer) {
            return response()->json(['message' => 'Δεν βρέθηκε ο παραγωγός'], 404);
        }

        $producer->load([
            'user',
            'products' => function ($q) {
                $q->where('is_active', true)->count();
            },
            'reviews',
            'documents'
        ]);

        // Calculate statistics
        $stats = [
            'total_products' => $producer->products()->count(),
            'active_products' => $producer->products()->where('is_active', true)->count(),
            'total_orders' => $producer->orders()->count(),
            'average_rating' => $producer->reviews()->avg('rating') ?? 0,
            'total_reviews' => $producer->reviews()->count(),
            'adoption_items' => $producer->adoptableItems()->where('is_active', true)->count(),
        ];

        return response()->json([
            'producer' => $producer,
            'stats' => $stats
        ]);
    }

    /**
     * Update producer profile
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function update(Request $request): JsonResponse
    {
        $producer = auth()->user()->producer;
        
        if (!$producer) {
            return response()->json(['message' => 'Δεν βρέθηκε ο παραγωγός'], 404);
        }

        $validated = $request->validate([
            'business_name' => 'sometimes|required|string|max:255',
            'contact_name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'short_description' => 'nullable|string|max:500',
            'phone' => 'sometimes|required|string|max:20',
            'mobile' => 'nullable|string|max:20',
            'address' => 'sometimes|required|string|max:255',
            'city' => 'sometimes|required|string|max:100',
            'region' => 'sometimes|required|string|max:100',
            'postal_code' => 'sometimes|required|string|max:10',
            'website' => 'nullable|url|max:255',
            'email' => 'sometimes|required|email|max:255',
            'tax_id' => 'sometimes|required|string|max:20',
            'bank_account' => 'nullable|string|max:50',
            'social_media' => 'nullable|array',
            'social_media.facebook' => 'nullable|url',
            'social_media.instagram' => 'nullable|url',
            'social_media.twitter' => 'nullable|url',
            'social_media.youtube' => 'nullable|url',
            'certifications' => 'nullable|array',
            'certifications.*' => 'string|max:255',
            'production_methods' => 'nullable|array',
            'production_methods.*' => 'string|in:organic,conventional,hydroponic,greenhouse,free_range',
            'founded_year' => 'nullable|integer|min:1900|max:' . date('Y'),
            'employees_count' => 'nullable|string|in:1-5,6-10,11-20,21-50,50+',
            'story' => 'nullable|string',
            'values' => 'nullable|array',
            'values.*' => 'string|max:255',
            'delivery_areas' => 'nullable|array',
            'delivery_areas.*' => 'string|max:255',
            'min_order_amount' => 'nullable|numeric|min:0',
            'preparation_time' => 'nullable|integer|min:1|max:30',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
        ]);

        // Update producer
        $producer->fill($validated);
        
        // Handle JSON fields
        if (isset($validated['social_media'])) {
            $producer->social_media = $validated['social_media'];
        }
        
        if (isset($validated['certifications'])) {
            $producer->certifications = $validated['certifications'];
        }
        
        if (isset($validated['production_methods'])) {
            $producer->production_methods = $validated['production_methods'];
        }
        
        if (isset($validated['values'])) {
            $producer->values = $validated['values'];
        }
        
        if (isset($validated['delivery_areas'])) {
            $producer->delivery_areas = $validated['delivery_areas'];
        }

        $producer->save();

        return response()->json([
            'message' => 'Το προφίλ ενημερώθηκε επιτυχώς',
            'producer' => $producer
        ]);
    }

    /**
     * Upload producer logo
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function uploadLogo(Request $request): JsonResponse
    {
        $producer = auth()->user()->producer;
        
        if (!$producer) {
            return response()->json(['message' => 'Δεν βρέθηκε ο παραγωγός'], 404);
        }

        $request->validate([
            'logo' => 'required|image|mimes:jpeg,png,jpg,gif,svg|max:2048'
        ]);

        // Delete old logo if exists
        if ($producer->logo) {
            Storage::disk('public')->delete($producer->logo);
        }

        // Store new logo
        $path = $request->file('logo')->store('producers/logos', 'public');
        
        $producer->logo = $path;
        $producer->save();

        return response()->json([
            'message' => 'Το λογότυπο ανέβηκε επιτυχώς',
            'logo_url' => Storage::url($path)
        ]);
    }

    /**
     * Upload producer cover image
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function uploadCover(Request $request): JsonResponse
    {
        $producer = auth()->user()->producer;
        
        if (!$producer) {
            return response()->json(['message' => 'Δεν βρέθηκε ο παραγωγός'], 404);
        }

        $request->validate([
            'cover' => 'required|image|mimes:jpeg,png,jpg,gif|max:4096'
        ]);

        // Delete old cover if exists
        if ($producer->cover_image) {
            Storage::disk('public')->delete($producer->cover_image);
        }

        // Store new cover
        $path = $request->file('cover')->store('producers/covers', 'public');
        
        $producer->cover_image = $path;
        $producer->save();

        return response()->json([
            'message' => 'Η εικόνα εξωφύλλου ανέβηκε επιτυχώς',
            'cover_url' => Storage::url($path)
        ]);
    }

    /**
     * Delete logo
     *
     * @return JsonResponse
     */
    public function deleteLogo(): JsonResponse
    {
        $producer = auth()->user()->producer;
        
        if (!$producer) {
            return response()->json(['message' => 'Δεν βρέθηκε ο παραγωγός'], 404);
        }

        if ($producer->logo) {
            Storage::disk('public')->delete($producer->logo);
            $producer->logo = null;
            $producer->save();
        }

        return response()->json([
            'message' => 'Το λογότυπο διαγράφηκε επιτυχώς'
        ]);
    }

    /**
     * Delete cover image
     *
     * @return JsonResponse
     */
    public function deleteCover(): JsonResponse
    {
        $producer = auth()->user()->producer;
        
        if (!$producer) {
            return response()->json(['message' => 'Δεν βρέθηκε ο παραγωγός'], 404);
        }

        if ($producer->cover_image) {
            Storage::disk('public')->delete($producer->cover_image);
            $producer->cover_image = null;
            $producer->save();
        }

        return response()->json([
            'message' => 'Η εικόνα εξωφύλλου διαγράφηκε επιτυχώς'
        ]);
    }
}