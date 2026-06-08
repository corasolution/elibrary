<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('plans', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name', 50);             // Free, Starter, Pro, Enterprise
            $table->decimal('price_usd', 8, 2);
            $table->string('billing_cycle', 10)->default('monthly'); // monthly, annual
            $table->integer('max_titles')->nullable();    // NULL = unlimited
            $table->integer('max_patrons')->nullable();
            $table->integer('max_storage_gb')->nullable();
            $table->json('features')->default('[]');
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('plans');
    }
};

