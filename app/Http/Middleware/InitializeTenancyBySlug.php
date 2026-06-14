<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\Central\Tenant;
use Illuminate\Support\Facades\View;
use Illuminate\Support\Facades\URL;
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

        // Auto-fill the {slug} route parameter for all generated URLs in this
        // request (e.g. route('admin.dashboard') inside controllers), so
        // redirects don't fail with "Missing parameter: slug".
        URL::defaults(['slug' => $slug]);

        // Drop {slug} from the matched route so controllers receive only their
        // own parameters. Without this, methods like show(string $id) get the
        // slug as their first positional argument and 404 on findOrFail.
        $request->route()->forgetParameter('slug');

        return $next($request);
    }
}
