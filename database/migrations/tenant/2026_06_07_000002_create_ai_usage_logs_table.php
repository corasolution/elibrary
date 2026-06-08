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
        Schema::create('ai_usage_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();

            $table->string('feature', 50); // 'ddc_classification', 'lcc_classification', 'abstract_generation', 'subject_extraction', 'khmer_translation'
            $table->integer('input_tokens')->default(0);
            $table->integer('output_tokens')->default(0);
            $table->decimal('cost_usd', 10, 6)->default(0); // Estimated cost in USD
            $table->integer('response_time_ms')->default(0);
            $table->boolean('cache_hit')->default(false);
            $table->string('status', 20); // 'success', 'error', 'timeout'
            $table->text('error_message')->nullable();

            $table->uuid('user_id')->nullable();
            $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');

            $table->uuid('record_id')->nullable();
            $table->foreign('record_id')->references('id')->on('bibliographic_records')->onDelete('set null');

            $table->timestampTz('created_at');

            $table->index('created_at');
            $table->index('feature');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ai_usage_logs');
    }
};
