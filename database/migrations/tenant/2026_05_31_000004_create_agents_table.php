<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('agents', function (Blueprint $table) {
            $table->uuid('id')->primary();

            // Agent type (BIBFRAME bf:Agent subclasses)
            $table->string('type', 20)->default('person'); // person|organization|meeting|family

            // Name (bf:name / MARC 100/110/111 $a)
            $table->string('name', 500);
            $table->string('name_km', 500)->nullable();

            // MARC subfields for personal names
            $table->string('numeration', 50)->nullable();     // $b — "II", "III"
            $table->string('title_words', 200)->nullable();   // $c — "Sir", "Dr.", "Saint"
            $table->string('dates', 100)->nullable();         // $d — "1775-1817"
            $table->string('fuller_form', 300)->nullable();   // $q — fuller form of name
            $table->string('birth_date', 20)->nullable();     // schema:birthDate
            $table->string('death_date', 20)->nullable();     // schema:deathDate

            // For organizations and meetings
            $table->string('location', 300)->nullable();      // meeting place / org HQ
            $table->string('date_range', 100)->nullable();    // founding–dissolution

            // Authority control (linked data)
            $table->string('authority_uri', 500)->nullable()->index(); // id.loc.gov/authorities/names/...
            $table->string('lc_id', 50)->nullable();          // LC Name Authority ID
            $table->string('isni', 30)->nullable();            // International Standard Name Identifier
            $table->string('viaf_id', 50)->nullable();         // VIAF cluster ID
            $table->string('orcid', 30)->nullable();           // ORCID for researchers

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('agents');
    }
};
