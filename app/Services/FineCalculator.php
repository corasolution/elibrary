<?php

namespace App\Services;

use App\Models\Tenant\Loan;
use Carbon\Carbon;

class FineCalculator
{
    public function calculate(Loan $loan): float
    {
        if (! $loan->isOverdue()) {
            return 0.0;
        }

        $daysOverdue  = Carbon::today()->diffInDays($loan->due_date);
        $ratePerDay   = $loan->patron->category?->fine_rate_per_day ?? 0.10;
        $maxFine      = $loan->patron->category?->max_fine ?? 10.00;

        // Collection-level rate override
        if ($loan->item->collection) {
            $ratePerDay = max($ratePerDay, $loan->item->collection->fine_rate_per_day);
        }

        $fine = round($daysOverdue * $ratePerDay, 2);

        return min($fine, (float) $maxFine);
    }

    public function calculateForOverdueLoans(): array
    {
        return Loan::with(['patron.category', 'item.collection'])
            ->whereNull('returned_at')
            ->where('due_date', '<', Carbon::today())
            ->get()
            ->map(fn (Loan $loan) => [
                'loan_id'      => $loan->id,
                'patron'       => $loan->patron->fullName(),
                'days_overdue' => $loan->daysOverdue(),
                'fine'         => $this->calculate($loan),
            ])
            ->toArray();
    }
}
