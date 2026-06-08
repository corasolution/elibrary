<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;

class Serial extends Model
{
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'biblio_id', 'issn', 'frequency',
        'start_date', 'end_date', 'subscription_expiry',
        'supplier', 'subscription_cost', 'currency',
        'location_id', 'collection_id', 'call_number', 'notes',
    ];

    protected $casts = [
        'start_date'          => 'date',
        'end_date'            => 'date',
        'subscription_expiry' => 'date',
        'subscription_cost'   => 'decimal:2',
    ];

    protected static function booted(): void
    {
        static::creating(function (self $m) {
            if (empty($m->id)) $m->id = (string) \Illuminate\Support\Str::uuid();
        });
    }

    // ─── Relations ────────────────────────────────────────────────────────────

    public function bibliographicRecord()
    {
        return $this->belongsTo(BibliographicRecord::class, 'biblio_id');
    }

    public function issues()
    {
        return $this->hasMany(SerialIssue::class);
    }

    public function location()
    {
        return $this->belongsTo(Location::class);
    }

    public function collection()
    {
        return $this->belongsTo(Collection::class);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    public function isExpired(): bool
    {
        return $this->subscription_expiry && $this->subscription_expiry->isPast();
    }

    public function isExpiringSoon(): bool
    {
        if (! $this->subscription_expiry) return false;
        return ! $this->isExpired() && $this->subscription_expiry->diffInDays(now()) <= 30;
    }

    public function statusLabel(): string
    {
        if ($this->isExpired()) return 'expired';
        if ($this->isExpiringSoon()) return 'expiring_soon';
        return 'active';
    }

    public function issueStats(): array
    {
        $counts = $this->issues()
            ->selectRaw('status, count(*) as cnt')
            ->groupBy('status')
            ->pluck('cnt', 'status')
            ->toArray();

        // Mark late: expected issues with expected_date in the past
        $late = $this->issues()
            ->where('status', 'expected')
            ->whereNotNull('expected_date')
            ->where('expected_date', '<', now()->toDateString())
            ->count();

        return [
            'received' => (int) ($counts['received'] ?? 0),
            'expected' => (int) ($counts['expected'] ?? 0),
            'late'     => $late,
            'missing'  => (int) ($counts['missing'] ?? 0),
            'total'    => array_sum($counts),
        ];
    }

    public function displayTitle(): string
    {
        return $this->bibliographicRecord?->title ?? 'Untitled Serial';
    }
}
