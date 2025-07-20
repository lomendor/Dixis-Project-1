<?php

namespace App\Http\Controllers\Api\Integrations;

use App\Http\Controllers\Controller;
use App\Services\Integrations\QuickBooksService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Exception;

/**
 * QuickBooks OAuth 2.0 Authentication Controller
 * Handles QuickBooks integration authentication flow
 */
class QuickBooksAuthController extends Controller
{
    protected QuickBooksService $quickBooksService;

    public function __construct(QuickBooksService $quickBooksService)
    {
        $this->quickBooksService = $quickBooksService;
        $this->middleware('auth:api');
    }

    /**
     * Initiate QuickBooks OAuth flow
     */
    public function connect(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            
            // Generate state parameter for security
            $state = bin2hex(random_bytes(16));
            session(['quickbooks_state' => $state]);
            session(['quickbooks_user_id' => $user->id]);

            $authUrl = $this->quickBooksService->getAuthorizationUrl($state);

            Log::info('QuickBooks OAuth initiated', [
                'user_id' => $user->id,
                'state' => $state
            ]);

            return response()->json([
                'success' => true,
                'auth_url' => $authUrl,
                'message' => 'Redirect to QuickBooks for authorization'
            ]);

        } catch (Exception $e) {
            Log::error('QuickBooks OAuth initiation failed', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to initiate QuickBooks connection'
            ], 500);
        }
    }

    /**
     * Handle OAuth callback from QuickBooks
     */
    public function callback(Request $request): JsonResponse
    {
        try {
            $code = $request->get('code');
            $state = $request->get('state');
            $companyId = $request->get('realmId');

            // Verify state parameter
            if (!$state || $state !== session('quickbooks_state')) {
                throw new Exception('Invalid state parameter');
            }

            $userId = session('quickbooks_user_id');
            if (!$userId) {
                throw new Exception('User session not found');
            }

            // Exchange code for tokens
            $tokens = $this->quickBooksService->exchangeCodeForTokens($code, $companyId);

            // Store tokens securely
            $this->quickBooksService->storeTokens($userId, $tokens, $companyId);

            // Test connection
            $connectionTest = $this->quickBooksService->testConnection($userId);

            Log::info('QuickBooks OAuth completed successfully', [
                'user_id' => $userId,
                'company_id' => $companyId,
                'connection_test' => $connectionTest
            ]);

            // Clear session data
            session()->forget(['quickbooks_state', 'quickbooks_user_id']);

            return response()->json([
                'success' => true,
                'message' => 'QuickBooks connected successfully',
                'company_id' => $companyId,
                'connection_status' => $connectionTest
            ]);

        } catch (Exception $e) {
            Log::error('QuickBooks OAuth callback failed', [
                'error' => $e->getMessage(),
                'request_data' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to complete QuickBooks connection: ' . $e->getMessage()
            ], 400);
        }
    }

    /**
     * Get connection status
     */
    public function status(): JsonResponse
    {
        try {
            $user = Auth::user();
            $status = $this->quickBooksService->getConnectionStatus($user->id);

            return response()->json([
                'success' => true,
                'connected' => $status['connected'],
                'company_name' => $status['company_name'] ?? null,
                'last_sync' => $status['last_sync'] ?? null,
                'token_expires' => $status['token_expires'] ?? null
            ]);

        } catch (Exception $e) {
            Log::error('QuickBooks status check failed', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to check connection status'
            ], 500);
        }
    }

    /**
     * Disconnect QuickBooks integration
     */
    public function disconnect(): JsonResponse
    {
        try {
            $user = Auth::user();
            $this->quickBooksService->disconnect($user->id);

            Log::info('QuickBooks disconnected', [
                'user_id' => $user->id
            ]);

            return response()->json([
                'success' => true,
                'message' => 'QuickBooks disconnected successfully'
            ]);

        } catch (Exception $e) {
            Log::error('QuickBooks disconnect failed', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to disconnect QuickBooks'
            ], 500);
        }
    }

    /**
     * Test QuickBooks connection
     */
    public function test(): JsonResponse
    {
        try {
            $user = Auth::user();
            $result = $this->quickBooksService->testConnection($user->id);

            return response()->json([
                'success' => true,
                'connection_test' => $result,
                'message' => $result['success'] ? 'Connection successful' : 'Connection failed'
            ]);

        } catch (Exception $e) {
            Log::error('QuickBooks connection test failed', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Connection test failed: ' . $e->getMessage()
            ], 500);
        }
    }
}