<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\Central\Tenant;
use Illuminate\Support\Facades\View;
use Symfony\Component\HttpFoundation\Response;

class InitializeTenancyBySlug
{
    /**
     * Handle path-based tenant identification (bannalai.com/{slug}/...)
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Extract slug from first path segment
        $slug = $request->segment(1);

        if (!$slug) {
            abort(404, 'Library not specified.');
        }

        // Find tenant by slug
        $tenant = Tenant::where('slug', $slug)
            ->where('status', Tenant::STATUS_ACTIVE)
            ->first();

        if (!$tenant) {
            abort(404, "Library '{$slug}' not found or is not active.");
        }

        // Initialize tenancy (switch to tenant database)
        tenancy()->initialize($tenant);

        // Make tenant available throughout the request
        app()->instance('currentTenant', $tenant);
        View::share('currentTenant', $tenant);

        return $next($request);
    }
}
