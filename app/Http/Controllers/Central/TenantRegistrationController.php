<?php

namespace App\Http\Controllers\Central;

use App\Http\Controllers\Controller;
use App\Models\Central\Tenant;
use App\Models\Central\Plan;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class TenantRegistrationController extends Controller
{
    public function showForm()
    {
        $plans = Plan::all();

        return Inertia::render('Registration/Form', [
            'plans' => $plans,
        ]);
    }

    public function register(Request $request)
    {
        $data = $request->validate([
            'library_name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:100', 'regex:/^[a-z0-9\-]+$/', 'unique:tenants,slug'],
            'contact_name' => ['required', 'string', 'max:255'],
            'contact_email' => ['required', 'email', 'max:255'],
            'contact_phone' => ['nullable', 'string', 'max:30'],
            'plan_id' => ['required', 'exists:plans,id'],
            'library_type' => ['nullable', 'string', 'max:100'],
            'address' => ['nullable', 'string', 'max:500'],
            'country' => ['nullable', 'string', 'max:3'],
        ]);

        // Validate slug is not reserved
        $reserved = ['admin', 'features', 'pricing', 'about', 'contact', 'demo', 'register', 'login'];
        if (in_array($data['slug'], $reserved)) {
            return back()->withErrors(['slug' => 'This slug is reserved. Please choose another.']);
        }

        // Create tenant with pending status
        $tenant = Tenant::create([
            'id' => Str::uuid()->toString(),
            'name' => $data['library_name'],
            'slug' => $data['slug'],
            'plan_id' => $data['plan_id'],
            'status' => Tenant::STATUS_PENDING,
            'trial_ends_at' => now()->addDays(30), // 30-day trial when approved
            'data' => [
                'contact_name' => $data['contact_name'],
                'contact_email' => $data['contact_email'],
                'contact_phone' => $data['contact_phone'] ?? null,
                'library_type' => $data['library_type'] ?? null,
                'address' => $data['address'] ?? null,
                'country' => $data['country'] ?? 'KHM',
                'registered_at' => now()->toISOString(),
            ],
        ]);

        // TODO: Send admin notification email
        // TODO: Send confirmation email to contact_email

        return redirect()->route('register.pending');
    }

    public function pending()
    {
        return Inertia::render('Registration/Pending');
    }
}
