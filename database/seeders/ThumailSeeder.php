<?php

namespace Database\Seeders;

use App\Models\Central\Tenant;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Seeds sample catalog data for the 'thumail' tenant.
 * Covers all 6 OPAC homepage collection types:
 *   eBooks, Catalog (physical books), ePublications, Audio, Video, Theses
 */
class ThumailSeeder extends Seeder
{
    public function run(): void
    {
        $tenant = Tenant::where('slug', 'elibrary')->first();

        if (! $tenant) {
            $this->command->error("Tenant 'elibrary' not found.");
            return;
        }

        $this->command->info("Seeding 'elibrary' tenant (ID: {$tenant->id})…");

        $tenant->run(function () {
            $this->seedMaterialTypes();
            $this->seedEbooks();
            $this->seedEpublications();
            $this->seedAudio();
            $this->seedVideo();
            $this->seedTheses();
            $this->seedPhysicalBooks();
        });

        $this->command->info("✅ thumail seeded successfully.");
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Material types
    // ─────────────────────────────────────────────────────────────────────────

    private function seedMaterialTypes(): void
    {
        $types = [
            ['code' => 'book',   'name' => 'Book',          'name_km' => 'សៀវភៅ',                     'has_physical' => true,  'has_digital' => false, 'sort_order' => 1],
            ['code' => 'ebook',  'name' => 'eBook',         'name_km' => 'សៀវភៅអេឡិចត្រូនិក',          'has_physical' => false, 'has_digital' => true,  'sort_order' => 2],
            ['code' => 'epub',   'name' => 'ePublication',  'name_km' => 'ការបោះពុម្ពអេឡិចត្រូនិក',    'has_physical' => false, 'has_digital' => true,  'sort_order' => 3],
            ['code' => 'audio',  'name' => 'Audio',         'name_km' => 'សម្លេង',                    'has_physical' => false, 'has_digital' => true,  'sort_order' => 4],
            ['code' => 'video',  'name' => 'Video',         'name_km' => 'វីដេអូ',                    'has_physical' => false, 'has_digital' => true,  'sort_order' => 5],
            ['code' => 'thesis', 'name' => 'Thesis',        'name_km' => 'និក្ខេបបទ',                 'has_physical' => true,  'has_digital' => true,  'sort_order' => 6],
        ];

        foreach ($types as $type) {
            DB::table('material_types')->updateOrInsert(
                ['code' => $type['code']],
                array_merge($type, ['is_active' => true, 'created_at' => now(), 'updated_at' => now()])
            );
        }

        $this->command->info('  ✓ Material types');
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Collections (physical shelving)
    // ─────────────────────────────────────────────────────────────────────────

    private function seedCollections(): void
    {
        $rows = [
            ['name' => 'General Collection',   'name_km' => 'បណ្ណាល័យទូទៅ',         'code' => 'GEN',  'is_loanable' => true,  'loan_period_days' => 14, 'renewals_allowed' => 2, 'fine_rate_per_day' => 0.10],
            ['name' => 'Reference Collection', 'name_km' => 'បណ្ណាល័យឯកសារយោង',     'code' => 'REF',  'is_loanable' => false, 'loan_period_days' => 0,  'renewals_allowed' => 0, 'fine_rate_per_day' => 0.00],
            ['name' => 'Thesis Collection',    'name_km' => 'និក្ខេបបទ',              'code' => 'THES', 'is_loanable' => true,  'loan_period_days' => 7,  'renewals_allowed' => 1, 'fine_rate_per_day' => 0.20],
            ['name' => 'Periodicals',          'name_km' => 'ទស្សនាវដ្តី',            'code' => 'PER',  'is_loanable' => false, 'loan_period_days' => 0,  'renewals_allowed' => 0, 'fine_rate_per_day' => 0.00],
            ['name' => 'Digital Resources',    'name_km' => 'ធនធានឌីជីថល',            'code' => 'DIG',  'is_loanable' => false, 'loan_period_days' => 0,  'renewals_allowed' => 0, 'fine_rate_per_day' => 0.00],
            ['name' => 'Reserve Collection',   'name_km' => 'បណ្ណាល័យបម្រុងទុក',     'code' => 'RES',  'is_loanable' => true,  'loan_period_days' => 3,  'renewals_allowed' => 0, 'fine_rate_per_day' => 0.50],
        ];

        foreach ($rows as $row) {
            // Only insert if code doesn't already exist (avoids PK sequence conflict
            // when DemoSeeder already inserted rows with explicit integer IDs)
            if (! DB::table('collections')->where('code', $row['code'])->exists()) {
                DB::table('collections')->insert(
                    array_merge($row, ['is_active' => true, 'created_at' => now(), 'updated_at' => now()])
                );
            } else {
                DB::table('collections')->where('code', $row['code'])->update(
                    array_merge($row, ['is_active' => true, 'updated_at' => now()])
                );
            }
        }

        $this->command->info('  ✓ Collections');
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────────────────

    private function typeId(string $code): ?int
    {
        return DB::table('material_types')->where('code', $code)->value('id');
    }

    private function insertBiblio(array $data): string
    {
        $id = Str::uuid()->toString();
        DB::table('bibliographic_records')->insert(array_merge([
            'id'            => $id,
            'record_status' => 'active',
            'cataloged_at'  => now(),
            'created_at'    => now(),
            'updated_at'    => now(),
        ], $data));
        return $id;
    }

    private function insertDigital(string $biblioId, string $format, int $durationSeconds = 0, int $views = 0): void
    {
        DB::table('digital_resources')->insert([
            'id'               => Str::uuid()->toString(),
            'biblio_id'        => $biblioId,
            'format'           => $format,
            'access_type'      => 'registered',
            'duration_seconds' => $durationSeconds ?: null,
            'view_count'       => $views,
            'download_count'   => 0,
            'created_at'       => now(),
            'updated_at'       => now(),
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // eBooks (12 records)
    // ─────────────────────────────────────────────────────────────────────────

    private function seedEbooks(): void
    {
        $typeId = $this->typeId('ebook');
        if (! $typeId) return;

        $books = [
            ['title' => 'Clean Code',                                   'authors' => [['name' => 'Robert C. Martin',  'role' => 'author']], 'publisher' => 'Prentice Hall',     'publication_year' => 2008, 'language' => 'en', 'ddc_class' => '005.133', 'abstract' => 'A handbook of agile software craftsmanship covering naming, functions, comments, and refactoring.'],
            ['title' => 'The Pragmatic Programmer',                     'authors' => [['name' => 'David Thomas',      'role' => 'author']], 'publisher' => 'Addison-Wesley',    'publication_year' => 2019, 'language' => 'en', 'ddc_class' => '005.1',   'abstract' => 'Your journey to mastery — from apprentice to journeyman. Updated for modern development practices.'],
            ['title' => 'Deep Learning',                                'authors' => [['name' => 'Ian Goodfellow',    'role' => 'author']], 'publisher' => 'MIT Press',         'publication_year' => 2016, 'language' => 'en', 'ddc_class' => '006.31',  'abstract' => 'The definitive textbook on deep learning, covering feedforward networks, CNNs, RNNs, and more.'],
            ['title' => 'Python Crash Course',                          'authors' => [['name' => 'Eric Matthes',      'role' => 'author']], 'publisher' => 'No Starch Press',   'publication_year' => 2023, 'language' => 'en', 'ddc_class' => '005.133', 'abstract' => 'A hands-on, project-based introduction to programming in Python 3.'],
            ['title' => 'Designing Data-Intensive Applications',        'authors' => [['name' => 'Martin Kleppmann',  'role' => 'author']], 'publisher' => "O'Reilly Media",    'publication_year' => 2017, 'language' => 'en', 'ddc_class' => '005.74',  'abstract' => 'The big ideas behind reliable, scalable, and maintainable systems.'],
            ['title' => 'The Lean Startup',                             'authors' => [['name' => 'Eric Ries',         'role' => 'author']], 'publisher' => 'Crown Business',    'publication_year' => 2011, 'language' => 'en', 'ddc_class' => '658.11',  'abstract' => 'How today\'s entrepreneurs use continuous innovation to create radically successful businesses.'],
            ['title' => 'Atomic Habits',                                'authors' => [['name' => 'James Clear',       'role' => 'author']], 'publisher' => 'Avery',             'publication_year' => 2018, 'language' => 'en', 'ddc_class' => '158.1',   'abstract' => 'An easy and proven way to build good habits and break bad ones.'],
            ['title' => 'Sapiens: A Brief History of Humankind',        'authors' => [['name' => 'Yuval Noah Harari', 'role' => 'author']], 'publisher' => 'Harper',            'publication_year' => 2015, 'language' => 'en', 'ddc_class' => '909',     'abstract' => 'How biology and history defined us and enhanced our understanding of what it means to be human.'],
            ['title' => 'Introduction to Machine Learning with Python', 'authors' => [['name' => 'Andreas Müller',    'role' => 'author']], 'publisher' => "O'Reilly Media",    'publication_year' => 2017, 'language' => 'en', 'ddc_class' => '006.31',  'abstract' => 'A guide for scientists and engineers to build machine learning systems with scikit-learn.'],
            ['title' => 'Digital Cambodia',                             'authors' => [['name' => 'Sophea Chann',      'role' => 'author']], 'publisher' => 'Corasoft Press',    'publication_year' => 2023, 'language' => 'km', 'ddc_class' => '338.9',   'abstract' => 'An examination of Cambodia\'s digital economy, fintech ecosystem, and tech startup landscape.'],
            ['title' => 'Thinking, Fast and Slow',                      'authors' => [['name' => 'Daniel Kahneman',   'role' => 'author']], 'publisher' => 'Farrar & Giroux',   'publication_year' => 2013, 'language' => 'en', 'ddc_class' => '153.4',   'abstract' => 'Two systems that drive the way we think — the fast, intuitive System 1 and the deliberative System 2.'],
            ['title' => 'Zero to One',                                  'authors' => [['name' => 'Peter Thiel',       'role' => 'author']], 'publisher' => 'Crown Business',    'publication_year' => 2014, 'language' => 'en', 'ddc_class' => '658.11',  'abstract' => 'Notes on startups, or how to build the future by creating something genuinely new.'],
        ];

        foreach ($books as $book) {
            $id = $this->insertBiblio([
                'material_type_id' => $typeId,
                'title'            => $book['title'],
                'authors'          => json_encode($book['authors']),
                'publisher'        => $book['publisher'],
                'publication_year' => $book['publication_year'],
                'language'         => $book['language'],
                'ddc_class'        => $book['ddc_class'],
                'abstract'         => $book['abstract'],
            ]);
            $this->insertDigital($id, 'pdf', 0, rand(100, 5000));
        }

        $this->command->info('  ✓ eBooks (12)');
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ePublications — journals / magazines (12 records)
    // ─────────────────────────────────────────────────────────────────────────

    private function seedEpublications(): void
    {
        $typeId = $this->typeId('epub');
        if (! $typeId) return;

        $pubs = [
            ['title' => 'Nature — Vol. 621 (2023)',                          'authors' => [['name' => 'Nature Editorial Board', 'role' => 'editor']], 'publisher' => 'Springer Nature',         'publication_year' => 2023, 'language' => 'en', 'abstract' => 'Weekly international science journal covering all branches of natural sciences.'],
            ['title' => 'The Lancet — Issue 10391 (2023)',                   'authors' => [['name' => 'Lancet Editorial Board', 'role' => 'editor']], 'publisher' => 'Elsevier',                'publication_year' => 2023, 'language' => 'en', 'abstract' => 'Leading peer-reviewed general medical journal covering global health topics.'],
            ['title' => 'Harvard Business Review — Nov/Dec 2023',            'authors' => [['name' => 'HBR Editors',           'role' => 'editor']], 'publisher' => 'Harvard Business Publishing', 'publication_year' => 2023, 'language' => 'en', 'abstract' => 'Management insights, research, and best practices for business leaders.'],
            ['title' => 'IEEE Spectrum — October 2023',                      'authors' => [['name' => 'IEEE Editorial Staff',  'role' => 'editor']], 'publisher' => 'IEEE',                    'publication_year' => 2023, 'language' => 'en', 'abstract' => 'Technology news and analysis from the world\'s largest technical professional organization.'],
            ['title' => 'Journal of Southeast Asian Studies — Vol. 54 (2023)', 'authors' => [['name' => 'NUS Editorial Board', 'role' => 'editor']], 'publisher' => 'Cambridge University Press', 'publication_year' => 2023, 'language' => 'en', 'abstract' => 'Scholarly articles on the history, politics, and cultures of Southeast Asia.'],
            ['title' => 'Cambodian Development Review — Q3 2023',            'authors' => [['name' => 'CDRI Staff',            'role' => 'editor']], 'publisher' => 'CDRI',                    'publication_year' => 2023, 'language' => 'en', 'abstract' => 'Policy research on economics, governance, and social development in Cambodia.'],
            ['title' => 'Asian Survey — Vol. 63 (2023)',                     'authors' => [['name' => 'UC Berkeley Press',     'role' => 'editor']], 'publisher' => 'University of California Press', 'publication_year' => 2023, 'language' => 'en', 'abstract' => 'Bimonthly journal of current affairs and scholarly analysis of Asia and the Pacific.'],
            ['title' => 'The Economist — November 2023',                     'authors' => [['name' => 'The Economist Group',   'role' => 'editor']], 'publisher' => 'The Economist Group',     'publication_year' => 2023, 'language' => 'en', 'abstract' => 'International coverage of world affairs, business, finance, and technology.'],
            ['title' => 'Science Advances — Vol. 9 (2023)',                  'authors' => [['name' => 'AAAS Editorial Board',  'role' => 'editor']], 'publisher' => 'AAAS',                    'publication_year' => 2023, 'language' => 'en', 'abstract' => 'Open-access multidisciplinary journal publishing cutting-edge research across STEM disciplines.'],
            ['title' => 'PLOS ONE — November 2023',                          'authors' => [['name' => 'PLOS Editorial Team',   'role' => 'editor']], 'publisher' => 'PLOS',                    'publication_year' => 2023, 'language' => 'en', 'abstract' => 'Peer-reviewed open-access scientific journal covering primary research across all disciplines.'],
            ['title' => 'Foreign Affairs — Nov/Dec 2023',                    'authors' => [['name' => 'CFR Editors',           'role' => 'editor']], 'publisher' => 'Council on Foreign Relations', 'publication_year' => 2023, 'language' => 'en', 'abstract' => 'Analysis and commentary on global politics, economics, and security from leading experts.'],
            ['title' => 'Phnom Penh Post — Digital Edition Q4 2023',         'authors' => [['name' => 'PP Post Editorial',     'role' => 'editor']], 'publisher' => 'Phnom Penh Post',         'publication_year' => 2023, 'language' => 'en', 'abstract' => 'Cambodia\'s leading English-language newspaper covering local and regional news.'],
        ];

        foreach ($pubs as $pub) {
            $id = $this->insertBiblio([
                'material_type_id' => $typeId,
                'title'            => $pub['title'],
                'authors'          => json_encode($pub['authors']),
                'publisher'        => $pub['publisher'],
                'publication_year' => $pub['publication_year'],
                'language'         => $pub['language'],
                'abstract'         => $pub['abstract'],
            ]);
            $this->insertDigital($id, 'pdf', 0, rand(50, 2000));
        }

        $this->command->info('  ✓ ePublications (12)');
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Audio (6 records)
    // ─────────────────────────────────────────────────────────────────────────

    private function seedAudio(): void
    {
        $typeId = $this->typeId('audio');
        if (! $typeId) return;

        $items = [
            ['title' => 'Machine Learning Fundamentals — Lecture Series',          'authors' => [['name' => 'Dr. Andrew Ng',         'role' => 'author']], 'publisher' => 'Coursera Audio', 'publication_year' => 2022, 'language' => 'en', 'abstract' => 'Recorded lectures covering supervised learning, neural networks, and practical ML tips.', 'duration' => 7200],
            ['title' => 'Cambodian History: Ancient to Modern',                    'authors' => [['name' => 'Prof. David Chandler',   'role' => 'author']], 'publisher' => 'SOAS Audio',     'publication_year' => 2021, 'language' => 'en', 'abstract' => 'A comprehensive audio journey from the Angkor Empire to post-independence Cambodia.', 'duration' => 9450],
            ['title' => 'The Psychology of Money — Audiobook',                     'authors' => [['name' => 'Morgan Housel',         'role' => 'author']], 'publisher' => 'Harriman House', 'publication_year' => 2020, 'language' => 'en', 'abstract' => 'Timeless lessons on wealth, greed, and happiness from one of the most acclaimed finance writers.', 'duration' => 27600],
            ['title' => 'Public Speaking Masterclass — Khmer',                     'authors' => [['name' => 'Dara Prak',             'role' => 'author']], 'publisher' => 'CamEdu Audio',   'publication_year' => 2023, 'language' => 'km', 'abstract' => 'Practical techniques for confident public speaking in professional and academic settings.', 'duration' => 5400],
            ['title' => 'Digital Marketing for ASEAN SMEs',                        'authors' => [['name' => 'Sophea Kim',            'role' => 'author']], 'publisher' => 'Corasoft Audio', 'publication_year' => 2023, 'language' => 'en', 'abstract' => 'Step-by-step audio guide on social media, SEO, and paid advertising strategies for Southeast Asian markets.', 'duration' => 14400],
            ['title' => 'Mindfulness and Meditation — Guided Sessions',            'authors' => [['name' => 'Thich Nhat Hanh',       'role' => 'author']], 'publisher' => 'Parallax Press', 'publication_year' => 2019, 'language' => 'en', 'abstract' => 'Guided mindfulness meditations and dharma talks for daily practice.', 'duration' => 3600],
        ];

        foreach ($items as $item) {
            $id = $this->insertBiblio([
                'material_type_id' => $typeId,
                'title'            => $item['title'],
                'authors'          => json_encode($item['authors']),
                'publisher'        => $item['publisher'],
                'publication_year' => $item['publication_year'],
                'language'         => $item['language'],
                'abstract'         => $item['abstract'],
            ]);
            $this->insertDigital($id, 'audio', $item['duration'], rand(20, 1500));
        }

        $this->command->info('  ✓ Audio (6)');
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Video (4 records)
    // ─────────────────────────────────────────────────────────────────────────

    private function seedVideo(): void
    {
        $typeId = $this->typeId('video');
        if (! $typeId) return;

        $items = [
            ['title' => 'Angkor Wat: A Civilisation Uncovered',             'authors' => [['name' => 'BBC Documentary Team',   'role' => 'author']], 'publisher' => 'BBC Studios',      'publication_year' => 2020, 'language' => 'en', 'abstract' => 'Documentary exploring the history, archaeology, and cultural significance of the Angkor temples.', 'duration' => 5400],
            ['title' => 'Introduction to Blockchain Technology',             'authors' => [['name' => 'MIT OpenCourseWare',     'role' => 'author']], 'publisher' => 'MIT OCW',          'publication_year' => 2022, 'language' => 'en', 'abstract' => 'Recorded lectures from MIT 6.S974: cryptocurrency and blockchain fundamentals.', 'duration' => 10800],
            ['title' => 'Khmer Classical Dance — A Living Heritage',        'authors' => [['name' => 'Ministry of Culture KH', 'role' => 'author']], 'publisher' => 'MOFA Cambodia',    'publication_year' => 2021, 'language' => 'km', 'abstract' => 'Documentary preserving the traditions of Khmer classical dance — a UNESCO intangible heritage.', 'duration' => 3600],
            ['title' => 'Climate Change and the Mekong River',              'authors' => [['name' => 'MRC Research Unit',      'role' => 'author']], 'publisher' => 'Mekong River Commission', 'publication_year' => 2022, 'language' => 'en', 'abstract' => 'Scientific documentary on how climate change is affecting water levels, biodiversity, and communities along the Mekong.', 'duration' => 4800],
        ];

        foreach ($items as $item) {
            $id = $this->insertBiblio([
                'material_type_id' => $typeId,
                'title'            => $item['title'],
                'authors'          => json_encode($item['authors']),
                'publisher'        => $item['publisher'],
                'publication_year' => $item['publication_year'],
                'language'         => $item['language'],
                'abstract'         => $item['abstract'],
            ]);
            $this->insertDigital($id, 'video', $item['duration'], rand(50, 3000));
        }

        $this->command->info('  ✓ Video (4)');
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Theses (4 records)
    // ─────────────────────────────────────────────────────────────────────────

    private function seedTheses(): void
    {
        $typeId = $this->typeId('thesis');
        if (! $typeId) return;

        $items = [
            ['title' => 'The Impact of Microfinance on Rural Poverty Reduction in Cambodia',                   'authors' => [['name' => 'Ratana Chan',   'role' => 'author']], 'publisher' => 'Royal University of Phnom Penh', 'publication_year' => 2022, 'language' => 'en', 'pages' => '198', 'abstract' => 'Empirical study examining how MFI lending affects household income and poverty indicators across three provinces.', 'ddc_class' => '332.7'],
            ['title' => 'AI-Assisted Language Learning for Khmer Secondary Students',                         'authors' => [['name' => 'Bunna Heng',    'role' => 'author']], 'publisher' => 'Institute of Technology of Cambodia', 'publication_year' => 2023, 'language' => 'en', 'pages' => '142', 'abstract' => 'Mixed-methods research on the effectiveness of AI chatbots in improving English proficiency among Khmer-speaking students.', 'ddc_class' => '418.0078'],
            ['title' => 'Urban Heat Islands and Green Infrastructure Planning in Phnom Penh',                 'authors' => [['name' => 'Pisey Mao',     'role' => 'author']], 'publisher' => 'Paññāsāstra University',         'publication_year' => 2023, 'language' => 'en', 'pages' => '176', 'abstract' => 'GIS-based analysis of urban heat distribution and proposed green-corridor interventions in Phnom Penh.', 'ddc_class' => '307.76'],
            ['title' => 'Digital Transformation Readiness of Cambodian SMEs Post-COVID-19',                   'authors' => [['name' => 'Makara Tep',    'role' => 'author']], 'publisher' => 'National University of Management', 'publication_year' => 2022, 'language' => 'en', 'pages' => '210', 'abstract' => 'Survey-based assessment of technology adoption barriers and digital readiness among 300 SMEs in Cambodia.', 'ddc_class' => '338.642'],
        ];

        $collectionId = DB::table('collections')->where('code', 'THES')->value('id');

        foreach ($items as $item) {
            $id = $this->insertBiblio([
                'material_type_id' => $typeId,
                'title'            => $item['title'],
                'authors'          => json_encode($item['authors']),
                'publisher'        => $item['publisher'],
                'publication_year' => $item['publication_year'],
                'language'         => $item['language'],
                'pages'            => $item['pages'],
                'abstract'         => $item['abstract'],
                'ddc_class'        => $item['ddc_class'],
            ]);
            $this->insertDigital($id, 'pdf', 0, rand(10, 500));

            if ($collectionId) {
                DB::table('physical_items')->insert([
                    'id'               => Str::uuid()->toString(),
                    'biblio_id'        => $id,
                    'barcode'          => 'TH-' . strtoupper(Str::random(6)),
                    'accession_number' => 'THES-' . $item['publication_year'] . '-' . rand(1000, 9999),
                    'call_number'      => $item['ddc_class'] . ' ' . strtoupper(substr($item['authors'][0]['name'], 0, 3)),
                    'collection_id'    => $collectionId,
                    'item_status'      => 'available',
                    'condition'        => 'excellent',
                    'acquired_date'    => now()->subMonths(rand(3, 18))->toDateString(),
                    'created_at'       => now(),
                    'updated_at'       => now(),
                ]);
            }
        }

        $this->command->info('  ✓ Theses (4)');
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Physical books — Catalog (12 records)
    // ─────────────────────────────────────────────────────────────────────────

    private function seedPhysicalBooks(): void
    {
        $typeId       = $this->typeId('book');
        $collectionId = DB::table('collections')->where('code', 'GEN')->value('id');
        if (! $typeId) return;

        $books = [
            ['title' => 'Design Patterns: Elements of Reusable Object-Oriented Software', 'authors' => [['name' => 'Erich Gamma',        'role' => 'author']], 'isbn' => '9780201633610', 'publisher' => 'Addison-Wesley',  'year' => 1994, 'ddc' => '005.117', 'pages' => '395', 'price' => 55.00],
            ['title' => 'Introduction to Algorithms',                                     'authors' => [['name' => 'Thomas H. Cormen',    'role' => 'author']], 'isbn' => '9780262046305', 'publisher' => 'MIT Press',        'year' => 2022, 'ddc' => '005.1',   'pages' => '1312','price' => 90.00],
            ['title' => 'The Art of War',                                                 'authors' => [['name' => 'Sun Tzu',             'role' => 'author']], 'isbn' => '9781599869773', 'publisher' => 'Filiquarian',      'year' => 2007, 'ddc' => '355.02',  'pages' => '68',  'price' => 12.00],
            ['title' => 'Khmer Grammar for Foreigners',                                  'authors' => [['name' => 'Judith Jacob',        'role' => 'author']], 'isbn' => '9780197135976', 'publisher' => 'Oxford University Press', 'year' => 1968, 'ddc' => '495.932', 'pages' => '219', 'price' => 40.00],
            ['title' => 'The Great Gatsby',                                               'authors' => [['name' => 'F. Scott Fitzgerald', 'role' => 'author']], 'isbn' => '9780743273565', 'publisher' => 'Scribner',         'year' => 2004, 'ddc' => '813.52',  'pages' => '180', 'price' => 15.00],
            ['title' => 'Principles of Economics',                                        'authors' => [['name' => 'N. Gregory Mankiw',  'role' => 'author']], 'isbn' => '9781305585126', 'publisher' => 'Cengage Learning', 'year' => 2020, 'ddc' => '330',     'pages' => '860', 'price' => 75.00],
            ['title' => 'A History of Cambodia',                                          'authors' => [['name' => 'David P. Chandler',  'role' => 'author']], 'isbn' => '9780813343631', 'publisher' => 'Westview Press',   'year' => 2008, 'ddc' => '959.6',   'pages' => '320', 'price' => 35.00],
            ['title' => 'Molecular Biology of the Cell',                                  'authors' => [['name' => 'Bruce Alberts',       'role' => 'author']], 'isbn' => '9780393884821', 'publisher' => 'W. W. Norton',     'year' => 2022, 'ddc' => '571.6',   'pages' => '1342','price' => 120.00],
            ['title' => 'The Innovator\'s Dilemma',                                       'authors' => [['name' => 'Clayton Christensen','role' => 'author']], 'isbn' => '9781633691780', 'publisher' => 'Harvard Business Review Press', 'year' => 2016, 'ddc' => '658.4', 'pages' => '288', 'price' => 28.00],
            ['title' => 'Environmental Science: Earth as a Living Planet',                'authors' => [['name' => 'Daniel B. Botkin',   'role' => 'author']], 'isbn' => '9781119700005', 'publisher' => 'Wiley',            'year' => 2021, 'ddc' => '363.7',   'pages' => '672', 'price' => 85.00],
            ['title' => 'Fundamentals of Database Systems',                               'authors' => [['name' => 'Ramez Elmasri',       'role' => 'author']], 'isbn' => '9780133970777', 'publisher' => 'Pearson',          'year' => 2016, 'ddc' => '005.74',  'pages' => '1254','price' => 95.00],
            ['title' => 'Understanding Cambodia\'s Economy',                              'authors' => [['name' => 'Toshiyasu Kato',      'role' => 'author']], 'isbn' => '9789996395000', 'publisher' => 'Cambodia Development Resource Institute', 'year' => 2020, 'ddc' => '330.9596', 'pages' => '246', 'price' => 25.00],
        ];

        foreach ($books as $i => $book) {
            $id = $this->insertBiblio([
                'material_type_id' => $typeId,
                'title'            => $book['title'],
                'authors'          => json_encode($book['authors']),
                'isbn'             => $book['isbn'],
                'publisher'        => $book['publisher'],
                'publication_year' => $book['year'],
                'language'         => 'en',
                'ddc_class'        => $book['ddc'],
                'pages'            => $book['pages'],
            ]);

            if ($collectionId) {
                $initials = strtoupper(substr(explode(' ', $book['authors'][0]['name'])[0], 0, 3));
                DB::table('physical_items')->insert([
                    'id'               => Str::uuid()->toString(),
                    'biblio_id'        => $id,
                    'barcode'          => 'BK-' . str_pad($i + 1, 4, '0', STR_PAD_LEFT),
                    'accession_number' => 'ACC-' . $book['year'] . '-' . str_pad($i + 1, 3, '0', STR_PAD_LEFT),
                    'call_number'      => $book['ddc'] . ' ' . $initials,
                    'collection_id'    => $collectionId,
                    'item_status'      => 'available',
                    'condition'        => 'good',
                    'price'            => $book['price'],
                    'acquired_date'    => now()->subMonths(rand(1, 24))->toDateString(),
                    'created_at'       => now(),
                    'updated_at'       => now(),
                ]);
            }
        }

        $this->command->info('  ✓ Physical books / Catalog (12)');
    }
}
