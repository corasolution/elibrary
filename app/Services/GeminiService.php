<?php

namespace App\Services;

use App\Services\AI\AiTextService;
use App\Services\AI\LogsAiUsage;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class GeminiService implements AiTextService
{
    use LogsAiUsage;

    private string $apiKey;
    private string $baseUrl;
    private string $model;
    private int $timeout;
    private int $maxRetries;

    public function providerKey(): string
    {
        return 'gemini';
    }

    public function __construct()
    {
        // Read from database settings first, fall back to config/env
        $this->apiKey = $this->getSettingValue('gemini_api_key') ?? config('services.gemini.api_key');
        $this->baseUrl = $this->getSettingValue('gemini_api_url') ?? config('services.gemini.base_url');
        $this->model = $this->getSettingValue('gemini_model') ?? config('services.gemini.model');
        $this->timeout = config('services.gemini.timeout', 30);
        $this->maxRetries = config('services.gemini.max_retries', 2);
    }

    /**
     * Get setting value from database (central platform settings)
     */
    private function getSettingValue(string $key): ?string
    {
        try {
            // Only query if central connection is available
            if (config('database.connections.central')) {
                $setting = \App\Models\Central\PlatformSetting::where('key', $key)->first();
                return $setting?->value;
            }
        } catch (\Exception $e) {
            // Silently fail if table doesn't exist or connection fails
            Log::debug("Could not read platform setting {$key}: " . $e->getMessage());
        }
        return null;
    }

    /**
     * Generate content via Gemini API with caching and retry logic
     *
     * @param string $prompt The prompt to send to Gemini
     * @param array $options Configuration options:
     *   - cache_key: string|null - Redis cache key
     *   - cache_ttl: int - Cache TTL in minutes (default: 90 days)
     *   - temperature: float - 0.0-1.0 (default: 0.2)
     *   - max_output_tokens: int - Max tokens to generate (default: 2048)
     *   - feature: string - Feature name for usage logging
     * @return array|null ['text' => string, 'metadata' => array] or null on failure
     */
    public function generateContent(string $prompt, array $options = []): ?array
    {
        $cacheKey = $options['cache_key'] ?? null;
        $cacheTTL = $options['cache_ttl'] ?? (90 * 24 * 60); // 90 days default
        $feature = $options['feature'] ?? 'generate_content';

        // Check cache first
        if ($cacheKey && Cache::has($cacheKey)) {
            Log::info("Gemini cache hit: {$cacheKey}");

            // Log cache hit
            $this->logUsage($feature, [
                'input_tokens' => 0,
                'output_tokens' => 0,
                'response_time_ms' => 0,
            ], 'success', true);

            return Cache::get($cacheKey);
        }

        $temperature = $options['temperature'] ?? 0.2; // Low for consistency
        $maxTokens = $options['max_output_tokens'] ?? 2048;

        $payload = [
            'contents' => [
                ['parts' => [['text' => $prompt]]],
            ],
            'generationConfig' => [
                'temperature' => $temperature,
                'topK' => 40,
                'topP' => 0.95,
                'maxOutputTokens' => $maxTokens,
            ],
        ];

        $startTime = microtime(true);
        $attempt = 0;

        while ($attempt < $this->maxRetries) {
            try {
                $response = Http::timeout($this->timeout)
                    ->withHeaders(['Content-Type' => 'application/json'])
                    ->post("{$this->baseUrl}/models/{$this->model}:generateContent?key={$this->apiKey}", $payload);

                if ($response->successful()) {
                    $data = $response->json();
                    $responseTime = (int) ((microtime(true) - $startTime) * 1000);

                    $result = [
                        'text' => $data['candidates'][0]['content']['parts'][0]['text'] ?? null,
                        'metadata' => [
                            'model' => $this->model,
                            'input_tokens' => $data['usageMetadata']['promptTokenCount'] ?? 0,
                            'output_tokens' => $data['usageMetadata']['candidatesTokenCount'] ?? 0,
                            'total_tokens' => $data['usageMetadata']['totalTokenCount'] ?? 0,
                            'response_time_ms' => $responseTime,
                        ],
                    ];

                    // Cache result
                    if ($cacheKey) {
                        Cache::put($cacheKey, $result, $cacheTTL);
                    }

                    $this->logUsage($feature, $result['metadata'], 'success', false);

                    return $result;
                }

                // Handle rate limiting with exponential backoff
                if ($response->status() === 429) {
                    $attempt++;
                    if ($attempt < $this->maxRetries) {
                        $backoffSeconds = 2 ** $attempt; // 2, 4, 8 seconds
                        Log::warning("Gemini rate limit hit, backing off {$backoffSeconds}s (attempt {$attempt})");
                        sleep($backoffSeconds);
                        continue;
                    }
                }

                throw new \Exception("Gemini API error: {$response->status()} - {$response->body()}");

            } catch (\Throwable $e) {
                $attempt++;
                Log::warning("Gemini API attempt {$attempt} failed: {$e->getMessage()}");

                if ($attempt >= $this->maxRetries) {
                    $this->logUsage($feature, [
                        'input_tokens' => 0,
                        'output_tokens' => 0,
                        'response_time_ms' => (int) ((microtime(true) - $startTime) * 1000),
                        'error' => $e->getMessage(),
                    ], 'error', false);

                    return null;
                }

                sleep(2 ** $attempt); // Exponential backoff
            }
        }

        return null;
    }

    /**
     * Parse JSON response from Gemini (handles markdown code blocks)
     *
     * Gemini often wraps JSON in ```json ... ``` code blocks
     */
    public function parseJsonResponse(string $text): ?array
    {
        // Remove markdown code block wrappers
        $text = preg_replace('/^```json\s*\n/m', '', $text);
        $text = preg_replace('/\n```$/m', '', $text);
        $text = trim($text);

        try {
            return json_decode($text, true, 512, JSON_THROW_ON_ERROR);
        } catch (\JsonException $e) {
            Log::warning("Failed to parse Gemini JSON response: {$e->getMessage()}", [
                'text' => substr($text, 0, 500), // Log first 500 chars
            ]);
            return null;
        }
    }

    /**
     * Log API usage for billing/analytics (markup + central ledger via LogsAiUsage).
     */
    private function logUsage(string $feature, array $metadata, string $status, bool $cacheHit): void
    {
        $apiCost = $this->apiCost(
            $metadata['input_tokens'] ?? 0,
            $metadata['output_tokens'] ?? 0
        );

        $this->recordUsage('gemini', $feature, $metadata, $status, $cacheHit, $apiCost);
    }

    /**
     * Raw Gemini API cost (no markup). gemini-1.5-flash: input $0.075/1M, output $0.30/1M.
     */
    private function apiCost(int $inputTokens, int $outputTokens): float
    {
        return ($inputTokens / 1_000_000) * 0.075 + ($outputTokens / 1_000_000) * 0.30;
    }

    /**
     * Check if API key is configured
     */
    public function isConfigured(): bool
    {
        return !empty($this->apiKey);
    }

    /**
     * Test API connection
     */
    public function testConnection(): array
    {
        if (!$this->isConfigured()) {
            return [
                'success' => false,
                'error' => 'Gemini API key not configured',
            ];
        }

        try {
            $result = $this->generateContent('Say "API connection test successful"', [
                'max_output_tokens' => 50,
                'feature' => 'api_test',
            ]);

            return [
                'success' => $result !== null,
                'message' => $result ? 'API connection successful' : 'API request failed',
                'response' => $result['text'] ?? null,
            ];
        } catch (\Throwable $e) {
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }
}
