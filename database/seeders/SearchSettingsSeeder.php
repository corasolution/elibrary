<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SearchSettingsSeeder extends Seeder
{
    /**
     * Seed default search and discovery settings for tenant libraries
     */
    public function run(): void
    {
        $settings = [
            // Search Configuration
            [
                'key' => 'search_language',
                'value' => 'english',
                'group' => 'search',
                'label' => 'Search Language',
                'description' => 'Language for full-text search (english, khmer, french, spanish)',
            ],
            [
                'key' => 'enable_semantic_search_tenant',
                'value' => 'true',
                'group' => 'search',
                'label' => 'Enable Semantic Search',
                'description' => 'Enable vector-based semantic search for this library',
            ],
            [
                'key' => 'search_results_per_page',
                'value' => '20',
                'group' => 'search',
                'label' => 'Results Per Page',
                'description' => 'Number of search results to display per page (10, 20, 50)',
            ],
            [
                'key' => 'search_show_cover_images',
                'value' => 'true',
                'group' => 'search',
                'label' => 'Show Cover Images',
                'description' => 'Display cover images in search results',
            ],
            [
                'key' => 'search_default_sort',
                'value' => 'relevance',
                'group' => 'search',
                'label' => 'Default Sort Order',
                'description' => 'Default sorting for search results (relevance, title, year_desc, year_asc)',
            ],
            [
                'key' => 'search_facets_enabled',
                'value' => json_encode(['material_type', 'language', 'year', 'subject']),
                'group' => 'search',
                'label' => 'Enabled Facets',
                'description' => 'Search facets to display in sidebar',
            ],
        ];

        foreach ($settings as $setting) {
            DB::table('library_settings')->updateOrInsert(
                ['key' => $setting['key']],
                array_merge($setting, [
                    'created_at' => now(),
                    'updated_at' => now(),
                ])
            );
        }

        $this->command->info('✓ Search settings seeded for tenant');
    }
}
