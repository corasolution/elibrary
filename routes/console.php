<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;
use App\Jobs\GenerateDailyStats;
use App\Jobs\SendOverdueNotice;
use App\Models\Tenant\Loan;
use App\Services\NotificationService;
use Carbon\Carbon;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// ─── Scheduled Tasks ─────────────────────────────────────────────────────────

// Daily stats at midnight
Schedule::job(new GenerateDailyStats(Carbon::yesterday()))
    ->dailyAt('00:05')
    ->withoutOverlapping();

// Overdue notices at 8am daily (per tenant)
Schedule::call(function () {
    \App\Models\Central\Tenant::all()->each(function ($tenant) {
        try {
            tenancy()->initialize($tenant);
            Loan::with('patron')
                ->whereNull('returned_at')
                ->where('due_date', '<', now())
                ->whereHas('patron', fn ($q) => $q->where('status', 'active'))
                ->get()
                ->each(fn ($loan) => SendOverdueNotice::dispatch($loan));
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error("Overdue notices failed for tenant {$tenant->id}: {$e->getMessage()}");
        } finally {
            tenancy()->end();
        }
    });
})->dailyAt('08:00')->name('send-overdue-notices')->withoutOverlapping();

// Due-date reminders at 9am daily — notify patrons whose item is due in N days
Schedule::call(function () {
    \App\Models\Central\Tenant::all()->each(function ($tenant) {
        try {
            tenancy()->initialize($tenant);

            // Read settings inside tenant context
            $sendReminders = \App\Models\Tenant\LibrarySetting::get('send_due_reminders', '1');
            if ($sendReminders === '0') {
                tenancy()->end();
                return;
            }

            $reminderDays = (int) \App\Models\Tenant\LibrarySetting::get('reminder_days_before', 3);
            $targetDate   = now()->addDays($reminderDays)->toDateString();

            Loan::with(['patron', 'item.bibliographicRecord'])
                ->whereNull('returned_at')
                ->whereDate('due_date', $targetDate)
                ->whereHas('patron', fn ($q) => $q->where('status', 'active'))
                ->get()
                ->each(function ($loan) {
                    try {
                        app(NotificationService::class)->sendDueDateReminder($loan);
                    } catch (\Throwable) {}
                });
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error("Due-date reminders failed for tenant {$tenant->id}: {$e->getMessage()}");
        } finally {
            tenancy()->end();
        }
    });
})->dailyAt('09:00')->name('send-due-date-reminders')->withoutOverlapping();

// Expire stale holds and advance reservation queues - 7:30am daily per tenant
// (before the 8am overdue run so freed copies are reflected in notices)
Schedule::call(function () {
    \App\Models\Central\Tenant::all()->each(function ($tenant) {
        try {
            tenancy()->initialize($tenant);

            \Illuminate\Support\Facades\Artisan::call('reservations:expire');

        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error("Reservation expiry failed for tenant {$tenant->id}: {$e->getMessage()}");
        } finally {
            tenancy()->end();
        }
    });
})->dailyAt('07:30')->name('expire-reservations')->withoutOverlapping();

// Cleanup deleted tenants (permanently delete after 30 days) - runs at 2am daily
Schedule::command('tenants:cleanup-deleted')
    ->dailyAt('02:00')
    ->name('cleanup-deleted-tenants')
    ->withoutOverlapping();

// Cleanup deleted catalog records (30 days) - runs at 3am daily per tenant
Schedule::call(function () {
    \App\Models\Central\Tenant::all()->each(function ($tenant) {
        try {
            tenancy()->initialize($tenant);

            \Illuminate\Support\Facades\Artisan::call('catalog:cleanup-deleted');

        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error("Catalog cleanup failed for tenant {$tenant->id}: {$e->getMessage()}");
        } finally {
            tenancy()->end();
        }
    });
})->dailyAt('03:00')->name('cleanup-all-tenant-catalogs')->withoutOverlapping();
