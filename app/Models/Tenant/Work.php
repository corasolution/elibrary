<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Work extends Model
{
    use HasUuids, SoftDeletes;

    protected $fillable = [
        'title',
        'title_km',
        'title_uniform',
        'language',
        'languages',
        'content_type',
        'issuance',
        'origin_date',
        'subjects',
        'keywords',
        'genre_form',
        'ddc_class',
        'lcc_class',
        'summary',
        'summary_km',
        'table_of_contents',
        'notes',
        'series_title',
        'series_number',
        'lccn',
        'oclc_number',
        'authority_uri',
        'bibframe_data',
        'record_status',
        'cataloger_id',
        'cataloged_at',
    ];

    protected $casts = [
        'languages'    => 'array',
        'subjects'     => 'array',
        'genre_form'   => 'array',
        'bibframe_data' => 'array',
        'cataloged_at' => 'datetime',
    ];

    public function instances(): HasMany
    {
        return $this->hasMany(BibliographicRecord::class, 'work_id');
    }

    public function contributions(): HasMany
    {
        return $this->hasMany(WorkContribution::class, 'work_id');
    }

    public function primaryContribution(): ?WorkContribution
    {
        return $this->contributions()->where('is_primary', true)->orderBy('sort_order')->first();
    }

    public function primaryAuthorName(): ?string
    {
        $contribution = $this->primaryContribution();
        if (! $contribution) {
            return null;
        }
        return $contribution->agent?->name ?? $contribution->agent_name;
    }

    public function toBibframeJsonLd(): array
    {
        $contributions = $this->contributions()->with('agent')->orderBy('sort_order')->get();
        $instances     = $this->instances()->with(['contributions.agent', 'physicalItems'])->get();

        $contributors = $contributions->map(function (WorkContribution $c) {
            $agent = [
                '@type'      => $this->bibframeAgentType($c->agent_type),
                'bf:label'   => $c->agent?->name ?? $c->agent_name,
                'bf:role'    => [
                    '@type'  => 'bf:Role',
                    '@id'    => $c->relator_uri ?? "http://id.loc.gov/vocabulary/relators/{$c->role_code}",
                    'bf:code' => $c->role_code,
                    'rdfs:label' => $c->role_label ?? $c->role_code,
                ],
            ];
            if ($c->agent?->authority_uri) {
                $agent['@id'] = $c->agent->authority_uri;
            }
            return ['@type' => 'bf:Contribution', 'bf:agent' => $agent];
        });

        $result = [
            '@context' => [
                'bf'    => 'http://id.loc.gov/ontologies/bibframe/',
                'bflc'  => 'http://id.loc.gov/ontologies/bflc/',
                'rdfs'  => 'http://www.w3.org/2000/01/rdf-schema#',
                'madsrdf' => 'http://www.loc.gov/mads/rdf/v1#',
            ],
            '@type'         => 'bf:Work',
            'bf:title'      => [
                '@type'       => 'bf:Title',
                'bf:mainTitle' => $this->title,
            ],
            'bf:language'   => ['@id' => "http://id.loc.gov/vocabulary/languages/{$this->language}"],
            'bf:contribution' => $contributors,
        ];

        if ($this->title_uniform) {
            $result['bf:title']['bf:variantTitle'] = ['@type' => 'bf:VariantTitle', 'bf:variantType' => 'uniform', 'bf:mainTitle' => $this->title_uniform];
        }
        if ($this->content_type) {
            $result['bf:content'] = ['@type' => 'bf:Content', 'rdfs:label' => $this->content_type];
        }
        if ($this->issuance) {
            $result['bf:issuance'] = ['@type' => 'bf:Issuance', 'rdfs:label' => $this->issuance];
        }
        if ($this->summary) {
            $result['bf:summary'] = ['@type' => 'bf:Summary', 'rdfs:label' => $this->summary];
        }
        if ($this->lccn) {
            $result['bf:identifiedBy'][] = ['@type' => 'bf:Lccn', 'rdf:value' => $this->lccn];
        }
        if ($this->oclc_number) {
            $result['bf:identifiedBy'][] = ['@type' => 'bf:Oclcn', 'rdf:value' => $this->oclc_number];
        }
        if ($this->subjects) {
            $result['bf:subject'] = collect($this->subjects)->map(fn($s) => [
                '@type'      => 'bf:Topic',
                'rdfs:label' => $s['term'] ?? $s,
            ])->values()->all();
        }
        if ($this->ddc_class) {
            $result['bf:classification'][] = ['@type' => 'bf:ClassificationDdc', 'bf:classificationNumber' => $this->ddc_class];
        }
        if ($this->lcc_class) {
            $result['bf:classification'][] = ['@type' => 'bf:ClassificationLcc', 'bf:classificationNumber' => $this->lcc_class];
        }

        // Nest instances
        $result['bf:hasInstance'] = $instances->map(fn($i) => $i->toBibframeInstanceJsonLd())->values()->all();

        return $result;
    }

    private function bibframeAgentType(string $type): string
    {
        return match ($type) {
            'organization' => 'bf:Organization',
            'meeting'      => 'bf:Meeting',
            'family'       => 'bf:Family',
            default        => 'bf:Person',
        };
    }
}
