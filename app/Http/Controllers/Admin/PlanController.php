<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Central\Plan;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PlanController extends Controller
{
    public function index()
    {
        $plans = Plan::orderBy('price_usd')->get();

        return Inertia::render('Admin/Plans/Index', [
            'plans' => $plans,
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Plans/Form', [
            'plan' => null,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:50',
            'price_usd' => 'required|numeric|min:0',
            'billing_cycle' => 'required|in:monthly,annual',
            'max_titles' => 'nullable|integer|min:1',
            'max_patrons' => 'nullable|integer|min:1',
            'max_storage_gb' => 'nullable|integer|min:1',
            'features' => 'nullable|array',
        ]);

        try {
            Plan::create($validated);

            return redirect()
                ->route('admin.plans.index')
                ->with('success', "Plan '{$validated['name']}' created successfully.");
        } catch (\Throwable $e) {
            return back()->withErrors(['general' => 'Failed to create plan: ' . $e->getMessage()]);
        }
    }

    public function edit(string $id)
    {
        $plan = Plan::findOrFail($id);

        return Inertia::render('Admin/Plans/Form', [
            'plan' => $plan,
        ]);
    }

    public function update(Request $request, string $id)
    {
        $plan = Plan::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:50',
            'price_usd' => 'required|numeric|min:0',
            'billing_cycle' => 'required|in:monthly,annual',
            'max_titles' => 'nullable|integer|min:1',
            'max_patrons' => 'nullable|integer|min:1',
            'max_storage_gb' => 'nullable|integer|min:1',
            'features' => 'nullable|array',
        ]);

        try {
            $plan->update($validated);

            return redirect()
                ->route('admin.plans.index')
                ->with('success', "Plan '{$plan->name}' updated successfully.");
        } catch (\Throwable $e) {
            return back()->withErrors(['general' => 'Failed to update plan: ' . $e->getMessage()]);
        }
    }

    public function destroy(string $id)
    {
        try {
            $plan = Plan::findOrFail($id);
            $name = $plan->name;

            // Check if plan has active tenants
            if ($plan->tenants()->exists()) {
                return back()->withErrors(['general' => 'Cannot delete plan with active tenants.']);
            }

            $plan->delete();

            return redirect()
                ->route('admin.plans.index')
                ->with('success', "Plan '{$name}' deleted successfully.");
        } catch (\Throwable $e) {
            return back()->withErrors(['general' => 'Failed to delete plan: ' . $e->getMessage()]);
        }
    }
}
