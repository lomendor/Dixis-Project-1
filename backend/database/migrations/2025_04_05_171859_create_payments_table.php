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
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->onDelete('cascade');
            $table->string('transaction_id')->nullable()->unique();
            $table->enum('status', ['pending', 'processing', 'succeeded', 'failed'])->default('pending');
            $table->string('payment_gateway'); // 'stripe', 'paypal', 'bank_transfer', 'cod'
            $table->decimal('amount', 10, 2);
            $table->json('details')->nullable(); // Gateway response, etc.
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
