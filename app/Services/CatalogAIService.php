<?php

namespace App\Services;

class CatalogAIService
{
    /** Resolved AI provider for cataloging + search features (Gemini or Claude). */
    private \App\Services\AI\AiTextService $gemini;

    public function __construct()
    {
        $this->gemini = app(\App\Services\AI\AiManager::class)->for('cataloging');
    }

    /**
     * Read a book-cover photo with an AI vision model and extract structured
     * bibliographic data. Returns a record shaped to match the catalog form's
     * import handler (title, authors, publisher, …), plus 'metadata'.
     *
     * @param string $base64Image Raw base64 (no data: prefix)
     * @param string $mime        e.g. 'image/jpeg'
     * @return array|null
     */
    public function extractFromCover(string $base64Image, string $mime): ?array
    {
        $prompt = <<<PROMPT
You are an expert library cataloger. The attached image is a photograph of a book cover (or title page).
Read every visible word and extract the bibliographic details.

Output ONLY valid JSON in exactly this shape (omit a field or use null/[] if you cannot read it — never guess):
```json
{
  "title": "main title",
  "subtitle": "subtitle if present",
  "authors": [{"name": "Author Name", "role": "aut"}],
  "publisher": "publisher if printed",
  "publication_year": 2008,
  "edition": "edition statement if printed",
  "language": "ISO 639-1 code of the title language, e.g. en or km",
  "series_title": "series if printed",
  "isbn": "ISBN only if clearly printed on the cover",
  "subjects": [{"term": "Subject Heading", "scheme": "LCSH"}]
}
```
Rules:
- Preserve the original script (e.g. keep Khmer text in Khmer).
- "authors" role is always "aut".
- publication_year must be an integer or null.
- Do not include any text outside the JSON.
PROMPT;

        $result = $this->gemini->generateFromImage($prompt, $base64Image, $mime, [
            'cache_key'         => 'ai:cover:' . md5($base64Image),
            'cache_ttl'         => 30 * 24 * 60, // 30 days
            'temperature'       => 0.1,
            'max_output_tokens' => 768,
            'feature'           => 'cover_scan',
        ]);

        if (! $result || ! $result['text']) {
            return null;
        }

        $parsed = $this->gemini->parseJsonResponse($result['text']);

        if (! $parsed || empty($parsed['title'])) {
            return null;
        }

        // Normalize to the catalog form import shape.
        $authors = collect($parsed['authors'] ?? [])
            ->map(fn ($a) => is_array($a)
                ? ['name' => trim($a['name'] ?? ''), 'role' => $a['role'] ?? 'aut']
                : ['name' => trim((string) $a), 'role' => 'aut'])
            ->filter(fn ($a) => $a['name'] !== '')
            ->values()
            ->all();

        $subjects = collect($parsed['subjects'] ?? [])
            ->map(fn ($s) => is_array($s)
                ? ['term' => trim($s['term'] ?? ''), 'scheme' => $s['scheme'] ?? 'LCSH']
                : ['term' => trim((string) $s), 'scheme' => 'LCSH'])
            ->filter(fn ($s) => $s['term'] !== '')
            ->values()
            ->all();

        return [
            'title'            => $parsed['title'] ?? null,
            'subtitle'         => $parsed['subtitle'] ?? null,
            'authors'          => $authors,
            'publisher'        => $parsed['publisher'] ?? null,
            'publication_year' => isset($parsed['publication_year']) ? (int) $parsed['publication_year'] : null,
            'edition'          => $parsed['edition'] ?? null,
            'language'         => $parsed['language'] ?? null,
            'series_title'     => $parsed['series_title'] ?? null,
            'isbn'             => $parsed['isbn'] ?? null,
            'subjects'         => $subjects,
            'metadata'         => $result['metadata'],
        ];
    }

