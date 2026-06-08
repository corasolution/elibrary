<?php

namespace App\Exports;

use App\Models\Tenant\MaterialType;
use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;
use Maatwebsite\Excel\Concerns\WithProperties;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Cell\DataValidation;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class CatalogTemplateExport implements WithMultipleSheets
{
    public function sheets(): array
    {
        $materialTypes = MaterialType::orderBy('sort_order')->get(['code', 'name']);

        return [
            new CatalogTemplateSheet($materialTypes),
            new MaterialTypeReferenceSheet($materialTypes),
        ];
    }
}

// ─── Sheet 1: Template ────────────────────────────────────────────────────────

class CatalogTemplateSheet implements FromArray, WithHeadings, WithStyles, WithTitle
{
    public function __construct(private $materialTypes) {}

    public function title(): string { return 'Catalog Template'; }

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

    public function array(): array
    {
        return [
            // Example row
            [
                'Clean Code: A Handbook of Agile Software Craftsmanship',
                '',
                '',
                '',
                'Robert C. Martin (aut)',
                '9780132350884',
                '',
                '',
                'Prentice Hall',
                'Upper Saddle River, NJ',
                2008,
                '1st',
                'en',
                '431',
                '',
                '',
                'book',
                'Software engineering [LCSH] | Computer programming [LCSH]',
                'clean code | refactoring | software craftsmanship',
                '005.133',
                'QA76.73',
                '',
                '',
                'A guide to writing clean, readable, and maintainable code.',
                '',
                '',
                'active',
                '',
            ],
            // Hint row
            [
                '# Required',
                '# Optional',
                '# Optional',
                '# Optional - Khmer title',
                '# Format: Name (role) | Name2 (role). Roles: aut, edt, trl, ill',
                '# ISBN-10 or ISBN-13',
                '# Optional',
                '# Optional',
                '# Optional',
                '# Optional',
                '# Integer e.g. 2024',
                '# e.g. 2nd',
                '# ISO 639-1: en, km, fr, zh',
                '# e.g. 431',
                '# Optional',
                '# Optional',
                '# Use code from material_types sheet',
                '# Format: Term [Scheme] | Term2 [LCSH]',
                '# Format: word1 | word2 | word3',
                '# e.g. 005.133',
                '# e.g. QA76.73',
                '# Optional',
                '# Optional',
                '# Optional - summary text',
                '# Optional',
                '# Optional - URL',
                '# active or draft',
                '# Leave blank for new records',
            ],
        ];
    }

    public function styles(Worksheet $sheet)
    {
        // Heading row
        $sheet->getStyle('1:1')->applyFromArray([
            'font'      => ['bold' => true, 'color' => ['rgb' => '1D4ED8'], 'size' => 11],
            'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'EFF6FF']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
        ]);

        // Example row
        $sheet->getStyle('2:2')->applyFromArray([
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'F0FDF4']],
        ]);

        // Hint row (italic, gray)
        $sheet->getStyle('3:3')->applyFromArray([
            'font' => ['italic' => true, 'color' => ['rgb' => '9CA3AF'], 'size' => 9],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'F9FAFB']],
        ]);

        // Column widths
        $widths = [
            'A' => 50, 'B' => 25, 'C' => 25, 'D' => 25,
            'E' => 40, 'F' => 16, 'G' => 12, 'H' => 25,
            'I' => 30, 'J' => 25, 'K' => 10, 'L' => 10,
            'M' => 10, 'N' => 10, 'O' => 10, 'P' => 10,
            'Q' => 18, 'R' => 40, 'S' => 30,
            'T' => 14, 'U' => 14, 'V' => 25, 'W' => 14,
            'X' => 60, 'Y' => 30, 'Z' => 40,
            'AA' => 14, 'AB' => 38,
        ];
        foreach ($widths as $col => $width) {
            $sheet->getColumnDimension($col)->setWidth($width);
        }

        // Freeze pane below heading
        $sheet->freezePane('A2');

        // Data validation dropdown for material_type (column Q = 17th column)
        $codes = $this->materialTypes->pluck('code')->implode(',');
        for ($row = 2; $row <= 1000; $row++) {
            $validation = $sheet->getCell("Q{$row}")->getDataValidation();
            $validation->setType(DataValidation::TYPE_LIST);
            $validation->setFormula1('"' . $codes . '"');
            $validation->setShowDropDown(false);
            $validation->setAllowBlank(true);
            $validation->setShowErrorMessage(true);
            $validation->setErrorTitle('Invalid material type');
            $validation->setError('Please select a valid material type from the list.');
        }

        // record_status dropdown (column AA = 27th)
        for ($row = 2; $row <= 1000; $row++) {
            $validation = $sheet->getCell("AA{$row}")->getDataValidation();
            $validation->setType(DataValidation::TYPE_LIST);
            $validation->setFormula1('"active,draft"');
            $validation->setShowDropDown(false);
            $validation->setAllowBlank(true);
        }

        return [];
    }
}

// ─── Sheet 2: Material Types Reference ───────────────────────────────────────

class MaterialTypeReferenceSheet implements FromArray, WithHeadings, WithStyles, WithTitle
{
    public function __construct(private $materialTypes) {}

    public function title(): string { return 'material_types'; }

    public function headings(): array
    {
        return ['code', 'name', 'has_physical', 'has_digital'];
    }

    public function array(): array
    {
        return $this->materialTypes->map(fn ($t) => [
            $t->code,
            $t->name,
            $t->has_physical ? 'yes' : 'no',
            $t->has_digital  ? 'yes' : 'no',
        ])->toArray();
    }

    public function styles(Worksheet $sheet)
    {
        $sheet->getStyle('1:1')->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '1D4ED8']],
        ]);
        $sheet->getColumnDimension('A')->setWidth(20);
        $sheet->getColumnDimension('B')->setWidth(30);
        $sheet->getColumnDimension('C')->setWidth(15);
        $sheet->getColumnDimension('D')->setWidth(15);
        return [];
    }
}
