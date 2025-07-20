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
        Schema::create('user_product_interactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->decimal('rating', 3, 2)->default(1.0); // Implicit rating based on interactions
            $table->integer('interaction_count')->default(1);
            $table->timestamp('last_interaction');
            $table->timestamps();

            // Unique constraint to prevent duplicates
            $table->unique(['user_id', 'product_id']);
            
            // Indexes for performance
            $table->index(['user_id', 'rating']);
            $table->index(['product_id', 'rating']);
            $table->index(['last_interaction']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_product_interactions');
    }
};
