<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('acquisition_orders', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('order_number', 50)->unique();
            $table->string('supplier', 200)->nullable();
            $table->date('order_date')->nullable();
            $table->date('expected_date')->nullable();
            $table->date('received_date')->nullable();
            // pending, ordered, partial, received, cancelled
            $table->string('status', 20)->default('pending')->index();
            $table->decimal('total_amount', 10, 2)->nullable();
            $table->string('currency', 3)->default('USD');
            $table->text('notes')->nullable();
            $table->uuid('created_by')->nullable();
            $table->timestamps();
        });

        Schema::create('acquisition_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('order_id')->constrained('acquisition_orders')->cascadeOnDelete();
            $table->foreignUuid('biblio_id')->nullable()->constrained('bibliographic_records')->nullOnDelete();
            $table->unsignedSmallInteger('quantity')->default(1);
            $table->decimal('unit_price', 8, 2)->nullable();
            $table->unsignedSmallInteger('received_qty')->default(0);
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('serials', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('biblio_id')->nullable()->constrained('bibliographic_records')->nullOnDelete();
            // daily, weekly, monthly, quarterly, annual
            $table->string('frequency', 30)->nullable();
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->date('subscription_expiry')->nullable();
            $table->string('supplier', 200)->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('serial_issues', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('serial_id')->constrained('serials')->cascadeOnDelete();
            $table->string('volume', 20)->nullable();
            $table->string('issue_number', 20)->nullable();
            $table->date('publication_date')->nullable();
            $table->date('received_date')->nullable();
            $table->foreignUuid('item_id')->nullable()->constrained('physical_items')->nullOnDelete();
            // expected, received, late, missing
            $table->string('status', 20)->default('expected');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('serial_issues');
        Schema::dropIfExists('serials');
        Schema::dropIfExists('acquisition_items');
        Schema::dropIfExists('acquisition_orders');
    }
};
