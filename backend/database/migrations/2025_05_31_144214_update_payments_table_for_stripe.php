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
        Schema::table('payments', function (Blueprint $table) {
            // Add Stripe-specific fields
            $table->string('stripe_payment_intent_id')->nullable()->unique()->after('transaction_id');
            $table->string('currency', 3)->default('EUR')->after('amount');
            
            // Rename details to stripe_data for clarity
            $table->renameColumn('details', 'stripe_data');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropColumn(['stripe_payment_intent_id', 'currency']);
            $table->renameColumn('stripe_data', 'details');
        });
    }
};
