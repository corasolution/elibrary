<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('card_templates', function (Blueprint $table) {
            $table->uuid('id')->primary();

            $table->string('name', 150);
            $table->decimal('width_mm', 6, 2)->default(85.60);   // CR80 standard ID card
            $table->decimal('height_mm', 6, 2)->default(54.00);
            $table->string('background_color', 20)->default('#ffffff');
            $table->string('background_image_path', 500)->nullable();

            // Array of positioned/styled elements (see CardTemplate::DEFAULT_ELEMENTS)
            $table->jsonb('elements')->default('[]');

            $table->boolean('is_default')->default(false);

            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('card_templates');
    }
};
