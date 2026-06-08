<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('works', function (Blueprint $table) {
            $table->uuid('id')->primary();

            // Core Work identity (BIBFRAME bf:Work)
            $table->string('title', 500);
            $table->string('title_km', 1000)->nullable();
            $table->string('title_uniform', 500)->nullable();       // bf:uniformTitle / MARC 130

            // Work-level intellectual content
            $table->string('language', 10)->default('en')->index(); // bf:language (primary)
            $table->json('languages')->default('[]');                // bf:language (all)
            $table->string('content_type', 50)->nullable();          // bf:content / MARC 336
            $table->string('issuance', 30)->default('mono');         // bf:issuance (mono|serial|integrating|multipart)
            $table->string('origin_date', 20)->nullable();           // bf:originDate

            // Subjects & classification (Work-level in BIBFRAME)
            // [{term, scheme, authority_uri, type: topic|place|temporal|person}]
            $table->json('subjects')->default('[]');
            $table->text('keywords')->nullable();
            // bf:genreForm [{term, source: LCGFT|local, uri}]
            $table->json('genre_form')->default('[]');
            $table->string('ddc_class', 50)->nullable();             // bf:classification DDC / MARC 082
            $table->string('lcc_class', 50)->nullable();             // bf:classification LCC / MARC 050

            // Description
            $table->text('summary')->nullable();                     // bf:summary / MARC 520
            $table->text('summary_km')->nullable();
            $table->text('table_of_contents')->nullable();           // bf:tableOfContents / MARC 505
            $table->text('notes')->nullable();                       // bf:note / MARC 500

            // Series (bf:seriesStatement / MARC 490)
            $table->string('series_title', 300)->nullable();
            $table->string('series_number', 20)->nullable();

            // Linked data / authority identifiers
            $table->string('lccn', 30)->nullable()->index();         // bf:Lccn / MARC 010
            $table->string('oclc_number', 30)->nullable();           // bf:Oclcn / MARC 035
            $table->string('authority_uri', 500)->nullable();        // id.loc.gov/resources/works/...

            // Full BIBFRAME JSON-LD snapshot (generated, for export)
            $table->jsonb('bibframe_data')->nullable();

            // Record management
            $table->string('record_status', 20)->default('active');
            $table->uuid('cataloger_id')->nullable();
            $table->timestamp('cataloged_at')->useCurrent();

            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('works');
    }
};
