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
        Schema::create('shipping_rates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shipping_zone_id')->constrained('shipping_zones')->cascadeOnDelete();
            $table->foreignId('weight_tier_id')->constrained('weight_tiers')->cascadeOnDelete(); // Use FK to weight_tiers
            $table->foreignId('delivery_method_id')->constrained('delivery_methods')->cascadeOnDelete(); // Use FK to delivery_methods
            $table->decimal('price', 10, 2); // Use 'price' as per ERD
            // extra_kg_cost is handled in a separate table 'extra_weight_charges'
            // No timestamps needed usually for definition tables
            // $table->timestamps();

            // Ensure combination is unique
            $table->unique(['shipping_zone_id', 'weight_tier_id', 'delivery_method_id'], 'shipping_rate_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shipping_rates');
    }
};
