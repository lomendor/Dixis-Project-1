<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Address;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth; // Import Auth facade

class AddressController extends Controller
{
    /**
     * Display a listing of the authenticated user's addresses.
     */
    public function index()
    {
        $user = Auth::user();
        // Ensure user is authenticated before accessing addresses
        if (!$user) {
             return response()->json(['message' => 'Unauthenticated.'], 401);
        }
        return response()->json($user->addresses); // Use the relationship defined in User model
    }

    /**
     * Store a newly created address in storage for the authenticated user.
     */
    public function store(Request $request)
    {
        $user = Auth::user();
         if (!$user) {
             return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'address_line_1' => 'required|string|max:255',
            'address_line_2' => 'nullable|string|max:255',
            'city' => 'required|string|max:100',
            'postal_code' => 'required|string|max:10',
            'region' => 'nullable|string|max:100',
            'country' => 'sometimes|required|string|max:100', // Default is set in migration
            'phone' => 'required|string|max:20',
            'is_default_shipping' => 'sometimes|boolean',
            'is_default_billing' => 'sometimes|boolean',
        ]);

        // Ensure only one default shipping/billing address if set to true
        if ($request->input('is_default_shipping')) {
            $user->addresses()->where('is_default_shipping', true)->update(['is_default_shipping' => false]);
        }
        if ($request->input('is_default_billing')) {
            $user->addresses()->where('is_default_billing', true)->update(['is_default_billing' => false]);
        }

        $address = $user->addresses()->create($validatedData);

        return response()->json($address, 201);
    }

    /**
     * Display the specified resource.
     * (Excluded from apiResource routes)
     */
    public function show(Address $address)
    {
         // Although excluded from routes, add basic authorization check if ever used
         if (Auth::id() !== $address->user_id) {
             return response()->json(['message' => 'Unauthorized'], 403);
         }
         // We generally don't need this if addresses are fetched via user or order relationships
         return response()->json($address);
         // return response()->json(['message' => 'Not applicable'], 405); // Or return 405
    }

    /**
     * Update the specified address in storage.
     */
    public function update(Request $request, Address $address)
    {
        $user = Auth::user();

        // Authorization: Check if the address belongs to the authenticated user
        if (!$user || $address->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validatedData = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'address_line_1' => 'sometimes|required|string|max:255',
            'address_line_2' => 'nullable|string|max:255',
            'city' => 'sometimes|required|string|max:100',
            'postal_code' => 'sometimes|required|string|max:10',
            'region' => 'nullable|string|max:100',
            'country' => 'sometimes|required|string|max:100',
            'phone' => 'sometimes|required|string|max:20',
            'is_default_shipping' => 'sometimes|boolean',
            'is_default_billing' => 'sometimes|boolean',
        ]);

         // Ensure only one default shipping/billing address if set to true
        if ($request->input('is_default_shipping')) {
            $user->addresses()->where('id', '!=', $address->id)->where('is_default_shipping', true)->update(['is_default_shipping' => false]);
        }
        if ($request->input('is_default_billing')) {
             $user->addresses()->where('id', '!=', $address->id)->where('is_default_billing', true)->update(['is_default_billing' => false]);
        }

        $address->update($validatedData);

        return response()->json($address);
    }

    /**
     * Remove the specified address from storage.
     */
    public function destroy(Address $address)
    {
         $user = Auth::user();

        // Authorization: Check if the address belongs to the authenticated user
        if (!$user || $address->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // TODO: Add check to prevent deletion if address is used in existing orders (shipping_address_id or billing_address_id)
        // This requires checking the 'orders' table. For MVP, we might allow deletion or defer this check.
        // Example check (needs refinement):
        // if ($address->ordersAsShipping()->exists() || $address->ordersAsBilling()->exists()) {
        //     return response()->json(['message' => 'Cannot delete address used in existing orders.'], 400);
        // }

        $address->delete();

        return response()->json(['message' => 'Address deleted successfully.'], 200);
    }
}
