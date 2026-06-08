<?php

namespace App\Services;

use App\Models\Central\CMSTranslation;
use App\Models\Central\TranslationAPILog;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\File;

class TranslationService
{
    public function __construct(
        private GeminiService $gemini
    ) {}

    /**
     * Translate English text to Khmer using Gemini API
     *
     * @param string $text The English text to translate
     * @param int|null $translationId The CMS translation ID (if applicable)
     * @param string|null $tenantId The tenant ID (if translating for a tenant)
     * @return array ['success' => bool, 'translation' => string|null, 'error' => string|null, 'tokens' => array]
     */
    public function translateToKhmer(
        string $text,
        ?int $translationId = null,
        ?string $tenantId = null
    ): array {
        $startTime = microtime(true);

        $prompt = <<<PROMPT
Translate the following English text to Khmer. Maintain the tone and context appropriate for a library management system.

Rules:
- Keep technical terms like "API", "Cloud", "Storage", "PDF", "eBook", "OPAC" in English
- Use formal/professional Khmer appropriate for libraries and educational institutions
- Preserve formatting (line breaks, punctuation)
- Do not add explanations or notes, only return the translation
- Maintain the same level of formality as the English text

English text:
{$text}
PROMPT;

        try {
            $result = $this->gemini->generateContent($prompt, [
                'temperature' => 0.3,  // Low temperature for consistent translations
                'maxOutputTokens' => 2048,
            ]);

            if (!$result || !isset($result['text'])) {
                throw new \Exception('Empty response from Gemini API');
            }

            $khmerText = trim($result['text']);
            $responseTime = (int)((microtime(true) - $startTime) * 1000);

            // Log usage
            TranslationAPILog::create([
                'tenant_id' => $tenantId,
                'translation_id' => $translationId,
                'text_length' => strlen($text),
                'input_tokens' => $result['usage']['promptTokenCount'] ?? 0,
                'output_tokens' => $result['usage']['candidatesTokenCount'] ?? 0,
                'cost_usd' => $this->estimateCost($result['usage'] ?? []),
                'response_time_ms' => $responseTime,
                'status' => 'success',
            ]);

            return [
                'success' => true,
                'translation' => $khmerText,
                'tokens' => $result['usage'] ?? [],
                'error' => null,
            ];

        } catch (\Throwable $e) {
            Log::error('Translation failed', [
                'text' => substr($text, 0, 100),
                'error' => $e->getMessage(),
                'tenant_id' => $tenantId,
                'translation_id' => $translationId,
            ]);

            TranslationAPILog::create([
                'tenant_id' => $tenantId,
                'translation_id' => $translationId,
                'text_length' => strlen($text),
                'status' => 'error',
                'error_message' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'translation' => null,
                'error' => $e->getMessage(),
                'tokens' => [],
            ];
        }
    }

    /**
     * Batch translate multiple texts
     *
     * @param array $texts Array of texts to translate (key => text)
     * @param string|null $tenantId The tenant ID (if translating for a tenant)
     * @return array Array of translations (key => translation)
     */
    public function batchTranslate(array $texts, ?string $tenantId = null): array
    {
        $results = [];

        foreach ($texts as $key => $text) {
            $result = $this->translateToKhmer($text, null, $tenantId);
            $results[$key] = $result['translation'] ?? null;

            // Rate limiting: wait 500ms between requests to avoid API throttling
            if (count($texts) > 1) {
                usleep(500000);
            }
        }

        return $results;
    }

    /**
     * Export published translations to JSON files
     *
     * @return bool
     */
    public function exportToFiles(): bool
    {
        $published = CMSTranslation::published()->get();

        $en = [];
        $km = [];

        foreach ($published as $translation) {
            $section = $translation->section;
            $key = $translation->key;

            if (!isset($en[$section])) {
                $en[$section] = [];
                $km[$section] = [];
            }

            $en[$section][$key] = $translation->en_value;
            $km[$section][$key] = $translation->km_value ?? $translation->en_value;
        }

        // Write to files
        $enPath = resource_path('js/locales/en.json');
        $kmPath = resource_path('js/locales/km.json');

        File::put($enPath, json_encode($en, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        File::put($kmPath, json_encode($km, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

        Log::info('Translation files exported', [
            'keys_count' => $published->count(),
            'sections' => count($en),
        ]);

        return true;
    }

    /**
     * Import translations from JSON files into CMS database
     *
     * @return int Number of translations imported
     */
    public function importFromFiles(): int
    {
        $enPath = resource_path('js/locales/en.json');
        $kmPath = resource_path('js/locales/km.json');

        if (!File::exists($enPath)) {
            throw new \Exception('English translation file not found');
        }

        $en = json_decode(File::get($enPath), true);
        $km = File::exists($kmPath) ? json_decode(File::get($kmPath), true) : [];

        if (!$en) {
            throw new \Exception('Failed to parse English translation file');
        }

        $imported = 0;

        foreach ($en as $section => $keys) {
            foreach ($keys as $key => $enValue) {
                $kmValue = $km[$section][$key] ?? null;

                CMSTranslation::updateOrCreate(
                    ['section' => $section, 'key' => $key],
                    [
                        'en_value' => $enValue,
                        'km_value' => $kmValue,
                        'translation_status' => $kmValue ? 'manual' : 'pending',
                        'is_published' => true,
                    ]
                );

                $imported++;
            }
        }

        Log::info('Translations imported from files', [
            'count' => $imported,
        ]);

        return $imported;
    }

    /**
     * Estimate cost of Gemini API usage
     *
     * @param array $usage Usage data from Gemini API
     * @return float Estimated cost in USD
     */
    private function estimateCost(array $usage): float
    {
        $inputTokens = $usage['promptTokenCount'] ?? 0;
        $outputTokens = $usage['candidatesTokenCount'] ?? 0;

        // Gemini 1.5 Flash pricing (as of 2024)
        // Input: $0.075 per 1M tokens
        // Output: $0.30 per 1M tokens
        $inputCost = ($inputTokens / 1_000_000) * 0.075;
        $outputCost = ($outputTokens / 1_000_000) * 0.30;

        return round($inputCost + $outputCost, 6);
    }
}
