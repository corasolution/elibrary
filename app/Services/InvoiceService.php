<?php

namespace App\Services;

use App\Models\Central\Invoice;
use App\Models\Central\PaymentTransaction;
use App\Models\Central\PlatformSetting;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;

class InvoiceService
{
    /**
     * Create invoice from payment transaction
     */
    public function createInvoice(PaymentTransaction $payment): Invoice
    {
        $payment->load(['plan', 'tenant']);

        // Get VAT rate from settings
        $vatRate = (float) PlatformSetting::get('vat_rate', 10.00);

        // Calculate amounts (payment.amount should be total including VAT)
        $totalAmount = $payment->amount;
        $subtotal = $totalAmount / (1 + ($vatRate / 100));
        $taxAmount = $totalAmount - $subtotal;

        // Get exchange rate for KHR conversion
        $exchangeRate = (float) PlatformSetting::get('usd_to_khr_rate', 4100.00);
        $totalKhr = $totalAmount * $exchangeRate;

        // Create invoice
        $invoice = Invoice::create([
            'invoice_number' => Invoice::generateInvoiceNumber(),
            'payment_transaction_id' => $payment->id,
            'tenant_id' => $payment->tenant_id,
            'plan_id' => $payment->plan_id,
            'invoice_date' => now(),
            'due_date' => null,  // Already paid
            'subtotal' => round($subtotal, 2),
            'tax_rate' => $vatRate,
            'tax_amount' => round($taxAmount, 2),
            'total_amount' => $totalAmount,
            'currency' => $payment->currency,
            'exchange_rate' => $exchangeRate,
            'total_khr' => round($totalKhr, 2),
            'status' => 'paid',
        ]);

        // Generate PDF
        $this->generatePdf($invoice);

        return $invoice;
    }

    /**
     * Generate PDF invoice (Cambodia tax format)
     */
    public function generatePdf(Invoice $invoice): string
    {
        $invoice->load(['tenant', 'plan', 'paymentTransaction']);

        // Get company settings
        $settings = [
            'company_name_en' => PlatformSetting::get('company_name_en', 'Alpha eLibrary'),
            'company_name_km' => PlatformSetting::get('company_name_km', 'អាល់ហ្វា អ៊ីឡាយប្រារី'),
            'company_address_en' => PlatformSetting::get('company_address_en', 'Phnom Penh, Cambodia'),
            'company_address_km' => PlatformSetting::get('company_address_km', 'ភ្នំពេញ ព្រះរាជាណាចក្រកម្ពុជា'),
            'company_tin' => PlatformSetting::get('company_tin', ''),
            'company_phone' => PlatformSetting::get('company_phone', ''),
            'company_email' => PlatformSetting::get('company_email', 'billing@bannalai.com'),
        ];

        // Generate PDF using Cambodia tax template
        $pdf = Pdf::loadView('invoices.cambodia-tax-invoice', [
            'invoice' => $invoice,
            'settings' => $settings,
        ])
        ->setPaper('a4', 'portrait')
        ->setOptions([
            'isHtml5ParserEnabled' => true,
            'isRemoteEnabled' => true,
            'defaultFont' => 'DejaVu Sans',  // Supports Unicode/Khmer
        ]);

        // Store PDF
        $pdfContent = $pdf->output();
        $filename = "invoices/{$invoice->invoice_number}.pdf";
        Storage::disk('s3')->put($filename, $pdfContent, 'private');

        // Update invoice with PDF path
        $invoice->update(['pdf_path' => $filename]);

        return $filename;
    }

    /**
     * Regenerate PDF (if template updated)
     */
    public function regeneratePdf(Invoice $invoice): string
    {
        return $this->generatePdf($invoice);
    }

    /**
     * Format number for Khmer locale
     */
    private function formatKhmerNumber(float $number): string
    {
        return number_format($number, 2, '.', ',');
    }
}
