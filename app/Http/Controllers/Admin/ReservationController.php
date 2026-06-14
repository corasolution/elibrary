<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Jobs\SendReservationReadyNotice;
use App\Models\Tenant\BibliographicRecord;
use App\Models\Tenant\PhysicalItem;
use App\Models\Tenant\Reservation;
use App\Services\CirculationService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReservationController extends Controller
{
    public function __construct(private CirculationService $circulation) {}

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
                ->paginate(25)
                ->through(fn ($r) => $r->append('queue_position'));
        } catch (\Throwable) {
            $reservations = new \Illuminate\Pagination\LengthAwarePaginator([], 0, 25);
        }

        return Inertia::render('Admin/Reservations/Index', compact('reservations', 'filters'));
    }

    public function cancel(string $id)
    {
        try {
            $reservation = Reservation::whereIn('status', ['pending', 'waiting', 'ready'])
                ->findOrFail($id);

            // Hands a held copy to the next patron in queue (or releases it)
            $this->circulation->releaseReservation($reservation, 'cancelled');
        } catch (\Throwable $e) {
            return back()->with('error', $e->getMessage());
        }

        return back()->with('success', 'Reservation cancelled.');
    }

    public function markReady(string $id)
    {
        try {
            $reservation = Reservation::findOrFail($id);
            $reservation->update([
                'status'      => 'ready',
                'notified_at' => now(),
                'expiry_date' => now()->addDays(7)->toDateString(), // pickup window starts now
            ]);
        } catch (\Throwable $e) {
            return back()->with('error', $e->getMessage());
        }

        // Email is best-effort: a missing/unreachable SMTP must not fail the action.
        try {
            SendReservationReadyNotice::dispatch($reservation);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning("Reservation-ready notice failed: {$e->getMessage()}");
        }

        return back()->with('success', 'Reservation marked ready.');
    }

    // ── Holds to Pull ─────────────────────────────────────────────────────────
    public function holdsToPull()
    {
        try {
            $reservations = Reservation::with([
                'patron:id,first_name,last_name,patron_number,email',
                'bibliographicRecord:id,title,isbn',
            ])
            ->whereIn('status', ['pending', 'waiting'])
            ->whereHas('bibliographicRecord.physicalItems', fn ($q) =>
                $q->where('item_status', 'available')
            )
            ->orderBy('reserved_at')
            ->get()
            ->map(function ($r) {
                $copy = PhysicalItem::with(['collection:id,name', 'location:id,name'])
                    ->where('biblio_id', $r->biblio_id)
                    ->where('item_status', 'available')
                    ->orderBy('call_number')
                    ->first();

                return [
                    'reservation_id' => $r->id,
                    'biblio_id'       => $r->biblio_id,
                    'title'           => $r->bibliographicRecord?->title,
                    'isbn'            => $r->bibliographicRecord?->isbn,
                    'patron_name'     => trim(($r->patron?->first_name ?? '') . ' ' . ($r->patron?->last_name ?? '')),
                    'patron_number'   => $r->patron?->patron_number,
                    'patron_email'    => $r->patron?->email,
                    'reserved_at'     => $r->reserved_at,
                    'queue_position'  => $r->queue_position,
                    'item_id'         => $copy?->id,
                    'barcode'         => $copy?->barcode,
                    'call_number'     => $copy?->call_number,
                    'shelf'           => $copy?->shelf,
                    'collection'      => $copy?->collection?->name,
                    'location'        => $copy?->location?->name,
                ];
            });
        } catch (\Throwable) {
            $reservations = collect();
        }

        return Inertia::render('Admin/Circulation/HoldsToPull', [
            'holds'      => $reservations,
            'totalCount' => $reservations->count(),
        ]);
    }

    public function pull(string $id)
    {
        try {
            $reservation = Reservation::whereIn('status', ['pending', 'waiting'])->findOrFail($id);
            $copy = PhysicalItem::where('biblio_id', $reservation->biblio_id)
                ->where('item_status', 'available')->first();
            $this->circulation->advanceReservationQueue($reservation->biblio_id, $copy);
        } catch (\Throwable $e) {
            return back()->with('error', $e->getMessage());
        }
        return back()->with('success', 'Item pulled — patron notified.');
    }

    // ── Hold Ratios ───────────────────────────────────────────────────────────
    public function holdRatios(Request $request)
    {
        $minHolds = max(1, (int) $request->input('min_holds', 1));

        try {
            $ratios = BibliographicRecord::query()
                ->select('bibliographic_records.id', 'bibliographic_records.title', 'bibliographic_records.isbn')
                ->selectRaw('COUNT(DISTINCT pi.id) FILTER (WHERE pi.deleted_at IS NULL) AS total_copies')
                ->selectRaw('COUNT(DISTINCT pi.id) FILTER (WHERE pi.item_status = \'available\' AND pi.deleted_at IS NULL) AS available_copies')
                ->selectRaw('COUNT(DISTINCT r.id) AS active_holds')
                ->selectRaw('CASE WHEN COUNT(DISTINCT pi.id) FILTER (WHERE pi.item_status = \'available\' AND pi.deleted_at IS NULL) = 0 THEN 999 ELSE ROUND(COUNT(DISTINCT r.id)::numeric / NULLIF(COUNT(DISTINCT pi.id) FILTER (WHERE pi.item_status = \'available\' AND pi.deleted_at IS NULL), 0), 2) END AS ratio')
                ->leftJoin('physical_items as pi', 'pi.biblio_id', '=', 'bibliographic_records.id')
                ->leftJoin('reservations as r', function ($j) {
                    $j->on('r.biblio_id', '=', 'bibliographic_records.id')
                      ->whereIn('r.status', ['pending', 'waiting', 'ready']);
                })
                ->whereNull('bibliographic_records.deleted_at')
                ->groupBy('bibliographic_records.id', 'bibliographic_records.title', 'bibliographic_records.isbn')
                ->havingRaw('COUNT(DISTINCT r.id) >= ?', [$minHolds])
                ->orderByDesc('active_holds')
                ->limit(100)
                ->get();
        } catch (\Throwable) {
            $ratios = collect();
        }

        return Inertia::render('Admin/Circulation/HoldRatios', compact('ratios', 'minHolds'));
    }
}
