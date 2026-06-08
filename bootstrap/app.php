<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        channels: __DIR__.'/../routes/channels.php',
        health: '/up',
        then: function () {
            // Central Admin Routes (bannalai.com/central/*)
            \Illuminate\Support\Facades\Route::middleware(['web'])
                ->group(__DIR__.'/../routes/central.php');

            // Tenant Admin Routes (bannalai.com/{slug}/admin/*)
            \Illuminate\Support\Facades\Route::middleware(['web', 'tenant.slug'])
                ->prefix('{slug}')
                ->where(['slug' => '[a-z0-9\-]+'])
                ->group(__DIR__.'/../routes/admin.php');
        },
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
            \App\Http\Middleware\InjectThemeData::class,
        ]);

        $middleware->alias([
            'tenant'        => \App\Http\Middleware\InitializeTenancy::class,
            'tenant.slug'   => \App\Http\Middleware\InitializeTenancyBySlug::class,
            'role'          => \Spatie\Permission\Middleware\RoleMiddleware::class,
            'permission'    => \Spatie\Permission\Middleware\PermissionMiddleware::class,
        ]);

        // Ensure tenancy is initialized BEFORE the auth middleware runs, so the
        // auth guard resolves users against the tenant database (not central).
        // Without this, Laravel's middleware priority runs Authenticate first and
        // auth checks hit the wrong DB — causing an admin login redirect loop.
        $middleware->prependToPriorityList(
            before: \Illuminate\Contracts\Auth\Middleware\AuthenticatesRequests::class,
            prepend: \App\Http\Middleware\InitializeTenancyBySlug::class,
        );

        // Send unauthenticated users to the correct login page based on area.
        // Without this, the default 'login' route is missing and guests hit a 500.
        $middleware->redirectGuestsTo(function (\Illuminate\Http\Request $request) {
            $segments = $request->segments();          // e.g. ['elibrary', 'admin', ...]
            $slug = $segments[0] ?? null;

            if ($slug === 'central') {
                return route('central.login');
            }
            // Tenant admin area -> staff login; otherwise patron login
            if ($slug && ($segments[1] ?? null) === 'admin') {
                return url("/{$slug}/admin/login");
            }
            if ($slug) {
                return url("/{$slug}/login");
            }
            return url('/');
        });
    })
    ->withSchedule(function (\Illuminate\Console\Scheduling\Schedule $schedule) {
        // Auto-purge catalog records soft-deleted more than 90 days ago
        $schedule->call(function () {
            \App\Models\Tenant\BibliographicRecord::onlyTrashed()
                ->where('deleted_at', '<', now()->subDays(90))
                ->forceDelete();
        })->daily()->name('purge-old-catalog-trash');
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
