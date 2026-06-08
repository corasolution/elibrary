<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bibliographic_records', function (Blueprint $table) {
            $table->uuid('id')->primary();

            // === Basic Bibliographic (Dublin Core aligned) ===
            $table->string('title', 500);
            $table->string('title_alternative', 500)->nullable();
            $table->string('subtitle', 500)->nullable();
            $table->string('title_km', 1000)->nullable();

            // Creators (dc:creator, dc:contributor)
            // [{name, role, authority_id}] role: author|editor|translator|illustrator|compiler
            $table->json('authors')->default('[]');

            // Identifiers
            $table->string('isbn', 20)->nullable()->index();
            $table->string('issn', 10)->nullable();
            $table->string('doi', 200)->nullable();

            // Publication
            $table->string('publisher', 300)->nullable();
            $table->string('publisher_place', 200)->nullable();
            $table->integer('publication_year')->nullable()->index();
            $table->string('edition', 50)->nullable();
            $table->string('volume', 20)->nullable();
            $table->string('issue', 20)->nullable();
            $table->string('pages', 30)->nullable();
            $table->string('language', 10)->default('en')->index();

            // Subject / Classification (dc:subject)
            $table->json('subjects')->default('[]');  // [{term, scheme}] scheme: LCSH|MeSH|local
            $table->text('keywords')->nullable();       // stored as comma-separated, cast to array

            $table->string('ddc_class', 50)->nullable();  // Dewey Decimal e.g. 005.133
            $table->string('lcc_class', 50)->nullable();  // Library of Congress e.g. QA76.73

            // Description (dc:description)
            $table->text('abstract')->nullable();
            $table->text('abstract_km')->nullable();

            // Type & Format
            $table->foreignId('material_type_id')->nullable()->constrained('material_types')->nullOnDelete();

            // Rights
            $table->string('rights', 200)->nullable();

            // Series (dc:relation)
            $table->string('series_title', 300)->nullable();
            $table->string('series_number', 20)->nullable();

            // Coverage
            $table->string('geographic_coverage', 200)->nullable();

            // Source
            $table->string('source', 500)->nullable();

            // Extended
            $table->text('notes')->nullable();
            $table->text('table_of_contents')->nullable();
            $table->string('cover_image_url', 500)->nullable();

            // Full-text search vector (PostgreSQL only)
            if (DB::getDriverName() === 'pgsql') {
                $table->tsvector('search_vector')->nullable();
            }

            // Record management
            $table->string('record_status', 20)->default('active'); // active, withdrawn, deleted
            $table->uuid('cataloger_id')->nullable();
            $table->timestamp('cataloged_at')->useCurrent();

            $table->timestamps();
            $table->softDeletes();
        });

        if (DB::getDriverName() === 'pgsql') {
            DB::statement('CREATE INDEX idx_biblio_search ON bibliographic_records USING GIN(search_vector)');
            DB::statement("
                CREATE OR REPLACE FUNCTION update_biblio_search_vector()
                RETURNS TRIGGER AS \$\$
                BEGIN
                    NEW.search_vector :=
                        setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
                        setweight(to_tsvector('english', coalesce(NEW.title_alternative, '')), 'B') ||
                        setweight(to_tsvector('english', coalesce(NEW.publisher, '')), 'C') ||
                        setweight(to_tsvector('english', coalesce(NEW.abstract, '')), 'C');
                    RETURN NEW;
                END;
                \$\$ LANGUAGE plpgsql;
            ");
            DB::statement('
                CREATE TRIGGER trig_biblio_search_vector
                BEFORE INSERT OR UPDATE ON bibliographic_records
                FOR EACH ROW EXECUTE FUNCTION update_biblio_search_vector()
            ');
        }
    }

    public function down(): void
    {
        DB::statement('DROP TRIGGER IF EXISTS trig_biblio_search_vector ON bibliographic_records');
        DB::statement('DROP FUNCTION IF EXISTS update_biblio_search_vector()');
        Schema::dropIfExists('bibliographic_records');
    }
};

