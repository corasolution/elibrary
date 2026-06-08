<?php

namespace App\Http\Controllers\Opac;

use App\Http\Controllers\Controller;
use App\Services\CatalogAIService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

/**
 * AI-powered search features for public OPAC
 * No authentication required - available to all library visitors
 */
class OpacAIController extends Controller
{
    public function __construct(private CatalogAIService $ai) {}

    /**
     * Parse natural language search query
     *
     * Converts queries like "books about cooking published after 2020"
     * into structured search parameters
     *
     * @return JsonResponse
     */
    public function parseQuery(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'query' => 'required|string|max:500',
        ]);

        $result = $this->ai->parseNaturalLanguageQuery($validated['query']);

        if (!$result) {
            return response()->json([
                'error' => 'Failed to parse query',
                'fallback' => ['query' => $validated['query'], 'filters' => []],
            ], 500);
        }

        return response()->json($result);
    }

    /**
     * Expand search query with related terms
     *
     * Helps users find more results by suggesting related terms
     * Example: "AI" → ["artificial intelligence", "machine learning", "neural networks"]
     *
     * @return JsonResponse
     */
    public function expandQuery(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'query' => 'required|string|max:200',
        ]);

        $result = $this->ai->expandSearchQuery($validated['query']);

        if (!$result) {
            return response()->json([
                'error' => 'Failed to expand query',
                'fallback' => ['original' => $validated['query'], 'expanded_terms' => []],
            ], 500);
        }

        return response()->json($result);
    }

    /**
     * Generate search autocomplete suggestions
     *
     * @return JsonResponse
     */
    public function suggest(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'query' => 'required|string|min:3|max:100',
            'recent' => 'nullable|array|max:5', // Recent searches for context
        ]);

        $result = $this->ai->generateSearchSuggestions(
            $validated['query'],
            ['recent' => $validated['recent'] ?? []]
        );

        if (!$result) {
            return response()->json([
                'suggestions' => [],
            ]);
        }

        return response()->json($result);
    }
}
