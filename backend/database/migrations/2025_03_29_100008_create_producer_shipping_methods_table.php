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
        Schema::create('producer_shipping_methods', function (Blueprint $table) {
            $table->id();
            $table->foreignId('producer_id')->constrained('producers')->cascadeOnDelete();
            $table->foreignId('delivery_method_id')->constrained('delivery_methods')->cascadeOnDelete(); // Use FK to delivery_methods
            $table->boolean('is_enabled')->default(true);
            // $table->timestamps(); // Optional: if you want to track when methods were enabled/disabled

            // Ensure a producer can only have one entry per delivery method
            // Provide a shorter custom name for the unique index to avoid exceeding length limits
            $table->unique(['producer_id', 'delivery_method_id'], 'producer_method_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('producer_shipping_methods', function (Blueprint $table) {
            // Drop foreign key constraint first if it exists
            // The default constraint name follows the pattern: table_column_foreign
            $table->dropForeign(['producer_id']);
            // You might need to drop the index as well if named explicitly
            // $table->dropIndex('your_index_name');
        });
        Schema::dropIfExists('producer_shipping_methods');
    }
};
