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
        Schema::table('shipping_rates', function (Blueprint $table) {
            // Add column for multi-producer discount percentage
            $table->decimal('multi_producer_discount', 5, 2)->nullable()->default(null)
                  ->comment('Discount percentage (0-100) to apply when multiple producers are in the same order');

            // Add column for minimum producers required for discount
            $table->unsignedTinyInteger('min_producers_for_discount')->nullable()->default(null)
                  ->comment('Minimum number of producers required in order to apply the discount');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('shipping_rates', function (Blueprint $table) {
            $table->dropColumn('multi_producer_discount');
            $table->dropColumn('min_producers_for_discount');
        });
    }
};
