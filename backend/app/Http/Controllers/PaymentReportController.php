<?php

namespace App\Http\Controllers;

use App\Services\PaymentReportService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

class PaymentReportController extends Controller
{
    protected PaymentReportService $reportService;
    
    public function __construct(PaymentReportService $reportService)
    {
        $this->reportService = $reportService;
    }
    
    /**
     * Generate monthly payment report
     */
    public function monthlyReport(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'month' => 'required|integer|min:1|max:12',
            'year' => 'required|integer|min:2020|max:' . (date('Y') + 1),
            'format' => 'sometimes|in:json,csv,excel',
        ]);
        
        try {
            $report = $this->reportService->generateMonthlyReport(
                $validated['month'],
                $validated['year']
            );
            
            $format = $validated['format'] ?? 'json';
            
            if ($format === 'json') {
                return response()->json($report);
            }
            
            return $this->exportReport($report, $format, 'monthly', $validated);
            
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Αποτυχία δημιουργίας αναφοράς',
                'message' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }
    
    /**
     * Generate custom period report
     */
    public function customReport(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'format' => 'sometimes|in:json,csv,excel',
        ]);
        
        try {
            $startDate = Carbon::parse($validated['start_date'])->startOfDay();
            $endDate = Carbon::parse($validated['end_date'])->endOfDay();
            
            // Limit to max 1 year period
            if ($startDate->diffInDays($endDate) > 365) {
                return response()->json([
                    'error' => 'Η περίοδος δεν μπορεί να υπερβαίνει το 1 έτος',
                ], 400);
            }
            
            $report = $this->reportService->generateCustomReport($startDate, $endDate);
            
            $format = $validated['format'] ?? 'json';
            
            if ($format === 'json') {
                return response()->json($report);
            }
            
            return $this->exportReport($report, $format, 'custom', $validated);
            
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Αποτυχία δημιουργίας αναφοράς',
                'message' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }
    
    /**
     * Generate tax report for accounting
     */
    public function taxReport(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'month' => 'required|integer|min:1|max:12',
            'year' => 'required|integer|min:2020|max:' . (date('Y') + 1),
            'format' => 'sometimes|in:json,csv,excel',
        ]);
        
        try {
            $report = $this->reportService->generateTaxReport(
                $validated['month'],
                $validated['year']
            );
            
            $format = $validated['format'] ?? 'json';
            
            if ($format === 'json') {
                return response()->json($report);
            }
            
            // For tax reports, always use Excel format for better formatting
            $filename = "tax_report_{$validated['year']}_{$validated['month']}.csv";
            $filePath = $this->reportService->exportToExcel(
                $report['tax_data'],
                $report['tax_summary'],
                $filename
            );
            
            return $this->downloadFile($filePath, $filename);
            
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Αποτυχία δημιουργίας φορολογικής αναφοράς',
                'message' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }
    
    /**
     * Export report in specified format
     */
    protected function exportReport(array $report, string $format, string $type, array $params): JsonResponse
    {
        try {
            $timestamp = now()->format('Y-m-d_H-i-s');
            
            if ($type === 'monthly') {
                $filename = "monthly_payment_report_{$params['year']}-{$params['month']}_{$timestamp}";
            } else {
                $startDate = Carbon::parse($params['start_date'])->format('Y-m-d');
                $endDate = Carbon::parse($params['end_date'])->format('Y-m-d');
                $filename = "payment_report_{$startDate}_to_{$endDate}_{$timestamp}";
            }
            
            if ($format === 'csv') {
                $filename .= '.csv';
                $filePath = $this->reportService->exportToCSV($report['report_data'], $filename);
            } else { // excel
                $filename .= '.csv'; // Excel-compatible CSV
                $filePath = $this->reportService->exportToExcel(
                    $report['report_data'],
                    $report['summary'],
                    $filename
                );
            }
            
            return $this->downloadFile($filePath, $filename);
            
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Αποτυχία εξαγωγής αναφοράς',
                'message' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }
    
    /**
     * Download file response
     */
    protected function downloadFile(string $filePath, string $filename): JsonResponse
    {
        if (!Storage::disk('local')->exists($filePath)) {
            return response()->json([
                'error' => 'Το αρχείο δεν βρέθηκε',
            ], 404);
        }
        
        $fileContent = Storage::disk('local')->get($filePath);
        $fileSize = Storage::disk('local')->size($filePath);
        
        // Clean up file after sending
        Storage::disk('local')->delete($filePath);
        
        return response()->json([
            'success' => true,
            'message' => 'Η αναφορά δημιουργήθηκε επιτυχώς',
            'download' => [
                'filename' => $filename,
                'content' => base64_encode($fileContent),
                'size' => $fileSize,
                'mime_type' => 'text/csv',
            ],
        ]);
    }
    
    /**
     * Get available report periods
     */
    public function availablePeriods(): JsonResponse
    {
        try {
            // Get first and last payment dates
            $firstPayment = \App\Models\Payment::where('status', 'succeeded')
                ->oldest()
                ->first();
            $lastPayment = \App\Models\Payment::where('status', 'succeeded')
                ->latest()
                ->first();
            
            if (!$firstPayment || !$lastPayment) {
                return response()->json([
                    'available_months' => [],
                    'date_range' => null,
                ]);
            }
            
            $startDate = $firstPayment->created_at->startOfMonth();
            $endDate = $lastPayment->created_at->endOfMonth();
            
            $availableMonths = [];
            $current = $startDate->copy();
            
            while ($current <= $endDate) {
                $availableMonths[] = [
                    'year' => $current->year,
                    'month' => $current->month,
                    'month_name' => $current->format('F'),
                    'display' => $current->format('F Y'),
                ];
                $current->addMonth();
            }
            
            return response()->json([
                'available_months' => array_reverse($availableMonths), // Most recent first
                'date_range' => [
                    'start' => $firstPayment->created_at->format('Y-m-d'),
                    'end' => $lastPayment->created_at->format('Y-m-d'),
                ],
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Αποτυχία φόρτωσης διαθέσιμων περιόδων',
                'message' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }
}