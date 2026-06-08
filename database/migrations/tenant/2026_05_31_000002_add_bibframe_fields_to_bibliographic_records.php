<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bibliographic_records', function (Blueprint $table) {
            if (! Schema::hasColumn('bibliographic_records', 'work_id')) {
                $table->uuid('work_id')->nullable()->index()->after('id');
                $table->foreign('work_id')->references('id')->on('works')->onDelete('set null');
            }
            if (! Schema::hasColumn('bibliographic_records', 'responsibility_statement')) {
                $table->string('responsibility_statement', 500)->nullable();
            }
            if (! Schema::hasColumn('bibliographic_records', 'content_type')) {
                $table->string('content_type', 50)->nullable();
            }
            if (! Schema::hasColumn('bibliographic_records', 'media_type')) {
                $table->string('media_type', 50)->nullable();
            }
            if (! Schema::hasColumn('bibliographic_records', 'carrier_type')) {
                $table->string('carrier_type', 50)->nullable();
            }
            if (! Schema::hasColumn('bibliographic_records', 'issuance')) {
                $table->string('issuance', 30)->nullable();
            }
            if (! Schema::hasColumn('bibliographic_records', 'dimensions')) {
                $table->string('dimensions', 100)->nullable();
            }
            if (! Schema::hasColumn('bibliographic_records', 'frequency')) {
                $table->string('frequency', 50)->nullable();
            }
            if (! Schema::hasColumn('bibliographic_records', 'color_content')) {
                $table->string('color_content', 50)->nullable();
            }
            if (! Schema::hasColumn('bibliographic_records', 'illustrative_content')) {
                $table->json('illustrative_content')->default('[]');
            }
            if (! Schema::hasColumn('bibliographic_records', 'publication_date_full')) {
                $table->string('publication_date_full', 50)->nullable();
            }
            if (! Schema::hasColumn('bibliographic_records', 'country_code')) {
                $table->string('country_code', 3)->nullable();
            }
            if (! Schema::hasColumn('bibliographic_records', 'genre_form')) {
                $table->json('genre_form')->default('[]');
            }
            if (! Schema::hasColumn('bibliographic_records', 'identifiers')) {
                $table->json('identifiers')->default('[]');
            }
            if (! Schema::hasColumn('bibliographic_records', 'marc_xml')) {
                $table->text('marc_xml')->nullable();
            }
            if (! Schema::hasColumn('bibliographic_records', 'marc_leader')) {
                $table->string('marc_leader', 30)->nullable();
            }
            if (! Schema::hasColumn('bibliographic_records', 'marc_008')) {
                $table->string('marc_008', 45)->nullable();
            }
            if (! Schema::hasColumn('bibliographic_records', 'bibframe_data')) {
                $table->jsonb('bibframe_data')->nullable();
            }
            if (! Schema::hasColumn('bibliographic_records', 'bibframe_instance_uri')) {
                $table->string('bibframe_instance_uri', 500)->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::table('bibliographic_records', function (Blueprint $table) {
            // SQLite doesn't support dropForeign — guard for it
            if (! app()->environment('testing') && config('database.default') !== 'sqlite') {
                $table->dropForeign(['work_id']);
            }
            $columns = [
                'work_id', 'responsibility_statement', 'content_type', 'media_type',
                'carrier_type', 'issuance', 'dimensions', 'frequency', 'color_content',
                'illustrative_content', 'publication_date_full', 'country_code',
                'genre_form', 'identifiers', 'marc_xml', 'marc_leader', 'marc_008',
                'bibframe_data', 'bibframe_instance_uri',
            ];
            $existing = array_filter($columns, fn ($c) => Schema::hasColumn('bibliographic_records', $c));
            if ($existing) {
                $table->dropColumn(array_values($existing));
            }
        });
    }
};
