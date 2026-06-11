<?php

namespace App\Services;

use App\Models\Tenant\LabelTemplate;
use App\Models\Tenant\LibrarySetting;
use App\Models\Tenant\PhysicalItem;
use App\Services\Concerns\BuildsPrintAssets;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\View;

/**
 * Renders Code128 barcode-label sheets (Koha "Label Creator" style) for physical
 * items. Reuses the headless-Chromium pipeline + barcode/font helpers via the
 * BuildsPrintAssets trait so output matches the on-screen preview and shapes Khmer.
 */
class LabelRenderService
{
    use BuildsPrintAssets;

    /**
     * Resolve the per-item data bag a label template binds to (see
     * LabelTemplate::FIELD_KEYS), including the Code128 image data URI.
     */
    public function resolveFields(PhysicalItem $item, ?string $libraryName = null): array
    {
        $libraryName ??= LibrarySetting::get('library_name', 'Alpha eLibrary');
        $biblio = $item->bibliographicRecord;

        $callNumber = $item->call_number
            ?: ($biblio?->ddc_class ?: $biblio?->lcc_class);

        $author = $biblio
            ? collect($biblio->authors)->pluck('name')->filter()->first()
            : null;

        return [
            'barcode_value'    => $item->barcode,
            'title'            => $biblio?->title,
            'title_km'         => $biblio?->title_km,
            'author'           => $author,
            'call_number'      => $callNumber,
            'accession_number' => $item->accession_number,
            'collection'       => $item->collection?->name,
            'location'         => $item->location?->name,
            'shelf'            => $item->shelf,
            'isbn'             => $biblio?->isbn,
            'library_name'     => $libraryName,

            'barcode'          => $item->barcode
                ? $this->barcodeDataUri($item->barcode)
                : null,
        ];
    }

    /**
     * Render selected items onto Avery-style label sheets as a PDF.
     *
     * @param  int  $startOffset  blank label cells to skip on the first page
     *                            (for partially-used sticker sheets).
     * @return string  raw PDF bytes
     */
    public function renderPdf(Collection $items, LabelTemplate $template, int $startOffset = 0): string
    {
        $libraryName = LibrarySetting::get('library_name', 'Alpha eLibrary');

        $cells = $items->map(fn (PhysicalItem $i) => $this->resolveFields($i, $libraryName))->values()->all();

        // Pad the front with blank cells so printing can start lower on a reused sheet.
        $perPage = max(1, $template->columns * $template->rows);
        $startOffset = max(0, min($startOffset, $perPage - 1));
        $cells = array_merge(array_fill(0, $startOffset, null), $cells);

        $pages = array_chunk($cells, $perPage);

        $html = View::make('labels.sheet', [
            'template' => $template,
            'pages'    => $pages,
            'logo'     => $this->logoDataUri(),
            'fontData' => $this->khmerFontDataUri(),
        ])->render();

        return $this->htmlToPdf($html, $template->page_size === 'Letter' ? 'Letter' : 'A4');
    }
}
