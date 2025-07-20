<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Integration\QuickBooksAuthController;
use App\Http\Controllers\QuickBooksController;
use App\Http\Controllers\Admin\IntegrationController;

Route::get('/', function () {
    return view('welcome');
});

// Authentication Routes
Route::get('/login', function () {
    return redirect('/');
})->name('login');

// API Login Route
Route::get('/api/login', function () {
    return redirect('/');
});

// Admin Integration Routes
Route::middleware(['auth', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::prefix('integrations')->name('integrations.')->group(function () {

        // QuickBooks Integration Routes
        Route::prefix('quickbooks')->name('quickbooks.')->group(function () {
            Route::get('/', [QuickBooksController::class, 'index'])->name('index');
            Route::get('/authorize', [QuickBooksAuthController::class, 'startAuthorization'])->name('authorize');
            Route::get('/callback', [QuickBooksAuthController::class, 'callback'])->name('callback');
            Route::post('/disconnect', [QuickBooksAuthController::class, 'disconnect'])->name('disconnect');
            Route::get('/status', [QuickBooksAuthController::class, 'status'])->name('status');
            Route::post('/sync-order/{order}', [QuickBooksController::class, 'syncOrder'])->name('sync-order');
            Route::post('/sync-customer/{customer}', [QuickBooksController::class, 'syncCustomer'])->name('sync-customer');
        });

        // Integration Dashboard
        Route::get('/', [IntegrationController::class, 'dashboard'])->name('dashboard');
        Route::get('/logs', [IntegrationController::class, 'logs'])->name('logs');
        Route::get('/health', [IntegrationController::class, 'health'])->name('health');
    });
});
