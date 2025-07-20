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
        // Add tenant_id to users table
        if (Schema::hasTable('users') && !Schema::hasColumn('users', 'tenant_id')) {
            Schema::table('users', function (Blueprint $table) {
                $table->foreignId('tenant_id')->nullable()->constrained()->onDelete('set null');
                $table->index('tenant_id');
            });
        }

        // Add tenant_id to products table
        if (Schema::hasTable('products') && !Schema::hasColumn('products', 'tenant_id')) {
            Schema::table('products', function (Blueprint $table) {
                $table->foreignId('tenant_id')->nullable()->constrained()->onDelete('cascade');
                $table->index('tenant_id');
            });
        }

        // Add tenant_id to categories table
        if (Schema::hasTable('categories') && !Schema::hasColumn('categories', 'tenant_id')) {
            Schema::table('categories', function (Blueprint $table) {
                $table->foreignId('tenant_id')->nullable()->constrained()->onDelete('cascade');
                $table->index('tenant_id');
            });
        }

        // Add tenant_id to orders table
        if (Schema::hasTable('orders') && !Schema::hasColumn('orders', 'tenant_id')) {
            Schema::table('orders', function (Blueprint $table) {
                $table->foreignId('tenant_id')->nullable()->constrained()->onDelete('cascade');
                $table->index('tenant_id');
            });
        }

        // Add tenant_id to producers table
        if (Schema::hasTable('producers') && !Schema::hasColumn('producers', 'tenant_id')) {
            Schema::table('producers', function (Blueprint $table) {
                $table->foreignId('tenant_id')->nullable()->constrained()->onDelete('cascade');
                $table->index('tenant_id');
            });
        }

        // Add tenant_id to carts table
        if (Schema::hasTable('carts') && !Schema::hasColumn('carts', 'tenant_id')) {
            Schema::table('carts', function (Blueprint $table) {
                $table->foreignId('tenant_id')->nullable()->constrained()->onDelete('cascade');
                $table->index('tenant_id');
            });
        }

        // Add tenant_id to reviews table
        if (Schema::hasTable('reviews') && !Schema::hasColumn('reviews', 'tenant_id')) {
            Schema::table('reviews', function (Blueprint $table) {
                $table->foreignId('tenant_id')->nullable()->constrained()->onDelete('cascade');
                $table->index('tenant_id');
            });
        }

        // Add tenant_id to shipping_rates table
        if (Schema::hasTable('shipping_rates') && !Schema::hasColumn('shipping_rates', 'tenant_id')) {
            Schema::table('shipping_rates', function (Blueprint $table) {
                $table->foreignId('tenant_id')->nullable()->constrained()->onDelete('cascade');
                $table->index('tenant_id');
            });
        }

        // Add tenant_id to coupons table
        if (Schema::hasTable('coupons') && !Schema::hasColumn('coupons', 'tenant_id')) {
            Schema::table('coupons', function (Blueprint $table) {
                $table->foreignId('tenant_id')->nullable()->constrained()->onDelete('cascade');
                $table->index('tenant_id');
            });
        }

        // Add tenant_id to notifications table
        if (Schema::hasTable('notifications') && !Schema::hasColumn('notifications', 'tenant_id')) {
            Schema::table('notifications', function (Blueprint $table) {
                $table->foreignId('tenant_id')->nullable()->constrained()->onDelete('cascade');
                $table->index('tenant_id');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $tables = [
            'users', 'products', 'categories', 'orders', 'producers', 
            'carts', 'reviews', 'shipping_rates', 'coupons', 'notifications'
        ];

        foreach ($tables as $table) {
            if (Schema::hasTable($table) && Schema::hasColumn($table, 'tenant_id')) {
                Schema::table($table, function (Blueprint $table) {
                    $table->dropForeign(['tenant_id']);
                    $table->dropColumn('tenant_id');
                });
            }
        }
    }
};
