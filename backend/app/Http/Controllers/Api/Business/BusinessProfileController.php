<?php

namespace App\Http\Controllers\Api\Business;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use App\Models\Business;

class BusinessProfileController extends Controller
{
    /**
     * Get the authenticated business user's profile.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function show()
    {
        $user = Auth::user();
        $business = $user->business;
        
        if (!$business) {
            return response()->json(['message' => 'Business profile not found'], 404);
        }
        
        return response()->json($business);
    }
    
    /**
     * Update the authenticated business user's profile.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request)
    {
        $user = Auth::user();
        $business = $user->business;
        
        if (!$business) {
            return response()->json(['message' => 'Business profile not found'], 404);
        }
        
        $validator = Validator::make($request->all(), [
            'business_name' => 'sometimes|string|max:255',
            'tax_id' => 'sometimes|string|max:20',
            'tax_office' => 'sometimes|string|max:255',
            'address' => 'sometimes|string|max:255',
            'city' => 'sometimes|string|max:100',
            'postal_code' => 'sometimes|string|max:20',
            'country' => 'sometimes|string|max:100',
            'phone' => 'sometimes|string|max:20',
            'website' => 'sometimes|nullable|url|max:255',
            'description' => 'sometimes|nullable|string',
            'logo' => 'sometimes|nullable|image|max:2048',
        ]);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        // Handle logo upload if provided
        if ($request->hasFile('logo')) {
            $logoPath = $request->file('logo')->store('business_logos', 'public');
            $business->logo = $logoPath;
        }
        
        // Update business profile
        $business->fill($request->except('logo'));
        $business->save();
        
        return response()->json([
            'message' => 'Business profile updated successfully',
            'business' => $business,
        ]);
    }
}
