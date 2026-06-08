<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('material_types', function (Blueprint $table) {
            $table->id();
            $table->string('code', 30)->unique();  // book, ebook, journal, thesis, audio, video, dataset, map
            $table->string('name', 100);
            $table->string('name_km', 200)->nullable();
            $table->string('icon', 50)->nullable();
            $table->boolean('has_physical')->default(false);
            $table->boolean('has_digital')->default(false);
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('material_types');
    }
};
