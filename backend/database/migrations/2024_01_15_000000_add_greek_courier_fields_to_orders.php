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
            // Greek courier integration fields
            $table->string('shipping_provider')->nullable()->after('shipping_cost');
            $table->string('tracking_number')->nullable()->after('shipping_provider');
            $table->string('shipping_service_type')->default('standard')->after('tracking_number');
            $table->decimal('actual_shipping_cost', 8, 2)->nullable()->after('shipping_service_type');
            $table->timestamp('shipped_at')->nullable()->after('actual_shipping_cost');
            $table->timestamp('delivered_at')->nullable()->after('shipped_at');
            $table->json('shipping_metadata')->nullable()->after('delivered_at');
            
            // Indexes for better performance
            $table->index('shipping_provider');
            $table->index('tracking_number');
            $table->index('shipped_at');
            $table->index('delivered_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndex(['shipping_provider']);
            $table->dropIndex(['tracking_number']);
            $table->dropIndex(['shipped_at']);
            $table->dropIndex(['delivered_at']);
            
            $table->dropColumn([
                'shipping_provider',
                'tracking_number',
                'shipping_service_type',
                'actual_shipping_cost',
                'shipped_at',
                'delivered_at',
                'shipping_metadata'
            ]);
        });
    }
};
