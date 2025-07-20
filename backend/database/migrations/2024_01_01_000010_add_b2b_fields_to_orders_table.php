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
        Schema::table('orders', function (Blueprint $table) {
            $table->foreignId('business_user_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('quote_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('contract_id')->nullable()->constrained()->onDelete('set null');
            $table->enum('order_type', ['b2c', 'b2b'])->default('b2c');
            $table->enum('payment_terms', ['immediate', 'net_7', 'net_15', 'net_30', 'net_45', 'net_60'])->nullable();
            $table->date('payment_due_date')->nullable();
            $table->decimal('credit_used', 10, 2)->default(0);
            $table->text('b2b_notes')->nullable();
            
            // Indexes
            $table->index('business_user_id');
            $table->index('order_type');
            $table->index('payment_due_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign(['business_user_id']);
            $table->dropForeign(['quote_id']);
            $table->dropForeign(['contract_id']);
            $table->dropColumn([
                'business_user_id',
                'quote_id',
                'contract_id',
                'order_type',
                'payment_terms',
                'payment_due_date',
                'credit_used',
                'b2b_notes'
            ]);
        });
    }
};
