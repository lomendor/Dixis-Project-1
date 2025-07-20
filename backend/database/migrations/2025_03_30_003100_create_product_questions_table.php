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
        Schema::create('product_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('products')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade'); // User asking
            $table->text('question');
            $table->text('answer')->nullable();
            $table->foreignId('answered_by_producer_id')->nullable()->constrained('producers')->onDelete('set null'); // Producer answering
            $table->boolean('is_public')->default(true); // As per ERD
            $table->timestamps();

            // Optional: Add index for faster lookup of questions per product
            $table->index('product_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_questions');
    }
};
