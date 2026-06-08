<?php

namespace Database\Seeders;

use App\Models\Central\Tenant;
use App\Models\Tenant\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * Adds the bora@gmail.com library_admin to the elibrary tenant
 * (recreates the account that was lost when migrating off SQLite).
 */
class AddBoraUserSeeder extends Seeder
{
    public function run(): void
    {
        $tenant = Tenant::where('slug', 'elibrary')->firstOrFail();

        $tenant->run(function () {
            $user = User::firstOrCreate(
                ['email' => 'bora@gmail.com'],
                [
                    'name' => 'bora',
                    'password' => Hash::make('12345678'),
                    'email_verified_at' => now(),
                ]
            );

            if (! $user->hasRole('library_admin')) {
                $user->assignRole('library_admin');
            }
        });

        $this->command->info('✅ bora@gmail.com (library_admin) added to elibrary');
    }
}
