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
            $table->boolean('b2b_available')->default(false);
            $table->decimal('wholesale_price', 10, 2)->nullable();
            $table->integer('min_order_quantity')->default(1);
            $table->integer('max_order_quantity')->nullable();
            $table->decimal('bulk_discount_threshold', 10, 2)->nullable();
            $table->decimal('bulk_discount_percentage', 5, 2)->nullable();
            $table->text('b2b_description')->nullable();
            $table->json('b2b_specifications')->nullable();
            
            // Indexes
            $table->index('b2b_available');
            $table->index('min_order_quantity');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn([
                'b2b_available',
                'wholesale_price',
                'min_order_quantity',
                'max_order_quantity',
                'bulk_discount_threshold',
                'bulk_discount_percentage',
                'b2b_description',
                'b2b_specifications'
            ]);
        });
    }
};
