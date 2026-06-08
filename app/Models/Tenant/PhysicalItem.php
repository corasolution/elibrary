<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PhysicalItem extends Model
{
    use SoftDeletes;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'biblio_id', 'barcode', 'accession_number', 'call_number',
        'collection_id', 'location_id', 'shelf',
        'item_status', 'condition', 'price', 'currency',
        'acquired_date', 'supplier', 'purchase_order', 'notes',
    ];

    protected $casts = [
        'acquired_date' => 'date',
        'price'         => 'decimal:2',
    ];

    protected static function booted(): void
    {
        static::creating(function (self $item) {
            if (empty($item->id)) {
                $item->id = (string) \Illuminate\Support\Str::uuid();
            }
        });
    }

    public function bibliographicRecord()
    {
        return $this->belongsTo(BibliographicRecord::class, 'biblio_id');
    }

    public function collection()
    {
        return $this->belongsTo(Collection::class);
    }

    public function location()
    {
        return $this->belongsTo(Location::class);
    }

    public function activeloan()
    {
        return $this->hasOne(Loan::class, 'item_id')->whereNull('returned_at');
    }

    public function isAvailable(): bool
    {
        return $this->item_status === 'available';
    }
}
