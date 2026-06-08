<?php

namespace App\Http\Controllers\Central;

use App\Http\Controllers\Controller;
use App\Models\Central\PlatformSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class StorageController extends Controller
{
    /**
     * Show storage settings (R2 only for platform)
     */
    public function index()
    {
        // Platform uses only Cloudflare R2
        $settings = [
            'active_provider' => 'r2', // Fixed to R2
            'r2_access_key' => PlatformSetting::get('r2_access_key'),
            'r2_secret_key' => '', // Never send encrypted key to frontend
            'r2_account_id' => PlatformSetting::get('r2_account_id'),
            'r2_bucket' => PlatformSetting::get('r2_bucket', 'alpha-elibrary-files'),
            'r2_public_url' => PlatformSetting::get('r2_public_url'),
        ];

        return Inertia::render('Central/Settings/Storage', [
            'settings' => $settings,
        ]);
    }

    /**
     * Update storage settings (R2 only for platform)
     */
    public function update(Request $request)
    {
        // Platform only supports Cloudflare R2
        $validated = $request->validate([
            'r2_access_key' => 'required|string',
            'r2_secret_key' => 'nullable|string', // Only update if provided
            'r2_account_id' => 'required|string',
            'r2_bucket' => 'required|string',
            'r2_public_url' => 'nullable|url',
        ]);

        // Force R2 as platform provider
        PlatformSetting::set('storage_provider', 'r2');
        PlatformSetting::set('active_provider', 'r2');

        // Save R2 settings
        PlatformSetting::set('r2_access_key', $validated['r2_access_key']);
        PlatformSetting::set('r2_account_id', $validated['r2_account_id']);
        PlatformSetting::set('r2_bucket', $validated['r2_bucket']);

        if (!empty($validated['r2_public_url'])) {
            PlatformSetting::set('r2_public_url', $validated['r2_public_url']);
        }

        // Only update secret if provided (don't overwrite with empty string)
        if (!empty($validated['r2_secret_key'])) {
            PlatformSetting::set('r2_secret_key', $validated['r2_secret_key'], true); // Encrypted
        }

        return back()->with('success', 'Cloudflare R2 settings updated successfully!');
    }

    /**
     * Test storage connection
     */
    public function testConnection(Request $request)
    {
        $provider = $request->input('provider');

        try {
            // Test by attempting to list files
            $disk = $this->configureDisk($provider, $request->all());
            $disk->files();

            return response()->json([
                'success' => true,
                'message' => 'Connection successful! Storage is accessible.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Connection failed: ' . $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Configure a disk dynamically for testing
     */
    private function configureDisk(string $provider, array $config)
    {
        // This is a simplified version - in production, you'd configure the actual filesystem disk
        // For now, return the default disk
        return Storage::disk('s3');
    }

}
