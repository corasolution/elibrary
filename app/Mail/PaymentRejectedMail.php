<?php

namespace App\Mail;

use App\Models\Central\PaymentTransaction;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PaymentRejectedMail extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     */
    public function __construct(
        public PaymentTransaction $payment,
        public string $reason
    ) {
        $this->payment->load(['tenant', 'plan']);
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Payment Submission Rejected - Action Required',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            markdown: 'emails.payment-rejected',
            with: [
                'tenantName' => $this->payment->tenant->name,
                'planName' => $this->payment->plan->name,
                'amount' => $this->payment->amount,
                'currency' => $this->payment->currency,
                'reason' => $this->reason,
                'submittedAt' => $this->payment->created_at->format('F d, Y'),
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
        return [];
    }
}
