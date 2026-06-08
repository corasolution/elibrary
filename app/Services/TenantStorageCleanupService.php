<?php

namespace App\Services;

use App\Models\Central\Tenant;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class TenantStorageCleanupService
{
    /**
     * Delete all storage files for a tenant
     *
     * @param Tenant $tenant
     * @return array ['success' => bool, 'deleted_files' => int, 'deleted_bytes' => int]
     */
    public function cleanupTenantStorage(Tenant $tenant): array
    {
        $tenantId = $tenant->id;
        $result = [
            'success' => false,
            'deleted_files' => 0,
            'deleted_bytes' => 0,
            'errors' => [],
        ];

        try {
            // Get the configured storage disk
            $disk = Storage::disk(config('filesystems.default', 's3'));

            // Tenant files are stored at: /{tenant_id}/
            $tenantPath = "{$tenantId}/";

            // Check if tenant folder exists
            if (!$disk->exists($tenantPath)) {
                Log::info("No storage found for tenant {$tenantId}");
                $result['success'] = true;
                return $result;
            }

            // Get all files recursively
            $files = $disk->allFiles($tenantPath);
            $totalBytes = 0;

            // Calculate total size before deletion
            foreach ($files as $file) {
                try {
                    $totalBytes += $disk->size($file);
                } catch (\Exception $e) {
                    Log::warning("Could not get size for file {$file}: " . $e->getMessage());
                }
            }

            // Delete the entire tenant directory
            $deleted = $disk->deleteDirectory($tenantPath);

            if ($deleted) {
                $result['success'] = true;
                $result['deleted_files'] = count($files);
                $result['deleted_bytes'] = $totalBytes;

                Log::info("Deleted storage for tenant {$tenantId}: {$result['deleted_files']} files, " . $this->formatBytes($totalBytes));
            } else {
                $result['errors'][] = "Failed to delete directory {$tenantPath}";
                Log::error("Failed to delete storage directory for tenant {$tenantId}");
            }

        } catch (\Exception $e) {
            $result['errors'][] = $e->getMessage();
            Log::error("Error cleaning up tenant {$tenantId} storage: " . $e->getMessage());
        }

        return $result;
    }

    /**
     * Get storage usage for a tenant
     *
     * @param Tenant $tenant
     * @return array ['file_count' => int, 'total_bytes' => int, 'total_readable' => string]
     */
    public function getTenantStorageUsage(Tenant $tenant): array
    {
        $tenantId = $tenant->id;
        $result = [
            'file_count' => 0,
            'total_bytes' => 0,
            'total_readable' => '0 B',
        ];

        try {
            $disk = Storage::disk(config('filesystems.default', 's3'));
            $tenantPath = "{$tenantId}/";

            if (!$disk->exists($tenantPath)) {
                return $result;
            }

            $files = $disk->allFiles($tenantPath);
            $totalBytes = 0;

            foreach ($files as $file) {
                try {
                    $totalBytes += $disk->size($file);
                } catch (\Exception $e) {
                    // Skip files that can't be accessed
                }
            }

            $result['file_count'] = count($files);
            $result['total_bytes'] = $totalBytes;
            $result['total_readable'] = $this->formatBytes($totalBytes);

        } catch (\Exception $e) {
            Log::error("Error getting storage usage for tenant {$tenantId}: " . $e->getMessage());
        }

        return $result;
    }

    /**
     * Format bytes to human-readable format
     */
    public function formatBytes(int $bytes, int $precision = 2): string
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];

        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }

        return round($bytes, $precision) . ' ' . $units[$i];
    }
}
