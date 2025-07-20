<?php

use App\Http\Controllers\Api\InvoiceController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Invoice API Routes
|--------------------------------------------------------------------------
|
| Here are the API routes for invoice management system.
| These routes handle invoice creation, management, PDF generation,
| email delivery, and payment tracking for the Greek market.
|
*/

Route::middleware(['auth:sanctum'])->group(function () {
    
    // Invoice CRUD operations
    Route::apiResource('invoices', InvoiceController::class);
    
    // Invoice specific actions
    Route::prefix('invoices')->group(function () {
        
        // Create invoice from order
        Route::post('create-from-order', [InvoiceController::class, 'createFromOrder'])
            ->name('invoices.create-from-order');
        
        // Invoice actions (require invoice ID)
        Route::prefix('{invoice}')->group(function () {
            
            // Send invoice via email
            Route::post('send-email', [InvoiceController::class, 'sendEmail'])
                ->name('invoices.send-email');
            
            // Download invoice PDF
            Route::get('download-pdf', [InvoiceController::class, 'downloadPdf'])
                ->name('invoices.download-pdf');
            
            // Mark invoice as paid (admin only)
            Route::post('mark-as-paid', [InvoiceController::class, 'markAsPaid'])
                ->name('invoices.mark-as-paid')
                ->middleware('role:admin');
            
            // Preview invoice (returns HTML for preview)
            Route::get('preview', [InvoiceController::class, 'preview'])
                ->name('invoices.preview');
            
            // Duplicate invoice
            Route::post('duplicate', [InvoiceController::class, 'duplicate'])
                ->name('invoices.duplicate');
            
            // Create credit note
            Route::post('credit-note', [InvoiceController::class, 'createCreditNote'])
                ->name('invoices.credit-note');
        });
    });
    
    // Invoice statistics and reports
    Route::prefix('invoice-reports')->group(function () {
        
        // User invoice statistics
        Route::get('statistics', [InvoiceController::class, 'statistics'])
            ->name('invoice-reports.statistics');
        
        // Monthly invoice summary
        Route::get('monthly-summary', [InvoiceController::class, 'monthlySummary'])
            ->name('invoice-reports.monthly-summary');
        
        // Overdue invoices
        Route::get('overdue', [InvoiceController::class, 'overdueInvoices'])
            ->name('invoice-reports.overdue');
        
        // Tax report (admin only)
        Route::get('tax-report', [InvoiceController::class, 'taxReport'])
            ->name('invoice-reports.tax-report')
            ->middleware('role:admin');
    });
    
    // Invoice payments
    Route::prefix('invoice-payments')->group(function () {
        
        // Get payments for invoice
        Route::get('invoice/{invoice}', [InvoiceController::class, 'getInvoicePayments'])
            ->name('invoice-payments.by-invoice');
        
        // Record manual payment (admin only)
        Route::post('record-payment', [InvoiceController::class, 'recordPayment'])
            ->name('invoice-payments.record')
            ->middleware('role:admin');
    });
});

// Public routes (for invoice viewing with token)
Route::prefix('public/invoices')->group(function () {
    
    // View invoice with public token
    Route::get('{invoice}/view/{token}', [InvoiceController::class, 'publicView'])
        ->name('invoices.public-view');
    
    // Download invoice PDF with public token
    Route::get('{invoice}/download/{token}', [InvoiceController::class, 'publicDownload'])
        ->name('invoices.public-download');
});

// Webhook routes for payment providers
Route::prefix('invoice-webhooks')->group(function () {
    
    // Stripe webhook for invoice payments
    Route::post('stripe', [InvoiceController::class, 'stripeWebhook'])
        ->name('invoice-webhooks.stripe');
    
    // PayPal webhook for invoice payments
    Route::post('paypal', [InvoiceController::class, 'paypalWebhook'])
        ->name('invoice-webhooks.paypal');
});

// Admin routes for invoice management
Route::middleware(['auth:sanctum', 'role:admin'])->prefix('admin/invoices')->group(function () {
    
    // Bulk operations
    Route::post('bulk-send', [InvoiceController::class, 'bulkSend'])
        ->name('admin.invoices.bulk-send');
    
    Route::post('bulk-mark-paid', [InvoiceController::class, 'bulkMarkPaid'])
        ->name('admin.invoices.bulk-mark-paid');
    
    Route::post('bulk-cancel', [InvoiceController::class, 'bulkCancel'])
        ->name('admin.invoices.bulk-cancel');
    
    // Invoice templates
    Route::get('templates', [InvoiceController::class, 'getTemplates'])
        ->name('admin.invoices.templates');
    
    Route::post('templates', [InvoiceController::class, 'createTemplate'])
        ->name('admin.invoices.create-template');
    
    // System-wide invoice statistics
    Route::get('system-statistics', [InvoiceController::class, 'systemStatistics'])
        ->name('admin.invoices.system-statistics');
    
    // Export invoices
    Route::get('export', [InvoiceController::class, 'exportInvoices'])
        ->name('admin.invoices.export');
});