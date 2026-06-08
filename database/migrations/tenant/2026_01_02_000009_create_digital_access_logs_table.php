<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('digital_access_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('resource_id')->nullable()->constrained('digital_resources')->nullOnDelete();
            $table->foreignUuid('patron_id')->nullable()->constrained('patrons')->nullOnDelete();
            $table->string('action', 20); // view, download, stream
            $table->ipAddress('ip_address')->nullable();
            $table->text('user_agent')->nullable();
            $table->string('session_id', 100)->nullable();
            $table->unsignedInteger('duration_seconds')->nullable();
            $table->timestamp('accessed_at')->useCurrent();

            $table->index('accessed_at');
            $table->index(['resource_id', 'action']);
        });

        Schema::create('daily_stats', function (Blueprint $table) {
            $table->id();
            $table->date('date')->unique();
            $table->unsignedInteger('total_loans')->default(0);
            $table->unsignedInteger('total_returns')->default(0);
            $table->unsignedInteger('new_patrons')->default(0);
            $table->unsignedInteger('digital_views')->default(0);
            $table->unsignedInteger('digital_downloads')->default(0);
            $table->unsignedInteger('overdue_items')->default(0);
            $table->timestamps();
        });

        Schema::create('library_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key', 100)->unique();
            $table->text('value')->nullable();
            $table->string('group', 50)->nullable(); // general, circulation, catalog, email, branding
            $table->string('label', 200)->nullable();
            $table->text('description')->nullable();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('library_settings');
        Schema::dropIfExists('daily_stats');
        Schema::dropIfExists('digital_access_logs');
    }
};
