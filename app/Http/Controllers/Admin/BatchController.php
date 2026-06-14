<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Tenant\BibliographicRecord;
use App\Models\Tenant\Collection;
use App\Models\Tenant\Location;
use App\Models\Tenant\PhysicalItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class BatchController extends Controller
{
    // ── Hub page ──────────────────────────────────────────────────────────────
    public function index()
    {
        return Inertia::render('Admin/Batch/Index');
    }

    // ── Batch Item Modification ───────────────────────────────────────────────
    public function itemModification()
    {
        return Inertia::render('Admin/Batch/ItemModification', [
            'collections' => Collection::orderBy('name')->get(['id', 'name']),
            'locations'   => Location::orderBy('name')->get(['id', 'name', 'is_branch']),
        ]);
    }

    // ── Resolve barcodes → item preview (AJAX) ────────────────────────────────
    public function resolveBarcodes(Request $request)
    {
        $barcodes = collect(preg_split('/[\n,\s]+/', $request->input('barcodes', '')))
            ->map(fn($b) => trim($b))
            ->filter()
            ->unique()
            ->values();

        if ($barcodes->isEmpty()) {
            return response()->json(['items' => [], 'not_found' => []]);
        }

        $items = PhysicalItem::with(['bibliographicRecord:id,title,isbn', 'collection:id,name', 'location:id,name'])
            ->whereIn('barcode', $barcodes)
            ->get()
            ->map(fn($item) => [
                'id'               => $item->id,
                'barcode'          => $item->barcode,
                'accession_number' => $item->accession_number,
                'call_number'      => $item->call_number,
                'title'            => $item->bibliographicRecord?->title,
                'isbn'             => $item->bibliographicRecord?->isbn,
                'collection'       => $item->collection?->name,
                'collection_id'    => $item->collection_id,
                'location'         => $item->location?->name,
                'location_id'      => $item->location_id,
                'item_status'      => $item->item_status,
                'condition'        => $item->condition,
                'shelf'            => $item->shelf,
            ]);

        $foundBarcodes = $items->pluck('barcode');
        $notFound = $barcodes->diff($foundBarcodes)->values();

        return response()->json([
            'items'     => $items,
            'not_found' => $notFound,
        ]);
    }

    // ── Apply batch item modifications ────────────────────────────────────────
    public function applyItemModification(Request $request)
    {
        $data = $request->validate([
            'item_ids'    => 'required|array|min:1',
            'item_ids.*'  => 'string',
            'fields'      => 'required|array',
        ]);

        $allowedFields = ['item_status', 'collection_id', 'location_id', 'condition', 'call_number', 'shelf', 'notes'];
        $changes = collect($data['fields'])
            ->only($allowedFields)
            ->filter(fn($v) => $v !== null && $v !== '')
            ->toArray();

        if (empty($changes)) {
            return response()->json(['error' => 'No fields to update'], 422);
        }

        $updated = PhysicalItem::whereIn('id', $data['item_ids'])->update($changes);

        return response()->json([
            'updated' => $updated,
            'message' => "Updated {$updated} item(s) successfully.",
        ]);
    }

    // ── Batch Item Deletion ───────────────────────────────────────────────────
    public function itemDeletion()
    {
        return Inertia::render('Admin/Batch/ItemDeletion');
    }

    public function applyItemDeletion(Request $request)
    {
        $data = $request->validate([
            'item_ids'   => 'required|array|min:1',
            'item_ids.*' => 'string',
            'hard_delete'=> 'boolean',
        ]);

        // Safety: never delete checked-out items
        $blocked = PhysicalItem::whereIn('id', $data['item_ids'])
            ->where('item_status', 'checked_out')
            ->count();

        if ($blocked > 0) {
            return response()->json([
                'error' => "{$blocked} item(s) are currently checked out and cannot be deleted.",
            ], 422);
        }

        $items = PhysicalItem::whereIn('id', $data['item_ids']);
        $count = $items->count();

        if ($request->boolean('hard_delete')) {
            $items->forceDelete();
        } else {
            $items->delete();
        }

        return response()->json([
            'deleted' => $count,
            'message' => "Deleted {$count} item(s) successfully.",
        ]);
    }

    // ── Batch Record Modification ─────────────────────────────────────────────
    public function recordModification()
    {
        return Inertia::render('Admin/Batch/RecordModification');
    }

    public function resolveRecords(Request $request)
    {
        $ids = collect(preg_split('/[\n,\s]+/', $request->input('identifiers', '')))
            ->map(fn($b) => trim($b))
            ->filter()
            ->unique()
            ->values();

        if ($ids->isEmpty()) {
            return response()->json(['records' => [], 'not_found' => []]);
        }

        // Match by ID or ISBN
        $records = BibliographicRecord::with('materialType:id,name')
            ->where(function ($q) use ($ids) {
                $q->whereIn('id', $ids)->orWhereIn('isbn', $ids);
            })
            ->get()
            ->map(fn($r) => [
                'id'              => $r->id,
                'title'           => $r->title,
                'isbn'            => $r->isbn,
                'language'        => $r->language,
                'publication_year'=> $r->publication_year,
                'material_type'   => $r->materialType?->name,
                'record_status'   => $r->record_status,
            ]);

        $foundIds  = $records->pluck('id');
        $foundIsbns= $records->pluck('isbn')->filter();
        $notFound  = $ids->reject(fn($id) => $foundIds->contains($id) || $foundIsbns->contains($id))->values();

        return response()->json([
            'records'   => $records,
            'not_found' => $notFound,
        ]);
    }

    public function applyRecordModification(Request $request)
    {
        $data = $request->validate([
            'record_ids'    => 'required|array|min:1',
            'record_ids.*'  => 'string',
            'fields'        => 'required|array',
        ]);

        $allowedFields = ['language', 'record_status', 'publication_year', 'publisher', 'rights'];
        $changes = collect($data['fields'])
            ->only($allowedFields)
            ->filter(fn($v) => $v !== null && $v !== '')
            ->toArray();

        if (empty($changes)) {
            return response()->json(['error' => 'No fields to update'], 422);
        }

        $updated = BibliographicRecord::whereIn('id', $data['record_ids'])->update($changes);

        return response()->json([
            'updated' => $updated,
            'message' => "Updated {$updated} record(s) successfully.",
        ]);
    }
}
