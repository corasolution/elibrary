<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Fetches bibliographic metadata from external library sources.
 *
 * Supported sources:
 *  - loc       Library of Congress (catalog.loc.gov SRU API) — free, no key
 *  - openlibrary Open Library (openlibrary.org) — free, no key
 *  - worldcat   WorldCat Basic API (search.worldcat.org) — free tier
 *  - crossref   CrossRef (api.crossref.org) — DOI/title lookup, free
 *  - googlebooks Google Books API — free, no key required for basic use
 */
class ImportService
{
    // ─── Main entry points ────────────────────────────────────────────────────

    /**
     * Search multiple sources simultaneously by ISBN, title, or author.
     * Returns array of normalized records from all sources.
     */
    public function search(string $query, string $type = 'isbn', array $sources = []): array
    {
        if (empty($sources)) {
            $sources = ['loc', 'openlibrary', 'googlebooks', 'crossref'];
        }

        $results = [];
        foreach ($sources as $source) {
            try {
                $data = match ($source) {
                    'loc'         => $this->searchLoc($query, $type),
                    'openlibrary' => $this->searchOpenLibrary($query, $type),
                    'googlebooks' => $this->searchGoogleBooks($query, $type),
                    'crossref'    => $this->searchCrossRef($query, $type),
                    default       => [],
                };
                foreach ($data as $record) {
                    $record['_source'] = $source;
                    $results[] = $record;
                }
            } catch (\Throwable $e) {
                Log::warning("ImportService [{$source}] failed: {$e->getMessage()}");
            }
        }

        return $results;
    }

    // ─── Library of Congress SRU ──────────────────────────────────────────────

    public function searchLoc(string $query, string $type = 'isbn'): array
    {
        $cacheKey = "import_loc_{$type}_" . md5($query);

        return Cache::remember($cacheKey, now()->addHours(24), function () use ($query, $type) {
            $cql = match ($type) {
                'isbn'   => "bath.isbn=\"{$query}\"",
                'lccn'   => "bath.lccn=\"{$query}\"",
                'author' => "dc.creator any \"{$query}\"",
                default  => "dc.title any \"{$query}\"",
            };

            $response = Http::timeout(15)->get('https://catalog.loc.gov/vwebv/search', [
                'searchCode' => 'GKEY%5E*',
                'searchType' => 1,
                'recCount'   => 5,
                'filter'     => 'all',
            ]);

            // LOC SRU endpoint
            $sruResponse = Http::timeout(15)
                ->withHeaders(['Accept' => 'application/xml'])
                ->get('https://lx2.loc.gov/sru/catalog', [
                    'version'            => '1.1',
                    'operation'          => 'searchRetrieve',
                    'query'              => $cql,
                    'maximumRecords'     => 5,
                    'recordSchema'       => 'mods',
                    'recordPacking'      => 'xml',
                ]);

            if (! $sruResponse->ok()) return [];

            return $this->parseMods($sruResponse->body(), 'loc');
        });
    }

    // ─── Open Library ────────────────────────────────────────────────────────

    public function searchOpenLibrary(string $query, string $type = 'isbn'): array
    {
        $cacheKey = "import_ol_{$type}_" . md5($query);

        return Cache::remember($cacheKey, now()->addHours(24), function () use ($query, $type) {
            if ($type === 'isbn') {
                // Detailed record via ISBN
                $isbn = preg_replace('/[^0-9X]/', '', strtoupper($query));
                $response = Http::timeout(10)->get('https://openlibrary.org/api/books', [
                    'bibkeys' => "ISBN:{$isbn}",
                    'format'  => 'json',
                    'jscmd'   => 'data',
                ]);
                if (! $response->ok()) return [];
                $data = $response->json()["ISBN:{$isbn}"] ?? null;
                if (! $data) return [];
                return [$this->normalizeOpenLibraryRecord($data, $isbn)];
            }

            // Title/author search
            $field = $type === 'author' ? 'author' : 'title';
            $response = Http::timeout(10)->get('https://openlibrary.org/search.json', [
                $field  => $query,
                'limit' => 5,
                'fields' => 'key,title,author_name,isbn,publisher,first_publish_year,subject,cover_i,language,number_of_pages_median,lccn,oclc',
            ]);
            if (! $response->ok()) return [];

            return collect($response->json()['docs'] ?? [])
                ->map(fn ($doc) => $this->normalizeOpenLibrarySearch($doc))
                ->filter()
                ->values()
                ->all();
        });
    }

