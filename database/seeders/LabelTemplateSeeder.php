<?php

namespace Database\Seeders;

use App\Models\Tenant\LabelTemplate;
use Illuminate\Database\Seeder;

class LabelTemplateSeeder extends Seeder
{
    /** Seed a default Avery A4 label template. Idempotent. */
    public function run(): void
    {
        if (LabelTemplate::query()->exists()) {
            return;
        }

        $preset = LabelTemplate::PRESETS['l7159'];

        LabelTemplate::create(array_merge($preset, [
            'name'             => 'Default — ' . $preset['name'],
            'background_color' => '#ffffff',
            'elements'         => LabelTemplate::DEFAULT_ELEMENTS,
            'is_default'       => true,
        ]));
    }
}
