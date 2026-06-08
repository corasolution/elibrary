<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;

class DailyStat extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'date', 'total_loans', 'total_returns', 'new_patrons',
        'digital_views', 'digital_downloads', 'overdue_items',
    ];

    protected $casts = [
        'date'              => 'date',
        'total_loans'       => 'integer',
        'total_returns'     => 'integer',
        'new_patrons'       => 'integer',
        'digital_views'     => 'integer',
        'digital_downloads' => 'integer',
        'overdue_items'     => 'integer',
    ];

    public static function forDate(\DateTimeInterface|string $date): self
    {
        return static::firstOrCreate(
            ['date' => $date],
            ['total_loans' => 0, 'total_returns' => 0, 'new_patrons' => 0,
             'digital_views' => 0, 'digital_downloads' => 0, 'overdue_items' => 0]
        );
    }
}
