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
        Schema::create('invoice_payments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id')->nullable();
            $table->foreignId('invoice_id')->constrained()->onDelete('cascade');
            $table->enum('payment_method', ['cash', 'bank_transfer', 'credit_card', 'stripe', 'paypal']);
            $table->decimal('amount', 10, 2);
            $table->string('currency', 3)->default('EUR');
            $table->timestamp('payment_date');
            $table->string('transaction_id')->nullable();
            $table->string('reference_number')->nullable();
            $table->text('notes')->nullable();
            $table->enum('status', ['pending', 'completed', 'failed', 'refunded'])->default('completed');
            $table->timestamps();

            // Indexes
            $table->index('invoice_id');
            $table->index(['payment_method', 'status']);
            $table->index('transaction_id');
            $table->index('tenant_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invoice_payments');
    }
};