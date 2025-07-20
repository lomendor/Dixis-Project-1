<?php

namespace App\Services\Invoice;

use App\Models\Invoice\Invoice;
use Barryvdh\DomPDF\Facade\Pdf;

class InvoicePdfService
{
    /**
     * Generate PDF for invoice
     */
    public function generate(Invoice $invoice): string
    {
        $invoice->load(['user', 'order', 'items.product']);

        $data = [
            'invoice' => $invoice,
            'company' => $this->getCompanyInfo(),
            'customer' => $this->getCustomerInfo($invoice),
            'items' => $invoice->items,
            'totals' => $this->calculateTotals($invoice)
        ];

        $pdf = Pdf::loadView('invoices.pdf', $data)
            ->setPaper('a4', 'portrait')
            ->setOptions([
                'defaultFont' => 'DejaVu Sans',
                'isRemoteEnabled' => true,
                'isHtml5ParserEnabled' => true
            ]);

        return $pdf->output();
    }

    /**
     * Get company information for invoice
     */
    private function getCompanyInfo(): array
    {
        return [
            'name' => config('app.company_name', 'Dixis Fresh'),
            'address' => config('app.company_address', 'Αθήνα, Ελλάδα'),
            'phone' => config('app.company_phone', '+30 210 1234567'),
            'email' => config('app.company_email', 'info@dixis.io'),
            'website' => config('app.url', 'https://dixis.io'),
            'tax_number' => config('app.company_tax_number', '123456789'),
            'vat_number' => config('app.company_vat_number', 'EL123456789'),
            'logo_url' => config('app.company_logo', '/images/logo.png')
        ];
    }

    /**
     * Get customer information for invoice
     */
    private function getCustomerInfo(Invoice $invoice): array
    {
        $user = $invoice->user;
        $order = $invoice->order;
        
        return [
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone ?? '',
            'address' => $order->billingAddress ? [
                'street' => $order->billingAddress->street_address,
                'city' => $order->billingAddress->city,
                'postal_code' => $order->billingAddress->postal_code,
                'country' => $order->billingAddress->country ?? 'Ελλάδα'
            ] : null,
            'tax_number' => $user->tax_number ?? '',
            'vat_number' => $user->vat_number ?? ''
        ];
    }

    /**
     * Calculate invoice totals
     */
    private function calculateTotals(Invoice $invoice): array
    {
        $subtotal = $invoice->items->sum(function ($item) {
            return $item->quantity * $item->unit_price;
        });

        $discountAmount = $invoice->discount_amount ?? 0;
        $subtotalAfterDiscount = $subtotal - $discountAmount;
        $vatAmount = $subtotalAfterDiscount * 0.24; // 24% Greek VAT
        $total = $subtotalAfterDiscount + $vatAmount;

        return [
            'subtotal' => number_format($subtotal, 2),
            'discount_amount' => number_format($discountAmount, 2),
            'subtotal_after_discount' => number_format($subtotalAfterDiscount, 2),
            'vat_rate' => '24%',
            'vat_amount' => number_format($vatAmount, 2),
            'total' => number_format($total, 2),
            'currency' => $invoice->currency
        ];
    }
}