<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class BudgetAlertMail extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     */
    public function __construct(
        public string $libraryName,
        public float $currentUsage,
        public float $budgetLimit,
        public float $percentage
    ) {}

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '⚠️ AI Budget Alert: ' . round($this->percentage) . '% Used',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.budget-alert',
            with: [
                'libraryName' => $this->libraryName,
                'currentUsage' => number_format($this->currentUsage, 2),
                'budgetLimit' => number_format($this->budgetLimit, 2),
                'percentage' => round($this->percentage),
                'remaining' => number_format($this->budgetLimit - $this->currentUsage, 2),
            ],
        );
    }
}
