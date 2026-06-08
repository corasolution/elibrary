<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tenants', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('slug', 100)->unique();
            $table->string('domain')->nullable();
            $table->json('data')->default('{}');
            // plan_id FK is added in the plans migration (runs after this one)
            // to avoid a forward-reference that PostgreSQL rejects.
            $table->uuid('plan_id')->nullable();
            $table->timestamp('trial_ends_at')->nullable();
            $table->string('status', 20)->default('active'); // active, suspended, cancelled
            $table->timestamps();
        });

        Schema::create('domains', function (Blueprint $table) {
            $table->id();
            $table->string('domain', 255)->unique();
            $table->foreignUuid('tenant_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('domains');
        Schema::dropIfExists('tenants');
    }
};

