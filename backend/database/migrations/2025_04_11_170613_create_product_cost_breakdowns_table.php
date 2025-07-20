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
        Schema::create('product_cost_breakdowns', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->decimal('producer_cost', 10, 2)->nullable()->comment('Production cost for the producer');
            $table->decimal('packaging_cost', 10, 2)->nullable()->comment('Cost of packaging');
            $table->decimal('producer_profit_target', 10, 2)->nullable()->comment('Target profit for the producer');
            $table->decimal('platform_fee_percentage', 5, 2)->nullable()->comment('Platform fee percentage');
            $table->decimal('shipping_estimate', 10, 2)->nullable()->comment('Estimated shipping cost');
            $table->decimal('taxes_estimate', 10, 2)->nullable()->comment('Estimated taxes');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_cost_breakdowns');
    }
};
