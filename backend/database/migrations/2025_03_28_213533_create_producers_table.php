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
        Schema::create('producers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->onDelete('cascade'); // Foreign key to users table
            $table->string('business_name');
            $table->string('tax_id')->nullable(); // ΑΦΜ
            $table->string('tax_office')->nullable(); // ΔΟΥ
            $table->text('description')->nullable();
            $table->string('address')->nullable();
            $table->string('city')->nullable();
            $table->string('postal_code')->nullable();
            $table->string('region')->nullable();
            $table->string('logo')->nullable(); // Path to logo file
            $table->string('cover_image')->nullable(); // Path to cover image file
            $table->string('website')->nullable();
            $table->json('social_media')->nullable(); // Store social media links as JSON
            $table->text('bio')->nullable(); // Producer's story/bio
            $table->boolean('verified')->default(false);
            $table->decimal('rating', 3, 2)->nullable(); // Average rating (e.g., 4.75)
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('producers');
    }
};
