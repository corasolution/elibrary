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
        Schema::connection('central')->create('payment_transactions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            $table->uuid('plan_id')->nullable();

            // Payment details
            $table->decimal('amount', 10, 2);
            $table->string('currency', 3)->default('USD');
            $table->string('payment_method')->default('qr_code'); // qr_code, bank_transfer, etc.

            // Transaction proof
            $table->string('transaction_proof')->nullable(); // Path to uploaded image
            $table->text('notes')->nullable(); // Customer notes

            // Status tracking
            $table->string('status')->default('pending'); // pending, verified, rejected
            $table->timestamp('paid_at')->nullable(); // When customer claims they paid
            $table->timestamp('verified_at')->nullable(); // When admin verified
            $table->uuid('verified_by')->nullable(); // Admin who verified
            $table->text('rejection_reason')->nullable(); // If rejected

            $table->timestamps();

            // Foreign keys
            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            $table->foreign('plan_id')->references('id')->on('plans')->onDelete('set null');
            $table->foreign('verified_by')->references('id')->on('central_users')->onDelete('set null');

            // Indexes
            $table->index('status');
            $table->index('tenant_id');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payment_transactions');
    }
};
