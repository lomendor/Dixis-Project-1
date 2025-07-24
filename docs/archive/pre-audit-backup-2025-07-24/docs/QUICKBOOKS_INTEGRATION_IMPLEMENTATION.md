# 💼 QUICKBOOKS INTEGRATION - COMPLETE IMPLEMENTATION

## 🎯 OVERVIEW
Complete QuickBooks Online integration για το Dixis Fresh e-commerce platform. Περιλαμβάνει OAuth 2.0 authentication, automated invoice creation, customer synchronization, και financial reporting.

## 🔐 QuickBooksAuthController.php

```php
<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\IntegrationToken;
use App\Services\QuickBooksService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Crypt;
use QuickBooksOnline\API\DataService\DataService;

class QuickBooksAuthController extends Controller
{
    private $quickBooksService;

    public function __construct(QuickBooksService $quickBooksService)
    {
        $this->quickBooksService = $quickBooksService;
    }

    /**
     * Initiate QuickBooks OAuth 2.0 authorization
     */
    public function authorize()
    {
        try {
            $dataService = DataService::Configure([
                'auth_mode' => 'oauth2',
                'ClientID' => config('services.quickbooks.client_id'),
                'ClientSecret' => config('services.quickbooks.client_secret'),
                'RedirectURI' => config('services.quickbooks.redirect_uri'),
                'scope' => 'com.intuit.quickbooks.accounting',
                'baseUrl' => config('services.quickbooks.base_url', 'sandbox')
            ]);

            $OAuth2LoginHelper = $dataService->getOAuth2LoginHelper();
            $authUrl = $OAuth2LoginHelper->getAuthorizationCodeURL();

            // Store state for security
            session(['qb_state' => $OAuth2LoginHelper->getState()]);

            Log::info('QuickBooks authorization initiated', [
                'auth_url' => $authUrl,
                'state' => $OAuth2LoginHelper->getState()
            ]);

            return redirect($authUrl);

        } catch (\Exception $e) {
            Log::error('QuickBooks authorization failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->route('admin.integrations.index')
                ->with('error', 'Failed to initiate QuickBooks authorization: ' . $e->getMessage());
        }
    }

    /**
     * Handle OAuth 2.0 callback from QuickBooks
     */
    public function callback(Request $request)
    {
        try {
            $code = $request->get('code');
            $state = $request->get('state');
            $realmId = $request->get('realmId');

            // Verify state for security
            if ($state !== session('qb_state')) {
                throw new \Exception('Invalid state parameter');
            }

            if (!$code || !$realmId) {
                throw new \Exception('Missing authorization code or realm ID');
            }

            $dataService = DataService::Configure([
                'auth_mode' => 'oauth2',
                'ClientID' => config('services.quickbooks.client_id'),
                'ClientSecret' => config('services.quickbooks.client_secret'),
                'RedirectURI' => config('services.quickbooks.redirect_uri'),
                'scope' => 'com.intuit.quickbooks.accounting',
                'baseUrl' => config('services.quickbooks.base_url', 'sandbox')
            ]);

            $OAuth2LoginHelper = $dataService->getOAuth2LoginHelper();
            $accessTokenObj = $OAuth2LoginHelper->exchangeAuthorizationCodeForToken($code, $realmId);

            if (!$accessTokenObj) {
                throw new \Exception('Failed to exchange authorization code for token');
            }

            // Store tokens securely
            $this->storeTokens($accessTokenObj, $realmId);

            // Test connection
            $connectionTest = $this->quickBooksService->testConnection();

            Log::info('QuickBooks authorization completed successfully', [
                'realm_id' => $realmId,
                'connection_test' => $connectionTest
            ]);

            return redirect()->route('admin.integrations.index')
                ->with('success', 'QuickBooks integration connected successfully!');

        } catch (\Exception $e) {
            Log::error('QuickBooks callback failed', [
                'error' => $e->getMessage(),
                'request_data' => $request->all(),
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->route('admin.integrations.index')
                ->with('error', 'QuickBooks authorization failed: ' . $e->getMessage());
        }
    }

    /**
     * Store OAuth tokens securely
     */
    private function storeTokens($accessTokenObj, $realmId)
    {
        $tokenData = [
            'access_token' => $accessTokenObj->getAccessToken(),
            'refresh_token' => $accessTokenObj->getRefreshToken(),
            'realm_id' => $realmId,
            'expires_at' => now()->addSeconds($accessTokenObj->getAccessTokenExpiresAt()),
            'refresh_expires_at' => now()->addSeconds($accessTokenObj->getRefreshTokenExpiresAt())
        ];

        IntegrationToken::updateOrCreate(
            ['provider' => 'quickbooks'],
            [
                'token_data' => Crypt::encrypt($tokenData),
                'expires_at' => $tokenData['expires_at'],
                'is_active' => true
            ]
        );
    }

    /**
     * Test QuickBooks connection
     */
    public function testConnection()
    {
        try {
            $result = $this->quickBooksService->testConnection();

            return response()->json([
                'success' => true,
                'message' => 'QuickBooks connection successful',
                'data' => $result
            ]);

        } catch (\Exception $e) {
            Log::error('QuickBooks connection test failed', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'QuickBooks connection failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Disconnect QuickBooks integration
     */
    public function disconnect()
    {
        try {
            IntegrationToken::where('provider', 'quickbooks')
                ->update(['is_active' => false]);

            Log::info('QuickBooks integration disconnected');

            return redirect()->route('admin.integrations.index')
                ->with('success', 'QuickBooks integration disconnected successfully');

        } catch (\Exception $e) {
            Log::error('QuickBooks disconnect failed', [
                'error' => $e->getMessage()
            ]);

            return redirect()->route('admin.integrations.index')
                ->with('error', 'Failed to disconnect QuickBooks: ' . $e->getMessage());
        }
    }
}
```

## 💼 QuickBooksService.php

```php
<?php

namespace App\Services;

use App\Contracts\AccountingInterface;
use App\Models\IntegrationToken;
use App\Models\Order;
use App\Models\Customer;
use App\Models\Product;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Cache;
use QuickBooksOnline\API\DataService\DataService;
use QuickBooksOnline\API\Facades\Customer as QBCustomer;
use QuickBooksOnline\API\Facades\Item as QBItem;
use QuickBooksOnline\API\Facades\Invoice as QBInvoice;
use QuickBooksOnline\API\Facades\Payment as QBPayment;

class QuickBooksService extends BaseIntegrationService implements AccountingInterface
{
    private $dataService;
    private $tokenData;

    public function __construct()
    {
        $this->initializeService();
    }

    /**
     * Initialize QuickBooks DataService
     */
    private function initializeService()
    {
        try {
            $token = IntegrationToken::where('provider', 'quickbooks')
                ->where('is_active', true)
                ->first();

            if (!$token) {
                throw new \Exception('QuickBooks integration not configured');
            }

            $this->tokenData = Crypt::decrypt($token->token_data);

            // Check if token needs refresh
            if (now()->gt($token->expires_at)) {
                $this->refreshToken();
            }

            $this->dataService = DataService::Configure([
                'auth_mode' => 'oauth2',
                'ClientID' => config('services.quickbooks.client_id'),
                'ClientSecret' => config('services.quickbooks.client_secret'),
                'accessTokenKey' => $this->tokenData['access_token'],
                'refreshTokenKey' => $this->tokenData['refresh_token'],
                'QBORealmID' => $this->tokenData['realm_id'],
                'baseUrl' => config('services.quickbooks.base_url', 'sandbox')
            ]);

        } catch (\Exception $e) {
            Log::error('QuickBooks service initialization failed', [
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }
