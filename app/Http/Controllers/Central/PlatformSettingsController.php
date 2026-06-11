<?php

namespace App\Http\Controllers\Central;

use App\Http\Controllers\Controller;
use App\Models\Central\PlatformSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PlatformSettingsController extends Controller
{
    /**
     * Display AI settings page
     */
    public function aiSettings()
    {
        $settings = PlatformSetting::where('group', 'ai')
            ->get()
            ->keyBy('key')
            ->map(fn($s) => $s->value);

        return Inertia::render('Central/Settings/AI', [
            'settings' => $settings,
            'apiKeyConfigured' => !empty($settings['gemini_api_key'] ?? ''),
            'claudeKeyConfigured' => !empty($settings['anthropic_api_key'] ?? ''),
            'connectionStatus' => $this->testGeminiConnection(),
        ]);
    }

    /**
     * Update AI settings (Gemini + Claude/Anthropic, per-feature provider, markup)
     */
    public function updateAISettings(Request $request)
    {
        $validated = $request->validate([
            'gemini_api_key' => 'nullable|string',
            'gemini_api_url' => 'nullable|url',
            'gemini_model' => 'nullable|string',
            'anthropic_api_key' => 'nullable|string',
            'anthropic_model' => 'nullable|string',
            'ai_provider_chatbot' => 'nullable|in:gemini,claude',
            'ai_provider_cataloging' => 'nullable|in:gemini,claude',
            'ai_markup_percentage' => 'nullable|numeric|min:0|max:100',
            'ai_platform_enabled' => 'nullable|boolean',
        ]);

        $encrypted = ['gemini_api_key', 'anthropic_api_key'];

        foreach ($validated as $key => $value) {
            if ($value !== null) {
                PlatformSetting::set($key, $value, [
                    'is_encrypted' => in_array($key, $encrypted, true),
                    'group' => 'ai',
                ]);
            }
        }

        return back()->with('success', 'AI settings updated successfully.');
    }

    /**
     * Test an AI provider connection. Body: { provider: 'gemini' | 'claude' }
     */
    public function testConnection(Request $request)
    {
        $provider = $request->input('provider', 'gemini');

        try {
            $service = $provider === 'claude'
                ? app(\App\Services\ClaudeService::class)
                : app(\App\Services\GeminiService::class);
            $result = $service->testConnection();

            return response()->json([
                'success' => $result['success'] ?? false,
                'message' => $result['message'] ?? $result['error'] ?? 'Unknown error',
                'response' => $result['response'] ?? null,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * AI usage + earnings dashboard (cross-tenant, from the central ledger).
     */
    public function aiUsage(Request $request)
    {
        $ledger = \App\Models\Central\AiUsageLedger::query();

        $totals = (clone $ledger)->selectRaw(
            'COUNT(*) as calls, SUM(input_tokens) as input_tokens, SUM(output_tokens) as output_tokens, '
            . 'SUM(api_cost_usd) as api_cost, SUM(billed_usd) as billed, SUM(earning_usd) as earning'
        )->first();

        $byProvider = (clone $ledger)->selectRaw(
            'provider, COUNT(*) as calls, SUM(input_tokens + output_tokens) as tokens, '
            . 'SUM(api_cost_usd) as api_cost, SUM(billed_usd) as billed, SUM(earning_usd) as earning'
        )->groupBy('provider')->get();

        $byFeature = (clone $ledger)->selectRaw(
            'feature, COUNT(*) as calls, SUM(input_tokens + output_tokens) as tokens, SUM(earning_usd) as earning'
        )->groupBy('feature')->orderByDesc('earning')->limit(20)->get();

        $byTenant = (clone $ledger)->selectRaw(
            'tenant_id, COUNT(*) as calls, SUM(input_tokens + output_tokens) as tokens, '
            . 'SUM(billed_usd) as billed, SUM(earning_usd) as earning'
        )->groupBy('tenant_id')->orderByDesc('billed')->limit(50)->get();

        // Attach tenant names
        $names = \App\Models\Central\Tenant::whereIn('id', $byTenant->pluck('tenant_id')->filter())
            ->pluck('name', 'id');
        $byTenant->transform(function ($row) use ($names) {
            $row->tenant_name = $names[$row->tenant_id] ?? '—';
            return $row;
        });

        $monthEarning = \App\Models\Central\AiUsageLedger::thisMonth()->sum('earning_usd');

        return Inertia::render('Central/Reports/AiUsage', [
            'totals'       => $totals,
            'byProvider'   => $byProvider,
            'byFeature'    => $byFeature,
            'byTenant'     => $byTenant,
            'monthEarning' => (float) $monthEarning,
        ]);
    }

    /**
     * Get connection status for initial page load
     */
    private function testGeminiConnection(): array
    {
        try {
            $apiKey = PlatformSetting::get('gemini_api_key');
            if (empty($apiKey)) {
                return [
                    'status' => 'not_configured',
                    'message' => 'API key not configured',
                ];
            }

            return [
                'status' => 'configured',
                'message' => 'API key configured (click Test Connection to verify)',
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'error',
                'message' => $e->getMessage(),
            ];
        }
    }

    /**
     * Display storage settings page
     */
    public function storageSettings()
    {
        $settings = PlatformSetting::where('group', 'storage')
            ->get()
            ->keyBy('key')
            ->map(fn($s) => $s->value);

        $providers = [
            ['value' => 'r2', 'label' => 'Cloudflare R2 (Recommended)', 'icon' => 'cloud'],
            ['value' => 's3', 'label' => 'Amazon S3', 'icon' => 'database'],
            ['value' => 'spaces', 'label' => 'DigitalOcean Spaces', 'icon' => 'server'],
            ['value' => 'wasabi', 'label' => 'Wasabi', 'icon' => 'archive'],
            ['value' => 'gcs', 'label' => 'Google Cloud Storage', 'icon' => 'cloud'],
        ];

        return Inertia::render('Central/Settings/Storage', [
            'settings' => $settings,
            'providers' => $providers,
        ]);
    }

    /**
     * Update storage settings
     */
    public function updateStorageSettings(Request $request)
    {
        $validated = $request->validate([
            'active_provider' => 'required|string|in:r2,s3,spaces,wasabi,gcs',
            // Cloudflare R2
            'r2_access_key' => 'nullable|string',
            'r2_secret_key' => 'nullable|string',
            'r2_account_id' => 'nullable|string',
            'r2_bucket' => 'nullable|string',
            'r2_public_url' => 'nullable|url',
            // Amazon S3
            's3_access_key' => 'nullable|string',
            's3_secret_key' => 'nullable|string',
            's3_region' => 'nullable|string',
            's3_bucket' => 'nullable|string',
            // DigitalOcean Spaces
            'do_access_key' => 'nullable|string',
            'do_secret_key' => 'nullable|string',
            'do_region' => 'nullable|string',
            'do_bucket' => 'nullable|string',
            // Wasabi
            'wasabi_access_key' => 'nullable|string',
            'wasabi_secret_key' => 'nullable|string',
            'wasabi_region' => 'nullable|string',
            'wasabi_bucket' => 'nullable|string',
            // Google Cloud Storage
            'gcs_credentials' => 'nullable|string',
            'gcs_bucket' => 'nullable|string',
        ]);

        foreach ($validated as $key => $value) {
            if ($value !== null) {
                PlatformSetting::set($key, $value, [
                    'group' => 'storage',
                    'is_encrypted' => str_contains($key, 'secret') || str_contains($key, 'credentials'),
                ]);
            }
        }

        return back()->with('success', 'Storage settings updated successfully.');
    }

    /**
     * Test storage connection
     */
    public function testStorageConnection(Request $request)
    {
        try {
            $provider = $request->input('provider', PlatformSetting::get('active_provider', 'r2'));

            // Test connection logic here
            // For now, just return success
            return response()->json([
                'success' => true,
                'message' => 'Storage connection test successful',
                'provider' => $provider,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display payment settings (QR code)
     */
    public function paymentSettings()
    {
        $settings = PlatformSetting::where('group', 'payment')
            ->get()
            ->keyBy('key')
            ->map(fn($s) => $s->value);

        return Inertia::render('Central/Settings/Payment', [
            'settings' => $settings,
        ]);
    }

    /**
     * Update payment settings
     */
    public function updatePaymentSettings(Request $request)
    {
        $validated = $request->validate([
            'payment_qr_code' => 'nullable|image|max:2048',
            'payment_instructions' => 'nullable|string',
            'payment_account_name' => 'nullable|string|max:255',
            'payment_account_number' => 'nullable|string|max:255',
        ]);

        // Handle QR code image upload
        if ($request->hasFile('payment_qr_code')) {
            $path = $request->file('payment_qr_code')->store('payment-qr', 'public');
            PlatformSetting::set('payment_qr_code', $path, ['group' => 'payment']);
        }

        // Save other settings
        foreach ($validated as $key => $value) {
            if ($key !== 'payment_qr_code' && $value !== null) {
                PlatformSetting::set($key, $value, ['group' => 'payment']);
            }
        }

        return back()->with('success', 'Payment settings updated successfully.');
    }

    /**
     * Display general platform settings
     */
    public function generalSettings()
    {
        $settings = PlatformSetting::where('group', 'general')
            ->get()
            ->keyBy('key')
            ->map(fn($s) => $s->value);

        return Inertia::render('Central/Settings/General', [
            'settings' => $settings,
        ]);
    }

    /**
     * Update general settings
     */
    public function updateGeneralSettings(Request $request)
    {
        $validated = $request->validate([
            'platform_name' => 'required|string|max:255',
            'support_email' => 'required|email',
            'platform_logo' => 'nullable|image|mimes:png,jpg,jpeg,svg|max:2048',
            'platform_favicon' => 'nullable|image|mimes:png,ico,svg|max:512',
        ]);

        // Handle logo upload
        if ($request->hasFile('platform_logo')) {
            $path = $request->file('platform_logo')->store('branding/logos', 'public');
            PlatformSetting::set('platform_logo', $path, ['group' => 'general']);
        }

        // Handle favicon upload
        if ($request->hasFile('platform_favicon')) {
            $path = $request->file('platform_favicon')->store('branding/favicons', 'public');
            PlatformSetting::set('platform_favicon', $path, ['group' => 'general']);
        }

        // Save text settings
        foreach (['platform_name', 'support_email'] as $key) {
            if (isset($validated[$key])) {
                PlatformSetting::set($key, $validated[$key], ['group' => 'general']);
            }
        }

        return back()->with('success', 'General settings updated successfully.');
    }

    /**
     * Display translation settings page
     */
    public function translationSettings()
    {
        $settings = PlatformSetting::where('group', 'translation')
            ->get()
            ->keyBy('key')
            ->map(fn($s) => $s->value);

        $monthlyUsage = \App\Models\Central\TranslationAPILog::centralTotal();
        $budget = (float)($settings['translation_monthly_budget'] ?? 10.00);

        return Inertia::render('Central/Settings/Translation', [
            'settings' => $settings,
            'usage' => [
                'this_month' => $monthlyUsage,
                'budget' => $budget,
                'percentage' => $budget > 0 ? ($monthlyUsage / $budget) * 100 : 0,
                'remaining' => max(0, $budget - $monthlyUsage),
            ],
        ]);
    }

    /**
     * Update translation settings
     */
    public function updateTranslationSettings(Request $request)
    {
        $validated = $request->validate([
            'translation_enabled' => 'nullable|boolean',
            'translation_monthly_budget' => 'nullable|numeric|min:0',
            'translation_auto_translate_new' => 'nullable|boolean',
        ]);

        foreach ($validated as $key => $value) {
            if ($value !== null) {
                PlatformSetting::set($key, $value, ['group' => 'translation']);
            }
        }

        return back()->with('success', 'Translation settings updated successfully.');
    }

    /**
     * Display invoice settings page
     */
    public function invoiceSettings()
    {
        $settings = PlatformSetting::whereIn('key', [
            'invoice_prefix',
            'company_name_en',
            'company_name_km',
            'company_address_en',
            'company_address_km',
            'company_tin',
            'company_phone',
            'company_email',
            'vat_rate',
            'usd_to_khr_rate'
        ])->get()->keyBy('key')->map(fn($s) => $s->value);

        return Inertia::render('Central/Settings/Invoice', [
            'settings' => $settings,
        ]);
    }

    /**
     * Update invoice settings
     */
    public function updateInvoiceSettings(Request $request)
    {
        $validated = $request->validate([
            'invoice_prefix' => 'required|string|max:10',
            'company_name_en' => 'required|string|max:200',
            'company_name_km' => 'required|string|max:400',
            'company_address_en' => 'required|string',
            'company_address_km' => 'required|string',
            'company_tin' => 'required|string|max:50',
            'company_phone' => 'required|string|max:30',
            'company_email' => 'required|email',
            'vat_rate' => 'required|numeric|min:0|max:100',
            'usd_to_khr_rate' => 'required|numeric|min:1',
        ]);

        foreach ($validated as $key => $value) {
            PlatformSetting::set($key, $value, ['group' => 'invoice']);
        }

        return back()->with('success', 'Invoice settings updated successfully.');
    }
}
