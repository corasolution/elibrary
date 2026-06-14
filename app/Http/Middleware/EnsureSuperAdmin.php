<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Restricts central admin routes to Super Admins. Partners and sales agents
 * authenticate on the same 'central' guard but must not reach platform
 * management pages (settings, partners, plans, payments, CMS, ...).
 */
class EnsureSuperAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = auth('central')->user();

        if (! $user || ! $user->isSuperAdmin()) {
            abort(403, 'Super Admin access required.');
        }

        return $next($request);
    }
}
