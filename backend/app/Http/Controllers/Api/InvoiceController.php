<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Invoice\Invoice;
use App\Models\Order;
use App\Services\InvoiceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class InvoiceController extends Controller
{
    protected InvoiceService $invoiceService;

    public function __construct(InvoiceService $invoiceService)
    {
        $this->invoiceService = $invoiceService;
    }

    /**
     * Get all invoices for authenticated user
     */
    public function index(Request $request): JsonResponse
    {
        $user = Auth::user();
        
        $query = Invoice::where('user_id', $user->id)
            ->with(['order', 'items.product', 'payments'])
            ->orderBy('created_at', 'desc');

        // Apply filters
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('date_from')) {
            $query->whereDate('issue_date', '>=', $request->date_from);
        }

        if ($request->has('date_to')) {
            $query->whereDate('issue_date', '<=', $request->date_to);
        }

        $perPage = $request->get('per_page', 15);
        $invoices = $query->paginate($perPage);

        return response()->json($invoices);
    }

    /**
     * Get specific invoice
     */
    public function show(Invoice $invoice): JsonResponse
    {
        // Check authorization
        if ($invoice->user_id !== Auth::id() && !Auth::user()->hasRole('admin')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $invoice->load([
            'order.items.product',
            'items.product',
            'payments',
            'user'
        ]);

        return response()->json($invoice);
    }

    /**
     * Create invoice from order
     */
    public function createFromOrder(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'order_id' => 'required|exists:orders,id',
            'invoice_type' => 'in:standard,proforma,credit_note,debit_note',
            'payment_terms' => 'nullable|integer|min:0|max:365',
            'notes' => 'nullable|string|max:1000'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $order = Order::findOrFail($request->order_id);
            
            // Check authorization
            if ($order->user_id !== Auth::id() && !Auth::user()->hasRole('admin')) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            $invoice = $this->invoiceService->createFromOrder($order, [
                'invoice_type' => $request->get('invoice_type', Invoice::TYPE_STANDARD),
                'payment_terms' => $request->get('payment_terms', 30),
                'notes' => $request->get('notes')
            ]);

            return response()->json($invoice->load(['items', 'order']), 201);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to create invoice: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update invoice
     */
    public function update(Request $request, Invoice $invoice): JsonResponse
    {
        // Check authorization
        if ($invoice->user_id !== Auth::id() && !Auth::user()->hasRole('admin')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Can only update draft invoices
        if ($invoice->status !== Invoice::STATUS_DRAFT) {
            return response()->json([
                'message' => 'Can only update draft invoices'
            ], 422);
        }

        $validator = Validator::make($request->all(), [
            'due_date' => 'nullable|date|after:today',
            'payment_terms' => 'nullable|integer|min:0|max:365',
            'notes' => 'nullable|string|max:1000',
            'discount_amount' => 'nullable|numeric|min:0'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $invoice->update($request->only([
                'due_date', 'payment_terms', 'notes', 'discount_amount'
            ]));

            $invoice->recalculateTotals();

            return response()->json($invoice->load(['items', 'order']));

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update invoice: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Send invoice via email
     */
    public function sendEmail(Invoice $invoice): JsonResponse
    {
        // Check authorization
        if ($invoice->user_id !== Auth::id() && !Auth::user()->hasRole('admin')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        try {
            $this->invoiceService->sendInvoiceEmail($invoice);
            
            return response()->json([
                'message' => 'Invoice sent successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to send invoice: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Download invoice PDF
     */
    public function downloadPdf(Invoice $invoice)
    {
        // Check authorization
        if ($invoice->user_id !== Auth::id() && !Auth::user()->hasRole('admin')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        try {
            $pdf = $this->invoiceService->generatePdf($invoice);
            
            return response($pdf)
                ->header('Content-Type', 'application/pdf')
                ->header('Content-Disposition', 'attachment; filename="invoice-' . $invoice->invoice_number . '.pdf"');

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to generate PDF: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mark invoice as paid
     */
    public function markAsPaid(Request $request, Invoice $invoice): JsonResponse
    {
        // Check authorization (admin only for manual payment marking)
        if (!Auth::user()->hasRole('admin')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'payment_method' => 'required|string',
            'transaction_id' => 'nullable|string',
            'notes' => 'nullable|string|max:500'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $this->invoiceService->markAsPaid($invoice, [
                'payment_method' => $request->payment_method,
                'transaction_id' => $request->transaction_id,
                'notes' => $request->notes
            ]);

            return response()->json([
                'message' => 'Invoice marked as paid successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to mark invoice as paid: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get invoice statistics
     */
    public function statistics(): JsonResponse
    {
        $user = Auth::user();
        
        $stats = [
            'total_invoices' => Invoice::where('user_id', $user->id)->count(),
            'paid_invoices' => Invoice::where('user_id', $user->id)
                ->where('status', Invoice::STATUS_PAID)->count(),
            'overdue_invoices' => Invoice::where('user_id', $user->id)
                ->where('status', Invoice::STATUS_OVERDUE)->count(),
            'total_amount' => Invoice::where('user_id', $user->id)->sum('total_amount'),
            'paid_amount' => Invoice::where('user_id', $user->id)
                ->where('status', Invoice::STATUS_PAID)->sum('total_amount'),
            'outstanding_amount' => Invoice::where('user_id', $user->id)
                ->whereIn('status', [Invoice::STATUS_SENT, Invoice::STATUS_OVERDUE])
                ->sum('total_amount')
        ];

        return response()->json($stats);
    }
}