<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('ai_suggestions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('record_id');
            $table->foreign('record_id')->references('id')->on('bibliographic_records')->onDelete('cascade');

            $table->string('field_name', 50); // 'ddc_class', 'lcc_class', 'abstract', 'subjects', 'keywords'
            $table->text('suggested_value');
            $table->decimal('confidence', 3, 2)->nullable(); // 0.00-1.00
            $table->string('source', 20)->default('gemini'); // 'gemini', 'manual', 'imported'
            $table->string('status', 20)->default('pending'); // 'pending', 'accepted', 'rejected', 'modified'

            $table->uuid('reviewed_by')->nullable();
            $table->foreign('reviewed_by')->references('id')->on('users')->onDelete('set null');
            $table->timestampTz('reviewed_at')->nullable();

            $table->json('metadata')->nullable(); // Gemini prompt, tokens used, model version

            $table->timestampsTz();

            $table->index(['record_id', 'field_name']);
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ai_suggestions');
    }
};
