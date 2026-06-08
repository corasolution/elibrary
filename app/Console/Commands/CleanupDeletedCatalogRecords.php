<?php

namespace App\Console\Commands;

use App\Models\Tenant\BibliographicRecord;
use App\Models\Tenant\DigitalResource;
use Illuminate\Console\Command;

class CleanupDeletedCatalogRecords extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'catalog:cleanup-deleted';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Permanently delete catalog records in trash for more than 30 days';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting cleanup of deleted catalog records...');

        // Find records deleted 30+ days ago
        $thirtyDaysAgo = now()->subDays(30);

        // Bibliographic records
        $biblioRecords = BibliographicRecord::onlyTrashed()
            ->where('deleted_at', '<=', $thirtyDaysAgo)
            ->get();

        // Digital resources
        $digitalResources = DigitalResource::onlyTrashed()
            ->where('deleted_at', '<=', $thirtyDaysAgo)
            ->get();

        $biblioCount = 0;
        $digitalCount = 0;

        foreach ($biblioRecords as $record) {
            try {
                $this->info("Permanently deleting bibliographic record: {$record->title} (ID: {$record->id})");
                // Force delete will cascade to digital resources
                // which triggers R2 cleanup via model events
                $record->forceDelete();
                $biblioCount++;
            } catch (\Exception $e) {
                $this->error("Failed to delete record {$record->title}: " . $e->getMessage());
            }
        }

        foreach ($digitalResources as $resource) {
            try {
                $title = $resource->bibliographicRecord?->title ?? $resource->original_filename ?? 'Untitled';
                $this->info("Permanently deleting digital resource: {$title} (ID: {$resource->id})");
                // Triggers storage cleanup via model events
                $resource->forceDelete();
                $digitalCount++;
            } catch (\Exception $e) {
                $this->error("Failed to delete resource: " . $e->getMessage());
            }
        }

        $this->info("Cleanup complete!");
        $this->info("Bibliographic records: {$biblioCount}");
        $this->info("Digital resources: {$digitalCount}");

        return 0;
    }
}
