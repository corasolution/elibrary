<?php

namespace Database\Seeders;

use App\Models\Tenant\LibrarySetting;
use Illuminate\Database\Seeder;

class StorageSettingsSeeder extends Seeder
{
    public function run(): void
    {
        // Default storage provider (uses system default R2)
        LibrarySetting::firstOrCreate(
            ['key' => 'storage_driver'],
            [
                'value' => 'default',
                'group' => 'storage',
                'label' => 'Storage Provider',
                'description' => 'Cloud storage provider for digital files (PDFs, ebooks, audio, video)',
            ]
        );

        // Storage credentials (encrypted JSON)
        LibrarySetting::firstOrCreate(
            ['key' => 'storage_credentials'],
            [
                'value' => null,
                'group' => 'storage',
                'label' => 'Storage Credentials',
                'description' => 'Encrypted credentials for custom storage provider',
            ]
        );

        // Storage bucket name
        LibrarySetting::firstOrCreate(
            ['key' => 'storage_bucket'],
            [
                'value' => '',
                'group' => 'storage',
                'label' => 'Bucket/Container Name',
                'description' => 'Name of the storage bucket or container',
            ]
        );

        // Storage region
        LibrarySetting::firstOrCreate(
            ['key' => 'storage_region'],
            [
                'value' => 'auto',
                'group' => 'storage',
                'label' => 'Storage Region',
                'description' => 'Geographic region for storage',
            ]
        );

        // Storage endpoint (for custom providers)
        LibrarySetting::firstOrCreate(
            ['key' => 'storage_endpoint'],
            [
                'value' => '',
                'group' => 'storage',
                'label' => 'Storage Endpoint',
                'description' => 'Custom endpoint URL for S3-compatible providers',
            ]
        );

        // Path prefix for files
        LibrarySetting::firstOrCreate(
            ['key' => 'storage_path_prefix'],
            [
                'value' => '',
                'group' => 'storage',
                'label' => 'Path Prefix',
                'description' => 'Prefix for all file paths (default: tenant ID)',
            ]
        );
    }
}
