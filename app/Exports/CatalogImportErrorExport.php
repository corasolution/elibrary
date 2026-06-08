<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class CatalogImportErrorExport implements FromArray, WithHeadings, WithStyles
{
    public function __construct(private array $failures) {}

    public function array(): array
    {
        return collect($this->failures)->map(fn ($f) => [
            $f['row'] ?? '',
            $f['attribute'] ?? '',
            implode('; ', (array) ($f['errors'] ?? [])),
            $f['title'] ?? '',
            $f['isbn'] ?? '',
        ])->toArray();
    }

    public function headings(): array
    {
        return ['Row #', 'Field', 'Error Message', 'Title (from row)', 'ISBN (from row)'];
    }

    public function styles(Worksheet $sheet)
    {
        $sheet->getStyle('1:1')->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'DC2626']],
        ]);

        $sheet->getColumnDimension('A')->setWidth(8);
        $sheet->getColumnDimension('B')->setWidth(20);
        $sheet->getColumnDimension('C')->setWidth(50);
        $sheet->getColumnDimension('D')->setWidth(40);
        $sheet->getColumnDimension('E')->setWidth(20);

        return [];
    }
}
