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
        Schema::create('user_behavior_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->string('session_id', 100)->index();
            $table->enum('event_type', [
                'product_view',
                'category_view', 
                'producer_view',
                'search',
                'search_click',
                'add_to_cart',
                'remove_from_cart',
                'add_to_wishlist',
                'remove_from_wishlist',
                'purchase',
                'page_view',
                'click',
                'scroll',
                'time_on_page'
            ])->index();
            
            // Product/Category/Producer references
            $table->foreignId('product_id')->nullable()->constrained()->onDelete('cascade');
            $table->foreignId('category_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('producer_id')->nullable()->constrained()->onDelete('set null');
            
            // Search and navigation data
            $table->string('search_query', 500)->nullable()->index();
            $table->string('page_url', 1000)->nullable();
            $table->string('referrer', 1000)->nullable();
            
            // Technical data
            $table->string('user_agent', 500)->nullable();
            $table->ipAddress('ip_address')->nullable();
            $table->string('device_type', 50)->nullable();
            $table->string('browser', 100)->nullable();
            $table->string('os', 100)->nullable();
            
            // Event metadata (JSON for flexibility)
            $table->json('metadata')->nullable();
            
            // Timestamps
            $table->timestamp('created_at')->index();
            
            // Indexes for performance
            $table->index(['user_id', 'created_at']);
            $table->index(['session_id', 'created_at']);
            $table->index(['event_type', 'created_at']);
            $table->index(['product_id', 'event_type', 'created_at']);
            $table->index(['created_at', 'event_type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_behavior_events');
    }
};
