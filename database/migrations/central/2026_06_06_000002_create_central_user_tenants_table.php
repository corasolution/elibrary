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
        Schema::connection('central')->create('central_user_tenants', function (Blueprint $table) {
            $table->uuid('user_id');
            $table->uuid('tenant_id');
            $table->timestamp('assigned_at')->useCurrent();
            $table->uuid('assigned_by')->nullable(); // Which admin assigned this
            $table->text('notes')->nullable();

            // Primary key
            $table->primary(['user_id', 'tenant_id']);

            // Foreign keys
            $table->foreign('user_id')
                ->references('id')
                ->on('central_users')
                ->onDelete('cascade');

            $table->foreign('tenant_id')
                ->references('id')
                ->on('tenants')
                ->onDelete('cascade');

            $table->foreign('assigned_by')
                ->references('id')
                ->on('central_users')
                ->onDelete('set null');

            // Indexes for performance
            $table->index('user_id');
            $table->index('tenant_id');
            $table->index('assigned_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('central')->dropIfExists('central_user_tenants');
    }
};
