<?php

namespace App\Http\Controllers\Central;

use App\Http\Controllers\Controller;
use App\Models\Central\PlatformSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Config;
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

        // The default_r2 disk is configured from these settings at boot —
        // drop the cached copy so the next request picks up the new values.
        Cache::forget('platform.r2_config');

        return back()->with('success', 'Cloudflare R2 settings updated successfully!');
    }

    /**
     * Test storage connection with the submitted R2 credentials.
     * Writes, reads back and deletes a small test file in the bucket.
     */
    public function testConnection(Request $request)
    {
        $validated = $request->validate([
            'r2_access_key' => 'required|string',
            'r2_secret_key' => 'nullable|string',
            'r2_account_id' => 'required|string',
            'r2_bucket' => 'required|string',
        ]);

        // Blank secret means "keep current" — test with the saved one
        $secret = $validated['r2_secret_key'] ?? null;
        if (empty($secret)) {
            $secret = PlatformSetting::get('r2_secret_key');
        }

        if (empty($secret)) {
            return response()->json([
                'success' => false,
                'message' => 'No Secret Access Key provided and none saved yet.',
            ], 400);
        }

        try {
            Config::set('filesystems.disks.r2_connection_test', [
                'driver' => 's3',
                'key' => $validated['r2_access_key'],
                'secret' => $secret,
                'region' => 'auto',
                'bucket' => $validated['r2_bucket'],
                'endpoint' => "https://{$validated['r2_account_id']}.r2.cloudflarestorage.com",
                'use_path_style_endpoint' => false,
                'throw' => true,
            ]);
            Storage::forgetDisk('r2_connection_test');

            $disk = Storage::disk('r2_connection_test');
            $testPath = 'connection-test-' . now()->timestamp . '.txt';
            $testContent = 'Alpha eLibrary R2 connection test - ' . now()->toIso8601String();

            $disk->put($testPath, $testContent);
            $ok = $disk->get($testPath) === $testContent;
            $disk->delete($testPath);

            return response()->json([
                'success' => $ok,
                'message' => $ok
                    ? 'Connection successful! R2 bucket is writable and readable.'
                    : 'Wrote test file but could not read it back — check bucket permissions.',
            ], $ok ? 200 : 400);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Connection failed: ' . $e->getMessage(),
            ], 400);
        } finally {
            Config::set('filesystems.disks.r2_connection_test', null);
            Storage::forgetDisk('r2_connection_test');
        }
    }
}
