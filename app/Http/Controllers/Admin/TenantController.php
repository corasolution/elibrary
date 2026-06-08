<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Central\Tenant;
use App\Models\Central\Plan;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class TenantController extends Controller
{
    public function index(Request $request)
    {
        $query = Tenant::with('plan:id,name');

        if ($search = $request->get('q')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('slug', 'like', "%{$search}%")
                  ->orWhere('domain', 'like', "%{$search}%");
            });
        }

        if ($status = $request->get('status')) {
            $query->where('status', $status);
        }

        $tenants = $query->latest()->paginate(25);

        return Inertia::render('Admin/Tenants/Index', [
            'tenants' => $tenants,
            'filters' => $request->only(['q', 'status']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Tenants/Form', [
            'tenant' => null,
            'plans' => Plan::orderBy('name')->get(['id', 'name', 'price_usd']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:100|unique:tenants,slug|regex:/^[a-z0-9-]+$/',
            'domain' => 'nullable|string|max:255|unique:tenants,domain',
            'plan_id' => 'nullable|exists:plans,id',
            'trial_ends_at' => 'nullable|date',
            'status' => 'required|in:active,suspended,cancelled',
        ]);

        $validated['id'] = (string) Str::uuid();

        try {
            $tenant = Tenant::create($validated);

            // Create tenant database (handled by stancl/tenancy events)

            return redirect()
                ->route('admin.tenants.index')
                ->with('success', "Tenant '{$tenant->name}' created successfully.");
        } catch (\Throwable $e) {
            return back()->withErrors(['general' => 'Failed to create tenant: ' . $e->getMessage()]);
        }
    }

    public function edit(string $id)
    {
        $tenant = Tenant::with('plan:id,name')->findOrFail($id);

        return Inertia::render('Admin/Tenants/Form', [
            'tenant' => $tenant,
            'plans' => Plan::orderBy('name')->get(['id', 'name', 'price_usd']),
        ]);
    }

    public function update(Request $request, string $id)
    {
        $tenant = Tenant::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => "required|string|max:100|unique:tenants,slug,{$id}|regex:/^[a-z0-9-]+$/",
            'domain' => "nullable|string|max:255|unique:tenants,domain,{$id}",
            'plan_id' => 'nullable|exists:plans,id',
            'trial_ends_at' => 'nullable|date',
            'status' => 'required|in:active,suspended,cancelled',
        ]);

        try {
            $tenant->update($validated);

            return redirect()
                ->route('admin.tenants.index')
                ->with('success', "Tenant '{$tenant->name}' updated successfully.");
        } catch (\Throwable $e) {
            return back()->withErrors(['general' => 'Failed to update tenant: ' . $e->getMessage()]);
        }
    }

    public function destroy(string $id)
    {
        try {
            $tenant = Tenant::findOrFail($id);
            $name = $tenant->name;

            // Delete tenant database (handled by stancl/tenancy events)
            $tenant->delete();

            return redirect()
                ->route('admin.tenants.index')
                ->with('success', "Tenant '{$name}' deleted successfully.");
        } catch (\Throwable $e) {
            return back()->withErrors(['general' => 'Failed to delete tenant: ' . $e->getMessage()]);
        }
    }
}
