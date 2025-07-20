<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\WeightTier;
use Illuminate\Support\Facades\DB;

class WeightTierSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // For SQLite, we need to use a different approach to disable foreign key checks
        if (DB::connection()->getDriverName() === 'sqlite') {
            DB::statement('PRAGMA foreign_keys = OFF');
        } else {
            DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        }
        WeightTier::query()->delete(); // Clear existing tiers if any

        WeightTier::create([
            'code' => 'TIER_2KG',
            'description' => '0 - 2000 γραμμάρια',
            'min_weight_grams' => 0,
            'max_weight_grams' => 2000,
        ]);

        WeightTier::create([
            'code' => 'TIER_5KG',
            'description' => '2001 - 5000 γραμμάρια',
            'min_weight_grams' => 2001,
            'max_weight_grams' => 5000,
        ]);

        WeightTier::create([
            'code' => 'TIER_10KG',
            'description' => '5001 - 10000 γραμμάρια',
            'min_weight_grams' => 5001,
            'max_weight_grams' => 10000,
        ]);

        // Optional: Add a tier for > 10kg if needed for specific logic,
        // though the ShippingService handles this range separately for extra charges.
        // If added, ensure max_weight_grams is set appropriately (e.g., a very large number or null if allowed).
        /*
        WeightTier::create([
            'code' => 'TIER_OVER_10KG',
            'description' => '> 10000 γραμμάρια',
            'min_weight_grams' => 10001,
            'max_weight_grams' => 999999, // Or null if your schema allows
        ]);
        */

        // Re-enable foreign key checks
        if (DB::connection()->getDriverName() === 'sqlite') {
            DB::statement('PRAGMA foreign_keys = ON');
        } else {
            DB::statement('SET FOREIGN_KEY_CHECKS=1;');
        }

        $this->command->info('Weight tiers seeded successfully!');
    }
}
