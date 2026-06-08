<?php

namespace App\Http\Controllers\Central;

use App\Http\Controllers\Controller;
use App\Models\Central\CentralUser;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class TeamController extends Controller
{
    /**
     * Display team members list
     */
    public function index(Request $request)
    {
        $query = CentralUser::query()
            ->orderBy('created_at', 'desc');

        // Search
        if ($request->filled('q')) {
            $query->where(function($q) use ($request) {
                $q->where('name', 'like', '%' . $request->q . '%')
                  ->orWhere('email', 'like', '%' . $request->q . '%');
            });
        }

        // Filter by role
        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }

        $teamMembers = $query->paginate(20)->withQueryString();

        return Inertia::render('Central/Team/Index', [
            'teamMembers' => $teamMembers,
            'filters' => $request->only(['q', 'role']),
            'availableRoles' => [
                'super_admin' => 'Super Admin',
                'admin' => 'Admin',
                'support_staff' => 'Support Staff',
                'partner' => 'Partner',
                'sales_agent' => 'Sales Agent',
            ],
        ]);
    }

    /**
     * Show create form
     */
    public function create()
    {
        return Inertia::render('Central/Team/Form', [
            'availableRoles' => [
                'super_admin' => 'Super Admin',
                'admin' => 'Admin',
                'support_staff' => 'Support Staff',
                'partner' => 'Partner',
                'sales_agent' => 'Sales Agent',
            ],
        ]);
    }

    /**
     * Store new team member
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:central_users,email',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'required|in:super_admin,admin,support_staff,partner,sales_agent',
            'is_active' => 'boolean',
        ]);

        CentralUser::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return redirect()
            ->route('central.team.index')
            ->with('success', 'Team member created successfully!');
    }

    /**
     * Show edit form
     */
    public function edit($id)
    {
        $teamMember = CentralUser::findOrFail($id);

        return Inertia::render('Central/Team/Form', [
            'teamMember' => $teamMember,
            'availableRoles' => [
                'super_admin' => 'Super Admin',
                'admin' => 'Admin',
                'support_staff' => 'Support Staff',
                'partner' => 'Partner',
                'sales_agent' => 'Sales Agent',
            ],
        ]);
    }

    /**
     * Update team member
     */
    public function update(Request $request, $id)
    {
        $teamMember = CentralUser::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:central_users,email,' . $id,
            'password' => 'nullable|string|min:8|confirmed',
            'role' => 'required|in:super_admin,admin,support_staff,partner,sales_agent',
            'is_active' => 'boolean',
        ]);

        $teamMember->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'role' => $validated['role'],
            'is_active' => $validated['is_active'] ?? true,
        ]);

        // Update password if provided
        if ($request->filled('password')) {
            $teamMember->update([
                'password' => Hash::make($validated['password']),
            ]);
        }

        return redirect()
            ->route('central.team.index')
            ->with('success', 'Team member updated successfully!');
    }

    /**
     * Delete team member
     */
    public function destroy($id)
    {
        $teamMember = CentralUser::findOrFail($id);

        // Prevent deleting yourself
        if ($teamMember->id === auth('central')->id()) {
            return back()->with('error', 'You cannot delete your own account!');
        }

        $teamMember->delete();

        return redirect()
            ->route('central.team.index')
            ->with('success', 'Team member deleted successfully!');
    }
}
