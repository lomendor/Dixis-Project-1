<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\DeliveryMethod;
use Illuminate\Support\Facades\DB;

class DeliveryMethodSeeder extends Seeder
{
    // Constants from ShippingService (or define them here)
    const METHOD_HOME = 'HOME';
    const METHOD_PICKUP = 'PICKUP';
    const METHOD_LOCKER = 'LOCKER';
    const PICKUP_MAX_WEIGHT_GRAMS = 20000; // Changed from KG
    const LOCKER_MAX_WEIGHT_GRAMS = 10000; // Changed from KG
    const LOCKER_MAX_LENGTH_CM = 61;
    const LOCKER_MAX_WIDTH_CM = 44;
    const LOCKER_MAX_HEIGHT_CM = 36;

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

        // Use delete() instead of truncate() to respect potential relations if needed elsewhere,
        // although truncate is faster if no relations exist or if we are sure.
        // Given the error, delete() with disabled checks is safer.
        DeliveryMethod::query()->delete();

        DeliveryMethod::create([
            'code' => self::METHOD_HOME,
            'name' => 'Κατ\' οίκον',
            'description' => 'Παράδοση στην πόρτα του πελάτη.',
            'max_weight_grams' => null, // Changed column name
            'max_length_cm' => null,
            'max_width_cm' => null,
            'max_height_cm' => null,
            'is_active' => true,
        ]);

        DeliveryMethod::create([
            'code' => self::METHOD_PICKUP,
            'name' => 'Παραλαβή από Σημείο',
            'description' => 'Παραλαβή από συνεργαζόμενο σημείο courier.',
            'max_weight_grams' => self::PICKUP_MAX_WEIGHT_GRAMS, // Changed column name and constant
            'max_length_cm' => null,
            'max_width_cm' => null,
            'max_height_cm' => null,
            'is_active' => true,
        ]);

        DeliveryMethod::create([
            'code' => self::METHOD_LOCKER,
            'name' => 'BOX NOW Locker', // Or generic 'Locker'
            'description' => 'Παραλαβή από αυτόματη θυρίδα.',
            'max_weight_grams' => self::LOCKER_MAX_WEIGHT_GRAMS, // Changed column name and constant
            'max_length_cm' => self::LOCKER_MAX_LENGTH_CM,
            'max_width_cm' => self::LOCKER_MAX_WIDTH_CM,
            'max_height_cm' => self::LOCKER_MAX_HEIGHT_CM,
            'is_active' => true,
        ]);

        // Re-enable foreign key checks
        if (DB::connection()->getDriverName() === 'sqlite') {
            DB::statement('PRAGMA foreign_keys = ON');
        } else {
            DB::statement('SET FOREIGN_KEY_CHECKS=1;');
        }

        $this->command->info('Delivery methods seeded successfully!');
    }
}
