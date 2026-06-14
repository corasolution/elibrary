<?php

namespace App\Http\Controllers\Central;

use App\Http\Controllers\Controller;
use App\Models\Central\Plan;
use App\Models\Central\RegistrationRequest;
use Illuminate\Http\Request;
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
            'telegram' => ['required', 'string', 'max:100'],
            'contact_phone' => ['nullable', 'string', 'max:30'],
            'plan_id' => ['required', 'exists:plans,id'],
            'library_type' => ['nullable', 'string', 'max:100'],
            'collection_size' => ['required', 'string', 'max:30'],
            'address' => ['nullable', 'string', 'max:500'],
            'country' => ['nullable', 'string', 'max:3'],
        ]);

        // Validate slug is not reserved
        $reserved = ['admin', 'features', 'pricing', 'about', 'contact', 'demo', 'register', 'login'];
        if (in_array($data['slug'], $reserved)) {
            return back()->withErrors(['slug' => 'This slug is reserved. Please choose another.']);
        }

        // Registration only captures a lead — no tenant/database is created here.
        // A super admin reviews the request, verifies the library (via Telegram),
        // and then creates the library manually from the central panel.
        RegistrationRequest::create([
            'library_name'    => $data['library_name'],
            'slug'            => $data['slug'],
            'contact_name'    => $data['contact_name'],
            'contact_email'   => $data['contact_email'],
            'telegram'        => $data['telegram'],
            'contact_phone'   => $data['contact_phone'] ?? null,
            'library_type'    => $data['library_type'] ?? null,
            'collection_size' => $data['collection_size'],
            'address'         => $data['address'] ?? null,
            'country'         => $data['country'] ?? 'KHM',
            'plan_id'         => $data['plan_id'],
            'status'          => RegistrationRequest::STATUS_PENDING,
        ]);

        return redirect()->route('register.pending');
    }

    public function pending()
    {
        return Inertia::render('Registration/Pending');
    }
}
