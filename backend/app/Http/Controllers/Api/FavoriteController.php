<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Favorite;
use Illuminate\Support\Facades\Auth;

class FavoriteController extends Controller
{
    /**
     * Get all favorites for the authenticated user.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $favorites = Favorite::with('product')
            ->where('user_id', Auth::id())
            ->get();

        return response()->json($favorites);
    }

    /**
     * Add a product to favorites.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
        ]);

        $favorite = Favorite::firstOrCreate([
            'user_id' => Auth::id(),
            'product_id' => $request->product_id,
        ]);

        return response()->json([
            'message' => 'Το προϊόν προστέθηκε στα αγαπημένα σας.',
            'favorite' => $favorite
        ], 201);
    }

    /**
     * Remove a product from favorites.
     *
     * @param  int  $productId
     * @return \Illuminate\Http\Response
     */
    public function destroy($productId)
    {
        $favorite = Favorite::where('user_id', Auth::id())
            ->where('product_id', $productId)
            ->first();

        if (!$favorite) {
            return response()->json([
                'message' => 'Το προϊόν δεν βρέθηκε στα αγαπημένα σας.'
            ], 404);
        }

        $favorite->delete();

        return response()->json([
            'message' => 'Το προϊόν αφαιρέθηκε από τα αγαπημένα σας.'
        ]);
    }

    /**
     * Check if a product is in the user's favorites.
     *
     * @param  int  $productId
     * @return \Illuminate\Http\Response
     */
    public function check($productId)
    {
        $isFavorite = Favorite::where('user_id', Auth::id())
            ->where('product_id', $productId)
            ->exists();

        return response()->json([
            'is_favorite' => $isFavorite
        ]);
    }
}