    /**
     * Suggest DDC and LCC classifications based on bibliographic metadata
     *
     * @param array $data Bibliographic data (title, abstract, subjects, etc.)
     * @return array ['ddc' => [...], 'lcc' => [...], 'metadata' => [...]] or error
     */
    public function classifyRecord(array $data): array
    {
        $cacheKey = "ai:classify:" . md5(json_encode([
            $data['title'] ?? '',
            $data['abstract'] ?? '',
            $data['subjects'] ?? [],
        ]));

        $prompt = $this->buildClassificationPrompt($data);

        $result = $this->gemini->generateContent($prompt, [
            'cache_key' => $cacheKey,
            'cache_ttl' => 90 * 24 * 60, // 90 days
            'temperature' => 0.2, // Low for consistency
            'max_output_tokens' => 512,
            'feature' => 'ddc_lcc_classification',
        ]);

        if (!$result || !$result['text']) {
            return [
                'ddc' => null,
                'lcc' => null,
                'error' => 'API request failed',
            ];
        }

        $parsed = $this->gemini->parseJsonResponse($result['text']);

        if (!$parsed || !isset($parsed['ddc']) || !isset($parsed['lcc'])) {
            return [
                'ddc' => null,
                'lcc' => null,
                'error' => 'Invalid response format',
            ];
        }

        return [
            'ddc' => [
                'code' => $parsed['ddc']['code'] ?? null,
                'label' => $parsed['ddc']['label'] ?? null,
                'confidence' => $parsed['ddc']['confidence'] ?? 0,
            ],
            'lcc' => [
                'code' => $parsed['lcc']['code'] ?? null,
                'label' => $parsed['lcc']['label'] ?? null,
                'confidence' => $parsed['lcc']['confidence'] ?? 0,
            ],
            'metadata' => $result['metadata'],
        ];
    }

    /**
     * Build classification prompt for DDC/LCC suggestion
     */
    private function buildClassificationPrompt(array $data): string
    {
        $title = $data['title'] ?? 'Untitled';
        $subtitle = $data['subtitle'] ?? '';
        $abstract = $data['abstract'] ?? '';
        $subjects = collect($data['subjects'] ?? [])->pluck('term')->implode(', ');
        $authors = collect($data['authors'] ?? [])->pluck('name')->implode(', ');
        $publisher = $data['publisher'] ?? '';
        $year = $data['publication_year'] ?? '';

        return <<<PROMPT
You are an expert library cataloger specializing in Dewey Decimal Classification (DDC) and Library of Congress Classification (LCC).

Based on the following bibliographic information, suggest the most appropriate classification codes with confidence scores (0.0-1.0):

**Title:** {$title}
**Subtitle:** {$subtitle}
**Authors:** {$authors}
**Publisher:** {$publisher}
**Year:** {$year}
**Abstract:** {$abstract}
**Subjects:** {$subjects}

**Instructions:**
1. Analyze the content, subject matter, and discipline
2. Suggest ONE DDC code (Dewey Decimal, e.g., "005.133" for Java programming)
3. Suggest ONE LCC code (Library of Congress, e.g., "QA76.73.J38" for Java programming)
4. Provide confidence score 0.0-1.0 for each (1.0 = very confident, 0.5 = uncertain)
5. Include brief label explaining the classification

**Output ONLY valid JSON in this exact format:**
```json
{
  "ddc": {
    "code": "005.133",
    "label": "Programming in Java",
    "confidence": 0.95
  },
  "lcc": {
    "code": "QA76.73.J38",
    "label": "Computer Science - Java Programming Language",
    "confidence": 0.92
  }
}
```

Do not include any explanatory text outside the JSON.
PROMPT;
    }

