<?php

namespace App\Http\Controllers\Opac;

use App\Http\Controllers\Controller;
use App\Services\CatalogService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CatalogController extends Controller
{
    public function __construct(
        private readonly CatalogService $catalogService,
        private readonly \App\Services\DigitalAssetService $assetService,
    ) {}

    public function home(): Response
    {
        // Get material type IDs
        $ebookType = \App\Models\Tenant\MaterialType::where('code', 'ebook')->first();
        $epubType = \App\Models\Tenant\MaterialType::where('code', 'epub')->first();
        $audioType = \App\Models\Tenant\MaterialType::where('code', 'audio')->first();
        $videoType = \App\Models\Tenant\MaterialType::where('code', 'video')->first();
        $thesisType = \App\Models\Tenant\MaterialType::where('code', 'thesis')->first();

        // Get records by category
        $ebooks = $ebookType ? \App\Models\Tenant\BibliographicRecord::query()
            ->with(['materialType', 'digitalResources'])
            ->where('material_type_id', $ebookType->id)
            ->where('record_status', 'active')
            ->latest('cataloged_at')
            ->limit(12)
            ->get() : collect();

        $epublications = $epubType ? \App\Models\Tenant\BibliographicRecord::query()
            ->with(['materialType', 'digitalResources'])
            ->where('material_type_id', $epubType->id)
            ->where('record_status', 'active')
            ->latest('cataloged_at')
            ->limit(12)
            ->get() : collect();

        $audio = $audioType ? \App\Models\Tenant\BibliographicRecord::query()
            ->with(['materialType', 'digitalResources'])
            ->where('material_type_id', $audioType->id)
            ->where('record_status', 'active')
            ->latest('cataloged_at')
            ->limit(6)
            ->get() : collect();

        $video = $videoType ? \App\Models\Tenant\BibliographicRecord::query()
            ->with(['materialType', 'digitalResources'])
            ->where('material_type_id', $videoType->id)
            ->where('record_status', 'active')
            ->latest('cataloged_at')
            ->limit(4)
            ->get() : collect();

        $theses = $thesisType ? \App\Models\Tenant\BibliographicRecord::query()
            ->with(['materialType', 'digitalResources'])
            ->where('material_type_id', $thesisType->id)
            ->where('record_status', 'active')
            ->latest('cataloged_at')
            ->limit(4)
            ->get() : collect();

        $stats = [
            'total_titles'  => \App\Models\Tenant\BibliographicRecord::where('record_status', 'active')->count(),
            'total_digital' => \App\Models\Tenant\DigitalResource::count(),
            'total_patrons' => \App\Models\Tenant\Patron::where('status', 'active')->count(),
        ];

        // "Browse by Format" collections — real material types that have items,
        // with live counts. Empty formats are skipped so the grid reflects the data.
        $collections = \App\Models\Tenant\MaterialType::query()
            ->where('is_active', true)
            ->withCount(['bibliographicRecords as count' => fn ($q) => $q->where('record_status', 'active')])
            ->orderBy('sort_order')
            ->get()
            ->filter(fn ($mt) => $mt->count > 0)
            ->map(fn ($mt) => [
                'code'             => $mt->code,
                'name'             => $mt->name,
                'count'            => $mt->count,
                'material_type_id' => $mt->id,
            ])
            ->values();

        return Inertia::render('Opac/Home', compact('ebooks', 'epublications', 'audio', 'video', 'theses', 'stats', 'collections'));
    }

    public function search(Request $request): Response
    {
        $query   = (string) ($request->get('q') ?? '');
        $filters = $request->only(['material_type_id', 'language', 'year_from', 'year_to', 'availability', 'sort', 'subject']);

        $results = $this->catalogService->searchCatalog($query, $filters, perPage: 20);

        $materialTypes = \App\Models\Tenant\MaterialType::where('is_active', true)->orderBy('sort_order')->get();

        // Facet counts (based on full result set without pagination)
        $base = \App\Models\Tenant\BibliographicRecord::where('record_status', 'active');

        $typeCounts = (clone $base)
            ->selectRaw('material_type_id, COUNT(*) as count')
            ->groupBy('material_type_id')
            ->pluck('count', 'material_type_id');

        $langCounts = (clone $base)
            ->selectRaw('language, COUNT(*) as count')
            ->whereNotNull('language')
            ->groupBy('language')
            ->pluck('count', 'language');

        $yearRange = (clone $base)
            ->selectRaw('MIN(publication_year) as min_year, MAX(publication_year) as max_year')
            ->whereNotNull('publication_year')
            ->first();

        // Top subjects — cast json→jsonb so jsonb_array_elements works regardless of column type
        $subjectCounts = collect(\Illuminate\Support\Facades\DB::select("
            SELECT subj->>'term' as term, COUNT(*) as count
            FROM bibliographic_records,
                 jsonb_array_elements(subjects::jsonb) AS subj
            WHERE record_status = 'active'
              AND subjects IS NOT NULL
              AND subjects::text != 'null'
              AND subjects::text != '[]'
              AND subj->>'term' IS NOT NULL
              AND subj->>'term' != ''
            GROUP BY term
            ORDER BY count DESC
            LIMIT 20
        "))->mapWithKeys(fn($r) => [$r->term => (int) $r->count]);

        return Inertia::render('Opac/Search', [
            'results'       => $results,
            'query'         => $query,
            'filters'       => $filters,
            'materialTypes' => $materialTypes,
            'facets'        => [
                'typeCounts'    => $typeCounts,
                'langCounts'    => $langCounts,
                'subjectCounts' => $subjectCounts,
                'yearMin'       => $yearRange?->min_year,
                'yearMax'       => $yearRange?->max_year,
            ],
        ]);
    }

    public function show(Request $request, string $id): Response
    {
        // Explicitly get {id} from route to avoid slug/id parameter confusion
        $recordId = $request->route('id', $id);

        $record = \App\Models\Tenant\BibliographicRecord::with([
            'materialType',
            'physicalItems.location',
            'physicalItems.collection',
            'digitalResources',
        ])->findOrFail($recordId);

        $related = \App\Models\Tenant\BibliographicRecord::query()
            ->where('material_type_id', $record->material_type_id)
            ->where('id', '!=', $record->id)
            ->where('record_status', 'active')
            ->limit(6)
            ->get();

        $videoUrl = null;
        if ($record->materialType?->code === 'video' && $record->digitalResources->isNotEmpty()) {
            try {
                $videoUrl = $this->assetService->signedUrl($record->digitalResources->first(), expiryMinutes: 120);
            } catch (\Exception) {
                // Local disk doesn't support signed URLs; frontend falls back to /storage path
            }
        }

        return Inertia::render('Opac/Record', compact('record', 'related', 'videoUrl'));
    }

    public function citation(Request $request, string $id, string $format): \Illuminate\Http\Response
    {
        $record = \App\Models\Tenant\BibliographicRecord::findOrFail($request->route('id', $id));
        $authors = collect($record->authors ?? [])->pluck('name')->toArray();
        $year    = $record->publication_year ?? 'n.d.';

        $text = match ($format) {
            'apa' => $this->formatApa($record, $authors, $year),
            'mla' => $this->formatMla($record, $authors, $year),
            'chicago' => $this->formatChicago($record, $authors, $year),
            'bibtex' => $this->formatBibtex($record, $authors),
            'ris'    => $this->formatRis($record, $authors),
            default  => abort(400, 'Unknown citation format.'),
        };

        $mimeType = in_array($format, ['bibtex']) ? 'application/x-bibtex'
            : (in_array($format, ['ris']) ? 'application/x-research-info-systems' : 'text/plain');
        $ext = match($format) { 'bibtex' => 'bib', 'ris' => 'ris', default => 'txt' };

        return response($text, 200, [
            'Content-Type'        => $mimeType . '; charset=utf-8',
            'Content-Disposition' => "attachment; filename=\"citation.{$ext}\"",
        ]);
    }

    private function formatApa(\App\Models\Tenant\BibliographicRecord $r, array $authors, $year): string
    {
        $authorStr = $this->apaAuthors($authors);
        $title     = $r->title . ($r->subtitle ? ': ' . $r->subtitle : '');
        $pub       = implode(array_filter([$r->publisher_place, $r->publisher]), ', ');
        return "{$authorStr} ({$year}). {$title}." . ($pub ? " {$pub}." : '');
    }

    private function formatMla(\App\Models\Tenant\BibliographicRecord $r, array $authors, $year): string
    {
        $authorStr = count($authors) === 0 ? '' : (count($authors) === 1 ? $authors[0] : $authors[0] . ', et al');
        $title     = "\"{$r->title}" . ($r->subtitle ? ': ' . $r->subtitle : '') . "\"";
        $pub       = implode(array_filter([$r->publisher, (string)$year]), ', ');
        return ($authorStr ? $authorStr . '. ' : '') . "{$title}." . ($pub ? " {$pub}." : '');
    }

    private function formatChicago(\App\Models\Tenant\BibliographicRecord $r, array $authors, $year): string
    {
        $authorStr = count($authors) === 0 ? '' : implode(', ', $authors);
        $title     = $r->title . ($r->subtitle ? ': ' . $r->subtitle : '');
        $pub       = implode(array_filter([$r->publisher_place, $r->publisher], fn($v) => !empty($v)), ': ');
        return ($authorStr ? $authorStr . '. ' : '') . "\"{$title}.\"" . ($pub ? " {$pub}," : '') . " {$year}.";
    }

    private function formatBibtex(\App\Models\Tenant\BibliographicRecord $r, array $authors): string
    {
        $key  = strtolower(preg_replace('/\s+/', '', $authors[0] ?? 'unknown')) . ($r->publication_year ?? '');
        $type = in_array($r->materialType?->code ?? '', ['article']) ? 'article' : 'book';
        $fields = [
            'title'     => $r->title . ($r->subtitle ? ': ' . $r->subtitle : ''),
            'author'    => implode(' and ', $authors),
            'year'      => (string)($r->publication_year ?? ''),
            'publisher' => $r->publisher ?? '',
            'address'   => $r->publisher_place ?? '',
            'isbn'      => $r->isbn ?? '',
        ];
        $body = '';
        foreach ($fields as $k => $v) {
            if ($v !== '') $body .= "  {$k} = {{$v}},\n";
        }
        return "@{$type}{{$key},\n{$body}}\n";
    }

    private function formatRis(\App\Models\Tenant\BibliographicRecord $r, array $authors): string
    {
        $type = in_array($r->materialType?->code ?? '', ['article']) ? 'JOUR' : 'BOOK';
        $lines = ["TY  - {$type}"];
        foreach ($authors as $a) $lines[] = "AU  - {$a}";
        $lines[] = "TI  - {$r->title}" . ($r->subtitle ? ': ' . $r->subtitle : '');
        if ($r->publication_year) $lines[] = "PY  - {$r->publication_year}";
        if ($r->publisher)        $lines[] = "PB  - {$r->publisher}";
        if ($r->publisher_place)  $lines[] = "CY  - {$r->publisher_place}";
        if ($r->isbn)             $lines[] = "SN  - {$r->isbn}";
        if ($r->doi)              $lines[] = "DO  - {$r->doi}";
        $lines[] = "ER  - ";
        return implode("\r\n", $lines) . "\r\n";
    }

    private function apaAuthors(array $names): string
    {
        if (empty($names)) return '';
        $formatted = array_map(function ($name) {
            $parts = explode(' ', trim($name));
            $last  = array_pop($parts);
            $initials = implode('. ', array_map(fn($p) => strtoupper($p[0] ?? ''), $parts)) . ($parts ? '.' : '');
            return "{$last}, {$initials}";
        }, $names);
        if (count($formatted) > 7) {
            return implode(', ', array_slice($formatted, 0, 6)) . ', ... ' . end($names);
        }
        return count($formatted) === 1 ? $formatted[0] : implode(', & ', [implode(', ', array_slice($formatted, 0, -1)), end($formatted)]);
    }

    public function isbnLookup(string $isbn): \Illuminate\Http\JsonResponse
    {
        $data = $this->catalogService->lookupByISBN($isbn);

        if (! $data) {
            return response()->json(['message' => 'No data found for this ISBN.'], 404);
        }

        return response()->json($data);
    }
}
