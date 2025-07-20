<?php

namespace App\Services\Integrations;

use App\Models\User;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Exception;

/**
 * QuickBooks Integration Service
 * Handles all QuickBooks API operations
 */
class QuickBooksService
{
    protected ?string $clientId;
    protected ?string $clientSecret;
    protected ?string $redirectUri;
    protected string $baseUrl;
    protected string $scope;

    public function __construct()
    {
        $this->clientId = config('services.quickbooks.client_id');
        $this->clientSecret = config('services.quickbooks.client_secret');
        $this->redirectUri = config('services.quickbooks.redirect_uri');
        $this->baseUrl = config('services.quickbooks.base_url', 'https://sandbox-quickbooks.api.intuit.com');
        $this->scope = 'com.intuit.quickbooks.accounting';
    }

    /**
     * Get QuickBooks authorization URL
     */
    public function getAuthorizationUrl(string $state): string
    {
        $params = [
            'client_id' => $this->clientId,
            'scope' => $this->scope,
            'redirect_uri' => $this->redirectUri,
            'response_type' => 'code',
            'access_type' => 'offline',
            'state' => $state
        ];

        return 'https://appcenter.intuit.com/connect/oauth2?' . http_build_query($params);
    }

    /**
     * Exchange authorization code for tokens
     */
    public function exchangeCodeForTokens(string $code, string $companyId): array
    {
        $url = 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer';
        
        $data = [
            'grant_type' => 'authorization_code',
            'code' => $code,
            'redirect_uri' => $this->redirectUri
        ];

        $headers = [
            'Authorization: Basic ' . base64_encode($this->clientId . ':' . $this->clientSecret),
            'Content-Type: application/x-www-form-urlencoded'
        ];

        $response = $this->makeHttpRequest($url, 'POST', $data, $headers);
        
        if (!$response || !isset($response['access_token'])) {
            throw new Exception('Failed to exchange code for tokens');
        }

        return [
            'access_token' => $response['access_token'],
            'refresh_token' => $response['refresh_token'],
            'expires_in' => $response['expires_in'],
            'company_id' => $companyId
        ];
    }    /**
     * Store tokens securely in database
     */
    public function storeTokens(int $userId, array $tokens, string $companyId): void
    {
        DB::table('quickbooks_tokens')->updateOrInsert(
            ['user_id' => $userId],
            [
                'access_token' => Crypt::encrypt($tokens['access_token']),
                'refresh_token' => Crypt::encrypt($tokens['refresh_token']),
                'company_id' => $companyId,
                'expires_at' => now()->addSeconds($tokens['expires_in']),
                'updated_at' => now()
            ]
        );
    }

    /**
     * Get stored tokens for user
     */
    protected function getTokens(int $userId): ?array
    {
        $tokenData = DB::table('quickbooks_tokens')
            ->where('user_id', $userId)
            ->first();

        if (!$tokenData) {
            return null;
        }

        return [
            'access_token' => Crypt::decrypt($tokenData->access_token),
            'refresh_token' => Crypt::decrypt($tokenData->refresh_token),
            'company_id' => $tokenData->company_id,
            'expires_at' => $tokenData->expires_at
        ];
    }

    /**
     * Test QuickBooks connection
     */
    public function testConnection(int $userId): array
    {
        try {
            $tokens = $this->getTokens($userId);
            if (!$tokens) {
                return ['success' => false, 'message' => 'No tokens found'];
            }

            // Test with company info API call
            $url = $this->baseUrl . "/v3/company/{$tokens['company_id']}/companyinfo/{$tokens['company_id']}";
            $response = $this->makeAuthenticatedRequest($url, 'GET', null, $tokens['access_token']);

            if ($response && isset($response['QueryResponse'])) {
                return [
                    'success' => true,
                    'message' => 'Connection successful',
                    'company_info' => $response['QueryResponse']
                ];
            }

            return ['success' => false, 'message' => 'Invalid response from QuickBooks'];

        } catch (Exception $e) {
            Log::error('QuickBooks connection test failed', [
                'user_id' => $userId,
                'error' => $e->getMessage()
            ]);

            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    /**
     * Make HTTP request
     */
    protected function makeHttpRequest(string $url, string $method, array $data = null, array $headers = []): ?array
    {
        $ch = curl_init();

        curl_setopt_array($ch, [
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_CUSTOMREQUEST => $method,
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_TIMEOUT => 30
        ]);

        if ($data && in_array($method, ['POST', 'PUT', 'PATCH'])) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
        }

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode >= 200 && $httpCode < 300) {
            return json_decode($response, true);
        }

        return null;
    }

    /**
     * Make authenticated request to QuickBooks API
     */
    protected function makeAuthenticatedRequest(string $url, string $method, array $data = null, string $accessToken): ?array
    {
        $headers = [
            'Authorization: Bearer ' . $accessToken,
            'Accept: application/json'
        ];

        if ($data) {
            $headers[] = 'Content-Type: application/json';
        }

        return $this->makeHttpRequest($url, $method, $data, $headers);
    }
}