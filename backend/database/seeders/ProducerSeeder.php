<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Producer;
use Illuminate\Support\Str;

class ProducerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $producers = [
            [
                'name' => 'Ελαιώνες Καλαμάτας',
                'email' => 'info@elaioneskalamatas.gr',
                'city' => 'Καλαμάτα',
                'description' => 'Παραγωγή εξαιρετικού παρθένου ελαιόλαδου από τους ελαιώνες της Καλαμάτας.',
                'products' => ['Ελαιόλαδο', 'Ελιές Καλαμών'],
            ],
            [
                'name' => 'Αμπελώνες Νεμέας',
                'email' => 'info@ampelones-nemeas.gr',
                'city' => 'Νεμέα',
                'description' => 'Παραγωγή εκλεκτών κρασιών από τους αμπελώνες της Νεμέας.',
                'products' => ['Κρασί', 'Σταφύλια'],
            ],
            [
                'name' => 'Μελισσοκομείο Χαλκιδικής',
                'email' => 'info@melissokomeiochalkidikis.gr',
                'city' => 'Χαλκιδική',
                'description' => 'Παραγωγή εξαιρετικού μελιού από τα μελίσσια της Χαλκιδικής.',
                'products' => ['Μέλι', 'Γύρη'],
            ],
        ];

        foreach ($producers as $producerData) {
            // Create user
            $user = User::where('email', $producerData['email'])->first();

            if (!$user) {
                $user = User::create([
                    'name' => $producerData['name'],
                    'email' => $producerData['email'],
                    'password' => bcrypt('password'),
                    'email_verified_at' => now(),
                    'role' => 'producer',
                ]);

                // Producer role is already set in the user model

                // Create producer profile
                $producer = Producer::create([
                    'user_id' => $user->id,
                    'business_name' => $producerData['name'],
                    'city' => $producerData['city'],
                    'description' => $producerData['description'],
                ]);

                $this->command->info("Producer {$producerData['name']} created.");
            } else {
                $this->command->info("Producer {$producerData['name']} already exists.");
            }
        }
    }
}
