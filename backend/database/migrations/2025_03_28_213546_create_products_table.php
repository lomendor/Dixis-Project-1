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
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('producer_id')->constrained('producers')->onDelete('cascade');
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description');
            $table->string('short_description')->nullable();
            $table->decimal('price', 10, 2);
            $table->decimal('discount_price', 10, 2)->nullable();
            $table->integer('stock')->default(0);
            $table->string('sku')->nullable()->unique();
            $table->integer('weight_grams')->nullable();
            $table->json('dimensions')->nullable(); // Store dimensions as JSON { "length": x, "width": y, "height": z }
            $table->string('main_image')->nullable(); // Path to main image file
            $table->boolean('is_active')->default(true);
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_seasonal')->default(false);
            $table->date('season_start')->nullable();
            $table->date('season_end')->nullable();
            $table->boolean('is_limited_edition')->default(false);
            $table->integer('limited_quantity')->nullable();
            $table->boolean('allow_wishlist_notifications')->default(true);
            $table->json('attributes')->nullable(); // For storing flexible key-value attributes (e.g., certifications, origin details)
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
