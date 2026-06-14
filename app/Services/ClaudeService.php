<?php

namespace App\Services;

use App\Services\AI\AiTextService;
use App\Services\AI\LogsAiUsage;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Anthropic (Claude) text generation via the Messages API.
 * Mirrors GeminiService so it is drop-in interchangeable through AiManager.
 * Raw HTTP (Laravel Http) is used for consistency with GeminiService — no SDK dependency.
 */
class ClaudeService implements AiTextService
{
    use LogsAiUsage;

    private ?string $apiKey;
    private string $baseUrl;
    private string $version;
    private string $model;
    private int $timeout;
    private int $maxRetries;

    /** Anthropic list price per 1M tokens (input, output). */
    private const PRICING = [
        'claude-haiku-4-5'  => [1.00, 5.00],
        'claude-sonnet-4-6' => [3.00, 15.00],
        'claude-opus-4-8'   => [5.00, 25.00],
    ];

    public function __construct()
    {
        $this->apiKey     = $this->setting('anthropic_api_key') ?? config('services.anthropic.api_key');
        $this->baseUrl    = $this->setting('anthropic_api_url') ?? config('services.anthropic.base_url') ?? 'https://api.anthropic.com/v1';
        $this->version    = config('services.anthropic.version', '2023-06-01');
        $this->model      = $this->setting('anthropic_model') ?? config('services.anthropic.model', 'claude-haiku-4-5');
        $this->timeout    = config('services.anthropic.timeout', 30);
        $this->maxRetries = config('services.anthropic.max_retries', 2);
    }

    private function setting(string $key): ?string
    {
        try {
            if (config('database.connections.central')) {
                return \App\Models\Central\PlatformSetting::where('key', $key)->first()?->value;
            }
        } catch (\Throwable $e) {
            Log::debug("Could not read platform setting {$key}: {$e->getMessage()}");
        }
        return null;
    }

    public function providerKey(): string
    {
        return 'claude';
    }

    public function generateContent(string $prompt, array $options = []): ?array
    {
        $cacheKey = $options['cache_key'] ?? null;
        $cacheTTL = $options['cache_ttl'] ?? (90 * 24 * 60);
        $feature  = $options['feature'] ?? 'generate_content';

        if ($cacheKey && Cache::has($cacheKey)) {
            $this->recordUsage('claude', $feature, ['input_tokens' => 0, 'output_tokens' => 0, 'response_time_ms' => 0], 'success', true, 0.0);
            return Cache::get($cacheKey);
        }

        $maxTokens = $options['max_output_tokens'] ?? 1024;

        // NOTE: no temperature/top_p — Opus 4.8 rejects sampling params; steer via prompt.
        $payload = [
            'model'      => $this->model,
            'max_tokens' => $maxTokens,
            'messages'   => [['role' => 'user', 'content' => $prompt]],
        ];
        if (! empty($options['system'])) {
            $payload['system'] = $options['system'];
        }

        $startTime = microtime(true);
        $attempt = 0;

        while ($attempt < $this->maxRetries) {
            try {
                $response = Http::timeout($this->timeout)
                    ->withHeaders([
                        'x-api-key'         => (string) $this->apiKey,
                        'anthropic-version' => $this->version,
                        'content-type'      => 'application/json',
                    ])
                    ->post("{$this->baseUrl}/messages", $payload);

                if ($response->successful()) {
                    $data = $response->json();
                    $responseTime = (int) ((microtime(true) - $startTime) * 1000);

                    // Concatenate text blocks
                    $text = collect($data['content'] ?? [])
                        ->where('type', 'text')
                        ->pluck('text')
                        ->implode('');

                    $in  = (int) ($data['usage']['input_tokens'] ?? 0);
                    $out = (int) ($data['usage']['output_tokens'] ?? 0);

                    $result = [
                        'text' => $text ?: null,
                        'metadata' => [
                            'provider'         => 'claude',
                            'model'            => $this->model,
                            'input_tokens'     => $in,
                            'output_tokens'    => $out,
                            'total_tokens'     => $in + $out,
                            'response_time_ms' => $responseTime,
                        ],
                    ];

                    if ($cacheKey) {
                        Cache::put($cacheKey, $result, $cacheTTL);
                    }

                    $this->recordUsage('claude', $feature, $result['metadata'], 'success', false, $this->apiCost($in, $out));

                    return $result;
                }

                if ($response->status() === 429) {
                    $attempt++;
                    if ($attempt < $this->maxRetries) {
                        sleep(2 ** $attempt);
                        continue;
                    }
                }

                throw new \Exception("Anthropic API error: {$response->status()} - {$response->body()}");
            } catch (\Throwable $e) {
                $attempt++;
                Log::warning("Claude API attempt {$attempt} failed: {$e->getMessage()}");

                if ($attempt >= $this->maxRetries) {
                    $this->recordUsage('claude', $feature, [
                        'input_tokens' => 0, 'output_tokens' => 0,
                        'response_time_ms' => (int) ((microtime(true) - $startTime) * 1000),
                        'error' => $e->getMessage(),
                    ], 'error', false, 0.0);
                    return null;
                }
                sleep(2 ** $attempt);
            }
        }

        return null;
    }

