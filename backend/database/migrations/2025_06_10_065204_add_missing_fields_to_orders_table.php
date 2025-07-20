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
        Schema::table('orders', function (Blueprint $table) {
            $table->string('order_number')->unique()->after('id');
            $table->decimal('subtotal', 10, 2)->after('total_amount');
            $table->string('shipping_method')->after('shipping_cost');
            $table->timestamp('shipped_at')->nullable()->after('notes');
            $table->timestamp('delivered_at')->nullable()->after('shipped_at');
            $table->string('tracking_number')->nullable()->after('delivered_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['order_number', 'subtotal', 'shipping_method', 'shipped_at', 'delivered_at', 'tracking_number']);
        });
    }
};
