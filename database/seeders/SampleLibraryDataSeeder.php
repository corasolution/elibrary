<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class SampleLibraryDataSeeder extends Seeder
{
    private array $authors = [
        'H. Park', 'S. Chea', 'L. Tran', 'M. Ito', 'D. Sok', 'P. Dara',
        'R. Nuon', 'A. Kim', 'E. Vann', 'B. Long', 'T. Meas', 'J. Ok',
        'K. Samnang', 'V. Pheap', 'N. Sophea', 'C. Vibol', 'S. Rattana',
    ];

    private array $publishers = [
        'Royal University Press', 'National Library Press', 'Academic Publishing House',
        'Southeast Asia Books', 'Knowledge Publishers', 'Digital Press Cambodia',
        'University Publishers', 'Research Institute Press', 'Educational Books Ltd',
    ];

    private array $subjects = [
        ['term' => 'Computer Science', 'scheme' => 'LCSH'],
        ['term' => 'History', 'scheme' => 'LCSH'],
        ['term' => 'Economics', 'scheme' => 'LCSH'],
        ['term' => 'Technology', 'scheme' => 'LCSH'],
        ['term' => 'Literature', 'scheme' => 'LCSH'],
        ['term' => 'Science', 'scheme' => 'LCSH'],
        ['term' => 'Health', 'scheme' => 'LCSH'],
        ['term' => 'Education', 'scheme' => 'LCSH'],
        ['term' => 'Agriculture', 'scheme' => 'LCSH'],
        ['term' => 'Environment', 'scheme' => 'LCSH'],
        ['term' => 'Politics', 'scheme' => 'LCSH'],
        ['term' => 'Culture', 'scheme' => 'LCSH'],
    ];

    private array $ebookTitles = [
        'Foundations of Data Science',
        'The Mekong Chronicle',
        'Modern Macroeconomics',
        'Quiet Algorithms',
        'River Stories',
        'Urban Futures',
        'Essentials of Public Health',
        'Design in Practice',
        'Climate & Society',
        'Khmer Grammar Revisited',
        'Agricultural Policy',
        'Machine Learning Basics',
    ];

    private array $bookTitles = [
        'Introduction to Programming',
        'Cambodian History',
        'Business Management',
        'Environmental Science',
        'Mathematical Analysis',
        'World Literature',
        'Chemical Engineering',
        'Educational Psychology',
        'Rural Development',
        'Information Systems',
    ];

    private array $journalTitles = [
        'Asian Economic Review',
        'Journal of Public Health',
        'Heritage Quarterly',
        'Education Today',
        'Rural Development Bulletin',
        'Environmental Letters',
        'Urban Studies Journal',
        'Digital Policy Report',
        'Food Security Review',
        'Tech & Society',
        'Cultural Studies Today',
        'Ministry Bulletin',
    ];

    private array $audioTitles = [
        'Intro to Machine Learning — Lecture 1',
        'Oral History: The Rice Fields of Battambang',
        'The Economics Podcast',
        'Khmer Poetry Readings',
        'Public Health in Practice',
        'History Hour: Angkor Revisited',
    ];

    private array $videoTitles = [
        'The Making of the Royal Palace',
        'Data Visualization: A Primer',
        'Climate Change in the Tonle Sap',
        'Teaching Modern History',
    ];

    private array $thesisTitles = [
        'Adaptive Water Management in the Lower Mekong Basin',
        'Bilingual Cognition in Primary Education',
        'Microfinance and Rural Household Resilience',
        'Vernacular Architecture of the Tonle Sap',
    ];

    public function run(): void
    {
        DB::beginTransaction();

        try {
            $this->command->info('Seeding material types...');
            $materialTypes = $this->seedMaterialTypes();

            $this->command->info('Seeding collections...');
            $collections = $this->seedCollections();

            $this->command->info('Seeding locations...');
            $locations = $this->seedLocations();

            $this->command->info('Seeding patron categories...');
            $this->seedPatronCategories();

            $this->command->info('Seeding eBooks...');
            $this->seedEBooks($materialTypes['ebook'], 12);

            $this->command->info('Seeding physical books...');
            $this->seedPhysicalBooks($materialTypes['book'], $collections[0]['id'], $locations[0]['id'], 10);

            $this->command->info('Seeding ePublications...');
            $this->seedEPublications($materialTypes['epub'], 12);

            $this->command->info('Seeding audio...');
            $this->seedAudio($materialTypes['audio'], 6);

            $this->command->info('Seeding video...');
            $this->seedVideo($materialTypes['video'], 4);

            $this->command->info('Seeding theses...');
            $this->seedTheses($materialTypes['thesis'], 4);

            DB::commit();
            $this->command->info('Sample data seeded successfully!');
        } catch (\Exception $e) {
            DB::rollBack();
            $this->command->error('Error seeding data: ' . $e->getMessage());
            throw $e;
        }
    }

    private function seedMaterialTypes(): array
    {
        $types = [
            [
                'code' => 'book',
                'name' => 'Book',
                'name_km' => 'សៀវភៅ',
                'icon' => 'book-open',
                'has_physical' => true,
                'has_digital' => false,
            ],
            [
                'code' => 'ebook',
                'name' => 'eBook',
                'name_km' => 'សៀវភៅអេឡិចត្រូនិក',
                'icon' => 'file-text',
                'has_physical' => false,
                'has_digital' => true,
            ],
            [
                'code' => 'epub',
                'name' => 'ePublication',
                'name_km' => 'ការបោះពុម្ពផ្សាយអេឡិចត្រូនិក',
                'icon' => 'newspaper',
                'has_physical' => false,
                'has_digital' => true,
            ],
            [
                'code' => 'audio',
                'name' => 'Audio',
                'name_km' => 'សំឡេង',
                'icon' => 'headphones',
                'has_physical' => false,
                'has_digital' => true,
            ],
            [
                'code' => 'video',
                'name' => 'Video',
                'name_km' => 'វីដេអូ',
                'icon' => 'film',
                'has_physical' => false,
                'has_digital' => true,
            ],
            [
                'code' => 'thesis',
                'name' => 'Thesis/Dissertation',
                'name_km' => 'និក្ខេបបទ',
                'icon' => 'graduation-cap',
                'has_physical' => true,
                'has_digital' => true,
            ],
        ];

        $result = [];
        foreach ($types as $type) {
            // Check if material type already exists
            $existing = DB::table('material_types')->where('code', $type['code'])->first();
            if ($existing) {
                $result[$type['code']] = $existing->id;
            } else {
                $id = DB::table('material_types')->insertGetId($type);
                $result[$type['code']] = $id;
            }
        }

        return $result;
    }

    private function seedCollections(): array
    {
        $collections = [
            [
                'name' => 'General Collection',
                'name_km' => 'បណ្ណាល័យទូទៅ',
                'code' => 'GEN',
                'description' => 'General lending collection',
                'is_loanable' => true,
                'loan_period_days' => 14,
                'renewals_allowed' => 2,
            ],
            [
                'name' => 'Reference',
                'name_km' => 'សៀវភៅយោង',
                'code' => 'REF',
                'description' => 'Reference materials - library use only',
                'is_loanable' => false,
                'loan_period_days' => 0,
                'renewals_allowed' => 0,
            ],
        ];

        $result = [];
        foreach ($collections as $collection) {
            $existing = DB::table('collections')->where('code', $collection['code'])->first();
            if ($existing) {
                $result[] = ['id' => $existing->id] + (array)$existing;
            } else {
                $id = DB::table('collections')->insertGetId($collection);
                $result[] = ['id' => $id] + $collection;
            }
        }

        return $result;
    }

    private function seedLocations(): array
    {
        $locations = [
            [
                'parent_id' => null,
                'name' => 'Main Library',
                'name_km' => 'បណ្ណាល័យកណ្តាល',
                'code' => 'MAIN',
                'address' => 'Phnom Penh, Cambodia',
                'is_branch' => true,
            ],
        ];

        $result = [];
        foreach ($locations as $location) {
            $existing = DB::table('locations')->where('code', $location['code'])->first();
            if ($existing) {
                $result[] = ['id' => $existing->id] + (array)$existing;
            } else {
                $id = DB::table('locations')->insertGetId($location);
                $result[] = ['id' => $id] + $location;
            }
        }

        return $result;
    }

    private function seedPatronCategories(): void
    {
        $categories = [
            [
                'name' => 'Student',
                'name_km' => 'និស្សិត',
                'loan_limit' => 5,
                'loan_period_days' => 14,
                'renewals_allowed' => 2,
                'reservation_limit' => 3,
                'fine_rate_per_day' => 0.10,
            ],
            [
                'name' => 'Staff',
                'name_km' => 'បុគ្គលិក',
                'loan_limit' => 10,
                'loan_period_days' => 30,
                'renewals_allowed' => 3,
                'reservation_limit' => 5,
                'fine_rate_per_day' => 0.05,
            ],
        ];

        foreach ($categories as $category) {
            $existing = DB::table('patron_categories')->where('name', $category['name'])->first();
            if (!$existing) {
                DB::table('patron_categories')->insert($category);
            }
        }
    }

    private function seedEBooks(int $materialTypeId, int $count): void
    {
        for ($i = 0; $i < $count; $i++) {
            $title = $this->ebookTitles[$i % count($this->ebookTitles)];
            $author = $this->authors[array_rand($this->authors)];
            $year = rand(2020, 2026);

            $biblioId = $this->createBibliographicRecord(
                $title,
                [$author],
                $materialTypeId,
                $year,
                'ebook'
            );

            // Create digital resource
            $this->createDigitalResource($biblioId, 'pdf', 'ebook');
        }
    }

    private function seedPhysicalBooks(int $materialTypeId, int $collectionId, int $locationId, int $count): void
    {
        for ($i = 0; $i < $count; $i++) {
            $title = $this->bookTitles[$i % count($this->bookTitles)] . ' - Vol. ' . ($i + 1);
            $author = $this->authors[array_rand($this->authors)];
            $year = rand(2015, 2025);

            $biblioId = $this->createBibliographicRecord(
                $title,
                [$author],
                $materialTypeId,
                $year,
                'book'
            );

            // Create physical items (1-3 copies per title)
            $copies = rand(1, 3);
            for ($c = 0; $c < $copies; $c++) {
                $this->createPhysicalItem($biblioId, $collectionId, $locationId, $c + 1);
            }
        }
    }

    private function seedEPublications(int $materialTypeId, int $count): void
    {
        for ($i = 0; $i < $count; $i++) {
            $title = $this->journalTitles[$i % count($this->journalTitles)];
            $author = 'Vol. ' . rand(1, 50) . ', Iss. ' . rand(1, 4);
            $year = rand(2020, 2026);

            $biblioId = $this->createBibliographicRecord(
                $title,
                [$author],
                $materialTypeId,
                $year,
                'journal'
            );

            $this->createDigitalResource($biblioId, 'pdf', 'journal');
        }
    }

    private function seedAudio(int $materialTypeId, int $count): void
    {
        for ($i = 0; $i < $count; $i++) {
            $title = $this->audioTitles[$i % count($this->audioTitles)];
            $author = $this->authors[array_rand($this->authors)];
            $year = rand(2020, 2026);

            $biblioId = $this->createBibliographicRecord(
                $title,
                [$author],
                $materialTypeId,
                $year,
                'audio'
            );

            $this->createDigitalResource($biblioId, 'mp3', 'audio', rand(1800, 7200)); // 30-120 minutes
        }
    }

    private function seedVideo(int $materialTypeId, int $count): void
    {
        for ($i = 0; $i < $count; $i++) {
            $title = $this->videoTitles[$i % count($this->videoTitles)];
            $author = $this->authors[array_rand($this->authors)];
            $year = rand(2020, 2026);

            $biblioId = $this->createBibliographicRecord(
                $title,
                [$author],
                $materialTypeId,
                $year,
                'video'
            );

            $this->createDigitalResource($biblioId, 'mp4', 'video', rand(900, 5400)); // 15-90 minutes
        }
    }

    private function seedTheses(int $materialTypeId, int $count): void
    {
        for ($i = 0; $i < $count; $i++) {
            $title = $this->thesisTitles[$i % count($this->thesisTitles)];
            $author = $this->authors[array_rand($this->authors)];
            $year = rand(2020, 2026);

            $biblioId = $this->createBibliographicRecord(
                $title,
                [$author],
                $materialTypeId,
                $year,
                'thesis'
            );

            $this->createDigitalResource($biblioId, 'pdf', 'thesis');
        }
    }

    private function createBibliographicRecord(
        string $title,
        array $authors,
        int $materialTypeId,
        int $year,
        string $type
    ): string {
        $authorsJson = array_map(fn($author) => [
            'name' => $author,
            'role' => 'author',
        ], $authors);

        $subject = $this->subjects[array_rand($this->subjects)];

        $id = (string) Str::uuid();

        // Generate cover image based on material type
        $coverImage = $this->generateCoverImage($type);

        DB::table('bibliographic_records')->insert([
            'id' => $id,
            'title' => $title,
            'authors' => json_encode($authorsJson),
            'publisher' => $this->publishers[array_rand($this->publishers)],
            'publication_year' => $year,
            'language' => 'en',
            'material_type_id' => $materialTypeId,
            'subjects' => json_encode([$subject]),
            'abstract' => "This is a comprehensive study on {$title}. " .
                "The work explores various aspects of the topic with detailed analysis and research.",
            'isbn' => $type === 'book' || $type === 'ebook' ? $this->generateISBN() : null,
            'issn' => $type === 'journal' ? $this->generateISSN() : null,
            'ddc_class' => rand(0, 9) . str_pad(rand(0, 99), 2, '0', STR_PAD_LEFT) . '.' . rand(0, 999),
            'pages' => $type === 'thesis' ? rand(100, 400) : rand(50, 500),
            'cover_image_url' => $coverImage,
            'record_status' => 'active',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return $id;
    }

    private function createPhysicalItem(string $biblioId, int $collectionId, int $locationId, int $copyNumber): void
    {
        DB::table('physical_items')->insert([
            'id' => (string) Str::uuid(),
            'biblio_id' => $biblioId,
            'barcode' => 'B' . str_pad(rand(100000, 999999), 10, '0', STR_PAD_LEFT),
            'accession_number' => 'ACC' . date('Y') . str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT),
            'call_number' => rand(0, 9) . str_pad(rand(0, 99), 2, '0', STR_PAD_LEFT) . '.' . rand(0, 999) . ' C' . $copyNumber,
            'collection_id' => $collectionId,
            'location_id' => $locationId,
            'item_status' => 'available',
            'condition' => 'good',
            'price' => rand(5, 50),
            'currency' => 'USD',
            'acquired_date' => now()->subDays(rand(30, 365)),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    private function createDigitalResource(string $biblioId, string $format, string $type, ?int $duration = null): void
    {
        $fileSize = match ($format) {
            'pdf' => rand(1000000, 50000000), // 1-50 MB
            'mp3' => rand(5000000, 100000000), // 5-100 MB
            'mp4' => rand(100000000, 2000000000), // 100 MB - 2 GB
            default => rand(1000000, 10000000),
        };

        // Generate thumbnail URL based on type
        $thumbnailPath = $this->generateThumbnail($type, $format);

        DB::table('digital_resources')->insert([
            'id' => (string) Str::uuid(),
            'biblio_id' => $biblioId,
            'file_path' => 'sample/' . $type . '/' . Str::random(32) . '.' . $format,
            'original_filename' => Str::slug($type) . '_' . time() . '.' . $format,
            'file_size_bytes' => $fileSize,
            'mime_type' => match ($format) {
                'pdf' => 'application/pdf',
                'mp3' => 'audio/mpeg',
                'mp4' => 'video/mp4',
                default => 'application/octet-stream',
            },
            'format' => $format,
            'thumbnail_path' => $thumbnailPath,
            'access_type' => 'restricted',
            'duration_seconds' => $duration,
            'download_count' => rand(0, 1000),
            'view_count' => rand(0, 5000),
            'version' => '1.0',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    private function generateISBN(): string
    {
        return '978-' . rand(0, 9) . '-' . str_pad(rand(0, 99999), 5, '0', STR_PAD_LEFT) .
            '-' . str_pad(rand(0, 999), 3, '0', STR_PAD_LEFT) . '-' . rand(0, 9);
    }

    private function generateISSN(): string
    {
        return str_pad(rand(0, 9999), 4, '0', STR_PAD_LEFT) . '-' .
            str_pad(rand(0, 9999), 4, '0', STR_PAD_LEFT);
    }

    private function generateCoverImage(string $type): string
    {
        // Use picsum.photos for realistic-looking cover images
        // Different random seeds for variety
        $seed = rand(100, 999);

        // 3:4 aspect ratio (300x400) for book covers
        return "https://picsum.photos/seed/{$type}{$seed}/300/400";
    }

    private function generateThumbnail(string $type, string $format): string
    {
        // Use placeholder images from picsum.photos
        // Different seeds for variety
        $seed = rand(1, 1000);

        // Color-coded by type for visual distinction
        $bgColor = match ($type) {
            'ebook' => '3B82F6',      // Blue
            'epub' => '8B5CF6',       // Purple
            'audio' => 'F59E0B',      // Amber
            'video' => 'EF4444',      // Red
            'thesis' => '10B981',     // Green
            default => '6B7280',      // Gray
        };

        // Use a gradient placeholder service
        return "https://via.placeholder.com/400x600/{$bgColor}/FFFFFF?text=" . strtoupper($type);
    }
}