    // ─── Google Books ─────────────────────────────────────────────────────────

    public function searchGoogleBooks(string $query, string $type = 'isbn'): array
    {
        $cacheKey = "import_gb_{$type}_" . md5($query);

        return Cache::remember($cacheKey, now()->addHours(24), function () use ($query, $type) {
            $q = match ($type) {
                'isbn'   => "isbn:{$query}",
                'author' => "inauthor:{$query}",
                default  => "intitle:{$query}",
            };

            $params = ['q' => $q, 'maxResults' => 5, 'printType' => 'books'];
            if ($key = config('services.google_books.key')) {
                $params['key'] = $key;
            }

            $response = Http::timeout(10)->get('https://www.googleapis.com/books/v1/volumes', $params);
            if (! $response->ok()) return [];

            return collect($response->json()['items'] ?? [])
                ->map(fn ($item) => $this->normalizeGoogleBook($item))
                ->filter()
                ->values()
                ->all();
        });
    }

    // ─── CrossRef (DOI / title) ───────────────────────────────────────────────

    public function searchCrossRef(string $query, string $type = 'title'): array
    {
        if ($type === 'isbn') return []; // CrossRef is DOI-centric

        $cacheKey = "import_cr_{$type}_" . md5($query);

        return Cache::remember($cacheKey, now()->addHours(24), function () use ($query, $type) {
            if ($type === 'doi') {
                $doi = ltrim($query, '/');
                $response = Http::timeout(10)
                    ->withHeaders(['User-Agent' => 'AlphaeLibrary/1.0 (mailto:' . config('mail.from.address', 'admin@bannalai.com') . ')'])
                    ->get("https://api.crossref.org/works/{$doi}");
                if (! $response->ok()) return [];
                $item = $response->json()['message'] ?? null;
                if (! $item) return [];
                return [$this->normalizeCrossRefItem($item)];
            }

            $response = Http::timeout(10)
                ->withHeaders(['User-Agent' => 'AlphaeLibrary/1.0 (mailto:' . config('mail.from.address', 'admin@bannalai.com') . ')'])
                ->get('https://api.crossref.org/works', [
                    'query'  => $query,
                    'rows'   => 5,
                    'select' => 'DOI,title,author,publisher,published,ISBN,ISSN,subject,abstract,type,container-title,volume,issue,page',
                ]);
            if (! $response->ok()) return [];

            return collect($response->json()['message']['items'] ?? [])
                ->map(fn ($item) => $this->normalizeCrossRefItem($item))
                ->filter()
                ->values()
                ->all();
        });
    }

    // ─── Normalizers ─────────────────────────────────────────────────────────

    private function normalizeOpenLibraryRecord(array $data, string $isbn): array
    {
        return [
            'title'            => $data['title'] ?? '',
            'subtitle'         => $data['subtitle'] ?? null,
            'authors'          => collect($data['authors'] ?? [])->map(fn ($a) => ['name' => $a['name'], 'role' => 'aut'])->all(),
            'publisher'        => $data['publishers'][0]['name'] ?? null,
            'publisher_place'  => $data['publish_places'][0]['name'] ?? null,
            'publication_year' => isset($data['publish_date']) ? (int) substr($data['publish_date'], -4) : null,
            'isbn'             => $isbn,
            'subjects'         => collect($data['subjects'] ?? [])->take(8)->map(fn ($s) => ['term' => $s['name'] ?? $s, 'scheme' => 'LCSH'])->all(),
            'cover_image_url'  => $data['cover']['large'] ?? $data['cover']['medium'] ?? null,
            'lcc_class'        => $data['classifications']['lc_classifications'][0] ?? null,
            'ddc_class'        => $data['classifications']['dewey_decimal_class'][0] ?? null,
            'language'         => $data['languages'][0]['key'] ?? null ? substr($data['languages'][0]['key'], -3) : 'en',
            'abstract'         => $data['notes'] ?? null,
            'pages'            => isset($data['number_of_pages']) ? (string) $data['number_of_pages'] : null,
            '_source_label'    => 'Open Library',
            '_source_url'      => $data['url'] ?? null,
        ];
    }

