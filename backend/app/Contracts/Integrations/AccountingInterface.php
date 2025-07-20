<?php

namespace App\Contracts\Integrations;

use App\Models\User;
use App\Models\Order;

interface AccountingInterface
{
    /**
     * Get OAuth2 authorization URL
     */
    public function getAuthorizationUrl(): string;
    
    /**
     * Exchange authorization code for access tokens
     */
    public function exchangeCodeForTokens(string $authCode, string $realmId): array;
    
    /**
     * Sync order to accounting system as invoice
     */
    public function syncOrder(Order $order): array;
    
    /**
     * Create or update customer in accounting system
     */
    public function createCustomer(User $customer): array;

    /**
     * Update existing customer in accounting system
     */
    public function updateCustomer(User $customer): array;
    
    /**
     * Test connection to accounting system
     */
    public function testConnection(): array;
    
    /**
     * Check if accounting system is connected
     */
    public function isConnected(): bool;
    
    /**
     * Get company information from accounting system
     */
    public function getCompanyInfo(): ?array;
    
    /**
     * Get last sync time
     */
    public function getLastSyncTime(): ?string;
    
    /**
     * Get health status of the integration
     */
    public function getHealthStatus(): array;
    
    /**
     * Revoke access tokens
     */
    public function revokeTokens(): bool;
}
