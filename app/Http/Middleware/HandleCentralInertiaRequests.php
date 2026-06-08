<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleCentralInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $request->user('central') ? [
                    'id' => $request->user('central')->id,
                    'name' => $request->user('central')->name,
                    'email' => $request->user('central')->email,
                    'role' => $request->user('central')->role,
                    'is_active' => $request->user('central')->is_active,
                    'is_super_admin' => $request->user('central')->isSuperAdmin(),
                    'is_partner' => $request->user('central')->isPartner(),
                    'can_manage_partners' => $request->user('central')->canManagePartners(),
                    'can_create_tenants' => $request->user('central')->canCreateTenants(),
                ] : null,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'warning' => fn () => $request->session()->get('warning'),
                'info' => fn () => $request->session()->get('info'),
            ],
        ]);
    }
}
