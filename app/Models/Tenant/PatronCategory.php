<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;

class PatronCategory extends Model
{
    protected $fillable = [
        'name', 'name_km', 'loan_limit', 'loan_period_days',
        'renewals_allowed', 'reservation_limit',
        'fine_rate_per_day', 'max_fine', 'is_active',
    ];

    protected $casts = [
        'is_active'         => 'boolean',
        'fine_rate_per_day' => 'decimal:2',
        'max_fine'          => 'decimal:2',
    ];

    public function patrons()
    {
        return $this->hasMany(Patron::class);
    }
}
