<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;

class Collection extends Model
{
    protected $fillable = [
        'name', 'name_km', 'code', 'description',
        'is_loanable', 'loan_period_days', 'renewals_allowed',
        'fine_rate_per_day', 'is_active',
    ];

    protected $casts = [
        'is_loanable'       => 'boolean',
        'is_active'         => 'boolean',
        'fine_rate_per_day' => 'decimal:2',
    ];

    public function physicalItems()
    {
        return $this->hasMany(PhysicalItem::class);
    }
}
