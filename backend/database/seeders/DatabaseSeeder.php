<?php

namespace Database\Seeders;

use App\Models\User;
use Database\Seeders\WeightTierSeeder; // Import the weight tier seeder
use Database\Seeders\RolesAndPermissionsSeeder; // Import the roles and permissions seeder
use Database\Seeders\ShippingRatesSeeder; // Import the shipping rates seeder
use Database\Seeders\SubscriptionPlansSeeder; // Import the subscription plans seeder
use Database\Seeders\PostalCodeZonesSeeder; // Import the postal code zones seeder
use Database\Seeders\ShippingZonesSeeder; // Import the shipping zones seeder
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Call other seeders needed for basic functionality
        $this->call([
            ShippingZonesSeeder::class, // Add the shipping zones seeder
            DeliveryMethodSeeder::class,
            WeightTierSeeder::class, // Add the weight tier seeder
            PostalCodeZonesSeeder::class, // Add the postal code zones seeder
            ShippingRatesSeeder::class, // Add the shipping rates seeder
            RolesAndPermissionsSeeder::class, // Add the roles and permissions seeder
            UserSeeder::class, // Add the user seeder
            ProductCategorySeeder::class, // Add the product categories seeder
            ProductAttributeSeeder::class, // Add the product attributes seeder
            ProducerSeeder::class, // Add the producer seeder
            AdoptionSeeder::class, // Add the adoption seeder
            SubscriptionPlansSeeder::class, // Add the subscription plans seeder
            BusinessUserSeeder::class, // Add the business user seeder
            TestDataSeeder::class, // Add test data seeder
            // Νέοι seeders για τα νέα χαρακτηριστικά της σελίδας παραγωγού
            ProducerMediaSeeder::class,
            ProducerQuestionsSeeder::class,
            ProducerEnvironmentalStatsSeeder::class,
            ProductSeasonalitySeeder::class,
            // Add other essential seeders here if needed in the future
        ]);

         // Create a default test producer user if it doesn't exist
         $testUserEmail = 'test@example.com';
         $user = User::where('email', $testUserEmail)->first();

         if (!$user) {
             $user = User::factory()->create([
                 'name' => 'Test Producer User',
                 'email' => $testUserEmail,
                 'role' => 'producer', // Explicitly set role to producer
                 'email_verified_at' => now(), // Ensure email is verified
             ]);
             $this->command->info('Test producer user created.');

             // Create the associated producer profile
             $user->producer()->create([
                 'business_name' => 'Test Producer', // Corrected column name
                 // 'is_active' => true, // Removed is_active as column might not exist or has default
                 // Add other necessary default fields for the producer profile if they exist
             ]);
             $this->command->info('Producer profile created for test user.');

         } else {
             // Ensure existing test user has the producer role and profile
             if ($user->role !== 'producer') {
                 $user->role = 'producer';
                 $user->save();
                 $this->command->info('Updated existing test user role to producer.');
             }
             if (!$user->producer()->exists()) {
                 $user->producer()->create([
                     'business_name' => 'Test Producer', // Corrected column name
                     // 'is_active' => true, // Removed is_active as column might not exist or has default
                 ]);
                 $this->command->info('Created missing producer profile for existing test user.');
             } else {
                 $this->command->info('Test producer user already exists with profile.');
             }
         }
    }
}
