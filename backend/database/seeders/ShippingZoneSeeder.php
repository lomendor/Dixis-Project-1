<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\ShippingZone; // Import the model

class ShippingZoneSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Define the shipping zones based on Tran Cost.md
        $zones = [
            [
                'id' => 1,
                'name' => 'Αστικά Κέντρα',
                'description' => 'Αθήνα/Θεσσαλονίκη',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 2,
                'name' => 'Πρωτεύουσες Νομών Ηπειρωτικής Ελλάδας',
                'description' => 'Πρωτεύουσες Νομών Ηπειρωτικής Ελλάδας (εκτός Αθήνας/Θεσσαλονίκης)',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 3,
                'name' => 'Λοιπή Ηπειρωτική Ελλάδα & Εύβοια',
                'description' => 'Υπόλοιπη Ηπειρωτική Ελλάδα και Εύβοια',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 4,
                'name' => 'Νησιά (Εξαιρουμένων Δυσπρόσιτων)',
                'description' => 'Νησιωτική Ελλάδα, εξαιρουμένων των δυσπρόσιτων περιοχών',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 5,
                'name' => 'Δυσπρόσιτες Περιοχές',
                'description' => 'Δυσπρόσιτες περιοχές (ηπειρωτικές και νησιωτικές)',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        // Insert the zones, update if ID exists (useful for re-running seeds)
        // Using upsert to handle potential re-runs gracefully
        ShippingZone::upsert($zones, ['id'], ['name', 'description', 'is_active', 'updated_at']);

        $this->command->info('Shipping zones seeded successfully.');
    }
}
