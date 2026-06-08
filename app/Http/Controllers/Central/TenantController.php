<?php

namespace App\Http\Controllers\Central;

use App\Http\Controllers\Controller;
use App\Models\Central\Tenant;
use App\Models\Central\Plan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;

class TenantController extends Controller
{
    /**
     * Display list of tenants (scoped by user permissions)
     */
    public function index(Request $request)
    {
        $centralUser = Auth::guard('central')->user();

        $query = Tenant::with(['plan:id,name', 'createdBy:id,name', 'managedBy:id,name']);

        // Include deleted tenants if filter is 'deleted'
        if ($request->get('status') === 'deleted') {
            $query->onlyTrashed();
        }

        // Scope by user role - Partners only see their assigned/created tenants
        if (!$centralUser->isSuperAdmin()) {
            $accessibleIds = $centralUser->getAllAccessibleTenantIds();
            $query->whereIn('id', $accessibleIds);
        }

        // Partner filter - show only libraries managed by specific partner
        if ($partnerId = $request->get('partner')) {
            $query->whereHas('assignedUsers', function ($q) use ($partnerId) {
                $q->where('central_user_tenants.user_id', $partnerId);
            });
        }

        // Search filter
        if ($search = $request->get('q')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('slug', 'like', "%{$search}%")
                  ->orWhere('domain', 'like', "%{$search}%");
            });
        }

        // Status filter (exclude 'deleted' as it's handled above)
        if ($status = $request->get('status')) {
            if ($status !== 'deleted') {
                $query->where('status', $status);
            }
        }

        $tenants = $query->latest()->paginate(25)->through(function ($tenant) {
            return array_merge($tenant->toArray(), [
                'is_deleted' => $tenant->trashed(),
                'days_until_permanent_deletion' => $tenant->getDaysUntilPermanentDeletion(),
                'permanent_deletion_date' => $tenant->getPermanentDeletionDate()?->format('M d, Y'),
            ]);
        });

        // Get partner info if filtering
        $partner = null;
        if ($partnerId = $request->get('partner')) {
            $partner = \App\Models\Central\CentralUser::find($partnerId);
        }

        return Inertia::render('Central/Tenants/Index', [
            'tenants' => $tenants,
            'filters' => $request->only(['q', 'status', 'partner']),
            'partner' => $partner ? [
                'id' => $partner->id,
                'name' => $partner->name,
            ] : null,
            'canCreateTenant' => $centralUser->canCreateTenants(),
            'isSuperAdmin' => $centralUser->isSuperAdmin(),
        ]);
    }

    /**
     * Show tenant creation form
     */
    public function create()
    {
        $centralUser = Auth::guard('central')->user();

        // Check if user can create tenants
        if (!$centralUser->canCreateTenants()) {
            abort(403, 'You do not have permission to create tenants.');
        }

        return Inertia::render('Central/Tenants/Form', [
            'tenant' => null,
            'plans' => Plan::where('is_active', true)->orderBy('name')->get(['id', 'name', 'price_usd']),
        ]);
    }

    /**
     * Store new tenant
     */
    public function store(Request $request)
    {
        $centralUser = Auth::guard('central')->user();

        // Check if user can create tenants
        if (!$centralUser->canCreateTenants()) {
            abort(403, 'You do not have permission to create tenants.');
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:100', 'unique:tenants,slug', 'regex:/^[a-z0-9-]+$/'],
            'domain' => ['nullable', 'string', 'max:255', 'unique:tenants,domain'],
            'plan_id' => ['nullable', 'exists:plans,id'],
            'trial_ends_at' => ['nullable', 'date'],
            'status' => ['required', 'in:pending,active,suspended,cancelled'],
            // Admin user fields
            'admin_name' => ['required', 'string', 'max:255'],
            'admin_email' => ['required', 'email', 'max:255'],
            'admin_password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $validated['id'] = (string) Str::uuid();
        $validated['created_by_id'] = $centralUser->id;
        $validated['managed_by_id'] = $centralUser->id;

        try {
            $tenant = Tenant::create($validated);

            // Create tenant database (handled by stancl/tenancy events)

            // Create admin user in the tenant database
            $this->createTenantAdmin($tenant, [
                'name' => $validated['admin_name'],
                'email' => $validated['admin_email'],
                'password' => $validated['admin_password'],
            ]);

            return redirect()
                ->route('central.tenants.index')
                ->with('success', "Library '{$tenant->name}' created successfully with admin account.");
        } catch (\Throwable $e) {
            return back()->withErrors(['general' => 'Failed to create library: ' . $e->getMessage()]);
        }
    }

    /**
     * Show tenant edit form
     */
    public function edit(string $id)
    {
        $centralUser = Auth::guard('central')->user();
        $tenant = Tenant::with('plan:id,name')->findOrFail($id);

        // Check if user can manage this tenant
        if (!$centralUser->canManageTenant($id)) {
            abort(403, 'You do not have permission to edit this tenant.');
        }

        return Inertia::render('Central/Tenants/Form', [
            'tenant' => $tenant,
            'plans' => Plan::where('is_active', true)->orderBy('name')->get(['id', 'name', 'price_usd']),
        ]);
    }

    /**
     * Update tenant
     */
    public function update(Request $request, string $id)
    {
        $centralUser = Auth::guard('central')->user();
        $tenant = Tenant::findOrFail($id);

        // Check if user can manage this tenant
        if (!$centralUser->canManageTenant($id)) {
            abort(403, 'You do not have permission to edit this tenant.');
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ["required", 'string', 'max:100', "unique:tenants,slug,{$id}", 'regex:/^[a-z0-9-]+$/'],
            'domain' => ['nullable', 'string', 'max:255', "unique:tenants,domain,{$id}"],
            'plan_id' => ['nullable', 'exists:plans,id'],
            'trial_ends_at' => ['nullable', 'date'],
            'status' => ['required', 'in:pending,active,suspended,cancelled'],
        ]);

        try {
            $tenant->update($validated);

            return redirect()
                ->route('central.tenants.index')
                ->with('success', "Tenant '{$tenant->name}' updated successfully.");
        } catch (\Throwable $e) {
            return back()->withErrors(['general' => 'Failed to update tenant: ' . $e->getMessage()]);
        }
    }

    /**
     * Delete tenant
     */
    public function destroy(string $id)
    {
        $centralUser = Auth::guard('central')->user();

        // Only super admins can delete tenants
        if (!$centralUser->isSuperAdmin()) {
            abort(403, 'Only Super Admins can delete tenants.');
        }

        try {
            $tenant = Tenant::findOrFail($id);
            $name = $tenant->name;

            // Soft delete tenant (can be restored within 30 days)
            $tenant->delete();

            return redirect()
                ->route('central.tenants.index')
                ->with('success', "Tenant '{$name}' moved to trash. It will be permanently deleted after 30 days unless restored.");
        } catch (\Throwable $e) {
            return back()->withErrors(['general' => 'Failed to delete tenant: ' . $e->getMessage()]);
        }
    }

    /**
     * Restore a soft-deleted tenant
     */
    public function restore(string $id)
    {
        $centralUser = Auth::guard('central')->user();

        // Only super admins can restore tenants
        if (!$centralUser->isSuperAdmin()) {
            abort(403, 'Only Super Admins can restore tenants.');
        }

        try {
            $tenant = Tenant::onlyTrashed()->findOrFail($id);
            $name = $tenant->name;

            $tenant->restore();

            return redirect()
                ->route('central.tenants.index')
                ->with('success', "Tenant '{$name}' restored successfully!");
        } catch (\Throwable $e) {
            return back()->withErrors(['general' => 'Failed to restore tenant: ' . $e->getMessage()]);
        }
    }

    /**
     * Permanently delete a tenant (cannot be undone)
     */
    public function forceDelete(string $id)
    {
        $centralUser = Auth::guard('central')->user();

        // Only super admins can permanently delete tenants
        if (!$centralUser->isSuperAdmin()) {
            abort(403, 'Only Super Admins can permanently delete tenants.');
        }

        try {
            $tenant = Tenant::onlyTrashed()->findOrFail($id);
            $name = $tenant->name;

            // Clean up R2/S3 storage files for this tenant
            $storageCleanup = app(\App\Services\TenantStorageCleanupService::class);
            $storageResult = $storageCleanup->cleanupTenantStorage($tenant);

            // Permanently delete tenant and its database
            $tenant->forceDelete();

            $message = "Tenant '{$name}' permanently deleted.";

            // Add storage cleanup info to success message
            if ($storageResult['success'] && $storageResult['deleted_files'] > 0) {
                $message .= " Deleted {$storageResult['deleted_files']} files (" .
                           $storageCleanup->formatBytes($storageResult['deleted_bytes']) .
                           ") from cloud storage.";
            }

            return redirect()
                ->route('central.tenants.index', ['status' => 'deleted'])
                ->with('success', $message);
        } catch (\Throwable $e) {
            return back()->withErrors(['general' => 'Failed to permanently delete tenant: ' . $e->getMessage()]);
        }
    }

    /**
     * Create admin user for the tenant
     */
    private function createTenantAdmin(Tenant $tenant, array $adminData)
    {
        try {
            // Initialize tenancy to work with tenant database
            tenancy()->initialize($tenant);

            // Create user in tenant database
            $user = \App\Models\Tenant\User::create([
                'name' => $adminData['name'],
                'email' => $adminData['email'],
                'password' => \Illuminate\Support\Facades\Hash::make($adminData['password']),
                'email_verified_at' => now(), // Auto-verify admin
            ]);

            // Assign library_admin role using Spatie Permission
            $user->assignRole('library_admin');

            // End tenancy
            tenancy()->end();

            return $user;
        } catch (\Throwable $e) {
            tenancy()->end();
            throw new \Exception("Failed to create admin user: " . $e->getMessage());
        }
    }

    /**
     * Check if slug is available
     */
    public function checkSlug(string $slug)
    {
        // Reserved slugs
        $reserved = ['admin', 'central', 'api', 'features', 'pricing', 'about', 'contact', 'demo', 'register', 'login', 'logout', 'dashboard'];

        if (in_array($slug, $reserved)) {
            return response()->json([
                'available' => false,
                'message' => 'This slug is reserved by the system.'
            ]);
        }

        // Check if slug exists
        $exists = Tenant::where('slug', $slug)->exists();

        return response()->json([
            'available' => !$exists,
            'message' => $exists ? 'This slug is already taken.' : 'This slug is available!'
        ]);
    }
}
