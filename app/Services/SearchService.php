<?php

namespace App\Services;

use App\Models\Tenant\BibliographicRecord;
use App\Models\Tenant\MaterialType;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class SearchService
{
    /**
     * Full-text catalog search with faceted filtering.
     *
     * @param  array{
     *   sort?: string,
     *   material_type_id?: int,
     *   language?: string,
     *   year_from?: int,
     *   year_to?: int,
     *   availability?: string,
     * } $filters
     */
    public function search(string $query, array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        $q = BibliographicRecord::query()
            ->with(['materialType', 'physicalItems', 'digitalResources'])
            ->where('record_status', 'active');

        if ($query !== '') {
            if (DB::getDriverName() === 'pgsql') {
                $q->whereRaw(
                    "search_vector @@ plainto_tsquery('english', ?)",
                    [$query]
                )->orderByRaw(
                    "ts_rank(search_vector, plainto_tsquery('english', ?)) DESC",
                    [$query]
                );
            } else {
                // SQLite fallback: simple LIKE on title/abstract
                $q->where(function ($w) use ($query) {
                    $w->where('title', 'like', "%{$query}%")
                      ->orWhere('abstract', 'like', "%{$query}%")
                      ->orWhereRaw("LOWER(authors) LIKE ?", ['%' . strtolower($query) . '%'])
                      ->orWhere('isbn', 'like', "%{$query}%");
                });
            }
        }

        $this->applyFacets($q, $filters);
        $this->applySort($q, $filters['sort'] ?? 'relevance', $query);

        return $q->paginate($perPage)->withQueryString();
    }

    /**
     * Return available facet counts for the current query result set.
     * Used to populate sidebar filter counts.
     *
     * @return array{material_types: array, languages: array, years: array}
     */
    public function facetCounts(string $query, array $activeFilters = []): array
    {
        $base = BibliographicRecord::query()->where('record_status', 'active');

        if ($query !== '' && DB::getDriverName() === 'pgsql') {
            $base->whereRaw("search_vector @@ plainto_tsquery('english', ?)", [$query]);
        } elseif ($query !== '') {
            $base->where(function ($w) use ($query) {
                $w->where('title', 'like', "%{$query}%")
                  ->orWhere('abstract', 'like', "%{$query}%");
            });
        }

        // Material type counts
        $materialTypes = (clone $base)
            ->select('material_type_id', DB::raw('count(*) as total'))
            ->whereNotNull('material_type_id')
            ->groupBy('material_type_id')
            ->with('materialType')
            ->get()
            ->map(fn ($r) => [
                'id'    => $r->material_type_id,
                'name'  => $r->materialType?->name ?? 'Unknown',
                'count' => $r->total,
            ])
            ->values()
            ->toArray();

        // Language counts
        $languages = (clone $base)
            ->select('language', DB::raw('count(*) as total'))
            ->whereNotNull('language')
            ->groupBy('language')
            ->orderByDesc('total')
            ->get()
            ->map(fn ($r) => ['code' => $r->language, 'count' => $r->total])
            ->values()
            ->toArray();

        // Year range (min/max only)
        $yearRange = (clone $base)
            ->selectRaw('MIN(publication_year) as min_year, MAX(publication_year) as max_year')
            ->whereNotNull('publication_year')
            ->first();

        return [
            'material_types' => $materialTypes,
            'languages'      => $languages,
            'year_min'       => $yearRange?->min_year,
            'year_max'       => $yearRange?->max_year,
        ];
    }

    /**
     * Suggest completions for the search bar (autocomplete).
     * Returns up to 8 matching titles/authors.
     */
    public function suggest(string $query, int $limit = 8): array
    {
        if (strlen($query) < 2) {
            return [];
        }

        return BibliographicRecord::query()
            ->where('record_status', 'active')
            ->where('title', 'like', "%{$query}%")
            ->select('id', 'title', 'material_type_id')
            ->with('materialType:id,name')
            ->limit($limit)
            ->get()
            ->map(fn ($r) => [
                'id'    => $r->id,
                'title' => $r->title,
                'type'  => $r->materialType?->name,
            ])
            ->toArray();
    }

    // ─── Private helpers ─────────────────────────────────────────────────────

    private function applyFacets($query, array $filters): void
    {
        if (! empty($filters['material_type_id'])) {
            $query->where('material_type_id', $filters['material_type_id']);
        }
        if (! empty($filters['language'])) {
            $query->where('language', $filters['language']);
        }
        if (! empty($filters['year_from'])) {
            $query->where('publication_year', '>=', $filters['year_from']);
        }
        if (! empty($filters['year_to'])) {
            $query->where('publication_year', '<=', $filters['year_to']);
        }
        if (! empty($filters['availability'])) {
            match ($filters['availability']) {
                'available' => $query->whereHas('physicalItems', fn ($i) => $i->where('item_status', 'available')),
                'digital'   => $query->whereHas('digitalResources'),
                default     => null,
            };
        }
    }

    private function applySort($query, string $sort, string $rawQuery): void
    {
        match ($sort) {
            'title'     => $query->orderBy('title'),
            'year_desc' => $query->orderByDesc('publication_year'),
            'year_asc'  => $query->orderBy('publication_year'),
            default     => $query->latest('cataloged_at'),
        };
    }
}
