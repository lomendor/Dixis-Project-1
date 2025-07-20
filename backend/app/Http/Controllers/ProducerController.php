<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\ProducerProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ProducerController extends Controller
{
    /**
     * Register a new producer
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            // User data
            'email' => 'required|email|unique:users',
            'password' => 'required|min:8|confirmed',
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            
            // Business data
            'business_name' => 'required|string|max:200',
            'tax_number' => 'required|string|max:20|unique:producer_profiles',
            'business_registration_number' => 'nullable|string|max:50',
            'description' => 'required|string|max:1000',
            'specialties' => 'required|array|min:1',
            'specialties.*' => 'string|in:honey,olive_oil,olives,cheese,wine,nuts,legumes,herbs,traditional,cosmetics',
            
            // Location
            'location_address' => 'required|string',
            'location_city' => 'required|string|max:100',
            'location_region' => 'required|string|max:100',
            'location_postal_code' => 'required|string|max:10',
            
            // Optional
            'website_url' => 'nullable|url',
            'farm_photos' => 'nullable|array|max:5',
            'farm_photos.*' => 'image|max:5120', // 5MB max
        ]);

        try {
            DB::beginTransaction();

            // Create user account
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'phone' => $validated['phone'],
                'role' => 'producer',
            ]);

            // Create producer profile
            $producerProfile = ProducerProfile::create([
                'user_id' => $user->id,
                'business_name' => $validated['business_name'],
                'tax_number' => $validated['tax_number'],
                'business_registration_number' => $validated['business_registration_number'] ?? null,
                'description' => $validated['description'],
                'specialties' => json_encode($validated['specialties']),
                'location_address' => $validated['location_address'],
                'location_city' => $validated['location_city'],
                'location_region' => $validated['location_region'],
                'location_postal_code' => $validated['location_postal_code'],
                'website_url' => $validated['website_url'] ?? null,
                'verification_status' => 'pending',
                'trust_level' => 'new',
            ]);

            // Handle farm photos if uploaded
            if ($request->hasFile('farm_photos')) {
                $photos = [];
                foreach ($request->file('farm_photos') as $photo) {
                    $path = $photo->store('producers/farm-photos', 'public');
                    $photos[] = asset('storage/' . $path);
                }
                $producerProfile->farm_photos = json_encode($photos);
                $producerProfile->save();
            }

            DB::commit();

            // Generate token for immediate login
            $token = $user->createToken('auth-token')->plainTextToken;

            return response()->json([
                'success' => true,
                'message' => 'Η εγγραφή σας ολοκληρώθηκε! Αναμένουμε την έγκριση από την ομάδα μας.',
                'data' => [
                    'user' => $user,
                    'profile' => $producerProfile,
                    'token' => $token,
                ]
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Σφάλμα κατά την εγγραφή. Παρακαλώ δοκιμάστε ξανά.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get producer profile
     */
    public function profile(Request $request)
    {
        $user = $request->user();
        
        if ($user->role !== 'producer') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $profile = ProducerProfile::where('user_id', $user->id)
            ->with('subscription:id,user_id,tier_id,status')
            ->first();

        return response()->json([
            'success' => true,
            'data' => [
                'user' => $user,
                'profile' => $profile,
            ]
        ]);
    }

    /**
     * Update producer profile
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();
        
        if ($user->role !== 'producer') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $validated = $request->validate([
            'business_name' => 'sometimes|string|max:200',
            'description' => 'sometimes|string|max:1000',
            'specialties' => 'sometimes|array|min:1',
            'location_address' => 'sometimes|string',
            'location_city' => 'sometimes|string|max:100',
            'location_region' => 'sometimes|string|max:100',
            'location_postal_code' => 'sometimes|string|max:10',
            'website_url' => 'nullable|url',
            'social_media' => 'nullable|array',
            'minimum_order_amount' => 'sometimes|numeric|min:0',
            'processing_time_days' => 'sometimes|integer|min:1|max:30',
        ]);

        $profile = ProducerProfile::where('user_id', $user->id)->first();
        
        if (!$profile) {
            return response()->json([
                'success' => false,
                'message' => 'Profile not found'
            ], 404);
        }

        // Update only provided fields
        foreach ($validated as $key => $value) {
            if (in_array($key, ['specialties', 'social_media'])) {
                $profile->$key = json_encode($value);
            } else {
                $profile->$key = $value;
            }
        }

        $profile->save();

        return response()->json([
            'success' => true,
            'message' => 'Το προφίλ σας ενημερώθηκε επιτυχώς',
            'data' => $profile
        ]);
    }

    /**
     * Get producer dashboard statistics
     */
    public function dashboardStats(Request $request)
    {
        $user = $request->user();
        
        if ($user->role !== 'producer') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        // Get stats
        $stats = [
            'total_products' => $user->products()->count(),
            'active_products' => $user->products()->where('is_active', true)->count(),
            'total_orders' => 0, // TODO: Implement when orders table is ready
            'pending_orders' => 0,
            'total_revenue' => 0,
            'this_month_revenue' => 0,
            'average_rating' => 0,
            'total_reviews' => 0,
        ];

        // Get recent orders
        $recentOrders = []; // TODO: Implement

        // Get top products
        $topProducts = $user->products()
            ->where('is_active', true)
            ->orderBy('created_at', 'desc') // TODO: Order by sales when ready
            ->take(5)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'stats' => $stats,
                'recent_orders' => $recentOrders,
                'top_products' => $topProducts,
            ]
        ]);
    }
}