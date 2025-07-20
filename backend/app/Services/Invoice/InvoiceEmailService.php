<?php

namespace App\Services\Invoice;

use App\Models\Invoice\Invoice;
use App\Mail\InvoiceMail;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;

class InvoiceEmailService
{
    /**
     * Send invoice via email
     */
    public function sendInvoice(Invoice $invoice): void
    {
        $invoice->load(['user', 'order', 'items']);

        // Generate PDF if not exists
        if (!$invoice->pdf_path) {
            $pdfService = app(InvoicePdfService::class);
            $pdfContent = $pdfService->generate($invoice);
            $pdfPath = $this->savePdfToStorage($invoice, $pdfContent);
            $invoice->update(['pdf_path' => $pdfPath]);
        }

        // Send email with PDF attachment
        Mail::to($invoice->user->email)
            ->send(new InvoiceMail($invoice));
    }

    /**
     * Send overdue notice
     */
    public function sendOverdueNotice(Invoice $invoice): void
    {
        $invoice->load(['user', 'order']);

        Mail::to($invoice->user->email)
            ->send(new \App\Mail\OverdueInvoiceMail($invoice));
    }

    /**
     * Send payment confirmation
     */
    public function sendPaymentConfirmation(Invoice $invoice): void
    {
        $invoice->load(['user', 'order']);

        Mail::to($invoice->user->email)
            ->send(new \App\Mail\PaymentConfirmationMail($invoice));
    }

    /**
     * Save PDF content to storage
     */
    private function savePdfToStorage(Invoice $invoice, string $pdfContent): string
    {
        $filename = 'invoice-' . $invoice->invoice_number . '.pdf';
        $path = 'invoices/' . date('Y/m') . '/' . $filename;
        
        Storage::disk('public')->put($path, $pdfContent);
        
        return $path;
    }
}