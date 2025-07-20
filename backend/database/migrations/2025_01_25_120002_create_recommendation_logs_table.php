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
        Schema::create('recommendation_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->json('product_ids'); // Array of recommended product IDs
            $table->string('algorithm', 50); // ml_hybrid, collaborative, content_based, etc.
            $table->string('context', 100)->nullable(); // product_page, homepage, search, etc.
            $table->json('metadata')->nullable(); // Additional context data
            $table->timestamp('served_at');
            $table->timestamp('clicked_at')->nullable(); // When user clicked a recommendation
            $table->integer('clicked_product_id')->nullable(); // Which product was clicked
            $table->integer('position_clicked')->nullable(); // Position of clicked product
            $table->timestamps();

            // Indexes for analytics
            $table->index(['user_id', 'served_at']);
            $table->index(['algorithm', 'served_at']);
            $table->index(['context', 'served_at']);
            $table->index(['clicked_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('recommendation_logs');
    }
};
