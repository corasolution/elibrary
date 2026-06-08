<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Carbon\Carbon;

class DemoSeeder extends Seeder
{
    public function run(): void
    {
        // Ensure the (per-tenant) storage path exists before writing helper
        // cache files — tenant storage dirs are not pre-created.
        if (! is_dir(storage_path())) {
            mkdir(storage_path(), 0775, true);
        }

        $this->seedLocations();
        $this->seedCollections();
        $this->seedBibliographicRecords();
        $this->seedPatrons();
        $this->seedLoans();
        $this->seedReservations();
    }

    private function seedLocations(): void
    {
        $rows = [
            ['id' => 1, 'parent_id' => null, 'name' => 'Main Library',        'name_km' => 'បណ្ណាល័យកណ្តាល', 'code' => 'MAIN', 'is_branch' => true,  'is_active' => true],
            ['id' => 2, 'parent_id' => 1,    'name' => 'Ground Floor',        'name_km' => 'ជាន់ទី១',           'code' => 'GF',   'is_branch' => false, 'is_active' => true],
            ['id' => 3, 'parent_id' => 1,    'name' => 'First Floor',         'name_km' => 'ជាន់ទី២',           'code' => 'FF',   'is_branch' => false, 'is_active' => true],
            ['id' => 4, 'parent_id' => 1,    'name' => 'Reference Room',      'name_km' => 'បន្ទប់យោងក',        'code' => 'REF',  'is_branch' => false, 'is_active' => true],
            ['id' => 5, 'parent_id' => null, 'name' => 'Branch — Toul Kork',  'name_km' => 'សាខា — ទួលគោក',    'code' => 'TK',   'is_branch' => true,  'is_active' => true],
        ];
        foreach ($rows as $row) {
            DB::table('locations')->insert(array_merge($row, ['created_at' => now(), 'updated_at' => now()]));
        }
    }

