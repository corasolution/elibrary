<?php

namespace App\Services;

use App\Models\Tenant\DigitalResource;
use App\Models\Tenant\DigitalAccessLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class DigitalAssetService
{
    protected StorageProviderService $storageProvider;

    public function __construct(StorageProviderService $storageProvider)
    {
        $this->storageProvider = $storageProvider;
    }

    public function signedUrl(DigitalResource $resource, int $expiryMinutes = 60): string
    {
        if ($resource->is_external) {
            return $resource->url;
        }

        // Use storage provider service to get signed URL
        return $this->storageProvider->getSignedUrl($resource->file_path, $expiryMinutes);
    }

    public function logAccess(DigitalResource $resource, Request $request, string $action): void
    {
        $patronId = $request->user('patron')?->id;

        DigitalAccessLog::create([
            'resource_id'      => $resource->id,
            'patron_id'        => $patronId,
            'action'           => $action,
            'ip_address'       => $request->ip(),
            'user_agent'       => $request->userAgent(),
            'session_id'       => $request->session()->getId(),
            'accessed_at'      => now(),
        ]);

        $field = match ($action) {
            'download' => 'download_count',
            'stream'   => 'view_count',
            default    => 'view_count',
        };
        $resource->increment($field);
    }

    public function storeFile(mixed $file, string $tenantId): array
    {
        $uuid      = Str::uuid();
        $extension = strtolower($file->getClientOriginalExtension());
        $path      = "{$tenantId}/resources/{$uuid}/{$file->getClientOriginalName()}";

        // Use storage provider service to get active disk
        $disk = $this->storageProvider->getActiveDisk();

        Storage::disk($disk)->put($path, file_get_contents($file->getRealPath()));

        return [
            'file_path'         => $path,
            'original_filename' => $file->getClientOriginalName(),
            'file_size_bytes'   => $file->getSize(),
            'mime_type'         => $file->getMimeType(),
            'format'            => $extension,
        ];
    }

    public function canAccess(DigitalResource $resource, ?string $patronId = null): bool
    {
        if ($resource->access_type === 'open_access') {
            return true;
        }
        if ($resource->embargo_until && $resource->embargo_until->isFuture()) {
            return false;
        }
        if ($resource->access_type === 'registered') {
            return $patronId !== null;
        }
        // 'restricted' — only authenticated patrons with active membership
        return $patronId !== null;
    }
}
