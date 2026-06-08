<?php

namespace App\Http\Controllers;

use App\Models\Tenant\BibliographicRecord;
use App\Models\Tenant\MaterialType;
use App\Models\Tenant\LibrarySetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Response;
use Carbon\Carbon;

class OaiPmhController extends Controller
{
    const CHUNK_SIZE = 100;
    const RESUMPTION_TOKEN_EXPIRY = 3600; // 1 hour

    /**
     * Main OAI-PMH handler
     */
    public function handle(Request $request)
    {
        $verb = $request->get('verb');

        // Rate limiting
        $key = 'oai_pmh:' . $request->ip();
        $currentCount = Cache::get($key, 0);

        if ($currentCount > 100) { // Max 100 requests per minute
            return $this->errorResponse('tooManyRequests', 'Rate limit exceeded (100 requests/minute)');
        }

        Cache::put($key, $currentCount + 1, 60);

        return match($verb) {
            'Identify' => $this->identify($request),
            'ListMetadataFormats' => $this->listMetadataFormats($request),
            'ListSets' => $this->listSets(),
            'ListRecords' => $this->listRecords($request),
            'GetRecord' => $this->getRecord($request),
            'ListIdentifiers' => $this->listIdentifiers($request),
            default => $this->errorResponse('badVerb', 'Illegal OAI verb: ' . ($verb ?: '(none)'))
        };
    }

    /**
     * Identify verb - repository information
     */
    private function identify(Request $request)
    {
        $libraryName = LibrarySetting::get('library_name', 'Library');
        $baseUrl = route('library.oai', ['slug' => tenancy()->tenant->slug]);

        // Get earliest datestamp safely
        $earliestDate = BibliographicRecord::min('created_at');
        $earliestDatestamp = $earliestDate
            ? Carbon::parse($earliestDate)->toIso8601String()
            : now()->toIso8601String();

        $data = [
            'Identify' => [
                'repositoryName' => $libraryName,
                'baseURL' => $baseUrl,
                'protocolVersion' => '2.0',
                'adminEmail' => LibrarySetting::get('library_email', 'admin@library.edu'),
                'earliestDatestamp' => $earliestDatestamp,
                'deletedRecord' => 'persistent',
                'granularity' => 'YYYY-MM-DDThh:mm:ssZ',
                'description' => [
                    'oai-identifier' => [
                        'scheme' => 'oai',
                        'repositoryIdentifier' => parse_url($baseUrl, PHP_URL_HOST),
                        'delimiter' => ':',
                        'sampleIdentifier' => 'oai:' . parse_url($baseUrl, PHP_URL_HOST) . ':' . 'sample-id',
                    ]
                ],
            ],
        ];

        return $this->xmlResponse($data, $request);
    }

    /**
     * ListMetadataFormats verb
     */
    private function listMetadataFormats(Request $request)
    {
        $identifier = $request->get('identifier');

        // If identifier specified, verify it exists
        if ($identifier) {
            $record = BibliographicRecord::find($identifier);
            if (!$record) {
                return $this->errorResponse('idDoesNotExist', 'No matching identifier');
            }
        }

        $data = [
            'ListMetadataFormats' => [
                'metadataFormat' => [
                    [
                        'metadataPrefix' => 'oai_dc',
                        'schema' => 'http://www.openarchives.org/OAI/2.0/oai_dc.xsd',
                        'metadataNamespace' => 'http://www.openarchives.org/OAI/2.0/oai_dc/',
                    ],
                    [
                        'metadataPrefix' => 'marc21',
                        'schema' => 'http://www.loc.gov/standards/marcxml/schema/MARC21slim.xsd',
                        'metadataNamespace' => 'http://www.loc.gov/MARC21/slim',
                    ],
                ],
            ],
        ];

        return $this->xmlResponse($data, $request);
    }