    private function normalizeOpenLibrarySearch(array $doc): ?array
    {
        if (empty($doc['title'])) return null;

        $isbn = $doc['isbn'][0] ?? null;
        $coverUrl = $doc['cover_i']
            ? "https://covers.openlibrary.org/b/id/{$doc['cover_i']}-L.jpg"
            : null;

        return [
            'title'            => $doc['title'],
            'authors'          => collect($doc['author_name'] ?? [])->map(fn ($n) => ['name' => $n, 'role' => 'aut'])->all(),
            'publisher'        => $doc['publisher'][0] ?? null,
            'publication_year' => $doc['first_publish_year'] ?? null,
            'isbn'             => $isbn,
            'language'         => $doc['language'][0] ?? 'en',
            'subjects'         => collect($doc['subject'] ?? [])->take(5)->map(fn ($s) => ['term' => $s, 'scheme' => 'LCSH'])->all(),
            'cover_image_url'  => $coverUrl,
            'pages'            => isset($doc['number_of_pages_median']) ? (string) $doc['number_of_pages_median'] : null,
            'lccn'             => $doc['lccn'][0] ?? null,
            '_source_label'    => 'Open Library',
        ];
    }

    private function normalizeGoogleBook(array $item): ?array
    {
        $info = $item['volumeInfo'] ?? [];
        if (empty($info['title'])) return null;

        $isbn13 = null;
        $isbn10 = null;
        foreach ($info['industryIdentifiers'] ?? [] as $id) {
            if ($id['type'] === 'ISBN_13') $isbn13 = $id['identifier'];
            if ($id['type'] === 'ISBN_10') $isbn10 = $id['identifier'];
        }

        $pubYear = null;
        if (! empty($info['publishedDate'])) {
            preg_match('/\d{4}/', $info['publishedDate'], $m);
            $pubYear = $m[0] ?? null;
        }

        return [
            'title'            => $info['title'],
            'subtitle'         => $info['subtitle'] ?? null,
            'authors'          => collect($info['authors'] ?? [])->map(fn ($n) => ['name' => $n, 'role' => 'aut'])->all(),
            'publisher'        => $info['publisher'] ?? null,
            'publication_year' => $pubYear ? (int) $pubYear : null,
            'isbn'             => $isbn13 ?? $isbn10,
            'language'         => $info['language'] ?? 'en',
            'subjects'         => collect($info['categories'] ?? [])->map(fn ($s) => ['term' => $s, 'scheme' => 'local'])->all(),
            'abstract'         => strip_tags($info['description'] ?? ''),
            'cover_image_url'  => str_replace('http://', 'https://', $info['imageLinks']['thumbnail'] ?? $info['imageLinks']['smallThumbnail'] ?? null),
            'pages'            => isset($info['pageCount']) ? (string) $info['pageCount'] : null,
            '_source_label'    => 'Google Books',
            '_source_url'      => $info['infoLink'] ?? null,
        ];
    }

    private function normalizeCrossRefItem(array $item): ?array
    {
        if (empty($item['title'][0])) return null;

        $pubYear = null;
        $published = $item['published']['date-parts'][0] ?? $item['published-print']['date-parts'][0] ?? null;
        if ($published) $pubYear = (int) $published[0];

        $authors = collect($item['author'] ?? [])->map(function ($a) {
            $name = trim(($a['given'] ?? '') . ' ' . ($a['family'] ?? ''));
            return ['name' => $name, 'role' => $a['sequence'] === 'first' ? 'aut' : 'aut'];
        })->filter(fn ($a) => $a['name'])->all();

        return [
            'title'            => $item['title'][0],
            'authors'          => $authors,
            'publisher'        => $item['publisher'] ?? null,
            'publication_year' => $pubYear,
            'isbn'             => $item['ISBN'][0] ?? null,
            'issn'             => $item['ISSN'][0] ?? null,
            'doi'              => $item['DOI'] ?? null,
            'volume'           => $item['volume'] ?? null,
            'issue'            => $item['issue'] ?? null,
            'pages'            => $item['page'] ?? null,
            'subjects'         => collect($item['subject'] ?? [])->take(5)->map(fn ($s) => ['term' => $s, 'scheme' => 'local'])->all(),
            'abstract'         => strip_tags($item['abstract'] ?? ''),
            '_source_label'    => 'CrossRef',
            '_source_url'      => $item['URL'] ?? null,
        ];
    }

