<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Tenant\PatronCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PatronCategoryController extends Controller
{
    public function index()
    {
        try {
            $categories = PatronCategory::withCount('patrons')->orderBy('name')->get();
        } catch (\Throwable) {
            $categories = collect();
        }

        return Inertia::render('Admin/PatronCategories/Index', compact('categories'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'name'              => 'required|string|max:100',
            'loan_limit'        => 'required|integer|min:0|max:100',
            'loan_period_days'  => 'required|integer|min:1|max:365',
            'renewals_allowed'  => 'required|integer|min:0|max:10',
            'reservation_limit' => 'required|integer|min:0|max:20',
            'fine_rate_per_day' => 'required|numeric|min:0',
        ]);

        try {
            PatronCategory::create($request->only([
                'name', 'name_km', 'loan_limit', 'loan_period_days',
                'renewals_allowed', 'reservation_limit', 'fine_rate_per_day',
            ]));
        } catch (\Throwable $e) {
            return back()->withErrors(['general' => $e->getMessage()]);
        }

        return back()->with('success', 'Category created.');
    }

    public function update(Request $request, int $id)
    {
        $request->validate([
            'name'              => 'required|string|max:100',
            'loan_limit'        => 'required|integer|min:0|max:100',
            'loan_period_days'  => 'required|integer|min:1|max:365',
            'renewals_allowed'  => 'required|integer|min:0|max:10',
            'reservation_limit' => 'required|integer|min:0|max:20',
            'fine_rate_per_day' => 'required|numeric|min:0',
        ]);

        try {
            PatronCategory::findOrFail($id)->update($request->only([
                'name', 'name_km', 'loan_limit', 'loan_period_days',
                'renewals_allowed', 'reservation_limit', 'fine_rate_per_day',
            ]));
        } catch (\Throwable $e) {
            return back()->withErrors(['general' => $e->getMessage()]);
        }

        return back()->with('success', 'Category updated.');
    }

    public function destroy(int $id)
    {
        try {
            $cat = PatronCategory::withCount('patrons')->findOrFail($id);
            if ($cat->patrons_count > 0) {
                return back()->with('error', "Cannot delete — {$cat->patrons_count} patron(s) use this category.");
            }
            $cat->delete();
        } catch (\Throwable $e) {
            return back()->with('error', $e->getMessage());
        }

        return back()->with('success', 'Category deleted.');
    }
}