    /**
     * ListSets verb - return material types as sets
     */
    private function listSets()
    {
        $sets = MaterialType::all()->map(fn($type) => [
            'setSpec' => "type:{$type->code}",
            'setName' => $type->name,
            'setDescription' => $type->name,
        ])->toArray();

        $data = [
            'ListSets' => [
                'set' => $sets,
            ],
        ];

        return $this->xmlResponse($data, request());
    }

    /**
     * ListRecords verb - return paginated records
     */
    private function listRecords(Request $request)
    {
        $metadataPrefix = $request->get('metadataPrefix', 'oai_dc');
        $from = $request->get('from');
        $until = $request->get('until');
        $set = $request->get('set');
        $resumptionToken = $request->get('resumptionToken');

        // Validate metadata prefix
        if (!in_array($metadataPrefix, ['oai_dc', 'marc21']) && !$resumptionToken) {
            return $this->errorResponse('cannotDisseminateFormat', 'Metadata format not supported: ' . $metadataPrefix);
        }

        if ($resumptionToken) {
            $params = $this->decodeResumptionToken($resumptionToken);
            if (!$params) {
                return $this->errorResponse('badResumptionToken', 'Invalid or expired resumption token');
            }
            extract($params);
        }

        $query = BibliographicRecord::with(['materialType', 'work']);

        // Date range filters
        if ($from) {
            try {
                $query->where('updated_at', '>=', Carbon::parse($from));
            } catch (\Exception $e) {
                return $this->errorResponse('badArgument', 'Invalid from date format');
            }
        }

        if ($until) {
            try {
                $query->where('updated_at', '<=', Carbon::parse($until));
            } catch (\Exception $e) {
                return $this->errorResponse('badArgument', 'Invalid until date format');
            }
        }

        // Set filtering
        if ($set && str_starts_with($set, 'type:')) {
            $typeCode = substr($set, 5);
            $query->whereHas('materialType', fn($q) => $q->where('code', $typeCode));
        }

        $total = $query->count();

        if ($total === 0) {
            return $this->errorResponse('noRecordsMatch', 'No records match the given criteria');
        }

        $offset = $resumptionToken ? ($params['offset'] ?? 0) : 0;
        $records = $query->skip($offset)->take(self::CHUNK_SIZE)->get();

        $recordsXml = $records->map(fn($record) => $this->recordToXml($record, $metadataPrefix))->toArray();

        $data = ['ListRecords' => ['record' => $recordsXml]];

        // Add resumption token if more records exist
        if ($offset + self::CHUNK_SIZE < $total) {
            $newToken = $this->encodeResumptionToken([
                'offset' => $offset + self::CHUNK_SIZE,
                'metadataPrefix' => $metadataPrefix,
                'from' => $from,
                'until' => $until,
                'set' => $set,
            ]);

            $data['ListRecords']['resumptionToken'] = [
                '@attributes' => [
                    'completeListSize' => $total,
                    'cursor' => $offset,
                ],
                '@value' => $newToken,
            ];
        }

        return $this->xmlResponse($data, $request);
    }

    /**
     * GetRecord verb - return single record
     */
    private function getRecord(Request $request)
    {
        $identifier = $request->get('identifier');
        $metadataPrefix = $request->get('metadataPrefix', 'oai_dc');

        if (!$identifier) {
            return $this->errorResponse('badArgument', 'Missing required argument: identifier');
        }

        if (!in_array($metadataPrefix, ['oai_dc', 'marc21'])) {
            return $this->errorResponse('cannotDisseminateFormat', 'Metadata format not supported');
        }

        $record = BibliographicRecord::with(['materialType', 'work'])->find($identifier);

        if (!$record) {
            return $this->errorResponse('idDoesNotExist', 'No matching identifier: ' . $identifier);
        }

        $data = [
            'GetRecord' => [
                'record' => $this->recordToXml($record, $metadataPrefix),
            ],
        ];

        return $this->xmlResponse($data, $request);
    }

