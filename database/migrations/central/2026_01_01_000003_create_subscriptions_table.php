<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('subscriptions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('plan_id')->constrained();
            $table->string('status', 20)->default('active'); // active, past_due, cancelled, trialing
            $table->timestamp('current_period_start')->nullable();
            $table->timestamp('current_period_end')->nullable();
            $table->string('payment_method', 50)->nullable(); // aba_payway, khqr, stripe, manual
            $table->string('external_subscription_id')->nullable(); // Stripe sub ID etc.
            $table->json('metadata')->default('{}');
            $table->timestamps();
        });

        // NOTE: payment_transactions is created by the dedicated, newer
        // migration 2026_06_07_044925_create_payment_transactions_table
        // (which carries the payment-verification workflow schema used by
        // PaymentController and Invoice). The earlier duplicate definition
        // here was removed — it conflicted on PostgreSQL (SQLite masked it).
    }

    public function down(): void
    {
        Schema::dropIfExists('subscriptions');
    }
};

