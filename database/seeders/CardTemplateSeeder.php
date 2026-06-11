<?php

namespace Database\Seeders;

use App\Models\Tenant\CardTemplate;
use Illuminate\Database\Seeder;

class CardTemplateSeeder extends Seeder
{
    /**
     * Seed a single default patron-card template. Idempotent: only creates
     * the default when no templates exist yet.
     */
    public function run(): void
    {
        if (CardTemplate::query()->exists()) {
            return;
        }

        CardTemplate::create([
            'name'             => 'Default Library Card',
            'width_mm'         => 85.60,
            'height_mm'        => 54.00,
            'background_color' => '#ffffff',
            'elements'         => CardTemplate::DEFAULT_ELEMENTS,
            'is_default'       => true,
        ]);
    }
}
