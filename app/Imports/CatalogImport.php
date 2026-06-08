<?php

namespace App\Imports;

use App\Models\Tenant\BibliographicRecord;
use App\Services\CatalogService;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Maatwebsite\Excel\Concerns\SkipsOnFailure;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithLimit;
use Maatwebsite\Excel\Concerns\WithStartRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use Maatwebsite\Excel\Validators\Failure;

class CatalogImport implements
    ToCollection,
    WithHeadingRow,
    WithValidation,
    SkipsOnFailure,
    WithStartRow,
    WithLimit
{
    private int $created = 0;
    private int $updated = 0;
    private array $failures = [];
    private CatalogService $catalogService;

    public function __construct(
        private readonly string $jobId,
        private readonly int    $totalRows,
        private readonly int    $chunkOffset,
        private readonly array  $materialTypeMap,
    ) {
        $this->catalogService = app(CatalogService::class);
    }

    // Start from row 2 (data) + offset (subsequent chunks)
    public function startRow(): int
    {
        // Row 1 is heading; row 2 is first data row.
        // For chunk offset 0 → row 2; offset 50 → row 52; etc.
        return 2 + $this->chunkOffset;
    }

    public function limit(): int
    {
        return 50;
    }

    public function collection(Collection $rows): void
    {
        foreach ($rows as $rowIndex => $row) {
            $rowArr = $row->toArray();

            // Skip hint rows (prefix #)
            $titleVal = trim((string) ($rowArr['title'] ?? ''));
            if (str_starts_with($titleVal, '#') || $titleVal === '') {
                continue;
            }

            try {
                $data = $this->transformRow($rowArr);
                $this->upsertRecord($data, $rowArr);
            } catch (\Throwable $e) {
                Log::warning("CatalogImport row error: " . $e->getMessage());
                $this->failures[] = [
                    'row'       => $this->chunkOffset + $rowIndex + 2,
                    'attribute' => 'general',
                    'errors'    => [$e->getMessage()],
                    'title'     => $rowArr['title'] ?? '',
                    'isbn'      => $rowArr['isbn'] ?? '',
                ];
            }
        }

        // Update cache progress
        $processed = min($this->chunkOffset + 50, $this->totalRows);
        $this->updateProgress($processed);
    }

    public function rules(): array
    {
        return [
            'title'            => 'required|string|max:500',
            'publication_year' => 'nullable|integer|min:1000|max:' . (date('Y') + 5),
            'isbn'             => 'nullable|string|max:20',
            'issn'             => 'nullable|string|max:20',
            'language'         => 'nullable|string|max:10',
            'material_type'    => ['nullable', Rule::in(array_keys($this->materialTypeMap) + [''])],
            'record_status'    => 'nullable|in:active,draft',
            'pages'            => 'nullable|string|max:50',
        ];
    }

    public function customValidationMessages(): array
    {
        return [
            'title.required'            => 'Title is required.',
            'publication_year.integer'  => 'Publication year must be a valid integer.',
            'material_type.in'          => 'Invalid material type. See the material_types sheet for valid codes.',
        ];
    }

    public function onFailure(Failure ...$failures): void
    {
        foreach ($failures as $failure) {
            $this->failures[] = [
                'row'       => $failure->row(),
                'attribute' => $failure->attribute(),
                'errors'    => $failure->errors(),
                'title'     => $failure->values()['title'] ?? '',
                'isbn'      => $failure->values()['isbn'] ?? '',
            ];
        }
    }

    public function getCreated(): int  { return $this->created; }
    public function getUpdated(): int  { return $this->updated; }
    public function getFailures(): array { return $this->failures; }

    // ─── Private helpers ──────────────────────────────────────────────────────

    private function transformRow(array $row): array
    {
        $materialTypeId = null;
        $mtCode = trim((string) ($row['material_type'] ?? ''));
        if ($mtCode !== '') {
            $materialTypeId = $this->materialTypeMap[$mtCode] ?? null;
        }

        return [
            'title'            => trim($row['title'] ?? ''),
            'subtitle'         => $this->nullIfEmpty($row['subtitle'] ?? ''),
            'title_alternative'=> $this->nullIfEmpty($row['title_alternative'] ?? ''),
            'title_km'         => $this->nullIfEmpty($row['title_km'] ?? ''),
            'authors'          => $this->parseAuthors($row['authors'] ?? ''),
            'isbn'             => $this->nullIfEmpty($row['isbn'] ?? ''),
            'issn'             => $this->nullIfEmpty($row['issn'] ?? ''),
            'doi'              => $this->nullIfEmpty($row['doi'] ?? ''),
            'publisher'        => $this->nullIfEmpty($row['publisher'] ?? ''),
            'publisher_place'  => $this->nullIfEmpty($row['publisher_place'] ?? ''),
            'publication_year' => $this->nullableInt($row['publication_year'] ?? ''),
            'edition'          => $this->nullIfEmpty($row['edition'] ?? ''),
            'language'         => $this->nullIfEmpty($row['language'] ?? '') ?? 'en',
            'pages'            => $this->nullIfEmpty($row['pages'] ?? ''),
            'volume'           => $this->nullIfEmpty($row['volume'] ?? ''),
            'issue'            => $this->nullIfEmpty($row['issue'] ?? ''),
            'material_type_id' => $materialTypeId,
            'subjects'         => $this->parseSubjects($row['subjects'] ?? ''),
            'keywords'         => $this->parseKeywords($row['keywords'] ?? ''),
            'ddc_class'        => $this->nullIfEmpty($row['ddc_class'] ?? ''),
            'lcc_class'        => $this->nullIfEmpty($row['lcc_class'] ?? ''),
            'series_title'     => $this->nullIfEmpty($row['series_title'] ?? ''),
            'series_number'    => $this->nullIfEmpty($row['series_number'] ?? ''),
            'abstract'         => $this->nullIfEmpty($row['abstract'] ?? ''),
            'notes'            => $this->nullIfEmpty($row['notes'] ?? ''),
            'cover_image_url'  => $this->nullIfEmpty($row['cover_image_url'] ?? ''),
            'record_status'    => in_array($row['record_status'] ?? '', ['active', 'draft'])
                                  ? $row['record_status'] : 'active',
        ];
    }

    private function upsertRecord(array $data, array $row): void
    {
        // 1. Match by explicit record_id (UUID)
        $recordId = trim($row['record_id'] ?? '');
        if ($recordId && preg_match('/^[0-9a-f-]{36}$/i', $recordId)) {
            $existing = BibliographicRecord::find($recordId);
            if ($existing) {
                $this->catalogService->updateRecord($existing, $data);
                $this->updated++;
                return;
            }
        }

        // 2. Match by ISBN
        $isbn = $data['isbn'] ?? null;
        if ($isbn) {
            $existing = BibliographicRecord::where('isbn', $isbn)->first();
            if ($existing) {
                $this->catalogService->updateRecord($existing, $data);
                $this->updated++;
                return;
            }
        }

        // 3. Create new
        $this->catalogService->createRecord($data);
        $this->created++;
    }

    private function updateProgress(int $processed): void
    {
        $cacheKey = "catalog_import_{$this->jobId}";
        $current  = Cache::get($cacheKey, []);

        $allFailures = array_merge($current['failures'] ?? [], $this->failures);

        Cache::put($cacheKey, array_merge($current, [
            'status'       => $processed >= $this->totalRows ? 'done' : 'processing',
            'processed'    => $processed,
            'total'        => $this->totalRows,
            'created'      => ($current['created'] ?? 0) + $this->created,
            'updated'      => ($current['updated'] ?? 0) + $this->updated,
            'errors_count' => count($allFailures),
            'failures'     => $allFailures,
        ]), now()->addHours(2));
    }

    private function parseAuthors(string $value): array
    {
        if (trim($value) === '') return [];
        return collect(explode('|', $value))
            ->map(fn ($s) => trim($s))
            ->filter()
            ->map(function ($s) {
                if (preg_match('/^(.*?)\s*\((\w+)\)\s*$/', $s, $m)) {
                    return ['name' => trim($m[1]), 'role' => strtolower($m[2])];
                }
                return ['name' => $s, 'role' => 'aut'];
            })
            ->values()
            ->all();
    }

    private function parseSubjects(string $value): array
    {
        if (trim($value) === '') return [];
        return collect(explode('|', $value))
            ->map(fn ($s) => trim($s))
            ->filter()
            ->map(function ($s) {
                if (preg_match('/^(.*?)\s*\[([^\]]+)\]\s*$/', $s, $m)) {
                    return ['term' => trim($m[1]), 'scheme' => trim($m[2])];
                }
                return ['term' => $s, 'scheme' => 'local'];
            })
            ->values()
            ->all();
    }

    private function parseKeywords(string $value): array
    {
        if (trim($value) === '') return [];
        return collect(explode('|', $value))
            ->map(fn ($s) => trim($s))
            ->filter()
            ->values()
            ->all();
    }

    private function nullIfEmpty(mixed $value): ?string
    {
        $s = trim((string) $value);
        return $s === '' ? null : $s;
    }

    private function nullableInt(mixed $value): ?int
    {
        $s = trim((string) $value);
        return $s === '' ? null : (int) $s;
    }
}
