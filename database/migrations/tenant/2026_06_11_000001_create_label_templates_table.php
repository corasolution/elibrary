<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('label_templates', function (Blueprint $table) {
            $table->uuid('id')->primary();

            $table->string('name', 150);

            // Sheet geometry (Avery-style)
            $table->string('page_size', 10)->default('A4');     // A4 | Letter
            $table->decimal('margin_top_mm', 6, 2)->default(10);
            $table->decimal('margin_left_mm', 6, 2)->default(8);
            $table->unsignedSmallInteger('columns')->default(3);
            $table->unsignedSmallInteger('rows')->default(8);
            $table->decimal('label_width_mm', 6, 2)->default(63.50);
            $table->decimal('label_height_mm', 6, 2)->default(33.90);
            $table->decimal('gap_x_mm', 6, 2)->default(2.50);
            $table->decimal('gap_y_mm', 6, 2)->default(0);

            // Label design (mm coords relative to ONE label)
            $table->string('background_color', 20)->default('#ffffff');
            $table->jsonb('elements')->default('[]');

            $table->boolean('is_default')->default(false);

            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('label_templates');
    }
};
