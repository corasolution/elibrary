<?php

namespace App\Jobs;

use App\Models\Tenant\DigitalResource;
use App\Services\MigrationProgressService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class StorageMigrationJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $timeout = 3600; // 1 hour per chunk

    public function __construct(
        public readonly string $fromDisk,
        public readonly string $toDisk,
        public readonly string $migrationId,
        public readonly int $chunkSize = 50,
        public readonly int $offset = 0,
    ) {
        $this->onQueue('storage-migration');
    }

    public function handle(MigrationProgressService $progressService): void
    {
        try {
            // Get resources to migrate (chunked for memory efficiency)
            $resources = DigitalResource::whereNotNull('file_path')
                ->skip($this->offset)
                ->take($this->chunkSize)
                ->get();

            if ($resources->isEmpty()) {
                // Migration complete
                $progressService->markComplete($this->migrationId);
                Log::info("Storage migration {$this->migrationId} completed");
                return;
            }

            $progressService->updateStatus($this->migrationId, 'processing', [
                'current_offset' => $this->offset,
                'chunk_size' => $this->chunkSize,
            ]);

            $successCount = 0;
            $failureCount = 0;

            foreach ($resources as $resource) {
                try {
                    $this->migrateResource($resource);
                    $successCount++;

                    $progressService->incrementProgress($this->migrationId);
                } catch (\Throwable $e) {
                    $failureCount++;

                    Log::error("Failed to migrate resource {$resource->id}: {$e->getMessage()}", [
                        'resource_id' => $resource->id,
                        'file_path' => $resource->file_path,
                        'error' => $e->getMessage(),
                    ]);

                    $progressService->addError($this->migrationId, [
                        'resource_id' => $resource->id,
                        'file_path' => $resource->file_path,
                        'error' => $e->getMessage(),
                    ]);
                }
            }

            Log::info("Migration chunk completed", [
                'migration_id' => $this->migrationId,
                'offset' => $this->offset,
                'success' => $successCount,
                'failures' => $failureCount,
            ]);

            // Dispatch next chunk
            if ($resources->count() === $this->chunkSize) {
                self::dispatch(
                    $this->fromDisk,
                    $this->toDisk,
                    $this->migrationId,
                    $this->chunkSize,
                    $this->offset + $this->chunkSize
                )->delay(now()->addSeconds(5)); // Small delay between chunks
            } else {
                // Last chunk, mark complete
                $progressService->markComplete($this->migrationId);
                Log::info("Storage migration {$this->migrationId} completed");
            }

        } catch (\Throwable $e) {
            Log::error("Migration job failed: {$e->getMessage()}");
            $progressService->markFailed($this->migrationId, $e->getMessage());
            throw $e;
        }
    }

    private function migrateResource(DigitalResource $resource): void
    {
        $filePath = $resource->file_path;

        // Check if source file exists
        if (!Storage::disk($this->fromDisk)->exists($filePath)) {
            throw new \Exception("Source file not found: {$filePath}");
        }

        // Get file content
        $fileContent = Storage::disk($this->fromDisk)->get($filePath);
        $checksum = md5($fileContent);

        // Upload to new storage
        Storage::disk($this->toDisk)->put($filePath, $fileContent);

        // Verify upload
        $newContent = Storage::disk($this->toDisk)->get($filePath);
        $newChecksum = md5($newContent);

        if ($checksum !== $newChecksum) {
            throw new \Exception("Checksum mismatch after migration");
        }

        // Migrate thumbnail if exists
        if ($resource->thumbnail_path && Storage::disk($this->fromDisk)->exists($resource->thumbnail_path)) {
            $thumbContent = Storage::disk($this->fromDisk)->get($resource->thumbnail_path);
            Storage::disk($this->toDisk)->put($resource->thumbnail_path, $thumbContent);
        }

        Log::info("Successfully migrated resource", [
            'resource_id' => $resource->id,
            'file_path' => $filePath,
            'size' => strlen($fileContent),
            'checksum' => $checksum,
        ]);
    }

    public function failed(\Throwable $exception): void
    {
        Log::error("StorageMigrationJob failed permanently", [
            'migration_id' => $this->migrationId,
            'offset' => $this->offset,
            'error' => $exception->getMessage(),
        ]);

        app(MigrationProgressService::class)->markFailed(
            $this->migrationId,
            $exception->getMessage()
        );
    }
}
