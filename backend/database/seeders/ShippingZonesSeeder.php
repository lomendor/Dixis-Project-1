<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ShippingZonesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Clear existing data
        DB::table('shipping_zones')->truncate();

        // Insert shipping zones
        $zones = [
            [
                'id' => 1,
                'name' => 'Αστικά Κέντρα',
                'description' => 'Περιλαμβάνει τα μεγάλα αστικά κέντρα. Ταχύτερη παράδοση και χαμηλότερο κόστος μεταφορικών.',
                'color' => '#4299E1',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 2,
                'name' => 'Πρωτεύουσες Νομών Ηπειρωτικής Ελλάδας',
                'description' => 'Περιλαμβάνει τις πρωτεύουσες των νομών της ηπειρωτικής Ελλάδας. Παράδοση εντός 1-2 εργάσιμων ημερών.',
                'color' => '#48BB78',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 3,
                'name' => 'Λοιπή Ηπειρωτική Ελλάδα & Εύβοια',
                'description' => 'Περιλαμβάνει την υπόλοιπη ηπειρωτική Ελλάδα και την Εύβοια. Παράδοση εντός 2-3 εργάσιμων ημερών.',
                'color' => '#ECC94B',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 4,
                'name' => 'Νησιά (Εξαιρουμένων Δυσπρόσιτων)',
                'description' => 'Περιλαμβάνει τα νησιά, εκτός από τις δυσπρόσιτες περιοχές. Παράδοση εντός 3-5 εργάσιμων ημερών.',
                'color' => '#ED8936',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 5,
                'name' => 'Δυσπρόσιτες Περιοχές',
                'description' => 'Περιλαμβάνει τις δυσπρόσιτες περιοχές της ηπειρωτικής και νησιωτικής Ελλάδας. Παράδοση εντός 5-7 εργάσιμων ημερών.',
                'color' => '#E53E3E',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 6,
                'name' => 'Αθήνα',
                'description' => 'Περιλαμβάνει την περιοχή της Αθήνας. Ταχύτερη παράδοση και χαμηλότερο κόστος μεταφορικών.',
                'color' => '#805AD5',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 7,
                'name' => 'Θεσσαλονίκη',
                'description' => 'Περιλαμβάνει την περιοχή της Θεσσαλονίκης. Ταχύτερη παράδοση και χαμηλότερο κόστος μεταφορικών.',
                'color' => '#3182CE',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('shipping_zones')->insert($zones);
    }
}
