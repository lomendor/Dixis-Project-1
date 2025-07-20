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
        Schema::create('producer_shipping_rates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('producer_id')->constrained('producers')->cascadeOnDelete();
            $table->foreignId('shipping_zone_id')->constrained('shipping_zones')->cascadeOnDelete();
            $table->foreignId('weight_tier_id')->constrained('weight_tiers')->cascadeOnDelete(); // Use FK to weight_tiers
            $table->foreignId('delivery_method_id')->constrained('delivery_methods')->cascadeOnDelete(); // Use FK to delivery_methods
            // Producer override price should not be nullable. If they want default, they don't add an override.
            $table->decimal('price', 10, 2); // Use 'price' as per ERD
            // extra_kg_cost is handled in 'extra_weight_charges' or potentially a producer-specific override table if needed later
            // $table->timestamps(); // Optional

            // Ensure combination is unique for a producer
            $table->unique([
                'producer_id',
                'shipping_zone_id',
                'weight_tier_id',
                'delivery_method_id'
            ], 'producer_shipping_rate_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('producer_shipping_rates');
    }
};
