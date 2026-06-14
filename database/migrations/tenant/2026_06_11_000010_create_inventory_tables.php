<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Track when each item was last physically verified
        Schema::table('physical_items', function (Blueprint $table) {
            $table->timestamp('last_seen_at')->nullable()->after('notes');
        });

        // One inventory session = one counting event (annual count, spot check, etc.)
        Schema::create('inventory_sessions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->text('notes')->nullable();

            // Scope — null = entire collection
            $table->unsignedBigInteger('collection_id')->nullable();
            $table->unsignedBigInteger('location_id')->nullable();

            $table->string('status', 20)->default('open'); // open, closed

            // Snapshot counts set when session is created / closed
            $table->unsignedInteger('expected_count')->default(0);
            $table->unsignedInteger('scanned_count')->default(0);
            $table->unsignedInteger('missing_count')->default(0);
            $table->unsignedInteger('unknown_count')->default(0); // scanned but barcode not in DB

            $table->uuid('started_by')->nullable(); // staff user id
            $table->timestamp('started_at')->useCurrent();
            $table->timestamp('closed_at')->nullable();
            $table->timestamps();
        });

        // One row per barcode scan within a session
        Schema::create('inventory_scans', function (Blueprint $table) {
            $table->id();
            $table->uuid('session_id');
            $table->uuid('item_id')->nullable(); // null if barcode not found in DB
            $table->string('barcode_scanned', 100);

            // found        = item in correct location
            // wrong_location = item found but in different collection/location than expected
            // checked_out  = item found but currently on loan (counted as seen)
            // not_found    = barcode not in database
            $table->string('scan_status', 30)->default('found');

            $table->uuid('scanned_by')->nullable();
            $table->timestamp('scanned_at')->useCurrent();
            $table->text('notes')->nullable();

            $table->foreign('session_id')->references('id')->on('inventory_sessions')->cascadeOnDelete();
            $table->index(['session_id', 'item_id']);
            $table->index(['session_id', 'barcode_scanned']);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventory_scans');
        Schema::dropIfExists('inventory_sessions');
        Schema::table('physical_items', function (Blueprint $table) {
            $table->dropColumn('last_seen_at');
        });
    }
};
