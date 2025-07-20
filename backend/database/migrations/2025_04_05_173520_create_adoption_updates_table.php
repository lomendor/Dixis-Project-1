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
        Schema::create('adoption_updates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('adoption_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->text('content');
            $table->json('images')->nullable();
            $table->string('status')->default('published'); // 'draft', 'published'
            $table->boolean('notify_adopter')->default(true);
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('adoption_updates');
    }
};
