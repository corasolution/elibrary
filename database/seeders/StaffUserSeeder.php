<?php

namespace Database\Seeders;

use App\Models\Tenant\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class StaffUserSeeder extends Seeder
{
    public function run(): void
    {
        // Create roles if they don't exist
        $this->createRoles();

        // Create permissions if they don't exist
        $this->createPermissions();

        // Assign permissions to roles
        $this->assignPermissionsToRoles();

        // Create staff users
        $this->createStaffUsers();
    }

    private function createRoles(): void
    {
        $roles = [
            'super_admin'        => 'Super Administrator - Full system access',
            'library_admin'      => 'Library Administrator - Manage library settings',
            'cataloger'          => 'Cataloger - Manage bibliographic records',
            'circulation_staff'  => 'Circulation Staff - Checkout/return operations',
            'reader_services'    => 'Reader Services - Patron assistance',
        ];

        foreach ($roles as $name => $description) {
            Role::firstOrCreate(
                ['name' => $name, 'guard_name' => 'web'],
                ['description' => $description]
            );
        }
    }

    private function createPermissions(): void
    {
        $permissions = [
            // Catalog permissions
            'catalog.view',
            'catalog.create',
            'catalog.edit',
            'catalog.delete',
            'catalog.import',
            'catalog.export',

            // Circulation permissions
            'circulation.checkout',
            'circulation.checkin',
            'circulation.renew',
            'circulation.view_loans',
            'circulation.manage_fines',

            // Patron permissions
            'patrons.view',
            'patrons.create',
            'patrons.edit',
            'patrons.delete',

            // Digital resources
            'digital.view',
            'digital.create',
            'digital.edit',
            'digital.delete',

            // Reports
            'reports.view',
            'reports.export',

            // Settings
            'settings.view',
            'settings.edit',

            // Acquisitions
            'acquisitions.view',
            'acquisitions.create',
            'acquisitions.edit',
            'acquisitions.delete',

            // Serials
            'serials.view',
            'serials.create',
            'serials.edit',
            'serials.delete',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(
                ['name' => $permission, 'guard_name' => 'web']
            );
        }
    }

    private function assignPermissionsToRoles(): void
    {
        // Super Admin - All permissions
        $superAdmin = Role::findByName('super_admin', 'web');
        $superAdmin->syncPermissions(Permission::all());

        // Library Admin - Most permissions except super admin tasks
        $libraryAdmin = Role::findByName('library_admin', 'web');
        $libraryAdmin->syncPermissions([
            'catalog.view', 'catalog.create', 'catalog.edit', 'catalog.delete', 'catalog.import', 'catalog.export',
            'circulation.checkout', 'circulation.checkin', 'circulation.renew', 'circulation.view_loans', 'circulation.manage_fines',
            'patrons.view', 'patrons.create', 'patrons.edit', 'patrons.delete',
            'digital.view', 'digital.create', 'digital.edit', 'digital.delete',
            'reports.view', 'reports.export',
            'settings.view', 'settings.edit',
            'acquisitions.view', 'acquisitions.create', 'acquisitions.edit', 'acquisitions.delete',
            'serials.view', 'serials.create', 'serials.edit', 'serials.delete',
        ]);

        // Cataloger - Catalog and digital resources only
        $cataloger = Role::findByName('cataloger', 'web');
        $cataloger->syncPermissions([
            'catalog.view', 'catalog.create', 'catalog.edit', 'catalog.delete', 'catalog.import', 'catalog.export',
            'digital.view', 'digital.create', 'digital.edit', 'digital.delete',
            'reports.view',
            'acquisitions.view',
            'serials.view',
        ]);

        // Circulation Staff - Checkout/return operations
        $circulationStaff = Role::findByName('circulation_staff', 'web');
        $circulationStaff->syncPermissions([
            'catalog.view',
            'circulation.checkout', 'circulation.checkin', 'circulation.renew', 'circulation.view_loans', 'circulation.manage_fines',
            'patrons.view', 'patrons.create', 'patrons.edit',
            'reports.view',
        ]);

        // Reader Services - Patron assistance and basic catalog
        $readerServices = Role::findByName('reader_services', 'web');
        $readerServices->syncPermissions([
            'catalog.view',
            'circulation.view_loans',
            'patrons.view', 'patrons.create', 'patrons.edit',
            'digital.view',
            'reports.view',
        ]);
    }

    private function createStaffUsers(): void
    {
        $users = [
            [
                'name'     => 'Super Admin',
                'email'    => 'admin@bannalai.com',
                'password' => 'password',
                'role'     => 'super_admin',
            ],
            [
                'name'     => 'Library Admin',
                'email'    => 'library.admin@bannalai.com',
                'password' => 'password',
                'role'     => 'library_admin',
            ],
            [
                'name'     => 'Cataloger User',
                'email'    => 'cataloger@bannalai.com',
                'password' => 'password',
                'role'     => 'cataloger',
            ],
            [
                'name'     => 'Circulation Staff',
                'email'    => 'circulation@bannalai.com',
                'password' => 'password',
                'role'     => 'circulation_staff',
            ],
            [
                'name'     => 'Reader Services',
                'email'    => 'reader.services@bannalai.com',
                'password' => 'password',
                'role'     => 'reader_services',
            ],

            // Khmer staff members
            [
                'name'     => 'Sopheak Chea',
                'email'    => 'sopheak@bannalai.com',
                'password' => 'password',
                'role'     => 'library_admin',
            ],
            [
                'name'     => 'Sreymom Kong',
                'email'    => 'sreymom@bannalai.com',
                'password' => 'password',
                'role'     => 'cataloger',
            ],
            [
                'name'     => 'Dara Meas',
                'email'    => 'dara@bannalai.com',
                'password' => 'password',
                'role'     => 'circulation_staff',
            ],
        ];

        foreach ($users as $userData) {
            $user = User::firstOrCreate(
                ['email' => $userData['email']],
                [
                    'id'                => Str::uuid()->toString(),
                    'name'              => $userData['name'],
                    'password'          => Hash::make($userData['password']),
                    'email_verified_at' => now(),
                    'preferred_language'=> 'en',
                    'is_active'         => true,
                    'created_at'        => now(),
                    'updated_at'        => now(),
                ]
            );

            // Assign role
            $user->assignRole($userData['role']);
        }

        $this->command->info('✅ Staff users created successfully!');
    }
}
