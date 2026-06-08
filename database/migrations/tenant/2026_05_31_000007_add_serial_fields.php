<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('serials', function (Blueprint $table) {
            if (! Schema::hasColumn('serials', 'issn'))
                $table->string('issn', 10)->nullable()->after('biblio_id');
            if (! Schema::hasColumn('serials', 'subscription_cost'))
                $table->decimal('subscription_cost', 8, 2)->nullable()->after('supplier');
            if (! Schema::hasColumn('serials', 'currency'))
                $table->string('currency', 3)->default('USD')->after('subscription_cost');
            if (! Schema::hasColumn('serials', 'location_id'))
                $table->unsignedInteger('location_id')->nullable()->after('currency');
            if (! Schema::hasColumn('serials', 'collection_id'))
                $table->unsignedInteger('collection_id')->nullable()->after('location_id');
            if (! Schema::hasColumn('serials', 'call_number'))
                $table->string('call_number', 100)->nullable()->after('collection_id');
        });

        Schema::table('serial_issues', function (Blueprint $table) {
            if (! Schema::hasColumn('serial_issues', 'expected_date'))
                $table->date('expected_date')->nullable()->after('publication_date');
            if (! Schema::hasColumn('serial_issues', 'notes'))
                $table->text('notes')->nullable()->after('status');
            if (! Schema::hasColumn('serial_issues', 'claimed_at'))
                $table->timestamp('claimed_at')->nullable()->after('notes');
        });
    }

    public function down(): void
    {
        Schema::table('serials', function (Blueprint $table) {
            $cols = ['issn', 'subscription_cost', 'currency', 'location_id', 'collection_id', 'call_number'];
            foreach ($cols as $col) {
                if (Schema::hasColumn('serials', $col)) $table->dropColumn($col);
            }
        });

        Schema::table('serial_issues', function (Blueprint $table) {
            foreach (['expected_date', 'notes', 'claimed_at'] as $col) {
                if (Schema::hasColumn('serial_issues', $col)) $table->dropColumn($col);
            }
        });
    }
};
