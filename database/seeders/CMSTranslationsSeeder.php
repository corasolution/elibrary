<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

class CMSTranslationsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Paths to translation files
        $enPath = resource_path('js/locales/en.json');
        $kmPath = resource_path('js/locales/km.json');

        if (!File::exists($enPath)) {
            $this->command->error('English translation file not found at: ' . $enPath);
            return;
        }

        if (!File::exists($kmPath)) {
            $this->command->warn('Khmer translation file not found at: ' . $kmPath);
            $km = [];
        } else {
            $km = json_decode(File::get($kmPath), true);
        }

        $en = json_decode(File::get($enPath), true);

        if (!$en) {
            $this->command->error('Failed to parse English translation file');
            return;
        }

        $this->command->info('Importing translations from JSON files...');

        $imported = 0;
        $translations = [];

        foreach ($en as $section => $keys) {
            foreach ($keys as $key => $enValue) {
                // Skip array values (these are complex objects that need special handling)
                if (is_array($enValue)) {
                    $this->command->warn("Skipping array value: {$section}.{$key}");
                    continue;
                }

                $kmValue = $km[$section][$key] ?? null;

                // Skip if Khmer value is also an array
                if (is_array($kmValue)) {
                    $kmValue = null;
                }

                $translations[] = [
                    'section' => $section,
                    'key' => $key,
                    'en_value' => $enValue,
                    'km_value' => $kmValue,
                    'translation_status' => $kmValue ? 'manual' : 'pending',
                    'translation_method' => null,
                    'description' => null,
                    'is_published' => true,
                    'last_published_at' => now()->toDateTimeString(),
                    'created_by' => null,
                    'updated_by' => null,
                    'created_at' => now()->toDateTimeString(),
                    'updated_at' => now()->toDateTimeString(),
                ];

                $imported++;
            }
        }

        // Insert in chunks to avoid memory issues
        $chunks = array_chunk($translations, 100);

        foreach ($chunks as $chunk) {
            DB::connection('central')->table('cms_translations')->insert($chunk);
        }

        $this->command->info("Successfully imported {$imported} translation keys.");

        // Show stats
        $stats = DB::connection('central')
            ->table('cms_translations')
            ->select('section', DB::raw('count(*) as count'))
            ->groupBy('section')
            ->orderBy('section')
            ->get();

        $this->command->info("\nTranslations by section:");
        foreach ($stats as $stat) {
            $this->command->info("  {$stat->section}: {$stat->count} keys");
        }

        $pending = DB::connection('central')
            ->table('cms_translations')
            ->where('translation_status', 'pending')
            ->count();

        if ($pending > 0) {
            $this->command->warn("\n{$pending} keys need Khmer translation.");
        }
    }
}
