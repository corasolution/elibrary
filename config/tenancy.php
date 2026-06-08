<?php

use Stancl\Tenancy\Database\Models\Tenant;

return [
    'tenant_model' => \App\Models\Central\Tenant::class,

    'id_generator' => Stancl\Tenancy\UUIDGenerator::class,

    'domain_model' => Stancl\Tenancy\Database\Models\Domain::class,

    'central_domains' => [
        'localhost',
        'alphaelibrary.com',
        'app.alphaelibrary.com',
    ],

    'bootstrappers' => [
        Stancl\Tenancy\Bootstrappers\DatabaseTenancyBootstrapper::class,
        Stancl\Tenancy\Bootstrappers\CacheTenancyBootstrapper::class,
        Stancl\Tenancy\Bootstrappers\FilesystemTenancyBootstrapper::class,
        Stancl\Tenancy\Bootstrappers\QueueTenancyBootstrapper::class,
    ],

    'database' => [
        'central_connection' => env('DB_CONNECTION', 'pgsql'),
        'template_tenant_connection' => null,
        'prefix' => env('TENANCY_DATABASE_PREFIX', 'alpha_elibrary_tenant_'),
        'suffix' => '',
        'managers' => [
            'pgsql' => Stancl\Tenancy\TenantDatabaseManagers\PostgreSQLDatabaseManager::class,
        ],
    ],

    'cache' => [
        'tag_base' => 'tenant',
    ],

    'filesystem' => [
        'suffix_base' => 'tenant',
        'disks' => ['local', 's3'],
        'root_override' => [
            'local' => '%storage_path%/app/',
        ],
        'suffix_storage_path' => true,
        'asset_helper_tenancy' => false,
    ],

    'redis' => [
        'prefix_base' => 'tenant',
        'prefixed_connections' => ['default', 'cache'],
    ],

    'features' => [
        // Stancl\Tenancy\Features\UserImpersonation::class,
        // Stancl\Tenancy\Features\TelescopeTags::class,
        Stancl\Tenancy\Features\UniversalRoutes::class,
    ],

    'migration_parameters' => [
        '--force' => true,
        '--path' => [database_path('migrations/tenant')],
        '--realpath' => true,
    ],

    'seeder_parameters' => [
        '--class' => 'TenantDatabaseSeeder',
        '--force' => true,
    ],
];
