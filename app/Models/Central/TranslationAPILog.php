<?php

namespace App\Models\Central;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TranslationAPILog extends Model
{
    protected $connection = 'central';
    protected $table = 'translation_api_logs';

    public $timestamps = false;

    protected $fillable = [
        'tenant_id',
        'translation_id',
        'text_length',
        'input_tokens',
        'output_tokens',
        'cost_usd',
        'response_time_ms',
        'status',
        'error_message',
    ];

    protected $casts = [
        'cost_usd' => 'decimal:6',
        'created_at' => 'datetime',
    ];

    /**
     * Get the translation this log belongs to
     */
    public function translation(): BelongsTo
    {
        return $this->belongsTo(CMSTranslation::class, 'translation_id');
    }

    /**
     * Get total translation costs for the current month
     */
    public static function monthlyTotal(): float
    {
        return (float) self::whereMonth('created_at', now()->month)
                   ->whereYear('created_at', now()->year)
                   ->sum('cost_usd');
    }

    /**
     * Get central admin translation costs for the current month
     */
    public static function centralTotal(): float
    {
        return (float) self::whereNull('tenant_id')
                   ->whereMonth('created_at', now()->month)
                   ->whereYear('created_at', now()->year)
                   ->sum('cost_usd');
    }

    /**
     * Get tenant translation costs for the current month
     */
    public static function tenantTotal(string $tenantId): float
    {
        return (float) self::where('tenant_id', $tenantId)
                   ->whereMonth('created_at', now()->month)
                   ->whereYear('created_at', now()->year)
                   ->sum('cost_usd');
    }

    /**
     * Get success rate for translations
     */
    public static function successRate(): float
    {
        $total = self::count();

        if ($total === 0) {
            return 0;
        }

        $successful = self::where('status', 'success')->count();

        return round(($successful / $total) * 100, 2);
    }
}
