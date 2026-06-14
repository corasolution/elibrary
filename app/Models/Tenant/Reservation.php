<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;

class Reservation extends Model
{
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'patron_id', 'biblio_id', 'item_id',
        'status', 'reserved_at', 'expiry_date', 'notified_at', 'notes',
    ];

    protected $casts = [
        'reserved_at'  => 'datetime',
        'expiry_date'  => 'date',
        'notified_at'  => 'datetime',
    ];

    protected static function booted(): void
    {
        static::creating(function (self $r) {
            if (empty($r->id)) {
                $r->id = (string) \Illuminate\Support\Str::uuid();
            }
        });
    }

    public function patron()
    {
        return $this->belongsTo(Patron::class);
    }

    public function bibliographicRecord()
    {
        return $this->belongsTo(BibliographicRecord::class, 'biblio_id');
    }

    public function item()
    {
        return $this->belongsTo(PhysicalItem::class);
    }

    /**
     * 1-based position in this title's hold queue. Null once the hold is
     * ready/fulfilled/cancelled. Not in $appends — append per use to avoid
     * N+1 on unrelated queries.
     */
    public function getQueuePositionAttribute(): ?int
    {
        if (! in_array($this->status, ['pending', 'waiting'])) {
            return null;
        }

        return Reservation::where('biblio_id', $this->biblio_id)
            ->whereIn('status', ['pending', 'waiting'])
            ->where(function ($q) {
                $q->where('reserved_at', '<', $this->reserved_at)
                  ->orWhere(function ($q2) {
                      $q2->where('reserved_at', $this->reserved_at)
                         ->where('id', '<', $this->id);
                  });
            })
            ->count() + 1;
    }
}
