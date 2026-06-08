<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Tenant\Loan;
use App\Services\CirculationService;
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
}
