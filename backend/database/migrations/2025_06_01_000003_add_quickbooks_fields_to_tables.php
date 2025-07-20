<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('quickbooks_customer_id')->nullable()->after('id');
            $table->timestamp('quickbooks_synced_at')->nullable();

            $table->index('quickbooks_customer_id');
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->string('quickbooks_invoice_id')->nullable()->after('id');
            $table->timestamp('quickbooks_synced_at')->nullable();

            $table->index('quickbooks_invoice_id');
        });

        Schema::table('products', function (Blueprint $table) {
            $table->string('quickbooks_item_id')->nullable()->after('id');
            $table->timestamp('quickbooks_synced_at')->nullable();

            $table->index('quickbooks_item_id');
        });
    }
    
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['quickbooks_customer_id', 'quickbooks_synced_at']);
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['quickbooks_invoice_id', 'quickbooks_synced_at']);
        });

        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['quickbooks_item_id', 'quickbooks_synced_at']);
        });
    }
};
