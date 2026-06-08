<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Tenant\Patron;
use App\Models\Tenant\PatronCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;

class PatronController extends Controller
{
    public function index(Request $request)
    {
        $q      = $request->input('q', '');
        $status = $request->input('status', '');

        try {
            $query = Patron::with('category')->orderBy('first_name');

            if ($q) {
                $like = config('database.default') === 'pgsql' ? 'ilike' : 'like';
                $query->where(function ($qb) use ($q, $like) {
                    $qb->where('first_name', $like, "%{$q}%")
                       ->orWhere('last_name', $like, "%{$q}%")
                       ->orWhere('email', $like, "%{$q}%")
                       ->orWhere('patron_number', $like, "%{$q}%");
                });
            }

            if ($status) {
                $query->where('status', $status);
            }

            $patrons = $query->paginate(25)->withQueryString();
        } catch (\Throwable) {
            $patrons = new \Illuminate\Pagination\LengthAwarePaginator([], 0, 25);
        }

        return Inertia::render('Admin/Patrons/Index', [
            'patrons'    => $patrons,
            'filters'    => compact('q', 'status'),
            'categories' => rescue(fn () => PatronCategory::orderBy('name')->get(['id', 'name']), []),
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Patrons/Form', [
            'patron'     => null,
            'categories' => rescue(fn () => PatronCategory::orderBy('name')->get(['id', 'name']), []),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'first_name'         => 'required|string|max:100',
            'last_name'          => 'nullable|string|max:100',
            'email'              => 'nullable|email|unique:patrons,email',
            'phone'              => 'nullable|string|max:30',
            'patron_category_id' => 'nullable|integer',
            'status'             => 'nullable|in:active,expired,suspended,blocked',
            'membership_expiry'  => 'nullable|date',
        ]);

        try {
            $validated['patron_number'] = $this->generatePatronNumber();
            $validated['status']        = $validated['status'] ?? 'active';

            if (! empty($validated['email'])) {
                $validated['password'] = Hash::make(Str::random(12));
            }

            Patron::create($validated);
        } catch (\Throwable $e) {
            return back()->withErrors(['general' => $e->getMessage()]);
        }

        return redirect()->route('admin.patrons.index')->with('success', 'Patron created.');
    }

    public function show(string $id)
    {
        try {
            $patron = Patron::with([
                    'category',
                    'activeLoans.item.bibliographicRecord',
                    'loans' => fn ($q) => $q->latest()->limit(10),
                    'loans.item',
                ])
                ->withCount(['loans', 'activeLoans'])
                ->findOrFail($id);
        } catch (\Throwable) {
            abort(404);
        }

        return Inertia::render('Admin/Patrons/Show', compact('patron'));
    }

    public function edit(string $id)
    {
        try {
            $patron = Patron::findOrFail($id);
        } catch (\Throwable) {
            abort(404);
        }

        return Inertia::render('Admin/Patrons/Form', [
            'patron'     => $patron,
            'categories' => rescue(fn () => PatronCategory::orderBy('name')->get(['id', 'name']), []),
        ]);
    }

    public function update(Request $request, string $id)
    {
        $validated = $request->validate([
            'first_name'         => 'required|string|max:100',
            'last_name'          => 'nullable|string|max:100',
            'email'              => "nullable|email|unique:patrons,email,{$id}",
            'phone'              => 'nullable|string|max:30',
            'patron_category_id' => 'nullable|integer',
            'status'             => 'nullable|in:active,expired,suspended,blocked',
            'membership_expiry'  => 'nullable|date',
        ]);

        try {
            Patron::findOrFail($id)->update($validated);
        } catch (\Throwable $e) {
            return back()->withErrors(['general' => $e->getMessage()]);
        }

        return redirect()->route('admin.patrons.index')->with('success', 'Patron updated.');
    }

    public function destroy(string $id)
    {
        try {
            Patron::findOrFail($id)->delete();
        } catch (\Throwable $e) {
            return back()->withErrors(['general' => $e->getMessage()]);
        }

        return redirect()->route('admin.patrons.index')->with('success', 'Patron deleted.');
    }

    private function generatePatronNumber(): string
    {
        $last = Patron::withTrashed()->orderByDesc('created_at')->value('patron_number');
        $num  = $last ? ((int) preg_replace('/\D/', '', $last)) + 1 : 1;
        return 'P' . str_pad($num, 5, '0', STR_PAD_LEFT);
    }
}
