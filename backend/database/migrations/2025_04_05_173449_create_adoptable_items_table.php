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
        Schema::create('adoptable_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('producer_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description');
            $table->string('type'); // e.g., 'olive_tree', 'vineyard', 'beehive'
            $table->string('location');
            $table->string('status')->default('available'); // 'available', 'adopted', 'unavailable'
            $table->string('main_image')->nullable();
            $table->json('gallery_images')->nullable();
            $table->json('attributes')->nullable(); // e.g., age, variety, etc.
            $table->boolean('featured')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('adoptable_items');
    }
};
