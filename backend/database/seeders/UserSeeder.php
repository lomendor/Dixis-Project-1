<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create admin user
        $admin = User::where('email', 'admin@dixis.io')->first();
        if (!$admin) {
            $admin = User::create([
                'name' => 'Admin',
                'email' => 'admin@dixis.io',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'role' => 'admin',
            ]);
            
            // Assign admin role
            $admin->assignRole('admin');
            
            $this->command->info('Admin user created.');
        } else {
            $this->command->info('Admin user already exists.');
        }
        
        // Create producer user
        $producer = User::where('email', 'producer@dixis.io')->first();
        if (!$producer) {
            $producer = User::create([
                'name' => 'Producer',
                'email' => 'producer@dixis.io',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'role' => 'producer',
            ]);
            
            // Assign producer role
            $producer->assignRole('producer');
            
            // Create producer profile
            $producer->producer()->create([
                'business_name' => 'Test Producer',
                'city' => 'Athens',
                'description' => 'This is a test producer account.',
                'verified' => true,
            ]);
            
            $this->command->info('Producer user created.');
        } else {
            $this->command->info('Producer user already exists.');
        }
        
        // Create consumer user
        $consumer = User::where('email', 'consumer@dixis.io')->first();
        if (!$consumer) {
            $consumer = User::create([
                'name' => 'Consumer',
                'email' => 'consumer@dixis.io',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'role' => 'consumer',
            ]);
            
            // Assign consumer role
            $consumer->assignRole('consumer');
            
            $this->command->info('Consumer user created.');
        } else {
            $this->command->info('Consumer user already exists.');
        }
    }
}
