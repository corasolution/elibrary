<?php

namespace App\Services;

use App\Models\Tenant\Loan;
use App\Models\Tenant\Patron;
use App\Models\Tenant\PhysicalItem;
use App\Models\Tenant\Reservation;
use App\Jobs\SendOverdueNotice;
use App\Jobs\SendReservationReadyNotice;
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

            // Fulfil the patron's ready holds on this title. If a hold had a
            // different copy pinned on the hold shelf, pass that copy to the
            // next patron in queue (or release it back to circulation).
            $readyHolds = Reservation::where('patron_id', $patron->id)
                ->where('biblio_id', $item->biblio_id)
                ->where('status', 'ready')
                ->get();

            foreach ($readyHolds as $hold) {
                $hold->update(['status' => 'fulfilled']);

                if ($hold->item_id && $hold->item_id !== $item->id) {
                    $heldCopy = PhysicalItem::find($hold->item_id);
                    if ($heldCopy && $heldCopy->item_status === 'on_hold') {
                        $this->advanceReservationQueue($item->biblio_id, $heldCopy);
                    }
                }
            }

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

            // Promote the next hold in queue; pins this copy to the hold
            // shelf (on_hold) and notifies the patron if one is waiting.
            $this->advanceReservationQueue($loan->item->biblio_id, $loan->item);

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

        $duplicate = Reservation::where('patron_id', $patronId)
            ->where('biblio_id', $biblioId)
            ->whereIn('status', ['pending', 'waiting', 'ready'])
            ->exists();

        if ($duplicate) {
            throw ValidationException::withMessages(['reservation' => 'You already have an active hold on this title.']);
        }

        return Reservation::create([
            'patron_id'   => $patronId,
            'biblio_id'   => $biblioId,
            'item_id'     => $itemId,
            'status'      => 'pending',
            'expiry_date' => now()->addDays(7)->toDateString(),
        ]);
    }

    // ─── Reservation queue management ────────────────────────────────────────

    /**
     * Promote the next hold in this title's queue to 'ready' and notify the
     * patron. Single source of truth used by return, expire, cancel and
     * checkout paths.
     *
     * When $heldItem is given (a copy that just became free), the promoted
     * hold is pinned to that copy and the copy goes to the hold shelf
     * (item_status = on_hold). If nobody is waiting, an on_hold copy is
     * released back to 'available'.
     */
    public function advanceReservationQueue(string $biblioId, ?PhysicalItem $heldItem = null): ?Reservation
    {
        $next = Reservation::where('biblio_id', $biblioId)
            ->whereIn('status', ['pending', 'waiting'])
            ->orderBy('reserved_at')
            ->orderBy('id')
            ->lockForUpdate()
            ->first();

        if ($next) {
            $next->update([
                'status'      => 'ready',
                'notified_at' => now(),
                'expiry_date' => now()->addDays(7)->toDateString(), // pickup window starts now
                'item_id'     => $heldItem?->id ?? $next->item_id,
            ]);

            if ($heldItem) {
                $heldItem->update(['item_status' => 'on_hold']);
            }

            // Email is best-effort — a mail/SMTP failure must not break the return.
            try {
                SendReservationReadyNotice::dispatch($next);
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Log::warning("Reservation-ready notice failed: {$e->getMessage()}");
            }

            return $next;
        }

        if ($heldItem && $heldItem->item_status === 'on_hold') {
            $heldItem->update(['item_status' => 'available']);
        }

        return null;
    }

    /**
     * Cancel or expire a hold. If it was 'ready' (holding a copy on the
     * shelf), the copy passes to the next patron in queue or returns to
     * circulation.
     */
    public function releaseReservation(Reservation $reservation, string $newStatus): void
    {
        DB::transaction(function () use ($reservation, $newStatus) {
            $wasReady = $reservation->status === 'ready';

            $reservation->update(['status' => $newStatus]);

            if ($wasReady) {
                $heldItem = $reservation->item_id ? PhysicalItem::find($reservation->item_id) : null;
                if ($heldItem && $heldItem->item_status !== 'on_hold') {
                    $heldItem = null; // copy already circulating; nothing to hand over
                }
                $this->advanceReservationQueue($reservation->biblio_id, $heldItem);
            }
        });
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

        if ($item->item_status === 'on_hold') {
            $hasReadyHold = Reservation::where('patron_id', $patron->id)
                ->where('biblio_id', $item->biblio_id)
                ->where('status', 'ready')
                ->exists();

            if (! $hasReadyHold) {
                throw ValidationException::withMessages(['item' => 'This item is on hold for another patron and cannot be checked out.']);
            }
        } elseif ($item->isAvailable()) {
            // Guard the last copy against unassigned ready holds (e.g. staff
            // marked a hold ready manually without pinning a copy).
            $unassignedReadyHolds = Reservation::where('biblio_id', $item->biblio_id)
                ->where('status', 'ready')
                ->whereNull('item_id')
                ->where('patron_id', '!=', $patron->id)
                ->count();

            if ($unassignedReadyHolds > 0) {
                $otherAvailableCopies = PhysicalItem::where('biblio_id', $item->biblio_id)
                    ->where('id', '!=', $item->id)
                    ->where('item_status', 'available')
                    ->count();

                if ($otherAvailableCopies < $unassignedReadyHolds) {
                    throw ValidationException::withMessages(['item' => "This title's remaining copy is being held for another patron."]);
                }
            }
        } else {
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

}
