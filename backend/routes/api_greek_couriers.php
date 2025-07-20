<?php

use App\Http\Controllers\Api\GreekCourierController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Greek Courier API Routes
|--------------------------------------------------------------------------
|
| Routes for ELTA, ACS, Speedex, and Courier Center integrations
|
*/

Route::prefix('greek-couriers')->group(function () {
    
    // Provider information
    Route::get('/providers', [GreekCourierController::class, 'getProviders']);
    Route::get('/test-connections', [GreekCourierController::class, 'testConnections']);
    
    // Rate calculation
    Route::post('/calculate-rates', [GreekCourierController::class, 'calculateRates']);
    Route::post('/best-rate', [GreekCourierController::class, 'getBestRate']);
    
    // Shipment management
    Route::post('/create-shipment', [GreekCourierController::class, 'createShipment']);
    Route::post('/track-shipment', [GreekCourierController::class, 'trackShipment']);
    Route::post('/cancel-shipment', [GreekCourierController::class, 'cancelShipment']);
    
    // Address validation
    Route::post('/validate-address', [GreekCourierController::class, 'validateAddress']);
    
    // Webhook endpoints for tracking updates (if supported by providers)
    Route::post('/webhooks/elta', [GreekCourierController::class, 'handleEltaWebhook']);
    Route::post('/webhooks/acs', [GreekCourierController::class, 'handleAcsWebhook']);
    Route::post('/webhooks/speedex', [GreekCourierController::class, 'handleSpeedexWebhook']);
    Route::post('/webhooks/courier-center', [GreekCourierController::class, 'handleCourierCenterWebhook']);
});
