<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Models\Tenant\BibliographicRecord;
use App\Models\Tenant\DigitalResource;
use App\Models\Tenant\MaterialType;

class DigitalResourceSeeder extends Seeder
{
    private string $baseUrl;

    public function run(): void
    {
        $this->baseUrl = '/storage/samples';

        // Also update cover images on all existing records
        $this->updateCoverImages();

        // Add digital resources (PDF, ePub, audio, video)
        $this->seedPdfResources();
        $this->seedEpubResources();
        $this->seedAudioResources();
        $this->seedVideoResources();

        // Update material_type_id to reflect digital types for some records
        $this->updateMaterialTypes();
    }

    private function updateCoverImages(): void
    {
        $covers = [
            'Clean Code'           => $this->baseUrl . '/cover_book.jpg',
            'The Pragmatic'        => $this->baseUrl . '/cover_book.jpg',
            'Design Patterns'      => $this->baseUrl . '/cover_book.jpg',
            'Introduction to Algo' => $this->baseUrl . '/cover_book.jpg',
            'Laravel'              => $this->baseUrl . '/cover_ebook.jpg',
            'JavaScript'           => $this->baseUrl . '/cover_ebook.jpg',
            'The Art of War'       => $this->baseUrl . '/cover_art.jpg',
            'Thinking'             => $this->baseUrl . '/cover_book.jpg',
            'Sapiens'              => $this->baseUrl . '/cover_book.jpg',
            'Atomic Habits'        => $this->baseUrl . '/cover_book.jpg',
            'The Great Gatsby'     => $this->baseUrl . '/cover_art.jpg',
            'Digital Transfor'     => $this->baseUrl . '/cover_thesis.jpg',
        ];

        foreach ($covers as $titleStart => $url) {
            BibliographicRecord::where('title', 'like', "{$titleStart}%")
                ->update(['cover_image_url' => $url]);
        }
    }

    private function seedPdfResources(): void
    {
        $pdfBiblios = BibliographicRecord::whereIn('title', [
            'Clean Code: A Handbook of Agile Software Craftsmanship',
            'The Art of War',
            'Thinking, Fast and Slow',
            'Sapiens: A Brief History of Humankind',
        ])->get();

        foreach ($pdfBiblios as $biblio) {
            if (DigitalResource::where('biblio_id', $biblio->id)->where('format', 'pdf')->exists()) {
                continue;
            }

            DigitalResource::create([
                'id'                => (string) Str::uuid(),
                'biblio_id'         => $biblio->id,
                'file_path'         => 'samples/sample.pdf',
                'original_filename' => Str::slug($biblio->title) . '.pdf',
                'file_size_bytes'   => filesize(storage_path('app/public/samples/sample.pdf')),
                'mime_type'         => 'application/pdf',
                'format'            => 'pdf',
                'thumbnail_path'    => 'samples/cover_book.jpg',
                'access_type'       => 'open_access',
                'version'           => '1.0',
                'view_count'        => rand(12, 180),
                'download_count'    => rand(3, 45),
            ]);
        }
    }

    private function seedEpubResources(): void
    {
        $epubBiblios = BibliographicRecord::whereIn('title', [
            'Laravel: Up & Running',
            'JavaScript: The Good Parts',
            'The Great Gatsby',
            'Atomic Habits',
        ])->get();

        foreach ($epubBiblios as $i => $biblio) {
            if (DigitalResource::where('biblio_id', $biblio->id)->where('format', 'epub')->exists()) {
                continue;
            }

            $covers = ['cover_ebook.jpg', 'cover_ebook.jpg', 'cover_art.jpg', 'cover_book.jpg'];

            DigitalResource::create([
                'id'                => (string) Str::uuid(),
                'biblio_id'         => $biblio->id,
                'file_path'         => 'samples/sample.epub',
                'original_filename' => Str::slug($biblio->title) . '.epub',
                'file_size_bytes'   => filesize(storage_path('app/public/samples/sample.epub')),
                'mime_type'         => 'application/epub+zip',
                'format'            => 'epub',
                'thumbnail_path'    => 'samples/' . ($covers[$i] ?? 'cover_ebook.jpg'),
                'access_type'       => in_array($i, [0, 1]) ? 'registered' : 'open_access',
                'version'           => '1.0',
                'view_count'        => rand(20, 250),
                'download_count'    => rand(5, 80),
            ]);
        }
    }

