<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Tenant\DailyStat;
use App\Models\Tenant\Loan;
use App\Models\Tenant\Patron;
use App\Models\Tenant\BibliographicRecord;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $stats         = $this->safeStats();
        $recentLoans   = $this->recentLoans();
        $overdueLoans  = $this->overdueLoans();

        return Inertia::render('Admin/Dashboard', compact('stats', 'recentLoans', 'overdueLoans'));
    }

    private function safeStats(): array
    {
        try {
            $today = today()->toDateString();

            $loansToday   = Loan::whereDate('checked_out_at', $today)->count();
            $returnsToday = Loan::whereDate('returned_at', $today)->count();
            $overdue      = Loan::whereNull('returned_at')->whereDate('due_date', '<', $today)->count();
            $newPatrons   = Patron::whereDate('created_at', $today)->count();
            $totalTitles  = BibliographicRecord::where('record_status', 'active')->count();
            $totalPatrons = Patron::where('status', 'active')->count();
            $todayStat    = DailyStat::where('date', $today)->first();
            $digitalViews = $todayStat?->digital_views ?? 0;

            return compact('loansToday', 'returnsToday', 'overdue', 'newPatrons', 'totalTitles', 'totalPatrons', 'digitalViews');
        } catch (\Throwable) {
            return ['loansToday'=>0,'returnsToday'=>0,'overdue'=>0,'newPatrons'=>0,'totalTitles'=>0,'totalPatrons'=>0,'digitalViews'=>0];
        }
    }

    private function recentLoans(): array
    {
        try {
            return Loan::with(['patron:id,first_name,last_name,patron_number', 'item.bibliographicRecord:id,title'])
                ->whereNull('returned_at')
                ->latest('checked_out_at')
                ->limit(8)
                ->get()
                ->toArray();
        } catch (\Throwable) {
            return [];
        }
    }

    private function overdueLoans(): array
    {
        try {
            return Loan::with(['patron:id,first_name,last_name,patron_number', 'item.bibliographicRecord:id,title'])
                ->whereNull('returned_at')
                ->whereDate('due_date', '<', today())
                ->orderBy('due_date')
                ->limit(8)
                ->get()
                ->toArray();
        } catch (\Throwable) {
            return [];
        }
    }
}
