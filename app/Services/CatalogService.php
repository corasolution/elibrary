<?php

namespace App\Services;

use App\Models\Tenant\Agent;
use App\Models\Tenant\BibliographicRecord;
use App\Models\Tenant\DigitalResource;
use App\Models\Tenant\PhysicalItem;
use App\Models\Tenant\Work;
use App\Models\Tenant\WorkContribution;
use App\Jobs\ProcessDigitalFile;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class CatalogService
{
    public function createRecord(array $data): BibliographicRecord
    {
        return DB::transaction(function () use ($data) {
            // Find or create the BIBFRAME Work from title + language + primary author
            $work = $this->findOrCreateWork($data);

            $biblioData = $this->extractBiblioData($data);
            $biblioData['work_id'] = $work->id;

            $biblio = BibliographicRecord::create($biblioData);

            if (! empty($data['physical'])) {
                $this->createPhysicalItems($biblio, $data['physical']);
            }

            if (! empty($data['digital'])) {
                $this->createDigitalResource($biblio, $data['digital']);
            }

            // Regenerate BIBFRAME snapshot on the Work after adding this Instance
            $this->regenerateWorkBibframeSnapshot($work);

            activity()->on($biblio)->log('created');

            return $biblio->fresh(['materialType', 'physicalItems', 'digitalResources', 'work']);
        });
    }

    public function updateRecord(BibliographicRecord $biblio, array $data): BibliographicRecord
    {
        return DB::transaction(function () use ($biblio, $data) {
            $biblioData = $this->extractBiblioData($data);

            // Re-link to Work if title changed
            if (isset($data['title']) && $data['title'] !== $biblio->title) {
                $work = $this->findOrCreateWork($data);
                $biblioData['work_id'] = $work->id;
            }

            $biblio->update($biblioData);

            if (isset($data['physical'])) {
                $this->syncPhysicalItems($biblio, $data['physical']);
            }

            if (isset($data['digital'])) {
                $this->syncDigitalResource($biblio, $data['digital']);
            }

            if ($biblio->work_id) {
                $this->regenerateWorkBibframeSnapshot(Work::find($biblio->work_id));
            }

            activity()->on($biblio)->log('updated');

            return $biblio->fresh(['materialType', 'physicalItems', 'digitalResources', 'work']);
        });
    }

    public function searchCatalog(string $query, array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        $q = BibliographicRecord::query()
            ->with(['materialType', 'physicalItems', 'digitalResources'])
            ->where('record_status', 'active');

        if (! empty($query)) {
            if (\Illuminate\Support\Facades\DB::getDriverName() === 'pgsql') {
                $q->whereRaw(
                    "search_vector @@ plainto_tsquery('english', ?)",
                    [$query]
                )->orderByRaw(
                    "ts_rank(search_vector, plainto_tsquery('english', ?)) DESC",
                    [$query]
                );
            } else {
                // SQLite / non-PostgreSQL fallback: LIKE search
                $q->where(function ($w) use ($query) {
                    $w->where('title', 'like', "%{$query}%")
                      ->orWhere('abstract', 'like', "%{$query}%")
                      ->orWhere('isbn', 'like', "%{$query}%")
                      ->orWhereRaw("LOWER(authors) LIKE ?", ['%' . strtolower($query) . '%']);
                });
            }
        }

        if (! empty($filters['material_type_id'])) {
            $q->where('material_type_id', $filters['material_type_id']);
        }
        if (! empty($filters['language'])) {
            $q->where('language', $filters['language']);
        }
        if (! empty($filters['year_from'])) {
            $q->where('publication_year', '>=', $filters['year_from']);
        }
        if (! empty($filters['year_to'])) {
            $q->where('publication_year', '<=', $filters['year_to']);
        }
        if (! empty($filters['availability'])) {
            if ($filters['availability'] === 'available') {
                $q->whereHas('physicalItems', fn ($i) => $i->where('item_status', 'available'));
            } elseif ($filters['availability'] === 'digital') {
                $q->whereHas('digitalResources');
            }
        }

        $sort = $filters['sort'] ?? 'relevance';
        if ($sort === 'title') $q->orderBy('title');
        elseif ($sort === 'year_desc') $q->orderByDesc('publication_year');
        elseif ($sort === 'year_asc') $q->orderBy('publication_year');
        else $q->latest('cataloged_at');

        return $q->paginate($perPage);
    }

    public function lookupByISBN(string $isbn): ?array
    {
        $isbn = preg_replace('/[^0-9X]/', '', strtoupper($isbn));

        return Cache::remember("isbn_lookup_{$isbn}", now()->addDays(30), function () use ($isbn) {
            try {
                $response = Http::timeout(10)->get(config('services.open_library.url'), [
                    'bibkeys'  => "ISBN:{$isbn}",
                    'format'   => 'json',
                    'jscmd'    => 'data',
                ]);

                if (! $response->ok()) return null;

                $data = $response->json()["ISBN:{$isbn}"] ?? null;
                if (! $data) return null;

                return [
                    'title'            => $data['title'] ?? null,
                    'subtitle'         => $data['subtitle'] ?? null,
                    'authors'          => collect($data['authors'] ?? [])->map(fn ($a) => ['name' => $a['name'], 'role' => 'aut'])->toArray(),
                    'publisher'        => $data['publishers'][0]['name'] ?? null,
                    'publication_year' => isset($data['publish_date']) ? (int) substr($data['publish_date'], -4) : null,
                    'subjects'         => collect($data['subjects'] ?? [])->take(5)->map(fn ($s) => ['term' => $s['name'], 'scheme' => 'LCSH'])->toArray(),
                    'cover_image_url'  => $data['cover']['large'] ?? $data['cover']['medium'] ?? null,
                    'isbn'             => $isbn,
                ];
            } catch (\Throwable $e) {
                Log::warning("ISBN lookup failed for {$isbn}: {$e->getMessage()}");
                return null;
            }
        });
    }

    // ─── BIBFRAME Work management ────────────────────────────────────────────

    /**
     * Find an existing Work or create a new one based on title + language + primary author.
     * Deduplication strategy: LCCN match first, then title+author exact match.
     */
    public function findOrCreateWork(array $data): Work
    {
        // LCCN match (most authoritative)
        if (! empty($data['lccn'])) {
            $work = Work::where('lccn', $data['lccn'])->first();
            if ($work) return $work;
        }

        // Title + primary author + language match
        $title    = $data['title'] ?? '';
        $language = $data['language'] ?? 'en';
        $authors  = $data['authors'] ?? [];
        $primaryAuthorName = $authors[0]['name'] ?? null;

        if ($primaryAuthorName) {
            $work = Work::where('title', $title)
                ->where('language', $language)
                ->whereHas('contributions', function ($q) use ($primaryAuthorName) {
                    $q->where('is_primary', true)
                      ->where(function ($q2) use ($primaryAuthorName) {
                          $q2->where('agent_name', $primaryAuthorName)
                             ->orWhereHas('agent', fn ($q3) => $q3->where('name', $primaryAuthorName));
                      });
                })->first();
            if ($work) return $work;
        }

        // Create new Work
        return DB::transaction(function () use ($data, $title, $language, $authors) {
            $work = Work::create([
                'title'           => $title,
                'title_km'        => $data['title_km'] ?? null,
                'language'        => $language,
                'content_type'    => $data['content_type'] ?? null,
                'issuance'        => $data['issuance'] ?? 'mono',
                'subjects'        => $data['subjects'] ?? [],
                'keywords'        => $data['keywords'] ?? null,
                'ddc_class'       => $data['ddc_class'] ?? null,
                'lcc_class'       => $data['lcc_class'] ?? null,
                'summary'         => $data['abstract'] ?? null,
                'summary_km'      => $data['abstract_km'] ?? null,
                'series_title'    => $data['series_title'] ?? null,
                'series_number'   => $data['series_number'] ?? null,
                'lccn'            => $data['lccn'] ?? null,
                'oclc_number'     => $data['oclc_number'] ?? null,
                'record_status'   => 'active',
                'cataloger_id'    => auth()->id(),
            ]);

            // Create Work contributions from authors array
            foreach ($authors as $index => $author) {
                if (empty($author['name'])) continue;

                $agent = Agent::firstOrCreate(
                    ['name' => $author['name'], 'type' => $author['agent_type'] ?? 'person'],
                    ['name' => $author['name'], 'type' => $author['agent_type'] ?? 'person']
                );

                $roleCode = $author['role'] ?? $author['role_code'] ?? 'aut';

                WorkContribution::create([
                    'work_id'     => $work->id,
                    'agent_id'    => $agent->id,
                    'agent_name'  => $author['name'],
                    'agent_type'  => $author['agent_type'] ?? 'person',
                    'role_code'   => $roleCode,
                    'role_label'  => $this->roleLabelFromCode($roleCode),
                    'relator_uri' => "http://id.loc.gov/vocabulary/relators/{$roleCode}",
                    'is_primary'  => $index === 0,
                    'sort_order'  => $index,
                ]);
            }

            return $work;
        });
    }

    /**
     * Regenerate the BIBFRAME JSON-LD snapshot stored on the Work.
     */
    public function regenerateWorkBibframeSnapshot(Work $work): void
    {
        $work->load(['contributions.agent', 'instances.physicalItems']);
        $snapshot = $work->toBibframeJsonLd();
        $work->updateQuietly(['bibframe_data' => $snapshot]);
    }

    /**
     * Generate MARC21 XML for a BibliographicRecord (Instance + Work data).
     * Stores result in marc_xml column.
     */
    public function generateMarcXml(BibliographicRecord $instance): string
    {
        $work = $instance->work ?? new Work(['title' => $instance->title]);
        $contributions = $work->contributions()->with('agent')->orderBy('sort_order')->get();

        $fields = [];

        // Leader (positions 0-23)
        $leader = $instance->marc_leader ?? '00000nam a2200000 i 4500';
        $fields[] = "<leader>{$leader}</leader>";

        // 008 fixed-length data elements
        if ($instance->marc_008) {
            $fields[] = "<controlfield tag=\"008\">{$instance->marc_008}</controlfield>";
        }

        // 020 ISBN
        foreach ($instance->allIdentifiers() as $id) {
            if ($id['type'] === 'isbn') {
                $fields[] = $this->marcDatafield('020', ' ', ' ', ['a' => $id['value']]);
            }
            if ($id['type'] === 'issn') {
                $fields[] = $this->marcDatafield('022', ' ', ' ', ['a' => $id['value']]);
            }
            if ($id['type'] === 'lccn') {
                $fields[] = $this->marcDatafield('010', ' ', ' ', ['a' => $id['value']]);
            }
        }

        // 040 Cataloging source
        $fields[] = $this->marcDatafield('040', ' ', ' ', ['a' => 'KHA', 'b' => 'eng', 'e' => 'rda', 'c' => 'KHA']);

        // 050 LCC
        if ($work->lcc_class) {
            $fields[] = $this->marcDatafield('050', ' ', '4', ['a' => $work->lcc_class]);
        }

        // 082 DDC
        if ($work->ddc_class) {
            $fields[] = $this->marcDatafield('082', '0', '4', ['a' => $work->ddc_class, '2' => '23']);
        }

        // 1XX Primary entry
        $primary = $contributions->firstWhere('is_primary', true);
        if ($primary) {
            $name = $primary->agent?->formattedName() ?? $primary->agent_name ?? '';
            $type = $primary->agent_type ?? 'person';
            $tag  = $type === 'organization' ? '110' : ($type === 'meeting' ? '111' : '100');
            $ind1 = $type === 'person' ? '1' : '2';
            $fields[] = $this->marcDatafield($tag, $ind1, ' ', [
                'a' => $name,
                'e' => $primary->role_label ?? $this->roleLabelFromCode($primary->role_code),
                '4' => "http://id.loc.gov/vocabulary/relators/{$primary->role_code}",
            ]);
        }

        // 245 Title statement
        $titleSubfields = ['a' => $instance->title];
        if ($instance->subtitle) {
            $titleSubfields['b'] = $instance->subtitle;
        }
        if ($instance->responsibility_statement) {
            $titleSubfields['c'] = $instance->responsibility_statement;
        }
        $fields[] = $this->marcDatafield('245', $primary ? '1' : '0', '0', $titleSubfields);

        // 250 Edition statement
        if ($instance->edition) {
            $fields[] = $this->marcDatafield('250', ' ', ' ', ['a' => $instance->edition]);
        }

        // 264 Production/publication
        if ($instance->publisher || $instance->publisher_place || $instance->publication_year) {
            $pubSubfields = [];
            if ($instance->publisher_place) $pubSubfields['a'] = $instance->publisher_place . ' :';
            if ($instance->publisher)       $pubSubfields['b'] = $instance->publisher . ',';
            if ($instance->publication_year) $pubSubfields['c'] = (string) $instance->publication_year;
            $fields[] = $this->marcDatafield('264', ' ', '1', $pubSubfields);
        }

        // 300 Physical description
        if ($instance->pages || $instance->dimensions) {
            $physSubfields = [];
            if ($instance->pages)      $physSubfields['a'] = $instance->pages;
            if ($instance->dimensions) $physSubfields['c'] = $instance->dimensions;
            $fields[] = $this->marcDatafield('300', ' ', ' ', $physSubfields);
        }

        // 336/337/338 RDA content/media/carrier
        if ($instance->content_type) {
            $fields[] = $this->marcDatafield('336', ' ', ' ', ['a' => $instance->content_type, 'b' => 'txt', '2' => 'rdacontent']);
        }
        if ($instance->media_type) {
            $fields[] = $this->marcDatafield('337', ' ', ' ', ['a' => $instance->media_type, 'b' => 'n', '2' => 'rdamedia']);
        }
        if ($instance->carrier_type) {
            $fields[] = $this->marcDatafield('338', ' ', ' ', ['a' => $instance->carrier_type, 'b' => 'nc', '2' => 'rdacarrier']);
        }

        // 490 Series
        if ($work->series_title) {
            $seriesSubfields = ['a' => $work->series_title];
            if ($work->series_number) $seriesSubfields['v'] = $work->series_number;
            $fields[] = $this->marcDatafield('490', '0', ' ', $seriesSubfields);
        }

        // 500 General note
        if ($work->notes) {
            $fields[] = $this->marcDatafield('500', ' ', ' ', ['a' => $work->notes]);
        }

        // 520 Summary
        if ($work->summary) {
            $fields[] = $this->marcDatafield('520', ' ', ' ', ['a' => $work->summary]);
        }

        // 650 Subject headings
        foreach ((array) $work->subjects as $subject) {
            $term = is_array($subject) ? ($subject['term'] ?? '') : $subject;
            if ($term) {
                $fields[] = $this->marcDatafield('650', ' ', '0', ['a' => $term]);
            }
        }

        // 700 Added entries (secondary contributors)
        foreach ($contributions->where('is_primary', false) as $c) {
            $name = $c->agent?->formattedName() ?? $c->agent_name ?? '';
            if (! $name) continue;
            $tag  = ($c->agent_type ?? 'person') === 'organization' ? '710' : '700';
            $fields[] = $this->marcDatafield($tag, '1', ' ', [
                'a' => $name,
                'e' => $c->role_label ?? $this->roleLabelFromCode($c->role_code),
                '4' => "http://id.loc.gov/vocabulary/relators/{$c->role_code}",
            ]);
        }

        $fieldsXml = implode("\n  ", $fields);
        $xml = <<<XML
<?xml version="1.0" encoding="UTF-8"?>
<record xmlns="http://www.loc.gov/MARC21/slim">
  {$fieldsXml}
</record>
XML;

        $instance->updateQuietly(['marc_xml' => $xml]);

        return $xml;
    }

    // ─── Private helpers ─────────────────────────────────────────────────────

    private function extractBiblioData(array $data): array
    {
        return collect($data)->only([
            // Original fields
            'title', 'title_alternative', 'subtitle', 'title_km',
            'authors', 'isbn', 'issn', 'doi',
            'publisher', 'publisher_place', 'publication_year', 'edition',
            'volume', 'issue', 'pages', 'language',
            'subjects', 'keywords', 'ddc_class', 'lcc_class',
            'abstract', 'abstract_km', 'material_type_id',
            'rights', 'series_title', 'series_number',
            'geographic_coverage', 'source',
            'notes', 'table_of_contents', 'cover_image_url',
            // BIBFRAME fields
            'responsibility_statement', 'content_type', 'media_type', 'carrier_type',
            'issuance', 'dimensions', 'frequency', 'color_content',
            'illustrative_content', 'publication_date_full', 'country_code',
            'genre_form', 'identifiers', 'marc_leader', 'marc_008',
        ])->toArray();
    }

    private function createPhysicalItems(BibliographicRecord $biblio, array $physical): void
    {
        $quantity = (int) ($physical['quantity'] ?? 1);
        for ($i = 0; $i < $quantity; $i++) {
            PhysicalItem::create(array_merge(
                collect($physical)->except('quantity')->toArray(),
                ['biblio_id' => $biblio->id]
            ));
        }
    }

    private function syncPhysicalItems(BibliographicRecord $biblio, array $physical): void
    {
        if (! empty($physical['id'])) {
            $biblio->physicalItems()->where('id', $physical['id'])->update(
                collect($physical)->except(['id', 'quantity', 'biblio_id'])->toArray()
            );
        } else {
            $this->createPhysicalItems($biblio, $physical);
        }
    }

    private function createDigitalResource(BibliographicRecord $biblio, array $digital): void
    {
        $resource = DigitalResource::create(array_merge(
            collect($digital)->except(['file', 'enable_ocr'])->toArray(),
            ['biblio_id' => $biblio->id]
        ));

        if (! empty($digital['file'])) {
            ProcessDigitalFile::dispatch($resource, $digital['file'], $digital['enable_ocr'] ?? false);
        }
    }

    private function syncDigitalResource(BibliographicRecord $biblio, array $digital): void
    {
        $existing = $biblio->digitalResources()->first();
        if ($existing) {
            $existing->update(collect($digital)->except(['file', 'enable_ocr', 'biblio_id'])->toArray());
            if (! empty($digital['file'])) {
                ProcessDigitalFile::dispatch($existing, $digital['file'], $digital['enable_ocr'] ?? false);
            }
        } else {
            $this->createDigitalResource($biblio, $digital);
        }
    }

    private function marcDatafield(string $tag, string $ind1, string $ind2, array $subfields): string
    {
        $subXml = '';
        foreach ($subfields as $code => $value) {
            if ($value === null || $value === '') continue;
            $escaped = htmlspecialchars((string) $value, ENT_XML1 | ENT_COMPAT, 'UTF-8');
            $subXml .= "<subfield code=\"{$code}\">{$escaped}</subfield>";
        }
        return "<datafield tag=\"{$tag}\" ind1=\"{$ind1}\" ind2=\"{$ind2}\">{$subXml}</datafield>";
    }

    private function roleLabelFromCode(string $code): string
    {
        return match ($code) {
            'aut'  => 'author',
            'edt'  => 'editor',
            'trl'  => 'translator',
            'ill'  => 'illustrator',
            'cmp'  => 'composer',
            'pht'  => 'photographer',
            'prf'  => 'performer',
            'nrt'  => 'narrator',
            'pro'  => 'producer',
            'drt'  => 'director',
            default => $code,
        };
    }
}
