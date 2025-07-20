<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\ProducerProfile;
use Illuminate\Support\Facades\Hash;

class TestProducerSeeder extends Seeder
{
    public function run()
    {
        // Create a test producer user
        $user = User::create([
            'name' => 'Γιάννης Παπαδόπουλος',
            'email' => 'test.producer@dixisfresh.gr',
            'password' => Hash::make('password123'),
            'role' => 'producer',
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        // Assign producer role
        $user->assignRole('producer');

        // Create producer profile
        ProducerProfile::create([
            'user_id' => $user->id,
            'business_name' => 'Βιολογικά Προϊόντα Κρήτης',
            'tax_number' => 'EL123456789',
            'description' => 'Παραδοσιακός παραγωγός βιολογικών προϊόντων από την Κρήτη με εμπειρία 20 ετών.',
            'location_address' => 'Αγίου Τίτου 15',
            'location_city' => 'Ηράκλειο',
            'location_region' => 'Κρήτη',
            'location_postal_code' => '71202',
            'specialties' => json_encode(['olive_oil', 'honey', 'herbs', 'traditional']),
            'verification_status' => 'verified',
            'trust_level' => 'premium',
        ]);

        $this->command->info('Test producer created successfully!');
        $this->command->info('Email: test.producer@dixisfresh.gr');
        $this->command->info('Password: password123');
    }
}