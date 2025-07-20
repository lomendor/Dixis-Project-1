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
        Schema::create('delivery_methods', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique(); // e.g., HOME, PICKUP, LOCKER
            $table->string('name'); // e.g., "Κατ' οίκον", "Παραλαβή από Σημείο", "Locker"
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('max_weight_grams')->nullable()->comment('Max chargeable weight in grams'); // Use integer grams
            $table->integer('max_length_cm')->nullable(); // Use integer cm
            $table->integer('max_width_cm')->nullable(); // Use integer cm
            $table->integer('max_height_cm')->nullable(); // Use integer cm
            $table->boolean('supports_cod')->default(true)->comment('Supports Cash on Delivery');
            // Default suitable to true, but should be set to false for LOCKER during seeding/config
            $table->boolean('suitable_for_perishable')->default(true);
            $table->boolean('suitable_for_fragile')->default(true);
            // No timestamps needed usually for definition tables
            // $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('delivery_methods');
    }
};
