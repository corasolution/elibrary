<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AIUsageLog extends Model
{
    use HasFactory, HasUuids;

    const UPDATED_AT = null; // Only created_at timestamp

    protected $fillable = [
        'feature',
        'input_tokens',
        'output_tokens',
        'cost_usd',
        'response_time_ms',
        'cache_hit',
        'status',
        'error_message',
        'user_id',
        'record_id',
        'created_at',
    ];

    protected $casts = [
        'input_tokens' => 'integer',
        'output_tokens' => 'integer',
        'cost_usd' => 'decimal:6',
        'response_time_ms' => 'integer',
        'cache_hit' => 'boolean',
        'created_at' => 'datetime',
    ];

    /**
     * Get the user who triggered this API call
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class);
    }

    /**
     * Get the bibliographic record this API call was for
     */
    public function bibliographicRecord(): BelongsTo
    {
        return $this->belongsTo(BibliographicRecord::class, 'record_id');
    }

    /**
     * Scope: successful calls
     */
    public function scopeSuccessful($query)
    {
        return $query->where('status', 'success');
    }

    /**
     * Scope: failed calls
     */
    public function scopeFailed($query)
    {
        return $query->where('status', 'error');
    }

    /**
     * Scope: this month's usage
     */
    public function scopeThisMonth($query)
    {
        return $query->whereBetween('created_at', [
            now()->startOfMonth(),
            now()->endOfMonth(),
        ]);
    }

    /**
     * Get total cost for current month
     */
    public static function monthlyTotal(): float
    {
        return static::thisMonth()->sum('cost_usd');
    }

    /**
     * Get usage stats by feature
     */
    public static function statsBy Feature(): array
    {
        return static::thisMonth()
            ->selectRaw('feature, COUNT(*) as calls, SUM(cost_usd) as cost')
            ->groupBy('feature')
            ->get()
            ->map(fn($row) => [
                'feature' => $row->feature,
                'calls' => $row->calls,
                'cost' => (float) $row->cost,
            ])
            ->toArray();
    }

    /**
     * Get cache hit rate (percentage)
     */
    public static function cacheHitRate(): float
    {
        $total = static::thisMonth()->count();
        if ($total === 0) return 0;

        $hits = static::thisMonth()->where('cache_hit', true)->count();
        return round(($hits / $total) * 100, 2);
    }
}
