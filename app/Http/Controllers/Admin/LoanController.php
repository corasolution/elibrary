<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Tenant\Loan;
use App\Models\Tenant\PhysicalItem;
use App\Services\CirculationService;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class LoanController extends Controller
{
    public function __construct(private CirculationService $circulation) {}

    public function index(Request $request)
    {
        $filters = $request->only(['q', 'status', 'overdue']);

        try {
            $loans = Loan::with(['patron', 'item.bibliographicRecord', 'item.collection'])
                ->whereNull('returned_at')
                ->when($filters['q'] ?? null, function ($q, $search) {
                    $q->whereHas('patron', fn($p) => $p->where('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhere('patron_number', 'like', "%{$search}%"));
                })
                ->orderBy('due_date')
                ->paginate(25);
        } catch (\Throwable) {
            $loans = new \Illuminate\Pagination\LengthAwarePaginator([], 0, 25);
        }

        return Inertia::render('Admin/Circulation/Loans', compact('loans', 'filters'));
    }

    public function overdue()
    {
        try {
            $loans = Loan::with(['patron', 'item.bibliographicRecord', 'item.collection'])
                ->whereNull('returned_at')
                ->whereDate('due_date', '<', today())
                ->orderBy('due_date')
                ->paginate(25);
        } catch (\Throwable) {
            $loans = new \Illuminate\Pagination\LengthAwarePaginator([], 0, 25);
        }

        return Inertia::render('Admin/Circulation/Overdue', compact('loans'));
    }

    public function return(string $id)
    {
        try {
            $this->circulation->returnItem($id, auth()->id());
            return back()->with('success', 'Item returned successfully.');
        } catch (ValidationException $e) {
            return back()->withErrors($e->errors());
        } catch (\Throwable $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    public function renew(string $id)
    {
        try {
            $this->circulation->renewLoan($id, auth()->id());
            return back()->with('success', 'Loan renewed successfully.');
        } catch (ValidationException $e) {
            return back()->withErrors($e->errors());
        } catch (\Throwable $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    // ── Item checkout history ─────────────────────────────────────────────────
    public function itemHistory(string $id)
    {
        $item = PhysicalItem::with(['bibliographicRecord:id,title,isbn', 'collection:id,name'])->findOrFail($id);

        $loans = Loan::with(['patron:id,first_name,last_name,patron_number'])
            ->where('item_id', $id)
            ->orderByDesc('checked_out_at')
            ->paginate(30);

        $stats = [
            'total_loans'    => Loan::where('item_id', $id)->count(),
            'total_overdue'  => Loan::where('item_id', $id)->whereColumn('returned_at', '>', 'due_date')->count(),
            'total_fines'    => Loan::where('item_id', $id)->sum('fine_amount'),
            'last_seen_at'   => $item->last_seen_at,
        ];

        return Inertia::render('Admin/Items/History', compact('item', 'loans', 'stats'));
    }

    // ── Overdue notices page ──────────────────────────────────────────────────
    public function overdueNotices()
    {
        $overdueLoans = Loan::with(['patron:id,first_name,last_name,patron_number,email', 'item.bibliographicRecord:id,title'])
            ->whereNull('returned_at')
            ->whereDate('due_date', '<', today())
            ->orderBy('due_date')
            ->get();

        $withEmail    = $overdueLoans->filter(fn($l) => !empty($l->patron?->email))->count();
        $withoutEmail = $overdueLoans->count() - $withEmail;
        $uniquePatrons = $overdueLoans->pluck('patron_id')->unique()->count();

        return Inertia::render('Admin/Circulation/OverdueNotices', [
            'stats' => [
                'total_loans'    => $overdueLoans->count(),
                'unique_patrons' => $uniquePatrons,
                'with_email'     => $withEmail,
                'without_email'  => $withoutEmail,
            ],
            'loans' => $overdueLoans->take(100)->map(fn($l) => [
                'id'           => $l->id,
                'patron_name'  => trim(($l->patron?->first_name ?? '') . ' ' . ($l->patron?->last_name ?? '')),
                'patron_number'=> $l->patron?->patron_number,
                'patron_email' => $l->patron?->email,
                'title'        => $l->item?->bibliographicRecord?->title,
                'due_date'     => $l->due_date,
                'days_overdue' => max(0, today()->diffInDays($l->due_date, false) * -1),
                'fine_amount'  => $l->fine_amount,
            ]),
        ]);
    }

    // ── Send bulk overdue notices ─────────────────────────────────────────────
    public function sendOverdueNotices(Request $request)
    {
        try {
            $count = app(NotificationService::class)->dispatchOverdueNotices();
            return response()->json([
                'sent'    => $count,
                'message' => "Sent overdue notices to {$count} patron(s).",
            ]);
        } catch (\Throwable $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
