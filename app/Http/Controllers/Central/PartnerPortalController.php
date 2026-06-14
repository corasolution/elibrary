<?php

namespace App\Http\Controllers\Central;

use App\Http\Controllers\Controller;
use App\Models\Central\Tenant;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PartnerPortalController extends Controller
{
    /**
     * Display partner dashboard with their libraries and statistics
     */
    public function dashboard()
    {
        $partner = Auth::guard('central')->user();

        // Get partner's accessible libraries with plan info
        $libraries = Tenant::with(['plan:id,name,price_usd'])
            ->whereIn('id', $partner->getAllAccessibleTenantIds())
            ->where('status', '!=', 'cancelled')
            ->withCount([
                'assignedUsers as managers_count'
            ])
            ->get()
            ->map(function ($tenant) {
                return [
                    'id' => $tenant->id,
                    'name' => $tenant->name,
                    'slug' => $tenant->slug,
                    'domain' => $tenant->domain,
                    'status' => $tenant->status,
                    'plan' => $tenant->plan ? [
                        'name' => $tenant->plan->name,
                        'price' => $tenant->plan->price_usd,
                    ] : null,
                    'created_at' => $tenant->created_at->format('M d, Y'),
                    'trial_ends_at' => $tenant->trial_ends_at?->format('M d, Y'),
                    'is_trial' => $tenant->trial_ends_at && $tenant->trial_ends_at->isFuture(),
                    // Path-based tenancy — libraries live at {host}/{slug}
                    'url' => url('/' . $tenant->slug),
                ];
            });

        // Calculate aggregate statistics across all libraries
        $statistics = $this->calculatePartnerStatistics($partner->getAllAccessibleTenantIds());

        return Inertia::render('Central/PartnerPortal/Dashboard', [
            'partner' => [
                'name' => $partner->name,
                'email' => $partner->email,
                'role' => $partner->role,
            ],
            'libraries' => $libraries,
            'statistics' => $statistics,
            'canCreateLibraries' => $partner->canCreateTenants(),
        ]);
    }

    /**
     * Calculate aggregate statistics across partner's libraries
     */
    private function calculatePartnerStatistics(array $tenantIds): array
    {
        if (empty($tenantIds)) {
            return [
                'total_libraries' => 0,
                'active_libraries' => 0,
                'total_patrons' => 0,
                'total_catalog_items' => 0,
                'total_active_loans' => 0,
            ];
        }

        $statistics = [
            'total_libraries' => count($tenantIds),
            'active_libraries' => Tenant::whereIn('id', $tenantIds)
                ->where('status', 'active')
                ->count(),
            'total_patrons' => 0,
            'total_catalog_items' => 0,
            'total_active_loans' => 0,
        ];

        // Aggregate data from each tenant database
        foreach ($tenantIds as $tenantId) {
            try {
                $tenant = Tenant::find($tenantId);
                if (!$tenant) continue;

                tenancy()->initialize($tenant);

                // Count patrons
                $statistics['total_patrons'] += DB::connection('tenant')
                    ->table('patrons')
                    ->whereNull('deleted_at')
                    ->count();

                // Count catalog items
                $statistics['total_catalog_items'] += DB::connection('tenant')
                    ->table('bibliographic_records')
                    ->whereNull('deleted_at')
                    ->count();

                // Count active loans
                $statistics['total_active_loans'] += DB::connection('tenant')
                    ->table('loans')
                    ->whereNull('returned_at')
                    ->count();

                tenancy()->end();
            } catch (\Exception $e) {
                // Skip if tenant database doesn't exist or error occurs
                tenancy()->end();
                continue;
            }
        }

        return $statistics;
    }
}
