<?php

namespace App\Exports;

use App\Models\Tenant\BibliographicRecord;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithProperties;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class CatalogExport implements FromQuery, WithHeadings, WithMapping, ShouldAutoSize, WithStyles
{
    public function __construct(private array $filters = []) {}

    public function query()
    {
        $q = BibliographicRecord::with('materialType')
            ->where('record_status', 'active')
            ->orderBy('title');

        if (! empty($this->filters['q'])) {
            $term = $this->filters['q'];
            $q->where(function ($w) use ($term) {
                $w->where('title', 'like', "%{$term}%")
                  ->orWhere('isbn', 'like', "%{$term}%")
                  ->orWhereRaw("LOWER(authors) LIKE ?", ['%' . strtolower($term) . '%']);
            });
        }
        if (! empty($this->filters['material_type_id'])) {
            $q->where('material_type_id', $this->filters['material_type_id']);
        }
        if (! empty($this->filters['language'])) {
            $q->where('language', $this->filters['language']);
        }
        if (! empty($this->filters['year_from'])) {
            $q->where('publication_year', '>=', $this->filters['year_from']);
        }
        if (! empty($this->filters['year_to'])) {
            $q->where('publication_year', '<=', $this->filters['year_to']);
        }

        return $q;
    }

    public function headings(): array
    {
        return [
            'title', 'subtitle', 'title_alternative', 'title_km',
            'authors', 'isbn', 'issn', 'doi',
            'publisher', 'publisher_place', 'publication_year', 'edition',
            'language', 'pages', 'volume', 'issue',
            'material_type', 'subjects', 'keywords',
            'ddc_class', 'lcc_class', 'series_title', 'series_number',
            'abstract', 'notes', 'cover_image_url',
            'record_status', 'record_id',
        ];
    }

    public function map($record): array
    {
        return [
            $record->title ?? '',
            $record->subtitle ?? '',
            $record->title_alternative ?? '',
            $record->title_km ?? '',
            $this->flattenAuthors($record->authors),
            $record->isbn ?? '',
            $record->issn ?? '',
            $record->doi ?? '',
            $record->publisher ?? '',
            $record->publisher_place ?? '',
            $record->publication_year ?? '',
            $record->edition ?? '',
            $record->language ?? '',
            $record->pages ?? '',
            $record->volume ?? '',
            $record->issue ?? '',
            $record->materialType?->code ?? '',
            $this->flattenSubjects($record->subjects),
            $this->flattenKeywords($record->keywords),
            $record->ddc_class ?? '',
            $record->lcc_class ?? '',
            $record->series_title ?? '',
            $record->series_number ?? '',
            $record->abstract ?? '',
            $record->notes ?? '',
            $record->cover_image_url ?? '',
            $record->record_status ?? 'active',
            $record->id ?? '',
        ];
    }

    public function styles(Worksheet $sheet)
    {
        // Heading row styles
        $sheet->getStyle('1:1')->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => '1D4ED8']],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'EFF6FF']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
        ]);

        // Freeze pane below heading
        $sheet->freezePane('A2');

        return [];
    }

    // ─── Private helpers ──────────────────────────────────────────────────────

    private function flattenAuthors(?array $authors): string
    {
        if (empty($authors)) return '';
        return collect($authors)
            ->map(fn ($a) => ($a['name'] ?? '') . ' (' . ($a['role'] ?? 'aut') . ')')
            ->implode(' | ');
    }

    private function flattenSubjects(mixed $subjects): string
    {
        if (empty($subjects)) return '';
        return collect($subjects)
            ->map(fn ($s) => ($s['term'] ?? (is_string($s) ? $s : '')) . ' [' . ($s['scheme'] ?? 'local') . ']')
            ->filter()
            ->implode(' | ');
    }

    private function flattenKeywords(mixed $keywords): string
    {
        if (empty($keywords)) return '';
        return collect($keywords)
            ->filter()
            ->implode(' | ');
    }
}
