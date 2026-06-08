<?php

namespace App\Http\Controllers\Opac;

use App\Http\Controllers\Controller;
use App\Services\CirculationService;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class AccountController extends Controller
{
    public function __construct(private CirculationService $circulation) {}

    public function index(Request $request): \Inertia\Response
    {
        $patron = $request->user('patron')->load(['category']);

        return Inertia::render('Opac/MyAccount', compact('patron'));
    }

    public function loans(Request $request): \Inertia\Response
    {
        $loans = $request->user('patron')
            ->activeLoans()
            ->with('item.bibliographicRecord')
            ->latest('checked_out_at')
            ->paginate(15);

        return Inertia::render('Opac/MyLoans', compact('loans'));
    }

    public function history(Request $request): \Inertia\Response
    {
        $history = $request->user('patron')
            ->loans()
            ->with('item.bibliographicRecord')
            ->whereNotNull('returned_at')
            ->latest('returned_at')
            ->paginate(20);

        return Inertia::render('Opac/LoanHistory', compact('history'));
    }

    public function reservations(Request $request): \Inertia\Response
    {
        $reservations = $request->user('patron')
            ->reservations()
            ->with('bibliographicRecord')
            ->whereIn('status', ['pending', 'waiting', 'ready'])
            ->latest()
            ->get();

        return Inertia::render('Opac/MyReservations', compact('reservations'));
    }

    public function reserve(Request $request): \Illuminate\Http\RedirectResponse
    {
        $request->validate(['biblio_id' => 'required|uuid']);
        $patron = $request->user('patron');

        try {
            $this->circulation->makeReservation($patron->id, $request->biblio_id);
            return back()->with('success', 'Reservation placed successfully.');
        } catch (ValidationException $e) {
            return back()->withErrors($e->errors());
        } catch (\Throwable $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    public function cancelReservation(Request $request, string $id): \Illuminate\Http\RedirectResponse
    {
        $patron      = $request->user('patron');
        $reservation = $patron->reservations()->findOrFail($id);
        $reservation->update(['status' => 'cancelled']);
        return back()->with('success', 'Reservation cancelled.');
    }
}
