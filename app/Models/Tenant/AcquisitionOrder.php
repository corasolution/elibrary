<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;

class AcquisitionOrder extends Model
{
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'order_number', 'supplier', 'order_date', 'expected_date',
        'received_date', 'status', 'total_amount', 'currency', 'notes',
    ];

    protected $casts = [
        'order_date'    => 'date',
        'expected_date' => 'date',
        'received_date' => 'date',
        'total_amount'  => 'decimal:2',
    ];

    protected static function booted(): void
    {
        static::creating(function (self $m) {
            if (empty($m->id)) $m->id = (string) \Illuminate\Support\Str::uuid();
        });
    }

    public function items()
    {
        return $this->hasMany(AcquisitionItem::class, 'order_id');
    }
}
