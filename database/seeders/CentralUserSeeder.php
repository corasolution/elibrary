<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Central\CentralUser;
use Illuminate\Support\Facades\Hash;

class CentralUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create Super Admin user
        CentralUser::create([
            'name' => 'Super Admin',
            'email' => 'admin@bannalai.com',
            'password' => Hash::make('password'), // Change this in production!
            'role' => CentralUser::ROLE_SUPER_ADMIN,
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        // Create a demo Partner user
        CentralUser::create([
            'name' => 'Demo Partner',
            'email' => 'partner@example.com',
            'password' => Hash::make('password'), // Change this in production!
            'role' => CentralUser::ROLE_PARTNER,
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        // Create a demo Sales Agent
        CentralUser::create([
            'name' => 'Demo Sales Agent',
            'email' => 'sales@example.com',
            'password' => Hash::make('password'), // Change this in production!
            'role' => CentralUser::ROLE_SALES_AGENT,
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        $this->command->info('✅ Central users seeded successfully!');
        $this->command->info('');
        $this->command->info('🔐 Login Credentials:');
        $this->command->info('-----------------------------------');
        $this->command->info('Super Admin:');
        $this->command->info('  Email: admin@bannalai.com');
        $this->command->info('  Password: password');
        $this->command->info('');
        $this->command->info('Partner:');
        $this->command->info('  Email: partner@example.com');
        $this->command->info('  Password: password');
        $this->command->info('');
        $this->command->info('Sales Agent:');
        $this->command->info('  Email: sales@example.com');
        $this->command->info('  Password: password');
        $this->command->info('-----------------------------------');
        $this->command->warn('⚠️  IMPORTANT: Change these passwords in production!');
    }
}
