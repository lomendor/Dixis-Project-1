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
        Schema::table('shipping_zones', function (Blueprint $table) {
            // Προσθήκη στήλης geojson αν δεν υπάρχει
            if (!Schema::hasColumn('shipping_zones', 'geojson')) {
                $table->json('geojson')->nullable();
            }

            // Προσθήκη στήλης color αν δεν υπάρχει
            if (!Schema::hasColumn('shipping_zones', 'color')) {
                $table->string('color', 20)->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('shipping_zones', function (Blueprint $table) {
            // Αφαίρεση στήλης geojson αν υπάρχει
            if (Schema::hasColumn('shipping_zones', 'geojson')) {
                $table->dropColumn('geojson');
            }

            // Αφαίρεση στήλης color αν υπάρχει
            if (Schema::hasColumn('shipping_zones', 'color')) {
                $table->dropColumn('color');
            }
        });
    }
};
