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
use App\Models\Tenant\Collection as LibCollection;
use App\Models\Tenant\DigitalResource;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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

    /**
     * Koha-style catalog/holdings report: weeding, holdings by collection/location/value,
     * accessions by month, and data-quality cleanup lists. PostgreSQL-safe SQL.
     */
    public function catalog(Request $request)
    {
        $collectionId  = $request->get('collection_id');
        $acquiredBefore = $request->get('acquired_before');

        try {
            // ── Weeding / never-borrowed (top candidates; full list via CSV) ──
            $weedingQuery = $this->weedingQuery($collectionId, $acquiredBefore);
            $neverCount = (clone $weedingQuery)->count();
            $weeding = (clone $weedingQuery)->limit(100)->get();

            // ── Holdings by collection & location (count + value) ──
            $byCollection = PhysicalItem::leftJoin('collections', 'collections.id', '=', 'physical_items.collection_id')
                ->whereNull('physical_items.deleted_at')
                ->selectRaw("COALESCE(collections.name, '(none)') as name, COUNT(*) as items, COALESCE(SUM(physical_items.price),0) as value")
                ->groupBy('collections.name')->orderByDesc('items')->get();

            $byLocation = PhysicalItem::leftJoin('locations', 'locations.id', '=', 'physical_items.location_id')
                ->whereNull('physical_items.deleted_at')
                ->selectRaw("COALESCE(locations.name, '(none)') as name, COUNT(*) as items")
                ->groupBy('locations.name')->orderByDesc('items')->get();

            // ── Items added (accession) by month — last 24 ──
            $accession = PhysicalItem::whereNull('deleted_at')->whereNotNull('acquired_date')
                ->selectRaw("to_char(acquired_date, 'YYYY-MM') as ym, COUNT(*) as items, COALESCE(SUM(price),0) as value")
                ->groupByRaw("to_char(acquired_date, 'YYYY-MM')")
                ->orderByRaw("to_char(acquired_date, 'YYYY-MM') DESC")
                ->limit(24)->get()->reverse()->values();

            // ── Data-quality / cleanup ──
            $dataQuality = [
                'no_items'       => BibliographicRecord::where('record_status', 'active')->whereNull('deleted_at')
                                        ->whereDoesntHave('physicalItems')->whereDoesntHave('digitalResources')->count(),
                'no_barcode'     => PhysicalItem::whereNull('deleted_at')
                                        ->where(fn ($q) => $q->whereNull('barcode')->orWhere('barcode', ''))->count(),
                'no_classification' => BibliographicRecord::where('record_status', 'active')->whereNull('deleted_at')
                                        ->where(fn ($q) => $q->whereNull('ddc_class')->orWhere('ddc_class', ''))
                                        ->where(fn ($q) => $q->whereNull('lcc_class')->orWhere('lcc_class', ''))->count(),
                'no_subjects'    => BibliographicRecord::where('record_status', 'active')->whereNull('deleted_at')
                                        ->where(fn ($q) => $q->whereNull('subjects')->orWhere('subjects', '[]'))->count(),
            ];

            $summary = [
                'total_items'    => PhysicalItem::whereNull('deleted_at')->count(),
                'holdings_value' => round((float) PhysicalItem::whereNull('deleted_at')->sum('price'), 2),
                'never_borrowed' => $neverCount,
                'lost_withdrawn' => PhysicalItem::whereNull('deleted_at')->whereIn('item_status', ['lost', 'withdrawn'])->count(),
            ];

            $collections = LibCollection::orderBy('name')->get(['id', 'name']);
        } catch (\Throwable $e) {
            $weeding = collect(); $neverCount = 0; $byCollection = collect(); $byLocation = collect();
            $accession = collect();
            $dataQuality = ['no_items' => 0, 'no_barcode' => 0, 'no_classification' => 0, 'no_subjects' => 0];
            $summary = ['total_items' => 0, 'holdings_value' => 0, 'never_borrowed' => 0, 'lost_withdrawn' => 0];
            $collections = collect();
        }

        return Inertia::render('Admin/Reports/Catalog', compact(
            'weeding', 'neverCount', 'byCollection', 'byLocation', 'accession',
            'dataQuality', 'summary', 'collections', 'collectionId', 'acquiredBefore'
        ));
    }

    /** Shared builder for never-borrowed items (used by report + CSV export). */
    private function weedingQuery(?string $collectionId, ?string $acquiredBefore)
    {
        $q = PhysicalItem::leftJoin('loans', 'loans.item_id', '=', 'physical_items.id')
            ->join('bibliographic_records', 'bibliographic_records.id', '=', 'physical_items.biblio_id')
            ->leftJoin('collections', 'collections.id', '=', 'physical_items.collection_id')
            ->whereNull('physical_items.deleted_at')
            ->selectRaw("physical_items.id, physical_items.barcode, physical_items.acquired_date,
                bibliographic_records.title, COALESCE(collections.name,'(none)') as collection,
                COUNT(loans.id) as checkouts, MAX(loans.checked_out_at) as last_out")
            ->groupBy('physical_items.id', 'physical_items.barcode', 'physical_items.acquired_date', 'bibliographic_records.title', 'collections.name')
            ->havingRaw('COUNT(loans.id) = 0')
            ->orderBy('physical_items.acquired_date');

        if ($collectionId) {
            $q->where('physical_items.collection_id', $collectionId);
        }
        if ($acquiredBefore) {
            $q->whereDate('physical_items.acquired_date', '<=', $acquiredBefore);
        }

        return $q;
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

            // ── Composition: by format + access type, storage ──
            $byFormat = DigitalResource::whereNull('deleted_at')
                ->selectRaw("COALESCE(NULLIF(format,''),'unknown') as format, COUNT(*) as count, COALESCE(SUM(file_size_bytes),0) as bytes")
                ->groupBy('format')->orderByDesc('count')->get();

            $byAccessType = DigitalResource::whereNull('deleted_at')
                ->selectRaw("COALESCE(NULLIF(access_type,''),'unknown') as access_type, COUNT(*) as count")
                ->groupBy('access_type')->orderByDesc('count')->get();

            $storageBytes = (int) DigitalResource::whereNull('deleted_at')->sum('file_size_bytes');

            // ── Digital coverage of the catalog ──
            $activeTitles = BibliographicRecord::where('record_status', 'active')->whereNull('deleted_at')->count();
            $withDigital  = BibliographicRecord::where('record_status', 'active')->whereNull('deleted_at')->whereHas('digitalResources')->count();
            $digitalOnly  = BibliographicRecord::where('record_status', 'active')->whereNull('deleted_at')
                                ->whereHas('digitalResources')->whereDoesntHave('physicalItems')->count();
            $printOnly    = BibliographicRecord::where('record_status', 'active')->whereNull('deleted_at')
                                ->whereHas('physicalItems')->whereDoesntHave('digitalResources')->count();
            $coverage = [
                'active_titles' => $activeTitles,
                'with_digital'  => $withDigital,
                'digital_only'  => $digitalOnly,
                'print_only'    => $printOnly,
                'both'          => max(0, $withDigital - $digitalOnly),
            ];

            // ── Embargoed resources ──
            $embargoed = DigitalResource::with('bibliographicRecord:id,title')
                ->whereNotNull('embargo_until')->whereDate('embargo_until', '>', today())
                ->orderBy('embargo_until')->limit(50)->get()
                ->map(fn ($r) => [
                    'title' => $r->bibliographicRecord?->title,
                    'format' => $r->format,
                    'access_type' => $r->access_type,
                    'embargo_until' => optional($r->embargo_until)->toDateString(),
                ]);

            // ── Enhanced usage: lifetime top viewed / downloaded ──
            $topViewed = DigitalResource::with('bibliographicRecord:id,title')->where('view_count', '>', 0)
                ->orderByDesc('view_count')->limit(10)->get()
                ->map(fn ($r) => ['title' => $r->bibliographicRecord?->title, 'format' => $r->format, 'count' => $r->view_count]);
            $topDownloaded = DigitalResource::with('bibliographicRecord:id,title')->where('download_count', '>', 0)
                ->orderByDesc('download_count')->limit(10)->get()
                ->map(fn ($r) => ['title' => $r->bibliographicRecord?->title, 'format' => $r->format, 'count' => $r->download_count]);
        } catch (\Throwable) {
            $dailyActivity = collect(); $topResources = collect();
            $summary = ['total_views' => 0, 'total_downloads' => 0, 'total_streams' => 0, 'unique_users' => 0];
            $byFormat = collect(); $byAccessType = collect(); $storageBytes = 0;
            $coverage = ['active_titles' => 0, 'with_digital' => 0, 'digital_only' => 0, 'print_only' => 0, 'both' => 0];
            $embargoed = collect(); $topViewed = collect(); $topDownloaded = collect();
        }

        return Inertia::render('Admin/Reports/Digital', compact(
            'dailyActivity', 'topResources', 'summary', 'from', 'to',
            'byFormat', 'byAccessType', 'storageBytes', 'coverage', 'embargoed', 'topViewed', 'topDownloaded'
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

    // ─── CSV exports ─────────────────────────────────────────────────────────
    public function exportCatalog(Request $request)
    {
        $section = $request->get('section', 'weeding');

        switch ($section) {
            case 'holdings':
                $header = ['Collection', 'Items', 'Value (USD)'];
                $rows = PhysicalItem::leftJoin('collections', 'collections.id', '=', 'physical_items.collection_id')
                    ->whereNull('physical_items.deleted_at')
                    ->selectRaw("COALESCE(collections.name,'(none)') as name, COUNT(*) as items, COALESCE(SUM(physical_items.price),0) as value")
                    ->groupBy('collections.name')->orderByDesc('items')->get()
                    ->map(fn ($r) => [$r->name, $r->items, number_format((float) $r->value, 2, '.', '')]);
                break;

            case 'accession':
                $header = ['Month', 'Items added', 'Value (USD)'];
                $rows = PhysicalItem::whereNull('deleted_at')->whereNotNull('acquired_date')
                    ->selectRaw("to_char(acquired_date,'YYYY-MM') as ym, COUNT(*) as items, COALESCE(SUM(price),0) as value")
                    ->groupByRaw("to_char(acquired_date,'YYYY-MM')")->orderByRaw("to_char(acquired_date,'YYYY-MM')")->get()
                    ->map(fn ($r) => [$r->ym, $r->items, number_format((float) $r->value, 2, '.', '')]);
                break;

            case 'no_barcode':
                $header = ['Accession No.', 'Title', 'Collection', 'Status'];
                $rows = PhysicalItem::leftJoin('bibliographic_records', 'bibliographic_records.id', '=', 'physical_items.biblio_id')
                    ->leftJoin('collections', 'collections.id', '=', 'physical_items.collection_id')
                    ->whereNull('physical_items.deleted_at')
                    ->where(fn ($q) => $q->whereNull('physical_items.barcode')->orWhere('physical_items.barcode', ''))
                    ->selectRaw("physical_items.accession_number, bibliographic_records.title, COALESCE(collections.name,'(none)') as collection, physical_items.item_status")
                    ->orderBy('bibliographic_records.title')->get()
                    ->map(fn ($r) => [$r->accession_number, $r->title, $r->collection, $r->item_status]);
                break;

            case 'no_items':
                $header = ['Title', 'ISBN', 'Material type', 'Cataloged'];
                $rows = BibliographicRecord::with('materialType:id,name')
                    ->where('record_status', 'active')->whereNull('deleted_at')
                    ->whereDoesntHave('physicalItems')->whereDoesntHave('digitalResources')
                    ->orderBy('title')->get()
                    ->map(fn ($b) => [$b->title, $b->isbn, $b->materialType?->name, optional($b->cataloged_at)->toDateString()]);
                break;

            default: // weeding
                $header = ['Barcode', 'Title', 'Collection', 'Acquired', 'Checkouts'];
                $rows = $this->weedingQuery($request->get('collection_id'), $request->get('acquired_before'))->get()
                    ->map(fn ($r) => [$r->barcode, $r->title, $r->collection, $r->acquired_date, $r->checkouts]);
        }

        return $this->streamCsv("catalog-{$section}.csv", $header, $rows);
    }

    public function exportDigital(Request $request)
    {
        $section = $request->get('section', 'formats');

        switch ($section) {
            case 'embargo':
                $header = ['Title', 'Format', 'Access type', 'Embargo until'];
                $rows = DigitalResource::with('bibliographicRecord:id,title')
                    ->whereNotNull('embargo_until')->whereDate('embargo_until', '>', today())
                    ->orderBy('embargo_until')->get()
                    ->map(fn ($r) => [$r->bibliographicRecord?->title, $r->format, $r->access_type, optional($r->embargo_until)->toDateString()]);
                break;

            case 'top':
                $header = ['Title', 'Format', 'Views', 'Downloads'];
                $rows = DigitalResource::with('bibliographicRecord:id,title')
                    ->orderByRaw('view_count + download_count DESC')->limit(200)->get()
                    ->map(fn ($r) => [$r->bibliographicRecord?->title, $r->format, $r->view_count, $r->download_count]);
                break;

            default: // formats
                $header = ['Format', 'Resources', 'Storage (MB)'];
                $rows = DigitalResource::whereNull('deleted_at')
                    ->selectRaw("COALESCE(NULLIF(format,''),'unknown') as format, COUNT(*) as count, COALESCE(SUM(file_size_bytes),0) as bytes")
                    ->groupBy('format')->orderByDesc('count')->get()
                    ->map(fn ($r) => [$r->format, $r->count, number_format($r->bytes / 1048576, 2, '.', '')]);
        }

        return $this->streamCsv("digital-{$section}.csv", $header, $rows);
    }

    private function streamCsv(string $filename, array $header, $rows)
    {
        return response()->streamDownload(function () use ($header, $rows) {
            $out = fopen('php://output', 'w');
            fputcsv($out, $header);
            foreach ($rows as $row) {
                fputcsv($out, $row);
            }
            fclose($out);
        }, $filename, ['Content-Type' => 'text/csv']);
    }
}
