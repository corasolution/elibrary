<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Tenant\Collection;

class CollectionSeeder extends Seeder
{
    public function run(): void
    {
        $collections = [
            [
                'name' => 'General Collection',
                'name_km' => 'បណ្ណាល័យសាធារណៈ',
                'code' => 'GEN',
                'description' => 'Books and materials available for general circulation',
                'is_loanable' => true,
                'loan_period_days' => 14,
                'renewals_allowed' => 2,
                'fine_rate_per_day' => 0.10,
                'is_active' => true,
            ],
            [
                'name' => 'Reference Collection',
                'name_km' => 'បណ្ណាល័យឯកសារយោង',
                'code' => 'REF',
                'description' => 'Reference materials - library use only, not for loan',
                'is_loanable' => false,
                'loan_period_days' => 0,
                'renewals_allowed' => 0,
                'fine_rate_per_day' => 0.00,
                'is_active' => true,
            ],
            [
                'name' => 'Reserve Collection',
                'name_km' => 'បណ្ណាល័យបម្រុងទុក',
                'code' => 'RES',
                'description' => 'High-demand materials with short loan periods',
                'is_loanable' => true,
                'loan_period_days' => 3,
                'renewals_allowed' => 0,
                'fine_rate_per_day' => 0.25,
                'is_active' => true,
            ],
            [
                'name' => 'Periodicals',
                'name_km' => 'ទស្សនាវដ្តី',
                'code' => 'PER',
                'description' => 'Journals, magazines, and newspapers',
                'is_loanable' => false,
                'loan_period_days' => 0,
                'renewals_allowed' => 0,
                'fine_rate_per_day' => 0.00,
                'is_active' => true,
            ],
            [
                'name' => 'Special Collection',
                'name_km' => 'បណ្ណាល័យពិសេស',
                'code' => 'SPEC',
                'description' => 'Rare books, archives, and special materials',
                'is_loanable' => false,
                'loan_period_days' => 0,
                'renewals_allowed' => 0,
                'fine_rate_per_day' => 0.00,
                'is_active' => true,
            ],
            [
                'name' => 'Audiovisual Collection',
                'name_km' => 'បណ្ណាល័យអូឌីយ៉ូវីដេអូ',
                'code' => 'AV',
                'description' => 'DVDs, CDs, and other audiovisual materials',
                'is_loanable' => true,
                'loan_period_days' => 7,
                'renewals_allowed' => 1,
                'fine_rate_per_day' => 0.50,
                'is_active' => true,
            ],
        ];

        foreach ($collections as $collection) {
            Collection::create($collection);
        }
    }
}
