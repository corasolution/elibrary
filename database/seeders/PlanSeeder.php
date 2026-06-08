<?php

namespace Database\Seeders;

use App\Models\Central\Plan;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class PlanSeeder extends Seeder
{
    public function run(): void
    {
        $plans = [
            [
                'id'             => Str::uuid(),
                'name'           => 'Free',
                'price_usd'      => 0.00,
                'billing_cycle'  => 'monthly',
                'max_titles'     => 500,
                'max_patrons'    => 100,
                'max_storage_gb' => 1,
                'features'       => [],
                'sort_order'     => 1,
            ],
            [
                'id'             => Str::uuid(),
                'name'           => 'Starter',
                'price_usd'      => 29.00,
                'billing_cycle'  => 'monthly',
                'max_titles'     => 5000,
                'max_patrons'    => 1000,
                'max_storage_gb' => 20,
                'features'       => ['digital_library', 'email_notifications', 'reports'],
                'sort_order'     => 2,
            ],
            [
                'id'             => Str::uuid(),
                'name'           => 'Pro',
                'price_usd'      => 79.00,
                'billing_cycle'  => 'monthly',
                'max_titles'     => 50000,
                'max_patrons'    => 10000,
                'max_storage_gb' => 200,
                'features'       => ['digital_library', 'email_notifications', 'reports', 'multi_branch', 'custom_domain', 'api_access'],
                'sort_order'     => 3,
            ],
            [
                'id'             => Str::uuid(),
                'name'           => 'Enterprise',
                'price_usd'      => 0.00,
                'billing_cycle'  => 'annual',
                'max_titles'     => null,
                'max_patrons'    => null,
                'max_storage_gb' => null,
                'features'       => ['digital_library', 'email_notifications', 'reports', 'multi_branch', 'custom_domain', 'api_access', 'dedicated_support', 'sla'],
                'sort_order'     => 4,
            ],
        ];

        foreach ($plans as $plan) {
            Plan::updateOrCreate(['name' => $plan['name']], $plan);
        }
    }
}
