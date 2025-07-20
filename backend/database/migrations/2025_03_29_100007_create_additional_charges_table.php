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
        Schema::create('additional_charges', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique(); // e.g., COD (Cash on Delivery)
            $table->string('name'); // e.g., "Αντικαταβολή"
            $table->text('description')->nullable();
            $table->decimal('price', 10, 2);
            $table->boolean('is_percentage')->default(false); // Is the price a percentage or fixed amount?
            $table->boolean('is_active')->default(true);
            // $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('additional_charges');
    }
};