    public function generateFromImage(string $prompt, string $base64Image, string $mime, array $options = []): ?array
    {
        $cacheKey = $options['cache_key'] ?? null;
        $cacheTTL = $options['cache_ttl'] ?? (90 * 24 * 60);
        $feature  = $options['feature'] ?? 'generate_from_image';

        if ($cacheKey && Cache::has($cacheKey)) {
            $this->recordUsage('claude', $feature, ['input_tokens' => 0, 'output_tokens' => 0, 'response_time_ms' => 0], 'success', true, 0.0);
            return Cache::get($cacheKey);
        }

        $maxTokens = $options['max_output_tokens'] ?? 1024;

        $payload = [
            'model'      => $this->model,
            'max_tokens' => $maxTokens,
            'messages'   => [[
                'role'    => 'user',
                'content' => [
                    ['type' => 'image', 'source' => ['type' => 'base64', 'media_type' => $mime, 'data' => $base64Image]],
                    ['type' => 'text', 'text' => $prompt],
                ],
            ]],
        ];
        if (! empty($options['system'])) {
            $payload['system'] = $options['system'];
        }

        $startTime = microtime(true);
        $attempt = 0;

        while ($attempt < $this->maxRetries) {
            try {
                $response = Http::timeout($this->timeout)
                    ->withHeaders([
                        'x-api-key'         => (string) $this->apiKey,
                        'anthropic-version' => $this->version,
                        'content-type'      => 'application/json',
                    ])
                    ->post("{$this->baseUrl}/messages", $payload);

                if ($response->successful()) {
                    $data = $response->json();
                    $responseTime = (int) ((microtime(true) - $startTime) * 1000);

                    $text = collect($data['content'] ?? [])
                        ->where('type', 'text')
                        ->pluck('text')
                        ->implode('');

                    $in  = (int) ($data['usage']['input_tokens'] ?? 0);
                    $out = (int) ($data['usage']['output_tokens'] ?? 0);

                    $result = [
                        'text' => $text ?: null,
                        'metadata' => [
                            'provider'         => 'claude',
                            'model'            => $this->model,
                            'input_tokens'     => $in,
                            'output_tokens'    => $out,
                            'total_tokens'     => $in + $out,
                            'response_time_ms' => $responseTime,
                        ],
                    ];

                    if ($cacheKey) {
                        Cache::put($cacheKey, $result, $cacheTTL);
                    }

                    $this->recordUsage('claude', $feature, $result['metadata'], 'success', false, $this->apiCost($in, $out));

                    return $result;
                }

                if ($response->status() === 429) {
                    $attempt++;
                    if ($attempt < $this->maxRetries) {
                        sleep(2 ** $attempt);
                        continue;
                    }
                }

                throw new \Exception("Anthropic API error: {$response->status()} - {$response->body()}");
            } catch (\Throwable $e) {
                $attempt++;
                Log::warning("Claude vision attempt {$attempt} failed: {$e->getMessage()}");

                if ($attempt >= $this->maxRetries) {
                    $this->recordUsage('claude', $feature, [
                        'input_tokens' => 0, 'output_tokens' => 0,
                        'response_time_ms' => (int) ((microtime(true) - $startTime) * 1000),
                        'error' => $e->getMessage(),
                    ], 'error', false, 0.0);
                    return null;
                }
                sleep(2 ** $attempt);
            }
        }

        return null;
    }

    private function apiCost(int $inputTokens, int $outputTokens): float
    {
        [$inRate, $outRate] = self::PRICING[$this->model] ?? self::PRICING['claude-haiku-4-5'];
        return ($inputTokens / 1_000_000) * $inRate + ($outputTokens / 1_000_000) * $outRate;
    }

    public function parseJsonResponse(string $text): ?array
    {
        $text = preg_replace('/^```json\s*\n/m', '', $text);
        $text = preg_replace('/\n```$/m', '', $text);
        $text = trim($text);

        try {
            return json_decode($text, true, 512, JSON_THROW_ON_ERROR);
        } catch (\JsonException $e) {
            Log::warning("Failed to parse Claude JSON response: {$e->getMessage()}", ['text' => substr($text, 0, 500)]);
            return null;
        }
    }

    public function isConfigured(): bool
    {
        return ! empty($this->apiKey);
    }

    public function testConnection(): array
    {
        if (! $this->isConfigured()) {
            return ['success' => false, 'error' => 'Claude (Anthropic) API key not configured'];
        }

        try {
            $result = $this->generateContent('Say "API connection test successful"', [
                'max_output_tokens' => 50,
                'feature' => 'api_test',
            ]);
            return [
                'success'  => $result !== null,
                'message'  => $result ? 'API connection successful' : 'API request failed',
                'response' => $result['text'] ?? null,
            ];
        } catch (\Throwable $e) {
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }
}
