<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Tenant\BibliographicRecord;
use App\Models\Tenant\Collection;
use App\Models\Tenant\Location;
use App\Models\Tenant\PhysicalItem;
use App\Models\Tenant\Serial;
use App\Models\Tenant\SerialIssue;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SerialController extends Controller
{
    // ─── Frequency → issues-per-year map ─────────────────────────────────────
    private const FREQUENCY_MAP = [
        'daily'      => 365,
        'weekly'     => 52,
        'biweekly'   => 26,
        'monthly'    => 12,
        'bimonthly'  => 6,
        'quarterly'  => 4,
        'semiannual' => 2,
        'annual'     => 1,
    ];

    // ─── Index ────────────────────────────────────────────────────────────────

    public function index(Request $request)
    {
        $q      = trim($request->input('q', ''));
        $status = $request->input('status', 'all'); // all|active|expired|expiring

        $like = config('database.default') === 'pgsql' ? 'ilike' : 'like';

        try {
            $query = Serial::with(['bibliographicRecord:id,title,issn', 'issues'])
                ->orderByDesc('created_at');

            if ($q) {
                $query->where(function ($qb) use ($q, $like) {
                    $qb->where('issn', $like, "%{$q}%")
                       ->orWhereHas('bibliographicRecord', fn ($r) => $r->where('title', $like, "%{$q}%"));
                });
            }

            $today = now()->toDateString();
            $soon  = now()->addDays(30)->toDateString();

            match ($status) {
                'active'   => $query->where(fn ($q) => $q->whereNull('subscription_expiry')->orWhere('subscription_expiry', '>=', $today)),
                'expired'  => $query->where('subscription_expiry', '<', $today),
                'expiring' => $query->whereBetween('subscription_expiry', [$today, $soon]),
                default    => null,
            };

            $serials = $query->paginate(25)->withQueryString();

            // Append issue stats to each serial
            $serials->getCollection()->transform(function (Serial $s) {
                $s->stats = $s->issueStats();
                return $s;
            });

        } catch (\Throwable) {
            $serials = new \Illuminate\Pagination\LengthAwarePaginator([], 0, 25);
        }

        return Inertia::render('Admin/Serials/Index', [
            'serials' => $serials,
            'filters' => compact('q', 'status'),
        ]);
    }

    // ─── Create / Store ───────────────────────────────────────────────────────

    public function create()
    {
        return Inertia::render('Admin/Serials/Form', [
            'serial'      => null,
            'biblios'     => $this->biblioOptions(),
            'locations'   => Location::orderBy('name')->get(['id', 'name']),
            'collections' => Collection::orderBy('name')->get(['id', 'name']),
            'frequencies' => $this->frequencyOptions(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'biblio_id'          => 'nullable|uuid|exists:bibliographic_records,id',
            'issn'               => 'nullable|string|max:10',
            'frequency'          => 'required|string|in:' . implode(',', array_keys(self::FREQUENCY_MAP)),
            'start_date'         => 'required|date',
            'end_date'           => 'nullable|date|after_or_equal:start_date',
            'subscription_expiry'=> 'nullable|date',
            'supplier'           => 'nullable|string|max:200',
            'subscription_cost'  => 'nullable|numeric|min:0',
            'currency'           => 'nullable|string|max:3',
            'location_id'        => 'nullable|integer',
            'collection_id'      => 'nullable|integer',
            'call_number'        => 'nullable|string|max:100',
            'notes'              => 'nullable|string',
            'generate_issues'    => 'boolean',
        ]);

        try {
            $serial = Serial::create($data);

            if ($request->boolean('generate_issues', true)) {
                $this->generateExpectedIssues($serial);
            }
        } catch (\Throwable $e) {
            return back()->withErrors(['general' => $e->getMessage()]);
        }

        return redirect()->route('admin.serials.show', $serial->id)
            ->with('success', 'Subscription created. Expected issues have been generated.');
    }

    // ─── Show ─────────────────────────────────────────────────────────────────

    public function show(string $id)
    {
        try {
            $serial = Serial::with([
                'bibliographicRecord:id,title,issn,publisher',
                'location:id,name',
                'collection:id,name',
                'issues' => fn ($q) => $q->orderBy('publication_date')->orderBy('expected_date'),
                'issues.physicalItem:id,barcode',
            ])->findOrFail($id);
        } catch (\Throwable) {
            abort(404);
        }

        // Tag each issue with its effective status (expected → late if overdue)
        $serial->issues->transform(function (SerialIssue $issue) {
            $issue->effective_status = $issue->effectiveStatus();
            return $issue;
        });

        $serial->stats = $serial->issueStats();

        return Inertia::render('Admin/Serials/Show', [
            'serial' => $serial,
        ]);
    }

    // ─── Edit / Update ────────────────────────────────────────────────────────

    public function edit(string $id)
    {
        try {
            $serial = Serial::with('bibliographicRecord:id,title')->findOrFail($id);
        } catch (\Throwable) {
            abort(404);
        }

        return Inertia::render('Admin/Serials/Form', [
            'serial'      => $serial,
            'biblios'     => $this->biblioOptions(),
            'locations'   => Location::orderBy('name')->get(['id', 'name']),
            'collections' => Collection::orderBy('name')->get(['id', 'name']),
            'frequencies' => $this->frequencyOptions(),
        ]);
    }

    public function update(Request $request, string $id)
    {
        try {
            $serial = Serial::findOrFail($id);
        } catch (\Throwable) {
            abort(404);
        }

        $data = $request->validate([
            'biblio_id'          => 'nullable|uuid|exists:bibliographic_records,id',
            'issn'               => 'nullable|string|max:10',
            'frequency'          => 'required|string|in:' . implode(',', array_keys(self::FREQUENCY_MAP)),
            'start_date'         => 'required|date',
            'end_date'           => 'nullable|date|after_or_equal:start_date',
            'subscription_expiry'=> 'nullable|date',
            'supplier'           => 'nullable|string|max:200',
            'subscription_cost'  => 'nullable|numeric|min:0',
            'currency'           => 'nullable|string|max:3',
            'location_id'        => 'nullable|integer',
            'collection_id'      => 'nullable|integer',
            'call_number'        => 'nullable|string|max:100',
            'notes'              => 'nullable|string',
        ]);

        try {
            $serial->update($data);
        } catch (\Throwable $e) {
            return back()->withErrors(['general' => $e->getMessage()]);
        }

        return redirect()->route('admin.serials.show', $serial->id)
            ->with('success', 'Subscription updated.');
    }

    // ─── Destroy ──────────────────────────────────────────────────────────────

    public function destroy(string $id)
    {
        try {
            Serial::findOrFail($id)->delete();
        } catch (\Throwable $e) {
            return back()->withErrors(['general' => $e->getMessage()]);
        }

        return redirect()->route('admin.serials.index')
            ->with('success', 'Subscription deleted.');
    }

    // ─── Issue Actions ────────────────────────────────────────────────────────

    public function receiveIssue(Request $request, string $id, string $issueId)
    {
        $data = $request->validate([
            'received_date' => 'required|date',
            'volume'        => 'nullable|string|max:20',
            'issue_number'  => 'nullable|string|max:20',
            'barcode'       => 'nullable|string|max:50',
            'notes'         => 'nullable|string',
        ]);

        try {
            $issue  = SerialIssue::where('serial_id', $id)->findOrFail($issueId);
            $serial = $issue->serial;

            $itemId = null;
            if (! empty($data['barcode'])) {
                $item = PhysicalItem::create([
                    'biblio_id'     => $serial->biblio_id,
                    'barcode'       => $data['barcode'],
                    'collection_id' => $serial->collection_id,
                    'location_id'   => $serial->location_id,
                    'call_number'   => $serial->call_number,
                    'item_status'   => 'available',
                    'condition'     => 'good',
                ]);
                $itemId = $item->id;
            }

            $issue->update([
                'status'        => 'received',
                'received_date' => $data['received_date'],
                'volume'        => $data['volume']       ?? $issue->volume,
                'issue_number'  => $data['issue_number'] ?? $issue->issue_number,
                'notes'         => $data['notes']        ?? $issue->notes,
                'item_id'       => $itemId ?? $issue->item_id,
            ]);
        } catch (\Throwable $e) {
            return back()->withErrors(['general' => $e->getMessage()]);
        }

        return redirect()->route('admin.serials.show', $id)
            ->with('success', 'Issue received.');
    }

    public function claimIssue(string $id, string $issueId)
    {
        try {
            $issue = SerialIssue::where('serial_id', $id)->findOrFail($issueId);
            $issue->update(['status' => 'late', 'claimed_at' => now()]);
        } catch (\Throwable $e) {
            return back()->withErrors(['general' => $e->getMessage()]);
        }

        return redirect()->route('admin.serials.show', $id)
            ->with('success', 'Claim recorded.');
    }

    public function markMissing(string $id, string $issueId)
    {
        try {
            $issue = SerialIssue::where('serial_id', $id)->findOrFail($issueId);
            $issue->update(['status' => 'missing']);
        } catch (\Throwable $e) {
            return back()->withErrors(['general' => $e->getMessage()]);
        }

        return redirect()->route('admin.serials.show', $id)
            ->with('success', 'Issue marked as missing.');
    }

    public function generateIssues(string $id)
    {
        try {
            $serial = Serial::findOrFail($id);
            // Remove only expected/late issues (keep received/missing as history)
            $serial->issues()->whereIn('status', ['expected', 'late'])->delete();
            $this->generateExpectedIssues($serial);
        } catch (\Throwable $e) {
            return back()->withErrors(['general' => $e->getMessage()]);
        }

        return redirect()->route('admin.serials.show', $id)
            ->with('success', 'Expected issues regenerated.');
    }

    // ─── Private helpers ──────────────────────────────────────────────────────

    private function generateExpectedIssues(Serial $serial): void
    {
        $frequency = $serial->frequency;
        $perYear   = self::FREQUENCY_MAP[$frequency] ?? 12;

        $start  = $serial->start_date ?? now();
        $end    = $serial->subscription_expiry ?? $serial->end_date ?? $start->copy()->addYear();

        // Interval in days between issues
        $intervalDays = (int) round(365 / $perYear);

        $current = $start->copy();
        $volume  = 1;
        $issueNo = 1;

        $inserts = [];
        $now     = now()->toDateTimeString();

        while ($current->lte($end)) {
            $inserts[] = [
                'id'               => (string) \Illuminate\Support\Str::uuid(),
                'serial_id'        => $serial->id,
                'volume'           => (string) $volume,
                'issue_number'     => (string) $issueNo,
                'publication_date' => $current->toDateString(),
                'expected_date'    => $current->toDateString(),
                'status'           => 'expected',
                'created_at'       => $now,
                'updated_at'       => $now,
            ];

            $current->addDays($intervalDays);
            $issueNo++;

            // Increment volume annually
            if ($issueNo > $perYear) {
                $issueNo = 1;
                $volume++;
            }
        }

        // Bulk insert in chunks
        foreach (array_chunk($inserts, 50) as $chunk) {
            SerialIssue::insert($chunk);
        }
    }

    private function biblioOptions(): \Illuminate\Support\Collection
    {
        return rescue(fn () =>
            BibliographicRecord::orderBy('title')
                ->limit(500)
                ->get(['id', 'title', 'issn'])
        , collect());
    }

    private function frequencyOptions(): array
    {
        return [
            ['value' => 'daily',      'label' => 'Daily (365/year)'],
            ['value' => 'weekly',     'label' => 'Weekly (52/year)'],
            ['value' => 'biweekly',   'label' => 'Bi-Weekly (26/year)'],
            ['value' => 'monthly',    'label' => 'Monthly (12/year)'],
            ['value' => 'bimonthly',  'label' => 'Bi-Monthly (6/year)'],
            ['value' => 'quarterly',  'label' => 'Quarterly (4/year)'],
            ['value' => 'semiannual', 'label' => 'Semi-Annual (2/year)'],
            ['value' => 'annual',     'label' => 'Annual (1/year)'],
        ];
    }
}
