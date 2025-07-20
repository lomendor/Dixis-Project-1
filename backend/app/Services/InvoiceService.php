<?php

namespace App\Services;

use App\Models\Invoice\Invoice;
use App\Models\Invoice\InvoiceItem;
use App\Models\Invoice\InvoicePayment;
use App\Models\Order;
use App\Services\Invoice\InvoicePdfService;
use App\Services\Invoice\InvoiceEmailService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class InvoiceService
{
    protected InvoicePdfService $pdfService;
    protected InvoiceEmailService $emailService;

    public function __construct(
        InvoicePdfService $pdfService,
        InvoiceEmailService $emailService
    ) {
        $this->pdfService = $pdfService;
        $this->emailService = $emailService;
    }

    /**
     * Create invoice from order
     */
    public function createFromOrder(Order $order, array $options = []): Invoice
    {
        return DB::transaction(function () use ($order, $options) {
            // Create invoice
            $invoice = Invoice::create([
                'order_id' => $order->id,
                'user_id' => $order->user_id,
                'invoice_type' => $options['invoice_type'] ?? Invoice::TYPE_STANDARD,
                'status' => Invoice::STATUS_DRAFT,
                'issue_date' => now(),
                'due_date' => now()->addDays($options['payment_terms'] ?? 30),
                'subtotal' => $order->subtotal,
                'tax_amount' => $order->tax_amount,
                'discount_amount' => $order->discount_amount ?? 0,
                'total_amount' => $order->total_amount,
                'currency' => 'EUR',
                'payment_terms' => $options['payment_terms'] ?? 30,
                'notes' => $options['notes'] ?? null,
                'created_by' => auth()->id()
            ]);

            // Create invoice items from order items
            foreach ($order->items as $orderItem) {
                InvoiceItem::create([
                    'invoice_id' => $invoice->id,
                    'product_id' => $orderItem->product_id,
                    'description' => $orderItem->product->name,
                    'quantity' => $orderItem->quantity,
                    'unit_price' => $orderItem->price,
                    'discount_amount' => $orderItem->discount_amount ?? 0,
                    'tax_rate' => 24.00, // Greek VAT
                    'tax_amount' => $orderItem->quantity * $orderItem->price * 0.24,
                    'product_sku' => $orderItem->product->sku,
                    'product_name' => $orderItem->product->name,
                    'unit_of_measure' => $orderItem->product->unit ?? 'τεμ.'
                ]);
            }

            // Recalculate totals
            $invoice->recalculateTotals();

            Log::info('Invoice created from order', [
                'invoice_id' => $invoice->id,
                'order_id' => $order->id,
                'total_amount' => $invoice->total_amount
            ]);

            return $invoice->load(['items', 'order']);
        });
    }

    /**
     * Generate PDF for invoice
     */
    public function generatePdf(Invoice $invoice): string
    {
        return $this->pdfService->generate($invoice);
    }

    /**
     * Send invoice via email
     */
    public function sendInvoiceEmail(Invoice $invoice): void
    {
        // Generate PDF if not exists
        if (!$invoice->pdf_path) {
            $pdfContent = $this->generatePdf($invoice);
            $pdfPath = $this->savePdfToStorage($invoice, $pdfContent);
            $invoice->update(['pdf_path' => $pdfPath]);
        }

        // Send email
        $this->emailService->sendInvoice($invoice);

        // Update invoice status
        $invoice->markAsSent();

        Log::info('Invoice email sent', [
            'invoice_id' => $invoice->id,
            'recipient' => $invoice->user->email
        ]);
    }

    /**
     * Mark invoice as paid
     */
    public function markAsPaid(Invoice $invoice, array $paymentData): void
    {
        DB::transaction(function () use ($invoice, $paymentData) {
            // Create payment record
            InvoicePayment::create([
                'invoice_id' => $invoice->id,
                'payment_method' => $paymentData['payment_method'],
                'amount' => $invoice->total_amount,
                'currency' => $invoice->currency,
                'payment_date' => now(),
                'transaction_id' => $paymentData['transaction_id'] ?? null,
                'notes' => $paymentData['notes'] ?? null,
                'status' => InvoicePayment::STATUS_COMPLETED
            ]);

            // Update invoice status
            $invoice->markAsPaid();

            Log::info('Invoice marked as paid', [
                'invoice_id' => $invoice->id,
                'amount' => $invoice->total_amount,
                'payment_method' => $paymentData['payment_method']
            ]);
        });
    }

    /**
     * Create credit note for invoice
     */
    public function createCreditNote(Invoice $originalInvoice, array $items = []): Invoice
    {
        return DB::transaction(function () use ($originalInvoice, $items) {
            $creditNote = Invoice::create([
                'order_id' => $originalInvoice->order_id,
                'user_id' => $originalInvoice->user_id,
                'invoice_type' => Invoice::TYPE_CREDIT_NOTE,
                'status' => Invoice::STATUS_DRAFT,
                'issue_date' => now(),
                'currency' => $originalInvoice->currency,
                'notes' => 'Credit note for invoice ' . $originalInvoice->invoice_number,
                'created_by' => auth()->id()
            ]);

            // If no specific items provided, credit the entire invoice
            if (empty($items)) {
                foreach ($originalInvoice->items as $originalItem) {
                    InvoiceItem::create([
                        'invoice_id' => $creditNote->id,
                        'product_id' => $originalItem->product_id,
                        'description' => $originalItem->description,
                        'quantity' => -$originalItem->quantity, // Negative for credit
                        'unit_price' => $originalItem->unit_price,
                        'tax_rate' => $originalItem->tax_rate,
                        'product_sku' => $originalItem->product_sku,
                        'product_name' => $originalItem->product_name,
                        'unit_of_measure' => $originalItem->unit_of_measure
                    ]);
                }
            } else {
                // Create credit note for specific items
                foreach ($items as $item) {
                    InvoiceItem::create([
                        'invoice_id' => $creditNote->id,
                        'product_id' => $item['product_id'],
                        'description' => $item['description'],
                        'quantity' => -abs($item['quantity']), // Ensure negative
                        'unit_price' => $item['unit_price'],
                        'tax_rate' => $item['tax_rate'] ?? 24.00,
                        'product_sku' => $item['product_sku'] ?? null,
                        'product_name' => $item['product_name'] ?? null,
                        'unit_of_measure' => $item['unit_of_measure'] ?? 'τεμ.'
                    ]);
                }
            }

            $creditNote->recalculateTotals();

            return $creditNote->load(['items']);
        });
    }

    /**
     * Get overdue invoices
     */
    public function getOverdueInvoices(): \Illuminate\Database\Eloquent\Collection
    {
        return Invoice::where('status', '!=', Invoice::STATUS_PAID)
            ->where('due_date', '<', now())
            ->with(['user', 'order'])
            ->get()
            ->each(function ($invoice) {
                if ($invoice->status !== Invoice::STATUS_OVERDUE) {
                    $invoice->update(['status' => Invoice::STATUS_OVERDUE]);
                }
            });
    }

    /**
     * Calculate invoice statistics
     */
    public function getInvoiceStatistics(int $userId = null): array
    {
        $query = Invoice::query();
        
        if ($userId) {
            $query->where('user_id', $userId);
        }

        return [
            'total_invoices' => $query->count(),
            'draft_invoices' => $query->where('status', Invoice::STATUS_DRAFT)->count(),
            'sent_invoices' => $query->where('status', Invoice::STATUS_SENT)->count(),
            'paid_invoices' => $query->where('status', Invoice::STATUS_PAID)->count(),
            'overdue_invoices' => $query->where('status', Invoice::STATUS_OVERDUE)->count(),
            'total_amount' => $query->sum('total_amount'),
            'paid_amount' => $query->where('status', Invoice::STATUS_PAID)->sum('total_amount'),
            'outstanding_amount' => $query->whereIn('status', [
                Invoice::STATUS_SENT, 
                Invoice::STATUS_OVERDUE
            ])->sum('total_amount')
        ];
    }

    /**
     * Save PDF content to storage
     */
    private function savePdfToStorage(Invoice $invoice, string $pdfContent): string
    {
        $filename = 'invoice-' . $invoice->invoice_number . '.pdf';
        $path = 'invoices/' . date('Y/m') . '/' . $filename;
        
        \Storage::disk('public')->put($path, $pdfContent);
        
        return $path;
    }
}