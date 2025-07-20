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
        // Προσθήκη χρωμάτων στις ζώνες αποστολής
        $colors = [
            1 => '#4299E1', // blue-500
            2 => '#48BB78', // green-500
            3 => '#ECC94B', // yellow-500
            4 => '#ED8936', // orange-500
            5 => '#E53E3E', // red-500
            6 => '#805AD5', // purple-500
            7 => '#3182CE', // blue-600
        ];

        foreach ($colors as $zoneId => $color) {
            DB::table('shipping_zones')
                ->where('id', $zoneId)
                ->update([
                    'color' => $color,
                    'updated_at' => now()
                ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Αφαίρεση χρωμάτων από τις ζώνες αποστολής
        DB::table('shipping_zones')
            ->whereIn('id', [1, 2, 3, 4, 5, 6, 7])
            ->update([
                'color' => null,
                'updated_at' => now()
            ]);
    }
};
