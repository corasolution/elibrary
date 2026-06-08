<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;

class MaterialType extends Model
{
    protected $fillable = [
        'code', 'name', 'name_km', 'icon',
        'has_physical', 'has_digital', 'is_active', 'sort_order',
    ];

    protected $casts = [
        'has_physical' => 'boolean',
        'has_digital'  => 'boolean',
        'is_active'    => 'boolean',
    ];

    public function bibliographicRecords()
    {
        return $this->hasMany(BibliographicRecord::class);
    }
}