    /**
     * ListIdentifiers verb - like ListRecords but headers only
     */
    private function listIdentifiers(Request $request)
    {
        // Similar to ListRecords but only return headers
        $response = $this->listRecords($request);

        // Transform to identifier-only format
        // (simplified - full implementation would extract just headers)
        return $response;
    }

    /**
     * Convert bibliographic record to OAI-PMH XML structure
     */
    private function recordToXml(BibliographicRecord $record, string $metadataPrefix): array
    {
        $baseUrl = route('library.oai', ['slug' => tenancy()->tenant->slug]);
        $identifier = 'oai:' . parse_url($baseUrl, PHP_URL_HOST) . ':' . $record->id;

        $header = [
            'identifier' => $identifier,
            'datestamp' => $record->updated_at->toIso8601String(),
        ];

        if ($record->materialType) {
            $header['setSpec'] = 'type:' . $record->materialType->code;
        }

        if ($record->trashed()) {
            $header['@attributes'] = ['status' => 'deleted'];
            return ['header' => $header]; // Deleted records have no metadata
        }

        $metadata = match($metadataPrefix) {
            'oai_dc' => $this->toDublinCoreXml($record),
            'marc21' => $this->toMarc21Xml($record),
            default => [],
        };

        return [
            'header' => $header,
            'metadata' => $metadata,
        ];
    }

    /**
     * Convert to Dublin Core XML
     */
    private function toDublinCoreXml(BibliographicRecord $record): array
    {
        $dc = [
            'dc:title' => $record->title,
            'dc:description' => $record->abstract,
            'dc:publisher' => $record->publisher,
            'dc:date' => (string) $record->publication_year,
            'dc:language' => $record->language,
        ];

        // Authors
        if ($record->authors) {
            $dc['dc:creator'] = collect($record->authors)->pluck('name')->toArray();
        }

        // Subjects
        if ($record->subjects) {
            $dc['dc:subject'] = collect($record->subjects)->pluck('term')->toArray();
        }

        // Identifiers
        if ($record->isbn) $dc['dc:identifier'][] = 'ISBN:' . $record->isbn;
        if ($record->issn) $dc['dc:identifier'][] = 'ISSN:' . $record->issn;
        if ($record->doi) $dc['dc:identifier'][] = 'DOI:' . $record->doi;

        // Type
        if ($record->materialType) {
            $dc['dc:type'] = $record->materialType->name;
        }

        return [
            'oai_dc:dc' => array_merge([
                '@attributes' => [
                    'xmlns:oai_dc' => 'http://www.openarchives.org/OAI/2.0/oai_dc/',
                    'xmlns:dc' => 'http://purl.org/dc/elements/1.1/',
                    'xmlns:xsi' => 'http://www.w3.org/2001/XMLSchema-instance',
                    'xsi:schemaLocation' => 'http://www.openarchives.org/OAI/2.0/oai_dc/ http://www.openarchives.org/OAI/2.0/oai_dc.xsd',
                ],
            ], $dc),
        ];
    }

    /**
     * Convert to MARC21 XML
     */
    private function toMarc21Xml(BibliographicRecord $record): array
    {
        if ($record->marc_xml) {
            // Return existing MARC XML with proper namespace
            return [
                'record' => [
                    '@attributes' => ['xmlns' => 'http://www.loc.gov/MARC21/slim'],
                    '@raw' => $record->marc_xml,
                ],
            ];
        }

        // No MARC XML stored — generate MARC21 from bibliographic fields
        return [
            'record' => [
                '@attributes' => ['xmlns' => 'http://www.loc.gov/MARC21/slim'],
                'leader' => '00000nam a2200000 a 4500',
                'datafield' => $this->generateMarcDatafields($record),
            ],
        ];
    }

