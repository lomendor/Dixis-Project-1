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
        Schema::create('subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('plan_id')->constrained('subscription_plans');
            $table->morphs('subscribable'); // For Producer or Business
            $table->string('status'); // active, pending, cancelled, expired
            $table->timestamp('start_date');
            $table->timestamp('end_date')->nullable();
            $table->boolean('auto_renew')->default(true);
            $table->foreignId('payment_id')->nullable()->constrained('payments');
            $table->timestamp('last_payment_date')->nullable();
            $table->timestamp('next_payment_date')->nullable();
            $table->text('cancellation_reason')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subscriptions');
    }
};
