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
        Schema::create('weight_tiers', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique(); // e.g., TIER_2KG, TIER_5KG, TIER_10KG
            $table->integer('min_weight_grams'); // Use integer grams as per specs
            $table->integer('max_weight_grams');
            $table->string('description')->nullable();
            // No timestamps needed usually for definition tables
            // $table->timestamps();

            // Optional: Add constraint to ensure min_weight < max_weight if DB supports it easily,
            // otherwise handle in application logic/validation.
            // Ensure tiers don't overlap exactly
            $table->unique(['min_weight_grams', 'max_weight_grams']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('weight_tiers');
    }
};
