<?php

namespace App\Services;

use App\Models\Tenant\LibrarySetting;
use App\Models\Tenant\DigitalResource;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Config;

class StorageProviderService
{
    protected int $cacheTtl = 300; // 5 minutes

    /**
     * Get the active disk name for the current tenant
     */
    public function getActiveDisk(): string
    {
        return Cache::remember('storage.active_disk', $this->cacheTtl, function () {
            $driver = LibrarySetting::get('storage_driver', 'default');

            if ($driver === 'default') {
                // Use system default R2
                return 'default_r2';
            }

            // Configure and return tenant-specific disk
            $this->configureTenantDisk();
            return 'tenant_storage';
        });
    }

    /**
     * Dynamically configure tenant-specific disk at runtime
     */
    public function configureTenantDisk(): void
    {
        $driver = LibrarySetting::get('storage_driver');
        $credentials = $this->getCredentials();

        if (!$credentials) {
            throw new \Exception('Storage credentials not configured');
        }

        $diskConfig = $this->buildDiskConfig($driver, $credentials);

        // Register disk configuration at runtime
        Config::set('filesystems.disks.tenant_storage', $diskConfig);

        // Purge Laravel's cached filesystem instances to pick up new config
        Storage::forgetDisk('tenant_storage');
    }

    /**
     * Build disk configuration array based on provider type
     */
    protected function buildDiskConfig(string $driver, array $credentials): array
    {
        return match($driver) {
            'r2_custom' => $this->buildR2Config($credentials),
            's3' => $this->buildS3Config($credentials),
            'spaces' => $this->buildSpacesConfig($credentials),
            'wasabi' => $this->buildWasabiConfig($credentials),
            'minio' => $this->buildMinIOConfig($credentials),
            'gcs' => $this->buildGcsConfig($credentials),
            default => throw new \Exception("Unsupported storage driver: {$driver}"),
        };
    }

    /**
     * Build Cloudflare R2 configuration
     */
    protected function buildR2Config(array $creds): array
    {
        return [
            'driver' => 's3',
            'key' => $creds['access_key_id'],
            'secret' => $creds['secret_access_key'],
            'region' => 'auto',
            'bucket' => $creds['bucket'],
            'endpoint' => "https://{$creds['account_id']}.r2.cloudflarestorage.com",
            'url' => $creds['public_url'] ?? null,
            'use_path_style_endpoint' => false,
            'throw' => false,
        ];
    }

    /**
     * Build Amazon S3 configuration
     */
    protected function buildS3Config(array $creds): array
    {
        return [
            'driver' => 's3',
            'key' => $creds['access_key_id'],
            'secret' => $creds['secret_access_key'],
            'region' => $creds['region'],
            'bucket' => $creds['bucket'],
            'url' => $creds['url'] ?? null,
            'use_path_style_endpoint' => false,
            'throw' => false,
        ];
    }

    /**
     * Build DigitalOcean Spaces configuration
     */
    protected function buildSpacesConfig(array $creds): array
    {
        return [
            'driver' => 's3',
            'key' => $creds['access_key'],
            'secret' => $creds['secret_key'],
            'region' => $creds['region'],
            'bucket' => $creds['space_name'],
            'endpoint' => "https://{$creds['region']}.digitaloceanspaces.com",
            'use_path_style_endpoint' => false,
            'throw' => false,
        ];
    }

    /**
     * Build Wasabi configuration
     */
    protected function buildWasabiConfig(array $creds): array
    {
        return [
            'driver' => 's3',
            'key' => $creds['access_key'],
            'secret' => $creds['secret_key'],
            'region' => $creds['region'],
            'bucket' => $creds['bucket'],
            'endpoint' => "https://s3.{$creds['region']}.wasabisys.com",
            'use_path_style_endpoint' => false,
            'throw' => false,
        ];
    }

