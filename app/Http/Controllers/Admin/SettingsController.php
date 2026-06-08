<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Tenant\LibrarySetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class SettingsController extends Controller
{
    public function index()
    {
        try {
            $settings = LibrarySetting::all_keyed();
        } catch (\Throwable) {
            $settings = [];
        }

        return Inertia::render('Admin/Settings/Index', compact('settings'));
    }

    public function update(Request $request)
    {
        $request->validate([
            'library_name'        => 'nullable|string|max:255',
            'library_tagline'     => 'nullable|string|max:255',
            'library_email'       => 'nullable|email|max:255',
            'library_phone'       => 'nullable|string|max:50',
            'library_address'     => 'nullable|string|max:500',
            'default_language'    => 'nullable|string|max:5',
            'timezone'            => 'nullable|string|max:50',
            'opac_welcome_text'   => 'nullable|string|max:500',
            'primary_color'       => 'nullable|string|max:20',
            'logo'                => 'nullable|image|max:2048',
            'favicon'             => 'nullable|image|max:512',
            'default_loan_days'   => 'nullable|integer|min:1|max:365',
            'max_loans_per_patron'=> 'nullable|integer|min:1|max:100',
            'fine_rate_per_day'   => 'nullable|numeric|min:0|max:100',
            'max_fine'            => 'nullable|numeric|min:0|max:1000',
            'grace_period_days'   => 'nullable|integer|min:0|max:30',
            'reservation_expiry'  => 'nullable|integer|min:1|max:90',
            'enable_self_registration' => 'nullable|boolean',
            'require_email_verification' => 'nullable|boolean',
            'notifications_email' => 'nullable|email|max:255',
            'send_overdue_notices' => 'nullable|boolean',
            'send_due_reminders'   => 'nullable|boolean',
            'reminder_days_before' => 'nullable|integer|min:1|max:30',
        ]);

        // Handle logo upload
        if ($request->hasFile('logo')) {
            $path = $request->file('logo')->store('branding', 'public');
            LibrarySetting::set('logo_url', Storage::url($path));
        }
        if ($request->hasFile('favicon')) {
            $path = $request->file('favicon')->store('branding', 'public');
            LibrarySetting::set('favicon_url', Storage::url($path));
        }

        $scalar = [
            'library_name', 'library_tagline', 'library_email', 'library_phone',
            'library_address', 'default_language', 'timezone', 'opac_welcome_text',
            'primary_color',
            'default_loan_days', 'max_loans_per_patron', 'fine_rate_per_day', 'max_fine',
            'grace_period_days', 'reservation_expiry',
            'enable_self_registration', 'require_email_verification',
            'notifications_email', 'send_overdue_notices', 'send_due_reminders', 'reminder_days_before',
        ];

        foreach ($scalar as $key) {
            if ($request->has($key)) {
                LibrarySetting::set($key, $request->input($key));
            }
        }

        return back()->with('success', 'Settings saved successfully.');
    }
}
