<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // PostgreSQL only — SQLite does not support tsvector or triggers
        if (DB::getDriverName() !== 'pgsql') {
            return;
        }

        // Add search_vector column if not already present
        DB::statement("
            ALTER TABLE bibliographic_records
            ADD COLUMN IF NOT EXISTS search_vector tsvector
        ");

        // GIN index for fast FTS queries
        DB::statement("
            CREATE INDEX IF NOT EXISTS idx_biblio_search
            ON bibliographic_records USING GIN(search_vector)
        ");

        // Trigger function — weights: A=title, B=title_alt+authors+keywords, C=abstract
        DB::statement("
            CREATE OR REPLACE FUNCTION update_biblio_search_vector()
            RETURNS TRIGGER AS \$\$
            DECLARE
                author_names TEXT := '';
                kw_text TEXT := '';
            BEGIN
                -- Extract author names from JSONB array
                BEGIN
                    SELECT string_agg(elem->>'name', ' ')
                    INTO author_names
                    FROM jsonb_array_elements(
                        CASE jsonb_typeof(NEW.authors)
                            WHEN 'array' THEN NEW.authors
                            ELSE '[]'::jsonb
                        END
                    ) AS elem;
                EXCEPTION WHEN OTHERS THEN
                    author_names := '';
                END;

                -- Extract keywords from text array
                BEGIN
                    kw_text := array_to_string(
                        COALESCE(NEW.keywords, ARRAY[]::text[]),
                        ' '
                    );
                EXCEPTION WHEN OTHERS THEN
                    kw_text := '';
                END;

                NEW.search_vector :=
                    setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
                    setweight(to_tsvector('english', coalesce(NEW.title_alternative, '')), 'B') ||
                    setweight(to_tsvector('english', coalesce(NEW.subtitle, '')), 'B') ||
                    setweight(to_tsvector('english', coalesce(author_names, '')), 'B') ||
                    setweight(to_tsvector('english', coalesce(NEW.publisher, '')), 'C') ||
                    setweight(to_tsvector('english', coalesce(kw_text, '')), 'B') ||
                    setweight(to_tsvector('english', coalesce(NEW.abstract, '')), 'C') ||
                    setweight(to_tsvector('simple',  coalesce(NEW.isbn, '')), 'A') ||
                    setweight(to_tsvector('simple',  coalesce(NEW.issn, '')), 'A');

                RETURN NEW;
            END;
            \$\$ LANGUAGE plpgsql;
        ");

        // Attach trigger to bibliographic_records
        DB::statement("
            DROP TRIGGER IF EXISTS trig_biblio_search_vector ON bibliographic_records;
            CREATE TRIGGER trig_biblio_search_vector
                BEFORE INSERT OR UPDATE ON bibliographic_records
                FOR EACH ROW EXECUTE FUNCTION update_biblio_search_vector();
        ");

        // Backfill existing rows
        DB::statement("
            UPDATE bibliographic_records SET updated_at = updated_at WHERE deleted_at IS NULL
        ");
    }

    public function down(): void
    {
        if (DB::getDriverName() !== 'pgsql') {
            return;
        }
        DB::statement("DROP TRIGGER IF EXISTS trig_biblio_search_vector ON bibliographic_records");
        DB::statement("DROP FUNCTION IF EXISTS update_biblio_search_vector()");
        DB::statement("DROP INDEX IF EXISTS idx_biblio_search");
        DB::statement("ALTER TABLE bibliographic_records DROP COLUMN IF EXISTS search_vector");
    }
};
