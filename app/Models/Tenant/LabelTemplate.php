<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class LabelTemplate extends Model
{
    use SoftDeletes;

    protected $table = 'label_templates';

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'name', 'page_size',
        'margin_top_mm', 'margin_left_mm',
        'columns', 'rows',
        'label_width_mm', 'label_height_mm',
        'gap_x_mm', 'gap_y_mm',
        'background_color', 'elements', 'is_default',
    ];

    protected $casts = [
        'elements'        => 'array',
        'is_default'      => 'boolean',
        'columns'         => 'integer',
        'rows'            => 'integer',
        'margin_top_mm'   => 'float',
        'margin_left_mm'  => 'float',
        'label_width_mm'  => 'float',
        'label_height_mm' => 'float',
        'gap_x_mm'        => 'float',
        'gap_y_mm'        => 'float',
    ];

    protected static function booted(): void
    {
        static::creating(function (self $t) {
            if (empty($t->id)) {
                $t->id = (string) Str::uuid();
            }
        });
    }

    /** Item data keys a label element of type "field" may bind to. */
    public const FIELD_KEYS = [
        'barcode_value'    => 'Barcode Number',
        'title'            => 'Title',
        'title_km'         => 'Title (Khmer)',
        'author'           => 'Author',
        'call_number'      => 'Call Number',
        'accession_number' => 'Accession No.',
        'collection'       => 'Collection',
        'location'         => 'Location',
        'shelf'            => 'Shelf',
        'isbn'             => 'ISBN',
        'library_name'     => 'Library Name',
    ];

    /**
     * Default label content for a ~63.5 x 33.9 mm label: call number (top-left),
     * Code128 barcode (centre), human-readable barcode number (bottom).
     */
    public const DEFAULT_ELEMENTS = [
        ['id' => 'el_call',    'type' => 'field',   'x' => 2,  'y' => 1.5, 'w' => 40, 'h' => 6, 'field' => 'call_number',  'fontSize' => 9,  'fontWeight' => 'bold',   'color' => '#111827', 'align' => 'left'],
        ['id' => 'el_title',   'type' => 'field',   'x' => 2,  'y' => 7,   'w' => 59, 'h' => 5, 'field' => 'title',        'fontSize' => 7,  'fontWeight' => 'normal', 'color' => '#374151', 'align' => 'left'],
        ['id' => 'el_barcode', 'type' => 'barcode', 'x' => 6,  'y' => 13,  'w' => 52, 'h' => 13, 'field' => 'barcode_value', 'symbology' => 'code128'],
        ['id' => 'el_num',     'type' => 'field',   'x' => 2,  'y' => 27,  'w' => 59, 'h' => 5, 'field' => 'barcode_value', 'fontSize' => 8,  'fontWeight' => 'normal', 'color' => '#111827', 'align' => 'center'],
    ];

    /**
     * Avery-style A4 sheet presets the editor offers. label sizes in mm.
     */
    public const PRESETS = [
        'l7651' => ['name' => 'Avery L7651 — 65/sheet (38.1×21.2)', 'page_size' => 'A4', 'columns' => 5, 'rows' => 13, 'label_width_mm' => 38.1, 'label_height_mm' => 21.2, 'gap_x_mm' => 2.5, 'gap_y_mm' => 0, 'margin_top_mm' => 10.7, 'margin_left_mm' => 4.7],
        'l7159' => ['name' => 'Avery L7159 — 24/sheet (63.5×33.9)', 'page_size' => 'A4', 'columns' => 3, 'rows' => 8, 'label_width_mm' => 63.5, 'label_height_mm' => 33.9, 'gap_x_mm' => 2.5, 'gap_y_mm' => 0, 'margin_top_mm' => 13, 'margin_left_mm' => 7.2],
        'l7163' => ['name' => 'Avery L7163 — 14/sheet (99.1×38.1)', 'page_size' => 'A4', 'columns' => 2, 'rows' => 7, 'label_width_mm' => 99.1, 'label_height_mm' => 38.1, 'gap_x_mm' => 2.5, 'gap_y_mm' => 0, 'margin_top_mm' => 15.1, 'margin_left_mm' => 4.65],
    ];
}
