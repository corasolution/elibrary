<?php

namespace Database\Seeders;

use App\Models\Central\Tenant;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DemoLibrarySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create tenant in central database
        $tenant = Tenant::updateOrCreate(
            ['id' => 'demo'],
            [
                'name' => 'Demo Library',
                'slug' => 'demo',
                'domain' => null,
                'plan_id' => null,
                'trial_ends_at' => now()->addDays(30),
                'status' => 'active',
                'data' => json_encode([
                    'library_name' => 'Demo Public Library',
                    'library_name_km' => 'បណ្ណាល័យសាធារណៈសាកល្បង',
                    'address' => 'Phnom Penh, Cambodia',
                    'phone' => '+855 12 345 678',
                    'email' => 'demo@library.com',
                ]),
            ]
        );

        $this->command->info('✅ Demo tenant created: ' . $tenant->id);

        // Run tenant migrations
        $this->command->info('Running tenant migrations...');
        \Artisan::call('tenants:migrate', ['--tenants' => [$tenant->id]]);

        // Switch to tenant database to create user
        $tenant->run(function () {
            // Create library admin user
            $user = DB::table('users')->updateOrInsert(
                ['email' => 'admin@demo.library'],
                [
                    'id' => \Illuminate\Support\Str::uuid(),
                    'name' => 'Library Admin',
                    'email' => 'admin@demo.library',
                    'password' => Hash::make('demo123'),
                    'email_verified_at' => now(),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );

            $this->command->info('✅ Library admin user created');

            // Seed AI settings for this tenant
            DB::table('library_settings')->insert([
                [
                    'key' => 'ai_features_enabled',
                    'value' => 'true',
                    'group' => 'ai',
                    'label' => 'Enable AI Features',
                    'description' => 'Master switch for AI-powered cataloging features',
                    'updated_at' => now(),
                ],
                [
                    'key' => 'ai_monthly_budget',
                    'value' => '50.00',
                    'group' => 'ai',
                    'label' => 'Monthly AI Budget (USD)',
                    'description' => 'Maximum AI spending per month',
                    'updated_at' => now(),
                ],
                [
                    'key' => 'ai_budget_alert_threshold',
                    'value' => '0.80',
                    'group' => 'ai',
                    'label' => 'Budget Alert Threshold',
                    'description' => 'Send alert when reaching this percentage of budget',
                    'updated_at' => now(),
                ],
                [
                    'key' => 'ai_auto_disable_on_budget',
                    'value' => 'true',
                    'group' => 'ai',
                    'label' => 'Auto-disable on Budget Exceeded',
                    'description' => 'Automatically disable AI when budget is exceeded',
                    'updated_at' => now(),
                ],
            ]);

            $this->command->info('✅ AI settings configured');

            // Add some material types if not exists
            $materialTypes = [
                ['code' => 'book', 'name' => 'Book', 'name_km' => 'សៀវភៅ', 'has_physical' => true, 'has_digital' => false],
                ['code' => 'ebook', 'name' => 'eBook', 'name_km' => 'សៀវភៅអេឡិចត្រូនិក', 'has_physical' => false, 'has_digital' => true],
                ['code' => 'journal', 'name' => 'Journal', 'name_km' => 'ទស្សនាវដ្តី', 'has_physical' => true, 'has_digital' => true],
                ['code' => 'thesis', 'name' => 'Thesis', 'name_km' => 'និក្ខេបបទ', 'has_physical' => true, 'has_digital' => true],
            ];

            foreach ($materialTypes as $type) {
                DB::table('material_types')->updateOrInsert(
                    ['code' => $type['code']],
                    array_merge($type, ['created_at' => now()])
                );
            }

            $this->command->info('✅ Material types seeded');
        });

        $this->command->line('');
        $this->command->info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        $this->command->info('      📚 DEMO LIBRARY CREATED!');
        $this->command->info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        $this->command->line('');
        $this->command->info('Library Admin Login:');
        $this->command->info('─────────────────────────────────────');
        $this->command->info('URL:      http://demo.localhost:8000/admin/login');
        $this->command->info('          OR');
        $this->command->info('          http://localhost:8000/admin/login');
        $this->command->info('          (add "demo" tenant context)');
        $this->command->info('Email:    admin@demo.library');
        $this->command->info('Password: demo123');
        $this->command->line('');
        $this->command->info('OPAC (Public Catalog):');
        $this->command->info('URL:      http://demo.localhost:8000');
        $this->command->line('');
        $this->command->info('Tenant ID: ' . $tenant->id);
        $this->command->info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    }
}
