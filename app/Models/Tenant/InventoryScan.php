<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;

class InventoryScan extends Model
{
    protected $fillable = [
        'session_id', 'item_id', 'barcode_scanned',
        'scan_status', 'scanned_by', 'scanned_at', 'notes',
    ];

    protected $casts = [
        'scanned_at' => 'datetime',
    ];

    public function session()
    {
        return $this->belongsTo(InventorySession::class, 'session_id');
    }

    public function item()
    {
        return $this->belongsTo(PhysicalItem::class, 'item_id');
    }
}
