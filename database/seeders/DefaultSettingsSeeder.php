<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DefaultSettingsSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            // General
            ['key' => 'library_name',        'value' => 'My Library',            'group' => 'general',     'label' => 'Library Name'],
            ['key' => 'library_email',        'value' => '',                      'group' => 'general',     'label' => 'Library Email'],
            ['key' => 'library_phone',        'value' => '',                      'group' => 'general',     'label' => 'Library Phone'],
            ['key' => 'library_address',      'value' => '',                      'group' => 'general',     'label' => 'Library Address'],
            ['key' => 'default_language',     'value' => 'en',                    'group' => 'general',     'label' => 'Default Language'],
            ['key' => 'timezone',             'value' => 'Asia/Phnom_Penh',       'group' => 'general',     'label' => 'Timezone'],

            // Circulation
            ['key' => 'max_fine_cap',         'value' => '10.00',                 'group' => 'circulation', 'label' => 'Maximum Fine Cap (USD)'],
            ['key' => 'grace_period_days',    'value' => '0',                     'group' => 'circulation', 'label' => 'Grace Period (days before fines)'],
            ['key' => 'reservation_expiry',   'value' => '7',                     'group' => 'circulation', 'label' => 'Reservation Expiry (days)'],

            // Email
            ['key' => 'overdue_notice_days',  'value' => '3',                     'group' => 'email',       'label' => 'Send due-date reminder N days before'],
            ['key' => 'email_footer',         'value' => 'Thank you for using our library.', 'group' => 'email', 'label' => 'Email Footer Text'],

            // Branding
            ['key' => 'logo_url',             'value' => '',                      'group' => 'branding',    'label' => 'Logo URL'],
            ['key' => 'primary_color',        'value' => '#0ea5e9',               'group' => 'branding',    'label' => 'Primary Brand Color'],
            ['key' => 'opac_welcome_text',    'value' => 'Welcome to our library catalog.', 'group' => 'branding', 'label' => 'OPAC Welcome Message'],
        ];

        foreach ($settings as $setting) {
            DB::table('library_settings')->upsert(
                array_merge($setting, ['updated_at' => now()]),
                ['key'],
                ['value', 'group', 'label', 'updated_at']
            );
        }
    }
}
