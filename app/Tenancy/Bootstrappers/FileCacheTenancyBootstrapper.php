<?php

namespace App\Tenancy\Bootstrappers;

use Illuminate\Contracts\Foundation\Application;
use Illuminate\Support\Facades\Cache;
use Stancl\Tenancy\Contracts\TenancyBootstrapper;
use Stancl\Tenancy\Contracts\Tenant;

/**
 * Isolates tenant caches by pointing the file cache store at a per-tenant
 * directory. Replaces stancl's CacheTenancyBootstrapper, which relies on
 * cache tags — unsupported by the file/database drivers used in production.
 */
class FileCacheTenancyBootstrapper implements TenancyBootstrapper
{
    protected ?string $originalPath = null;

    public function __construct(protected Application $app)
    {
    }

    public function bootstrap(Tenant $tenant): void
    {
        $this->originalPath = config('cache.stores.file.path');

        config([
            'cache.stores.file.path' => $this->originalPath . DIRECTORY_SEPARATOR . 'tenant_' . $tenant->getTenantKey(),
        ]);

        $this->flushResolvedCaches();
    }

    public function revert(): void
    {
        if ($this->originalPath !== null) {
            config(['cache.stores.file.path' => $this->originalPath]);
            $this->originalPath = null;
            $this->flushResolvedCaches();
        }
    }

    /**
     * Drop the resolved CacheManager/store so the next cache call
     * rebuilds the FileStore with the updated path.
     */
    protected function flushResolvedCaches(): void
    {
        $this->app->forgetInstance('cache');
        $this->app->forgetInstance('cache.store');
        Cache::clearResolvedInstances();
    }
}
