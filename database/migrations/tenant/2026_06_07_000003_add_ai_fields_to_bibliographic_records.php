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
        Schema::table('bibliographic_records', function (Blueprint $table) {
            // Track which fields were AI-assisted
            $table->boolean('ai_assisted_ddc')->default(false)->after('ddc_class');
            $table->boolean('ai_assisted_lcc')->default(false)->after('lcc_class');
            $table->boolean('ai_assisted_abstract')->default(false)->after('abstract_km');
            $table->boolean('ai_assisted_subjects')->default(false)->after('keywords');

            // Confidence scores (0.00-1.00)
            $table->decimal('ai_confidence_ddc', 3, 2)->nullable()->after('ai_assisted_ddc');
            $table->decimal('ai_confidence_lcc', 3, 2)->nullable()->after('ai_assisted_lcc');
        });

        // Also add to works table for FRBR/BIBFRAME consistency
        Schema::table('works', function (Blueprint $table) {
            $table->boolean('ai_assisted_ddc')->default(false)->after('ddc_class');
            $table->boolean('ai_assisted_lcc')->default(false)->after('lcc_class');
            $table->decimal('ai_confidence_ddc', 3, 2)->nullable()->after('ai_assisted_ddc');
            $table->decimal('ai_confidence_lcc', 3, 2)->nullable()->after('ai_assisted_lcc');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bibliographic_records', function (Blueprint $table) {
            $table->dropColumn([
                'ai_assisted_ddc',
                'ai_assisted_lcc',
                'ai_assisted_abstract',
                'ai_assisted_subjects',
                'ai_confidence_ddc',
                'ai_confidence_lcc',
            ]);
        });

        Schema::table('works', function (Blueprint $table) {
            $table->dropColumn([
                'ai_assisted_ddc',
                'ai_assisted_lcc',
                'ai_confidence_ddc',
                'ai_confidence_lcc',
            ]);
        });
    }
};
