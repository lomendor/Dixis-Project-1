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
        Schema::table('producers', function (Blueprint $table) {
            $table->decimal('latitude', 10, 7)->nullable()->after('region')->comment('Γεωγραφικό πλάτος');
            $table->decimal('longitude', 10, 7)->nullable()->after('latitude')->comment('Γεωγραφικό μήκος');
            $table->text('map_description')->nullable()->after('longitude')->comment('Περιγραφή για τον χάρτη');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('producers', function (Blueprint $table) {
            $table->dropColumn(['latitude', 'longitude', 'map_description']);
        });
    }
};
