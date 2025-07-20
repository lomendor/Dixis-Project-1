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
        // This table IS needed as per Tran Cost.md section 6, since extra_kg_rate was removed from shipping_rates.
        Schema::create('extra_weight_charges', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shipping_zone_id')->constrained('shipping_zones')->cascadeOnDelete();
            $table->foreignId('delivery_method_id')->constrained('delivery_methods')->cascadeOnDelete();
            // Price per additional KG (or fraction thereof) above the highest weight tier (e.g., >10kg)
            $table->decimal('price_per_kg', 10, 2);
            // No timestamps needed usually for definition tables
            // $table->timestamps();

            // Ensure combination is unique
            $table->unique(['shipping_zone_id', 'delivery_method_id'], 'extra_weight_charge_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('extra_weight_charges');
    }
};
