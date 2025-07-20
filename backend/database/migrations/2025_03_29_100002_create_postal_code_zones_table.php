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
        Schema::create('postal_code_zones', function (Blueprint $table) {
            $table->id();
            // Using string for postal_code_prefix as it maps ranges (e.g., '101', '546')
            $table->string('postal_code_prefix')->unique(); // Each prefix belongs to exactly one zone
            $table->foreignId('shipping_zone_id')->constrained('shipping_zones')->cascadeOnDelete();
            // No timestamps needed usually for mapping tables unless tracking changes is required
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('postal_code_zones');
    }
};
