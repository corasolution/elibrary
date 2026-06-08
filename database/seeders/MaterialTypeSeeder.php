<?php

namespace Database\Seeders;

use App\Models\Tenant\MaterialType;
use Illuminate\Database\Seeder;

class MaterialTypeSeeder extends Seeder
{
    public function run(): void
    {
        $types = [
            ['code' => 'book',       'name' => 'Book',                 'name_km' => 'សៀវភៅ',        'icon' => 'book-open',    'has_physical' => true,  'has_digital' => false, 'sort_order' => 1],
            ['code' => 'ebook',      'name' => 'eBook',                'name_km' => 'សៀវភៅអេឡិចត្រូនិក', 'icon' => 'file-text', 'has_physical' => false, 'has_digital' => true,  'sort_order' => 2],
            ['code' => 'book_ebook', 'name' => 'Book + eBook',         'name_km' => 'សៀវភៅ + eBook',  'icon' => 'layers',      'has_physical' => true,  'has_digital' => true,  'sort_order' => 3],
            ['code' => 'journal',    'name' => 'Journal / Serial',     'name_km' => 'ទស្សនាវដ្ដី',   'icon' => 'newspaper',   'has_physical' => true,  'has_digital' => true,  'sort_order' => 4],
            ['code' => 'article',    'name' => 'Article',              'name_km' => 'អត្ថបទ',         'icon' => 'file-text',   'has_physical' => false, 'has_digital' => true,  'sort_order' => 5],
            ['code' => 'thesis',     'name' => 'Thesis / Dissertation','name_km' => 'និក្ខបទ',        'icon' => 'graduation-cap', 'has_physical' => true, 'has_digital' => true, 'sort_order' => 6],
            ['code' => 'audio',      'name' => 'Audio',                'name_km' => 'សំឡេង',          'icon' => 'headphones',  'has_physical' => false, 'has_digital' => true,  'sort_order' => 7],
            ['code' => 'video',      'name' => 'Video',                'name_km' => 'វីដេអូ',          'icon' => 'film',        'has_physical' => false, 'has_digital' => true,  'sort_order' => 8],
            ['code' => 'map',        'name' => 'Map',                  'name_km' => 'ផែនទី',           'icon' => 'map',         'has_physical' => true,  'has_digital' => true,  'sort_order' => 9],
            ['code' => 'dataset',    'name' => 'Dataset',              'name_km' => 'ទិន្នន័យ',        'icon' => 'database',    'has_physical' => false, 'has_digital' => true,  'sort_order' => 10],
            ['code' => 'dvd',        'name' => 'DVD / CD',             'name_km' => 'DVD / CD',        'icon' => 'disc',        'has_physical' => true,  'has_digital' => false, 'sort_order' => 11],
            ['code' => 'magazine',   'name' => 'Magazine',             'name_km' => 'ទស្សនាវដ្ដី',   'icon' => 'book',        'has_physical' => true,  'has_digital' => true,  'sort_order' => 12],
        ];

        foreach ($types as $type) {
            MaterialType::updateOrCreate(['code' => $type['code']], $type);
        }
    }
}
