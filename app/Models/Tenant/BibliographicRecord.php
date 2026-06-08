<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Laravel\Scout\Searchable;

class BibliographicRecord extends Model
{
    use HasFactory, SoftDeletes, Searchable;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        // Core bibliographic
        'title', 'title_alternative', 'subtitle', 'title_km',
        'authors', 'isbn', 'issn', 'doi',
        'publisher', 'publisher_place', 'publication_year', 'edition',
        'volume', 'issue', 'pages', 'language',
        'subjects', 'keywords', 'ddc_class', 'lcc_class',
        'abstract', 'abstract_km', 'material_type_id',
        'rights', 'series_title', 'series_number',
        'geographic_coverage', 'source',
        'notes', 'table_of_contents', 'cover_image_url',
        'record_status', 'cataloger_id', 'deleted_by',

        // BIBFRAME Work linkage
        'work_id',

        // BIBFRAME / RDA Instance fields
        'responsibility_statement',
        'content_type',
        'media_type',
        'carrier_type',
        'issuance',
        'dimensions',
        'frequency',
        'color_content',
        'illustrative_content',
        'publication_date_full',
        'country_code',
        'genre_form',
        'identifiers',

        // MARC21 preservation
        'marc_xml',
        'marc_leader',
        'marc_008',

        // BIBFRAME linked data
        'bibframe_data',
        'bibframe_instance_uri',
    ];

    protected $casts = [
        'authors'               => 'array',
        'subjects'              => 'array',
        'keywords'              => 'array',
        'illustrative_content'  => 'array',
        'genre_form'            => 'array',
        'identifiers'           => 'array',
        'bibframe_data'         => 'array',
        'publication_year'      => 'integer',
        'cataloged_at'          => 'datetime',
    ];

    protected static function booted(): void
    {
        static::creating(function (self $record) {
            if (empty($record->id)) {
                $record->id = (string) \Illuminate\Support\Str::uuid();
            }
        });

        static::deleting(function (self $record) {
            if (! $record->isForceDeleting()) {
                $record->deleted_by = auth()->id();
                $record->saveQuietly();
            } else {
                // When force deleting, also force delete associated digital resources
                // This triggers storage cleanup in DigitalResource model
                $record->digitalResources()->forceDelete();
            }
        });
    }

    // ─── Relationships ────────────────────────────────────────────────────────

    public function work(): BelongsTo
    {
        return $this->belongsTo(Work::class, 'work_id');
    }

    public function materialType(): BelongsTo
    {
        return $this->belongsTo(MaterialType::class);
    }

    public function physicalItems(): HasMany
    {
        return $this->hasMany(PhysicalItem::class, 'biblio_id');
    }

    public function digitalResources(): HasMany
    {
        return $this->hasMany(DigitalResource::class, 'biblio_id');
    }

    public function reservations(): HasMany
    {
        return $this->hasMany(Reservation::class, 'biblio_id');
    }

    public function contributions(): HasMany
    {
        return $this->hasMany(InstanceContribution::class, 'instance_id');
    }

    // ─── Scout searchable ────────────────────────────────────────────────────

    public function toSearchableArray(): array
    {
        return [
            'id'               => $this->id,
            'title'            => $this->title,
            'title_km'         => $this->title_km,
            'authors'          => collect($this->authors)->pluck('name')->implode(' '),
            'publisher'        => $this->publisher,
            'abstract'         => $this->abstract,
            'keywords'         => is_array($this->keywords) ? implode(' ', $this->keywords) : $this->keywords,
            'isbn'             => $this->isbn,
            'publication_year' => $this->publication_year,
        ];
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    public function availableCopies(): int
    {
        return $this->physicalItems()->where('item_status', 'available')->count();
    }

    public function hasDigital(): bool
    {
        return $this->digitalResources()->exists();
    }

    public function primaryAuthor(): ?string
    {
        $authors = $this->authors ?? [];
        return $authors[0]['name'] ?? null;
    }

    /**
     * Merges scalar isbn/issn/doi columns with the identifiers JSON array
     * to produce a unified identifier list.
     */
    public function allIdentifiers(): array
    {
        $ids = collect($this->identifiers ?? []);

        if ($this->isbn && ! $ids->contains('value', $this->isbn)) {
            $ids->prepend(['type' => 'isbn', 'value' => $this->isbn, 'qualifier' => null, 'status' => 'current']);
        }
        if ($this->issn && ! $ids->contains('value', $this->issn)) {
            $ids->prepend(['type' => 'issn', 'value' => $this->issn, 'qualifier' => null, 'status' => 'current']);
        }
        if ($this->doi && ! $ids->contains('value', $this->doi)) {
            $ids->push(['type' => 'doi', 'value' => $this->doi, 'qualifier' => null, 'status' => 'current']);
        }

        return $ids->values()->all();
    }

    public function toBibframeInstanceJsonLd(): array
    {
        $result = [
            '@type'          => 'bf:Instance',
            'bf:title'       => ['@type' => 'bf:Title', 'bf:mainTitle' => $this->title],
            'bf:provisionActivity' => [],
            'bf:identifiedBy' => [],
        ];

        if ($this->bibframe_instance_uri) {
            $result['@id'] = $this->bibframe_instance_uri;
        }
        if ($this->publisher) {
            $result['bf:provisionActivity'][] = [
                '@type'    => 'bf:Publication',
                'bf:agent' => ['@type' => 'bf:Agent', 'rdfs:label' => $this->publisher],
                'bf:place' => $this->publisher_place ? ['@type' => 'bf:Place', 'rdfs:label' => $this->publisher_place] : null,
                'bf:date'  => (string) $this->publication_year,
            ];
        }
        foreach ($this->allIdentifiers() as $id) {
            $type = match ($id['type'] ?? '') {
                'isbn'  => 'bf:Isbn',
                'issn'  => 'bf:Issn',
                'lccn'  => 'bf:Lccn',
                'oclc'  => 'bf:Oclcn',
                'doi'   => 'bf:Doi',
                default => 'bf:Identifier',
            };
            $entry = ['@type' => $type, 'rdf:value' => $id['value']];
            if (! empty($id['qualifier'])) {
                $entry['bf:qualifier'] = $id['qualifier'];
            }
            $result['bf:identifiedBy'][] = $entry;
        }
        if ($this->edition) {
            $result['bf:editionStatement'] = $this->edition;
        }
        if ($this->pages) {
            $result['bf:extent'] = ['@type' => 'bf:Extent', 'rdfs:label' => $this->pages];
        }
        if ($this->dimensions) {
            $result['bf:dimensions'] = $this->dimensions;
        }
        if ($this->content_type) {
            $result['bf:content'] = ['@type' => 'bf:Content', 'rdfs:label' => $this->content_type];
        }
        if ($this->media_type) {
            $result['bf:media'] = ['@type' => 'bf:Media', 'rdfs:label' => $this->media_type];
        }
        if ($this->carrier_type) {
            $result['bf:carrier'] = ['@type' => 'bf:Carrier', 'rdfs:label' => $this->carrier_type];
        }
        if ($this->responsibility_statement) {
            $result['bf:responsibilityStatement'] = $this->responsibility_statement;
        }

        // Nested Items
        $items = $this->physicalItems()->get();
        if ($items->isNotEmpty()) {
            $result['bf:hasItem'] = $items->map(fn($item) => [
                '@type'         => 'bf:Item',
                'bf:barcode'    => $item->barcode,
                'bf:shelfMark'  => $item->call_number,
                'bf:itemStatus' => $item->item_status,
            ])->values()->all();
        }

        return $result;
    }
}
