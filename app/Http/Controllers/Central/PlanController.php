<?php

namespace App\Http\Controllers\Central;

use App\Http\Controllers\Controller;
use App\Models\Central\Plan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class PlanController extends Controller
{
    /**
     * Display list of subscription plans
     */
    public function index()
    {
        $plans = Plan::withCount('subscriptions')
            ->orderBy('price_usd', 'asc')
            ->get();

        return Inertia::render('Central/Plans/Index', [
            'plans' => $plans,
        ]);
    }

    /**
     * Show plan creation form
     */
    public function create()
    {
        return Inertia::render('Central/Plans/Form', [
            'plan' => null,
        ]);
    }

    /**
     * Store new plan
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:50', 'unique:plans,name'],
            'price_usd' => ['required', 'numeric', 'min:0'],
            'billing_cycle' => ['required', 'in:monthly,yearly'],
            'max_titles' => ['nullable', 'integer', 'min:1'],
            'max_patrons' => ['nullable', 'integer', 'min:1'],
            'max_storage_gb' => ['nullable', 'integer', 'min:1'],
            'features' => ['nullable', 'array'],
            'is_active' => ['boolean'],
            'is_popular' => ['boolean'],
        ]);

        $validated['is_active'] = $validated['is_active'] ?? true;
        $validated['is_popular'] = $validated['is_popular'] ?? false;
        // The model casts `features` to array — assign the array directly.
        // (json_encode here would double-encode, since the cast encodes on save.)
        $validated['features'] = $validated['features'] ?? [];

        // "Most Popular" is exclusive — only one plan wears the badge.
        if ($validated['is_popular']) {
            Plan::where('is_popular', true)->update(['is_popular' => false]);
        }

        Plan::create($validated);
        $this->clearPricingCache();

        return redirect()->route('central.plans.index')
            ->with('success', "Plan '{$validated['name']}' created successfully.");
    }

    /**
     * Show plan edit form
     */
    public function edit(string $id)
    {
        $plan = Plan::withCount('subscriptions')->findOrFail($id);

        return Inertia::render('Central/Plans/Form', [
            'plan' => $plan,
        ]);
    }

    /**
     * Update plan
     */
    public function update(Request $request, string $id)
    {
        $plan = Plan::findOrFail($id);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:50', "unique:plans,name,{$id}"],
            'price_usd' => ['required', 'numeric', 'min:0'],
            'billing_cycle' => ['required', 'in:monthly,yearly'],
            'max_titles' => ['nullable', 'integer', 'min:1'],
            'max_patrons' => ['nullable', 'integer', 'min:1'],
            'max_storage_gb' => ['nullable', 'integer', 'min:1'],
            'features' => ['nullable', 'array'],
            'is_active' => ['boolean'],
            'is_popular' => ['boolean'],
        ]);

        $validated['is_popular'] = $validated['is_popular'] ?? false;
        // The model casts `features` to array — assign the array directly.
        // (json_encode here would double-encode, since the cast encodes on save.)
        $validated['features'] = $validated['features'] ?? [];

        // "Most Popular" is exclusive — clear it from other plans first.
        if ($validated['is_popular']) {
            Plan::where('id', '!=', $id)->where('is_popular', true)->update(['is_popular' => false]);
        }

        $plan->update($validated);
        $this->clearPricingCache();

        return redirect()->route('central.plans.index')
            ->with('success', "Plan '{$plan->name}' updated successfully.");
    }

    /**
     * Delete plan
     */
    public function destroy(string $id)
    {
        $plan = Plan::withCount('subscriptions')->findOrFail($id);

        // Prevent deletion if plan has active subscriptions
        if ($plan->subscriptions_count > 0) {
            return back()->with('error', "Cannot delete plan with active subscriptions. Please migrate them first.");
        }

        $name = $plan->name;
        $plan->delete();
        $this->clearPricingCache();

        return redirect()->route('central.plans.index')
            ->with('success', "Plan '{$name}' deleted successfully.");
    }

    /**
     * Drop the cached landing-page plan list so price/badge edits show immediately.
     */
    private function clearPricingCache(): void
    {
        \Illuminate\Support\Facades\Cache::forget('landing.plans');
    }
}
