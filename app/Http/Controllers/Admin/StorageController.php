<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\StorageProviderService;
use App\Services\MigrationProgressService;
use App\Jobs\StorageMigrationJob;
use App\Models\Tenant\DigitalResource;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class StorageController extends Controller
{
    public function __construct(protected StorageProviderService $storageProvider)
    {
    }

    public function index()
    {
        $currentProvider = $this->storageProvider->getCurrentProvider();
        $usageStats = $this->storageProvider->getUsageStats();

        return Inertia::render('Admin/Settings/Storage', [
            'currentProvider' => $currentProvider,
            'usageStats' => $usageStats,
            'providers' => $this->getProviderOptions(),
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'driver' => 'required|string|in:default,r2,s3,spaces,wasabi,gcs,custom',
            'credentials' => 'required|array',
            'bucket' => 'required|string',
            'region' => 'nullable|string',
            'endpoint' => 'nullable|url',
            'path_prefix' => 'nullable|string',
        ]);

        try {
            // Set credentials
            $this->storageProvider->setCredentials($validated['credentials']);

            // Update storage settings
            \App\Models\Tenant\LibrarySetting::set('storage_driver', $validated['driver']);
            \App\Models\Tenant\LibrarySetting::set('storage_bucket', $validated['bucket']);

            if (isset($validated['region'])) {
                \App\Models\Tenant\LibrarySetting::set('storage_region', $validated['region']);
            }

            if (isset($validated['endpoint'])) {
                \App\Models\Tenant\LibrarySetting::set('storage_endpoint', $validated['endpoint']);
            }

            if (isset($validated['path_prefix'])) {
                \App\Models\Tenant\LibrarySetting::set('storage_path_prefix', $validated['path_prefix']);
            }

            // Clear cache
            \Illuminate\Support\Facades\Cache::forget('storage.active_disk');

            return redirect()
                ->route('admin.settings.storage')
                ->with('success', 'Storage provider updated successfully.');
        } catch (\Throwable $e) {
            return back()->withErrors(['general' => 'Failed to update storage: ' . $e->getMessage()]);
        }
    }

    public function testConnection(Request $request)
    {
        $validated = $request->validate([
            'driver' => 'required|string',
            'credentials' => 'required|array',
            'bucket' => 'required|string',
            'region' => 'nullable|string',
            'endpoint' => 'nullable|url',
        ]);

        try {
            // Temporarily set credentials for testing
            $testConfig = match ($validated['driver']) {
                'r2' => [
                    'key' => $validated['credentials']['access_key_id'] ?? '',
                    'secret' => $validated['credentials']['secret_access_key'] ?? '',
                    'region' => 'auto',
                    'bucket' => $validated['bucket'],
                    'endpoint' => $validated['endpoint'] ?? '',
                ],
                's3' => [
                    'key' => $validated['credentials']['access_key_id'] ?? '',
                    'secret' => $validated['credentials']['secret_access_key'] ?? '',
                    'region' => $validated['region'] ?? 'us-east-1',
                    'bucket' => $validated['bucket'],
                ],
                'spaces' => [
                    'key' => $validated['credentials']['access_key_id'] ?? '',
                    'secret' => $validated['credentials']['secret_access_key'] ?? '',
                    'region' => $validated['region'] ?? 'nyc3',
                    'bucket' => $validated['bucket'],
                    'endpoint' => "https://{$validated['region']}.digitaloceanspaces.com",
                ],
                'wasabi' => [
                    'key' => $validated['credentials']['access_key_id'] ?? '',
                    'secret' => $validated['credentials']['secret_access_key'] ?? '',
                    'region' => $validated['region'] ?? 'us-east-1',
                    'bucket' => $validated['bucket'],
                    'endpoint' => "https://s3.{$validated['region']}.wasabisys.com",
                ],
                'gcs' => [
                    'driver' => 'gcs',
                    'project_id' => $validated['credentials']['project_id'] ?? '',
                    'key_file' => $validated['credentials']['key_file'] ?? '',
                    'bucket' => $validated['bucket'],
                ],
                default => throw new \InvalidArgumentException('Unsupported driver'),
            };

            // Configure temporary disk
            config(['filesystems.disks.temp_test' => array_merge(
                ['driver' => $validated['driver'] === 'gcs' ? 'gcs' : 's3'],
                $testConfig
            )]);

            // Test write/read/delete
            $testFile = 'test-connection-' . now()->timestamp . '.txt';
            $testContent = 'Alpha eLibrary connection test';

            \Illuminate\Support\Facades\Storage::disk('temp_test')->put($testFile, $testContent);
            $read = \Illuminate\Support\Facades\Storage::disk('temp_test')->get($testFile);
            \Illuminate\Support\Facades\Storage::disk('temp_test')->delete($testFile);

            if ($read !== $testContent) {
                throw new \Exception('Content mismatch - file read verification failed');
            }

            return response()->json([
                'success' => true,
                'message' => 'Connection successful! Read and write operations verified.',
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Connection failed: ' . $e->getMessage(),
            ], 422);
        }
    }

    private function getProviderOptions(): array
    {
        return [
            [
                'value' => 'default',
                'label' => 'Cloudflare R2 (Default)',
                'description' => 'Free egress, S3-compatible',
                'fields' => [],
            ],
            [
                'value' => 'r2',
                'label' => 'Cloudflare R2 (Custom)',
                'description' => 'Your own R2 account',
                'fields' => [
                    ['name' => 'access_key_id', 'label' => 'Access Key ID', 'type' => 'text', 'required' => true],
                    ['name' => 'secret_access_key', 'label' => 'Secret Access Key', 'type' => 'password', 'required' => true],
                    ['name' => 'account_id', 'label' => 'Account ID', 'type' => 'text', 'required' => true],
                    ['name' => 'bucket', 'label' => 'Bucket Name', 'type' => 'text', 'required' => true],
                    ['name' => 'endpoint', 'label' => 'Endpoint URL', 'type' => 'text', 'required' => true, 'placeholder' => 'https://your-account-id.r2.cloudflarestorage.com'],
                ],
            ],
            [
                'value' => 's3',
                'label' => 'Amazon S3',
                'description' => 'AWS S3 storage',
                'fields' => [
                    ['name' => 'access_key_id', 'label' => 'Access Key ID', 'type' => 'text', 'required' => true],
                    ['name' => 'secret_access_key', 'label' => 'Secret Access Key', 'type' => 'password', 'required' => true],
                    ['name' => 'bucket', 'label' => 'Bucket Name', 'type' => 'text', 'required' => true],
                    ['name' => 'region', 'label' => 'Region', 'type' => 'select', 'required' => true, 'options' => ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1']],
                ],
            ],
            [
                'value' => 'spaces',
                'label' => 'DigitalOcean Spaces',
                'description' => 'DigitalOcean object storage with CDN',
                'fields' => [
                    ['name' => 'access_key_id', 'label' => 'Access Key', 'type' => 'text', 'required' => true],
                    ['name' => 'secret_access_key', 'label' => 'Secret Key', 'type' => 'password', 'required' => true],
                    ['name' => 'bucket', 'label' => 'Space Name', 'type' => 'text', 'required' => true],
                    ['name' => 'region', 'label' => 'Region', 'type' => 'select', 'required' => true, 'options' => ['nyc3', 'sfo3', 'sgp1', 'fra1']],
                ],
            ],
            [
                'value' => 'wasabi',
                'label' => 'Wasabi',
                'description' => 'Hot cloud storage',
                'fields' => [
                    ['name' => 'access_key_id', 'label' => 'Access Key', 'type' => 'text', 'required' => true],
                    ['name' => 'secret_access_key', 'label' => 'Secret Key', 'type' => 'password', 'required' => true],
                    ['name' => 'bucket', 'label' => 'Bucket Name', 'type' => 'text', 'required' => true],
                    ['name' => 'region', 'label' => 'Region', 'type' => 'select', 'required' => true, 'options' => ['us-east-1', 'us-east-2', 'us-west-1', 'eu-central-1']],
                ],
            ],
            [
                'value' => 'gcs',
                'label' => 'Google Cloud Storage',
                'description' => 'Google Cloud object storage',
                'fields' => [
                    ['name' => 'project_id', 'label' => 'Project ID', 'type' => 'text', 'required' => true],
                    ['name' => 'key_file', 'label' => 'Service Account JSON', 'type' => 'textarea', 'required' => true],
                    ['name' => 'bucket', 'label' => 'Bucket Name', 'type' => 'text', 'required' => true],
                ],
            ],
        ];
    }

    public function startMigration(Request $request, MigrationProgressService $progressService)
    {
        $validated = $request->validate([
            'from_disk' => 'required|string',
            'to_disk' => 'required|string',
        ]);

        try {
            $migrationId = (string) Str::uuid();
            $totalResources = DigitalResource::whereNotNull('file_path')->count();

            if ($totalResources === 0) {
                return back()->withErrors(['general' => 'No files to migrate']);
            }

            // Create migration tracking
            $progressService->createMigration($migrationId, $totalResources, [
                'from_disk' => $validated['from_disk'],
                'to_disk' => $validated['to_disk'],
            ]);
            $progressService->registerMigration($migrationId);

            // Dispatch first chunk
            StorageMigrationJob::dispatch(
                $validated['from_disk'],
                $validated['to_disk'],
                $migrationId,
                config('storage-providers.migration.chunk_size', 50),
                0
            );

            return redirect()
                ->route('admin.settings.storage')
                ->with('success', "Migration started. Total files: {$totalResources}. Migration ID: {$migrationId}");
        } catch (\Throwable $e) {
            return back()->withErrors(['general' => 'Failed to start migration: ' . $e->getMessage()]);
        }
    }

    public function migrationProgress(string $migrationId, MigrationProgressService $progressService)
    {
        $progress = $progressService->getProgress($migrationId);

        if (!$progress) {
            return response()->json(['error' => 'Migration not found'], 404);
        }

        // Add estimated time remaining
        $progress['estimated_time_remaining'] = $progressService->getEstimatedTimeRemaining($migrationId);

        return response()->json($progress);
    }

    public function allMigrations(MigrationProgressService $progressService)
    {
        $migrations = $progressService->getAllMigrations();

        return response()->json($migrations);
    }
}
