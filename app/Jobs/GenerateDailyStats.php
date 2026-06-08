<?php

namespace App\Jobs;

use App\Models\Tenant\DailyStat;
use App\Models\Tenant\Loan;
use App\Models\Tenant\Patron;
use App\Models\Tenant\DigitalAccessLog;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class GenerateDailyStats implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public readonly Carbon $date)
    {
        $this->onQueue('stats');
    }

    public function handle(): void
    {
        $date      = $this->date->toDateString();
        $dateStart = $this->date->startOfDay();
        $dateEnd   = $this->date->endOfDay();

        $totalLoans     = Loan::whereBetween('checked_out_at', [$dateStart, $dateEnd])->count();
        $totalReturns   = Loan::whereBetween('returned_at',   [$dateStart, $dateEnd])->count();
        $newPatrons     = Patron::whereBetween('created_at',  [$dateStart, $dateEnd])->count();
        $digitalViews   = DigitalAccessLog::whereBetween('accessed_at', [$dateStart, $dateEnd])
            ->where('action', 'view')->count();
        $digitalDownloads = DigitalAccessLog::whereBetween('accessed_at', [$dateStart, $dateEnd])
            ->where('action', 'download')->count();
        $overdueItems   = Loan::whereNull('returned_at')->where('due_date', '<', $date)->count();

        \DB::table('daily_stats')->upsert([
            'date'              => $date,
            'total_loans'       => $totalLoans,
            'total_returns'     => $totalReturns,
            'new_patrons'       => $newPatrons,
            'digital_views'     => $digitalViews,
            'digital_downloads' => $digitalDownloads,
            'overdue_items'     => $overdueItems,
            'created_at'        => now(),
            'updated_at'        => now(),
        ], ['date'], [
            'total_loans', 'total_returns', 'new_patrons',
            'digital_views', 'digital_downloads', 'overdue_items', 'updated_at',
        ]);
    }
}
