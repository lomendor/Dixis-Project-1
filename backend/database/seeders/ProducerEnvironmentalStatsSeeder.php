<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Producer;
use App\Models\ProducerEnvironmentalStat;

class ProducerEnvironmentalStatsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Βρίσκουμε όλους τους παραγωγούς
        $producers = Producer::all();
        
        if ($producers->isEmpty()) {
            $this->command->info('Δεν υπάρχουν παραγωγοί για να προσθέσουμε περιβαλλοντικά στατιστικά. Παρακαλώ εκτελέστε πρώτα το ProducerSeeder.');
            return;
        }
        
        foreach ($producers as $producer) {
            $this->command->info("Προσθήκη περιβαλλοντικών στατιστικών για τον παραγωγό: {$producer->business_name}");
            
            // Δημιουργούμε τυχαία περιβαλλοντικά στατιστικά για κάθε παραγωγό
            ProducerEnvironmentalStat::create([
                'producer_id' => $producer->id,
                'distance' => rand(20, 100), // Απόσταση σε χιλιόμετρα
                'co2_saved' => round(rand(40, 120) / 100, 2), // CO2 που εξοικονομείται σε kg
                'water_saved' => rand(50, 200), // Νερό που εξοικονομείται σε λίτρα
                'packaging_saved' => round(rand(10, 50) / 100, 2) // Συσκευασία που εξοικονομείται σε kg
            ]);
        }
        
        $this->command->info('Τα περιβαλλοντικά στατιστικά των παραγωγών προστέθηκαν με επιτυχία!');
    }
}