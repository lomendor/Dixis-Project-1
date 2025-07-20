<?php

namespace App\Http\Controllers\Integration;

use App\Http\Controllers\Controller;
use App\Services\Integrations\QuickBooksService;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Session;

class QuickBooksAuthController extends Controller
{
    public function __construct(
        private QuickBooksService $quickBooksService
    ) {}
    
    /**
     * Redirect to QuickBooks OAuth authorization
     */
    public function startAuthorization(): RedirectResponse
    {
        try {
            $authUrl = $this->quickBooksService->getAuthorizationUrl();
            
            Log::info('QuickBooks OAuth authorization initiated', [
                'user_id' => auth()->id(),
                'timestamp' => now()
            ]);
            
            return redirect($authUrl);
            
        } catch (\Exception $e) {
            Log::error('QuickBooks authorization failed', [
                'error' => $e->getMessage(),
                'user_id' => auth()->id()
            ]);
            
            return redirect()->route('admin.integrations.quickbooks')
                ->with('error', 'Failed to initiate QuickBooks authorization: ' . $e->getMessage());
        }
    }
    
    /**
     * Handle OAuth callback from QuickBooks
     */
    public function callback(Request $request): RedirectResponse
    {
        try {
            $authCode = $request->get('code');
            $realmId = $request->get('realmId');
            $state = $request->get('state');
            
            if (!$authCode || !$realmId) {
                throw new \Exception('Missing authorization code or realm ID');
            }
            
            // Exchange authorization code for tokens
            $tokens = $this->quickBooksService->exchangeCodeForTokens($authCode, $realmId);
            
            // Store tokens securely
            $this->storeTokens($tokens, $realmId);
            
            // Test connection
            $connectionTest = $this->quickBooksService->testConnection();
            
            if (!$connectionTest['success']) {
                throw new \Exception('Connection test failed: ' . $connectionTest['error']);
            }
            
            Log::info('QuickBooks OAuth completed successfully', [
                'realm_id' => $realmId,
                'user_id' => auth()->id(),
                'company_name' => $connectionTest['company_name'] ?? 'Unknown'
            ]);
            
            return redirect()->route('admin.integrations.quickbooks')
                ->with('success', 'QuickBooks integration connected successfully!');
                
        } catch (\Exception $e) {
            Log::error('QuickBooks OAuth callback failed', [
                'error' => $e->getMessage(),
                'request_data' => $request->all()
            ]);
            
            return redirect()->route('admin.integrations.quickbooks')
                ->with('error', 'QuickBooks authorization failed: ' . $e->getMessage());
        }
    }
    
    /**
     * Disconnect QuickBooks integration
     */
    public function disconnect(): RedirectResponse
    {
        try {
            $this->quickBooksService->revokeTokens();
            $this->clearStoredTokens();
            
            Log::info('QuickBooks integration disconnected', [
                'user_id' => auth()->id()
            ]);
            
            return redirect()->route('admin.integrations.quickbooks')
                ->with('success', 'QuickBooks integration disconnected successfully.');
                
        } catch (\Exception $e) {
            Log::error('QuickBooks disconnect failed', [
                'error' => $e->getMessage(),
                'user_id' => auth()->id()
            ]);
            
            return redirect()->route('admin.integrations.quickbooks')
                ->with('error', 'Failed to disconnect QuickBooks: ' . $e->getMessage());
        }
    }
    
    /**
     * Get integration status
     */
    public function status(): array
    {
        return [
            'connected' => $this->quickBooksService->isConnected(),
            'company_info' => $this->quickBooksService->getCompanyInfo(),
            'last_sync' => $this->quickBooksService->getLastSyncTime(),
            'health_status' => $this->quickBooksService->getHealthStatus()
        ];
    }
    
    private function storeTokens(array $tokens, string $realmId): void
    {
        // Store in encrypted format
        $encryptedTokens = encrypt([
            'access_token' => $tokens['access_token'],
            'refresh_token' => $tokens['refresh_token'],
            'expires_at' => now()->addSeconds($tokens['expires_in']),
            'realm_id' => $realmId
        ]);
        
        // Store in settings table or dedicated integration_tokens table
        \DB::table('integration_settings')->updateOrInsert(
            ['service' => 'quickbooks', 'user_id' => auth()->id()],
            [
                'tokens' => $encryptedTokens,
                'realm_id' => $realmId,
                'connected_at' => now(),
                'updated_at' => now()
            ]
        );
    }
    
    private function clearStoredTokens(): void
    {
        \DB::table('integration_settings')
            ->where('service', 'quickbooks')
            ->where('user_id', auth()->id())
            ->delete();
    }
}
