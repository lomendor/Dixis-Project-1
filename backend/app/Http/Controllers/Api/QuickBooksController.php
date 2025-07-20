<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class QuickBooksController extends Controller
{
    /**
     * Get QuickBooks authorization URL.
     */
    public function getAuthUrl(Request $request)
    {
        return response()->json([
            'status' => 'success',
            'data' => [
                'auth_url' => 'https://example.com/auth',
                'state' => 'dummy_state'
            ],
            'message' => 'QuickBooks auth URL generated'
        ]);
    }

    /**
     * Handle QuickBooks OAuth callback.
     */
    public function handleCallback(Request $request)
    {
        return response()->json([
            'status' => 'success',
            'message' => 'QuickBooks callback handled'
        ]);
    }

    /**
     * Test QuickBooks connection.
     */
    public function testConnection(Request $request)
    {
        return response()->json([
            'status' => 'success',
            'data' => [
                'connected' => false,
                'message' => 'QuickBooks not configured'
            ]
        ]);
    }

    /**
     * Sync data with QuickBooks.
     */
    public function syncData(Request $request)
    {
        return response()->json([
            'status' => 'success',
            'message' => 'QuickBooks sync not implemented yet'
        ]);
    }

    /**
     * Get QuickBooks integration status.
     */
    public function getStatus(Request $request)
    {
        return response()->json([
            'status' => 'success',
            'data' => [
                'enabled' => false,
                'configured' => false,
                'last_sync' => null
            ]
        ]);
    }
}
