<?php

namespace Database\Seeders;

use App\Models\Central\Tenant;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class YouTubeVideoSeeder extends Seeder
{
    public function run(): void
    {
        $tenant = Tenant::where('slug', 'elibrary')->firstOrFail();

        tenancy()->initialize($tenant);

        $videoTypeId = DB::table('material_types')->where('code', 'video')->value('id');

        if (! $videoTypeId) {
            $this->command->error('No "video" material type found. Run MaterialTypeSeeder first.');
            tenancy()->end();
            return;
        }

        $videos = [
            [
                'title'   => 'Angkor Wat: A Civilisation Uncovered',
                'authors' => [['name' => 'BBC Documentary Team', 'role' => 'author']],
                'publisher' => 'BBC Studios',
                'year'    => 2020,
                'lang'    => 'en',
                'abstract' => 'Documentary exploring the history, archaeology, and cultural significance of the Angkor temples.',
                'youtube' => 'https://www.youtube.com/watch?v=MbDPvdGsVws',
            ],
            [
                'title'   => 'Introduction to Machine Learning',
                'authors' => [['name' => 'Google Developers', 'role' => 'author']],
                'publisher' => 'Google',
                'year'    => 2022,
                'lang'    => 'en',
                'abstract' => 'A beginner-friendly introduction to core machine learning concepts and practical applications.',
                'youtube' => 'https://www.youtube.com/watch?v=HcqpanDadyQ',
            ],
            [
                'title'   => 'The Story of Cambodia',
                'authors' => [['name' => 'Asia Documentary', 'role' => 'author']],
                'publisher' => 'History Channel Asia',
                'year'    => 2019,
                'lang'    => 'en',
                'abstract' => 'A visual journey through Cambodian history from the Khmer Empire to the present day.',
                'youtube' => 'https://www.youtube.com/watch?v=1yKdTCVNBNY',
            ],
        ];

        foreach ($videos as $v) {
            $biblioId = (string) Str::uuid();
            $resourceId = (string) Str::uuid();

            DB::table('bibliographic_records')->insert([
                'id'               => $biblioId,
                'title'            => $v['title'],
                'authors'          => json_encode($v['authors']),
                'publisher'        => $v['publisher'],
                'publication_year' => $v['year'],
                'language'         => $v['lang'],
                'abstract'         => $v['abstract'],
                'material_type_id' => $videoTypeId,
                'record_status'    => 'active',
                'cataloged_at'     => now(),
                'created_at'       => now(),
                'updated_at'       => now(),
            ]);

            DB::table('digital_resources')->insert([
                'id'                => $resourceId,
                'biblio_id'         => $biblioId,
                'url'               => $v['youtube'],
                'is_external'       => true,
                'format'            => 'video',
                'original_filename' => 'youtube',
                'access_type'       => 'open_access',
                'download_count'    => 0,
                'view_count'        => 0,
                'version'           => '1.0',
                'created_at'        => now(),
                'updated_at'        => now(),
            ]);

            $this->command->info("✅ Seeded: {$v['title']}");
        }

        tenancy()->end();
    }
}
