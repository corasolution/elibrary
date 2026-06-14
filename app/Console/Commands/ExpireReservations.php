<?php

namespace App\Console\Commands;

use App\Models\Tenant\Reservation;
use App\Services\CirculationService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

/**
 * Expires holds whose pickup/wait window has passed. Must run inside an
 * initialized tenant context (the scheduler loops tenants and calls it).
 */
class ExpireReservations extends Command
{
    protected $signature = 'reservations:expire';

    protected $description = 'Expire reservations past their expiry date and advance hold queues';

    public function handle(CirculationService $circulation): int
    {
        $today = today()->toDateString();

        // Ready holds past pickup deadline: expire one by one so each held
        // copy is handed to the next patron in queue (or released).
        $expiredReady = 0;
        Reservation::with('item')
            ->where('status', 'ready')
            ->whereDate('expiry_date', '<', $today)
            ->get()
            ->each(function (Reservation $reservation) use ($circulation, &$expiredReady) {
                try {
                    $circulation->releaseReservation($reservation, 'expired');
                    $expiredReady++;
                } catch (\Throwable $e) {
                    Log::error("Failed to expire reservation {$reservation->id}: {$e->getMessage()}");
                }
            });

        // Pending/waiting holds past expiry: no item side effects; queue
        // positions recompute automatically.
        $expiredWaiting = Reservation::whereIn('status', ['pending', 'waiting'])
            ->whereDate('expiry_date', '<', $today)
            ->update(['status' => 'expired']);

        $this->info("Expired {$expiredReady} ready hold(s) and {$expiredWaiting} pending/waiting hold(s).");

        return self::SUCCESS;
    }
}
