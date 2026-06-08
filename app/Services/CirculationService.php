<?php

namespace App\Services;

use App\Models\Tenant\Loan;
use App\Models\Tenant\Patron;
use App\Models\Tenant\PhysicalItem;
use App\Models\Tenant\Reservation;
use App\Jobs\SendOverdueNotice;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CirculationService
{
    public function __construct(private readonly FineCalculator $fineCalculator) {}

    public function checkout(string $patronId, string $itemId, ?string $staffId = null): Loan
    {
        return DB::transaction(function () use ($patronId, $itemId, $staffId) {
            $patron = Patron::findOrFail($patronId);
            $item   = PhysicalItem::with(['collection', 'bibliographicRecord'])->findOrFail($itemId);

            $this->validateCheckout($patron, $item);

            $dueDate = $this->calculateDueDate($patron, $item);

            $loan = Loan::create([
                'patron_id'      => $patron->id,
                'item_id'        => $item->id,
                'due_date'       => $dueDate,
                'checked_out_by' => $staffId,
            ]);

            $item->update(['item_status' => 'checked_out']);
            $patron->increment('active_loans');
            $patron->increment('total_checkouts');

            // Cancel any pending reservation for this patron + biblio
            Reservation::where('patron_id', $patron->id)
                ->where('biblio_id', $item->biblio_id)
                ->where('status', 'ready')
                ->update(['status' => 'fulfilled']);

            return $loan->load(['patron', 'item.bibliographicRecord']);
        });
    }

    public function returnItem(string $loanId, ?string $staffId = null): Loan
    {
        return DB::transaction(function () use ($loanId, $staffId) {
            $loan = Loan::with(['patron', 'item'])->findOrFail($loanId);

            if ($loan->isReturned()) {
                throw ValidationException::withMessages(['loan' => 'Item already returned.']);
            }

            $fine = $this->fineCalculator->calculate($loan);

            $loan->update([
                'returned_at' => now(),
                'returned_by' => $staffId,
                'fine_amount' => $fine,
            ]);

            $loan->item->update(['item_status' => 'available']);
            $loan->patron->decrement('active_loans');

            // Notify next patron in reservation queue
            $this->notifyNextReservation($loan->item->biblio_id);

            return $loan->fresh();
        });
    }

    public function renewLoan(string $loanId, ?string $staffId = null): Loan
    {
        return DB::transaction(function () use ($loanId, $staffId) {
            $loan = Loan::with(['patron.category', 'item.collection'])->findOrFail($loanId);

            if ($loan->isReturned()) {
                throw ValidationException::withMessages(['loan' => 'Cannot renew a returned loan.']);
            }

            $maxRenewals = $loan->patron->category?->renewals_allowed ?? 2;
            if ($loan->renewals_count >= $maxRenewals) {
                throw ValidationException::withMessages(['loan' => "Maximum renewals ({$maxRenewals}) reached."]);
            }

            $hasReservations = Reservation::where('biblio_id', $loan->item->biblio_id)
                ->whereIn('status', ['pending', 'waiting'])
                ->exists();

            if ($hasReservations) {
                throw ValidationException::withMessages(['loan' => 'Cannot renew — another patron has reserved this title.']);
            }

            $loanDays = $loan->item->collection?->loan_period_days
                ?? $loan->patron->category?->loan_period_days
                ?? 14;

            $newDueDate = Carbon::today()->addDays($loanDays);

            $loan->update([
                'due_date'        => $newDueDate,
                'renewed_at'      => now(),
                'renewals_count'  => $loan->renewals_count + 1,
            ]);

            return $loan->fresh();
        });
    }

    public function makeReservation(string $patronId, string $biblioId, ?string $itemId = null): Reservation
    {
        $patron = Patron::findOrFail($patronId);
        $limit  = $patron->category?->reservation_limit ?? 3;

        $activeReservations = Reservation::where('patron_id', $patronId)
            ->whereIn('status', ['pending', 'waiting', 'ready'])
            ->count();

        if ($activeReservations >= $limit) {
            throw ValidationException::withMessages(['reservation' => "Reservation limit ({$limit}) reached."]);
        }

        return Reservation::create([
            'patron_id'   => $patronId,
            'biblio_id'   => $biblioId,
            'item_id'     => $itemId,
            'status'      => 'pending',
            'expiry_date' => now()->addDays(7)->toDateString(),
        ]);
    }

    // ─── Private helpers ─────────────────────────────────────────────────────

    private function validateCheckout(Patron $patron, PhysicalItem $item): void
    {
        if (! $patron->isActive()) {
            throw ValidationException::withMessages(['patron' => 'Patron account is not active.']);
        }
        if (! $patron->canBorrow()) {
            throw ValidationException::withMessages(['patron' => 'Patron has reached their loan limit.']);
        }
        if (! $item->isAvailable()) {
            throw ValidationException::withMessages(['item' => "Item is not available (status: {$item->item_status})."]);
        }
        if ($item->collection && ! $item->collection->is_loanable) {
            throw ValidationException::withMessages(['item' => 'This collection is not available for loan.']);
        }
    }

    private function calculateDueDate(Patron $patron, PhysicalItem $item): Carbon
    {
        $days = $item->collection?->loan_period_days
            ?? $patron->category?->loan_period_days
            ?? 14;

        return Carbon::today()->addDays($days);
    }

    private function notifyNextReservation(string $biblioId): void
    {
        $next = Reservation::where('biblio_id', $biblioId)
            ->whereIn('status', ['pending', 'waiting'])
            ->oldest('reserved_at')
            ->first();

        if ($next) {
            $next->update(['status' => 'ready', 'notified_at' => now()]);
            // TODO: dispatch notification job
        }
    }
}
