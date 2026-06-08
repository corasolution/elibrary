<?php

namespace App\Services;

use App\Models\Tenant\Loan;
use App\Models\Tenant\Patron;
use App\Models\Tenant\Reservation;
use Illuminate\Support\Facades\Mail;

class NotificationService
{
    public function sendCheckoutConfirmation(Loan $loan): void
    {
        $patron = $loan->patron;
        if (! $patron?->email) {
            return;
        }

        Mail::send('emails.checkout-confirmation', [
            'patron' => $patron,
            'loan'   => $loan,
            'item'   => $loan->item->load('bibliographicRecord'),
        ], function ($m) use ($patron) {
            $m->to($patron->email, $patron->full_name)
              ->subject('Checkout Confirmation — ' . config('app.name'));
        });
    }

    public function sendDueDateReminder(Loan $loan): void
    {
        $patron = $loan->patron;
        if (! $patron?->email) {
            return;
        }

        $daysLeft = now()->startOfDay()->diffInDays($loan->due_date, false);

        Mail::send('emails.due-date-reminder', [
            'patron'   => $patron,
            'loan'     => $loan,
            'item'     => $loan->item->load('bibliographicRecord'),
            'daysLeft' => $daysLeft,
        ], function ($m) use ($patron) {
            $m->to($patron->email, $patron->full_name)
              ->subject('Your loan is due soon — ' . config('app.name'));
        });
    }

    public function sendOverdueNotice(Loan $loan): void
    {
        $patron = $loan->patron;
        if (! $patron?->email) {
            return;
        }

        $daysOverdue = now()->startOfDay()->diffInDays($loan->due_date);

        Mail::send('emails.overdue-notice', [
            'patron'     => $patron,
            'loan'       => $loan,
            'item'       => $loan->item->load('bibliographicRecord'),
            'daysOverdue' => $daysOverdue,
            'fine'       => $loan->fine_amount,
        ], function ($m) use ($patron) {
            $m->to($patron->email, $patron->full_name)
              ->subject('Overdue Item Notice — ' . config('app.name'));
        });
    }

    public function sendReservationReady(Reservation $reservation): void
    {
        $patron = $reservation->patron;
        if (! $patron?->email) {
            return;
        }

        Mail::send('emails.reservation-ready', [
            'patron'      => $patron,
            'reservation' => $reservation,
            'record'      => $reservation->bibliographicRecord,
            'expiryDate'  => $reservation->expiry_date,
        ], function ($m) use ($patron) {
            $m->to($patron->email, $patron->full_name)
              ->subject('Your reserved item is ready — ' . config('app.name'));
        });
    }

    public function sendWelcome(Patron $patron): void
    {
        if (! $patron->email) {
            return;
        }

        Mail::send('emails.welcome', [
            'patron' => $patron,
        ], function ($m) use ($patron) {
            $m->to($patron->email, $patron->full_name)
              ->subject('Welcome to ' . config('app.name'));
        });
    }

    public function sendPasswordReset(Patron $patron, string $resetUrl): void
    {
        if (! $patron->email) {
            return;
        }

        Mail::send('emails.password-reset', [
            'patron'   => $patron,
            'resetUrl' => $resetUrl,
        ], function ($m) use ($patron) {
            $m->to($patron->email, $patron->full_name)
              ->subject('Reset your password — ' . config('app.name'));
        });
    }

    public function sendTrialExpiry(string $adminEmail, string $libraryName, string $trialEndsAt): void
    {
        Mail::send('emails.trial-expiry', [
            'libraryName' => $libraryName,
            'trialEndsAt' => $trialEndsAt,
        ], function ($m) use ($adminEmail, $libraryName) {
            $m->to($adminEmail, $libraryName)
              ->subject('Your CoraLibrary trial is expiring soon');
        });
    }

    /**
     * Dispatch overdue notices for all active overdue loans.
     * Called by SendOverdueNotice job (scheduled daily).
     */
    public function dispatchOverdueNotices(): int
    {
        $count = 0;

        Loan::whereNull('returned_at')
            ->whereDate('due_date', '<', now()->toDateString())
            ->with(['patron', 'item.bibliographicRecord'])
            ->chunk(100, function ($loans) use (&$count) {
                foreach ($loans as $loan) {
                    try {
                        $this->sendOverdueNotice($loan);
                        $count++;
                    } catch (\Throwable) {
                        // Log silently; don't abort the batch
                    }
                }
            });

        return $count;
    }

    /**
     * Dispatch due-date reminders for loans due in exactly 3 days.
     */
    public function dispatchDueDateReminders(): int
    {
        $count = 0;
        $targetDate = now()->addDays(3)->toDateString();

        Loan::whereNull('returned_at')
            ->whereDate('due_date', $targetDate)
            ->with(['patron', 'item.bibliographicRecord'])
            ->chunk(100, function ($loans) use (&$count) {
                foreach ($loans as $loan) {
                    try {
                        $this->sendDueDateReminder($loan);
                        $count++;
                    } catch (\Throwable) {
                    }
                }
            });

        return $count;
    }
}
