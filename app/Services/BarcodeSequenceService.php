<?php

namespace App\Services;

use App\Models\Tenant\LibrarySetting;
use App\Models\Tenant\PhysicalItem;

/**
 * Generates item barcode VALUES (the string that gets encoded + printed), Koha
 * "autoBarcode" style: a configurable prefix + zero-padded running number, e.g.
 * LIB-000123. The barcode is its own field — NOT the database item id.
 */
class BarcodeSequenceService
{
    public function enabled(): bool
    {
        return (bool) LibrarySetting::get('barcode_auto', false);
    }

    public function prefix(): string
    {
        return (string) LibrarySetting::get('barcode_prefix', 'LIB-');
    }

    public function padding(): int
    {
        return max(1, (int) LibrarySetting::get('barcode_padding', 6));
    }

    /** Next barcode value: prefix + (max numeric suffix matching the prefix + 1). */
    public function next(): string
    {
        return $this->format($this->nextNumber());
    }

    public function format(int $number): string
    {
        return $this->prefix() . str_pad((string) $number, $this->padding(), '0', STR_PAD_LEFT);
    }

    /**
     * Highest existing number for the current prefix + 1 (drift-free; coexists with
     * any manually-typed barcodes that share the prefix).
     */
    public function nextNumber(): int
    {
        $prefix = $this->prefix();
        $like   = config('database.default') === 'pgsql' ? 'ilike' : 'like';

        $max = 0;
        PhysicalItem::withTrashed()
            ->where('barcode', $like, $prefix . '%')
            ->pluck('barcode')
            ->each(function ($code) use ($prefix, &$max) {
                $suffix = substr((string) $code, strlen($prefix));
                if (ctype_digit($suffix)) {
                    $max = max($max, (int) $suffix);
                }
            });

        return $max + 1;
    }

    /**
     * Assign sequential barcodes to all items missing one. Returns the count filled.
     * Assigned in a single pass so each value is unique; the DB unique index is the
     * backstop against collisions.
     */
    public function assignMissing(): int
    {
        $number = $this->nextNumber();
        $count  = 0;

        PhysicalItem::query()
            ->where(fn ($q) => $q->whereNull('barcode')->orWhere('barcode', ''))
            ->orderBy('created_at')
            ->each(function (PhysicalItem $item) use (&$number, &$count) {
                $item->barcode = $this->format($number);
                $item->save();
                $number++;
                $count++;
            });

        return $count;
    }
}
