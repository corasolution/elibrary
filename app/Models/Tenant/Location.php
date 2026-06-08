<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;

class Location extends Model
{
    protected $fillable = [
        'parent_id', 'name', 'name_km', 'code', 'address', 'is_branch', 'is_active',
    ];

    protected $casts = [
        'is_branch' => 'boolean',
        'is_active' => 'boolean',
    ];

    public function parent()
    {
        return $this->belongsTo(Location::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(Location::class, 'parent_id');
    }

    public function physicalItems()
    {
        return $this->hasMany(PhysicalItem::class);
    }
}
