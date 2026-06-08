<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('locations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('parent_id')->nullable()->constrained('locations')->nullOnDelete();
            $table->string('name', 100);
            $table->string('name_km', 200)->nullable();
            $table->string('code', 20)->unique()->nullable();
            $table->text('address')->nullable();
            $table->boolean('is_branch')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('collections', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->string('name_km', 200)->nullable();
            $table->string('code', 20)->unique()->nullable();
            $table->text('description')->nullable();
            $table->boolean('is_loanable')->default(true);
            $table->integer('loan_period_days')->default(14);
            $table->integer('renewals_allowed')->default(2);
            $table->decimal('fine_rate_per_day', 6, 2)->default(0.10);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('collections');
        Schema::dropIfExists('locations');
    }
};
