<?php

namespace Database\Seeders;

use App\Models\Tenant\PatronCategory;
use Illuminate\Database\Seeder;

class PatronCategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Student',  'name_km' => 'និស្សិត',    'loan_limit' => 5,  'loan_period_days' => 14, 'renewals_allowed' => 2, 'reservation_limit' => 3, 'fine_rate_per_day' => 0.10, 'max_fine' => 10.00],
            ['name' => 'Faculty',  'name_km' => 'គ្រូ / សាស្ត្រាចារ្យ', 'loan_limit' => 10, 'loan_period_days' => 30, 'renewals_allowed' => 3, 'reservation_limit' => 5, 'fine_rate_per_day' => 0.10, 'max_fine' => 10.00],
            ['name' => 'Staff',    'name_km' => 'បុគ្គលិក',   'loan_limit' => 7,  'loan_period_days' => 21, 'renewals_allowed' => 2, 'reservation_limit' => 3, 'fine_rate_per_day' => 0.10, 'max_fine' => 10.00],
            ['name' => 'Public',   'name_km' => 'សាធារណៈ',    'loan_limit' => 3,  'loan_period_days' => 7,  'renewals_allowed' => 1, 'reservation_limit' => 2, 'fine_rate_per_day' => 0.15, 'max_fine' => 5.00],
            ['name' => 'VIP',      'name_km' => 'VIP',          'loan_limit' => 15, 'loan_period_days' => 30, 'renewals_allowed' => 5, 'reservation_limit' => 10, 'fine_rate_per_day' => 0.00, 'max_fine' => 0.00],
        ];

        foreach ($categories as $cat) {
            PatronCategory::updateOrCreate(['name' => $cat['name']], $cat);
        }
    }
}
