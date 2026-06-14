<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('registration_requests', function (Blueprint $table) {
            $table->uuid('id')->primary();

            // Submitted library / contact info
            $table->string('library_name');
            $table->string('slug', 100)->nullable();      // proposed URL slug
            $table->string('contact_name');
            $table->string('contact_email');
            $table->string('telegram');                   // required contact channel
            $table->string('contact_phone', 30)->nullable();
            $table->string('library_type', 100)->nullable();
            $table->string('collection_size', 30)->nullable(); // e.g. "500-5000"
            $table->string('address', 500)->nullable();
            $table->string('country', 3)->default('KHM');
            $table->uuid('plan_id')->nullable();          // interested plan

            // Review workflow
            $table->string('status', 20)->default('pending'); // pending, reviewed, approved, rejected
            $table->text('admin_notes')->nullable();
            $table->uuid('reviewed_by_id')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->uuid('tenant_id')->nullable();        // set when converted to a library

            $table->timestamps();

            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('registration_requests');
    }
};
