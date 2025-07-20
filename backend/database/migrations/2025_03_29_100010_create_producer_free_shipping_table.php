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
        Schema::create('producer_free_shipping', function (Blueprint $table) {
            $table->id();
            $table->foreignId('producer_id')->constrained('producers')->cascadeOnDelete();
            // Allow zone and method ID to be null for a general threshold for the producer
            $table->foreignId('shipping_zone_id')->nullable()->constrained('shipping_zones')->cascadeOnDelete();
            $table->foreignId('delivery_method_id')->nullable()->constrained('delivery_methods')->cascadeOnDelete(); // Use FK to delivery_methods
            // The minimum order value (of this producer's items) for free shipping
            $table->decimal('free_shipping_threshold', 10, 2); // Use 'free_shipping_threshold' as per specs
            $table->boolean('is_active')->default(true);
            // $table->timestamps(); // Optional

            // Unique constraint to avoid duplicate rules
            $table->unique([
                'producer_id',
                'shipping_zone_id',
                'delivery_method_id'
            ], 'producer_free_shipping_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('producer_free_shipping');
    }
};
