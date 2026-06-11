<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Central cross-tenant AI usage ledger — one row per billable AI call.
 * Powers the super-admin "token usage by API" + earnings (30% markup) dashboard
 * without scanning every tenant database.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ai_usage_ledger', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->uuid('tenant_id')->nullable()->index();
            $table->string('provider', 20)->index();   // gemini | claude
            $table->string('feature', 60)->index();     // opac_chatbot, ddc_lcc_classification, ...
            $table->unsignedInteger('input_tokens')->default(0);
            $table->unsignedInteger('output_tokens')->default(0);
            $table->decimal('api_cost_usd', 12, 6)->default(0);   // raw provider cost
            $table->decimal('billed_usd', 12, 6)->default(0);     // what the library pays (api + markup)
            $table->decimal('earning_usd', 12, 6)->default(0);    // billed - api_cost (platform margin)
            $table->timestamp('created_at')->nullable()->index();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_usage_ledger');
    }
};
