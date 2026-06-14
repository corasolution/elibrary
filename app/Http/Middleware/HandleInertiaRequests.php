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
                // Pending registration-request count for the sidebar badge (super admin only).
                'pendingRequests' => ($centralUser && $centralUser->isSuperAdmin())
                    ? rescue(fn () => \App\Models\Central\RegistrationRequest::where('status', 'pending')->count(), 0, false)
                    : 0,
            ]);
        }

        // Resolve session users defensively: the web/patron guards read tenant-side
        // tables (users, patrons) that don't exist on the central connection. A
        // tenant login session leaking onto a central-domain page must not 500.
        try { $patron = $request->user('patron'); } catch (\Throwable) { $patron = null; }
        try { $webUser = $request->user(); } catch (\Throwable) { $webUser = null; }

        return array_merge(parent::share($request), [
            'auth' => [
                'patron' => $patron ? [
                    'id'         => $patron->id,
                    'name'       => $patron->fullName(),
                    'email'      => $patron->email,
                    'active_loans' => $patron->active_loans,
                ] : null,
                'user' => $webUser ? array_merge(
                    $webUser->only(['id', 'name', 'email']),
                    ['preferred_language' => $webUser->preferred_language ?? 'km']
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
                        $reserved = ['admin', 'features', 'pricing', 'about', 'contact', 'demo', 'libraries'];

                        if (! in_array($slug, $reserved)) {
                            $t = \App\Models\Central\Tenant::where('slug', $slug)
                                   ->where('status', 'active')
                                   ->first();
                        }
                    }
                }

                if (! $t) return null;
                $logoUrl   = null;
                $tagline   = null;
                $libName   = null;
                $siteTitle = null;
                try {
                    $logoUrl   = \App\Models\Tenant\LibrarySetting::get('logo_url');
                    $tagline   = \App\Models\Tenant\LibrarySetting::get('library_tagline');
                    $libName   = \App\Models\Tenant\LibrarySetting::get('library_name');
                    $siteTitle = \App\Models\Tenant\LibrarySetting::get('site_title');
                } catch (\Throwable) {}
                $selfReg = true;
                try {
                    $selfReg = filter_var(
                        \App\Models\Tenant\LibrarySetting::get('enable_self_registration', true),
                        FILTER_VALIDATE_BOOLEAN
                    );
                } catch (\Throwable) {}
                return [
                    'name'       => $libName ?: $t->name,
                    'slug'       => $t->slug,
                    'base_url'   => '/' . $t->slug,
                    'logo_url'   => $logoUrl,
                    'tagline'    => $tagline,
                    'site_title' => $siteTitle ?: ($libName ?: $t->name),
                    'self_registration' => $selfReg,
                ];
            })(),
            'flash' => [
                'success' => $request->session()->get('success'),
                'error'   => $request->session()->get('error'),
            ],
            'locale' => $webUser
                ? ($webUser->preferred_language ?? 'km')
                : ($patron ? ($patron->preferred_language ?? 'km') : 'km'),
            'platform' => [
                'name' => PlatformSetting::get('platform_name', 'Alpha eLibrary'),
                'logo' => PlatformSetting::get('platform_logo'),
                'favicon' => PlatformSetting::get('platform_favicon'),
            ],
            'ai' => (function () {
                // Per-library AI feature flags (tenant context only; safe on landing pages).
                try {
                    $platform = filter_var(PlatformSetting::get('ai_platform_enabled', true), FILTER_VALIDATE_BOOLEAN);
                    $features = filter_var(\App\Models\Tenant\LibrarySetting::get('ai_features_enabled', false), FILTER_VALIDATE_BOOLEAN);
                    $on = fn (string $k) => $platform && $features
                        && filter_var(\App\Models\Tenant\LibrarySetting::get($k, false), FILTER_VALIDATE_BOOLEAN);
                    return [
                        'features_enabled' => $platform && $features,
                        'chatbot_enabled'  => $on('ai_chatbot_enabled'),
                        'search_enabled'   => $on('ai_search_enabled'),
                    ];
                } catch (\Throwable) {
                    return ['features_enabled' => false, 'chatbot_enabled' => false, 'search_enabled' => false];
                }
            })(),
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
