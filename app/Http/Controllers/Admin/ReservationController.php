<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Tenant\Reservation;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReservationController extends Controller
{
    public function __construct(private NotificationService $notifications) {}

    public function index(Request $request)
    {
        $filters = $request->only(['q', 'status']);

        try {
            $reservations = Reservation::with(['patron', 'bibliographicRecord'])
                ->whereIn('status', ['pending', 'waiting', 'ready'])
                ->when($filters['q'] ?? null, function ($q, $search) {
                    $q->whereHas('patron', fn ($p) => $p->where('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhere('patron_number', 'like', "%{$search}%"));
                })
                ->when($filters['status'] ?? null, fn ($q, $s) => $q->where('status', $s))
                ->latest('reserved_at')
                ->paginate(25);
        } catch (\Throwable) {
            $reservations = new \Illuminate\Pagination\LengthAwarePaginator([], 0, 25);
        }

        return Inertia::render('Admin/Reservations/Index', compact('reservations', 'filters'));
    }

    public function cancel(string $id)
    {
        try {
            Reservation::whereIn('status', ['pending', 'waiting', 'ready'])
                ->findOrFail($id)
                ->update(['status' => 'cancelled']);
        } catch (\Throwable $e) {
            return back()->with('error', $e->getMessage());
        }

        return back()->with('success', 'Reservation cancelled.');
    }

    public function markReady(string $id)
    {
        try {
            $reservation = Reservation::findOrFail($id);
            $reservation->update(['status' => 'ready', 'notified_at' => now()]);
            $this->notifications->sendReservationReady($reservation->load(['patron', 'bibliographicRecord']));
        } catch (\Throwable $e) {
            return back()->with('error', $e->getMessage());
        }

        return back()->with('success', 'Patron notified and reservation marked ready.');
    }
}
