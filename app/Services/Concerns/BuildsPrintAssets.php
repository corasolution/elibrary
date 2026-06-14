<?php

namespace App\Services\Concerns;

use App\Models\Tenant\LibrarySetting;
use Picqer\Barcode\BarcodeGeneratorPNG;
use Spatie\Browsershot\Browsershot;

/**
 * Shared print helpers for Card Maker & Barcode Labels: barcode images, logo and
 * Khmer font as embeddable data URIs, and the headless-Chromium PDF pipeline.
 */
trait BuildsPrintAssets
{
    /** Barcode of $value as a base64 PNG data URI. Default Code128 (Code39 optional). */
    public function barcodeDataUri(string $value, string $symbology = 'code128'): string
    {
        $generator = new BarcodeGeneratorPNG();
        $type = $symbology === 'code39'
            ? $generator::TYPE_CODE_39
            : $generator::TYPE_CODE_128;

        // (widthFactor 2, height 60px, black) → crisp at print scale
        $png = $generator->getBarcode($value, $type, 2, 60);

        return 'data:image/png;base64,' . base64_encode($png);
    }

    /**
     * Resolve the library logo (stored as a /storage/... URL) to a base64 data URI
     * so the renderer embeds it without remote fetches. Returns null if absent.
     */
    public function logoDataUri(): ?string
    {
        $url = LibrarySetting::get('logo_url');
        if (! $url) {
            return null;
        }

        $relative = ltrim(preg_replace('#^/?storage/#', '', $url), '/');
        $path = storage_path('app/public/' . $relative);

        if (! is_file($path)) {
            return null;
        }

        $mime = function_exists('mime_content_type') ? mime_content_type($path) : 'image/png';

        return 'data:' . $mime . ';base64,' . base64_encode(file_get_contents($path));
    }

    /**
     * Resolve patron photo (stored in patron-photos/) to a base64 data URI
     * so the PDF renderer embeds it without remote fetches. Returns null if absent.
     */
    public function photoDataUri(?string $photoUrl): ?string
    {
        if (! $photoUrl) {
            return null;
        }

        // Security: ensure photo_url is within patron-photos directory
        $normalized = ltrim(str_replace('\\', '/', $photoUrl), '/');
        if (! str_starts_with($normalized, 'patron-photos/')) {
            return null;
        }

        $path = storage_path('app/public/' . $normalized);

        // Prevent path traversal
        $realPath = realpath($path);
        $allowedPath = realpath(storage_path('app/public/patron-photos'));

        if (! $realPath || ! $allowedPath || ! str_starts_with($realPath, $allowedPath)) {
            return null;
        }

        if (! is_file($realPath)) {
            return null;
        }

        $mime = function_exists('mime_content_type')
            ? mime_content_type($realPath)
            : 'image/jpeg';

        return 'data:' . $mime . ';base64,' . base64_encode(file_get_contents($realPath));
    }

    /** Base64 data URI of the bundled Noto Sans Khmer font (for @font-face). */
    public function khmerFontDataUri(): ?string
    {
        $path = storage_path('fonts/NotoSansKhmer-Regular.ttf');
        if (! is_file($path)) {
            return null;
        }

        return 'data:font/truetype;charset=utf-8;base64,' . base64_encode(file_get_contents($path));
    }

    /**
     * Render an HTML string to PDF bytes via headless Chromium (Browsershot).
     * Chromium shapes complex scripts (Khmer) and matches the on-screen preview.
     */
    public function htmlToPdf(string $html, string $format = 'A4'): string
    {
        try {
            $shot = Browsershot::html($html)
                ->format($format)
                ->margins(0, 0, 0, 0)
                ->showBackground(true)
                ->noSandbox()
                ->timeout(120);

            if (is_dir(base_path('node_modules'))) {
                $shot->setIncludePath(getenv('PATH'));
            }

            return $shot->pdf();
        } catch (\Throwable $e) {
            // Servers without Node/Chromium (e.g. shared hosting) can't run
            // Browsershot — fall back to the pure-PHP DomPDF renderer so labels
            // and cards still print (Khmer shaping is weaker, but it works).
            \Illuminate\Support\Facades\Log::warning('Browsershot PDF failed, using DomPDF fallback: ' . $e->getMessage());
            return $this->htmlToPdfFallback($html, $format);
        }
    }

    /** Pure-PHP PDF fallback (no Node/Chromium dependency). */
    protected function htmlToPdfFallback(string $html, string $format = 'A4'): string
    {
        return \Barryvdh\DomPDF\Facade\Pdf::loadHTML($html)
            ->setPaper($format === 'Letter' ? 'letter' : 'a4')
            ->setOptions(['isRemoteEnabled' => true, 'isHtml5ParserEnabled' => true, 'dpi' => 96])
            ->output();
    }
}
