<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Producer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class ProducerController extends Controller
{
    /**
     * Display a listing of the producers.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $producers = Producer::select(
            'id', 
            'business_name', 
            'description', 
            'city', 
            'region', 
            'logo', 
            'cover_image', 
            'rating',
            'slug'
        )->get();

        // Transform data to match frontend expectations
        $transformedProducers = $producers->map(function ($producer) {
            return [
                'id' => $producer->id,
                'business_name' => $producer->business_name,
                'slug' => $producer->slug ?: 'producer-' . $producer->id,
                'bio' => $producer->description ?: '',
                'location' => trim(($producer->city ?: '') . ' ' . ($producer->region ?: '')),
                'profile_image' => $producer->logo,
                'specialties' => [], // Can be enhanced later
                'verification_status' => 'verified', // Default for now
                'rating' => $producer->rating,
                'total_products' => $producer->products()->count() ?? 0,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $transformedProducers,
            'total' => $transformedProducers->count()
        ]);
    }

    /**
     * Display the specified producer.
     *
     * @param  int|string  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        // Find the producer by ID or slug
        $producer = Producer::where('id', $id)
            ->orWhere('slug', $id)
            ->first();

        if (!$producer) {
            return response()->json([
                'success' => false,
                'message' => 'Producer not found'
            ], 404);
        }

        // Load the producer's products
        $producer->load(['products' => function ($query) {
            $query->where('is_active', true)
                ->select('id', 'name', 'slug', 'price', 'discount_price', 'main_image', 'short_description', 'producer_id');
        }]);

        // Transform producer data to match frontend expectations
        $transformedProducer = [
            'id' => $producer->id,
            'business_name' => $producer->business_name,
            'slug' => $producer->slug ?: 'producer-' . $producer->id,
            'bio' => $producer->description ?: '',
            'location' => trim(($producer->city ?: '') . ' ' . ($producer->region ?: '')),
            'profile_image' => $producer->logo,
            'cover_image' => $producer->cover_image,
            'specialties' => [], // Can be enhanced later
            'verification_status' => 'verified', // Default for now
            'rating' => $producer->rating,
            'total_products' => $producer->products->count(),
            'products' => $producer->products->map(function ($product) {
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'slug' => $product->slug,
                    'price' => (float) $product->price,
                    'discount_price' => $product->discount_price ? (float) $product->discount_price : null,
                    'main_image' => $product->main_image,
                    'short_description' => $product->short_description,
                ];
            }),
            'latitude' => $producer->latitude,
            'longitude' => $producer->longitude,
            'map_description' => $producer->map_description,
        ];

        return response()->json([
            'success' => true,
            'data' => $transformedProducer
        ]);
    }

    /**
     * Update the producer's map coordinates.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Producer  $producer
     * @return \Illuminate\Http\Response
     */
    public function updateMapCoordinates(Request $request, Producer $producer)
    {
        // Check if the authenticated user is the owner of the producer profile
        if (Auth::id() !== $producer->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'map_description' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validation error', 'errors' => $validator->errors()], 422);
        }

        $producer->latitude = $request->latitude;
        $producer->longitude = $request->longitude;
        $producer->map_description = $request->map_description;
        $producer->save();

        return response()->json([
            'message' => 'Οι συντεταγμένες ενημερώθηκαν με επιτυχία',
            'producer' => $producer
        ]);
    }
}
