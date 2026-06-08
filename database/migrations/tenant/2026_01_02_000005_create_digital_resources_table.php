<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('digital_resources', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('biblio_id')->constrained('bibliographic_records')->cascadeOnDelete();

            // File info
            $table->string('file_path', 500)->nullable();
            $table->string('original_filename', 255)->nullable();
            $table->bigInteger('file_size_bytes')->nullable();
            $table->string('mime_type', 100)->nullable();
            $table->string('format', 20)->nullable(); // pdf, epub, mp3, mp4, docx

            // External URL
            $table->string('url', 1000)->nullable();
            $table->boolean('is_external')->default(false);

            // Thumbnail
            $table->string('thumbnail_path', 500)->nullable();

            // Access control
            // open_access, registered, restricted, embargo
            $table->string('access_type', 20)->default('restricted')->index();
            $table->date('embargo_until')->nullable();

            // Digital identifiers
            $table->string('handle', 200)->nullable(); // DSpace handle

            // OCR / Full text
            $table->text('ocr_text')->nullable();
            $table->timestamp('ocr_processed_at')->nullable();

            // Streaming info (audio/video)
            $table->integer('duration_seconds')->nullable();
            $table->string('bitrate', 20)->nullable();

            // Stats
            $table->unsignedInteger('download_count')->default(0);
            $table->unsignedInteger('view_count')->default(0);

            // Version
            $table->string('version', 20)->default('1.0');

            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('digital_resources');
    }
};
