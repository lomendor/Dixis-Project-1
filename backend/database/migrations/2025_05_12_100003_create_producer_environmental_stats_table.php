<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('producer_environmental_stats', function (Blueprint $table) {
            $table->id();
            $table->foreignId('producer_id')->constrained()->onDelete('cascade');
            $table->decimal('distance', 10, 2)->comment('Average distance in km');
            $table->decimal('co2_saved', 10, 2)->comment('CO2 saved in kg per kg of product');
            $table->decimal('water_saved', 10, 2)->comment('Water saved in liters per kg of product');
            $table->decimal('packaging_saved', 10, 2)->comment('Packaging saved in kg per kg of product');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('producer_environmental_stats');
    }
};
