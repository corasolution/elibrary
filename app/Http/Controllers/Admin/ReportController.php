<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Tenant\BibliographicRecord;
use App\Models\Tenant\DigitalAccessLog;
use App\Models\Tenant\Loan;
use App\Models\Tenant\MaterialType;
use App\Models\Tenant\Patron;
use App\Models\Tenant\PhysicalItem;
use App\Models\Tenant\AcquisitionOrder;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReportController extends Controller
{
    public function circulation(Request $request)
    {
        $from = $request->get('from', now()->startOfMonth()->toDateString());
        $to   = $request->get('to',   now()->toDateString());

        try {
            $dailyLoans = Loan::selectRaw("DATE(checked_out_at) as date, COUNT(*) as loans")
                ->whereBetween('checked_out_at', [$from, $to . ' 23:59:59'])
                ->groupByRaw("DATE(checked_out_at)")
                ->orderBy('date')
                ->get();

            $dailyReturns = Loan::selectRaw("DATE(returned_at) as date, COUNT(*) as returns")
                ->whereNotNull('returned_at')
                ->whereBetween('returned_at', [$from, $to . ' 23:59:59'])
                ->groupByRaw("DATE(returned_at)")
                ->orderBy('date')
                ->get();

            $topBorrowed = Loan::join('physical_items', 'loans.item_id', '=', 'physical_items.id')
                ->join('bibliographic_records', 'physical_items.biblio_id', '=', 'bibliographic_records.id')
                ->selectRaw("bibliographic_records.id, bibliographic_records.title, COUNT(loans.id) as checkout_count")
                ->whereBetween('loans.checked_out_at', [$from, $to . ' 23:59:59'])
                ->groupBy('bibliographic_records.id', 'bibliographic_records.title')
                ->orderByDesc('checkout_count')
                ->limit(10)
                ->get();

            $topPatrons = Loan::join('patrons', 'loans.patron_id', '=', 'patrons.id')
                ->selectRaw("patrons.id, patrons.first_name, patrons.last_name, patrons.patron_number, COUNT(loans.id) as loan_count")
                ->whereBetween('loans.checked_out_at', [$from, $to . ' 23:59:59'])
                ->groupBy('patrons.id', 'patrons.first_name', 'patrons.last_name', 'patrons.patron_number')
                ->orderByDesc('loan_count')
                ->limit(10)
                ->get();

            $summary = [
                'total_loans'   => Loan::whereBetween('checked_out_at', [$from, $to . ' 23:59:59'])->count(),
                'total_returns' => Loan::whereNotNull('returned_at')->whereBetween('returned_at', [$from, $to . ' 23:59:59'])->count(),
                'total_fines'   => Loan::whereBetween('checked_out_at', [$from, $to . ' 23:59:59'])->sum('fine_amount'),
                'unique_patrons' => Loan::whereBetween('checked_out_at', [$from, $to . ' 23:59:59'])->distinct('patron_id')->count('patron_id'),
            ];
        } catch (\Throwable) {
            $dailyLoans = collect(); $dailyReturns = collect();
            $topBorrowed = collect(); $topPatrons = collect();
            $summary = ['total_loans' => 0, 'total_returns' => 0, 'total_fines' => 0, 'unique_patrons' => 0];
        }

        return Inertia::render('Admin/Reports/Circulation', compact(
            'dailyLoans', 'dailyReturns', 'topBorrowed', 'topPatrons', 'summary', 'from', 'to'
        ));
    }

    public function collection(Request $request)
    {
        try {
            $byMaterialType = BibliographicRecord::join('material_types', 'bibliographic_records.material_type_id', '=', 'material_types.id')
                ->selectRaw("material_types.name, COUNT(bibliographic_records.id) as count")
                ->where('bibliographic_records.record_status', 'active')
                ->whereNull('bibliographic_records.deleted_at')
                ->groupBy('material_types.name')
                ->orderByDesc('count')
                ->get();

            $byLanguage = BibliographicRecord::selectRaw("language, COUNT(*) as count")
                ->where('record_status', 'active')
                ->whereNull('deleted_at')
                ->groupBy('language')
                ->orderByDesc('count')
                ->get();

            $byYear = BibliographicRecord::selectRaw("publication_year, COUNT(*) as count")
                ->where('record_status', 'active')
                ->whereNull('deleted_at')
                ->whereNotNull('publication_year')
                ->groupBy('publication_year')
                ->orderByDesc('publication_year')
                ->limit(20)
                ->get();

            $itemStatus = PhysicalItem::selectRaw("item_status, COUNT(*) as count")
                ->whereNull('deleted_at')
                ->groupBy('item_status')
                ->get();

            $summary = [
                'total_titles'   => BibliographicRecord::where('record_status', 'active')->whereNull('deleted_at')->count(),
                'total_items'    => PhysicalItem::whereNull('deleted_at')->count(),
                'available_items'=> PhysicalItem::where('item_status', 'available')->whereNull('deleted_at')->count(),
                'digital_resources' => \App\Models\Tenant\DigitalResource::whereNull('deleted_at')->count(),
            ];
        } catch (\Throwable) {
            $byMaterialType = collect(); $byLanguage = collect();
            $byYear = collect(); $itemStatus = collect();
            $summary = ['total_titles' => 0, 'total_items' => 0, 'available_items' => 0, 'digital_resources' => 0];
        }

        return Inertia::render('Admin/Reports/Collection', compact(
            'byMaterialType', 'byLanguage', 'byYear', 'itemStatus', 'summary'
        ));
    }

    public function digital(Request $request)
    {
        $from = $request->get('from', now()->startOfMonth()->toDateString());
        $to   = $request->get('to',   now()->toDateString());

        try {
            $dailyActivity = DigitalAccessLog::selectRaw("DATE(accessed_at) as date, action, COUNT(*) as count")
                ->whereBetween('accessed_at', [$from, $to . ' 23:59:59'])
                ->groupByRaw("DATE(accessed_at), action")
                ->orderBy('date')
                ->get();

            $topResources = DigitalAccessLog::join('digital_resources', 'digital_access_logs.resource_id', '=', 'digital_resources.id')
                ->join('bibliographic_records', 'digital_resources.biblio_id', '=', 'bibliographic_records.id')
                ->selectRaw("bibliographic_records.title, digital_resources.format, SUM(CASE WHEN digital_access_logs.action = 'view' THEN 1 ELSE 0 END) as views, SUM(CASE WHEN digital_access_logs.action = 'download' THEN 1 ELSE 0 END) as downloads")
                ->whereBetween('digital_access_logs.accessed_at', [$from, $to . ' 23:59:59'])
                ->groupBy('bibliographic_records.title', 'digital_resources.format')
                ->orderByRaw("views + downloads DESC")
                ->limit(10)
                ->get();

            $summary = [
                'total_views'     => DigitalAccessLog::where('action', 'view')->whereBetween('accessed_at', [$from, $to . ' 23:59:59'])->count(),
                'total_downloads' => DigitalAccessLog::where('action', 'download')->whereBetween('accessed_at', [$from, $to . ' 23:59:59'])->count(),
                'total_streams'   => DigitalAccessLog::where('action', 'stream')->whereBetween('accessed_at', [$from, $to . ' 23:59:59'])->count(),
                'unique_users'    => DigitalAccessLog::whereBetween('accessed_at', [$from, $to . ' 23:59:59'])->distinct('patron_id')->count('patron_id'),
            ];
        } catch (\Throwable) {
            $dailyActivity = collect(); $topResources = collect();
            $summary = ['total_views' => 0, 'total_downloads' => 0, 'total_streams' => 0, 'unique_users' => 0];
        }

        return Inertia::render('Admin/Reports/Digital', compact(
            'dailyActivity', 'topResources', 'summary', 'from', 'to'
        ));
    }

    public function overdue(Request $request)
    {
        try {
            $loans = Loan::with(['patron', 'item.bibliographicRecord', 'item.collection', 'item.location'])
                ->whereNull('returned_at')
                ->whereDate('due_date', '<', today())
                ->orderBy('due_date')
                ->paginate(50);

            $byDays = Loan::selectRaw("
                    CASE
                        WHEN DATEDIFF(CURRENT_DATE, due_date) BETWEEN 1 AND 7   THEN '1-7 days'
                        WHEN DATEDIFF(CURRENT_DATE, due_date) BETWEEN 8 AND 30  THEN '8-30 days'
                        WHEN DATEDIFF(CURRENT_DATE, due_date) BETWEEN 31 AND 90 THEN '31-90 days'
                        ELSE 'Over 90 days'
                    END as range,
                    COUNT(*) as count
                ")
                ->whereNull('returned_at')
                ->whereDate('due_date', '<', today())
                ->groupByRaw("range")
                ->get();

            $totalFines = Loan::whereNull('returned_at')
                ->whereDate('due_date', '<', today())
                ->sum('fine_amount');
        } catch (\Throwable) {
            $loans = new \Illuminate\Pagination\LengthAwarePaginator([], 0, 50);
            $byDays = collect();
            $totalFines = 0;
        }

        return Inertia::render('Admin/Reports/Overdue', compact('loans', 'byDays', 'totalFines'));
    }

    public function acquisitions(Request $request)
    {
        $from = $request->get('from', now()->startOfYear()->toDateString());
        $to   = $request->get('to',   now()->toDateString());

        try {
            $orders = AcquisitionOrder::with('items.bibliographicRecord')
                ->whereBetween('order_date', [$from, $to])
                ->orderByDesc('order_date')
                ->paginate(20);

            $byStatus = AcquisitionOrder::selectRaw("status, COUNT(*) as count, SUM(total_amount) as total")
                ->whereBetween('order_date', [$from, $to])
                ->groupBy('status')
                ->get();

            $summary = [
                'total_orders'  => AcquisitionOrder::whereBetween('order_date', [$from, $to])->count(),
                'total_spent'   => AcquisitionOrder::whereBetween('order_date', [$from, $to])->sum('total_amount'),
                'total_items'   => \App\Models\Tenant\AcquisitionItem::whereHas('order', fn($q) => $q->whereBetween('order_date', [$from, $to]))->sum('quantity'),
                'pending_orders'=> AcquisitionOrder::where('status', 'pending')->count(),
            ];
        } catch (\Throwable) {
            $orders = new \Illuminate\Pagination\LengthAwarePaginator([], 0, 20);
            $byStatus = collect();
            $summary = ['total_orders' => 0, 'total_spent' => 0, 'total_items' => 0, 'pending_orders' => 0];
        }

        return Inertia::render('Admin/Reports/Acquisitions', compact('orders', 'byStatus', 'summary', 'from', 'to'));
    }
}
