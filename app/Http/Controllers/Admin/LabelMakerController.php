<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Tenant\Collection as LibCollection;
use App\Models\Tenant\LabelTemplate;
use App\Models\Tenant\LibrarySetting;
use App\Models\Tenant\PhysicalItem;
use App\Services\BarcodeSequenceService;
use App\Services\LabelRenderService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class LabelMakerController extends Controller
{
    /** Max labels rendered synchronously in one batch. */
    private const BATCH_CAP = 500;

    public function __construct(
        private readonly LabelRenderService $labels,
        private readonly BarcodeSequenceService $sequence,
    ) {
    }

    // ─── Label Maker workspace ───────────────────────────────────────────────
    public function index(Request $request)
    {
        $filters = [
            'q'             => $request->input('q', ''),
            'item_status'   => $request->input('item_status', ''),
            'collection_id' => $request->input('collection_id', ''),
            'has_barcode'   => $request->input('has_barcode', ''),
        ];

        try {
            $query = PhysicalItem::with(['bibliographicRecord:id,title', 'collection:id,name'])
                ->orderByDesc('created_at');

            if ($filters['q']) {
                $like = config('database.default') === 'pgsql' ? 'ilike' : 'like';
                $q = $filters['q'];
                $query->where(function ($qb) use ($q, $like) {
                    $qb->where('barcode', $like, "%{$q}%")
                       ->orWhere('call_number', $like, "%{$q}%")
                       ->orWhere('accession_number', $like, "%{$q}%");
                });
            }
            if ($filters['item_status']) {
                $query->where('item_status', $filters['item_status']);
            }
            if ($filters['collection_id']) {
                $query->where('collection_id', $filters['collection_id']);
            }
            if ($filters['has_barcode'] === 'yes') {
                $query->whereNotNull('barcode')->where('barcode', '!=', '');
            } elseif ($filters['has_barcode'] === 'no') {
                $query->where(fn ($q) => $q->whereNull('barcode')->orWhere('barcode', ''));
            }

            $items = $query->paginate(25)->withQueryString();
        } catch (\Throwable) {
            $items = new \Illuminate\Pagination\LengthAwarePaginator([], 0, 25);
        }

        return Inertia::render('Admin/Labels/Index', [
            'items'        => $items,
            'filters'      => $filters,
            'collections'  => rescue(fn () => LibCollection::orderBy('name')->get(['id', 'name']), []),
            'templates'    => $this->templateList(),
            'branding'     => $this->branding(),
            'barcodeSettings' => $this->barcodeSettings(),
            'missingCount' => rescue(fn () => PhysicalItem::where(fn ($q) => $q->whereNull('barcode')->orWhere('barcode', ''))->count(), 0),
        ]);
    }

    // ─── Template management ─────────────────────────────────────────────────
    public function templatesIndex()
    {
        return Inertia::render('Admin/Labels/Templates/Index', [
            'templates' => rescue(fn () => LabelTemplate::orderByDesc('is_default')->orderBy('name')->get(), collect()),
            'branding'  => $this->branding(),
        ]);
    }

    public function templateCreate()
    {
        return $this->editorView(null);
    }

    public function templateEdit(string $id)
    {
        return $this->editorView(LabelTemplate::findOrFail($id));
    }

    private function editorView(?LabelTemplate $template)
    {
        return Inertia::render('Admin/Labels/Templates/Editor', [
            'template'        => $template,
            'defaultElements' => LabelTemplate::DEFAULT_ELEMENTS,
            'fieldKeys'       => LabelTemplate::FIELD_KEYS,
            'presets'         => LabelTemplate::PRESETS,
            'branding'        => $this->branding(),
            'sampleItem'      => $this->sampleItemData(),
        ]);
    }

    public function templateStore(Request $request)
    {
        $data = $this->validateTemplate($request);
        try {
            $template = LabelTemplate::create($data);
            if ($request->boolean('is_default')) {
                $this->makeDefault($template);
            }
        } catch (\Throwable $e) {
            return back()->withErrors(['general' => $e->getMessage()]);
        }

        return redirect()->route('admin.labels.templates.index')->with('success', 'Label template created.');
    }

    public function templateUpdate(Request $request, string $id)
    {
        $template = LabelTemplate::findOrFail($id);
        $data = $this->validateTemplate($request);
        try {
            $template->update($data);
            if ($request->boolean('is_default')) {
                $this->makeDefault($template);
            }
        } catch (\Throwable $e) {
            return back()->withErrors(['general' => $e->getMessage()]);
        }

        return redirect()->route('admin.labels.templates.index')->with('success', 'Label template updated.');
    }

    public function setDefault(string $id)
    {
        $this->makeDefault(LabelTemplate::findOrFail($id));
        return back()->with('success', 'Default label template updated.');
    }

    public function templateDestroy(string $id)
    {
        try {
            LabelTemplate::findOrFail($id)->delete();
        } catch (\Throwable $e) {
            return back()->withErrors(['general' => $e->getMessage()]);
        }
        return back()->with('success', 'Label template deleted.');
    }

    // ─── Barcode value settings + bulk assign ────────────────────────────────
    public function saveSettings(Request $request)
    {
        $v = $request->validate([
            'barcode_auto'    => 'boolean',
            'barcode_prefix'  => 'nullable|string|max:20',
            'barcode_padding' => 'integer|min:1|max:12',
        ]);

        LibrarySetting::set('barcode_auto', $request->boolean('barcode_auto') ? '1' : '');
        LibrarySetting::set('barcode_prefix', $v['barcode_prefix'] ?? 'LIB-');
        LibrarySetting::set('barcode_padding', (string) ($v['barcode_padding'] ?? 6));

        return back()->with('success', 'Barcode settings saved.');
    }

    public function assignBarcodes()
    {
        try {
            $count = $this->sequence->assignMissing();
        } catch (\Throwable $e) {
            return back()->withErrors(['general' => $e->getMessage()]);
        }

        return back()->with('success', "Assigned barcodes to {$count} item(s).");
    }

    // ─── PDF generation ──────────────────────────────────────────────────────
    public function generate(Request $request)
    {
        $validated = $request->validate([
            'template_id'   => 'nullable|string',
            'item_ids'      => 'nullable|array',
            'item_ids.*'    => 'string',
            'select_all'    => 'nullable|boolean',
            'start_offset'  => 'nullable|integer|min:0',
            'q'             => 'nullable|string',
            'item_status'   => 'nullable|string',
            'collection_id' => 'nullable',
            'has_barcode'   => 'nullable|string',
        ]);

        $template = $this->resolveTemplate($validated['template_id'] ?? null);
        if (! $template) {
            return back()->withErrors(['general' => 'No label template available. Create one first.']);
        }

        $query = PhysicalItem::with(['bibliographicRecord', 'collection', 'location'])
            ->whereNotNull('barcode')->where('barcode', '!=', '')
            ->orderBy('call_number');

        if (! empty($validated['select_all'])) {
            if (! empty($validated['q'])) {
                $like = config('database.default') === 'pgsql' ? 'ilike' : 'like';
                $q = $validated['q'];
                $query->where(function ($qb) use ($q, $like) {
                    $qb->where('barcode', $like, "%{$q}%")
                       ->orWhere('call_number', $like, "%{$q}%")
                       ->orWhere('accession_number', $like, "%{$q}%");
                });
            }
            if (! empty($validated['item_status'])) {
                $query->where('item_status', $validated['item_status']);
            }
            if (! empty($validated['collection_id'])) {
                $query->where('collection_id', $validated['collection_id']);
            }
        } else {
            $ids = $validated['item_ids'] ?? [];
            if (empty($ids)) {
                return back()->withErrors(['general' => 'Select at least one item with a barcode.']);
            }
            $query->whereIn('id', $ids);
        }

        $items = $query->limit(self::BATCH_CAP)->get();

        if ($items->isEmpty()) {
            return back()->withErrors(['general' => 'No matching items with a barcode to print.']);
        }

        $pdf = $this->labels->renderPdf($items, $template, (int) ($validated['start_offset'] ?? 0));

        $filename = 'barcode-labels-' . now()->format('Ymd-His') . '.pdf';

        return response($pdf, 200, [
            'Content-Type'        => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────
    private function validateTemplate(Request $request): array
    {
        $v = $request->validate([
            'name'             => 'required|string|max:150',
            'page_size'        => 'nullable|in:A4,Letter',
            'margin_top_mm'    => 'required|numeric|min:0|max:100',
            'margin_left_mm'   => 'required|numeric|min:0|max:100',
            'columns'          => 'required|integer|min:1|max:20',
            'rows'             => 'required|integer|min:1|max:40',
            'label_width_mm'   => 'required|numeric|min:10|max:300',
            'label_height_mm'  => 'required|numeric|min:8|max:300',
            'gap_x_mm'         => 'required|numeric|min:0|max:50',
            'gap_y_mm'         => 'required|numeric|min:0|max:50',
            'background_color' => 'nullable|string|max:20',
            'elements'         => 'required|array',
        ]);
        $v['page_size'] ??= 'A4';
        $v['background_color'] ??= '#ffffff';

        return $v;
    }

    private function makeDefault(LabelTemplate $template): void
    {
        DB::transaction(function () use ($template) {
            LabelTemplate::where('id', '!=', $template->id)->update(['is_default' => false]);
            $template->update(['is_default' => true]);
        });
    }

    private function resolveTemplate(?string $id): ?LabelTemplate
    {
        if ($id) {
            return LabelTemplate::find($id);
        }
        return LabelTemplate::where('is_default', true)->first()
            ?? LabelTemplate::orderBy('created_at')->first();
    }

    private function templateList()
    {
        return rescue(fn () => LabelTemplate::orderByDesc('is_default')->orderBy('name')->get(), collect());
    }

    private function branding(): array
    {
        return [
            'library_name'  => LibrarySetting::get('library_name', 'Alpha eLibrary'),
            'logo_url'      => LibrarySetting::get('logo_url'),
            'primary_color' => LibrarySetting::get('primary_color', '#2563eb'),
        ];
    }

    private function barcodeSettings(): array
    {
        return [
            'barcode_auto'    => (bool) LibrarySetting::get('barcode_auto', false),
            'barcode_prefix'  => LibrarySetting::get('barcode_prefix', 'LIB-'),
            'barcode_padding' => (int) LibrarySetting::get('barcode_padding', 6),
            'next_example'    => rescue(fn () => $this->sequence->next(), 'LIB-000001'),
        ];
    }

    private function sampleItemData(): array
    {
        $item = rescue(fn () => PhysicalItem::with(['bibliographicRecord', 'collection', 'location'])
            ->whereNotNull('barcode')->where('barcode', '!=', '')->first());

        if ($item) {
            return $this->labels->resolveFields($item);
        }

        return [
            'barcode_value'    => 'LIB-000001',
            'title'            => 'The Art of Computer Programming',
            'title_km'         => 'សិល្បៈនៃការសរសេរកម្មវិធី',
            'author'           => 'Donald Knuth',
            'call_number'      => '005.1 KNU',
            'accession_number' => 'ACC-0001',
            'collection'       => 'General',
            'location'         => 'Main Library',
            'shelf'            => 'A3',
            'isbn'             => '9780201896831',
            'library_name'     => LibrarySetting::get('library_name', 'Alpha eLibrary'),
            'barcode'          => $this->labels->barcodeDataUri('LIB-000001'),
        ];
    }
}
