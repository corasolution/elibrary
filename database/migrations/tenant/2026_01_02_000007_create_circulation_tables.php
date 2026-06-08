<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('loans', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('patron_id')->constrained('patrons')->cascadeOnDelete();
            $table->foreignUuid('item_id')->constrained('physical_items')->cascadeOnDelete();

            // Dates
            $table->timestamp('checked_out_at')->useCurrent();
            $table->date('due_date');
            $table->timestamp('returned_at')->nullable()->index();
            $table->timestamp('renewed_at')->nullable();
            $table->unsignedTinyInteger('renewals_count')->default(0);

            // Staff
            $table->uuid('checked_out_by')->nullable();
            $table->uuid('returned_by')->nullable();

            // Fines
            $table->decimal('fine_amount', 8, 2)->default(0);
            $table->boolean('fine_paid')->default(false);
            $table->timestamp('fine_paid_at')->nullable();
            $table->boolean('fine_waived')->default(false);
            $table->uuid('fine_waived_by')->nullable();

            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['patron_id', 'returned_at']);
            $table->index('due_date');
        });

        Schema::create('reservations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('patron_id')->constrained('patrons')->cascadeOnDelete();
            $table->foreignUuid('biblio_id')->constrained('bibliographic_records')->cascadeOnDelete();
            $table->foreignUuid('item_id')->nullable()->constrained('physical_items')->nullOnDelete();

            // pending, waiting, ready, fulfilled, cancelled, expired
            $table->string('status', 20)->default('pending')->index();

            $table->timestamp('reserved_at')->useCurrent();
            $table->date('expiry_date')->nullable();
            $table->timestamp('notified_at')->nullable();

            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reservations');
        Schema::dropIfExists('loans');
    }
};
