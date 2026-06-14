<?php

namespace App\Http\Controllers\Central;

use App\Http\Controllers\Controller;
use App\Models\Central\AiUsageLedger;
use App\Models\Central\Tenant;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Platform overview dashboard for super admins.
     */
    public function index()
    {
        // ── Libraries ────────────────────────────────────────────────────
        $byStatus = Tenant::selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $totalLibraries = (int) $byStatus->sum();

        $recentLibraries = Tenant::with('plan:id,name')
            ->latest('created_at')
            ->take(5)
            ->get(['id', 'name', 'slug', 'status', 'plan_id', 'created_at']);

        // Estimated monthly recurring revenue from active subscriptions
        $monthlyRevenue = (float) Tenant::where('tenants.status', 'active')
            ->join('plans', 'plans.id', '=', 'tenants.plan_id')
            ->sum('plans.price_usd');

        // ── AI usage (central ledger — no tenant DB scans) ───────────────
        $aiMonth = AiUsageLedger::where('created_at', '>=', now()->startOfMonth())
            ->selectRaw('count(*) as calls')
            ->selectRaw('coalesce(sum(input_tokens + output_tokens), 0) as tokens')
            ->selectRaw('coalesce(sum(billed_usd), 0) as billed')
            ->selectRaw('coalesce(sum(earning_usd), 0) as earning')
            ->first();

        $aiByProvider = AiUsageLedger::where('created_at', '>=', now()->startOfMonth())
            ->selectRaw('provider, count(*) as calls, coalesce(sum(input_tokens + output_tokens), 0) as tokens, coalesce(sum(billed_usd), 0) as billed')
            ->groupBy('provider')
            ->orderByDesc('calls')
            ->get();

        // ── Storage across tenants (cached — iterates tenant DBs) ────────
        $storage = Cache::remember('central.dashboard.storage', 600, function () {
            $result = ['bytes' => 0, 'files' => 0, 'per_tenant' => []];

            foreach (Tenant::where('status', 'active')->get() as $tenant) {
                try {
                    tenancy()->initialize($tenant);
                    $bytes = (int) \App\Models\Tenant\DigitalResource::sum('file_size_bytes');
                    $files = (int) \App\Models\Tenant\DigitalResource::count();
                    $result['bytes'] += $bytes;
                    $result['files'] += $files;
                    $result['per_tenant'][] = [
                        'id'    => $tenant->id,
                        'name'  => $tenant->name,
                        'slug'  => $tenant->slug,
                        'bytes' => $bytes,
                        'files' => $files,
                    ];
                } catch (\Throwable) {
                    // Tenant DB unreachable — skip it rather than break the dashboard.
                } finally {
                    tenancy()->end();
                }
            }

            usort($result['per_tenant'], fn ($a, $b) => $b['bytes'] <=> $a['bytes']);
            $result['per_tenant'] = array_slice($result['per_tenant'], 0, 5);

            return $result;
        });

        $pendingRequests = \App\Models\Central\RegistrationRequest::where('status', 'pending')->count();

        return Inertia::render('Central/Dashboard', [
            'libraries' => [
                'total'     => $totalLibraries,
                'by_status' => $byStatus,
                'recent'    => $recentLibraries,
            ],
            'pendingRequests' => $pendingRequests,
            'monthlyRevenue' => $monthlyRevenue,
            'ai' => [
                'month'       => $aiMonth,
                'by_provider' => $aiByProvider,
            ],
            'storage' => $storage,
        ]);
    }
}
