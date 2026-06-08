<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Tenant\AIUsageLog;
use App\Models\Tenant\LibrarySetting;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AIUsageController extends Controller
{
    /**
     * Show AI usage dashboard
     */
    public function index()
    {
        $stats = $this->getUsageStats();
        $monthlyUsage = $this->getMonthlyUsage();
        $recentLogs = $this->getRecentLogs();
        $budgetSettings = $this->getBudgetSettings();

        return Inertia::render('Admin/Settings/AIUsage', [
            'stats' => $stats,
            'monthlyUsage' => $monthlyUsage,
            'recentLogs' => $recentLogs,
            'budgetSettings' => $budgetSettings,
        ]);
    }

    /**
     * Get current budget settings
     */
    private function getBudgetSettings(): array
    {
        return [
            'monthly_budget' => (float) (LibrarySetting::where('key', 'ai_monthly_budget')->first()->value ?? 50.00),
            'alert_threshold' => (float) (LibrarySetting::where('key', 'ai_budget_alert_threshold')->first()->value ?? 0.80),
            'auto_disable' => (LibrarySetting::where('key', 'ai_auto_disable_on_budget')->first()->value ?? 'true') === 'true',
        ];
    }

    /**
     * Get overall usage statistics
     */
    private function getUsageStats(): array
    {
        $thisMonth = AIUsageLog::thisMonth();

        $totalCalls = $thisMonth->count();
        $monthlyCost = (float) $thisMonth->sum('cost_usd');
        $cacheHitRate = AIUsageLog::cacheHitRate();
        $avgResponseTime = (int) $thisMonth->avg('response_time_ms');

        // Feature breakdown
        $byFeature = $thisMonth
            ->selectRaw('
                feature,
                COUNT(*) as calls,
                SUM(cost_usd) as cost,
                ROUND(AVG(CASE WHEN status = \'success\' THEN 100 ELSE 0 END), 1) as success_rate
            ')
            ->groupBy('feature')
            ->get()
            ->map(fn($row) => [
                'name' => $row->feature,
                'calls' => $row->calls,
                'cost' => (float) $row->cost,
                'success_rate' => (float) $row->success_rate,
            ])
            ->toArray();

        // Calculate savings from caching
        $cacheHits = $thisMonth->where('cache_hit', true)->count();
        $avgCostPerCall = $totalCalls > 0 ? $monthlyCost / ($totalCalls - $cacheHits) : 0;
        $savingsFromCache = $cacheHits * $avgCostPerCall;
        $costWithoutCache = $monthlyCost + $savingsFromCache;

        // Budget (optional - could be stored in library_settings)
        $budgetLimit = $this->getBudgetLimit();

        return [
            'total_calls' => $totalCalls,
            'monthly_cost' => $monthlyCost,
            'cache_hit_rate' => $cacheHitRate,
            'avg_response_time' => $avgResponseTime,
            'by_feature' => $byFeature,
            'savings_from_cache' => $savingsFromCache,
            'cost_without_cache' => $costWithoutCache,
            'budget_limit' => $budgetLimit,
        ];
    }

    /**
     * Get monthly usage trend (last 6 months)
     */
    private function getMonthlyUsage(): array
    {
        $sixMonthsAgo = now()->subMonths(6)->startOfMonth();

        return AIUsageLog::where('created_at', '>=', $sixMonthsAgo)
            ->selectRaw("
                TO_CHAR(created_at, 'Mon YYYY') as month,
                COUNT(*) as calls,
                SUM(cost_usd) as cost
            ")
            ->groupByRaw("TO_CHAR(created_at, 'Mon YYYY'), DATE_TRUNC('month', created_at)")
            ->orderByRaw("DATE_TRUNC('month', created_at)")
            ->get()
            ->map(fn($row) => [
                'month' => $row->month,
                'calls' => $row->calls,
                'cost' => (float) $row->cost,
            ])
            ->toArray();
    }

    /**
     * Get recent activity logs
     */
    private function getRecentLogs(): array
    {
        return AIUsageLog::orderBy('created_at', 'desc')
            ->limit(20)
            ->get()
            ->map(fn($log) => [
                'id' => $log->id,
                'feature' => $log->feature,
                'status' => $log->status,
                'input_tokens' => $log->input_tokens,
                'output_tokens' => $log->output_tokens,
                'cost_usd' => (float) $log->cost_usd,
                'response_time_ms' => $log->response_time_ms,
                'cache_hit' => $log->cache_hit,
                'created_at' => $log->created_at->toISOString(),
            ])
            ->toArray();
    }

    /**
     * Get monthly budget limit from library settings
     */
    private function getBudgetLimit(): ?float
    {
        $setting = LibrarySetting::where('key', 'ai_monthly_budget')->first();
        $budget = $setting ? (float) $setting->value : null;

        // Return null if budget is 0 (unlimited)
        return ($budget && $budget > 0) ? $budget : null;
    }

    /**
     * Update AI budget settings
     */
    public function updateBudget(Request $request)
    {
        $validated = $request->validate([
            'monthly_budget' => 'required|numeric|min:0',
            'alert_threshold' => 'required|numeric|min:0|max:1',
            'auto_disable' => 'required|boolean',
        ]);

        LibrarySetting::updateOrCreate(
            ['key' => 'ai_monthly_budget'],
            ['value' => $validated['monthly_budget'], 'group' => 'ai']
        );

        LibrarySetting::updateOrCreate(
            ['key' => 'ai_budget_alert_threshold'],
            ['value' => $validated['alert_threshold'], 'group' => 'ai']
        );

        LibrarySetting::updateOrCreate(
            ['key' => 'ai_auto_disable_on_budget'],
            ['value' => $validated['auto_disable'] ? 'true' : 'false', 'group' => 'ai']
        );

        return redirect()->back()->with('success', 'Budget settings updated successfully.');
    }

    /**
     * Export usage logs as CSV
     */
    public function exportCSV(Request $request)
    {
        $validated = $request->validate([
            'month' => 'nullable|date_format:Y-m',
        ]);

        $query = AIUsageLog::orderBy('created_at', 'desc');

        // Filter by month if specified
        if (isset($validated['month'])) {
            $start = \Carbon\Carbon::parse($validated['month'])->startOfMonth();
            $end = \Carbon\Carbon::parse($validated['month'])->endOfMonth();
            $query->whereBetween('created_at', [$start, $end]);
        } else {
            // Default: current month
            $query->thisMonth();
        }

        $logs = $query->get();

        // Generate CSV
        $filename = 'ai-usage-' . ($validated['month'] ?? now()->format('Y-m')) . '.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function() use ($logs) {
            $file = fopen('php://output', 'w');

            // CSV Headers
            fputcsv($file, [
                'Date',
                'Time',
                'Feature',
                'Status',
                'Input Tokens',
                'Output Tokens',
                'Total Tokens',
                'Cost (USD)',
                'Response Time (ms)',
                'Cache Hit',
                'User ID',
            ]);

            // CSV Rows
            foreach ($logs as $log) {
                fputcsv($file, [
                    $log->created_at->format('Y-m-d'),
                    $log->created_at->format('H:i:s'),
                    $log->feature,
                    $log->status,
                    $log->input_tokens,
                    $log->output_tokens,
                    $log->input_tokens + $log->output_tokens,
                    number_format($log->cost_usd, 6),
                    $log->response_time_ms,
                    $log->cache_hit ? 'Yes' : 'No',
                    $log->user_id ?? 'N/A',
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
