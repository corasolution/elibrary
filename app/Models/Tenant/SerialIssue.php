<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;

class SerialIssue extends Model
{
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'serial_id', 'volume', 'issue_number',
        'publication_date', 'expected_date', 'received_date',
        'item_id', 'status', 'notes', 'claimed_at',
    ];

    protected $casts = [
        'publication_date' => 'date',
        'expected_date'    => 'date',
        'received_date'    => 'date',
        'claimed_at'       => 'datetime',
    ];

    protected static function booted(): void
    {
        static::creating(function (self $m) {
            if (empty($m->id)) $m->id = (string) \Illuminate\Support\Str::uuid();
        });
    }

    public function serial()
    {
        return $this->belongsTo(Serial::class);
    }

    public function physicalItem()
    {
        return $this->belongsTo(PhysicalItem::class, 'item_id');
    }

    public function isLate(): bool
    {
        return in_array($this->status, ['expected', 'late'])
            && $this->expected_date
            && $this->expected_date->isPast();
    }

    public function effectiveStatus(): string
    {
        if ($this->status === 'expected' && $this->isLate()) return 'late';
        return $this->status;
    }
}
