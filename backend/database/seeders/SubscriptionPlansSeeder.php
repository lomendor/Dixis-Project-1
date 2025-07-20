<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\SubscriptionPlan;

class SubscriptionPlansSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Delete existing subscription plans
        SubscriptionPlan::truncate();

        // Business Subscription Plans
        SubscriptionPlan::create([
            'name' => 'Basic',
            'target_type' => 'business',
            'price' => 0,
            'billing_cycle' => 'annually',
            'duration_months' => 12,
            'commission_rate' => 3.5,
            'features' => [
                'Πρόσβαση σε όλα τα προϊόντα',
                'Βασικό dashboard',
                'Προμήθεια 3.5% στις πωλήσεις',
                'Email υποστήριξη'
            ],
            'is_active' => true,
        ]);

        SubscriptionPlan::create([
            'name' => 'Professional',
            'target_type' => 'business',
            'price' => 99.99,
            'billing_cycle' => 'annually',
            'duration_months' => 12,
            'commission_rate' => 0,
            'features' => [
                'Όλα τα οφέλη του Basic',
                'Προμήθεια 0% στις πωλήσεις',
                'Προτεραιότητα στην εξυπηρέτηση',
                'Αναλυτικά στατιστικά',
                'Προσαρμοσμένες τιμές'
            ],
            'is_active' => true,
        ]);

        SubscriptionPlan::create([
            'name' => 'Premium',
            'target_type' => 'business',
            'price' => 199.99,
            'billing_cycle' => 'annually',
            'duration_months' => 12,
            'commission_rate' => 0,
            'features' => [
                'Όλα τα οφέλη του Professional',
                'Προμήθεια 0% στις πωλήσεις',
                'Προσωπικός account manager',
                'Προτεραιότητα στις παραγγελίες',
                'Προσαρμοσμένες αναφορές',
                'Πρόσβαση σε αποκλειστικά προϊόντα'
            ],
            'is_active' => true,
        ]);

        // Producer Subscription Plans
        SubscriptionPlan::create([
            'name' => 'Free',
            'target_type' => 'producer',
            'price' => 0,
            'billing_cycle' => 'annually',
            'duration_months' => 12,
            'commission_rate' => 7,
            'features' => [
                'Βασική πρόσβαση στην πλατφόρμα',
                'Προμήθεια 7% στις πωλήσεις',
                'Περιορισμένος αριθμός προϊόντων',
                'Βασικά στατιστικά'
            ],
            'is_active' => true,
        ]);

        SubscriptionPlan::create([
            'name' => 'Plus',
            'target_type' => 'producer',
            'price' => 70,
            'billing_cycle' => 'annually',
            'duration_months' => 12,
            'commission_rate' => 5,
            'features' => [
                'Μειωμένη προμήθεια 5% στις πωλήσεις',
                'Βασικά analytics',
                'Περισσότερα προϊόντα/φωτογραφίες',
                'Προτεραιότητα στην εμφάνιση αποτελεσμάτων'
            ],
            'is_active' => true,
        ]);

        SubscriptionPlan::create([
            'name' => 'Pro',
            'target_type' => 'producer',
            'price' => 180,
            'billing_cycle' => 'annually',
            'duration_months' => 12,
            'commission_rate' => 3,
            'features' => [
                'Μειωμένη προμήθεια 3% στις πωλήσεις',
                'Προηγμένα analytics',
                'Εργαλεία προώθησης',
                'Προτεραιότητα υποστήριξης',
                'Απεριόριστα προϊόντα και φωτογραφίες',
                'Προβολή στην αρχική σελίδα'
            ],
            'is_active' => true,
        ]);
    }
}
