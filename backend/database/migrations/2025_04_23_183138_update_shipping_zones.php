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
        // Οι στήλες geojson και color έχουν ήδη προστεθεί στο προηγούμενο migration

        // Ενημέρωση των υπαρχόντων ζωνών και προσθήκη νέων αν χρειάζεται
        $zones = [
            [
                'id' => 1,
                'name' => 'Αστικά Κέντρα (Αθήνα/Θεσσαλονίκη)',
                'description' => 'Περιλαμβάνει τις περιοχές της Αθήνας και της Θεσσαλονίκης.',
                'color' => '#4299E1',
                'is_active' => true
            ],
            [
                'id' => 2,
                'name' => 'Πρωτεύουσες Νομών Ηπειρωτικής Ελλάδας',
                'description' => 'Περιλαμβάνει τις πρωτεύουσες των νομών της ηπειρωτικής Ελλάδας.',
                'color' => '#48BB78',
                'is_active' => true
            ],
            [
                'id' => 3,
                'name' => 'Λοιπή Ηπειρωτική Ελλάδα & Εύβοια',
                'description' => 'Περιλαμβάνει την υπόλοιπη ηπειρωτική Ελλάδα και την Εύβοια.',
                'color' => '#ECC94B',
                'is_active' => true
            ],
            [
                'id' => 4,
                'name' => 'Νησιά (Εξαιρουμένων Δυσπρόσιτων)',
                'description' => 'Περιλαμβάνει τα νησιά, εκτός από τις δυσπρόσιτες περιοχές.',
                'color' => '#ED8936',
                'is_active' => true
            ],
            [
                'id' => 5,
                'name' => 'Δυσπρόσιτες Περιοχές',
                'description' => 'Περιλαμβάνει τις δυσπρόσιτες περιοχές της ηπειρωτικής και νησιωτικής Ελλάδας.',
                'color' => '#E53E3E',
                'is_active' => true
            ],
            [
                'id' => 6,
                'name' => 'Αθήνα',
                'description' => 'Περιλαμβάνει την περιοχή της Αθήνας.',
                'color' => '#805AD5',
                'is_active' => false // Προσωρινά ανενεργή
            ],
            [
                'id' => 7,
                'name' => 'Θεσσαλονίκη',
                'description' => 'Περιλαμβάνει την περιοχή της Θεσσαλονίκης.',
                'color' => '#3182CE',
                'is_active' => false // Προσωρινά ανενεργή
            ]
        ];

        foreach ($zones as $zone) {
            // Έλεγχος αν υπάρχει ήδη η ζώνη
            $existingZone = DB::table('shipping_zones')->where('id', $zone['id'])->first();

            if ($existingZone) {
                // Ενημέρωση υπάρχουσας ζώνης
                DB::table('shipping_zones')
                    ->where('id', $zone['id'])
                    ->update([
                        'name' => $zone['name'],
                        'description' => $zone['description'],
                        'color' => $zone['color'],
                        'is_active' => $zone['is_active']
                    ]);
            } else {
                // Προσθήκη νέας ζώνης
                DB::table('shipping_zones')->insert([
                    'id' => $zone['id'],
                    'name' => $zone['name'],
                    'description' => $zone['description'],
                    'color' => $zone['color'],
                    'is_active' => $zone['is_active'],
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Οι στήλες geojson και color θα αφαιρεθούν από το προηγούμενο migration αν χρειαστεί

        // Δεν αφαιρούμε τις ζώνες για να μην χαθούν δεδομένα
    }
};
