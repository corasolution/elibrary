<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Tenant\BibliographicRecord;
use App\Services\CatalogService;
use App\Services\ImportService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class CatalogController extends Controller
{
    public function __construct(
        private CatalogService $catalog,
        private ImportService $importer,
    ) {}

    public function index(Request $request)
    {
        $filters = $request->only(['q', 'material_type_id', 'language', 'year_from', 'year_to', 'sort']);

        try {
            $records = $this->catalog->searchCatalog(
                $filters['q'] ?? '',
                $filters,
                20
            );
        } catch (\Throwable) {
            $records = new \Illuminate\Pagination\LengthAwarePaginator([], 0, 20);
        }

        return Inertia::render('Admin/Catalog/Index', [
            'records'    => $records,
            'filters'    => $filters,
            'trashCount' => rescue(fn () => BibliographicRecord::onlyTrashed()->count(), 0),
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Catalog/Form', array_merge(
            ['record' => null],
            $this->sharedFormData()
        ));
    }

    public function store(Request $request)
    {
        $request->validate(['title' => 'required|string|max:500']);

        try {
            $record = $this->catalog->createRecord($request->all());
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('Catalog createRecord failed: ' . $e->getMessage(), ['exception' => $e]);
            return back()->withErrors(['general' => 'Could not save the record: ' . $e->getMessage()]);
        }

        return redirect()->route('admin.catalog.show', $record->id)
            ->with('success', 'Record created. Add physical copies below.');
    }

    public function show(string $id)
    {
        try {
            $record = BibliographicRecord::with(['materialType', 'physicalItems.collection', 'physicalItems.location', 'digitalResources'])
                ->findOrFail($id);
        } catch (\Throwable) {
            abort(404);
        }

        return Inertia::render('Admin/Catalog/Show', compact('record'));
    }

    public function edit(string $id)
    {
        try {
            $record = BibliographicRecord::with(['materialType', 'physicalItems', 'digitalResources'])
                ->findOrFail($id);
        } catch (\Throwable) {
            abort(404);
        }

        return Inertia::render('Admin/Catalog/Form', array_merge(
            ['record' => $record],
            $this->sharedFormData()
        ));
    }

    public function update(Request $request, string $id)
    {
        $request->validate(['title' => 'required|string|max:500']);

        try {
            $record = BibliographicRecord::findOrFail($id);
            $this->catalog->updateRecord($record, $request->all());
        } catch (\Throwable $e) {
            return back()->withErrors(['general' => $e->getMessage()]);
        }

        return redirect()->route('admin.catalog.show', $id)->with('success', 'Record updated.');
    }

    public function destroy(string $id)
    {
        try {
            BibliographicRecord::findOrFail($id)->delete();
        } catch (\Throwable $e) {
            return back()->withErrors(['general' => $e->getMessage()]);
        }

        return redirect()->route('admin.catalog.index')
            ->with('success', 'Record moved to trash. It will be permanently deleted in 90 days.');
    }

    // ─── Trash & Restore ─────────────────────────────────────────────────────

    public function trash()
    {
        $records = BibliographicRecord::onlyTrashed()
            ->with('materialType')
            ->orderByDesc('deleted_at')
            ->paginate(25)
            ->withQueryString();

        // Attach deleter name for display
        $staffIds = $records->pluck('deleted_by')->filter()->unique()->values();
        $staffMap = [];
        if ($staffIds->isNotEmpty()) {
            $staffMap = \App\Models\Tenant\User::whereIn('id', $staffIds)
                ->pluck('name', 'id')
                ->toArray();
        }

        return Inertia::render('Admin/Catalog/Trash', [
            'records'  => $records,
            'staffMap' => $staffMap,
        ]);
    }

    public function restore(string $id)
    {
        try {
            BibliographicRecord::onlyTrashed()->findOrFail($id)->restore();
        } catch (\Throwable $e) {
            return back()->withErrors(['general' => $e->getMessage()]);
        }

        return redirect()->route('admin.catalog.index')->with('success', 'Record restored successfully.');
    }

    public function forceDelete(string $id)
    {
        try {
            BibliographicRecord::onlyTrashed()->findOrFail($id)->forceDelete();
        } catch (\Throwable $e) {
            return back()->withErrors(['general' => $e->getMessage()]);
        }

        return redirect()->route('admin.catalog.trash')->with('success', 'Record permanently deleted.');
    }

    public function lookupIsbn(string $isbn)
    {
        $data = $this->catalog->lookupByISBN($isbn);
        return response()->json(['data' => $data]);
    }

    /**
     * AI-suggest DDC + LCC classification from the in-progress record metadata.
     * POST /admin/catalog/ai-classify
     */
    public function aiClassify(Request $request)
    {
        $enabled = filter_var(\App\Models\Tenant\LibrarySetting::get('ai_features_enabled', false), FILTER_VALIDATE_BOOLEAN)
            && filter_var(\App\Models\Tenant\LibrarySetting::get('ai_cataloging_enabled', false), FILTER_VALIDATE_BOOLEAN);

        if (! $enabled) {
            return response()->json(['error' => 'AI cataloging is disabled for this library.'], 403);
        }

        $data = $request->validate([
            'title'            => 'required|string|max:500',
            'subtitle'         => 'nullable|string|max:500',
            'abstract'         => 'nullable|string',
            'authors'          => 'nullable|array',
            'subjects'         => 'nullable|array',
            'publisher'        => 'nullable|string|max:300',
            'publication_year' => 'nullable',
        ]);

        $result = app(\App\Services\CatalogAIService::class)->classifyRecord($data);

        return response()->json($result);
    }

    /**
     * Read a photographed book cover with an AI vision model and return
     * extracted bibliographic fields for the cataloger to review/apply.
     * POST /admin/catalog/scan-cover  body: { image: "data:image/jpeg;base64,..." }
     */
    public function scanCover(Request $request)
    {
        $enabled = filter_var(\App\Models\Tenant\LibrarySetting::get('ai_features_enabled', false), FILTER_VALIDATE_BOOLEAN)
            && filter_var(\App\Models\Tenant\LibrarySetting::get('ai_cataloging_enabled', false), FILTER_VALIDATE_BOOLEAN);

        if (! $enabled) {
            return response()->json(['error' => 'AI cataloging is disabled for this library.'], 403);
        }

        $request->validate([
            'image' => 'required|string',
        ]);

        // Parse the data URL → mime + raw base64.
        if (! preg_match('/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/s', $request->input('image'), $m)) {
            return response()->json(['error' => 'Invalid image format.'], 422);
        }
        $mime    = $m[1];
        $rawB64  = $m[2];
        $decoded = base64_decode($rawB64, true);

        if ($decoded === false) {
            return response()->json(['error' => 'Could not decode image.'], 422);
        }
        if (strlen($decoded) > 6 * 1024 * 1024) {
            return response()->json(['error' => 'Image too large (max 6MB).'], 422);
        }

        $result = app(\App\Services\CatalogAIService::class)->extractFromCover($rawB64, $mime);

        if (! $result) {
            return response()->json(['error' => 'Could not read the cover. Try a clearer, well-lit photo.'], 422);
        }

        // Hand the photo back so the form can keep it as the cover image.
        $result['cover_image_url'] = $request->input('image');

        return response()->json(['result' => $result]);
    }

    /**
     * Search external library sources (LOC, Open Library, Google Books, CrossRef).
     * GET /admin/catalog/import-search?q=...&type=isbn|title|author|doi&sources[]=loc,...
     */
    public function importSearch(Request $request)
    {
        $query   = trim($request->input('q', ''));
        $type    = $request->input('type', 'isbn');
        $sources = $request->input('sources', ['loc', 'openlibrary', 'googlebooks', 'crossref']);

        if (! $query) {
            return response()->json(['results' => [], 'error' => 'Query is required']);
        }

        $results = $this->importer->search($query, $type, (array) $sources);

        return response()->json(['results' => $results]);
    }

    public function exportBibframe(string $id)
    {
        try {
            $record = BibliographicRecord::with(['work.contributions.agent', 'physicalItems'])
                ->findOrFail($id);
        } catch (\Throwable) {
            abort(404);
        }

        $work = $record->work;
        if (! $work) {
            $work = $this->catalog->findOrCreateWork($record->toArray());
            $record->update(['work_id' => $work->id]);
        }

        $this->catalog->regenerateWorkBibframeSnapshot($work);
        $work->refresh();

        $json = json_encode($work->bibframe_data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        $filename = 'bibframe_' . preg_replace('/[^a-z0-9]+/', '_', strtolower($record->title)) . '.jsonld';

        return response($json, 200, [
            'Content-Type'        => 'application/ld+json; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }

    public function exportMarc(string $id)
    {
        try {
            $record = BibliographicRecord::with(['work.contributions.agent', 'physicalItems'])
                ->findOrFail($id);
        } catch (\Throwable) {
            abort(404);
        }

        $xml = $this->catalog->generateMarcXml($record);
        $filename = 'marc21_' . preg_replace('/[^a-z0-9]+/', '_', strtolower($record->title)) . '.xml';

        return response($xml, 200, [
            'Content-Type'        => 'application/xml; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }

    private function sharedFormData(): array
    {
        $get = fn (callable $q) => rescue($q, []);

        return [
            'materialTypes' => $get(fn () =>
                \App\Models\Tenant\MaterialType::orderBy('name')
                    ->get(['id', 'code', 'name', 'has_physical', 'has_digital'])
            ),
            'collections' => $get(fn () =>
                \App\Models\Tenant\Collection::orderBy('name')->get(['id', 'name'])
            ),
            'locations' => $get(fn () =>
                \App\Models\Tenant\Location::orderBy('name')->get(['id', 'name'])
            ),
        ];
    }
}
