<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProducerProfile;
use Illuminate\Http\Request;

class ProducerProfileController extends Controller
{
    public function index(Request $request)
    {
        $query = ProducerProfile::with('user')
            ->where('verification_status', 'verified')
            ->orderBy('created_at', 'desc');

        if ($request->has('location') && $request->location) {
            $query->where(function($q) use ($request) {
                $q->where('location_city', 'like', '%' . $request->location . '%')
                  ->orWhere('location_region', 'like', '%' . $request->location . '%');
            });
        }

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('business_name', 'like', '%' . $search . '%')
                  ->orWhere('description', 'like', '%' . $search . '%');
            });
        }

        $producers = $query->get();

        $transformedProducers = $producers->map(function ($profile) {
            $specialtyLabels = [
                'honey' => 'Μέλι',
                'olive_oil' => 'Ελαιόλαδο',
                'olives' => 'Ελιές',
                'cheese' => 'Τυροκομικά',
                'wine' => 'Κρασί',
                'nuts' => 'Ξηροί Καρποί',
                'legumes' => 'Όσπρια',
                'herbs' => 'Αρωματικά Φυτά',
                'traditional' => 'Παραδοσιακά',
                'cosmetics' => 'Καλλυντικά',
            ];

            // Handle specialties that might be JSON strings
            $specialtiesData = $profile->specialties;
            if (is_string($specialtiesData)) {
                $specialtiesData = json_decode($specialtiesData, true) ?? [];
            }
            
            $specialties = collect($specialtiesData ?? [])->map(function($specialty) use ($specialtyLabels) {
                return $specialtyLabels[$specialty] ?? $specialty;
            })->toArray();

            return [
                'id' => $profile->id,
                'slug' => \Str::slug($profile->business_name . '-' . $profile->id),
                'business_name' => $profile->business_name,
                'bio' => $profile->description,
                'location' => trim($profile->location_city . ', ' . $profile->location_region, ', '),
                'specialties' => $specialties,
                'profile_image' => null,
                'verification_status' => $profile->verification_status,
                'trust_level' => $profile->trust_level,
                'total_products' => $profile->user->products()->where('is_active', true)->count(),
                'rating' => 4.5,
                'review_count' => 12,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $transformedProducers,
            'total' => $transformedProducers->count(),
        ]);
    }

    public function show($id)
    {
        $profile = ProducerProfile::with('user')
            ->where('id', $id)
            ->where('verification_status', 'verified')
            ->first();

        if (!$profile) {
            return response()->json([
                'success' => false,
                'message' => 'Producer not found',
            ], 404);
        }

        $specialtyLabels = [
            'honey' => 'Μέλι',
            'olive_oil' => 'Ελαιόλαδο',
            'olives' => 'Ελιές',
            'cheese' => 'Τυροκομικά',
            'wine' => 'Κρασί',
            'nuts' => 'Ξηροί Καρποί',
            'legumes' => 'Όσπρια',
            'herbs' => 'Αρωματικά Φυτά',
            'traditional' => 'Παραδοσιακά',
            'cosmetics' => 'Καλλυντικά',
        ];

        // Handle specialties that might be JSON strings
        $specialtiesData = $profile->specialties;
        if (is_string($specialtiesData)) {
            $specialtiesData = json_decode($specialtiesData, true) ?? [];
        }
        
        $specialties = collect($specialtiesData ?? [])->map(function($specialty) use ($specialtyLabels) {
            return $specialtyLabels[$specialty] ?? $specialty;
        })->toArray();

        $transformedProducer = [
            'id' => $profile->id,
            'slug' => \Str::slug($profile->business_name . '-' . $profile->id),
            'business_name' => $profile->business_name,
            'bio' => $profile->description,
            'location' => trim($profile->location_city . ', ' . $profile->location_region, ', '),
            'specialties' => $specialties,
            'profile_image' => null,
            'verification_status' => $profile->verification_status,
            'trust_level' => $profile->trust_level,
            'total_products' => $profile->user->products()->where('is_active', true)->count(),
            'rating' => 4.5,
            'review_count' => 12,
            'website_url' => $profile->website_url,
            'social_media' => $profile->social_media,
            'farm_photos' => $profile->farm_photos,
            'business_registration_number' => $profile->business_registration_number,
            'tax_number' => $profile->tax_number,
            'location_address' => $profile->location_address,
            'location_postal_code' => $profile->location_postal_code,
            'location_lat' => $profile->location_lat,
            'location_lng' => $profile->location_lng,
            'processing_time_days' => $profile->processing_time_days,
            'minimum_order_amount' => $profile->minimum_order_amount,
            'delivery_zones' => $profile->delivery_zones,
        ];

        return response()->json([
            'success' => true,
            'data' => $transformedProducer,
        ]);
    }
}