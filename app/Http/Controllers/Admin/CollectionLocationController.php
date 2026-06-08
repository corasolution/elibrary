<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Tenant\Collection;
use App\Models\Tenant\Location;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CollectionLocationController extends Controller
{
    public function index()
    {
        try {
            $collections = Collection::withCount('physicalItems')->orderBy('name')->get();
            $locations   = Location::with('children')->whereNull('parent_id')->orderBy('name')->get();
        } catch (\Throwable) {
            $collections = collect();
            $locations   = collect();
        }

        return Inertia::render('Admin/CollectionsLocations/Index', compact('collections', 'locations'));
    }

    // ─── Collections ─────────────────────────────────────────────────────────

    public function storeCollection(Request $request)
    {
        $request->validate([
            'name'              => 'required|string|max:100',
            'code'              => 'required|string|max:20|unique:collections,code',
            'loan_period_days'  => 'required|integer|min:0',
            'renewals_allowed'  => 'required|integer|min:0',
            'fine_rate_per_day' => 'required|numeric|min:0',
        ]);

        try {
            Collection::create($request->only([
                'name', 'name_km', 'code', 'description',
                'is_loanable', 'loan_period_days', 'renewals_allowed', 'fine_rate_per_day',
            ]));
        } catch (\Throwable $e) {
            return back()->withErrors(['collection' => $e->getMessage()]);
        }

        return back()->with('success', 'Collection created.');
    }

    public function updateCollection(Request $request, int $id)
    {
        $request->validate([
            'name'              => 'required|string|max:100',
            'code'              => "required|string|max:20|unique:collections,code,{$id}",
            'loan_period_days'  => 'required|integer|min:0',
            'renewals_allowed'  => 'required|integer|min:0',
            'fine_rate_per_day' => 'required|numeric|min:0',
        ]);

        try {
            Collection::findOrFail($id)->update($request->only([
                'name', 'name_km', 'code', 'description',
                'is_loanable', 'loan_period_days', 'renewals_allowed', 'fine_rate_per_day',
            ]));
        } catch (\Throwable $e) {
            return back()->withErrors(['collection' => $e->getMessage()]);
        }

        return back()->with('success', 'Collection updated.');
    }

    public function destroyCollection(int $id)
    {
        try {
            $col = Collection::withCount('physicalItems')->findOrFail($id);
            if ($col->physical_items_count > 0) {
                return back()->with('error', "Cannot delete — {$col->physical_items_count} item(s) in this collection.");
            }
            $col->delete();
        } catch (\Throwable $e) {
            return back()->with('error', $e->getMessage());
        }

        return back()->with('success', 'Collection deleted.');
    }

    // ─── Locations ────────────────────────────────────────────────────────────

    public function storeLocation(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:100',
            'code' => 'nullable|string|max:20|unique:locations,code',
        ]);

        try {
            Location::create($request->only(['parent_id', 'name', 'name_km', 'code', 'address', 'is_branch']));
        } catch (\Throwable $e) {
            return back()->withErrors(['location' => $e->getMessage()]);
        }

        return back()->with('success', 'Location created.');
    }

    public function updateLocation(Request $request, int $id)
    {
        $request->validate([
            'name' => 'required|string|max:100',
            'code' => "nullable|string|max:20|unique:locations,code,{$id}",
        ]);

        try {
            Location::findOrFail($id)->update($request->only(['parent_id', 'name', 'name_km', 'code', 'address', 'is_branch']));
        } catch (\Throwable $e) {
            return back()->withErrors(['location' => $e->getMessage()]);
        }

        return back()->with('success', 'Location updated.');
    }

    public function destroyLocation(int $id)
    {
        try {
            $loc = Location::withCount('physicalItems')->findOrFail($id);
            if ($loc->physical_items_count > 0) {
                return back()->with('error', "Cannot delete — {$loc->physical_items_count} item(s) at this location.");
            }
            $loc->delete();
        } catch (\Throwable $e) {
            return back()->with('error', $e->getMessage());
        }

        return back()->with('success', 'Location deleted.');
    }
}
