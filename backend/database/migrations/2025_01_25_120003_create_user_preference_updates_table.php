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
        Schema::create('user_preference_updates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->enum('action', ['purchase', 'view', 'add_to_cart', 'add_to_wishlist', 'search_click']);
            $table->decimal('weight', 3, 2)->default(1.0); // Weight of this action for preference learning
            $table->json('context')->nullable(); // Additional context about the action
            $table->timestamp('created_at');

            // Indexes for ML model training
            $table->index(['user_id', 'created_at']);
            $table->index(['product_id', 'action']);
            $table->index(['action', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_preference_updates');
    }
};
