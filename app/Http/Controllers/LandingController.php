<?php

namespace App\Http\Controllers;

use App\Models\Central\Plan;
use App\Models\Central\Tenant;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class LandingController extends Controller
{
    /**
     * Public landing page with featured library portfolio.
     */
    public function home()
    {
        $featured = Cache::remember('landing.featured_libraries', 600, function () {
            return $this->libraryCards(
                Tenant::where('status', 'active')
                    ->where('is_featured', true)
                    ->orderBy('featured_order')
                    ->get()
            );
        });

        $plans = Cache::remember('landing.plans', 600, function () {
            return Plan::where('is_active', true)
                ->orderBy('sort_order')
                ->orderBy('price_usd')
                ->get()
                ->map(function ($p) {
                    // A $0 plan with unlimited capacity is custom/contact-us pricing
                    // (e.g. Enterprise); a $0 capped plan is the Free tier.
                    $isCustom = (float) $p->price_usd === 0.0 && $p->max_titles === null;

                    return [
                        'name'     => $p->name,
                        'price'    => $isCustom ? null : (float) $p->price_usd,
                        'billing_cycle' => $p->billing_cycle,
                        'popular'  => (bool) $p->is_popular,
                        'max_titles'     => $p->max_titles,
                        'max_patrons'    => $p->max_patrons,
                        'max_storage_gb' => $p->max_storage_gb,
                        // Tolerate legacy double-encoded features (stored as a JSON string).
                        'features' => is_array($p->features)
                            ? $p->features
                            : (is_string($p->features) ? (json_decode($p->features, true) ?: []) : []),
                    ];
                })
                ->all();
        });

        return Inertia::render('Landing/Home', [
            'featuredLibraries' => $featured,
            'plans'             => $plans,
        ]);
    }

    /**
     * Public directory of all active libraries.
     */
    public function libraries()
    {
        $libraries = Cache::remember('landing.all_libraries', 600, function () {
            return $this->libraryCards(
                Tenant::where('status', 'active')->orderBy('name')->get()
            );
        });

        return Inertia::render('Landing/Libraries', [
            'libraries' => $libraries,
        ]);
    }

    /**
     * Build display cards for the given tenants. Logo and display name live
     * in each tenant's own database, so briefly initialize tenancy per
     * tenant — a broken tenant DB falls back to central name, no logo.
     */
    private function libraryCards($tenants): array
    {
        $cards = [];

        foreach ($tenants as $tenant) {
            $logo = null;
            $name = $tenant->name;

            try {
                tenancy()->initialize($tenant);
                $logo = \App\Models\Tenant\LibrarySetting::get('logo_url');
                // Prefer the library's own branding name, but ignore the empty/default
                // placeholder ("My Library") and fall back to the registered central
                // name so the public portfolio shows the real library, not a default.
                $libName = trim((string) \App\Models\Tenant\LibrarySetting::get('library_name'));
                $name = ($libName !== '' && strcasecmp($libName, 'My Library') !== 0)
                    ? $libName
                    : $tenant->name;
            } catch (\Throwable) {
                // Tenant DB unreachable — show central record only.
            } finally {
                tenancy()->end();
            }

            $cards[] = [
                'name'     => $name,
                'slug'     => $tenant->slug,
                'logo_url' => $logo,
            ];
        }

        return $cards;
    }

    /**
     * Show pricing page with real plans from database
     */
    public function pricing()
    {
        // Get active plans ordered by price
        $plans = Plan::where('is_active', true)
            ->orderBy('price_usd', 'asc')
            ->get()
            ->map(function ($plan) {
                return [
                    'id' => $plan->id,
                    'name' => $plan->name,
                    'price' => $plan->price_usd,
                    'billing_cycle' => $plan->billing_cycle,
                    'is_popular' => $plan->is_popular,
                    'max_titles' => $plan->max_titles,
                    'max_patrons' => $plan->max_patrons,
                    'max_storage_gb' => $plan->max_storage_gb,
                    'features' => is_array($plan->features)
                        ? $plan->features
                        : (is_string($plan->features) ? json_decode($plan->features, true) : []),
                ];
            });

        return Inertia::render('Landing/Pricing', [
            'plans' => $plans,
        ]);
    }
}
