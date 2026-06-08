<?php

namespace App\Models\Central;

use Illuminate\Database\Eloquent\Model;

class Subscription extends Model
{
    protected $connection = 'central';

    protected $fillable = [
        'tenant_id', 'plan_id', 'status',
        'current_period_start', 'current_period_end',
        'payment_method', 'external_subscription_id', 'metadata',
    ];

    protected $casts = [
        'current_period_start' => 'datetime',
        'current_period_end'   => 'datetime',
        'metadata'             => 'array',
    ];

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function plan()
    {
        return $this->belongsTo(Plan::class);
    }

    public function isActive(): bool
    {
        return in_array($this->status, ['active', 'trialing']);
    }
}
