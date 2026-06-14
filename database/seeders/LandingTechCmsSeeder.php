<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * Registers the landing "Built on Modern Technology" strings in the CMS so a
 * super admin can edit them from Central Admin → CMS. Idempotent: only inserts
 * keys that are missing, so it never overwrites an editor's saved changes.
 *
 * en/km values mirror the fallbacks in resources/js/locales/*.json.
 */
class LandingTechCmsSeeder extends Seeder
{
    public function run(): void
    {
        $entries = [
            // [key, en, km]
            ['tech_badge',          'Technology',                       'បច្ចេកវិទ្យា'],
            ['tech_stack_title',    'Built on Modern Technology',       'បង្កើតដោយបច្ចេកវិទ្យាទំនើប'],
            ['tech_stack_subtitle', 'Fast, secure, and scalable. Built with the best tools in the industry.', 'លឿន សុវត្ថិភាព និងអាចពង្រីកបាន។ បង្កើតដោយឧបករណ៍ល្អបំផុតក្នុងឧស្សាហកម្ម។'],
            ['tech_laravel',        'Laravel 13',                       'Laravel 13'],
            ['tech_laravel_desc',   'Modern PHP framework',             'ក្របខ័ណ្ឌ PHP ទំនើប'],
            ['tech_react',          'React 18',                         'React 18'],
            ['tech_react_desc',     'Fast UI library',                  'បណ្ណាល័យ UI លឿន'],
            ['tech_postgres',       'PostgreSQL',                       'PostgreSQL'],
            ['tech_postgres_desc',  'Reliable database',                'មូលដ្ឋានទិន្នន័យដែលអាចទុកចិត្តបាន'],
            ['tech_r2',             'Cloudflare R2',                    'Cloudflare R2'],
            ['tech_r2_desc',        'Global CDN storage',               'ឃ្លាំងផ្ទុក CDN សកល'],
            ['tech_redis',          'Redis',                            'Redis'],
            ['tech_redis_desc',     'Caching & queues',                 'ឃ្លាំងសម្ងាត់ និងជួរ'],
            ['tech_tailwind',       'Tailwind CSS',                     'Tailwind CSS'],
            ['tech_tailwind_desc',  'Beautiful design',                 'ការរចនាស្រស់ស្អាត'],
        ];

        $now = now();
        $rows = array_map(fn ($e) => [
            'section'            => 'home',
            'key'                => $e[0],
            'en_value'           => $e[1],
            'km_value'           => $e[2],
            'translation_status' => 'manual',
            'translation_method' => null,
            'description'        => 'Landing page — Technology section',
            'is_published'       => true,
            'is_active'          => true,
            'last_published_at'  => $now,
            'created_at'         => $now,
            'updated_at'         => $now,
        ], $entries);

        // insertOrIgnore: inserts missing (section,key) rows and silently skips
        // ones that already exist, so editor changes are never overwritten.
        $added = DB::connection('central')->table('cms_translations')->insertOrIgnore($rows);

        $this->command?->info("LandingTechCmsSeeder: added {$added} new key(s).");
    }
}
