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
        Schema::table('producers', function (Blueprint $table) {
            // Add column after 'rating' or similar column
            $table->boolean('uses_custom_shipping_rates')->default(false)->after('rating');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('producers', function (Blueprint $table) {
            $table->dropColumn('uses_custom_shipping_rates');
        });
    }
};