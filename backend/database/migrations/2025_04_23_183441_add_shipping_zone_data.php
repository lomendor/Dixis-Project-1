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
        // Ενημέρωση των υπαρχόντων ζωνών και προσθήκη νέων αν χρειάζεται
        $zones = [
            [
                'id' => 1,
                'name' => 'Αστικά Κέντρα (Αθήνα/Θεσσαλονίκη)',
                'description' => 'Περιλαμβάνει τις περιοχές της Αθήνας και της Θεσσαλονίκης.',
                'color' => '#4299E1',
                'is_active' => true,
                'geojson' => '{"type":"Feature","properties":[],"geometry":{"type":"Polygon","coordinates":[[[23.6,37.9],[23.8,37.9],[23.8,38.1],[23.6,38.1],[23.6,37.9]]]}}'
            ],
            [
                'id' => 2,
                'name' => 'Πρωτεύουσες Νομών Ηπειρωτικής Ελλάδας',
                'description' => 'Περιλαμβάνει τις πρωτεύουσες των νομών της ηπειρωτικής Ελλάδας.',
                'color' => '#48BB78',
                'is_active' => true,
                'geojson' => '{"type":"Feature","properties":[],"geometry":{"type":"Polygon","coordinates":[[[21.7,38.2],[22.0,38.2],[22.0,38.5],[21.7,38.5],[21.7,38.2]]]}}'
            ],
            [
                'id' => 3,
                'name' => 'Λοιπή Ηπειρωτική Ελλάδα & Εύβοια',
                'description' => 'Περιλαμβάνει την υπόλοιπη ηπειρωτική Ελλάδα και την Εύβοια.',
                'color' => '#ECC94B',
                'is_active' => true,
                'geojson' => '{"type":"Feature","properties":[],"geometry":{"type":"Polygon","coordinates":[[[21.0,38.0],[23.0,38.0],[23.0,41.0],[21.0,41.0],[21.0,38.0]]]}}'
            ],
            [
                'id' => 4,
                'name' => 'Νησιά (Εξαιρουμένων Δυσπρόσιτων)',
                'description' => 'Περιλαμβάνει τα νησιά, εκτός από τις δυσπρόσιτες περιοχές.',
                'color' => '#ED8936',
                'is_active' => true,
                'geojson' => '{"type":"Feature","properties":[],"geometry":{"type":"Polygon","coordinates":[[[24.0,35.0],[26.0,35.0],[26.0,37.0],[24.0,37.0],[24.0,35.0]]]}}'
            ],
            [
                'id' => 5,
                'name' => 'Δυσπρόσιτες Περιοχές',
                'description' => 'Περιλαμβάνει τις δυσπρόσιτες περιοχές της ηπειρωτικής και νησιωτικής Ελλάδας.',
                'color' => '#E53E3E',
                'is_active' => true,
                'geojson' => '{"type":"Feature","properties":[],"geometry":{"type":"Polygon","coordinates":[[[27.0,36.0],[28.0,36.0],[28.0,37.0],[27.0,37.0],[27.0,36.0]]]}}'
            ],
            [
                'id' => 6,
                'name' => 'Αθήνα',
                'description' => 'Περιλαμβάνει την περιοχή της Αθήνας.',
                'color' => '#805AD5',
                'is_active' => true, // Ενεργοποιημένη
                'geojson' => '{"type":"Feature","properties":[],"geometry":{"type":"Polygon","coordinates":[[[23.7,37.95],[23.75,37.95],[23.75,38.0],[23.7,38.0],[23.7,37.95]]]}}'
            ],
            [
                'id' => 7,
                'name' => 'Θεσσαλονίκη',
                'description' => 'Περιλαμβάνει την περιοχή της Θεσσαλονίκης.',
                'color' => '#3182CE',
                'is_active' => true, // Ενεργοποιημένη
                'geojson' => '{"type":"Feature","properties":[],"geometry":{"type":"Polygon","coordinates":[[[22.9,40.6],[23.0,40.6],[23.0,40.7],[22.9,40.7],[22.9,40.6]]]}}'
            ]
        ];

        foreach ($zones as $zone) {
            // Εισαγωγή ή ενημέρωση της ζώνης
            DB::table('shipping_zones')->updateOrInsert(
                ['id' => $zone['id']],
                [
                    'name' => $zone['name'],
                    'description' => $zone['description'],
                    'color' => $zone['color'],
                    'is_active' => $zone['is_active'],
                    'geojson' => $zone['geojson'],
                    'created_at' => now(),
                    'updated_at' => now()
                ]
            );
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Δεν αφαιρούμε τις ζώνες για να μην χαθούν δεδομένα
    }
};
