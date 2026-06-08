<?php

namespace Database\Seeders;

use App\Models\Tenant\LibrarySetting;
use Illuminate\Database\Seeder;

class TemplateSeeder extends Seeder
{
    public function run(): void
    {
        // Set default template to modern-minimal
        LibrarySetting::firstOrCreate(
            ['key' => 'active_template'],
            [
                'value' => 'modern-minimal',
                'group' => 'theme',
                'label' => 'Active Template',
                'description' => 'Currently selected OPAC template design',
            ]
        );

        // Initialize empty custom colors
        LibrarySetting::firstOrCreate(
            ['key' => 'custom_colors'],
            [
                'value' => json_encode([]),
                'group' => 'theme',
                'label' => 'Custom Colors',
                'description' => 'Color overrides for the active template',
            ]
        );

        // Initialize empty custom fonts
        LibrarySetting::firstOrCreate(
            ['key' => 'custom_fonts'],
            [
                'value' => json_encode([]),
                'group' => 'theme',
                'label' => 'Custom Fonts',
                'description' => 'Font overrides for the active template',
            ]
        );

        // Initialize empty custom CSS
        LibrarySetting::firstOrCreate(
            ['key' => 'custom_css'],
            [
                'value' => '',
                'group' => 'theme',
                'label' => 'Custom CSS',
                'description' => 'Custom CSS styles (advanced users only)',
            ]
        );
    }
}
