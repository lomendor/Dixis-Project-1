<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('subscription_plans', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('target_type'); // producer, business
            $table->decimal('price', 10, 2);
            $table->string('billing_cycle'); // monthly, annually
            $table->integer('duration_months')->default(1);
            $table->decimal('commission_rate', 5, 2)->nullable(); // For producer plans
            $table->json('features')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Insert default subscription plans
        $this->insertDefaultPlans();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subscription_plans');
    }

    /**
     * Insert default subscription plans.
     */
    private function insertDefaultPlans(): void
    {
        $plans = [
            [
                'name' => 'Βασικό Πακέτο Παραγωγού',
                'target_type' => 'producer',
                'price' => 19.99,
                'billing_cycle' => 'monthly',
                'duration_months' => 1,
                'commission_rate' => 10.00,
                'features' => json_encode([
                    'Έως 20 προϊόντα',
                    'Βασική προβολή στην πλατφόρμα',
                    'Πρόσβαση στο dashboard παραγωγού',
                    'Email υποστήριξη',
                ]),
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Premium Πακέτο Παραγωγού',
                'target_type' => 'producer',
                'price' => 39.99,
                'billing_cycle' => 'monthly',
                'duration_months' => 1,
                'commission_rate' => 8.00,
                'features' => json_encode([
                    'Απεριόριστα προϊόντα',
                    'Προτεραιότητα στην αναζήτηση',
                    'Προβολή στην αρχική σελίδα',
                    'Πρόσβαση στο dashboard παραγωγού',
                    'Προτεραιότητα στην υποστήριξη',
                    'Τηλεφωνική υποστήριξη',
                ]),
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Ετήσιο Πακέτο Παραγωγού',
                'target_type' => 'producer',
                'price' => 199.99,
                'billing_cycle' => 'annually',
                'duration_months' => 12,
                'commission_rate' => 7.00,
                'features' => json_encode([
                    'Απεριόριστα προϊόντα',
                    'Προτεραιότητα στην αναζήτηση',
                    'Προβολή στην αρχική σελίδα',
                    'Πρόσβαση στο dashboard παραγωγού',
                    'Προτεραιότητα στην υποστήριξη',
                    'Τηλεφωνική υποστήριξη',
                    'Έκπτωση 2 μηνών',
                ]),
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Βασικό Πακέτο Επιχείρησης',
                'target_type' => 'business',
                'price' => 29.99,
                'billing_cycle' => 'monthly',
                'duration_months' => 1,
                'commission_rate' => null,
                'features' => json_encode([
                    'Πρόσβαση σε όλους τους παραγωγούς',
                    'Έως 10 παραγγελίες ανά μήνα',
                    'Βασική προτεραιότητα στις παραγγελίες',
                    'Email υποστήριξη',
                ]),
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Premium Πακέτο Επιχείρησης',
                'target_type' => 'business',
                'price' => 59.99,
                'billing_cycle' => 'monthly',
                'duration_months' => 1,
                'commission_rate' => null,
                'features' => json_encode([
                    'Πρόσβαση σε όλους τους παραγωγούς',
                    'Απεριόριστες παραγγελίες',
                    'Υψηλή προτεραιότητα στις παραγγελίες',
                    'Προτεραιότητα στην υποστήριξη',
                    'Τηλεφωνική υποστήριξη',
                    'Ειδικές τιμές για μεγάλες παραγγελίες',
                ]),
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Ετήσιο Πακέτο Επιχείρησης',
                'target_type' => 'business',
                'price' => 599.99,
                'billing_cycle' => 'annually',
                'duration_months' => 12,
                'commission_rate' => null,
                'features' => json_encode([
                    'Πρόσβαση σε όλους τους παραγωγούς',
                    'Απεριόριστες παραγγελίες',
                    'Υψηλή προτεραιότητα στις παραγγελίες',
                    'Προτεραιότητα στην υποστήριξη',
                    'Τηλεφωνική υποστήριξη',
                    'Ειδικές τιμές για μεγάλες παραγγελίες',
                    'Έκπτωση 2 μηνών',
                    'Προσωπικός σύμβουλος',
                ]),
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('subscription_plans')->insert($plans);
    }
};
