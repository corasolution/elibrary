<?php

namespace App\Jobs;

use App\Models\Tenant\BibliographicRecord;
use App\Models\Central\PlatformSetting;
use App\Models\Central\AIUsageLog;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class GenerateBibliographicEmbedding implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;
    public $backoff = [60, 300, 900]; // Retry after 1min, 5min, 15min

    /**
     * Create a new job instance.
     */
    public function __construct(
        public readonly BibliographicRecord $record
    ) {
        $this->onQueue('ai-processing');
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        // Skip if semantic search disabled globally.
        // Settings are stored as strings — the string "false" is truthy in PHP, so
        // coerce explicitly with filter_var.
        if (! filter_var(PlatformSetting::get('enable_semantic_search', false), FILTER_VALIDATE_BOOLEAN)) {
            Log::info('Skipping embedding generation - semantic search disabled globally', [
                'record_id' => $this->record->id
            ]);
            return;
        }

        // Check if embedding column exists (pgvector available)
        if (!$this->hasVectorSupport()) {
            Log::warning('Skipping embedding generation - pgvector not available', [
                'record_id' => $this->record->id
            ]);
            return;
        }

        // Build text to embed
        $text = $this->buildEmbeddingText();

        if (empty(trim($text))) {
            Log::info('Skipping embedding - no content to embed', [
                'record_id' => $this->record->id
            ]);
            return;
        }

        $startTime = microtime(true);

        try {
            // Get embedding from API
            $embedding = $this->fetchEmbedding($text);

            if (empty($embedding) || !is_array($embedding)) {
                throw new \Exception('Invalid embedding response');
            }

            // Ensure embedding is 1536 dimensions
            if (count($embedding) !== 1536) {
                Log::warning('Unexpected embedding dimension', [
                    'record_id' => $this->record->id,
                    'dimensions' => count($embedding),
                    'expected' => 1536
                ]);
            }

            // Store as PostgreSQL vector
            DB::statement(
                'UPDATE bibliographic_records SET embedding = ?::vector WHERE id = ?',
                [json_encode($embedding), $this->record->id]
            );

            $responseTime = (microtime(true) - $startTime) * 1000;

            Log::info('Embedding generated successfully', [
                'record_id' => $this->record->id,
                'title' => $this->record->title,
                'dimensions' => count($embedding),
                'response_time_ms' => round($responseTime, 2)
            ]);

        } catch (\Exception $e) {
            Log::error('Embedding generation failed', [
                'record_id' => $this->record->id,
                'title' => $this->record->title,
                'error' => $e->getMessage(),
                'attempt' => $this->attempts()
            ]);

            // Re-throw to trigger retry
            throw $e;
        }
    }

    /**
     * Build text to embed from bibliographic record
     */
    private function buildEmbeddingText(): string
    {
        $parts = [];

        // Title (most important)
        if ($this->record->title) {
            $parts[] = $this->record->title;
        }

        // Subtitle
        if ($this->record->subtitle) {
            $parts[] = $this->record->subtitle;
        }

        // Authors
        if ($this->record->authors && is_array($this->record->authors)) {
            $authors = collect($this->record->authors)
                ->pluck('name')
                ->filter()
                ->implode(', ');
            if ($authors) {
                $parts[] = "by " . $authors;
            }
        }

        // Abstract (truncated to 500 chars to stay within token limits)
        if ($this->record->abstract) {
            $abstract = substr($this->record->abstract, 0, 500);
            $parts[] = $abstract;
        }

        // Subjects
        if ($this->record->subjects && is_array($this->record->subjects)) {
            $subjects = collect($this->record->subjects)
                ->pluck('term')
                ->filter()
                ->implode(', ');
            if ($subjects) {
                $parts[] = "Subjects: " . $subjects;
            }
        }

        // Keywords
        if ($this->record->keywords && is_array($this->record->keywords)) {
            $keywords = implode(', ', $this->record->keywords);
            if ($keywords) {
                $parts[] = "Keywords: " . $keywords;
            }
        }

        // Publisher
        if ($this->record->publisher) {
            $parts[] = "Published by " . $this->record->publisher;
        }

        return implode('. ', $parts);
    }

    /**
     * Fetch embedding from configured provider
     */
    private function fetchEmbedding(string $text): array
    {
        $provider = PlatformSetting::get('embedding_provider', 'openai');

        return match ($provider) {
            'openai' => $this->fetchOpenAIEmbedding($text),
            'gemini' => $this->fetchGeminiEmbedding($text),
            default => throw new \Exception("Unsupported embedding provider: {$provider}")
        };
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
        ])->timeout(30)->post($url, [
            'input' => $text,
            'model' => $model,
        ]);

        if (!$response->successful()) {
            throw new \Exception('OpenAI API error: ' . $response->body());
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

        $response = Http::timeout(30)->post(
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
            throw new \Exception('Gemini API error: ' . $response->body());
        }

        $data = $response->json();

        return $data['embedding']['values'] ?? [];
    }

    /**
     * Check if pgvector support is available
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
     * Handle job failure
     */
    public function failed(\Throwable $exception): void
    {
        Log::error('Embedding generation job failed permanently', [
            'record_id' => $this->record->id,
            'title' => $this->record->title,
            'error' => $exception->getMessage(),
            'attempts' => $this->attempts()
        ]);
    }
}
