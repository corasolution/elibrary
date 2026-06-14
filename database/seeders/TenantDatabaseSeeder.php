<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class TenantDatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Structural seeders only — every new library starts with an empty
        // catalog. (DemoSeeder, which inserts sample books/patrons/loans, was
        // removed so real libraries don't all share the same demo records.)
        $this->call([
            MaterialTypeSeeder::class,
            PatronCategorySeeder::class,
            DefaultSettingsSeeder::class,
            StaffUserSeeder::class,
            CardTemplateSeeder::class,
            LabelTemplateSeeder::class,
        ]);
    }
}
