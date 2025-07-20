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
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->onDelete('cascade');
            $table->foreignId('product_id')->constrained('products')->onDelete('cascade'); // Or set null if product can be deleted but order item remains? Check requirements. Cascade is simpler for now.
            $table->foreignId('producer_id')->constrained('producers')->onDelete('cascade'); // For easier lookup of which producer fulfills this item
            $table->integer('quantity');
            $table->decimal('price', 10, 2); // Price per unit at the time the order was placed
            $table->decimal('subtotal', 10, 2); // quantity * price
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_items');
    }
};
