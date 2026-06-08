<?php

namespace Database\Seeders;

use App\Models\Central\Tenant;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Str;

/**
 * Creates the 'elibrary' tenant on PostgreSQL, migrates its database,
 * and seeds it with the demo catalog (via TenantDatabaseSeeder).
 */
class ElibraryTenantSeeder extends Seeder
{
    public function run(): void
    {
        // Remove any prior partial record so TenantCreated fires fresh
        Tenant::where('slug', 'elibrary')->forceDelete();

        // Creating the tenant fires the TenancyServiceProvider pipeline:
        // CreateDatabase -> MigrateDatabase -> SeedDatabase (TenantDatabaseSeeder)
        $tenant = Tenant::create([
            'id' => (string) Str::uuid(),
            'name' => 'eLibrary',
            'slug' => 'elibrary',
            'domain' => null,
            'plan_id' => null,
            'status' => 'active',
            'data' => json_encode([
                'library_name' => 'eLibrary',
                'email' => 'admin@elibrary.com',
            ]),
        ]);

        $this->command->info('✅ elibrary tenant created + migrated + seeded: ' . $tenant->id);
    }
}