    private function seedCollections(): void
    {
        DB::table('collections')->insert([
            ['id' => 1, 'name' => 'General Collection',   'code' => 'GEN',  'is_loanable' => true,  'loan_period_days' => 14, 'renewals_allowed' => 2, 'fine_rate_per_day' => 0.10, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 2, 'name' => 'Reference Collection', 'code' => 'REF',  'is_loanable' => false, 'loan_period_days' => 0,  'renewals_allowed' => 0, 'fine_rate_per_day' => 0.00, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 3, 'name' => 'Khmer Collection',     'code' => 'KHM',  'is_loanable' => true,  'loan_period_days' => 14, 'renewals_allowed' => 2, 'fine_rate_per_day' => 0.10, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 4, 'name' => 'Periodicals',          'code' => 'PER',  'is_loanable' => false, 'loan_period_days' => 0,  'renewals_allowed' => 0, 'fine_rate_per_day' => 0.00, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 5, 'name' => 'Thesis & Dissertation','code' => 'THES', 'is_loanable' => true,  'loan_period_days' => 7,  'renewals_allowed' => 1, 'fine_rate_per_day' => 0.20, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 6, 'name' => 'Reserve Collection',   'code' => 'RES',  'is_loanable' => true,  'loan_period_days' => 3,  'renewals_allowed' => 0, 'fine_rate_per_day' => 0.50, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    private function seedBibliographicRecords(): void
    {
        $materialTypeId = DB::table('material_types')->where('code', 'book')->value('id') ?? 1;

        $books = [
            [
                'title'            => 'Clean Code: A Handbook of Agile Software Craftsmanship',
                'subtitle'         => null,
                'authors'          => json_encode([['name' => 'Robert C. Martin', 'role' => 'author']]),
                'isbn'             => '9780132350884',
                'publisher'        => 'Prentice Hall',
                'publisher_place'  => 'Upper Saddle River, NJ',
                'publication_year' => 2008,
                'edition'          => '1st',
                'language'         => 'en',
                'subjects'         => json_encode([['term' => 'Computer programming', 'scheme' => 'LCSH'], ['term' => 'Software engineering', 'scheme' => 'LCSH']]),
                'keywords'         => 'clean code, refactoring, software craftsmanship',
                'ddc_class'        => '005.133',
                'abstract'         => 'Even bad code can function. But if code isn\'t clean, it can bring a development organization to its knees. This book is a must for any developer, software engineer, project manager, team lead, or systems analyst.',
                'pages'            => '431',
                'barcode'          => 'BK0001', 'accession' => 'ACC-2024-001', 'call_number' => '005.133 MAR', 'price' => 45.00, 'collection_id' => 1, 'location_id' => 2,
            ],
            [
                'title'            => 'The Pragmatic Programmer: Your Journey to Mastery',
                'subtitle'         => null,
                'authors'          => json_encode([['name' => 'David Thomas', 'role' => 'author'], ['name' => 'Andrew Hunt', 'role' => 'author']]),
                'isbn'             => '9780135957059',
                'publisher'        => 'Addison-Wesley',
                'publisher_place'  => 'Boston, MA',
                'publication_year' => 2019,
                'edition'          => '2nd',
                'language'         => 'en',
                'subjects'         => json_encode([['term' => 'Software engineering', 'scheme' => 'LCSH']]),
                'keywords'         => 'pragmatic, programming, best practices',
                'ddc_class'        => '005.1',
                'abstract'         => 'The classic guide for software developers, fully updated for modern development practices.',
                'pages'            => '352',
                'barcode'          => 'BK0002', 'accession' => 'ACC-2024-002', 'call_number' => '005.1 THO', 'price' => 50.00, 'collection_id' => 1, 'location_id' => 2,
            ],
            [
                'title'            => 'Design Patterns: Elements of Reusable Object-Oriented Software',
                'subtitle'         => null,
                'authors'          => json_encode([['name' => 'Erich Gamma', 'role' => 'author'], ['name' => 'Richard Helm', 'role' => 'author'], ['name' => 'Ralph Johnson', 'role' => 'author'], ['name' => 'John Vlissides', 'role' => 'author']]),
                'isbn'             => '9780201633610',
                'publisher'        => 'Addison-Wesley',
                'publisher_place'  => 'Reading, MA',
                'publication_year' => 1994,
                'edition'          => '1st',
                'language'         => 'en',
                'subjects'         => json_encode([['term' => 'Object-oriented programming', 'scheme' => 'LCSH'], ['term' => 'Software patterns', 'scheme' => 'LCSH']]),
                'keywords'         => 'design patterns, OOP, gang of four',
                'ddc_class'        => '005.117',
                'abstract'         => 'Capturing a wealth of experience about the design of object-oriented software. This book is a catalog of design patterns that serve as templates for solutions to common problems.',
                'pages'            => '395',
                'barcode'          => 'BK0003', 'accession' => 'ACC-2024-003', 'call_number' => '005.117 GAM', 'price' => 55.00, 'collection_id' => 1, 'location_id' => 2,
            ],
            [
                'title'            => 'Introduction to Algorithms',
                'subtitle'         => null,
                'authors'          => json_encode([['name' => 'Thomas H. Cormen', 'role' => 'author'], ['name' => 'Charles E. Leiserson', 'role' => 'author']]),
                'isbn'             => '9780262046305',
                'publisher'        => 'MIT Press',
                'publisher_place'  => 'Cambridge, MA',
                'publication_year' => 2022,
                'edition'          => '4th',
                'language'         => 'en',
                'subjects'         => json_encode([['term' => 'Computer algorithms', 'scheme' => 'LCSH'], ['term' => 'Data structures', 'scheme' => 'LCSH']]),
                'keywords'         => 'algorithms, data structures, computer science',
                'ddc_class'        => '005.1',
                'abstract'         => 'A comprehensive introduction to algorithms covering a broad range of algorithms in depth, yet making their design and analysis accessible to all levels.',
                'pages'            => '1312',
                'barcode'          => 'BK0004', 'accession' => 'ACC-2024-004', 'call_number' => '005.1 COR', 'price' => 90.00, 'collection_id' => 1, 'location_id' => 3,
            ],
            [
                'title'            => 'Laravel: Up & Running',
                'subtitle'         => 'A Framework for Building Modern PHP Apps',
                'authors'          => json_encode([['name' => 'Matt Stauffer', 'role' => 'author']]),
                'isbn'             => '9781098153267',
                'publisher'        => "O'Reilly Media",
                'publisher_place'  => 'Sebastopol, CA',
                'publication_year' => 2023,
                'edition'          => '3rd',
                'language'         => 'en',
                'subjects'         => json_encode([['term' => 'PHP (Computer program language)', 'scheme' => 'LCSH'], ['term' => 'Web application development', 'scheme' => 'LCSH']]),
                'keywords'         => 'laravel, php, web development',
                'ddc_class'        => '005.276',
                'abstract'         => 'The best guide to Laravel, the PHP framework that makes building modern web apps fast and enjoyable.',
                'pages'            => '560',
                'barcode'          => 'BK0005', 'accession' => 'ACC-2024-005', 'call_number' => '005.276 STA', 'price' => 60.00, 'collection_id' => 1, 'location_id' => 2,
            ],
            [
                'title'            => 'JavaScript: The Good Parts',
                'subtitle'         => null,
                'authors'          => json_encode([['name' => 'Douglas Crockford', 'role' => 'author']]),
                'isbn'             => '9780596517748',
                'publisher'        => "O'Reilly Media",
                'publisher_place'  => 'Sebastopol, CA',
                'publication_year' => 2008,
                'edition'          => '1st',
                'language'         => 'en',
                'subjects'         => json_encode([['term' => 'JavaScript (Computer program language)', 'scheme' => 'LCSH']]),
                'keywords'         => 'javascript, web development, programming',
                'ddc_class'        => '005.276',
                'abstract'         => 'Most programming languages contain good and bad parts, but JavaScript has more than its share of the bad. This book identifies the good parts of JavaScript.',
                'pages'            => '153',
                'barcode'          => 'BK0006', 'accession' => 'ACC-2024-006', 'call_number' => '005.276 CRO', 'price' => 35.00, 'collection_id' => 1, 'location_id' => 2,
            ],
            [
                'title'            => 'The Art of War',
                'subtitle'         => null,
                'authors'          => json_encode([['name' => 'Sun Tzu', 'role' => 'author'], ['name' => 'Lionel Giles', 'role' => 'translator']]),
                'isbn'             => '9781599869773',
                'publisher'        => 'Filiquarian Publishing',
                'publisher_place'  => 'Minneapolis, MN',
                'publication_year' => 2007,
                'edition'          => null,
                'language'         => 'en',
                'subjects'         => json_encode([['term' => 'Military art and science', 'scheme' => 'LCSH'], ['term' => 'War', 'scheme' => 'LCSH']]),
                'keywords'         => 'strategy, military, philosophy',
                'ddc_class'        => '355.02',
                'abstract'         => 'The Art of War is an ancient Chinese military treatise attributed to Sun Tzu. This timeless text on strategy has influenced military thinking, business tactics and beyond.',
                'pages'            => '68',
                'barcode'          => 'BK0007', 'accession' => 'ACC-2024-007', 'call_number' => '355.02 SUN', 'price' => 12.00, 'collection_id' => 1, 'location_id' => 2,
            ],
            [
                'title'            => 'Thinking, Fast and Slow',
                'subtitle'         => null,
                'authors'          => json_encode([['name' => 'Daniel Kahneman', 'role' => 'author']]),
                'isbn'             => '9780374533557',
                'publisher'        => 'Farrar, Straus and Giroux',
                'publisher_place'  => 'New York, NY',
                'publication_year' => 2013,
                'edition'          => null,
                'language'         => 'en',
                'subjects'         => json_encode([['term' => 'Thought and thinking', 'scheme' => 'LCSH'], ['term' => 'Psychology', 'scheme' => 'LCSH']]),
                'keywords'         => 'psychology, behavioural economics, decision making',
                'ddc_class'        => '153.4',
                'abstract'         => 'Daniel Kahneman explains the two systems that drive the way we think. System 1 is fast, intuitive, and emotional; System 2 is slower, more deliberative, and more logical.',
                'pages'            => '499',
                'barcode'          => 'BK0008', 'accession' => 'ACC-2024-008', 'call_number' => '153.4 KAH', 'price' => 18.00, 'collection_id' => 1, 'location_id' => 3,
            ],
            [
                'title'            => 'Sapiens: A Brief History of Humankind',
                'subtitle'         => null,
                'authors'          => json_encode([['name' => 'Yuval Noah Harari', 'role' => 'author']]),
                'isbn'             => '9780062316097',
                'publisher'        => 'Harper',
                'publisher_place'  => 'New York, NY',
                'publication_year' => 2015,
                'edition'          => null,
                'language'         => 'en',
                'subjects'         => json_encode([['term' => 'Human evolution', 'scheme' => 'LCSH'], ['term' => 'History', 'scheme' => 'LCSH']]),
                'keywords'         => 'history, human evolution, anthropology',
                'ddc_class'        => '909',
                'abstract'         => 'A brief history of humankind — from the Stone Age through to the 21st century. Explores how biology and history have defined us and enhanced our understanding of what it means to be human.',
                'pages'            => '443',
                'barcode'          => 'BK0009', 'accession' => 'ACC-2024-009', 'call_number' => '909 HAR', 'price' => 20.00, 'collection_id' => 1, 'location_id' => 3,
            ],
            [
                'title'            => 'Atomic Habits',
                'subtitle'         => 'An Easy & Proven Way to Build Good Habits & Break Bad Ones',
                'authors'          => json_encode([['name' => 'James Clear', 'role' => 'author']]),
                'isbn'             => '9780735211292',
                'publisher'        => 'Avery',
                'publisher_place'  => 'New York, NY',
                'publication_year' => 2018,
                'edition'          => null,
                'language'         => 'en',
                'subjects'         => json_encode([['term' => 'Habit', 'scheme' => 'LCSH'], ['term' => 'Self-improvement', 'scheme' => 'LCSH']]),
                'keywords'         => 'habits, self-improvement, productivity',
                'ddc_class'        => '158.1',
                'abstract'         => 'James Clear, one of the world\'s leading experts on habit formation, reveals practical strategies that will teach you exactly how to form good habits, break bad ones.',
                'pages'            => '320',
                'barcode'          => 'BK0010', 'accession' => 'ACC-2024-010', 'call_number' => '158.1 CLE', 'price' => 22.00, 'collection_id' => 1, 'location_id' => 2,
            ],
            [
                'title'            => 'The Great Gatsby',
                'subtitle'         => null,
                'authors'          => json_encode([['name' => 'F. Scott Fitzgerald', 'role' => 'author']]),
                'isbn'             => '9780743273565',
                'publisher'        => 'Scribner',
                'publisher_place'  => 'New York, NY',
                'publication_year' => 2004,
                'edition'          => null,
                'language'         => 'en',
                'subjects'         => json_encode([['term' => 'Fiction', 'scheme' => 'LCSH'], ['term' => 'American literature', 'scheme' => 'LCSH']]),
                'keywords'         => 'american dream, jazz age, classic fiction',
                'ddc_class'        => '813.52',
                'abstract'         => 'Set in the Jazz Age on Long Island, the novel depicts narrator Nick Carraway\'s interactions with mysterious millionaire Jay Gatsby and Gatsby\'s obsession with Daisy Buchanan.',
                'pages'            => '180',
                'barcode'          => 'BK0011', 'accession' => 'ACC-2024-011', 'call_number' => '813.52 FIT', 'price' => 15.00, 'collection_id' => 1, 'location_id' => 3,
            ],
            [
                'title'            => 'Digital Transformation in Education',
                'subtitle'         => 'Strategies for ASEAN Institutions',
                'authors'          => json_encode([['name' => 'Sophea Chann', 'role' => 'author'], ['name' => 'Dara Prak', 'role' => 'editor']]),
                'isbn'             => '9789997100015',
                'publisher'        => 'Corasoft Press',
                'publisher_place'  => 'Phnom Penh',
                'publication_year' => 2023,
                'edition'          => '1st',
                'language'         => 'en',
                'subjects'         => json_encode([['term' => 'Education and technology', 'scheme' => 'LCSH'], ['term' => 'Educational change', 'scheme' => 'LCSH']]),
                'keywords'         => 'digital transformation, education, ASEAN, Cambodia',
                'ddc_class'        => '371.33',
                'abstract'         => 'A comprehensive guide to digital transformation strategies for educational institutions across Southeast Asia, with case studies from Cambodia, Vietnam, and Thailand.',
                'pages'            => '280',
                'barcode'          => 'BK0012', 'accession' => 'ACC-2024-012', 'call_number' => '371.33 CHA', 'price' => 30.00, 'collection_id' => 5, 'location_id' => 3,
            ],
        ];

        $biblioIds = [];
        foreach ($books as $book) {
            $biblioId = Str::uuid()->toString();
            $biblioIds[] = $biblioId;

            $barcode     = $book['barcode'];
            $accession   = $book['accession'];
            $callNumber  = $book['call_number'];
            $price       = $book['price'];
            $collectionId = $book['collection_id'];
            $locationId  = $book['location_id'];

            DB::table('bibliographic_records')->insert([
                'id'               => $biblioId,
                'title'            => $book['title'],
                'subtitle'         => $book['subtitle'],
                'authors'          => $book['authors'],
                'isbn'             => $book['isbn'],
                'publisher'        => $book['publisher'],
                'publisher_place'  => $book['publisher_place'],
                'publication_year' => $book['publication_year'],
                'edition'          => $book['edition'],
                'language'         => $book['language'],
                'subjects'         => $book['subjects'],
                'keywords'         => $book['keywords'],
                'ddc_class'        => $book['ddc_class'],
                'abstract'         => $book['abstract'],
                'pages'            => $book['pages'],
                'material_type_id' => $materialTypeId,
                'record_status'    => 'active',
                'cataloged_at'     => now(),
                'created_at'       => now(),
                'updated_at'       => now(),
            ]);

            // Primary copy
            DB::table('physical_items')->insert([
                'id'               => Str::uuid()->toString(),
                'biblio_id'        => $biblioId,
                'barcode'          => $barcode,
                'accession_number' => $accession,
                'call_number'      => $callNumber,
                'collection_id'    => $collectionId,
                'location_id'      => $locationId,
                'item_status'      => 'available',
                'condition'        => 'good',
                'price'            => $price,
                'acquired_date'    => '2024-01-15',
                'created_at'       => now(),
                'updated_at'       => now(),
            ]);

            // Second copy for most books
            if (in_array($barcode, ['BK0001', 'BK0004', 'BK0005', 'BK0009', 'BK0010'])) {
                DB::table('physical_items')->insert([
                    'id'               => Str::uuid()->toString(),
                    'biblio_id'        => $biblioId,
                    'barcode'          => $barcode . 'B',
                    'accession_number' => str_replace('ACC-2024-0', 'ACC-2024-B', $accession),
                    'call_number'      => $callNumber,
                    'collection_id'    => $collectionId,
                    'location_id'      => $locationId,
                    'item_status'      => 'available',
                    'condition'        => 'excellent',
                    'price'            => $price,
                    'acquired_date'    => '2024-06-01',
                    'created_at'       => now(),
                    'updated_at'       => now(),
                ]);
            }
        }

        // Store the biblioIds in a cache file for use in loans/reservations
        file_put_contents(storage_path('demo_biblio_ids.json'), json_encode($biblioIds));
    }

    private function seedPatrons(): void
    {
        $categoryStudent = DB::table('patron_categories')->where('name', 'like', '%Student%')->value('id') ?? 1;
        $categoryFaculty = DB::table('patron_categories')->where('name', 'like', '%Faculty%')->value('id') ?? 2;
        $categoryStaff   = DB::table('patron_categories')->where('name', 'like', '%Staff%')->value('id') ?? 3;
        $categoryPublic  = DB::table('patron_categories')->where('name', 'like', '%Public%')->value('id') ?? 4;

        $patrons = [
            ['id' => Str::uuid()->toString(), 'patron_number' => 'P-2024-001', 'email' => 'sophea.kim@university.edu.kh',  'first_name' => 'Sophea',   'last_name' => 'Kim',     'first_name_km' => 'សុភា',    'last_name_km' => 'គីម',     'gender' => 'female', 'phone' => '+855 12 345 678', 'city' => 'Phnom Penh', 'category_id' => $categoryStudent, 'expiry' => '2026-12-31'],
            ['id' => Str::uuid()->toString(), 'patron_number' => 'P-2024-002', 'email' => 'dara.prak@university.edu.kh',   'first_name' => 'Dara',     'last_name' => 'Prak',    'first_name_km' => 'ដារា',    'last_name_km' => 'ប្រាក់',   'gender' => 'male',   'phone' => '+855 17 234 567', 'city' => 'Phnom Penh', 'category_id' => $categoryFaculty,'expiry' => '2027-06-30'],
            ['id' => Str::uuid()->toString(), 'patron_number' => 'P-2024-003', 'email' => 'ratana.chan@university.edu.kh', 'first_name' => 'Ratana',   'last_name' => 'Chan',    'first_name_km' => 'រតនា',   'last_name_km' => 'ចាន់',    'gender' => 'female', 'phone' => '+855 96 123 456', 'city' => 'Siem Reap',  'category_id' => $categoryStudent, 'expiry' => '2025-12-31'],
            ['id' => Str::uuid()->toString(), 'patron_number' => 'P-2024-004', 'email' => 'virak.sok@library.org',        'first_name' => 'Virak',    'last_name' => 'Sok',     'first_name_km' => 'វីរៈ',    'last_name_km' => 'សុខ',     'gender' => 'male',   'phone' => '+855 78 901 234', 'city' => 'Phnom Penh', 'category_id' => $categoryStaff,  'expiry' => '2026-08-31'],
            ['id' => Str::uuid()->toString(), 'patron_number' => 'P-2024-005', 'email' => 'channary.lim@gmail.com',       'first_name' => 'Channary', 'last_name' => 'Lim',     'first_name_km' => 'ចន្ទនារ', 'last_name_km' => 'លីម',     'gender' => 'female', 'phone' => '+855 15 678 901', 'city' => 'Battambang',  'category_id' => $categoryPublic, 'expiry' => '2025-06-30'],
            ['id' => Str::uuid()->toString(), 'patron_number' => 'P-2024-006', 'email' => 'bunna.heng@student.edu.kh',   'first_name' => 'Bunna',    'last_name' => 'Heng',    'first_name_km' => 'បុណ្ណា',  'last_name_km' => 'ហេង',     'gender' => 'male',   'phone' => '+855 23 456 789', 'city' => 'Phnom Penh', 'category_id' => $categoryStudent, 'expiry' => '2026-12-31'],
            ['id' => Str::uuid()->toString(), 'patron_number' => 'P-2024-007', 'email' => 'sreymom.oun@university.edu',  'first_name' => 'Sreymom',  'last_name' => 'Oun',     'first_name_km' => 'ស្រីមុំ',  'last_name_km' => 'អ៊ូន',    'gender' => 'female', 'phone' => '+855 99 876 543', 'city' => 'Kampong Cham', 'category_id' => $categoryStudent,'expiry' => '2026-12-31'],
            ['id' => Str::uuid()->toString(), 'patron_number' => 'P-2024-008', 'email' => 'makara.tep@faculty.edu.kh',   'first_name' => 'Makara',   'last_name' => 'Tep',     'first_name_km' => 'មករា',   'last_name_km' => 'តែប',     'gender' => 'male',   'phone' => '+855 11 222 333', 'city' => 'Phnom Penh', 'category_id' => $categoryFaculty,'expiry' => '2027-12-31'],
            ['id' => Str::uuid()->toString(), 'patron_number' => 'P-2024-009', 'email' => 'pisey.mao@gmail.com',         'first_name' => 'Pisey',    'last_name' => 'Mao',     'first_name_km' => 'ពិសី',   'last_name_km' => 'មៅ',      'gender' => 'female', 'phone' => '+855 70 111 222', 'city' => 'Siem Reap',  'category_id' => $categoryPublic, 'expiry' => '2025-12-31'],
            ['id' => Str::uuid()->toString(), 'patron_number' => 'P-2024-010', 'email' => 'rith.noun@student.edu.kh',    'first_name' => 'Rith',     'last_name' => 'Noun',    'first_name_km' => 'រិទ្ធ',   'last_name_km' => 'នួន',     'gender' => 'male',   'phone' => '+855 85 333 444', 'city' => 'Phnom Penh', 'category_id' => $categoryStudent, 'expiry' => '2026-12-31'],
        ];

        foreach ($patrons as $p) {
            DB::table('patrons')->insert([
                'id'                  => $p['id'],
                'patron_number'       => $p['patron_number'],
                'email'               => $p['email'],
                'password'            => Hash::make('password'),
                'email_verified_at'   => now(),
                'first_name'          => $p['first_name'],
                'last_name'           => $p['last_name'],
                'first_name_km'       => $p['first_name_km'],
                'last_name_km'        => $p['last_name_km'],
                'gender'              => $p['gender'],
                'phone'               => $p['phone'],
                'city'                => $p['city'],
                'country'             => 'KHM',
                'patron_category_id'  => $p['category_id'],
                'status'              => 'active',
                'membership_expiry'   => $p['expiry'],
                'preferred_language'  => 'en',
                'total_checkouts'     => 0,
                'active_loans'        => 0,
                'created_at'          => now(),
                'updated_at'          => now(),
            ]);
        }

        // Store patron IDs for loans
        $patronIds = DB::table('patrons')->pluck('id')->toArray();
        file_put_contents(storage_path('demo_patron_ids.json'), json_encode($patronIds));
    }

    private function seedLoans(): void
    {
        $patronIds = json_decode(file_get_contents(storage_path('demo_patron_ids.json')), true);
        $items     = DB::table('physical_items')->get(['id', 'biblio_id', 'barcode', 'item_status']);

        if (empty($patronIds) || $items->isEmpty()) {
            return;
        }

        $loanData = [];
        $usedItems = [];

        // Active loans (not returned)
        $activeLoanPairs = [
            [0, 0],  // patron 1 → item 0 (Clean Code)
            [1, 2],  // patron 2 → item 2 (Design Patterns)
            [2, 4],  // patron 3 → item 4 (Laravel)
            [5, 7],  // patron 6 → item 7 (Thinking Fast)
            [6, 8],  // patron 7 → item 8 (Sapiens)
        ];

        foreach ($activeLoanPairs as [$pIdx, $iIdx]) {
            if (!isset($patronIds[$pIdx]) || !isset($items[$iIdx])) continue;
            $item = $items[$iIdx];
            if (in_array($item->id, $usedItems)) continue;
            $usedItems[] = $item->id;

            $checkedOutAt = Carbon::now()->subDays(rand(2, 10));
            $dueDate      = $checkedOutAt->copy()->addDays(14);

            $loanData[] = [
                'id'             => Str::uuid()->toString(),
                'patron_id'      => $patronIds[$pIdx],
                'item_id'        => $item->id,
                'checked_out_at' => $checkedOutAt,
                'due_date'       => $dueDate->toDateString(),
                'returned_at'    => null,
                'renewals_count' => 0,
                'fine_amount'    => 0,
                'fine_paid'      => false,
                'fine_waived'    => false,
                'created_at'     => $checkedOutAt,
                'updated_at'     => $checkedOutAt,
            ];

            DB::table('physical_items')->where('id', $item->id)->update(['item_status' => 'checked_out']);
            DB::table('patrons')->where('id', $patronIds[$pIdx])->increment('active_loans');
            DB::table('patrons')->where('id', $patronIds[$pIdx])->increment('total_checkouts');
        }

        // Overdue loans (still out)
        $overduePairs = [
            [3, 5],  // patron 4 → item 5 (JavaScript)
            [4, 9],  // patron 5 → item 9 (Atomic Habits)
        ];

        foreach ($overduePairs as [$pIdx, $iIdx]) {
            if (!isset($patronIds[$pIdx]) || !isset($items[$iIdx])) continue;
            $item = $items[$iIdx];
            if (in_array($item->id, $usedItems)) continue;
            $usedItems[] = $item->id;

            $checkedOutAt = Carbon::now()->subDays(rand(20, 30));
            $dueDate      = $checkedOutAt->copy()->addDays(14);
            $daysOverdue  = Carbon::now()->diffInDays($dueDate, false) * -1;
            $fine         = max(0, $daysOverdue * 0.10);

            $loanData[] = [
                'id'             => Str::uuid()->toString(),
                'patron_id'      => $patronIds[$pIdx],
                'item_id'        => $item->id,
                'checked_out_at' => $checkedOutAt,
                'due_date'       => $dueDate->toDateString(),
                'returned_at'    => null,
                'renewals_count' => 0,
                'fine_amount'    => round($fine, 2),
                'fine_paid'      => false,
                'fine_waived'    => false,
                'created_at'     => $checkedOutAt,
                'updated_at'     => now(),
            ];

            DB::table('physical_items')->where('id', $item->id)->update(['item_status' => 'checked_out']);
            DB::table('patrons')->where('id', $patronIds[$pIdx])->increment('active_loans');
            DB::table('patrons')->where('id', $patronIds[$pIdx])->increment('total_checkouts');
        }

        // Returned loans (history)
        $returnedPairs = [
            [0, 1],   // patron 1 returned item 1 (Pragmatic Programmer)
            [1, 3],   // patron 2 returned item 3 (Algorithms)
            [7, 6],   // patron 8 returned item 6 (Art of War)
            [8, 10],  // patron 9 returned item 10 (Great Gatsby)
            [9, 11],  // patron 10 returned item 11 (Digital Transformation)
            [2, 6],   // patron 3 returned Art of War
            [5, 10],  // patron 6 returned Great Gatsby
        ];

        foreach ($returnedPairs as [$pIdx, $iIdx]) {
            if (!isset($patronIds[$pIdx]) || !isset($items[$iIdx])) continue;
            $item = $items[$iIdx];
            if (in_array($item->id, $usedItems)) continue;
            $usedItems[] = $item->id;

            $checkedOutAt = Carbon::now()->subDays(rand(30, 90));
            $dueDate      = $checkedOutAt->copy()->addDays(14);
            $returnedAt   = $checkedOutAt->copy()->addDays(rand(5, 13));

            $loanData[] = [
                'id'             => Str::uuid()->toString(),
                'patron_id'      => $patronIds[$pIdx],
                'item_id'        => $item->id,
                'checked_out_at' => $checkedOutAt,
                'due_date'       => $dueDate->toDateString(),
                'returned_at'    => $returnedAt,
                'renewals_count' => 0,
                'fine_amount'    => 0,
                'fine_paid'      => false,
                'fine_waived'    => false,
                'created_at'     => $checkedOutAt,
                'updated_at'     => $returnedAt,
            ];

            DB::table('patrons')->where('id', $patronIds[$pIdx])->increment('total_checkouts');
        }

        DB::table('loans')->insert($loanData);

        // Clean up temp files
        @unlink(storage_path('demo_biblio_ids.json'));
        @unlink(storage_path('demo_patron_ids.json'));
    }

    private function seedReservations(): void
    {
        $patrons = DB::table('patrons')->pluck('id')->toArray();
        $checkedOutItems = DB::table('physical_items')
            ->where('item_status', 'checked_out')
            ->pluck('biblio_id')
            ->unique()
            ->values()
            ->toArray();

        if (empty($patrons) || empty($checkedOutItems)) return;

        $reservations = [];
        $usedPairs = [];

        foreach (array_slice($checkedOutItems, 0, 3) as $i => $biblioId) {
            $patronId = $patrons[($i + 5) % count($patrons)];
            $key = $patronId . '|' . $biblioId;
            if (in_array($key, $usedPairs)) continue;
            $usedPairs[] = $key;

            $reservations[] = [
                'id'          => Str::uuid()->toString(),
                'patron_id'   => $patronId,
                'biblio_id'   => $biblioId,
                'item_id'     => null,
                'status'      => 'pending',
                'reserved_at' => now()->subDays(rand(1, 5)),
                'expiry_date' => now()->addDays(7)->toDateString(),
                'created_at'  => now(),
                'updated_at'  => now(),
            ];
        }

        if (!empty($reservations)) {
            DB::table('reservations')->insert($reservations);
        }
    }
}
