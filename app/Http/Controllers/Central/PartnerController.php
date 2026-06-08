<?php

namespace App\Http\Controllers\Central;

use App\Http\Controllers\Controller;
use App\Models\Central\CentralUser;
use App\Models\Central\Tenant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

class PartnerController extends Controller
{
    /**
     * Display list of partners
     */
    public function index(Request $request)
    {
        $query = CentralUser::query()
            ->whereIn('role', [CentralUser::ROLE_PARTNER, CentralUser::ROLE_SALES_AGENT])
            ->withCount('tenants');

        // Search filter
        if ($search = $request->get('q')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Role filter
        if ($role = $request->get('role')) {
            $query->where('role', $role);
        }

        // Status filter
        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        $partners = $query->latest()->paginate(25);

        return Inertia::render('Central/Partners/Index', [
            'partners' => $partners,
            'filters' => $request->only(['q', 'role', 'is_active']),
        ]);
    }

    /**
     * Show partner creation form
     */
    public function create()
    {
        return Inertia::render('Central/Partners/Form', [
            'partner' => null,
            'roleOptions' => [
                ['value' => CentralUser::ROLE_PARTNER, 'label' => 'Partner'],
                ['value' => CentralUser::ROLE_SALES_AGENT, 'label' => 'Sales Agent'],
            ],
        ]);
    }

    /**
     * Store new partner
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:central_users,email'],
            'password' => ['required', 'string', Password::min(8)],
            'role' => ['required', 'in:' . CentralUser::ROLE_PARTNER . ',' . CentralUser::ROLE_SALES_AGENT],
            'is_active' => ['boolean'],
        ]);

        $validated['password'] = Hash::make($validated['password']);
        $validated['is_active'] = $validated['is_active'] ?? true;

        CentralUser::create($validated);

        return redirect()->route('central.partners.index')
            ->with('success', 'Partner account created successfully.');
    }

    /**
     * Show partner edit form
     */
    public function edit(string $id)
    {
        $partner = CentralUser::whereIn('role', [CentralUser::ROLE_PARTNER, CentralUser::ROLE_SALES_AGENT])
            ->findOrFail($id);

        return Inertia::render('Central/Partners/Form', [
            'partner' => $partner,
            'roleOptions' => [
                ['value' => CentralUser::ROLE_PARTNER, 'label' => 'Partner'],
                ['value' => CentralUser::ROLE_SALES_AGENT, 'label' => 'Sales Agent'],
            ],
        ]);
    }

    /**
     * Update partner
     */
    public function update(Request $request, string $id)
    {
        $partner = CentralUser::whereIn('role', [CentralUser::ROLE_PARTNER, CentralUser::ROLE_SALES_AGENT])
            ->findOrFail($id);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:central_users,email,' . $id],
            'password' => ['nullable', 'string', Password::min(8)],
            'role' => ['required', 'in:' . CentralUser::ROLE_PARTNER . ',' . CentralUser::ROLE_SALES_AGENT],
            'is_active' => ['boolean'],
        ]);

        // Only update password if provided
        if (empty($validated['password'])) {
            unset($validated['password']);
        } else {
            $validated['password'] = Hash::make($validated['password']);
        }

        $partner->update($validated);

        return redirect()->route('central.partners.index')
            ->with('success', 'Partner account updated successfully.');
    }

    /**
     * Delete partner
     */
    public function destroy(string $id)
    {
        $partner = CentralUser::whereIn('role', [CentralUser::ROLE_PARTNER, CentralUser::ROLE_SALES_AGENT])
            ->findOrFail($id);

        // Check if partner has assigned tenants
        $tenantsCount = $partner->tenants()->count() + $partner->createdTenants()->count();

        if ($tenantsCount > 0) {
            return back()->with('error', "Cannot delete partner with {$tenantsCount} assigned tenant(s). Please reassign them first.");
        }

        $partner->delete();

        return redirect()->route('central.partners.index')
            ->with('success', 'Partner account deleted successfully.');
    }

    /**
     * Show tenant assignment page for a partner
     */
    public function showAssignTenants(string $id)
    {
        $partner = CentralUser::whereIn('role', [CentralUser::ROLE_PARTNER, CentralUser::ROLE_SALES_AGENT])
            ->with('tenants')
            ->findOrFail($id);

        // Get all tenants for assignment
        $allTenants = Tenant::with('plan:id,name')
            ->select('id', 'name', 'slug', 'plan_id', 'status')
            ->get();

        // Get currently assigned tenant IDs
        $assignedTenantIds = $partner->tenants->pluck('id')->toArray();

        return Inertia::render('Central/Partners/AssignTenants', [
            'partner' => $partner,
            'allTenants' => $allTenants,
            'assignedTenantIds' => $assignedTenantIds,
        ]);
    }

    /**
     * Assign tenants to a partner
     */
    public function assignTenants(Request $request, string $id)
    {
        // Only super admins can assign tenants to partners
        if (!auth('central')->user()->isSuperAdmin()) {
            return back()->with('error', 'Only super admins can assign tenants to partners.');
        }

        $partner = CentralUser::whereIn('role', [CentralUser::ROLE_PARTNER, CentralUser::ROLE_SALES_AGENT])
            ->findOrFail($id);

        $validated = $request->validate([
            'tenant_ids' => ['required', 'array'],
            'tenant_ids.*' => ['exists:tenants,id'],
        ]);

        $currentUser = Auth::guard('central')->user();

        // Sync tenants with assignment metadata
        $syncData = [];
        foreach ($validated['tenant_ids'] as $tenantId) {
            $syncData[$tenantId] = [
                'assigned_by' => $currentUser->id,
                'assigned_at' => now(),
            ];
        }

        $partner->tenants()->sync($syncData);

        return redirect()->route('central.partners.index')
            ->with('success', 'Libraries assigned successfully to ' . $partner->name . '.');
    }
}
