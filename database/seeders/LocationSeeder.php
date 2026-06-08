<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Tenant\Location;

class LocationSeeder extends Seeder
{
    public function run(): void
    {
        // Main Branch
        $mainBranch = Location::create([
            'name' => 'Main Library',
            'name_km' => 'បណ្ណាល័យកណ្តាល',
            'code' => 'MAIN',
            'is_branch' => true,
            'is_active' => true,
            'address' => null,
        ]);

        // Sub-locations under Main Branch
        Location::create([
            'parent_id' => $mainBranch->id,
            'name' => 'General Collection',
            'name_km' => 'បណ្ណាល័យសាធារណៈ',
            'code' => 'MAIN-GEN',
            'is_branch' => false,
            'is_active' => true,
        ]);

        Location::create([
            'parent_id' => $mainBranch->id,
            'name' => 'Reference Section',
            'name_km' => 'ផ្នែកឯកសារយោង',
            'code' => 'MAIN-REF',
            'is_branch' => false,
            'is_active' => true,
        ]);

        Location::create([
            'parent_id' => $mainBranch->id,
            'name' => 'Periodicals Section',
            'name_km' => 'ផ្នែកទស្សនាវដ្តី',
            'code' => 'MAIN-PER',
            'is_branch' => false,
            'is_active' => true,
        ]);

        Location::create([
            'parent_id' => $mainBranch->id,
            'name' => 'Reading Room',
            'name_km' => 'បន្ទប់អាន',
            'code' => 'MAIN-RR',
            'is_branch' => false,
            'is_active' => true,
        ]);

        // Optional: Additional branch example (commented out)
        /*
        $branchA = Location::create([
            'name' => 'Branch Library A',
            'name_km' => 'បណ្ណាល័យសាខា ក',
            'code' => 'BRANCH-A',
            'is_branch' => true,
            'is_active' => true,
            'address' => 'Street 123, Phnom Penh',
        ]);

        Location::create([
            'parent_id' => $branchA->id,
            'name' => 'General Collection',
            'name_km' => 'បណ្ណាល័យសាធារណៈ',
            'code' => 'BRANCH-A-GEN',
            'is_branch' => false,
            'is_active' => true,
        ]);
        */
    }
}
