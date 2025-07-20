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
        // Δεν χρειάζεται να προσθέσουμε τη στήλη geojson καθώς υπάρχει ήδη
        // Προσθέτουμε τα GeoJSON δεδομένα για κάθε ζώνη
        $geoJsonData = [
            1 => [ // Αστικά Κέντρα (Αθήνα/Θεσσαλονίκη)
                'type' => 'Feature',
                'properties' => [],
                'geometry' => [
                    'type' => 'Polygon',
                    'coordinates' => [
                        [
                            [23.6, 37.9], // Αθήνα
                            [23.8, 37.9],
                            [23.8, 38.1],
                            [23.6, 38.1],
                            [23.6, 37.9],
                        ],
                    ],
                ],
            ],
            2 => [ // Πρωτεύουσες Νομών Ηπειρωτικής Ελλάδας
                'type' => 'Feature',
                'properties' => [],
                'geometry' => [
                    'type' => 'Polygon',
                    'coordinates' => [
                        [
                            [22.0, 39.5], // Ιωάννινα
                            [22.5, 39.5],
                            [22.5, 40.0],
                            [22.0, 40.0],
                            [22.0, 39.5],
                        ],
                    ],
                ],
            ],
            3 => [ // Λοιπή Ηπειρωτική Ελλάδα & Εύβοια
                'type' => 'Feature',
                'properties' => [],
                'geometry' => [
                    'type' => 'Polygon',
                    'coordinates' => [
                        [
                            [21.0, 38.0], // Κεντρική Ελλάδα
                            [24.0, 38.0],
                            [24.0, 41.0],
                            [21.0, 41.0],
                            [21.0, 38.0],
                        ],
                    ],
                ],
            ],
            4 => [ // Νησιά (Εξαιρουμένων Δυσπρόσιτων)
                'type' => 'Feature',
                'properties' => [],
                'geometry' => [
                    'type' => 'Polygon',
                    'coordinates' => [
                        [
                            [25.0, 35.0], // Κρήτη
                            [26.0, 35.0],
                            [26.0, 36.0],
                            [25.0, 36.0],
                            [25.0, 35.0],
                        ],
                    ],
                ],
            ],
            5 => [ // Δυσπρόσιτες Περιοχές
                'type' => 'Feature',
                'properties' => [],
                'geometry' => [
                    'type' => 'Polygon',
                    'coordinates' => [
                        [
                            [26.0, 39.0], // Μικρά νησιά
                            [26.5, 39.0],
                            [26.5, 39.5],
                            [26.0, 39.5],
                            [26.0, 39.0],
                        ],
                    ],
                ],
            ],
            6 => [ // Αθήνα
                'type' => 'Feature',
                'properties' => [],
                'geometry' => [
                    'type' => 'Polygon',
                    'coordinates' => [
                        [
                            [23.6, 37.9],
                            [23.9, 37.9],
                            [23.9, 38.1],
                            [23.6, 38.1],
                            [23.6, 37.9],
                        ],
                    ],
                ],
            ],
            7 => [ // Θεσσαλονίκη
                'type' => 'Feature',
                'properties' => [],
                'geometry' => [
                    'type' => 'Polygon',
                    'coordinates' => [
                        [
                            [22.9, 40.6],
                            [23.0, 40.6],
                            [23.0, 40.7],
                            [22.9, 40.7],
                            [22.9, 40.6],
                        ],
                    ],
                ],
            ],
        ];

        // Ενημέρωση των ζωνών με τα GeoJSON δεδομένα
        foreach ($geoJsonData as $zoneId => $geoJson) {
            DB::table('shipping_zones')
                ->where('id', $zoneId)
                ->update([
                    'geojson' => json_encode($geoJson),
                    'updated_at' => now()
                ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Καθαρισμός των GeoJSON δεδομένων
        DB::table('shipping_zones')
            ->whereIn('id', [1, 2, 3, 4, 5, 6, 7])
            ->update([
                'geojson' => null,
                'updated_at' => now()
            ]);
    }
};
