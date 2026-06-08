<?php

namespace Database\Seeders;

use App\Models\Central\PlatformSetting;
use Illuminate\Database\Seeder;

class PlatformSettingsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $settings = [
            // Google Gemini API Configuration
            [
                'key' => 'gemini_api_key',
                'value' => env('GEMINI_API_KEY', ''),
                'group' => 'ai',
                'label' => 'Gemini API Key',
                'description' => 'Google Gemini API key for AI-powered cataloging features',
                'is_encrypted' => true,
            ],
            [
                'key' => 'gemini_api_url',
                'value' => env('GEMINI_API_URL', 'https://generativelanguage.googleapis.com/v1beta'),
                'group' => 'ai',
                'label' => 'Gemini API URL',
                'description' => 'Google Gemini API base URL',
                'is_encrypted' => false,
            ],
            [
                'key' => 'gemini_model',
                'value' => env('GEMINI_MODEL', 'gemini-1.5-flash'),
                'group' => 'ai',
                'label' => 'Gemini Model',
                'description' => 'Gemini model to use (gemini-1.5-flash recommended for cost)',
                'is_encrypted' => false,
            ],
            [
                'key' => 'ai_markup_percentage',
                'value' => '30',
                'group' => 'ai',
                'label' => 'AI Markup Percentage',
                'description' => 'Profit margin to add on top of Gemini API costs (default: 30%)',
                'is_encrypted' => false,
            ],
            [
                'key' => 'ai_platform_enabled',
                'value' => 'true',
                'group' => 'ai',
                'label' => 'Enable AI Platform-Wide',
                'description' => 'Master switch for all AI features across all tenants',
                'is_encrypted' => false,
            ],

            // Platform Information
            [
                'key' => 'platform_name',
                'value' => 'Alpha eLibrary',
                'group' => 'general',
                'label' => 'Platform Name',
                'description' => 'Name of the SaaS platform',
                'is_encrypted' => false,
            ],
            [
                'key' => 'support_email',
                'value' => 'support@alphaelibrary.com',
                'group' => 'general',
                'label' => 'Support Email',
                'description' => 'Platform support contact email',
                'is_encrypted' => false,
            ],
        ];

        foreach ($settings as $setting) {
            PlatformSetting::updateOrCreate(
                ['key' => $setting['key']],
                $setting
            );
        }

        $this->command->info('Platform settings seeded successfully.');
    }
}
