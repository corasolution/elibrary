<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\CatalogAIService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AICatalogController extends Controller
{
    public function __construct(private CatalogAIService $ai) {}

    /**
     * AI classify record - suggest DDC and LCC codes
     *
     * @return JsonResponse
     */
    public function classify(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:500',
            'subtitle' => 'nullable|string|max:500',
            'abstract' => 'nullable|string',
            'subjects' => 'nullable|array',
            'subjects.*.term' => 'string',
            'authors' => 'nullable|array',
            'authors.*.name' => 'string',
            'publisher' => 'nullable|string',
            'publication_year' => 'nullable|integer',
        ]);

        $result = $this->ai->classifyRecord($validated);

        return response()->json($result);
    }

    /**
     * AI generate abstract from OCR text
     *
     * @return JsonResponse
     */
    public function generateAbstract(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ocr_text' => 'required|string|min:100',
            'title' => 'nullable|string',
            'authors' => 'nullable|array',
        ]);

        $result = $this->ai->generateAbstract($validated['ocr_text'], [
            'title' => $validated['title'] ?? '',
            'authors' => $validated['authors'] ?? [],
        ]);

        if (!$result) {
            return response()->json([
                'error' => 'Failed to generate abstract',
            ], 500);
        }

        return response()->json($result);
    }

    /**
     * AI extract subject headings
     *
     * @return JsonResponse
     */
    public function extractSubjects(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string',
            'abstract' => 'nullable|string',
        ]);

        $result = $this->ai->extractSubjects($validated);

        if (!$result) {
            return response()->json([
                'error' => 'Failed to extract subjects',
            ], 500);
        }

        return response()->json($result);
    }

    /**
     * AI translate text to Khmer
     *
     * @return JsonResponse
     */
    public function translateKhmer(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'text' => 'required|string|max:5000',
        ]);

        $result = $this->ai->translateToKhmer($validated['text']);

        if (!$result) {
            return response()->json([
                'error' => 'Translation failed',
            ], 500);
        }

        return response()->json($result);
    }

    /**
     * AI extract keywords
     *
     * @return JsonResponse
     */
    public function extractKeywords(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string',
            'abstract' => 'nullable|string',
        ]);

        $result = $this->ai->extractKeywords($validated);

        if (!$result) {
            return response()->json([
                'error' => 'Failed to extract keywords',
            ], 500);
        }

        return response()->json($result);
    }
}
