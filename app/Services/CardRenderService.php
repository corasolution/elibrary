<?php

namespace App\Services;

use App\Models\Tenant\CardTemplate;
use App\Models\Tenant\LibrarySetting;
use App\Models\Tenant\Patron;
use App\Services\Concerns\BuildsPrintAssets;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\View;

class CardRenderService
{
    use BuildsPrintAssets;

    /** Palette for the initials avatar — picked deterministically per patron. */
    private const AVATAR_COLORS = [
        '#1e3a8a', '#0f766e', '#7c2d12', '#4c1d95',
        '#9d174d', '#155e75', '#3f6212', '#7e22ce',
    ];

    /**
     * Build the per-patron data bag a card template binds to.
     * Keys mirror CardTemplate::FIELD_KEYS plus avatar + barcode helpers.
     */
    public function resolveFields(Patron $patron, ?string $libraryName = null): array
    {
        $libraryName ??= LibrarySetting::get('library_name', 'Alpha eLibrary');

        $fullNameKm = trim("{$patron->first_name_km} {$patron->last_name_km}");

        return [
            'patron_number'     => $patron->patron_number,
            'full_name'         => $patron->fullName(),
            'full_name_km'      => $fullNameKm !== '' ? $fullNameKm : null,
            'first_name'        => $patron->first_name,
            'last_name'         => $patron->last_name,
            'category'          => $patron->category?->name,
            'membership_expiry' => $patron->membership_expiry
                ? $patron->membership_expiry->format('Y-m-d')
                : null,
            'email'             => $patron->email,
            'phone'             => $patron->phone,
            'library_name'      => $libraryName,
            'status'            => ucfirst((string) $patron->status),

            // Avatar helpers
            'initials'          => $this->initials($patron),
            'avatar_color'      => $this->avatarColor($patron->patron_number ?? $patron->id),

            // Photo helpers
            'photo_url'         => $patron->photo_url,
            'photo'             => $patron->photo_url
                ? $this->photoDataUri($patron->photo_url)
                : null,

            // Barcode (Code128 of the card number) as embeddable PNG data URI
            'barcode'           => $patron->patron_number
                ? $this->barcodeDataUri($patron->patron_number)
                : null,
        ];
    }

    /** First letters of first + last name, uppercased. */
    public function initials(Patron $patron): string
    {
        $a = mb_substr(trim((string) $patron->first_name), 0, 1);
        $b = mb_substr(trim((string) $patron->last_name), 0, 1);
        $initials = mb_strtoupper($a . $b);

        return $initials !== '' ? $initials : '?';
    }

    public function avatarColor(string $seed): string
    {
        $idx = crc32($seed) % count(self::AVATAR_COLORS);
        return self::AVATAR_COLORS[$idx];
    }

    /**
     * Render one or more patron cards laid out on A4 sheets to a PDF (headless
     * Chromium via the BuildsPrintAssets trait). Returns the raw PDF bytes.
     */
    public function renderPdf(Collection $patrons, CardTemplate $template): string
    {
        $libraryName = LibrarySetting::get('library_name', 'Alpha eLibrary');
        $logo = $this->logoDataUri();

        $cards = $patrons->map(fn (Patron $p) => $this->resolveFields($p, $libraryName))->all();

        $html = View::make('cards.sheet', [
            'template'     => $template,
            'cards'        => $cards,
            'logo'         => $logo,
            'fontData'     => $this->khmerFontDataUri(),
            'bgImageData'  => $this->bgImageDataUri($template),
        ])->render();

        return $this->htmlToPdf($html);
    }

    /** Background image as a base64 data URI for embedding in the PDF. */
    private function bgImageDataUri(CardTemplate $template): ?string
    {
        if (! $template->background_image_path) {
            return null;
        }

        $path = storage_path('app/public/' . $template->background_image_path);
        if (! is_file($path)) {
            return null;
        }

        $mime = function_exists('mime_content_type') ? mime_content_type($path) : 'image/jpeg';

        return 'data:' . $mime . ';base64,' . base64_encode(file_get_contents($path));
    }
}
