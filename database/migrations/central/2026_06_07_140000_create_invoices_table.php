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
        Schema::connection('central')->create('invoices', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('invoice_number', 50)->unique();

            // Foreign keys
            $table->uuid('payment_transaction_id')->nullable();
            $table->uuid('tenant_id');
            $table->uuid('plan_id');

            // Invoice details
            $table->date('invoice_date');
            $table->date('due_date')->nullable();

            // Amounts (stored in USD, converted to KHR on invoice)
            $table->decimal('subtotal', 10, 2);
            $table->decimal('tax_rate', 5, 2)->default(10.00);
            $table->decimal('tax_amount', 10, 2);
            $table->decimal('total_amount', 10, 2);
            $table->string('currency', 3)->default('USD');

            // KHR conversion (at time of invoice)
            $table->decimal('exchange_rate', 10, 4)->nullable();
            $table->decimal('total_khr', 15, 2)->nullable();

            // PDF storage
            $table->string('pdf_path', 500)->nullable();

            // Status
            $table->string('status', 20)->default('issued');
            $table->timestamp('sent_at')->nullable();

            // Metadata
            $table->text('notes')->nullable();
            $table->timestamps();

            // Indexes
            $table->index('invoice_number');
            $table->index('payment_transaction_id');
            $table->index('tenant_id');
            $table->index('invoice_date');

            // Foreign key constraints
            $table->foreign('payment_transaction_id')
                  ->references('id')
                  ->on('payment_transactions')
                  ->onDelete('set null');

            $table->foreign('tenant_id')
                  ->references('id')
                  ->on('tenants')
                  ->onDelete('cascade');

            $table->foreign('plan_id')
                  ->references('id')
                  ->on('plans')
                  ->onDelete('restrict');
        });

        // Create invoice number sequence table (database-agnostic approach)
        Schema::connection('central')->create('invoice_number_sequence', function (Blueprint $table) {
            $table->id('current_value')->startingValue(0);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('central')->dropIfExists('invoice_number_sequence');
        Schema::connection('central')->dropIfExists('invoices');
    }
};