    private function parseMods(string $xml, string $source): array
    {
        // Parse MODS XML from LOC SRU response
        $results = [];
        try {
            $doc = new \SimpleXMLElement($xml);
            $doc->registerXPathNamespace('srw', 'http://www.loc.gov/zing/srw/');
            $doc->registerXPathNamespace('mods', 'http://www.loc.gov/mods/v3');

            $records = $doc->xpath('//mods:mods');
            foreach ($records as $mods) {
                $mods->registerXPathNamespace('mods', 'http://www.loc.gov/mods/v3');

                $title = (string) ($mods->xpath('mods:titleInfo/mods:title')[0] ?? '');
                if (! $title) continue;

                $subtitle = (string) ($mods->xpath('mods:titleInfo/mods:subTitle')[0] ?? '');

                $authors = [];
                foreach ($mods->xpath('mods:name') as $name) {
                    $nameParts = $name->xpath('mods:namePart');
                    $fullName = implode(', ', array_map('strval', $nameParts));
                    $role = (string) ($name->xpath('mods:role/mods:roleTerm')[0] ?? 'aut');
                    $roleCode = strlen($role) === 3 ? $role : 'aut';
                    if ($fullName) {
                        $authors[] = ['name' => trim($fullName, ', '), 'role' => $roleCode];
                    }
                }

                $publisher  = (string) ($mods->xpath('mods:originInfo/mods:publisher')[0] ?? '');
                $pubPlace   = (string) ($mods->xpath('mods:originInfo/mods:place/mods:placeTerm[@type="text"]')[0] ?? '');
                $pubYear    = (string) ($mods->xpath('mods:originInfo/mods:dateIssued')[0] ?? '');
                $language   = (string) ($mods->xpath('mods:language/mods:languageTerm')[0] ?? 'en');
                $pages      = (string) ($mods->xpath('mods:physicalDescription/mods:extent')[0] ?? '');
                $abstract   = (string) ($mods->xpath('mods:abstract')[0] ?? '');
                $lccn       = (string) ($mods->xpath('mods:identifier[@type="lccn"]')[0] ?? '');
                $isbn       = (string) ($mods->xpath('mods:identifier[@type="isbn"]')[0] ?? '');
                $lccClass   = (string) ($mods->xpath('mods:classification[@authority="lcc"]')[0] ?? '');
                $ddcClass   = (string) ($mods->xpath('mods:classification[@authority="ddc"]')[0] ?? '');

                $subjects = [];
                foreach ($mods->xpath('mods:subject/mods:topic') as $s) {
                    $subjects[] = ['term' => (string) $s, 'scheme' => 'LCSH'];
                }

                $cover = null;
                if ($isbn) {
                    $cleanIsbn = preg_replace('/[^0-9X]/', '', strtoupper($isbn));
                    $cover = "https://covers.openlibrary.org/b/isbn/{$cleanIsbn}-L.jpg";
                }

                $results[] = [
                    'title'            => $title,
                    'subtitle'         => $subtitle ?: null,
                    'authors'          => $authors,
                    'publisher'        => $publisher ?: null,
                    'publisher_place'  => $pubPlace ?: null,
                    'publication_year' => $pubYear ? (int) preg_replace('/\D/', '', $pubYear) : null,
                    'language'         => strlen($language) === 3 ? substr($language, 0, 2) : $language,
                    'isbn'             => $isbn ?: null,
                    'lccn'             => $lccn ?: null,
                    'lcc_class'        => $lccClass ?: null,
                    'ddc_class'        => $ddcClass ?: null,
                    'subjects'         => $subjects,
                    'abstract'         => $abstract ?: null,
                    'pages'            => $pages ?: null,
                    'cover_image_url'  => $cover,
                    '_source_label'    => 'Library of Congress',
                    '_source_url'      => $lccn ? "https://lccn.loc.gov/{$lccn}" : null,
                ];
            }
        } catch (\Throwable $e) {
            Log::warning("LOC MODS parse error: {$e->getMessage()}");
        }

        return $results;
    }
}
