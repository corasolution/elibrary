<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Loan extends Model
{
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'patron_id', 'item_id',
        'checked_out_at', 'due_date', 'returned_at', 'renewed_at', 'renewals_count',
        'checked_out_by', 'returned_by',
        'fine_amount', 'fine_paid', 'fine_paid_at', 'fine_waived', 'fine_waived_by',
        'notes',
    ];

    protected $casts = [
        'checked_out_at' => 'datetime',
        'due_date'       => 'date',
        'returned_at'    => 'datetime',
        'renewed_at'     => 'datetime',
        'fine_paid_at'   => 'datetime',
        'fine_paid'      => 'boolean',
        'fine_waived'    => 'boolean',
        'fine_amount'    => 'decimal:2',
    ];

    protected static function booted(): void
    {
        static::creating(function (self $l) {
            if (empty($l->id)) {
                $l->id = (string) \Illuminate\Support\Str::uuid();
            }
        });
    }

    public function patron()
    {
        return $this->belongsTo(Patron::class);
    }

    public function item()
    {
        return $this->belongsTo(PhysicalItem::class, 'item_id');
    }

    public function isReturned(): bool
    {
        return ! is_null($this->returned_at);
    }

    public function isOverdue(): bool
    {
        if ($this->isReturned()) return false;
        return Carbon::today()->gt($this->due_date);
    }

    public function daysOverdue(): int
    {
        if (! $this->isOverdue()) return 0;
        return Carbon::today()->diffInDays($this->due_date);
    }
}
