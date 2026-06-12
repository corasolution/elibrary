<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('patrons', function (Blueprint $table) {
            $table->string('qr_token', 64)->nullable()->unique()->after('patron_number');
        });

        // Generate tokens for existing patrons
        DB::table('patrons')->whereNull('qr_token')->orderBy('created_at')->each(function ($patron) {
            DB::table('patrons')->where('id', $patron->id)->update([
                'qr_token' => hash('sha256', $patron->id . config('app.key')),
            ]);
        });
    }

    public function down(): void
    {
        Schema::table('patrons', function (Blueprint $table) {
            $table->dropColumn('qr_token');
        });
    }
};
