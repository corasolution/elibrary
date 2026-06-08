<?php

namespace App\Jobs;

use App\Models\Tenant\Loan;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class SendOverdueNotice implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public function __construct(public readonly Loan $loan)
    {
        $this->onQueue('notifications');
    }

    public function handle(): void
    {
        if ($this->loan->isReturned()) return;

        $patron = $this->loan->patron;

        if (! $patron?->email) {
            Log::info("Skipping overdue notice for loan {$this->loan->id} — patron has no email.");
            return;
        }

        Mail::send(
            'emails.overdue-notice',
            ['loan' => $this->loan, 'patron' => $patron],
            function ($message) use ($patron) {
                $message->to($patron->email, $patron->fullName())
                    ->subject('Overdue Notice — ' . config('app.name'));
            }
        );

        Log::info("Overdue notice sent for loan {$this->loan->id} to {$patron->email}");
    }
}
