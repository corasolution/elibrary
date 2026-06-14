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
    public function create(Request $request)
    {
        $centralUser = Auth::guard('central')->user();

        // Check if user can create tenants
        if (!$centralUser->canCreateTenants()) {
            abort(403, 'You do not have permission to create tenants.');
        }

        // Optional prefill when converting a registration request into a library.
        $prefill = $request->only(['name', 'slug', 'admin_name', 'admin_email', 'plan_id']);

        return Inertia::render('Central/Tenants/Form', [
            'tenant' => null,
            'plans' => Plan::where('is_active', true)->orderBy('name')->get(['id', 'name', 'price_usd']),
            'prefill' => array_filter($prefill),
            'registrationRequestId' => $request->get('registration_request_id'),
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
            'registration_request_id' => ['nullable', 'string'],
        ]);

        $requestId = $validated['registration_request_id'] ?? null;
        unset($validated['registration_request_id']);

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

            // If this library was created from a registration request, mark it approved.
            if ($requestId) {
                \App\Models\Central\RegistrationRequest::where('id', $requestId)->update([
                    'status'         => \App\Models\Central\RegistrationRequest::STATUS_APPROVED,
                    'tenant_id'      => $tenant->id,
                    'reviewed_by_id' => $centralUser->id,
                    'reviewed_at'    => now(),
                ]);
            }

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
     * Tenant detail page — admins, AI usage, storage, catalog breakdown.
     * Tenant-database stats are gathered inside initialize/end so a broken
     * tenant DB degrades to an error banner instead of a 500.
     */
    public function show(string $id)
    {
        $centralUser = Auth::guard('central')->user();
        $tenant = Tenant::with(['plan:id,name,price_usd', 'managedBy:id,name', 'createdBy:id,name'])->findOrFail($id);

        if (!$centralUser->canManageTenant($id)) {
            abort(403, 'You do not have permission to view this tenant.');
        }

        $admins       = [];
        $catalog      = [];
        $totals       = ['records' => 0, 'patrons' => 0, 'staff' => 0];
        $storageBytes = null;
        $tenantError  = null;

        try {
            tenancy()->initialize($tenant);

            // Convert to plain arrays BEFORE tenancy()->end() — Inertia serializes
            // props after the tenant connection is gone, and Eloquent models from
            // the tenant DB crash on date casting without it.
            $admins = \App\Models\Tenant\User::role('library_admin')
                ->orderBy('created_at')
                ->get(['id', 'name', 'email', 'created_at'])
                ->map(fn ($u) => [
                    'id'         => $u->id,
                    'name'       => $u->name,
                    'email'      => $u->email,
                    'created_at' => $u->created_at?->toIso8601String(),
                ])
                ->values()
                ->all();

            $catalog = \App\Models\Tenant\BibliographicRecord::query()
                ->leftJoin('material_types', 'material_types.id', '=', 'bibliographic_records.material_type_id')
                ->selectRaw("coalesce(material_types.name, 'Uncategorized') as type, count(*) as total")
                ->groupBy('material_types.name')
                ->orderByDesc('total')
                ->get()
                ->map(fn ($row) => ['type' => $row->type, 'total' => (int) $row->total])
                ->values()
                ->all();

            $totals['records'] = \App\Models\Tenant\BibliographicRecord::count();
            $totals['patrons'] = \App\Models\Tenant\Patron::count();
            $totals['staff']   = \App\Models\Tenant\User::count();

            // Tenant storage usage — storage_path() is suffixed per-tenant while
            // tenancy is initialized (suffix_storage_path = true).
            $dir = storage_path('app');
            if (is_dir($dir)) {
                $storageBytes = 0;
                $iterator = new \RecursiveIteratorIterator(
                    new \RecursiveDirectoryIterator($dir, \FilesystemIterator::SKIP_DOTS)
                );
                foreach ($iterator as $file) {
                    if ($file->isFile()) {
                        $storageBytes += $file->getSize();
                    }
                }
            }
        } catch (\Throwable $e) {
            $tenantError = $e->getMessage();
        } finally {
            tenancy()->end();
        }

        // AI usage per month from the central ledger (no tenant DB scan needed)
        $aiUsage = \App\Models\Central\AiUsageLedger::where('tenant_id', $id)
            ->where('created_at', '>=', now()->subMonths(6)->startOfMonth())
            ->selectRaw("to_char(created_at, 'YYYY-MM') as month")
            ->selectRaw('count(*) as calls')
            ->selectRaw('sum(input_tokens) as input_tokens')
            ->selectRaw('sum(output_tokens) as output_tokens')
            ->selectRaw('sum(billed_usd) as billed_usd')
            ->groupBy('month')
            ->orderByDesc('month')
            ->get();

        return Inertia::render('Central/Tenants/Show', [
            'tenant'       => $tenant,
            'admins'       => $admins,
            'catalog'      => $catalog,
            'totals'       => $totals,
            'storageBytes' => $storageBytes,
            'aiUsage'      => $aiUsage,
            'tenantError'  => $tenantError,
        ]);
    }

    /**
     * Reset a library ADMIN's password. Scoped to users holding the
     * `library_admin` role only — other staff cannot be reset here.
     * Returns the new password as JSON so it can be shown once and relayed.
     */
    public function resetAdminPassword(Request $request, string $id, string $userId)
    {
        $centralUser = Auth::guard('central')->user();
        $tenant = Tenant::findOrFail($id);

        if (! $centralUser->canManageTenant($id)) {
            abort(403, 'You do not have permission to manage this library.');
        }

        $request->validate([
            'password' => ['nullable', 'string', 'min:8'],
        ]);

        $newPassword = $request->filled('password')
            ? $request->input('password')
            : Str::password(12);

        try {
            tenancy()->initialize($tenant);

            $user = \App\Models\Tenant\User::findOrFail($userId);

            if (! $user->hasRole('library_admin')) {
                tenancy()->end();
                abort(403, 'Only library admin accounts can be reset here.');
            }

            $user->update(['password' => \Illuminate\Support\Facades\Hash::make($newPassword)]);
            $email = $user->email;
        } catch (\Symfony\Component\HttpKernel\Exception\HttpException $e) {
            throw $e;
        } catch (\Throwable $e) {
            tenancy()->end();
            return response()->json(['error' => 'Could not reset password: ' . $e->getMessage()], 422);
        }

        tenancy()->end();

        return response()->json([
            'email'    => $email,
            'password' => $newPassword,
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
            'is_featured' => ['nullable', 'boolean'],
            'featured_order' => ['nullable', 'integer', 'min:1'],
        ]);

        try {
            $tenant->update($validated);
            $this->clearLandingCaches();

            return redirect()
                ->route('central.tenants.index')
                ->with('success', "Tenant '{$tenant->name}' updated successfully.");
        } catch (\Throwable $e) {
            return back()->withErrors(['general' => 'Failed to update tenant: ' . $e->getMessage()]);
        }
    }

    /**
     * Toggle a library's featured flag (shown on the public landing page).
     */
    public function toggleFeatured(Request $request, string $id)
    {
        $centralUser = Auth::guard('central')->user();

        if (!$centralUser->isSuperAdmin()) {
            abort(403, 'Only Super Admins can feature libraries.');
        }

        $tenant = Tenant::findOrFail($id);

        if ($tenant->is_featured) {
            $tenant->update(['is_featured' => false, 'featured_order' => null]);
            $message = "'{$tenant->name}' removed from the landing page.";
        } else {
            $order = $request->integer('featured_order')
                ?: ((int) Tenant::where('is_featured', true)->max('featured_order')) + 1;
            $tenant->update(['is_featured' => true, 'featured_order' => $order]);
            $message = "'{$tenant->name}' is now featured on the landing page.";
        }

        $this->clearLandingCaches();

        return back()->with('success', $message);
    }

    /**
     * Landing page library lists are cached — drop them whenever
     * featured flags or tenant details change.
     */
    private function clearLandingCaches(): void
    {
        \Illuminate\Support\Facades\Cache::forget('landing.featured_libraries');
        \Illuminate\Support\Facades\Cache::forget('landing.all_libraries');
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
        $reserved = ['admin', 'central', 'api', 'features', 'pricing', 'about', 'contact', 'demo', 'register', 'login', 'logout', 'dashboard', 'libraries'];

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
