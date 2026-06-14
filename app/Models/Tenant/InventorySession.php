<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class InventorySession extends Model
{
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'name', 'notes', 'collection_id', 'location_id', 'status',
        'expected_count', 'scanned_count', 'missing_count', 'unknown_count',
        'started_by', 'started_at', 'closed_at',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'closed_at'  => 'datetime',
    ];

    protected static function booted(): void
    {
        static::creating(function (self $m) {
            if (empty($m->id)) {
                $m->id = (string) Str::uuid();
            }
        });
    }

    public function scans()
    {
        return $this->hasMany(InventoryScan::class, 'session_id');
    }

    public function collection()
    {
        return $this->belongsTo(Collection::class);
    }

    public function location()
    {
        return $this->belongsTo(Location::class);
    }

    public function isOpen(): bool
    {
        return $this->status === 'open';
    }

    public function progressPercent(): int
    {
        if ($this->expected_count === 0) return 0;
        return (int) min(100, round($this->scanned_count / $this->expected_count * 100));
    }
}
