<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\CatalogService;
use App\Services\Search\HybridSearchService;
use App\Models\Tenant\BibliographicRecord;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CatalogApiController extends Controller
{
    public function __construct(private readonly CatalogService $catalogService) {}

    public function index(Request $request): JsonResponse
    {
        $results = $this->catalogService->searchCatalog(
            query: $request->get('q', ''),
            filters: $request->only(['material_type_id', 'language', 'year_from', 'year_to', 'availability', 'sort']),
            perPage: (int) $request->get('per_page', 20),
        );

        return response()->json($results);
    }

    public function show(string $id): JsonResponse
    {
        $record = BibliographicRecord::with([
            'materialType',
            'physicalItems.location',
            'physicalItems.collection',
            'digitalResources',
        ])->findOrFail($id);

        return response()->json($record);
    }

    public function isbnLookup(string $isbn): JsonResponse
    {
        $data = $this->catalogService->lookupByISBN($isbn);

        return $data
            ? response()->json($data)
            : response()->json(['message' => 'Not found'], 404);
    }

    /**
     * Search catalog (supports both keyword and semantic search)
     */
    public function search(Request $request): JsonResponse
    {
        $hybridSearch = app(HybridSearchService::class);

        $results = $hybridSearch->search(
            query: $request->get('q', ''),
            filters: $request->only(['material_type', 'language', 'year_from', 'year_to', 'subjects']),
            page: (int) $request->get('page', 1),
            perPage: (int) $request->get('per_page', 20)
        );

        return response()->json($results);
    }

    /**
     * Get BIBFRAME JSON-LD for a record
     */
    public function bibframe(string $id): JsonResponse
    {
        $record = BibliographicRecord::with(['work.contributions.agent', 'physicalItems'])
            ->findOrFail($id);

        $bibframe = $record->toBibframeInstanceJsonLd();

        return response()->json($bibframe);
    }

    /**
     * Get MARC21 XML for a record
     */
    public function marc(string $id)
    {
        $record = BibliographicRecord::findOrFail($id);

        if (!$record->marc_xml) {
            return response()->json([
                'message' => 'MARC21 data not available for this record'
            ], 404);
        }

        return response($record->marc_xml, 200)
            ->header('Content-Type', 'application/xml');
    }

    /**
     * Get Dublin Core metadata for a record
     */
    public function dublinCore(string $id): JsonResponse
    {
        $record = BibliographicRecord::findOrFail($id);

        $dublinCore = $record->marcToDublinCore();

        return response()->json($dublinCore);
    }

    /**
     * Find similar records using vector similarity
     */
    public function similar(string $id): JsonResponse
    {
        $record = BibliographicRecord::findOrFail($id);

        $hybridSearch = app(HybridSearchService::class);
        $similar = $hybridSearch->findSimilar($record, limit: 5);

        return response()->json([
            'similar' => $similar->map(function ($item) {
                return [
                    'id' => $item->id,
                    'title' => $item->title,
                    'authors' => $item->authors,
                    'publication_year' => $item->publication_year,
                    'similarity' => $item->similarity ?? 0,
                ];
            })
        ]);
    }

    /**
     * Semantic search endpoint
     */
    public function semanticSearch(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'query' => 'required|string|min:3',
            'limit' => 'nullable|integer|min:1|max:50',
        ]);

        $hybridSearch = app(HybridSearchService::class);

        $results = $hybridSearch->search(
            query: $validated['query'],
            filters: [],
            page: 1,
            perPage: $validated['limit'] ?? 10
        );

        return response()->json($results);
    }
}
