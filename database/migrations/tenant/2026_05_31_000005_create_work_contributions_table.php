<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Work-level contributions (BIBFRAME bf:Contribution on bf:Work)
        // Maps to MARC 100/110/111 (primary) and 700/710/711 (added entries)
        Schema::create('work_contributions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('work_id')->index();
            $table->foreign('work_id')->references('id')->on('works')->onDelete('cascade');

            // Link to agents table (optional — may not have an authority record yet)
            $table->uuid('agent_id')->nullable()->index();
            $table->foreign('agent_id')->references('id')->on('agents')->onDelete('set null');

            // Fallback name when no agent record exists
            $table->string('agent_name', 500)->nullable();
            $table->string('agent_type', 20)->default('person'); // person|organization|meeting

            // BIBFRAME bf:role / LC Relator codes
            $table->string('role_code', 10)->default('aut');       // aut|edt|trl|ill|cmp|pht etc.
            $table->string('role_label', 100)->nullable();          // "Author", "Editor", display label
            $table->string('relator_uri', 200)->nullable();         // id.loc.gov/vocabulary/relators/aut

            // MARC distinction: 1XX (primary) vs 7XX (added entry)
            $table->boolean('is_primary')->default(false);
            $table->integer('sort_order')->default(0);

            $table->timestamps();
        });

        // Instance-level contributions (translators, illustrators of a specific edition)
        Schema::create('instance_contributions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('instance_id')->index();
            $table->foreign('instance_id')->references('id')->on('bibliographic_records')->onDelete('cascade');

            $table->uuid('agent_id')->nullable()->index();
            $table->foreign('agent_id')->references('id')->on('agents')->onDelete('set null');

            $table->string('agent_name', 500)->nullable();
            $table->string('agent_type', 20)->default('person');

            $table->string('role_code', 10)->default('trl');
            $table->string('role_label', 100)->nullable();
            $table->string('relator_uri', 200)->nullable();

            $table->boolean('is_primary')->default(false);
            $table->integer('sort_order')->default(0);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('instance_contributions');
        Schema::dropIfExists('work_contributions');
    }
};
