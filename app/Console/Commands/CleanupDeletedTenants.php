<?php

namespace App\Console\Commands;

use App\Models\Central\Tenant;
use Illuminate\Console\Command;

class CleanupDeletedTenants extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'tenants:cleanup-deleted';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Permanently delete tenants that have been in trash for more than 30 days';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting cleanup of deleted tenants...');

        // Find tenants deleted more than 30 days ago
        $thirtyDaysAgo = now()->subDays(30);

        $tenantsToDelete = Tenant::onlyTrashed()
            ->where('deleted_at', '<=', $thirtyDaysAgo)
            ->get();

        if ($tenantsToDelete->isEmpty()) {
            $this->info('No tenants found for permanent deletion.');
            return 0;
        }

        $count = 0;
        $totalFiles = 0;
        $totalBytes = 0;

        $storageCleanup = app(\App\Services\TenantStorageCleanupService::class);

        foreach ($tenantsToDelete as $tenant) {
            try {
                $this->info("Permanently deleting tenant: {$tenant->name} (ID: {$tenant->id})");

                // Clean up storage first
                $storageResult = $storageCleanup->cleanupTenantStorage($tenant);

                if ($storageResult['success']) {
                    $totalFiles += $storageResult['deleted_files'];
                    $totalBytes += $storageResult['deleted_bytes'];

                    if ($storageResult['deleted_files'] > 0) {
                        $this->info("  → Deleted {$storageResult['deleted_files']} files (" .
                                   $storageCleanup->formatBytes($storageResult['deleted_bytes']) .
                                   ") from cloud storage");
                    }
                } else {
                    $this->warn("  → Storage cleanup had errors: " . implode(', ', $storageResult['errors']));
                }

                // Permanently delete tenant database
                $tenant->forceDelete();
                $count++;

            } catch (\Exception $e) {
                $this->error("Failed to delete tenant {$tenant->name}: " . $e->getMessage());
            }
        }

        $this->info("Cleanup complete! Permanently deleted {$count} tenant(s).");
        if ($totalFiles > 0) {
            $this->info("Total storage freed: {$totalFiles} files (" .
                       $storageCleanup->formatBytes($totalBytes) . ")");
        }

        return 0;
    }
}
