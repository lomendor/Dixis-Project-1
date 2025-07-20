<?php

namespace App\Contracts\Integrations;

use App\Models\Order;

/**
 * Interface for shipping provider integrations
 * Supports Greek couriers: ELTA, ACS, Speedex, Courier Center
 */
interface ShippingProviderInterface
{
    /**
     * Calculate shipping rate for order
     * 
     * @param Order $order
     * @return array [
     *   'success' => bool,
     *   'cost' => float,
     *   'currency' => string,
     *   'delivery_time' => string,
     *   'delivery_date' => string,
     *   'service_name' => string,
     *   'additional_info' => array,
     *   'error' => string|null
     * ]
     */
    public function calculateRate(Order $order): array;
    
    /**
     * Create shipment and return tracking info
     * 
     * @param array $shipmentData
     * @return array [
     *   'success' => bool,
     *   'tracking_number' => string,
     *   'cost' => float,
     *   'service_type' => string,
     *   'estimated_delivery' => string,
     *   'label_url' => string|null,
     *   'error' => string|null
     * ]
     */
    public function createShipment(array $shipmentData): array;
    
    /**
     * Get tracking status for shipment
     * 
     * @param string $trackingNumber
     * @return array [
     *   'success' => bool,
     *   'status' => string,
     *   'status_description' => string,
     *   'location' => string|null,
     *   'estimated_delivery' => string|null,
     *   'tracking_events' => array,
     *   'error' => string|null
     * ]
     */
    public function getTrackingStatus(string $trackingNumber): array;
    
    /**
     * Cancel shipment if possible
     * 
     * @param string $trackingNumber
     * @return array [
     *   'success' => bool,
     *   'cancelled' => bool,
     *   'refund_amount' => float|null,
     *   'error' => string|null
     * ]
     */
    public function cancelShipment(string $trackingNumber): array;
    
    /**
     * Get provider display name
     */
    public function getDisplayName(): string;
    
    /**
     * Get supported service types
     * 
     * @return array ['service_code' => 'Service Name']
     */
    public function getSupportedServices(): array;
    
    /**
     * Get coverage areas
     * 
     * @return array ['area_type' => 'Description']
     */
    public function getCoverageAreas(): array;
    
    /**
     * Get provider features
     * 
     * @return array [
     *   'cod_support' => bool,
     *   'tracking' => bool,
     *   'insurance' => bool,
     *   'signature_required' => bool,
     *   'saturday_delivery' => bool,
     *   'max_weight_kg' => float,
     *   'max_dimensions_cm' => array
     * ]
     */
    public function getFeatures(): array;
    
    /**
     * Test provider connection
     */
    public function testConnection(): bool;
    
    /**
     * Validate address for this provider
     * 
     * @param array $address
     * @return array [
     *   'valid' => bool,
     *   'normalized_address' => array|null,
     *   'suggestions' => array,
     *   'error' => string|null
     * ]
     */
    public function validateAddress(array $address): array;
    
    /**
     * Get shipping zones supported by this provider
     * 
     * @return array
     */
    public function getSupportedZones(): array;
}
