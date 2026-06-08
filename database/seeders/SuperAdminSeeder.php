<?php

namespace Database\Seeders;

use App\Models\Central\CentralUser;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class SuperAdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Check if super admin already exists
        $existingAdmin = CentralUser::where('email', 'admin@alphaelibrary.com')->first();

        if ($existingAdmin) {
            $this->command->info('Super admin already exists!');
            $this->command->info('Email: admin@alphaelibrary.com');
            $this->command->info('Password: password');
            return;
        }

        // Create super admin
        $admin = CentralUser::create([
            'id' => \Illuminate\Support\Str::uuid(),
            'name' => 'Super Admin',
            'email' => 'admin@alphaelibrary.com',
            'password' => Hash::make('password'),
            'role' => CentralUser::ROLE_SUPER_ADMIN,
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        $this->command->info('✅ Super Admin created successfully!');
        $this->command->line('');
        $this->command->info('Login Credentials:');
        $this->command->info('─────────────────────────────────────');
        $this->command->info('Email:    admin@alphaelibrary.com');
        $this->command->info('Password: password');
        $this->command->info('URL:      http://localhost:8000/central/login');
        $this->command->line('');
        $this->command->warn('⚠️  Please change the password after first login!');
    }
}
