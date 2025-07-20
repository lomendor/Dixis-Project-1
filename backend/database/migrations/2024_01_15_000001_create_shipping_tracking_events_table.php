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
        Schema::create('shipping_tracking_events', function (Blueprint $table) {
            $table->id();
            $table->string('tracking_number');
            $table->string('provider'); // elta, acs, speedex, courier_center
            $table->string('event_type'); // picked_up, in_transit, out_for_delivery, delivered, etc.
            $table->string('event_description');
            $table->string('location')->nullable();
            $table->timestamp('event_timestamp');
            $table->json('raw_data')->nullable(); // Store original provider response
            $table->timestamps();
            
            // Indexes
            $table->index('tracking_number');
            $table->index('provider');
            $table->index('event_type');
            $table->index('event_timestamp');
            $table->index(['tracking_number', 'event_timestamp']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shipping_tracking_events');
    }
};
