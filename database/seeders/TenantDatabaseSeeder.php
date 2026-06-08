<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class TenantDatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            MaterialTypeSeeder::class,
            PatronCategorySeeder::class,
            DefaultSettingsSeeder::class,
            StaffUserSeeder::class,
            DemoSeeder::class,
        ]);
    }
}
