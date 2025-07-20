<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Producer;
use App\Models\ProducerEnvironmentalStat;
use Illuminate\Http\Request;

class ProducerEnvironmentalController extends Controller
{
    /**
     * Get environmental data for a producer.
     *
     * @param int $producerId
     * @return \Illuminate\Http\JsonResponse
     */
    public function index($producerId)
    {
        $stats = ProducerEnvironmentalStat::where('producer_id', $producerId)->first();
        
        if (!$stats) {
            // Return default values if no data exists
            $stats = [
                'distance' => 50,
                'co2_saved' => 0.5,
                'water_saved' => 100,
                'packaging_saved' => 0.2
            ];
        }
        
        // Calculate comparison data
        $localEmissions = [
            'distance' => $stats['distance'],
            'co2_emitted' => 0.15,
            'water_usage' => 60,
            'packaging_usage' => 0.1
        ];
        
        $conventionalEmissions = [
            'distance' => 1200,
            'co2_emitted' => 0.9,
            'water_usage' => 160,
            'packaging_usage' => 0.3
        ];
        
        return response()->json([
            'stats' => $stats,
            'comparison' => [
                'conventional' => $conventionalEmissions,
                'local' => $localEmissions
            ]
        ]);
    }
}