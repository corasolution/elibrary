<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Only proceed if PostgreSQL
        if (DB::getDriverName() !== 'pgsql') {
            Log::info('Skipping vector search migration - PostgreSQL required (current: ' . DB::getDriverName() . ')');
            return;
        }

        // Try to enable pgvector extension (requires superuser privileges)
        try {
            DB::statement('CREATE EXTENSION IF NOT EXISTS vector');
            Log::info('pgvector extension enabled successfully');
        } catch (\Exception $e) {
            Log::warning('pgvector extension not available: ' . $e->getMessage());
            Log::info('Semantic search will be disabled. To enable, install pgvector: https://github.com/pgvector/pgvector');
            return;
        }

        // Check if extension was actually created
        $extensionExists = DB::select("SELECT * FROM pg_extension WHERE extname = 'vector'");
        if (empty($extensionExists)) {
            Log::warning('pgvector extension installation failed - semantic search disabled');
            return;
        }

        // Add embedding column to bibliographic_records
        if (!Schema::hasColumn('bibliographic_records', 'embedding')) {
            // Use raw SQL because Laravel doesn't natively support vector type
            DB::statement('ALTER TABLE bibliographic_records ADD COLUMN embedding vector(1536)');
            Log::info('Added embedding column to bibliographic_records');
        }

        // Create ivfflat index for fast vector similarity search
        // lists = 100 is a good default for medium-sized catalogs (adjust for very large catalogs)
        $indexExists = DB::select("
            SELECT indexname
            FROM pg_indexes
            WHERE tablename = 'bibliographic_records'
            AND indexname = 'bibliographic_records_embedding_idx'
        ");

        if (empty($indexExists)) {
            DB::statement('
                CREATE INDEX bibliographic_records_embedding_idx
                ON bibliographic_records
                USING ivfflat (embedding vector_cosine_ops)
                WITH (lists = 100)
            ');
            Log::info('Created ivfflat index on embedding column');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (DB::getDriverName() !== 'pgsql') {
            return;
        }

        // Drop index first
        DB::statement('DROP INDEX IF EXISTS bibliographic_records_embedding_idx');

        // Drop column if exists
        if (Schema::hasColumn('bibliographic_records', 'embedding')) {
            Schema::table('bibliographic_records', function (Blueprint $table) {
                $table->dropColumn('embedding');
            });
        }

        // Note: We don't drop the vector extension as other tables might use it
        // Manual cleanup: DROP EXTENSION IF EXISTS vector CASCADE;
    }
};
