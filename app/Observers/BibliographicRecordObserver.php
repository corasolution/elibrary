<?php

namespace App\Observers;

use App\Models\Tenant\BibliographicRecord;
use App\Models\Central\PlatformSetting;
use App\Jobs\GenerateBibliographicEmbedding;
use Illuminate\Support\Facades\Log;

class BibliographicRecordObserver
{
    /**
     * Handle the BibliographicRecord "created" event.
     */
    public function created(BibliographicRecord $record): void
    {
        // Dispatch embedding generation if semantic search enabled
        if ($this->shouldGenerateEmbedding()) {
            $this->dispatchEmbedding($record);
        }
    }

    /**
     * Handle the BibliographicRecord "updated" event.
     */
    public function updated(BibliographicRecord $record): void
    {
        // Regenerate embedding if searchable fields changed
        if ($this->shouldRegenerateEmbedding($record)) {
            $this->dispatchEmbedding($record);
        }
    }

    /**
     * Dispatch the embedding job defensively — a queue/Redis outage must never
     * break the user's record save (the embedding is a best-effort background task).
     */
    private function dispatchEmbedding(BibliographicRecord $record): void
    {
        try {
            GenerateBibliographicEmbedding::dispatch($record);
        } catch (\Throwable $e) {
            Log::warning('BibliographicRecord embedding dispatch failed: ' . $e->getMessage());
        }
    }

    /**
     * Check if embedding generation should be triggered.
     * Settings are stored as strings, so the string "false"/"0"/"" must coerce to
     * false (a raw non-empty string like "false" is truthy in PHP).
     */
    private function shouldGenerateEmbedding(): bool
    {
        return filter_var(
            PlatformSetting::get('enable_semantic_search', false),
            FILTER_VALIDATE_BOOLEAN
        );
    }

    /**
     * Check if embedding should be regenerated on update
     */
    private function shouldRegenerateEmbedding(BibliographicRecord $record): bool
    {
        if (!$this->shouldGenerateEmbedding()) {
            return false;
        }

        // Only regenerate if searchable content changed
        $searchableFields = [
            'title',
            'subtitle',
            'title_alternative',
            'abstract',
            'authors',
            'subjects',
            'keywords',
            'publisher'
        ];

        foreach ($searchableFields as $field) {
            if ($record->wasChanged($field)) {
                return true;
            }
        }

        return false;
    }
}
