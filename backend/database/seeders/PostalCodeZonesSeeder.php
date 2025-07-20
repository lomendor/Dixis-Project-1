<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

class PostalCodeZonesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Clear existing data
        DB::table('postal_code_zones')->truncate();

        // Path to the CSV file
        $csvFile = base_path('postal_codes_to_zones.csv');

        if (!File::exists($csvFile)) {
            $this->command->error('CSV file not found: ' . $csvFile);
            return;
        }

        // Read the CSV file
        $handle = fopen($csvFile, 'r');

        // Skip the header row
        fgetcsv($handle);

        // Batch size for inserting records
        $batchSize = 100;
        $batch = [];
        $count = 0;

        // Keep track of processed prefixes to avoid duplicates
        $processedPrefixes = [];

        // Process each row
        while (($data = fgetcsv($handle)) !== false) {
            $postalCode = $data[0];
            $zoneId = $data[1];

            // Get the first 3 digits of the postal code as the prefix
            $postalCodePrefix = substr($postalCode, 0, 3);

            // Skip if we've already processed this prefix
            if (isset($processedPrefixes[$postalCodePrefix])) {
                continue;
            }

            $processedPrefixes[$postalCodePrefix] = true;

            $batch[] = [
                'postal_code_prefix' => $postalCodePrefix,
                'shipping_zone_id' => $zoneId,
            ];

            $count++;

            // Insert in batches to improve performance
            if (count($batch) >= $batchSize) {
                DB::table('postal_code_zones')->insert($batch);
                $batch = [];
                $this->command->info("Inserted $count postal code prefixes");
            }
        }

        // Insert any remaining records
        if (count($batch) > 0) {
            DB::table('postal_code_zones')->insert($batch);
            $this->command->info("Inserted $count postal code prefixes");
        }

        fclose($handle);
    }
}
