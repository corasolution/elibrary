<?php

namespace App\Jobs;

use App\Models\Tenant\Reservation;
use App\Services\NotificationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendReservationReadyNotice implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public function __construct(public readonly Reservation $reservation)
    {
        $this->onQueue('notifications');
    }

    public function handle(NotificationService $notifications): void
    {
        $reservation = $this->reservation->fresh(['patron', 'bibliographicRecord']);

        // Hold may have been fulfilled/cancelled before the worker ran.
        if (! $reservation || $reservation->status !== 'ready') {
            return;
        }

        if (! $reservation->patron?->email) {
            Log::info("Skipping reservation-ready notice for {$reservation->id} — patron has no email.");
            return;
        }

        $notifications->sendReservationReady($reservation);

        Log::info("Reservation-ready notice sent for {$reservation->id} to {$reservation->patron->email}");
    }
}
