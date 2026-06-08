<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Central DB seeds
        $this->call([
            PlanSeeder::class,
        ]);
    }
}
