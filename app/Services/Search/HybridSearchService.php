<?php

namespace App\Services\Search;

use App\Models\Tenant\BibliographicRecord;
use App\Models\Central\PlatformSetting;
use App\Models\Tenant\LibrarySetting;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;
use Illuminate\Pagination\LengthAwarePaginator;

class HybridSearchService
{
    /**
     * Perform hybrid search (tsvector + pgvector) with automatic fallback
     */
    public function search(
        string $query,
        array $filters = [],
        int $page = 1,
        int $perPage = 20
    ): LengthAwarePaginator {
        // Check if semantic search is available and enabled
        $hasVectorSupport = $this->hasVectorSupport();
        $semanticEnabled = PlatformSetting::get('enable_semantic_search', false);

        if ($hasVectorSupport && $semanticEnabled) {
            try {
                return $this->hybridSearch($query, $filters, $page, $perPage);
            } catch (\Exception $e) {
                Log::warning('Hybrid search failed, falling back to tsvector', [
                    'error' => $e->getMessage(),
                    'query' => $query
                ]);
                return $this->tsvectorSearch($query, $filters, $page, $perPage);
            }
        }

        // Fallback to pure tsvector search
        return $this->tsvectorSearch($query, $filters, $page, $perPage);
    }

    /**
     * Hybrid search combining tsvector (keyword) + pgvector (semantic)
     */
    private function hybridSearch(
        string $query,
        array $filters,
        int $page,
        int $perPage
    ): LengthAwarePaginator {
        // Get query embedding
        $queryEmbedding = $this->getQueryEmbedding($query);

        if (!$queryEmbedding) {
            // Embedding generation failed, fallback to tsvector
            return $this->tsvectorSearch($query, $filters, $page, $perPage);
        }

        // Get weights from settings
        $tsvectorWeight = (float) PlatformSetting::get('search_tsvector_weight', 0.4);
        $vectorWeight = (float) PlatformSetting::get('search_vector_weight', 0.6);

        // Get search language config
        $language = $this->getSearchLanguage();

        $queryBuilder = BibliographicRecord::query()
            ->select([
                'bibliographic_records.*',
                DB::raw("ts_rank(search_vector, plainto_tsquery('{$language}', ?)) AS ts_score"),
                DB::raw("1 - (embedding <=> ?::vector) AS vector_score"),
                DB::raw("(
                    (ts_rank(search_vector, plainto_tsquery('{$language}', ?)) * ?) +
                    ((1 - (embedding <=> ?::vector)) * ?)
                ) AS relevance_score")
            ])
            ->whereNotNull('embedding')
            ->setBindings([
                $query, // ts_rank binding
                json_encode($queryEmbedding), // vector distance binding
                $query, // weighted ts_rank
                $tsvectorWeight,
                json_encode($queryEmbedding), // weighted vector
                $vectorWeight
            ]);

        // Apply filters
        $this->applyFilters($queryBuilder, $filters);

        // Order by hybrid relevance
        $queryBuilder->orderByDesc('relevance_score');

        return $queryBuilder->paginate($perPage, ['*'], 'page', $page);
    }

    /**
     * Pure tsvector (keyword) search - fallback method
     */
    private function tsvectorSearch(
        string $query,
        array $filters,
        int $page,
        int $perPage
    ): LengthAwarePaginator {
        // Use existing SearchService for tsvector
        $searchService = app(\App\Services\SearchService::class);

        return $searchService->search(
            $query,
            $filters,
            $perPage,
            'relevance',
            $page
        );
    }

    /**
     * Get query embedding from API (synchronous for real-time search)
     */
    private function getQueryEmbedding(string $query): ?array
    {
        $provider = PlatformSetting::get('embedding_provider', 'openai');

        try {
            if ($provider === 'openai') {
                return $this->fetchOpenAIEmbedding($query);
            } elseif ($provider === 'gemini') {
                return $this->fetchGeminiEmbedding($query);
            }
        } catch (\Exception $e) {
            Log::warning('Query embedding failed', [
                'query' => $query,
                'error' => $e->getMessage()
            ]);
            return null;
        }

        return null;
    }

