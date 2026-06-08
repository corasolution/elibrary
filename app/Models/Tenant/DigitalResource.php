<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class DigitalResource extends Model
{
    use SoftDeletes;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'biblio_id', 'file_path', 'original_filename', 'file_size_bytes',
        'mime_type', 'format', 'url', 'is_external', 'thumbnail_path',
        'access_type', 'embargo_until', 'handle',
        'ocr_text', 'ocr_processed_at',
        'duration_seconds', 'bitrate',
        'download_count', 'view_count', 'version',
    ];

    protected $casts = [
        'is_external'      => 'boolean',
        'embargo_until'    => 'date',
        'ocr_processed_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::creating(function (self $r) {
            if (empty($r->id)) {
                $r->id = (string) \Illuminate\Support\Str::uuid();
            }
        });

        // Clean up R2 storage files when soft deleting
        static::deleting(function (self $resource) {
            // Only clean files on force delete, not soft delete
            // This preserves files during soft delete for potential restore
            if (!$resource->isForceDeleting()) {
                return;
            }

            $resource->deleteStorageFiles();
        });

        // Alternative: Clean up files on force delete specifically
        static::forceDeleting(function (self $resource) {
            $resource->deleteStorageFiles();
        });
    }

    public function bibliographicRecord()
    {
        return $this->belongsTo(BibliographicRecord::class, 'biblio_id');
    }

    public function accessLogs()
    {
        return $this->hasMany(DigitalAccessLog::class, 'resource_id');
    }

    public function isAccessible(): bool
    {
        if ($this->access_type === 'open_access') {
            return true;
        }
        if ($this->embargo_until && $this->embargo_until->isFuture()) {
            return false;
        }
        return true;
    }

    public function fileSizeHuman(): string
    {
        $bytes = $this->file_size_bytes ?? 0;
        if ($bytes >= 1_073_741_824) return round($bytes / 1_073_741_824, 2).' GB';
        if ($bytes >= 1_048_576) return round($bytes / 1_048_576, 2).' MB';
        if ($bytes >= 1_024) return round($bytes / 1_024, 2).' KB';
        return $bytes.' B';
    }

    /**
     * Delete associated files from R2/cloud storage
     */
    public function deleteStorageFiles(): void
    {
        try {
            $disk = \Illuminate\Support\Facades\Storage::disk(config('filesystems.default', 's3'));

            // Delete main file
            if ($this->file_path && !$this->is_external) {
                if ($disk->exists($this->file_path)) {
                    $disk->delete($this->file_path);
                    \Illuminate\Support\Facades\Log::info("Deleted file from storage: {$this->file_path}");
                }
            }

            // Delete thumbnail
            if ($this->thumbnail_path) {
                if ($disk->exists($this->thumbnail_path)) {
                    $disk->delete($this->thumbnail_path);
                    \Illuminate\Support\Facades\Log::info("Deleted thumbnail from storage: {$this->thumbnail_path}");
                }
            }

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error(
                "Failed to delete storage files for digital resource {$this->id}: " . $e->getMessage()
            );
            // Don't throw exception - allow database deletion to proceed
        }
    }

    /**
     * Get full storage path including tenant prefix
     */
    public function getFullStoragePath(): ?string
    {
        if (!$this->file_path || $this->is_external) {
            return null;
        }

        // Storage path format: /{tenant_id}/files/...
        return $this->file_path;
    }
}