    /**
     * Generate professional abstract from OCR text or metadata
     *
     * @param string $ocrText Extracted text from document
     * @param array $metadata Additional context (title, authors)
     * @return array|null ['abstract' => string, 'metadata' => array]
     */
    public function generateAbstract(string $ocrText, array $metadata = []): ?array
    {
        $sampleText = mb_substr($ocrText, 0, 3000); // First 3000 chars
        $cacheKey = "ai:abstract:" . md5($sampleText);

        $title = $metadata['title'] ?? '';
        $authors = collect($metadata['authors'] ?? [])->pluck('name')->implode(', ');

        $prompt = <<<PROMPT
You are a professional library cataloger creating abstracts for catalog records.

Based on the following information, write a concise, professional abstract (100-200 words):

**Title:** {$title}
**Authors:** {$authors}
**Text Sample (from OCR):**
{$sampleText}

**Instructions:**
1. Summarize the main topics, themes, and content
2. Use third-person, objective tone
3. Focus on what the resource is ABOUT, not its structure
4. 100-200 words maximum
5. Return ONLY the abstract text, no JSON, no explanations

Abstract:
PROMPT;

        $result = $this->gemini->generateContent($prompt, [
            'cache_key' => $cacheKey,
            'cache_ttl' => 90 * 24 * 60,
            'temperature' => 0.3,
            'max_output_tokens' => 512,
            'feature' => 'abstract_generation',
        ]);

        return $result ? [
            'abstract' => trim($result['text']),
            'metadata' => $result['metadata'],
        ] : null;
    }

    /**
     * Extract subject headings (LCSH-compatible) from bibliographic data
     *
     * @param array $data Bibliographic data (title, abstract)
     * @return array|null ['subjects' => array, 'metadata' => array]
     */
    public function extractSubjects(array $data): ?array
    {
        $cacheKey = "ai:subjects:" . md5(json_encode([
            $data['title'] ?? '',
            $data['abstract'] ?? '',
        ]));

        $title = $data['title'] ?? '';
        $abstract = $data['abstract'] ?? '';

        $prompt = <<<PROMPT
You are a library cataloger specializing in subject analysis using Library of Congress Subject Headings (LCSH).

Based on this bibliographic information, suggest 3-7 appropriate subject headings:

**Title:** {$title}
**Abstract:** {$abstract}

**Instructions:**
1. Identify main topics and concepts
2. Use LCSH-compatible terminology (topical, geographic, chronological, form/genre)
3. Order by relevance (most important first)
4. Return 3-7 subject headings
5. Each subject should be a noun phrase

**Output ONLY valid JSON in this exact format:**
```json
{
  "subjects": [
    {"term": "Java (Computer program language)", "scheme": "LCSH"},
    {"term": "Object-oriented programming (Computer science)", "scheme": "LCSH"},
    {"term": "Computer software--Development", "scheme": "LCSH"}
  ]
}
```
PROMPT;

        $result = $this->gemini->generateContent($prompt, [
            'cache_key' => $cacheKey,
            'cache_ttl' => 90 * 24 * 60,
            'temperature' => 0.2,
            'max_output_tokens' => 512,
            'feature' => 'subject_extraction',
        ]);

        if (!$result || !$result['text']) return null;

        $parsed = $this->gemini->parseJsonResponse($result['text']);

        return $parsed ? [
            'subjects' => $parsed['subjects'] ?? [],
            'metadata' => $result['metadata'],
        ] : null;
    }

    /**
     * Translate English text to Khmer (Cambodian script)
     *
     * @param string $text English text to translate
     * @return array|null ['translation' => string, 'metadata' => array]
     */
    public function translateToKhmer(string $text): ?array
    {
        if (empty($text) || strlen($text) > 5000) {
            return null; // Too long or empty
        }

        $cacheKey = "ai:translate:" . md5($text) . ":km";

        $prompt = <<<PROMPT
Translate the following English text to Khmer (Cambodian script).

**Instructions:**
1. Maintain meaning and tone
2. Use appropriate formal/academic register for library catalogs
3. Return ONLY the Khmer translation, nothing else

**English Text:**
{$text}

**Khmer Translation:**
PROMPT;

        $result = $this->gemini->generateContent($prompt, [
            'cache_key' => $cacheKey,
            'cache_ttl' => 180 * 24 * 60, // 180 days (translations stable)
            'temperature' => 0.1, // Very low for translation consistency
            'max_output_tokens' => 1024,
            'feature' => 'khmer_translation',
        ]);

        return $result ? [
            'translation' => trim($result['text']),
            'metadata' => $result['metadata'],
        ] : null;
    }