    /**
     * Fetch embedding from OpenAI
     */
    private function fetchOpenAIEmbedding(string $text): array
    {
        $apiKey = PlatformSetting::get('embedding_api_key');

        if (empty($apiKey)) {
            throw new \Exception('OpenAI API key not configured');
        }

        $model = PlatformSetting::get('embedding_model', 'text-embedding-3-small');
        $url = PlatformSetting::get('embedding_api_url', 'https://api.openai.com/v1/embeddings');

        $response = Http::withHeaders([
            'Authorization' => "Bearer {$apiKey}",
            'Content-Type' => 'application/json',
        ])->timeout(10)->post($url, [
            'input' => $text,
            'model' => $model,
        ]);

        if (!$response->successful()) {
            throw new \Exception('OpenAI API error: ' . $response->status());
        }

        $data = $response->json();
        return $data['data'][0]['embedding'] ?? [];
    }

    /**
     * Fetch embedding from Google Gemini
     */
    private function fetchGeminiEmbedding(string $text): array
    {
        $apiKey = PlatformSetting::get('embedding_api_key');

        if (empty($apiKey)) {
            throw new \Exception('Gemini API key not configured');
        }

        $model = PlatformSetting::get('embedding_model', 'embedding-001');

        $response = Http::timeout(10)->post(
            "https://generativelanguage.googleapis.com/v1/models/{$model}:embedContent?key={$apiKey}",
            [
                'content' => [
                    'parts' => [
                        ['text' => $text]
                    ]
                ]
            ]
        );

        if (!$response->successful()) {
            throw new \Exception('Gemini API error: ' . $response->status());
        }

        $data = $response->json();
        return $data['embedding']['values'] ?? [];
    }

    /**
     * Apply filters to query builder
     */
    private function applyFilters($query, array $filters): void
    {
        if (isset($filters['material_type'])) {
            $query->where('material_type_id', $filters['material_type']);
        }

        if (isset($filters['language'])) {
            $query->where('language', $filters['language']);
        }

        if (isset($filters['year_from'])) {
            $query->where('publication_year', '>=', $filters['year_from']);
        }

        if (isset($filters['year_to'])) {
            $query->where('publication_year', '<=', $filters['year_to']);
        }

        if (isset($filters['subjects']) && is_array($filters['subjects'])) {
            foreach ($filters['subjects'] as $subject) {
                $query->whereJsonContains('subjects', [['term' => $subject]]);
            }
        }
    }

    /**
     * Get search language from tenant settings
     */
    private function getSearchLanguage(): string
    {
        $language = LibrarySetting::get('search_language', 'english');

        // Map to PostgreSQL text search config
        $langMap = [
            'english' => 'english',
            'khmer' => 'simple', // Khmer not supported by pg, use simple
            'french' => 'french',
            'spanish' => 'spanish',
            'german' => 'german',
        ];

        return $langMap[$language] ?? 'english';
    }

    /**
     * Check if vector support is available
     */
    private function hasVectorSupport(): bool
    {
        if (DB::getDriverName() !== 'pgsql') {
            return false;
        }

        try {
            return Schema::hasColumn('bibliographic_records', 'embedding');
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Find similar records by vector similarity
     */
    public function findSimilar(
        BibliographicRecord $record,
        int $limit = 5
    ): \Illuminate\Support\Collection {
        if (!$this->hasVectorSupport() || !$record->embedding) {
            return collect();
        }

        return BibliographicRecord::query()
            ->select('*')
            ->selectRaw('1 - (embedding <=> ?::vector) AS similarity', [
                json_encode($record->embedding)
            ])
            ->whereNotNull('embedding')
            ->where('id', '!=', $record->id)
            ->orderByDesc('similarity')
            ->limit($limit)
            ->get();
    }
}
