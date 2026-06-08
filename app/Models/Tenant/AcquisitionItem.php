<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;

class AcquisitionItem extends Model
{
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'order_id', 'biblio_id', 'quantity', 'unit_price', 'received_qty', 'notes',
    ];

    protected $casts = [
        'unit_price'   => 'decimal:2',
        'quantity'     => 'integer',
        'received_qty' => 'integer',
    ];

    protected static function booted(): void
    {
        static::creating(function (self $m) {
            if (empty($m->id)) $m->id = (string) \Illuminate\Support\Str::uuid();
        });
    }

    public function order()
    {
        return $this->belongsTo(AcquisitionOrder::class, 'order_id');
    }

    public function bibliographicRecord()
    {
        return $this->belongsTo(BibliographicRecord::class, 'biblio_id');
    }
}