    /**
     * Generate MARC21 datafields from bibliographic record fields
     */
    private function generateMarcDatafields(BibliographicRecord $record): array
    {
        $fields = [];

        // 020 - ISBN
        if ($record->isbn) {
            $fields[] = [
                '@attributes' => ['tag' => '020', 'ind1' => ' ', 'ind2' => ' '],
                'subfield' => [
                    ['@attributes' => ['code' => 'a'], '@value' => $record->isbn],
                ],
            ];
        }

        // 100 - Main author
        $authors = $record->authors ?? [];
        if (!empty($authors) && isset($authors[0]['name'])) {
            $fields[] = [
                '@attributes' => ['tag' => '100', 'ind1' => '1', 'ind2' => ' '],
                'subfield' => [
                    ['@attributes' => ['code' => 'a'], '@value' => $authors[0]['name']],
                ],
            ];
        }

        // 245 - Title
        $fields[] = [
            '@attributes' => ['tag' => '245', 'ind1' => '1', 'ind2' => '0'],
            'subfield' => [
                ['@attributes' => ['code' => 'a'], '@value' => $record->title ?? 'Untitled'],
            ],
        ];

        // 260/264 - Publication
        if ($record->publisher || $record->publication_year) {
            $pubSubfields = [];
            if ($record->publisher) {
                $pubSubfields[] = ['@attributes' => ['code' => 'b'], '@value' => $record->publisher];
            }
            if ($record->publication_year) {
                $pubSubfields[] = ['@attributes' => ['code' => 'c'], '@value' => (string) $record->publication_year];
            }
            $fields[] = [
                '@attributes' => ['tag' => '264', 'ind1' => ' ', 'ind2' => '1'],
                'subfield' => $pubSubfields,
            ];
        }

        // 520 - Abstract/Description
        if ($record->abstract) {
            $fields[] = [
                '@attributes' => ['tag' => '520', 'ind1' => ' ', 'ind2' => ' '],
                'subfield' => [
                    ['@attributes' => ['code' => 'a'], '@value' => $record->abstract],
                ],
            ];
        }

        // 650 - Subjects
        foreach (($record->subjects ?? []) as $subject) {
            $term = is_array($subject) ? ($subject['term'] ?? null) : $subject;
            if ($term) {
                $fields[] = [
                    '@attributes' => ['tag' => '650', 'ind1' => ' ', 'ind2' => '0'],
                    'subfield' => [
                        ['@attributes' => ['code' => 'a'], '@value' => $term],
                    ],
                ];
            }
        }

        return $fields;
    }

    /**
     * Encode resumption token
     */
    private function encodeResumptionToken(array $params): string
    {
        $token = base64_encode(json_encode($params));
        Cache::put("oai_token:{$token}", $params, self::RESUMPTION_TOKEN_EXPIRY);
        return $token;
    }

    /**
     * Decode resumption token
     */
    private function decodeResumptionToken(string $token): ?array
    {
        return Cache::get("oai_token:{$token}");
    }

    /**
     * Generate OAI-PMH error response
     */
    private function errorResponse(string $code, string $message)
    {
        $data = [
            'error' => [
                '@attributes' => ['code' => $code],
                '@value' => $message,
            ],
        ];

        return $this->xmlResponse($data, request(), 400);
    }

    /**
     * Generate XML response
     */
    private function xmlResponse(array $data, Request $request, int $status = 200)
    {
        $verb = $request->get('verb');
        $responseDate = now()->toIso8601String();

        $oaiPmh = [
            '@attributes' => [
                'xmlns' => 'http://www.openarchives.org/OAI/2.0/',
                'xmlns:xsi' => 'http://www.w3.org/2001/XMLSchema-instance',
                'xsi:schemaLocation' => 'http://www.openarchives.org/OAI/2.0/ http://www.openarchives.org/OAI/2.0/OAI-PMH.xsd',
            ],
            'responseDate' => $responseDate,
            'request' => array_merge(
                ['@attributes' => $request->only(['verb', 'identifier', 'metadataPrefix', 'from', 'until', 'set'])],
                ['@value' => $request->url()]
            ),
        ];

        $oaiPmh = array_merge($oaiPmh, $data);

        return Response::xml(['OAI-PMH' => $oaiPmh], $status);
    }
}
