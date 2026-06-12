<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Tenant\Patron;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class PatronAuthController extends Controller
{
    public function showLogin(): \Inertia\Response
    {
        return Inertia::render('Auth/PatronLogin');
    }

    public function login(Request $request): \Illuminate\Http\RedirectResponse
    {
        $credentials = $request->validate([
            'email'    => ['required', 'email'],
            'password' => ['required'],
        ]);

        if (! Auth::guard('patron')->attempt($credentials, $request->boolean('remember'))) {
            throw ValidationException::withMessages([
                'email' => __('auth.failed'),
            ]);
        }

        $request->session()->regenerate();

        $slug = $request->segment(1);
        return redirect()->intended("/{$slug}/account");
    }

    public function loginByQr(Request $request): \Illuminate\Http\RedirectResponse
    {
        $request->validate(['qr_token' => ['required', 'string', 'size:64']]);

        $patron = Patron::where('qr_token', $request->qr_token)
                        ->where('status', 'active')
                        ->first();

        if (! $patron) {
            return back()->withErrors(['qr' => 'Invalid or unrecognised QR code.']);
        }

        Auth::guard('patron')->login($patron, false);
        $request->session()->regenerate();

        $slug = $request->segment(1);
        return redirect("/{$slug}/account");
    }

    public function getQrToken(Request $request): JsonResponse
    {
        $patron = Auth::guard('patron')->user();

        if (! $patron->qr_token) {
            $patron->update([
                'qr_token' => hash('sha256', $patron->id . config('app.key')),
            ]);
        }

        return response()->json(['qr_token' => $patron->qr_token]);
    }

    public function showRegister(): \Inertia\Response
    {
        return Inertia::render('Auth/PatronRegister');
    }

    public function register(Request $request): \Illuminate\Http\RedirectResponse
    {
        $data = $request->validate([
            'first_name' => ['required', 'string', 'max:100'],
            'last_name'  => ['nullable', 'string', 'max:100'],
            'email'      => ['required', 'email', 'unique:patrons,email'],
            'password'   => ['required', 'confirmed', 'min:8'],
            'phone'      => ['nullable', 'string', 'max:30'],
        ]);

        $patron = Patron::create([
            'patron_number' => $this->generatePatronNumber(),
            'first_name'    => $data['first_name'],
            'last_name'     => $data['last_name'] ?? null,
            'email'         => $data['email'],
            'password'      => Hash::make($data['password']),
            'phone'         => $data['phone'] ?? null,
        ]);

        Auth::guard('patron')->login($patron);

        $slug = $request->segment(1);
        return redirect("/{$slug}/account");
    }

    public function logout(Request $request): \Illuminate\Http\RedirectResponse
    {
        Auth::guard('patron')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        $slug = $request->segment(1);
        return redirect("/{$slug}");
    }

    private function generatePatronNumber(): string
    {
        $t      = app()->bound('currentTenant') ? app('currentTenant') : null;
        $prefix = strtoupper(substr($t?->slug ?? 'LIB', 0, 3));
        $next   = str_pad(Patron::count() + 1, 6, '0', STR_PAD_LEFT);
        return "{$prefix}-{$next}";
    }
}
