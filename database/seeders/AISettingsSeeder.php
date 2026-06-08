<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Tenant\LibrarySetting;

class AISettingsSeeder extends Seeder
{
    /**
     * Seed default AI settings for libraries
     */
    public function run(): void
    {
        $settings = [
            [
                'key' => 'ai_features_enabled',
                'value' => 'true',
                'group' => 'ai',
                'label' => 'Enable AI Features',
                'description' => 'Enable AI-powered cataloging and search features',
            ],
            [
                'key' => 'ai_monthly_budget',
                'value' => '50.00',
                'group' => 'ai',
                'label' => 'Monthly AI Budget (USD)',
                'description' => 'Maximum amount to spend on AI features per month. Set to 0 for unlimited.',
            ],
            [
                'key' => 'ai_budget_alert_threshold',
                'value' => '0.80',
                'group' => 'ai',
                'label' => 'Budget Alert Threshold',
                'description' => 'Send alert when monthly usage reaches this percentage (0.80 = 80%)',
            ],
            [
                'key' => 'ai_auto_disable_on_budget',
                'value' => 'true',
                'group' => 'ai',
                'label' => 'Auto-disable on Budget Exceeded',
                'description' => 'Automatically disable AI features when monthly budget is exceeded',
            ],
        ];

        foreach ($settings as $setting) {
            LibrarySetting::updateOrCreate(
                ['key' => $setting['key']],
                $setting
            );
        }
    }
}
