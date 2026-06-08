<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Central\CentralUser;
use Illuminate\Support\Facades\Hash;

class CreateSuperAdminSeeder extends Seeder
{
    public function run(): void
    {
        // Check if super admin already exists
        $existingAdmin = CentralUser::where('email', 'admin@bannalai.com')->first();

        if ($existingAdmin) {
            $this->command->info('Super Admin already exists!');
            $this->command->info('Email: admin@bannalai.com');
            $this->command->info('Password: password');
            return;
        }

        // Create super admin
        $admin = CentralUser::create([
            'name' => 'Super Admin',
            'email' => 'admin@bannalai.com',
            'password' => Hash::make('password'),
            'role' => CentralUser::ROLE_SUPER_ADMIN,
            'is_active' => true,
        ]);

        $this->command->info('✓ Super Admin created successfully!');
        $this->command->info('');
        $this->command->info('Login Credentials:');
        $this->command->info('Email: admin@bannalai.com');
        $this->command->info('Password: password');
        $this->command->info('');
        $this->command->info('Access at: http://127.0.0.1:8000/central/login');
    }
}
