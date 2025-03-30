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
        Schema::table('rooms', function (Blueprint $table) {
            $table->integer('process_percentage')->default(0);
            $table->integer('processed')->default(0);
            $table->integer('processing')->default(0);
            $table->string('subtitle')->nullable(true);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('rooms', function (Blueprint $table) {
            $table->dropColumn('process_percentage');
            $table->dropColumn('processed');
            $table->dropColumn('processing');
            $table->dropColumn('subtitle');
        });
    }
};