    /**
     * Build MinIO configuration
     */
    protected function buildMinIOConfig(array $creds): array
    {
        $endpoint = $creds['endpoint'];

        // Ensure endpoint has protocol
        if (!str_starts_with($endpoint, 'http://') && !str_starts_with($endpoint, 'https://')) {
            $endpoint = 'https://' . $endpoint;
        }

        return [
            'driver' => 's3',
            'key' => $creds['access_key_id'],
            'secret' => $creds['secret_access_key'],
            'region' => $creds['region'] ?? 'us-east-1',
            'bucket' => $creds['bucket'],
            'endpoint' => $endpoint,
            'use_path_style_endpoint' => ($creds['use_path_style'] ?? 'true') === 'true',
            'throw' => false,
        ];
    }

    /**
     * Build Google Cloud Storage configuration
     */
    protected function buildGcsConfig(array $creds): array
    {
        return [
            'driver' => 'gcs',
            'project_id' => $creds['project_id'],
            'key_file' => $creds['service_account_json'],
            'bucket' => $creds['bucket'],
            'throw' => false,
        ];
    }

    /**
     * Get decrypted storage credentials
     */
    public function getCredentials(): ?array
    {
        $encrypted = LibrarySetting::get('storage_credentials');

        if (!$encrypted) {
            return null;
        }

        try {
            return json_decode(decrypt($encrypted), true);
        } catch (\Exception $e) {
            report($e);
            return null;
        }
    }

    /**
     * Save encrypted storage credentials
     */
    public function setCredentials(array $credentials): void
    {
        $encrypted = encrypt(json_encode($credentials));
        LibrarySetting::set('storage_credentials', $encrypted);
        $this->clearCache();
    }

    /**
     * Test connection to storage provider
     */
    public function testConnection(?array $credentials = null, ?string $driver = null): bool
    {
        try {
            // Use provided credentials or load from settings
            $testCreds = $credentials ?? $this->getCredentials();
            $testDriver = $driver ?? LibrarySetting::get('storage_driver');

            if (!$testCreds) {
                return false;
            }

            // Create temporary test disk
            $testConfig = $this->buildDiskConfig($testDriver, $testCreds);
            Config::set('filesystems.disks.test_connection', $testConfig);
            Storage::forgetDisk('test_connection');

            $disk = Storage::disk('test_connection');

            // Try to write a test file
            $testContent = 'Alpha eLibrary storage connection test - ' . now()->toIso8601String();
            $testPath = 'connection-test.txt';

            $disk->put($testPath, $testContent);

            // Verify we can read it back
            $retrieved = $disk->get($testPath);

            // Clean up test file
            $disk->delete($testPath);

            // Clean up test disk config
            Config::set('filesystems.disks.test_connection', null);
            Storage::forgetDisk('test_connection');

            return $retrieved === $testContent;

        } catch (\Exception $e) {
            report($e);
            return false;
        }
    }

    /**
     * Get storage usage statistics
     */
    public function getUsageStats(): array
    {
        return Cache::remember('storage.usage_stats', 3600, function () {
            $totalFiles = DigitalResource::count();
            $totalBytes = DigitalResource::sum('file_size_bytes');

            $byFormat = DigitalResource::selectRaw('format, COUNT(*) as count, SUM(file_size_bytes) as bytes')
                ->groupBy('format')
                ->get()
                ->map(fn($item) => [
                    'format' => $item->format,
                    'count' => $item->count,
                    'size_mb' => round($item->bytes / 1024 / 1024, 2),
                ])
                ->toArray();

            return [
                'total_files' => $totalFiles,
                'total_size_bytes' => $totalBytes,
                'total_size_mb' => round($totalBytes / 1024 / 1024, 2),
                'total_size_gb' => round($totalBytes / 1024 / 1024 / 1024, 2),
                'by_format' => $byFormat,
            ];
        });
    }

    /**
     * Get storage provider display name
     */
    public function getProviderName(?string $driver = null): string
    {
        $driver = $driver ?? LibrarySetting::get('storage_driver', 'default');

        return match($driver) {
            'default' => 'Alpha Cloud Storage',
            'r2_custom' => 'Cloudflare R2 (Custom Account)',
            's3' => 'Amazon S3',
            'spaces' => 'DigitalOcean Spaces',
            'wasabi' => 'Wasabi',
            'minio' => 'MinIO (Self-Hosted)',
            'gcs' => 'Google Cloud Storage',
            default => 'Unknown Provider',
        };
    }

