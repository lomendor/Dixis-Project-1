<?php

namespace App\Services;

use App\Models\ShippingZone;
use Illuminate\Support\Facades\File;

class ShippingZoneGeoJsonService
{
    /**
     * Get GeoJSON data for all shipping zones
     *
     * @return array
     */
    public function getAllZonesGeoJson(): array
    {
        $path = database_path('data/shipping_zones_geojson.json');
        
        if (File::exists($path)) {
            $geoJson = json_decode(File::get($path), true);
            return $geoJson;
        }
        
        // If file doesn't exist, return empty feature collection
        return [
            'type' => 'FeatureCollection',
            'features' => []
        ];
    }
    
    /**
     * Get GeoJSON data for a specific shipping zone
     *
     * @param int $zoneId
     * @return array|null
     */
    public function getZoneGeoJson(int $zoneId): ?array
    {
        $geoJson = $this->getAllZonesGeoJson();
        
        foreach ($geoJson['features'] as $feature) {
            if ($feature['properties']['id'] === $zoneId) {
                return $feature;
            }
        }
        
        return null;
    }
    
    /**
     * Get GeoJSON data with zone information from database
     *
     * @return array
     */
    public function getEnrichedZonesGeoJson(): array
    {
        $geoJson = $this->getAllZonesGeoJson();
        $zones = ShippingZone::all()->keyBy('id');
        
        foreach ($geoJson['features'] as &$feature) {
            $zoneId = $feature['properties']['id'];
            
            if (isset($zones[$zoneId])) {
                $zone = $zones[$zoneId];
                
                // Enrich properties with database information
                $feature['properties']['name'] = $zone->name;
                $feature['properties']['description'] = $zone->description;
                $feature['properties']['color'] = $zone->color;
                $feature['properties']['is_active'] = $zone->is_active;
            }
        }
        
        return $geoJson;
    }
}
