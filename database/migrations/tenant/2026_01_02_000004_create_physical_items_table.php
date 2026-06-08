<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('physical_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('biblio_id')->constrained('bibliographic_records')->cascadeOnDelete();

            $table->string('barcode', 50)->unique()->nullable();
            $table->string('accession_number', 50)->unique()->nullable();
            $table->string('call_number', 100)->nullable();

            // Location
            $table->foreignId('collection_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('location_id')->nullable()->constrained()->nullOnDelete();
            $table->string('shelf', 50)->nullable();

            // Status
            // available, checked_out, on_hold, in_repair, lost, withdrawn, on_order
            $table->string('item_status', 30)->default('available')->index();

            // Physical attributes
            $table->string('condition', 20)->default('good'); // excellent, good, fair, poor
            $table->decimal('price', 10, 2)->nullable();
            $table->string('currency', 3)->default('USD');

            // Purchase info
            $table->date('acquired_date')->nullable();
            $table->string('supplier', 200)->nullable();
            $table->string('purchase_order', 100)->nullable();

            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('physical_items');
    }
};
