<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Agent extends Model
{
    use HasUuids;

    protected $fillable = [
        'type',
        'name',
        'name_km',
        'numeration',
        'title_words',
        'dates',
        'fuller_form',
        'birth_date',
        'death_date',
        'location',
        'date_range',
        'authority_uri',
        'lc_id',
        'isni',
        'viaf_id',
        'orcid',
    ];

    public function workContributions(): HasMany
    {
        return $this->hasMany(WorkContribution::class, 'agent_id');
    }

    public function instanceContributions(): HasMany
    {
        return $this->hasMany(InstanceContribution::class, 'agent_id');
    }

    /** Full formatted name following MARC 100 $a $b $c $d conventions */
    public function formattedName(): string
    {
        $parts = [$this->name];
        if ($this->numeration) {
            $parts[] = $this->numeration;
        }
        if ($this->title_words) {
            $parts[] = $this->title_words;
        }
        if ($this->dates) {
            $parts[] = $this->dates;
        }
        return implode(', ', $parts);
    }
}
