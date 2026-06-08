<?php

namespace App\Http\Controllers\Central;

use App\Http\Controllers\Controller;
use App\Models\Central\Invoice;
use App\Services\InvoiceService;
use App\Mail\PaymentVerifiedMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

class InvoiceController extends Controller
{
    public function __construct(
        private InvoiceService $invoiceService
    ) {}

    /**
     * Display a listing of invoices
     */
    public function index(Request $request)
    {
        $query = Invoice::with(['tenant', 'plan', 'paymentTransaction'])
            ->orderBy('invoice_date', 'desc');

        // Filter by tenant
        if ($tenantId = $request->get('tenant_id')) {
            $query->where('tenant_id', $tenantId);
        }

        // Filter by status
        if ($status = $request->get('status')) {
            $query->where('status', $status);
        }

        // Search by invoice number
        if ($search = $request->get('q')) {
            $query->where('invoice_number', 'like', "%{$search}%");
        }

        $invoices = $query->paginate(25)->through(function ($invoice) {
            return [
                'id' => $invoice->id,
                'invoice_number' => $invoice->invoice_number,
                'tenant' => [
                    'id' => $invoice->tenant->id,
                    'name' => $invoice->tenant->name,
                    'slug' => $invoice->tenant->slug,
                ],
                'plan' => $invoice->plan ? [
                    'name' => $invoice->plan->name,
                ] : null,
                'subtotal' => $invoice->subtotal,
                'tax_amount' => $invoice->tax_amount,
                'total_amount' => $invoice->total_amount,
                'currency' => $invoice->currency,
                'total_khr' => $invoice->total_khr,
                'exchange_rate' => $invoice->exchange_rate,
                'invoice_date' => $invoice->invoice_date->format('M d, Y'),
                'status' => $invoice->status,
                'sent_at' => $invoice->sent_at?->format('M d, Y H:i'),
                'has_pdf' => !is_null($invoice->pdf_path),
                'created_at' => $invoice->created_at->format('M d, Y H:i'),
            ];
        });

        // Get statistics
        $statistics = [
            'total' => Invoice::count(),
            'paid' => Invoice::where('status', 'paid')->count(),
            'issued' => Invoice::where('status', 'issued')->count(),
            'total_revenue' => Invoice::where('status', 'paid')->sum('total_amount'),
        ];

        return Inertia::render('Central/Invoices/Index', [
            'invoices' => $invoices,
            'statistics' => $statistics,
            'filters' => $request->only(['tenant_id', 'status', 'q']),
        ]);
    }

    /**
     * Download invoice PDF
     */
    public function download(string $id)
    {
        $invoice = Invoice::findOrFail($id);

        if (!$invoice->pdf_path || !Storage::disk('s3')->exists($invoice->pdf_path)) {
            return back()->with('error', 'Invoice PDF not found.');
        }

        return Storage::disk('s3')->download(
            $invoice->pdf_path,
            "{$invoice->invoice_number}.pdf"
        );
    }

    /**
     * Preview invoice PDF in browser
     */
    public function preview(string $id)
    {
        $invoice = Invoice::findOrFail($id);

        if (!$invoice->pdf_path || !Storage::disk('s3')->exists($invoice->pdf_path)) {
            abort(404, 'Invoice PDF not found.');
        }

        // Return PDF inline (not download)
        $pdf = Storage::disk('s3')->get($invoice->pdf_path);

        return response($pdf, 200)
            ->header('Content-Type', 'application/pdf')
            ->header('Content-Disposition', 'inline; filename="' . $invoice->invoice_number . '.pdf"');
    }

    /**
     * Regenerate invoice PDF
     */
    public function regenerate(string $id)
    {
        $invoice = Invoice::findOrFail($id);

        try {
            $this->invoiceService->regeneratePdf($invoice);

            return back()->with('success', 'Invoice PDF regenerated successfully.');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to regenerate invoice: ' . $e->getMessage());
        }
    }

    /**
     * Resend invoice email
     */
    public function resend(string $id)
    {
        $invoice = Invoice::with(['tenant', 'plan'])->findOrFail($id);

        if (!$invoice->tenant->email) {
            return back()->with('error', 'Tenant has no email address.');
        }

        if (!$invoice->pdf_path || !Storage::disk('s3')->exists($invoice->pdf_path)) {
            return back()->with('error', 'Invoice PDF not found. Please regenerate it first.');
        }

        try {
            Mail::to($invoice->tenant->email)
                ->send(new PaymentVerifiedMail($invoice));

            $invoice->update(['sent_at' => now()]);

            return back()->with('success', 'Invoice email resent successfully.');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to send email: ' . $e->getMessage());
        }
    }
}