    /**
     * Extract keywords from text
     *
     * @param array $data Bibliographic data
     * @return array|null ['keywords' => array, 'metadata' => array]
     */
    public function extractKeywords(array $data): ?array
    {
        $cacheKey = "ai:keywords:" . md5(json_encode([
            $data['title'] ?? '',
            $data['abstract'] ?? '',
        ]));

        $title = $data['title'] ?? '';
        $abstract = $data['abstract'] ?? '';

        $prompt = <<<PROMPT
Extract 5-10 relevant keywords from this bibliographic record.

**Title:** {$title}
**Abstract:** {$abstract}

**Instructions:**
1. Identify key concepts, topics, and terminology
2. Single words or short phrases (2-3 words max)
3. Order by importance
4. Return as JSON array

**Output ONLY valid JSON:**
```json
{
  "keywords": ["keyword1", "keyword2", "keyword3"]
}
```
PROMPT;

        $result = $this->gemini->generateContent($prompt, [
            'cache_key' => $cacheKey,
            'cache_ttl' => 90 * 24 * 60,
            'temperature' => 0.2,
            'max_output_tokens' => 256,
            'feature' => 'keyword_extraction',
        ]);

        if (!$result || !$result['text']) return null;

        $parsed = $this->gemini->parseJsonResponse($result['text']);

        return $parsed ? [
            'keywords' => $parsed['keywords'] ?? [],
            'metadata' => $result['metadata'],
        ] : null;
    }

    /**
     * Parse natural language search query into structured parameters
     *
     * Converts queries like "books about cooking published after 2020" into
     * structured search filters: {query: "cooking", type: "book", year_min: 2020}
     *
     * @param string $query Natural language search query
     * @return array|null ['query' => string, 'filters' => array, 'metadata' => array]
     */
    public function parseNaturalLanguageQuery(string $query): ?array
    {
        $cacheKey = "ai:search_parse:" . md5($query);

        $prompt = <<<PROMPT
You are a library search assistant. Parse the following natural language search query into structured search parameters.

**User Query:** "{$query}"

**Available Filters:**
- query: Main search keywords
- material_type: book, ebook, journal, article, thesis, audio, video, map, dataset
- language: en, km, fr, zh, etc. (ISO 639-1 codes)
- year_min: Earliest publication year
- year_max: Latest publication year
- subject: Subject area or topic
- author: Author name

**Instructions:**
1. Extract the main search keywords
2. Identify any material type mentions (books, ebooks, journals, etc.)
3. Extract year ranges if mentioned (e.g., "after 2020" → year_min: 2020)
4. Identify language if specified
5. Extract author names if mentioned
6. Extract subject areas if mentioned

**Output ONLY valid JSON:**
```json
{
  "query": "main search keywords",
  "filters": {
    "material_type": "book",
    "year_min": 2020,
    "language": "en",
    "subject": "subject area",
    "author": "author name"
  },
  "interpretation": "brief explanation of how the query was interpreted"
}
```

If no filters are detected, return only "query" field. Omit null/empty filters.
PROMPT;

        $result = $this->gemini->generateContent($prompt, [
            'cache_key' => $cacheKey,
            'cache_ttl' => 30 * 24 * 60, // 30 days
            'temperature' => 0.2,
            'max_output_tokens' => 512,
            'feature' => 'search_query_parsing',
        ]);

        if (!$result || !$result['text']) return null;

        $parsed = $this->gemini->parseJsonResponse($result['text']);

        return $parsed ? [
            'query' => $parsed['query'] ?? $query,
            'filters' => $parsed['filters'] ?? [],
            'interpretation' => $parsed['interpretation'] ?? null,
            'metadata' => $result['metadata'],
        ] : null;
    }

