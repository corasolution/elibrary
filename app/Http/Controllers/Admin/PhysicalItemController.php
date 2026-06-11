<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Tenant\BibliographicRecord;
use App\Models\Tenant\Collection;
use App\Models\Tenant\Location;
use App\Models\Tenant\PhysicalItem;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PhysicalItemController extends Controller
{
    public function index(Request $request)
    {
        $filters = $request->only(['q', 'item_status', 'collection_id', 'biblio_id']);

        $q = PhysicalItem::query()
            ->with(['bibliographicRecord', 'collection', 'location'])
            ->orderBy('created_at', 'desc');

        if (! empty($filters['q'])) {
            $q->where(function ($query) use ($filters) {
                $query->where('barcode', 'like', '%' . $filters['q'] . '%')
                      ->orWhere('call_number', 'like', '%' . $filters['q'] . '%')
                      ->orWhere('accession_number', 'like', '%' . $filters['q'] . '%');
            });
        }
        if (! empty($filters['item_status'])) {
            $q->where('item_status', $filters['item_status']);
        }
        if (! empty($filters['collection_id'])) {
            $q->where('collection_id', $filters['collection_id']);
        }
        if (! empty($filters['biblio_id'])) {
            $q->where('biblio_id', $filters['biblio_id']);
        }

        $items = $q->paginate(25)->withQueryString();

        return Inertia::render('Admin/Items/Index', [
            'items'       => $items,
            'filters'     => $filters,
            'collections' => rescue(fn () => Collection::orderBy('name')->get(['id', 'name']), []),
        ]);
    }

    public function create(Request $request)
    {
        $biblio = null;
        if ($request->has('biblio_id')) {
            $biblio = rescue(fn () => BibliographicRecord::find($request->biblio_id), null);
        }

        return Inertia::render('Admin/Items/Form', array_merge(
            ['item' => null, 'biblio' => $biblio],
            $this->sharedFormData()
        ));
    }

    public function store(Request $request)
    {
        $request->validate([
            'biblio_id' => 'required|string',
            'barcode'   => 'nullable|string|max:50|unique:physical_items,barcode',
        ]);

        try {
            $data = collect($request->all())->only([
                'biblio_id', 'barcode', 'accession_number', 'call_number',
                'collection_id', 'location_id', 'shelf',
                'condition', 'price', 'currency', 'acquired_date',
                'supplier', 'purchase_order', 'notes',
            ])->toArray();

            // Auto-assign a barcode value when blank and auto-barcode is enabled.
            if (empty($data['barcode'])) {
                $seq = app(\App\Services\BarcodeSequenceService::class);
                if ($seq->enabled()) {
                    $data['barcode'] = $seq->next();
                }
            }

            $item = PhysicalItem::create(array_merge($data, ['item_status' => 'available']));
        } catch (\Throwable $e) {
            return back()->withErrors(['general' => $e->getMessage()]);
        }

        if ($request->filled('biblio_id')) {
            // "Save & add another copy" → blank form for the same title so each
            // copy is entered individually with its own unique barcode (Koha-style).
            if ($request->boolean('add_another')) {
                return redirect()->route('admin.items.create', ['biblio_id' => $request->biblio_id])
                    ->with('success', 'Copy added. Add the next one.');
            }

            return redirect()->route('admin.catalog.show', $request->biblio_id)
                ->with('success', 'Item added successfully.');
        }

        return redirect()->route('admin.items.index')
            ->with('success', 'Item created.');
    }

    public function edit(string $id)
    {
        try {
            $item = PhysicalItem::with(['bibliographicRecord', 'collection', 'location'])
                ->findOrFail($id);
        } catch (\Throwable) {
            abort(404);
        }

        return Inertia::render('Admin/Items/Form', array_merge(
            ['item' => $item, 'biblio' => $item->bibliographicRecord],
            $this->sharedFormData()
        ));
    }

    public function update(Request $request, string $id)
    {
        $request->validate([
            'barcode' => 'nullable|string|max:50|unique:physical_items,barcode,' . $id,
        ]);

        try {
            $item = PhysicalItem::findOrFail($id);
            $item->update(collect($request->all())->only([
                'barcode', 'accession_number', 'call_number',
                'collection_id', 'location_id', 'shelf',
                'item_status', 'condition', 'price', 'currency', 'acquired_date',
                'supplier', 'purchase_order', 'notes',
            ])->toArray());
        } catch (\Throwable $e) {
            return back()->withErrors(['general' => $e->getMessage()]);
        }

        if ($item->biblio_id) {
            return redirect()->route('admin.catalog.show', $item->biblio_id)
                ->with('success', 'Item updated.');
        }

        return redirect()->route('admin.items.index')
            ->with('success', 'Item updated.');
    }

    public function destroy(string $id)
    {
        try {
            $item = PhysicalItem::findOrFail($id);
            $bibliId = $item->biblio_id;
            $item->delete();
        } catch (\Throwable $e) {
            return back()->withErrors(['general' => $e->getMessage()]);
        }

        return back()->with('success', 'Item removed.');
    }

    private function sharedFormData(): array
    {
        return [
            'collections' => rescue(fn () => Collection::orderBy('name')->get(['id', 'name']), []),
            'locations'   => rescue(fn () => Location::orderBy('name')->get(['id', 'name']), []),
        ];
    }
}
