<?php

namespace App\Observers;

use App\Models\Tenant\BibliographicRecord;
use App\Models\Central\PlatformSetting;
use App\Jobs\GenerateBibliographicEmbedding;

class BibliographicRecordObserver
{
    /**
     * Handle the BibliographicRecord "created" event.
     */
    public function created(BibliographicRecord $record): void
    {
        // Dispatch embedding generation if semantic search enabled
        if ($this->shouldGenerateEmbedding()) {
            GenerateBibliographicEmbedding::dispatch($record);
        }
    }

    /**
     * Handle the BibliographicRecord "updated" event.
     */
    public function updated(BibliographicRecord $record): void
    {
        // Regenerate embedding if searchable fields changed
        if ($this->shouldRegenerateEmbedding($record)) {
            GenerateBibliographicEmbedding::dispatch($record);
        }
    }

    /**
     * Check if embedding generation should be triggered
     */
    private function shouldGenerateEmbedding(): bool
    {
        return PlatformSetting::get('enable_semantic_search', false);
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