    private function seedAudioResources(): void
    {
        // Add a new audio bibliographic record
        $audioMaterialType = MaterialType::where('code', 'audio')->first();
        if (! $audioMaterialType) {
            return;
        }

        $audioBiblios = [
            [
                'title'            => 'Atomic Habits — Audiobook',
                'subtitle'         => 'An Easy & Proven Way to Build Good Habits & Break Bad Ones',
                'authors'          => [['name' => 'James Clear', 'role' => 'author']],
                'publisher'        => 'Penguin Audio',
                'publication_year' => 2018,
                'language'         => 'en',
                'abstract'         => 'The complete audiobook of Atomic Habits, narrated by the author James Clear.',
                'material_type_id' => $audioMaterialType->id,
                'cover_image_url'  => $this->baseUrl . '/cover_audio.jpg',
                'record_status'    => 'active',
                'format'           => 'mp3',
                'access_type'      => 'registered',
            ],
            [
                'title'            => 'Sapiens: A Brief History of Humankind — Audiobook',
                'authors'          => [['name' => 'Yuval Noah Harari', 'role' => 'author']],
                'publisher'        => 'Random House Audio',
                'publication_year' => 2015,
                'language'         => 'en',
                'abstract'         => 'The complete audiobook narration of Sapiens, covering humankind from the Stone Age to the present.',
                'material_type_id' => $audioMaterialType->id,
                'cover_image_url'  => $this->baseUrl . '/cover_audio.jpg',
                'record_status'    => 'active',
                'format'           => 'mp3',
                'access_type'      => 'open_access',
            ],
        ];

        foreach ($audioBiblios as $data) {
            $format = $data['format'];
            $accessType = $data['access_type'];
            unset($data['format'], $data['access_type']);

            $biblio = BibliographicRecord::firstOrCreate(
                ['title' => $data['title']],
                array_merge($data, [
                    'cataloged_at' => now(),
                    'subjects' => [['term' => 'Self-improvement', 'scheme' => 'LCSH']],
                    'keywords' => ['audiobook', 'audio'],
                ])
            );

            if (! DigitalResource::where('biblio_id', $biblio->id)->exists()) {
                DigitalResource::create([
                    'id'                => (string) Str::uuid(),
                    'biblio_id'         => $biblio->id,
                    'file_path'         => 'samples/sample.mp3',
                    'original_filename' => Str::slug($biblio->title) . '.mp3',
                    'file_size_bytes'   => filesize(storage_path('app/public/samples/sample.mp3')),
                    'mime_type'         => 'audio/mpeg',
                    'format'            => $format,
                    'thumbnail_path'    => 'samples/cover_audio.jpg',
                    'access_type'       => $accessType,
                    'duration_seconds'  => 3600 + rand(0, 7200),
                    'version'           => '1.0',
                    'view_count'        => rand(30, 300),
                    'download_count'    => rand(10, 100),
                ]);
            }
        }
    }

    private function seedVideoResources(): void
    {
        $videoMaterialType = MaterialType::where('code', 'video')->first();
        if (! $videoMaterialType) {
            return;
        }

        $videoBiblios = [
            [
                'title'            => 'Digital Transformation in Education — Lecture Series',
                'authors'          => [['name' => 'Sophea Chann', 'role' => 'author']],
                'publisher'        => 'Corasoft Press',
                'publisher_place'  => 'Phnom Penh',
                'publication_year' => 2023,
                'language'         => 'en',
                'abstract'         => 'A video lecture series covering digital transformation strategies for educational institutions in Southeast Asia.',
                'material_type_id' => $videoMaterialType->id,
                'cover_image_url'  => $this->baseUrl . '/cover_video.jpg',
                'record_status'    => 'active',
                'format'           => 'mp4',
                'access_type'      => 'restricted',
            ],
            [
                'title'            => 'Introduction to Library Science — Video Course',
                'authors'          => [['name' => 'Dr. Ratana Chan', 'role' => 'author']],
                'publisher'        => 'Cambodia National University',
                'publisher_place'  => 'Phnom Penh',
                'publication_year' => 2024,
                'language'         => 'km',
                'abstract'         => 'វគ្គសិក្សាពីវិទ្យាសាស្ត្របណ្ណាល័យ សម្រាប់និស្សិតឆ្នាំទី១។',
                'material_type_id' => $videoMaterialType->id,
                'cover_image_url'  => $this->baseUrl . '/cover_video.jpg',
                'record_status'    => 'active',
                'format'           => 'mp4',
                'access_type'      => 'registered',
            ],
        ];

        foreach ($videoBiblios as $data) {
            $format = $data['format'];
            $accessType = $data['access_type'];
            unset($data['format'], $data['access_type']);

            $biblio = BibliographicRecord::firstOrCreate(
                ['title' => $data['title']],
                array_merge($data, [
                    'cataloged_at' => now(),
                    'subjects'     => [['term' => 'Education', 'scheme' => 'LCSH']],
                    'keywords'     => ['video', 'lecture', 'education'],
                ])
            );

            if (! DigitalResource::where('biblio_id', $biblio->id)->exists()) {
                DigitalResource::create([
                    'id'                => (string) Str::uuid(),
                    'biblio_id'         => $biblio->id,
                    'file_path'         => 'samples/sample.mp4',
                    'original_filename' => Str::slug($biblio->title) . '.mp4',
                    'file_size_bytes'   => filesize(storage_path('app/public/samples/sample.mp4')),
                    'mime_type'         => 'video/mp4',
                    'format'            => $format,
                    'thumbnail_path'    => 'samples/cover_video.jpg',
                    'access_type'       => $accessType,
                    'duration_seconds'  => 1800 + rand(0, 3600),
                    'version'           => '1.0',
                    'view_count'        => rand(40, 500),
                    'download_count'    => rand(5, 60),
                ]);
            }
        }
    }

    private function updateMaterialTypes(): void
    {
        // eBook type for digital-only records
        $ebookType = MaterialType::where('code', 'ebook')->first();
        $bookEbookType = MaterialType::where('code', 'book_ebook')->first();

        if ($ebookType) {
            // Records with epub/pdf resources + no physical items → ebook
            BibliographicRecord::whereHas('digitalResources')
                ->whereDoesntHave('physicalItems')
                ->whereNotIn('title', ['Atomic Habits — Audiobook', 'Sapiens: A Brief History of Humankind — Audiobook',
                    'Digital Transformation in Education — Lecture Series', 'Introduction to Library Science — Video Course'])
                ->update(['material_type_id' => $ebookType->id]);
        }

        if ($bookEbookType) {
            // Records with BOTH physical + digital → book+ebook
            BibliographicRecord::whereHas('digitalResources')
                ->whereHas('physicalItems')
                ->update(['material_type_id' => $bookEbookType->id]);
        }
    }
}
