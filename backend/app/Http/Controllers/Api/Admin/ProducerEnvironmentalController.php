<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Producer;
use App\Models\ProducerEnvironmentalStat;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ProducerEnvironmentalController extends Controller
{
    /**
     * Update environmental data for a producer.
     *
     * @param Request $request
     * @param int $producerId
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $producerId)
    {
        $validator = Validator::make($request->all(), [
            'stats.distance' => 'required|numeric|min:0',
            'stats.co2_saved' => 'required|numeric|min:0',
            'stats.water_saved' => 'required|numeric|min:0',
            'stats.packaging_saved' => 'required|numeric|min:0'
        ]);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        $producer = Producer::findOrFail($producerId);
        
        $stats = $request->stats;
        
        $environmentalStats = ProducerEnvironmentalStat::updateOrCreate(
            ['producer_id' => $producerId],
            [
                'distance' => $stats['distance'],
                'co2_saved' => $stats['co2_saved'],
                'water_saved' => $stats['water_saved'],
                'packaging_saved' => $stats['packaging_saved']
            ]
        );
        
        return response()->json([
            'success' => true,
            'data' => $environmentalStats
        ]);
    }
}