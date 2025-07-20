<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Producer;
use App\Models\ProducerMedia;

class ProducerMediaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Βρίσκουμε όλους τους παραγωγούς
        $producers = Producer::all();
        
        if ($producers->isEmpty()) {
            $this->command->info('Δεν υπάρχουν παραγωγοί για να προσθέσουμε media. Παρακαλώ εκτελέστε πρώτα το ProducerSeeder.');
            return;
        }
        
        // Δοκιμαστικά δεδομένα για media
        $mediaItems = [
            [
                'type' => 'image',
                'file_path' => 'producers/media/farm1.jpg',
                'title' => 'Η φάρμα μας',
                'description' => 'Μια εικόνα από τη φάρμα μας στους πρόποδες του βουνού.',
                'order' => 1
            ],
            [
                'type' => 'image',
                'file_path' => 'producers/media/harvesting.jpg',
                'title' => 'Διαδικασία Συγκομιδής',
                'description' => 'Συγκομιδή των προϊόντων μας με το χέρι για καλύτερη ποιότητα.',
                'order' => 2
            ],
            [
                'type' => 'video',
                'file_path' => 'producers/media/farm_tour.mp4',
                'title' => 'Περιήγηση στη Φάρμα',
                'description' => 'Μια σύντομη περιήγηση στις εγκαταστάσεις της φάρμας μας.',
                'order' => 3
            ],
            [
                'type' => 'image',
                'file_path' => 'producers/media/products.jpg',
                'title' => 'Τα Προϊόντα μας',
                'description' => 'Μια συλλογή από τα φρέσκα προϊόντα μας μετά τη συγκομιδή.',
                'order' => 4
            ],
            [
                'type' => 'image',
                'file_path' => 'producers/media/sustainable.jpg',
                'title' => 'Βιώσιμες Πρακτικές',
                'description' => 'Οι βιώσιμες πρακτικές που χρησιμοποιούμε για την καλλιέργεια των προϊόντων μας.',
                'order' => 5
            ]
        ];
        
        foreach ($producers as $producer) {
            $this->command->info("Προσθήκη media για τον παραγωγό: {$producer->business_name}");
            
            // Για κάθε παραγωγό προσθέτουμε όλα τα media items
            foreach ($mediaItems as $item) {
                ProducerMedia::create([
                    'producer_id' => $producer->id,
                    'type' => $item['type'],
                    'file_path' => $item['file_path'],
                    'title' => $item['title'],
                    'description' => $item['description'],
                    'order' => $item['order']
                ]);
            }
        }
        
        $this->command->info('Τα Media των παραγωγών προστέθηκαν με επιτυχία!');
    }
}