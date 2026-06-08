<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use App\Models\Central\PlatformSetting;
use App\Models\Central\CMSTranslation;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        // Skip for central admin routes - use HandleCentralInertiaRequests instead
        if ($request->is('central') || $request->is('central/*')) {
            $centralUser = $request->user('central');
            return array_merge(parent::share($request), [
                'auth' => [
                    'user' => $centralUser ? [
                        'id' => $centralUser->id,
                        'name' => $centralUser->name,
                        'email' => $centralUser->email,
                        'role' => $centralUser->role,
                        'is_super_admin' => $centralUser->isSuperAdmin(),
                        'is_partner' => $centralUser->isPartner(),
                        'can_manage_partners' => $centralUser->canManagePartners(),
                        'can_create_tenants' => $centralUser->canCreateTenants(),
                    ] : null,
                ],
            ]);
        }

        $patron = $request->user('patron');

        return array_merge(parent::share($request), [
            'auth' => [
                'patron' => $patron ? [
                    'id'         => $patron->id,
                    'name'       => $patron->fullName(),
                    'email'      => $patron->email,
                    'active_loans' => $patron->active_loans,
                ] : null,
                'user' => $request->user() ? array_merge(
                    $request->user()->only(['id', 'name', 'email']),
                    ['preferred_language' => $request->user()->preferred_language ?? 'km']
                ) : null,
            ],
            'tenant' => (function () use ($request) {
                // Try middleware-bound tenant first
                $t = app()->bound('currentTenant') ? app('currentTenant') : null;

                // Fallback: parse slug from URL path /{slug}/...
                if (! $t) {
                    $segments = $request->segments(); // e.g. ['demo','catalog']
                    if (count($segments) >= 1) {
                        $slug = $segments[0];

                        // Reserved words (landing pages, admin) - don't treat as tenant slugs
                        $reserved = ['admin', 'features', 'pricing', 'about', 'contact', 'demo'];

                        if (! in_array($slug, $reserved)) {
                            $t = \App\Models\Central\Tenant::where('slug', $slug)
                                   ->where('status', 'active')
                                   ->first();
                        }
                    }
                }

                if (! $t) return null;
                return [
                    'name'     => $t->name,
                    'slug'     => $t->slug,
                    'base_url' => '/' . $t->slug,
                ];
            })(),
            'flash' => [
                'success' => $request->session()->get('success'),
                'error'   => $request->session()->get('error'),
            ],
            'locale' => $request->user()
                ? ($request->user()->preferred_language ?? 'km')
                : ($patron ? ($patron->preferred_language ?? 'km') : 'km'),
            'platform' => [
                'name' => PlatformSetting::get('platform_name', 'Alpha eLibrary'),
                'logo' => PlatformSetting::get('platform_logo'),
                'favicon' => PlatformSetting::get('platform_favicon'),
            ],
            'translations' => $this->getDynamicTranslations(),
        ]);
    }

    /**
     * Get dynamic translations from CMS database
     */
    private function getDynamicTranslations(): array
    {
        try {
            // Get published and active translations from CMS (only show active to public)
            $translations = CMSTranslation::published()->active()->get();

            $en = [];
            $km = [];

            foreach ($translations as $translation) {
                $section = $translation->section;
                $key = $translation->key;

                if (!isset($en[$section])) {
                    $en[$section] = [];
                    $km[$section] = [];
                }

                $en[$section][$key] = $translation->en_value;
                $km[$section][$key] = $translation->km_value ?? $translation->en_value;
            }

            return [
                'en' => $en,
                'km' => $km,
            ];
        } catch (\Throwable $e) {
            // Fallback to empty if CMS table doesn't exist yet
            return [
                'en' => [],
                'km' => [],
            ];
        }
    }
}
