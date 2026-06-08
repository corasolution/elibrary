<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Tenant\AcquisitionItem;
use App\Models\Tenant\AcquisitionOrder;
use App\Models\Tenant\BibliographicRecord;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AcquisitionController extends Controller
{
    public function index(Request $request)
    {
        $filters = $request->only(['q', 'status']);

        try {
            $orders = AcquisitionOrder::withCount('items')
                ->when($filters['q'] ?? null, function ($q, $search) {
                    $q->where('order_number', 'like', "%{$search}%")
                      ->orWhere('supplier', 'like', "%{$search}%");
                })
                ->when($filters['status'] ?? null, fn ($q, $s) => $q->where('status', $s))
                ->latest('order_date')
                ->paginate(25);
        } catch (\Throwable) {
            $orders = new \Illuminate\Pagination\LengthAwarePaginator([], 0, 25);
        }

        return Inertia::render('Admin/Acquisitions/Index', compact('orders', 'filters'));
    }

    public function create()
    {
        return Inertia::render('Admin/Acquisitions/Form', [
            'order'   => null,
            'biblios' => $this->biblioOptions(),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'order_number' => 'required|string|max:50|unique:acquisition_orders,order_number',
            'order_date'   => 'required|date',
            'status'       => 'required|in:pending,ordered,partial,received,cancelled',
            'items'        => 'nullable|array',
        ]);

        try {
            DB::transaction(function () use ($request) {
                $order = AcquisitionOrder::create($request->only([
                    'order_number', 'supplier', 'order_date', 'expected_date',
                    'status', 'total_amount', 'currency', 'notes',
                ]));

                foreach ($request->input('items', []) as $item) {
                    if (empty($item['biblio_id']) && empty($item['unit_price'])) continue;
                    AcquisitionItem::create([
                        'order_id'   => $order->id,
                        'biblio_id'  => $item['biblio_id'] ?: null,
                        'quantity'   => max(1, (int)($item['quantity'] ?? 1)),
                        'unit_price' => $item['unit_price'] ?: null,
                    ]);
                }

                // Auto-calculate total if not provided
                if (! $request->filled('total_amount')) {
                    $total = $order->items()->selectRaw('SUM(quantity * unit_price) as total')->value('total');
                    $order->update(['total_amount' => $total ?? 0]);
                }
            });
        } catch (\Throwable $e) {
            return back()->withErrors(['general' => $e->getMessage()]);
        }

        return redirect()->route('admin.acquisitions.index')->with('success', 'Order created.');
    }

    public function edit(string $id)
    {
        try {
            $order = AcquisitionOrder::with('items.bibliographicRecord:id,title')->findOrFail($id);
        } catch (\Throwable) {
            abort(404);
        }

        return Inertia::render('Admin/Acquisitions/Form', [
            'order'   => $order,
            'biblios' => $this->biblioOptions(),
        ]);
    }

    public function update(Request $request, string $id)
    {
        $request->validate([
            'order_number' => "required|string|max:50|unique:acquisition_orders,order_number,{$id}",
            'order_date'   => 'required|date',
            'status'       => 'required|in:pending,ordered,partial,received,cancelled',
        ]);

        try {
            AcquisitionOrder::findOrFail($id)->update($request->only([
                'order_number', 'supplier', 'order_date', 'expected_date',
                'received_date', 'status', 'total_amount', 'currency', 'notes',
            ]));
        } catch (\Throwable $e) {
            return back()->withErrors(['general' => $e->getMessage()]);
        }

        return redirect()->route('admin.acquisitions.index')->with('success', 'Order updated.');
    }

    public function destroy(string $id)
    {
        try {
            AcquisitionOrder::findOrFail($id)->delete();
        } catch (\Throwable $e) {
            return back()->withErrors(['general' => $e->getMessage()]);
        }

        return redirect()->route('admin.acquisitions.index')->with('success', 'Order deleted.');
    }

    private function biblioOptions()
    {
        return rescue(fn () =>
            BibliographicRecord::where('record_status', 'active')
                ->orderBy('title')
                ->limit(500)
                ->get(['id', 'title']),
            collect()
        );
    }
}
