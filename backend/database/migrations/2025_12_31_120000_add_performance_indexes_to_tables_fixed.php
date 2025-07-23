<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Adds performance indexes to frequently queried tables for B2B production optimization.
     * Target: <200ms API response time, 1000+ concurrent users
     * Fixed version: Only creates indexes for existing tables and columns
     */
    public function up(): void
    {
        // Check if indexes already exist before creating them
        $this->createIndexIfNotExists('products', 'producer_id', 'idx_products_producer_id');
        $this->createIndexIfNotExists('products', 'category_id', 'idx_products_category_id');
        $this->createIndexIfNotExists('products', 'is_active', 'idx_products_is_active');
        $this->createIndexIfNotExists('products', 'is_featured', 'idx_products_is_featured');
        $this->createIndexIfNotExists('products', 'created_at', 'idx_products_created_at');
        $this->createIndexIfNotExists('products', 'price', 'idx_products_price');
        $this->createIndexIfNotExists('products', 'stock', 'idx_products_stock');
        
        // Composite indexes for complex queries
        $this->createCompositeIndexIfNotExists('products', ['is_active', 'is_featured'], 'idx_products_active_featured');
        $this->createCompositeIndexIfNotExists('products', ['producer_id', 'is_active'], 'idx_products_producer_active');
        $this->createCompositeIndexIfNotExists('products', ['category_id', 'is_active'], 'idx_products_category_active');
        $this->createCompositeIndexIfNotExists('products', ['is_active', 'created_at'], 'idx_products_active_created');
        $this->createCompositeIndexIfNotExists('products', ['is_active', 'price'], 'idx_products_active_price');

        // Orders table optimization
        $this->createIndexIfNotExists('orders', 'user_id', 'idx_orders_user_id');
        $this->createIndexIfNotExists('orders', 'status', 'idx_orders_status');
        $this->createIndexIfNotExists('orders', 'created_at', 'idx_orders_created_at');
        $this->createIndexIfNotExists('orders', 'total_amount', 'idx_orders_total_amount');
        
        // Composite indexes for dashboard queries
        $this->createCompositeIndexIfNotExists('orders', ['user_id', 'status'], 'idx_orders_user_status');
        $this->createCompositeIndexIfNotExists('orders', ['status', 'created_at'], 'idx_orders_status_created');
        $this->createCompositeIndexIfNotExists('orders', ['created_at', 'total_amount'], 'idx_orders_created_amount');

        // Order items table optimization
        $this->createIndexIfNotExists('order_items', 'order_id', 'idx_order_items_order_id');
        $this->createIndexIfNotExists('order_items', 'product_id', 'idx_order_items_product_id');
        $this->createCompositeIndexIfNotExists('order_items', ['order_id', 'product_id'], 'idx_order_items_order_product');

        // Cart optimization for session management
        $this->createIndexIfNotExists('carts', 'session_id', 'idx_carts_session_id');
        $this->createIndexIfNotExists('carts', 'expires_at', 'idx_carts_expires_at');
        $this->createCompositeIndexIfNotExists('carts', ['user_id', 'expires_at'], 'idx_carts_user_expires');

        $this->createCompositeIndexIfNotExists('cart_items', ['cart_id', 'product_id'], 'idx_cart_items_cart_product');
        $this->createIndexIfNotExists('cart_items', 'product_id', 'idx_cart_items_product_id');

        // Categories optimization (using correct table name)
        $this->createIndexIfNotExists('categories', 'slug', 'idx_categories_slug');

        // Product category relations optimization
        $this->createIndexIfNotExists('product_category_relations', 'product_id', 'idx_product_category_product');
        $this->createIndexIfNotExists('product_category_relations', 'category_id', 'idx_product_category_category');
        $this->createCompositeIndexIfNotExists('product_category_relations', ['product_id', 'category_id'], 'idx_product_category_both');

        // Producers table optimization
        $this->createIndexIfNotExists('producers', 'user_id', 'idx_producers_user_id');
        $this->createIndexIfNotExists('producers', 'verified', 'idx_producers_verified');
        $this->createIndexIfNotExists('producers', 'business_name', 'idx_producers_business_name');
        $this->createCompositeIndexIfNotExists('producers', ['verified', 'created_at'], 'idx_producers_verified_created');

        // Users table optimization
        $this->createIndexIfNotExists('users', 'email', 'idx_users_email');
        $this->createIndexIfNotExists('users', 'role', 'idx_users_role');
        $this->createCompositeIndexIfNotExists('users', ['role', 'created_at'], 'idx_users_role_created');

        // Product images optimization (using correct column name)
        $this->createCompositeIndexIfNotExists('product_images', ['product_id', 'sort_order'], 'idx_product_images_product_sort');
    }

    /**
     * Helper method to create index only if it doesn't exist
     */
    private function createIndexIfNotExists($table, $column, $indexName)
    {
        if (!$this->indexExists($table, $indexName)) {
            Schema::table($table, function (Blueprint $blueprint) use ($column, $indexName) {
                $blueprint->index($column, $indexName);
            });
        }
    }

    /**
     * Helper method to create composite index only if it doesn't exist
     */
    private function createCompositeIndexIfNotExists($table, $columns, $indexName)
    {
        if (!$this->indexExists($table, $indexName)) {
            Schema::table($table, function (Blueprint $blueprint) use ($columns, $indexName) {
                $blueprint->index($columns, $indexName);
            });
        }
    }

    /**
     * Check if index exists
     */
    private function indexExists($table, $indexName)
    {
        $indexes = DB::select("SELECT indexname FROM pg_indexes WHERE tablename = ? AND indexname = ?", [$table, $indexName]);
        return count($indexes) > 0;
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop all created indexes
        $indexes = [
            'products' => [
                'idx_products_producer_id', 'idx_products_category_id', 'idx_products_is_active',
                'idx_products_is_featured', 'idx_products_created_at', 'idx_products_price',
                'idx_products_stock', 'idx_products_active_featured', 'idx_products_producer_active',
                'idx_products_category_active', 'idx_products_active_created', 'idx_products_active_price'
            ],
            'orders' => [
                'idx_orders_user_id', 'idx_orders_status', 'idx_orders_created_at',
                'idx_orders_total_amount', 'idx_orders_user_status', 'idx_orders_status_created',
                'idx_orders_created_amount'
            ],
            'order_items' => [
                'idx_order_items_order_id', 'idx_order_items_product_id', 'idx_order_items_order_product'
            ],
            'carts' => [
                'idx_carts_session_id', 'idx_carts_expires_at', 'idx_carts_user_expires'
            ],
            'cart_items' => [
                'idx_cart_items_cart_product', 'idx_cart_items_product_id'
            ],
            'categories' => [
                'idx_categories_slug'
            ],
            'product_category_relations' => [
                'idx_product_category_product', 'idx_product_category_category', 'idx_product_category_both'
            ],
            'producers' => [
                'idx_producers_user_id', 'idx_producers_verified', 'idx_producers_business_name',
                'idx_producers_verified_created'
            ],
            'users' => [
                'idx_users_email', 'idx_users_role', 'idx_users_role_created'
            ],
            'product_images' => [
                'idx_product_images_product_sort'
            ]
        ];

        foreach ($indexes as $table => $tableIndexes) {
            foreach ($tableIndexes as $indexName) {
                if ($this->indexExists($table, $indexName)) {
                    DB::statement("DROP INDEX IF EXISTS $indexName");
                }
            }
        }
    }
};