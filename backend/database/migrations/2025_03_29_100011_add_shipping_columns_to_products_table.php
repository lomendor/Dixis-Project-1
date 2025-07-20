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
        Schema::table('products', function (Blueprint $table) {
            // Add dimensions after 'weight_grams' or similar column
            $table->unsignedInteger('length_cm')->nullable()->after('weight_grams');
            $table->unsignedInteger('width_cm')->nullable()->after('length_cm');
            $table->unsignedInteger('height_cm')->nullable()->after('width_cm');
            // Add flags after 'is_active' or similar column
            $table->boolean('is_perishable')->default(false)->after('is_active');
            $table->boolean('is_fragile')->default(false)->after('is_perishable');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            // Drop columns in reverse order of addition
            $table->dropColumn(['is_fragile', 'is_perishable', 'height_cm', 'width_cm', 'length_cm']);
        });
    }
};