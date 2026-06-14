<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Tenant\Collection;
use App\Models\Tenant\InventorySession;
use App\Models\Tenant\InventoryScan;
use App\Models\Tenant\Location;
use App\Models\Tenant\PhysicalItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class InventoryController extends Controller
{
    // ── List all sessions ─────────────────────────────────────────────────────
    public function index()
    {
        $sessions = InventorySession::with(['collection', 'location'])
            ->orderByDesc('started_at')
            ->paginate(20);

        return Inertia::render('Admin/Inventory/Index', [
            'sessions'    => $sessions,
            'openSession' => InventorySession::where('status', 'open')->latest()->first(),
        ]);
    }

    // ── New session form ──────────────────────────────────────────────────────
    public function create()
    {
        return Inertia::render('Admin/Inventory/Create', [
            'collections' => Collection::orderBy('name')->get(['id', 'name']),
            'locations'   => Location::orderBy('name')->get(['id', 'name', 'is_branch']),
        ]);
    }

    // ── Store new session ─────────────────────────────────────────────────────
    public function store(Request $request)
    {
        $data = $request->validate([
            'name'          => 'required|string|max:200',
            'notes'         => 'nullable|string|max:1000',
            'collection_id' => 'nullable|integer|exists:collections,id',
            'location_id'   => 'nullable|integer|exists:locations,id',
        ]);

        // Count expected items in scope
        $q = PhysicalItem::query()->whereNotIn('item_status', ['withdrawn', 'lost']);
        if (!empty($data['collection_id'])) $q->where('collection_id', $data['collection_id']);
        if (!empty($data['location_id']))   $q->where('location_id',   $data['location_id']);
        $expectedCount = $q->count();

        $session = InventorySession::create(array_merge($data, [
            'status'         => 'open',
            'expected_count' => $expectedCount,
            'started_by'     => auth()->id(),
            'started_at'     => now(),
        ]));

        return redirect()->route('admin.inventory.session', $session->id)
            ->with('success', 'Inventory session started.');
    }

    // ── Live scan interface ───────────────────────────────────────────────────
    public function session(string $id)
    {
        $session = InventorySession::with(['collection', 'location'])->findOrFail($id);

        $recentScans = InventoryScan::with(['item.bibliographicRecord'])
            ->where('session_id', $id)
            ->orderByDesc('scanned_at')
            ->limit(50)
            ->get()
            ->map(fn($s) => [
                'id'             => $s->id,
                'barcode'        => $s->barcode_scanned,
                'scan_status'    => $s->scan_status,
                'scanned_at'     => $s->scanned_at,
                'title'          => $s->item?->bibliographicRecord?->title,
                'call_number'    => $s->item?->call_number,
                'item_status'    => $s->item?->item_status,
            ]);

        return Inertia::render('Admin/Inventory/Session', [
            'session'     => $session,
            'recentScans' => $recentScans,
        ]);
    }

    // ── Process a barcode scan (AJAX) ─────────────────────────────────────────
    public function scan(Request $request, string $id)
    {
        $session = InventorySession::findOrFail($id);

        if (!$session->isOpen()) {
            return response()->json(['error' => 'Session is closed'], 422);
        }

        $barcode = trim($request->input('barcode', ''));
        if (!$barcode) {
            return response()->json(['error' => 'Empty barcode'], 422);
        }

        // Check for duplicate scan in this session
        $duplicate = InventoryScan::where('session_id', $id)
            ->where('barcode_scanned', $barcode)
            ->first();
        if ($duplicate) {
            return response()->json([
                'status'    => 'duplicate',
                'message'   => 'Already scanned in this session',
                'scanned_at' => $duplicate->scanned_at,
            ]);
        }

        // Look up the item
        $item = PhysicalItem::with('bibliographicRecord')
            ->where('barcode', $barcode)
            ->first();

        if (!$item) {
            // Barcode not in database
            InventoryScan::create([
                'session_id'      => $id,
                'item_id'         => null,
                'barcode_scanned' => $barcode,
                'scan_status'     => 'not_found',
                'scanned_by'      => auth()->id(),
                'scanned_at'      => now(),
            ]);

            InventorySession::where('id', $id)->increment('unknown_count');
            InventorySession::where('id', $id)->increment('scanned_count');

            return response()->json([
                'status'  => 'not_found',
                'message' => 'Barcode not found in database',
                'barcode' => $barcode,
            ]);
        }

        // Determine scan status
        $scanStatus = 'found';
        if ($item->item_status === 'checked_out') {
            $scanStatus = 'checked_out';
        } elseif ($session->collection_id && $item->collection_id !== $session->collection_id) {
            $scanStatus = 'wrong_location';
        } elseif ($session->location_id && $item->location_id !== $session->location_id) {
            $scanStatus = 'wrong_location';
        }

        InventoryScan::create([
            'session_id'      => $id,
            'item_id'         => $item->id,
            'barcode_scanned' => $barcode,
            'scan_status'     => $scanStatus,
            'scanned_by'      => auth()->id(),
            'scanned_at'      => now(),
        ]);

        // Update item's last_seen_at
        $item->update(['last_seen_at' => now()]);

        // Update session counters
        InventorySession::where('id', $id)->increment('scanned_count');

        return response()->json([
            'status'      => $scanStatus,
            'barcode'     => $barcode,
            'title'       => $item->bibliographicRecord?->title,
            'call_number' => $item->call_number,
            'item_status' => $item->item_status,
            'collection'  => $item->collection?->name,
            'message'     => match($scanStatus) {
                'found'          => 'Item found — OK',
                'checked_out'    => 'Item is currently on loan',
                'wrong_location' => 'Item found in wrong location',
                default          => 'Scanned',
            },
        ]);
    }

    // ── Close session & flag missing items ────────────────────────────────────
    public function close(Request $request, string $id)
    {
        $session = InventorySession::findOrFail($id);
        if (!$session->isOpen()) {
            return back()->withErrors(['error' => 'Session already closed']);
        }

        $flagMissing = $request->boolean('flag_missing', true);

        DB::transaction(function () use ($session, $flagMissing) {
            // Collect all item IDs that were scanned (found, wrong_location, checked_out)
            $scannedItemIds = InventoryScan::where('session_id', $session->id)
                ->whereNotNull('item_id')
                ->pluck('item_id');

            // Build base query for items in scope
            $scopeQuery = PhysicalItem::query()
                ->whereNotIn('item_status', ['withdrawn', 'lost', 'checked_out']);
            if ($session->collection_id) $scopeQuery->where('collection_id', $session->collection_id);
            if ($session->location_id)   $scopeQuery->where('location_id',   $session->location_id);

            $missingItems = $scopeQuery->whereNotIn('id', $scannedItemIds)->get();
            $missingCount = $missingItems->count();

            if ($flagMissing && $missingCount > 0) {
                PhysicalItem::whereIn('id', $missingItems->pluck('id'))
                    ->update(['item_status' => 'missing']);
            }

            $session->update([
                'status'        => 'closed',
                'missing_count' => $missingCount,
                'closed_at'     => now(),
            ]);
        });

        return redirect()->route('admin.inventory.report', $id)
            ->with('success', 'Session closed. Missing items have been flagged.');
    }

    // ── Session report ────────────────────────────────────────────────────────
    public function report(string $id)
    {
        $session = InventorySession::with(['collection', 'location'])->findOrFail($id);

        $scansByStatus = InventoryScan::where('session_id', $id)
            ->selectRaw('scan_status, COUNT(*) as count')
            ->groupBy('scan_status')
            ->pluck('count', 'scan_status');

        // Items flagged missing by this session
        $missingItems = InventoryScan::with(['item.bibliographicRecord', 'item.collection'])
            ->where('session_id', $id)
            ->where('scan_status', 'not_found')
            ->paginate(50);

        // Wrong location items
        $wrongLocation = InventoryScan::with(['item.bibliographicRecord', 'item.collection'])
            ->where('session_id', $id)
            ->where('scan_status', 'wrong_location')
            ->get();

        return Inertia::render('Admin/Inventory/Report', [
            'session'       => $session,
            'scansByStatus' => $scansByStatus,
            'missingItems'  => $missingItems,
            'wrongLocation' => $wrongLocation,
        ]);
    }
}
