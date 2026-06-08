<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;

class DigitalAccessLog extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'resource_id', 'patron_id', 'action',
        'ip_address', 'user_agent', 'session_id',
        'duration_seconds', 'accessed_at',
    ];

    protected $casts = [
        'accessed_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::creating(function (self $l) {
            if (empty($l->id)) {
                $l->id = (string) \Illuminate\Support\Str::uuid();
            }
        });
    }

    public function resource()
    {
        return $this->belongsTo(DigitalResource::class, 'resource_id');
    }

    public function patron()
    {
        return $this->belongsTo(Patron::class);
    }
}
