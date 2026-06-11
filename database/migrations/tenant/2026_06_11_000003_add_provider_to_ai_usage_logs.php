<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('ai_usage_logs') || Schema::hasColumn('ai_usage_logs', 'provider')) {
            return;
        }

        Schema::table('ai_usage_logs', function (Blueprint $table) {
            $table->string('provider', 20)->default('gemini')->after('id')->index();
        });
    }

    public function down(): void
    {
        if (Schema::hasColumn('ai_usage_logs', 'provider')) {
            Schema::table('ai_usage_logs', function (Blueprint $table) {
                $table->dropColumn('provider');
            });
        }
    }
};
