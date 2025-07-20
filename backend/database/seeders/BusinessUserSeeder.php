<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Business;
use App\Models\Subscription;
use App\Models\SubscriptionPlan;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class BusinessUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create a test business user if it doesn't exist
        $testUserEmail = 'business@example.com';
        $user = User::where('email', $testUserEmail)->first();

        if (!$user) {
            $user = User::create([
                'name' => 'Test Business User',
                'email' => $testUserEmail,
                'password' => Hash::make('password'),
                'role' => 'business_user',
                'email_verified_at' => now(),
            ]);

            // Assign the business_user role
            $user->assignRole('business_user');

            $this->command->info('Test business user created.');

            // Create the associated business profile
            $business = $user->business()->create([
                'business_name' => 'Test Business',
                'tax_id' => 'BUS123456789',
                'tax_office' => 'Athens',
                'address' => '123 Business St',
                'city' => 'Athens',
                'postal_code' => '12345',
                'country' => 'Greece',
                'website' => 'https://testbusiness.example.com',
                'description' => 'A test business account for the Dixis platform.',
                'verified' => true,
            ]);

            $this->command->info('Business profile created for test user.');

            // Subscribe to the Basic plan
            $basicPlan = SubscriptionPlan::where('target_type', 'business')
                ->where('name', 'Basic')
                ->first();

            if ($basicPlan) {
                Subscription::create([
                    'plan_id' => $basicPlan->id,
                    'subscribable_type' => 'App\\Models\\Business',
                    'subscribable_id' => $business->id,
                    'status' => 'active',
                    'start_date' => now(),
                    'end_date' => now()->addYear(),
                    'auto_renew' => true,
                ]);

                $this->command->info('Subscription created for test business.');
            }
        } else {
            // Ensure existing test user has the business_user role and profile
            if ($user->role !== 'business_user') {
                $user->role = 'business_user';
                $user->save();
                $user->assignRole('business_user');
                $this->command->info('Updated existing test user role to business_user.');
            }

            if (!$user->business()->exists()) {
                $business = $user->business()->create([
                    'business_name' => 'Test Business',
                    'tax_id' => 'BUS123456789',
                    'tax_office' => 'Athens',
                    'address' => '123 Business St',
                    'city' => 'Athens',
                    'postal_code' => '12345',
                    'country' => 'Greece',
                    'website' => 'https://testbusiness.example.com',
                    'description' => 'A test business account for the Dixis platform.',
                    'verified' => true,
                ]);

                $this->command->info('Created missing business profile for existing test user.');

                // Subscribe to the Basic plan
                $basicPlan = SubscriptionPlan::where('target_type', 'business')
                    ->where('name', 'Basic')
                    ->first();

                if ($basicPlan) {
                    Subscription::create([
                        'plan_id' => $basicPlan->id,
                        'subscribable_type' => 'App\\Models\\Business',
                        'subscribable_id' => $business->id,
                        'status' => 'active',
                        'start_date' => now(),
                        'end_date' => now()->addYear(),
                        'auto_renew' => true,
                    ]);

                    $this->command->info('Subscription created for test business.');
                }
            } else {
                $this->command->info('Test business user already exists with profile.');
            }
        }
    }
}
