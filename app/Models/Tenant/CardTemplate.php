<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class CardTemplate extends Model
{
    use SoftDeletes;

    protected $table = 'card_templates';

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'name', 'width_mm', 'height_mm',
        'background_color', 'background_image_path',
        'elements', 'is_default',
    ];

    protected $casts = [
        'elements'    => 'array',
        'is_default'  => 'boolean',
        'width_mm'    => 'float',
        'height_mm'   => 'float',
    ];

    protected static function booted(): void
    {
        static::creating(function (self $t) {
            if (empty($t->id)) {
                $t->id = (string) Str::uuid();
            }
        });
    }

    /**
     * Field binding keys that elements of type "field" may reference.
     * Mirrored in the React editor's field dropdown.
     */
    public const FIELD_KEYS = [
        'patron_number'     => 'Card Number',
        'full_name'         => 'Full Name',
        'full_name_km'      => 'Full Name (Khmer)',
        'first_name'        => 'First Name',
        'last_name'         => 'Last Name',
        'category'          => 'Category',
        'membership_expiry' => 'Expiry Date',
        'email'             => 'Email',
        'phone'             => 'Phone',
        'library_name'      => 'Library Name',
        'status'            => 'Status',
    ];

    /**
     * A sensible default card layout (mm units, CR80 85.6 x 54).
     * Used by the seeder so the module works out of the box.
     */
    public const DEFAULT_ELEMENTS = [
        ['id' => 'el_header', 'type' => 'rect',     'x' => 0,    'y' => 0,    'w' => 85.6, 'h' => 13,  'backgroundColor' => '#1e3a8a', 'borderRadius' => 0],
        ['id' => 'el_logo',   'type' => 'logo',     'x' => 3,    'y' => 2.5,  'w' => 8,    'h' => 8],
        ['id' => 'el_libnm',  'type' => 'field',    'x' => 13,   'y' => 3.5,  'w' => 60,   'h' => 7,   'field' => 'library_name', 'fontSize' => 9, 'fontWeight' => 'bold',   'color' => '#ffffff', 'align' => 'left'],
        ['id' => 'el_avatar', 'type' => 'initials', 'x' => 3,    'y' => 17,   'w' => 18,   'h' => 18],
        ['id' => 'el_name',   'type' => 'field',    'x' => 24,   'y' => 17,   'w' => 58,   'h' => 6,   'field' => 'full_name', 'fontSize' => 11, 'fontWeight' => 'bold', 'color' => '#111827', 'align' => 'left'],
        ['id' => 'el_namekm', 'type' => 'field',    'x' => 24,   'y' => 23,   'w' => 58,   'h' => 5,   'field' => 'full_name_km', 'fontSize' => 9, 'fontWeight' => 'normal', 'color' => '#374151', 'align' => 'left'],
        ['id' => 'el_cat',    'type' => 'field',    'x' => 24,   'y' => 29,   'w' => 30,   'h' => 4,   'field' => 'category', 'fontSize' => 8, 'fontWeight' => 'normal', 'color' => '#6b7280', 'align' => 'left'],
        ['id' => 'el_exp',    'type' => 'field',    'x' => 54,   'y' => 29,   'w' => 28,   'h' => 4,   'field' => 'membership_expiry', 'fontSize' => 7, 'fontWeight' => 'normal', 'color' => '#6b7280', 'align' => 'right'],
        ['id' => 'el_barcode','type' => 'barcode',  'x' => 3,    'y' => 38,   'w' => 60,   'h' => 11],
        ['id' => 'el_cardno', 'type' => 'field',    'x' => 64,   'y' => 42,   'w' => 19,   'h' => 5,   'field' => 'patron_number', 'fontSize' => 8, 'fontWeight' => 'bold', 'color' => '#111827', 'align' => 'right'],
    ];
}
