<?php

namespace App\Models\Central;

use Illuminate\Database\Eloquent\Model;

/**
 * Central cross-tenant AI usage / earnings ledger.
 * Written from tenant context (provider services) into the central DB.
 */
class AiUsageLedger extends Model
{
    protected $connection = 'central';
    protected $table = 'ai_usage_ledger';

    const UPDATED_AT = null;

    protected $fillable = [
        'tenant_id', 'provider', 'feature',
        'input_tokens', 'output_tokens',
        'api_cost_usd', 'billed_usd', 'earning_usd',
        'created_at',
    ];

    protected $casts = [
        'input_tokens'  => 'integer',
        'output_tokens' => 'integer',
        'api_cost_usd'  => 'decimal:6',
        'billed_usd'    => 'decimal:6',
        'earning_usd'   => 'decimal:6',
        'created_at'    => 'datetime',
    ];

    public function tenant()
    {
        return $this->belongsTo(Tenant::class, 'tenant_id');
    }

    public function scopeThisMonth($q)
    {
        return $q->whereBetween('created_at', [now()->startOfMonth(), now()->endOfMonth()]);
    }
}