    /**
     * Expand search query with related terms and synonyms
     *
     * Helps improve search results by suggesting related terms
     * Example: "AI" → ["AI", "artificial intelligence", "machine learning"]
     *
     * @param string $query Search query
     * @return array|null ['original' => string, 'expanded' => array, 'metadata' => array]
     */
    public function expandSearchQuery(string $query): ?array
    {
        $cacheKey = "ai:search_expand:" . md5($query);

        $prompt = <<<PROMPT
You are a library search assistant. Expand the following search query with related terms, synonyms, and broader/narrower concepts that would help find relevant materials.

**User Query:** "{$query}"

**Instructions:**
1. Identify the main concept
2. Suggest 3-7 related terms, synonyms, or alternate phrasings
3. Include both broader and narrower terms where appropriate
4. Consider common library subject headings (LCSH style)
5. Return terms that would actually appear in book titles, abstracts, or subjects

**Output ONLY valid JSON:**
```json
{
  "original": "original query",
  "expanded_terms": [
    "related term 1",
    "synonym 2",
    "alternate phrasing 3"
  ],
  "suggestion": "Try searching: [combined suggestion]"
}
```
PROMPT;

        $result = $this->gemini->generateContent($prompt, [
            'cache_key' => $cacheKey,
            'cache_ttl' => 60 * 24 * 60, // 60 days (terms stable)
            'temperature' => 0.3,
            'max_output_tokens' => 512,
            'feature' => 'search_query_expansion',
        ]);

        if (!$result || !$result['text']) return null;

        $parsed = $this->gemini->parseJsonResponse($result['text']);

        return $parsed ? [
            'original' => $parsed['original'] ?? $query,
            'expanded_terms' => $parsed['expanded_terms'] ?? [],
            'suggestion' => $parsed['suggestion'] ?? null,
            'metadata' => $result['metadata'],
        ] : null;
    }

    /**
     * Generate smart search suggestions (autocomplete)
     *
     * @param string $partial Partial search query
     * @param array $context Recent searches or library context
     * @return array|null ['suggestions' => array, 'metadata' => array]
     */
    public function generateSearchSuggestions(string $partial, array $context = []): ?array
    {
        if (strlen($partial) < 3) {
            return null; // Too short
        }

        $cacheKey = "ai:search_suggest:" . md5($partial);

        $recentSearches = !empty($context['recent'])
            ? "Recent searches in this library: " . implode(', ', $context['recent'])
            : '';

        $prompt = <<<PROMPT
You are a library search autocomplete assistant. Based on the partial query, suggest 5 relevant search completions.

**Partial Query:** "{$partial}"
{$recentSearches}

**Instructions:**
1. Suggest 5 complete search queries
2. Consider common library searches (by title, author, subject, ISBN)
3. Include variations (e.g., subject searches, author searches, specific titles)
4. Make suggestions practical and likely to return results
5. Order by relevance

**Output ONLY valid JSON:**
```json
{
  "suggestions": [
    "complete search query 1",
    "complete search query 2",
    "complete search query 3",
    "complete search query 4",
    "complete search query 5"
  ]
}
```
PROMPT;

        $result = $this->gemini->generateContent($prompt, [
            'cache_key' => $cacheKey,
            'cache_ttl' => 7 * 24 * 60, // 7 days
            'temperature' => 0.4, // Slightly higher for variety
            'max_output_tokens' => 256,
            'feature' => 'search_autocomplete',
        ]);

        if (!$result || !$result['text']) return null;

        $parsed = $this->gemini->parseJsonResponse($result['text']);

        return $parsed ? [
            'suggestions' => $parsed['suggestions'] ?? [],
            'metadata' => $result['metadata'],
        ] : null;
    }
}
