<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\CatalogService;
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
}
