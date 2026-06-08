<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('patron_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);          // Student, Staff, Faculty, Public, VIP
            $table->string('name_km', 200)->nullable();
            $table->integer('loan_limit')->default(5);
            $table->integer('loan_period_days')->default(14);
            $table->integer('renewals_allowed')->default(2);
            $table->integer('reservation_limit')->default(3);
            $table->decimal('fine_rate_per_day', 6, 2)->default(0.10);
            $table->decimal('max_fine', 8, 2)->default(10.00);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('patrons', function (Blueprint $table) {
            $table->uuid('id')->primary();

            // Account
            $table->string('patron_number', 30)->unique();
            $table->string('email', 255)->unique()->nullable();
            $table->string('password', 255)->nullable();
            $table->timestamp('email_verified_at')->nullable();

            // Personal info
            $table->string('first_name', 100);
            $table->string('last_name', 100)->nullable();
            $table->string('first_name_km', 200)->nullable();
            $table->string('last_name_km', 200)->nullable();
            $table->string('gender', 20)->nullable();
            $table->date('date_of_birth')->nullable();
            $table->string('phone', 30)->nullable();

            // Address
            $table->text('address')->nullable();
            $table->string('city', 100)->nullable();
            $table->string('country', 3)->default('KHM');

            // Category
            $table->foreignId('patron_category_id')->nullable()->constrained()->nullOnDelete();

            // Status
            $table->string('status', 20)->default('active')->index(); // active, expired, suspended, blocked
            $table->date('membership_expiry')->nullable();

            // Preferences
            $table->string('preferred_language', 5)->default('en');

            // Stats (denormalized for performance)
            $table->unsignedInteger('total_checkouts')->default(0);
            $table->unsignedInteger('active_loans')->default(0);

            $table->text('notes')->nullable();
            $table->rememberToken();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('patrons');
        Schema::dropIfExists('patron_categories');
    }
};
