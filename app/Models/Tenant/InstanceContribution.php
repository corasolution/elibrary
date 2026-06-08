<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InstanceContribution extends Model
{
    use HasUuids;

    protected $fillable = [
        'instance_id',
        'agent_id',
        'agent_name',
        'agent_type',
        'role_code',
        'role_label',
        'relator_uri',
        'is_primary',
        'sort_order',
    ];

    protected $casts = [
        'is_primary' => 'boolean',
        'sort_order' => 'integer',
    ];

    public function instance(): BelongsTo
    {
        return $this->belongsTo(BibliographicRecord::class, 'instance_id');
    }

    public function agent(): BelongsTo
    {
        return $this->belongsTo(Agent::class, 'agent_id');
    }

    public function displayName(): string
    {
        return $this->agent?->name ?? $this->agent_name ?? '';
    }
}