    /**
     * Get current storage provider details
     */
    public function getCurrentProvider(): array
    {
        $driver = LibrarySetting::get('storage_driver', 'default');
        $credentials = $this->getCredentials();

        $details = [
            'driver' => $driver,
            'name' => $this->getProviderName($driver),
            'disk' => $this->getActiveDisk(),
            'configured' => (bool) $credentials,
        ];

        if ($credentials && $driver !== 'default') {
            $details['bucket'] = $credentials['bucket'] ?? $credentials['space_name'] ?? 'N/A';
            $details['region'] = $credentials['region'] ?? 'auto';
        }

        return $details;
    }

    /**
     * Clear all storage-related cache
     */
    public function clearCache(): void
    {
        Cache::forget('storage.active_disk');
        Cache::forget('storage.usage_stats');
        Storage::forgetDisk('tenant_storage');
    }

    /**
     * Get file public URL (for open_access files)
     */
    public function getPublicUrl(string $path): string
    {
        $disk = $this->getActiveDisk();
        return Storage::disk($disk)->url($path);
    }

    /**
     * Get temporary signed URL (for restricted files)
     */
    public function getSignedUrl(?string $path, int $expiryMinutes = 60): string
    {
        if (empty($path)) {
            return '';
        }

        $disk = $this->getActiveDisk();
        return Storage::disk($disk)->temporaryUrl(
            $path,
            now()->addMinutes($expiryMinutes)
        );
    }

    /**
     * Validate storage provider configuration
     */
    public function validateConfiguration(array $credentials, string $driver): array
    {
        $errors = [];

        switch ($driver) {
            case 'r2_custom':
                if (empty($credentials['account_id'])) $errors[] = 'Account ID is required';
                if (empty($credentials['access_key_id'])) $errors[] = 'Access Key ID is required';
                if (empty($credentials['secret_access_key'])) $errors[] = 'Secret Access Key is required';
                if (empty($credentials['bucket'])) $errors[] = 'Bucket name is required';
                break;

            case 's3':
                if (empty($credentials['access_key_id'])) $errors[] = 'Access Key ID is required';
                if (empty($credentials['secret_access_key'])) $errors[] = 'Secret Access Key is required';
                if (empty($credentials['region'])) $errors[] = 'Region is required';
                if (empty($credentials['bucket'])) $errors[] = 'Bucket name is required';
                break;

            case 'spaces':
                if (empty($credentials['access_key'])) $errors[] = 'Access Key is required';
                if (empty($credentials['secret_key'])) $errors[] = 'Secret Key is required';
                if (empty($credentials['region'])) $errors[] = 'Region is required';
                if (empty($credentials['space_name'])) $errors[] = 'Space name is required';
                break;

            case 'wasabi':
                if (empty($credentials['access_key'])) $errors[] = 'Access Key is required';
                if (empty($credentials['secret_key'])) $errors[] = 'Secret Key is required';
                if (empty($credentials['region'])) $errors[] = 'Region is required';
                if (empty($credentials['bucket'])) $errors[] = 'Bucket name is required';
                break;

            case 'minio':
                if (empty($credentials['endpoint'])) $errors[] = 'Endpoint URL is required';
                if (empty($credentials['access_key_id'])) $errors[] = 'Access Key is required';
                if (empty($credentials['secret_access_key'])) $errors[] = 'Secret Key is required';
                if (empty($credentials['bucket'])) $errors[] = 'Bucket name is required';

                // Validate endpoint URL format
                if (!empty($credentials['endpoint'])) {
                    $endpoint = $credentials['endpoint'];
                    if (!str_starts_with($endpoint, 'http://') && !str_starts_with($endpoint, 'https://')) {
                        $endpoint = 'https://' . $endpoint;
                    }
                    if (!filter_var($endpoint, FILTER_VALIDATE_URL)) {
                        $errors[] = 'Invalid endpoint URL format';
                    }
                }
                break;

            case 'gcs':
                if (empty($credentials['project_id'])) $errors[] = 'Project ID is required';
                if (empty($credentials['bucket'])) $errors[] = 'Bucket name is required';
                if (empty($credentials['service_account_json'])) $errors[] = 'Service Account JSON is required';
                break;
        }

        return $errors;
    }
}
