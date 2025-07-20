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
        Schema::create('contracts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->nullable()->constrained()->onDelete('cascade');
            $table->foreignId('business_user_id')->constrained()->onDelete('cascade');
            $table->string('contract_number')->unique();
            $table->string('title');
            $table->text('description')->nullable();
            $table->enum('type', ['supply', 'distribution', 'exclusive', 'volume', 'seasonal'])->default('supply');
            $table->enum('status', ['draft', 'pending', 'active', 'expired', 'terminated', 'suspended'])->default('draft');
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->boolean('auto_renewal')->default(false);
            $table->enum('renewal_period', ['monthly', 'quarterly', 'yearly'])->default('yearly');
            $table->decimal('minimum_order_value', 10, 2)->nullable();
            $table->decimal('maximum_order_value', 10, 2)->nullable();
            $table->decimal('discount_percentage', 5, 2)->default(0);
            $table->enum('payment_terms', ['immediate', 'net_7', 'net_15', 'net_30', 'net_45', 'net_60'])->default('net_30');
            $table->string('delivery_terms')->nullable();
            $table->text('terms_and_conditions')->nullable();
            $table->text('special_conditions')->nullable();
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('signed_at')->nullable();
            $table->timestamp('activated_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes
            $table->index(['business_user_id', 'status']);
            $table->index('status');
            $table->index(['start_date', 'end_date']);
            $table->index('type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('contracts');
    }
};
