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
        Schema::connection('central')->table('tenants', function (Blueprint $table) {
            $table->uuid('created_by_id')->nullable()->after('status');
            $table->uuid('managed_by_id')->nullable()->after('created_by_id');

            // Foreign keys
            $table->foreign('created_by_id')
                ->references('id')
                ->on('central_users')
                ->onDelete('set null');

            $table->foreign('managed_by_id')
                ->references('id')
                ->on('central_users')
                ->onDelete('set null');

            // Indexes for performance
            $table->index('created_by_id');
            $table->index('managed_by_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('central')->table('tenants', function (Blueprint $table) {
            $table->dropForeign(['created_by_id']);
            $table->dropForeign(['managed_by_id']);
            $table->dropIndex(['created_by_id']);
            $table->dropIndex(['managed_by_id']);
            $table->dropColumn(['created_by_id', 'managed_by_id']);
        });
    }
};
