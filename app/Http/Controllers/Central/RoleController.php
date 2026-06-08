<?php

namespace App\Http\Controllers\Central;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RoleController extends Controller
{
    /**
     * Display roles list
     */
    public function index()
    {
        $roles = [
            [
                'id' => 'super_admin',
                'name' => 'Super Admin',
                'description' => 'Full access to all platform features and settings',
                'permissions' => ['*'],
                'user_count' => \App\Models\Central\CentralUser::where('role', 'super_admin')->count(),
                'system' => true,
            ],
            [
                'id' => 'admin',
                'name' => 'Admin',
                'description' => 'Manage tenants and team members',
                'permissions' => ['tenants.*', 'team.*'],
                'user_count' => \App\Models\Central\CentralUser::where('role', 'admin')->count(),
                'system' => true,
            ],
            [
                'id' => 'support_staff',
                'name' => 'Support Staff',
                'description' => 'View tenants and provide support',
                'permissions' => ['tenants.view', 'tenants.edit'],
                'user_count' => \App\Models\Central\CentralUser::where('role', 'support_staff')->count(),
                'system' => true,
            ],
            [
                'id' => 'partner',
                'name' => 'Partner',
                'description' => 'Create and manage assigned tenants',
                'permissions' => ['tenants.create', 'tenants.assigned.*'],
                'user_count' => \App\Models\Central\CentralUser::where('role', 'partner')->count(),
                'system' => true,
            ],
            [
                'id' => 'sales_agent',
                'name' => 'Sales Agent',
                'description' => 'View tenants and create leads',
                'permissions' => ['tenants.view'],
                'user_count' => \App\Models\Central\CentralUser::where('role', 'sales_agent')->count(),
                'system' => true,
            ],
        ];

        return Inertia::render('Central/Roles/Index', [
            'roles' => $roles,
            'availablePermissions' => $this->getAvailablePermissions(),
        ]);
    }

    /**
     * Get all available permissions
     */
    private function getAvailablePermissions()
    {
        return [
            'Tenants' => [
                'tenants.view' => 'View tenants',
                'tenants.create' => 'Create tenants',
                'tenants.edit' => 'Edit tenants',
                'tenants.delete' => 'Delete tenants',
                'tenants.*' => 'Full tenant access',
            ],
            'Team' => [
                'team.view' => 'View team members',
                'team.create' => 'Create team members',
                'team.edit' => 'Edit team members',
                'team.delete' => 'Delete team members',
                'team.*' => 'Full team access',
            ],
            'Partners' => [
                'partners.view' => 'View partners',
                'partners.create' => 'Create partners',
                'partners.edit' => 'Edit partners',
                'partners.delete' => 'Delete partners',
                'partners.*' => 'Full partner access',
            ],
            'Settings' => [
                'settings.view' => 'View settings',
                'settings.edit' => 'Edit settings',
                'settings.*' => 'Full settings access',
            ],
        ];
    }

    /**
     * Show create form (future enhancement for custom roles)
     */
    public function create()
    {
        return Inertia::render('Central/Roles/Form', [
            'availablePermissions' => $this->getAvailablePermissions(),
        ]);
    }

    /**
     * Store new role (future enhancement)
     */
    public function store(Request $request)
    {
        // Future: Store custom roles in database
        return back()->with('info', 'Custom roles feature coming soon!');
    }

    /**
     * Show edit form
     */
    public function edit($id)
    {
        // Future: Edit custom roles
        return back()->with('info', 'Role editing feature coming soon!');
    }

    /**
     * Update role
     */
    public function update(Request $request, $id)
    {
        // Future: Update custom roles
        return back()->with('info', 'Role updating feature coming soon!');
    }

    /**
     * Delete role
     */
    public function destroy($id)
    {
        // Prevent deleting system roles
        return back()->with('error', 'Cannot delete system roles!');
    }
}
