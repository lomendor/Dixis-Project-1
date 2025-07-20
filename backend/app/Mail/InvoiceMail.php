<?php

namespace App\Mail;

use App\Models\Invoice\Invoice;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;

class InvoiceMail extends Mailable
{
    use Queueable, SerializesModels;

    public Invoice $invoice;

    /**
     * Create a new message instance.
     */
    public function __construct(Invoice $invoice)
    {
        $this->invoice = $invoice;
    }

    /**
     * Build the message.
     */
    public function build()
    {
        $this->invoice->load(['user', 'order', 'items.product']);

        $subject = 'Τιμολόγιο ' . $this->invoice->invoice_number . ' - Dixis Fresh';

        $mail = $this->subject($subject)
            ->view('emails.invoice')
            ->with([
                'invoice' => $this->invoice,
                'customer' => $this->invoice->user,
                'company' => [
                    'name' => config('app.company_name', 'Dixis Fresh'),
                    'address' => config('app.company_address', 'Αθήνα, Ελλάδα'),
                    'phone' => config('app.company_phone', '+30 210 1234567'),
                    'email' => config('app.company_email', 'info@dixis.io'),
                    'website' => config('app.url', 'https://dixis.io')
                ]
            ]);

        // Attach PDF if exists
        if ($this->invoice->pdf_path && Storage::disk('public')->exists($this->invoice->pdf_path)) {
            $mail->attach(
                Storage::disk('public')->path($this->invoice->pdf_path),
                [
                    'as' => 'invoice-' . $this->invoice->invoice_number . '.pdf',
                    'mime' => 'application/pdf'
                ]
            );
        }

        return $mail;
    }
}