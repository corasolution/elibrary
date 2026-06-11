<?php

namespace App\Services\AI;

use App\Models\Tenant\AIUsageLog;
use Illuminate\Support\Facades\Log;

/**
 * Shared AI usage accounting for all providers:
 *  - applies the configurable markup (default 30%) → that delta is the platform earning
 *  - writes the per-tenant AIUsageLog (billed amount the library pays)
 *  - writes a central AiUsageLedger row (api cost, billed, earning) for cross-tenant reporting
 *  - triggers per-library budget monitoring
 */
trait LogsAiUsage
{
    /** Markup fraction, e.g. 0.30, read from the platform setting (default 30%). */
    protected function markupRate(): float
    {
        try {
            $pct = (float) (\App\Models\Central\PlatformSetting::get('ai_markup_percentage', 30) ?? 30);
        } catch (\Throwable) {
            $pct = 30.0;
        }
        return max(0, $pct) / 100;
    }

    /**
     * Record one AI call.
     *
     * @param array $m  input_tokens, output_tokens, response_time_ms, error
     * @param float $apiCost  raw provider cost in USD (no markup)
     */
    protected function recordUsage(string $provider, string $feature, array $m, string $status, bool $cacheHit, float $apiCost): void
    {
        $billed  = round($apiCost * (1 + $this->markupRate()), 6);
        $earning = round($billed - $apiCost, 6);
        $in  = (int) ($m['input_tokens'] ?? 0);
        $out = (int) ($m['output_tokens'] ?? 0);

        // Per-tenant log (cost_usd = what the library is billed)
        try {
            AIUsageLog::create([
                'provider'        => $provider,
                'feature'         => $feature,
                'input_tokens'    => $in,
                'output_tokens'   => $out,
                'cost_usd'        => $billed,
                'response_time_ms'=> (int) ($m['response_time_ms'] ?? 0),
                'cache_hit'       => $cacheHit,
                'status'          => $status,
                'error_message'   => $m['error'] ?? null,
                'user_id'         => auth()->id(),
            ]);
        } catch (\Throwable $e) {
            Log::warning("AIUsageLog write failed: {$e->getMessage()}");
        }

        // Central earnings ledger — only meaningful, billable calls
        if ($status === 'success' && ! $cacheHit && ($in + $out) > 0) {
            try {
                \App\Models\Central\AiUsageLedger::create([
                    'tenant_id'     => function_exists('tenant') ? optional(tenant())->id : null,
                    'provider'      => $provider,
                    'feature'       => $feature,
                    'input_tokens'  => $in,
                    'output_tokens' => $out,
                    'api_cost_usd'  => round($apiCost, 6),
                    'billed_usd'    => $billed,
                    'earning_usd'   => $earning,
                ]);
            } catch (\Throwable $e) {
                Log::warning("AiUsageLedger write failed: {$e->getMessage()}");
            }

            try {
                app(\App\Services\BudgetMonitorService::class)->checkBudgetAndNotify();
            } catch (\Throwable $e) {
                Log::warning("Budget monitoring failed: {$e->getMessage()}");
            }
        }
    }
}
