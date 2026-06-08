<?php

namespace App\Mail;

use App\Models\Central\Invoice;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;

class PaymentVerifiedMail extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     */
    public function __construct(
        public Invoice $invoice
    ) {
        $this->invoice->load(['tenant', 'plan']);
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Payment Verified - Invoice {$this->invoice->invoice_number}",
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            markdown: 'emails.payment-verified',
            with: [
                'invoiceNumber' => $this->invoice->invoice_number,
                'tenantName' => $this->invoice->tenant->name,
                'planName' => $this->invoice->plan->name,
                'amount' => $this->invoice->total_amount,
                'currency' => $this->invoice->currency,
                'invoiceDate' => $this->invoice->invoice_date->format('F d, Y'),
            ],
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        $attachments = [];

        // Attach PDF invoice if it exists
        if ($this->invoice->pdf_path && Storage::disk('s3')->exists($this->invoice->pdf_path)) {
            $pdfContent = Storage::disk('s3')->get($this->invoice->pdf_path);

            $attachments[] = Attachment::fromData(fn () => $pdfContent, "{$this->invoice->invoice_number}.pdf")
                ->withMime('application/pdf');
        }

        return $attachments;
    }
}
