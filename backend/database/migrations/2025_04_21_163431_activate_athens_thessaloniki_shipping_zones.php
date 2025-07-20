<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Check if zones 6 and 7 exist
        $zone6 = DB::table('shipping_zones')->where('id', 6)->first();
        $zone7 = DB::table('shipping_zones')->where('id', 7)->first();

        // If zone 6 (Athens) doesn't exist, create it
        if (!$zone6) {
            DB::table('shipping_zones')->insert([
                'id' => 6,
                'name' => 'Κέντρο Αθήνας',
                'description' => 'Ειδική ζώνη για γρήγορη παράδοση στο κέντρο της Αθήνας',
                'is_active' => true,
                'color' => '#4CAF50', // Green
                'created_at' => now(),
                'updated_at' => now()
            ]);
        } else {
            // If zone 6 exists but is inactive, activate it
            DB::table('shipping_zones')
                ->where('id', 6)
                ->update([
                    'is_active' => true,
                    'updated_at' => now()
                ]);
        }

        // If zone 7 (Thessaloniki) doesn't exist, create it
        if (!$zone7) {
            DB::table('shipping_zones')->insert([
                'id' => 7,
                'name' => 'Κέντρο Θεσσαλονίκης',
                'description' => 'Ειδική ζώνη για γρήγορη παράδοση στο κέντρο της Θεσσαλονίκης',
                'is_active' => true,
                'color' => '#2196F3', // Blue
                'created_at' => now(),
                'updated_at' => now()
            ]);
        } else {
            // If zone 7 exists but is inactive, activate it
            DB::table('shipping_zones')
                ->where('id', 7)
                ->update([
                    'is_active' => true,
                    'updated_at' => now()
                ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Deactivate zones 6 and 7
        DB::table('shipping_zones')
            ->whereIn('id', [6, 7])
            ->update([
                'is_active' => false,
                'updated_at' => now()
            ]);
    }
};
