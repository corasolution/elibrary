<?php

namespace App\Http\Controllers;

use App\Models\Central\Plan;
use Inertia\Inertia;

class LandingController extends Controller
{
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
