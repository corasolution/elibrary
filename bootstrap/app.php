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
