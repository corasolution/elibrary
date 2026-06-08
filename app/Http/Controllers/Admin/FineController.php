<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Tenant\Loan;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FineController extends Controller
{
    public function index(Request $request)
    {
        $filters = $request->only(['q', 'paid', 'waived']);

        try {
            $loans = Loan::with(['patron', 'item.bibliographicRecord'])
                ->where('fine_amount', '>', 0)
                ->when(isset($filters['paid']) && $filters['paid'] !== '', fn ($q) => $q->where('fine_paid', (bool)$filters['paid']))
                ->when($filters['q'] ?? null, function ($q, $search) {
                    $q->whereHas('patron', fn ($p) => $p->where('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhere('patron_number', 'like', "%{$search}%"));
                })
                ->orderByRaw('fine_paid ASC, fine_amount DESC')
                ->paginate(25);

            $summary = [
                'total_outstanding' => Loan::where('fine_amount', '>', 0)->where('fine_paid', false)->where('fine_waived', false)->sum('fine_amount'),
                'total_collected'   => Loan::where('fine_paid', true)->sum('fine_amount'),
                'total_waived'      => Loan::where('fine_waived', true)->sum('fine_amount'),
                'count_outstanding' => Loan::where('fine_amount', '>', 0)->where('fine_paid', false)->where('fine_waived', false)->count(),
            ];
        } catch (\Throwable) {
            $loans = new \Illuminate\Pagination\LengthAwarePaginator([], 0, 25);
            $summary = ['total_outstanding' => 0, 'total_collected' => 0, 'total_waived' => 0, 'count_outstanding' => 0];
        }

        return Inertia::render('Admin/Fines/Index', compact('loans', 'filters', 'summary'));
    }

    public function markPaid(string $id)
    {
        try {
            Loan::findOrFail($id)->update([
                'fine_paid'    => true,
                'fine_paid_at' => now(),
            ]);
        } catch (\Throwable $e) {
            return back()->with('error', $e->getMessage());
        }

        return back()->with('success', 'Fine marked as paid.');
    }

    public function waive(Request $request, string $id)
    {
        try {
            Loan::findOrFail($id)->update([
                'fine_waived'    => true,
                'fine_amount'    => 0,
            ]);
        } catch (\Throwable $e) {
            return back()->with('error', $e->getMessage());
        }

        return back()->with('success', 'Fine waived.');
    }
}
