<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('plans', function (Blueprint $table) {
            $table->boolean('is_popular')->default(false)->after('is_active');
        });

        // Preserve the prior hardcoded default: Pro carried the "Most Popular"
        // badge. No-op on a fresh install (plans seeded afterwards).
        if (\Illuminate\Support\Facades\Schema::hasTable('plans')) {
            \Illuminate\Support\Facades\DB::table('plans')->where('name', 'Pro')->update(['is_popular' => true]);
        }
    }

    public function down(): void
    {
        Schema::table('plans', function (Blueprint $table) {
            $table->dropColumn('is_popular');
        });
    }
};
