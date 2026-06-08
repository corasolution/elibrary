<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Central\PlatformSetting;

class InvoiceSettingsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $settings = [
            [
                'key' => 'invoice_prefix',
                'value' => 'INV',
                'group' => 'invoice',
                'label' => 'Invoice Number Prefix',
                'description' => 'Prefix for invoice numbers (e.g., INV-2026-001234)',
            ],
            [
                'key' => 'company_name_en',
                'value' => 'Alpha eLibrary',
                'group' => 'invoice',
                'label' => 'Company Name (English)',
                'description' => 'Official company name in English for invoices',
            ],
            [
                'key' => 'company_name_km',
                'value' => 'អាល់ហ្វា អ៊ីឡាយប្រារី',
                'group' => 'invoice',
                'label' => 'Company Name (Khmer)',
                'description' => 'Official company name in Khmer for invoices',
            ],
            [
                'key' => 'company_address_en',
                'value' => 'Phnom Penh, Cambodia',
                'group' => 'invoice',
                'label' => 'Company Address (English)',
                'description' => 'Full company address in English',
            ],
            [
                'key' => 'company_address_km',
                'value' => 'ភ្នំពេញ ព្រះរាជាណាចក្រកម្ពុជា',
                'group' => 'invoice',
                'label' => 'Company Address (Khmer)',
                'description' => 'Full company address in Khmer',
            ],
            [
                'key' => 'company_tin',
                'value' => '',
                'group' => 'invoice',
                'label' => 'Tax Identification Number (TIN)',
                'description' => 'Official TIN for Cambodia tax compliance (Prakas 723)',
            ],
            [
                'key' => 'company_phone',
                'value' => '+855 (0) 12 345 678',
                'group' => 'invoice',
                'label' => 'Company Phone',
                'description' => 'Contact phone number for invoices',
            ],
            [
                'key' => 'company_email',
                'value' => 'billing@bannalai.com',
                'group' => 'invoice',
                'label' => 'Company Email',
                'description' => 'Billing/invoice contact email',
            ],
            [
                'key' => 'vat_rate',
                'value' => '10.00',
                'group' => 'invoice',
                'label' => 'VAT Rate (%)',
                'description' => 'Value Added Tax rate for invoices (default 10% for Cambodia)',
            ],
            [
                'key' => 'usd_to_khr_rate',
                'value' => '4100.00',
                'group' => 'invoice',
                'label' => 'USD to KHR Exchange Rate',
                'description' => 'Exchange rate for converting USD to Cambodian Riel (KHR) on invoices',
            ],
        ];

        foreach ($settings as $setting) {
            PlatformSetting::updateOrCreate(
                ['key' => $setting['key']],
                $setting
            );
        }

        $this->command->info('✓ Invoice settings seeded successfully');
    }
}
