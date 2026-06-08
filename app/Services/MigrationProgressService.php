<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;

class MigrationProgressService
{
    private const CACHE_TTL = 86400; // 24 hours
    private const CACHE_PREFIX = 'storage_migration:';

    public function createMigration(string $migrationId, int $totalResources, array $config = []): void
    {
        $data = [
            'id' => $migrationId,
            'status' => 'pending',
            'total_resources' => $totalResources,
            'processed' => 0,
            'succeeded' => 0,
            'failed' => 0,
            'errors' => [],
            'config' => $config,
            'started_at' => now()->toIso8601String(),
            'completed_at' => null,
            'failed_at' => null,
            'error_message' => null,
        ];

        Cache::put($this->getCacheKey($migrationId), $data, self::CACHE_TTL);
    }

    public function getProgress(string $migrationId): ?array
    {
        return Cache::get($this->getCacheKey($migrationId));
    }

    public function updateStatus(string $migrationId, string $status, array $metadata = []): void
    {
        $data = $this->getProgress($migrationId);
        if (!$data) {
            return;
        }

        $data['status'] = $status;
        $data['metadata'] = array_merge($data['metadata'] ?? [], $metadata);
        $data['updated_at'] = now()->toIso8601String();

        Cache::put($this->getCacheKey($migrationId), $data, self::CACHE_TTL);
    }

    public function incrementProgress(string $migrationId): void
    {
        $data = $this->getProgress($migrationId);
        if (!$data) {
            return;
        }

        $data['processed']++;
        $data['succeeded']++;
        $data['progress_percent'] = round(($data['processed'] / $data['total_resources']) * 100, 2);
        $data['updated_at'] = now()->toIso8601String();

        Cache::put($this->getCacheKey($migrationId), $data, self::CACHE_TTL);
    }

    public function addError(string $migrationId, array $error): void
    {
        $data = $this->getProgress($migrationId);
        if (!$data) {
            return;
        }

        $data['failed']++;
        $data['errors'][] = array_merge($error, [
            'timestamp' => now()->toIso8601String(),
        ]);

        // Keep only last 100 errors to prevent excessive memory usage
        if (count($data['errors']) > 100) {
            $data['errors'] = array_slice($data['errors'], -100);
        }

        $data['updated_at'] = now()->toIso8601String();

        Cache::put($this->getCacheKey($migrationId), $data, self::CACHE_TTL);
    }

    public function markComplete(string $migrationId): void
    {
        $data = $this->getProgress($migrationId);
        if (!$data) {
            return;
        }

        $data['status'] = 'completed';
        $data['completed_at'] = now()->toIso8601String();
        $data['progress_percent'] = 100;
        $data['updated_at'] = now()->toIso8601String();

        Cache::put($this->getCacheKey($migrationId), $data, self::CACHE_TTL);
    }

    public function markFailed(string $migrationId, string $errorMessage): void
    {
        $data = $this->getProgress($migrationId);
        if (!$data) {
            return;
        }

        $data['status'] = 'failed';
        $data['failed_at'] = now()->toIso8601String();
        $data['error_message'] = $errorMessage;
        $data['updated_at'] = now()->toIso8601String();

        Cache::put($this->getCacheKey($migrationId), $data, self::CACHE_TTL);
    }

    public function deleteMigration(string $migrationId): void
    {
        Cache::forget($this->getCacheKey($migrationId));
    }

    public function getAllMigrations(): array
    {
        $keys = Cache::get('storage_migrations_list', []);
        $migrations = [];

        foreach ($keys as $migrationId) {
            if ($data = $this->getProgress($migrationId)) {
                $migrations[] = $data;
            }
        }

        // Sort by started_at descending
        usort($migrations, function ($a, $b) {
            return strtotime($b['started_at']) - strtotime($a['started_at']);
        });

        return $migrations;
    }

    public function registerMigration(string $migrationId): void
    {
        $migrations = Cache::get('storage_migrations_list', []);
        if (!in_array($migrationId, $migrations)) {
            $migrations[] = $migrationId;
            Cache::put('storage_migrations_list', $migrations, self::CACHE_TTL);
        }
    }

    public function getEstimatedTimeRemaining(string $migrationId): ?string
    {
        $data = $this->getProgress($migrationId);
        if (!$data || $data['processed'] === 0) {
            return null;
        }

        $startedAt = new \DateTime($data['started_at']);
        $now = new \DateTime();
        $elapsed = $now->getTimestamp() - $startedAt->getTimestamp();

        $avgTimePerResource = $elapsed / $data['processed'];
        $remaining = $data['total_resources'] - $data['processed'];
        $estimatedSeconds = (int) ($remaining * $avgTimePerResource);

        if ($estimatedSeconds < 60) {
            return "{$estimatedSeconds} seconds";
        } elseif ($estimatedSeconds < 3600) {
            $minutes = round($estimatedSeconds / 60);
            return "{$minutes} minutes";
        } else {
            $hours = round($estimatedSeconds / 3600, 1);
            return "{$hours} hours";
        }
    }

    private function getCacheKey(string $migrationId): string
    {
        return self::CACHE_PREFIX . $migrationId;
    }
}
