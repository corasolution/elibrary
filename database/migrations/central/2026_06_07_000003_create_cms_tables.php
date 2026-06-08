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
        // Translation keys management
        Schema::connection('central')->create('cms_translations', function (Blueprint $table) {
            $table->id();
            $table->string('section', 50);              // 'landing', 'home', 'pricing', 'about', etc.
            $table->string('key', 100);                 // 'hero_title', 'cta_demo_button', etc.
            $table->text('en_value');                   // English content (primary)
            $table->text('km_value')->nullable();       // Khmer translation (auto or manual)
            $table->string('translation_status', 20)->default('pending'); // 'pending', 'auto', 'manual', 'approved'
            $table->string('translation_method', 20)->nullable();  // 'gemini', 'manual', null
            $table->text('description')->nullable();    // Context/help text for editors
            $table->boolean('is_published')->default(false);
            $table->timestamp('last_published_at')->nullable();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->timestamps();

            // Indexes
            $table->unique(['section', 'key']);
            $table->index('section');
            $table->index('is_published');
            $table->index('translation_status');
        });

        // Version history for content changes
        Schema::connection('central')->create('cms_translation_versions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('translation_id');
            $table->text('en_value_old')->nullable();
            $table->text('km_value_old')->nullable();
            $table->text('en_value_new')->nullable();
            $table->text('km_value_new')->nullable();
            $table->unsignedBigInteger('changed_by')->nullable();
            $table->text('change_note')->nullable();
            $table->timestamp('created_at')->useCurrent();

            // Foreign key
            $table->foreign('translation_id')
                  ->references('id')
                  ->on('cms_translations')
                  ->onDelete('cascade');
        });

        // Gemini API usage for translation (separate from cataloging)
        Schema::connection('central')->create('translation_api_logs', function (Blueprint $table) {
            $table->id();
            $table->uuid('tenant_id')->nullable();      // NULL for central, UUID for tenant
            $table->unsignedBigInteger('translation_id')->nullable();
            $table->integer('text_length')->nullable();
            $table->integer('input_tokens')->nullable();
            $table->integer('output_tokens')->nullable();
            $table->decimal('cost_usd', 10, 6)->nullable();
            $table->integer('response_time_ms')->nullable();
            $table->string('status', 20);               // 'success', 'error'
            $table->text('error_message')->nullable();
            $table->timestamp('created_at')->useCurrent();

            // Indexes
            $table->index('tenant_id');
            $table->index('created_at');

            // Foreign key (nullable because translation_id might not exist for tenant translations)
            $table->foreign('translation_id')
                  ->references('id')
                  ->on('cms_translations')
                  ->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('central')->dropIfExists('translation_api_logs');
        Schema::connection('central')->dropIfExists('cms_translation_versions');
        Schema::connection('central')->dropIfExists('cms_translations');
    }
};
