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
        Schema::create('adoptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('adoptable_item_id')->constrained()->onDelete('cascade');
            $table->unsignedBigInteger('adoption_plan_id');
            $table->string('status')->default('active'); // 'active', 'expired', 'cancelled'
            $table->date('start_date');
            $table->date('end_date');
            $table->decimal('price_paid', 10, 2);
            $table->string('payment_status')->default('pending'); // 'pending', 'paid', 'refunded'
            $table->string('certificate_number')->unique()->nullable();
            $table->string('certificate_file')->nullable(); // Path to the certificate file
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('adoptions');
    }
};
