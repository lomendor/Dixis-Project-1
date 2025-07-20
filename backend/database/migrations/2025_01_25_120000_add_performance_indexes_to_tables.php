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
     */
    public function up(): void
    {
        // Products table optimization - Most critical for performance
        Schema::table('products', function (Blueprint $table) {
            // Single column indexes for frequent WHERE clauses
            $table->index('slug', 'idx_products_slug');
            $table->index('producer_id', 'idx_products_producer_id');
            $table->index('category_id', 'idx_products_category_id');
            $table->index('is_active', 'idx_products_is_active');
            $table->index('is_featured', 'idx_products_is_featured');
            $table->index('created_at', 'idx_products_created_at');
            $table->index('price', 'idx_products_price');
            $table->index('stock', 'idx_products_stock');
            
            // Composite indexes for complex queries
            $table->index(['is_active', 'is_featured'], 'idx_products_active_featured');
            $table->index(['producer_id', 'is_active'], 'idx_products_producer_active');
            $table->index(['category_id', 'is_active'], 'idx_products_category_active');
            $table->index(['is_active', 'created_at'], 'idx_products_active_created');
            $table->index(['is_active', 'price'], 'idx_products_active_price');
        });

        // Orders table optimization - Critical for B2B analytics
        Schema::table('orders', function (Blueprint $table) {
            $table->index('user_id', 'idx_orders_user_id');
            $table->index('status', 'idx_orders_status');
            $table->index('created_at', 'idx_orders_created_at');
            $table->index('total_amount', 'idx_orders_total_amount');
            
            // Composite indexes for dashboard queries
            $table->index(['user_id', 'status'], 'idx_orders_user_status');
            $table->index(['status', 'created_at'], 'idx_orders_status_created');
            $table->index(['created_at', 'total_amount'], 'idx_orders_created_amount');
        });

        // Order items table optimization
        Schema::table('order_items', function (Blueprint $table) {
            $table->index('order_id', 'idx_order_items_order_id');
            $table->index('product_id', 'idx_order_items_product_id');
            $table->index(['order_id', 'product_id'], 'idx_order_items_order_product');
        });

        // Cart optimization for session management
        Schema::table('carts', function (Blueprint $table) {
            $table->index('session_id', 'idx_carts_session_id');
            $table->index('expires_at', 'idx_carts_expires_at');
            $table->index(['user_id', 'expires_at'], 'idx_carts_user_expires');
        });

        Schema::table('cart_items', function (Blueprint $table) {
            $table->index(['cart_id', 'product_id'], 'idx_cart_items_cart_product');
            $table->index('product_id', 'idx_cart_items_product_id');
        });

        // Categories optimization for navigation
        Schema::table('product_categories', function (Blueprint $table) {
            $table->index('slug', 'idx_categories_slug');
            $table->index('parent_id', 'idx_categories_parent_id');
            $table->index('type', 'idx_categories_type');
            $table->index(['parent_id', 'order'], 'idx_categories_parent_order');
        });

        // Product category relations optimization
        Schema::table('product_category_relations', function (Blueprint $table) {
            $table->index('product_id', 'idx_product_category_product');
            $table->index('category_id', 'idx_product_category_category');
            $table->index(['product_id', 'category_id'], 'idx_product_category_both');
        });

        // Producers table optimization
        Schema::table('producers', function (Blueprint $table) {
            $table->index('user_id', 'idx_producers_user_id');
            $table->index('verified', 'idx_producers_verified');
            $table->index('business_name', 'idx_producers_business_name');
            $table->index(['verified', 'created_at'], 'idx_producers_verified_created');
        });

        // Users table optimization
        Schema::table('users', function (Blueprint $table) {
            $table->index('email', 'idx_users_email');
            $table->index('role', 'idx_users_role');
            $table->index('is_active', 'idx_users_is_active');
            $table->index(['role', 'is_active'], 'idx_users_role_active');
        });

        // Reviews optimization
        Schema::table('reviews', function (Blueprint $table) {
            $table->index('product_id', 'idx_reviews_product_id');
            $table->index('user_id', 'idx_reviews_user_id');
            $table->index('rating', 'idx_reviews_rating');
            $table->index(['product_id', 'rating'], 'idx_reviews_product_rating');
        });

        // Product images optimization
        Schema::table('product_images', function (Blueprint $table) {
            $table->index('product_id', 'idx_product_images_product_id');
            $table->index(['product_id', 'order'], 'idx_product_images_product_order');
        });

        // Shipping optimization
        Schema::table('shipping_zones', function (Blueprint $table) {
            $table->index('name', 'idx_shipping_zones_name');
            $table->index('is_active', 'idx_shipping_zones_active');
        });

        Schema::table('postal_code_zones', function (Blueprint $table) {
            $table->index('postal_code', 'idx_postal_code_zones_postal');
            $table->index('zone_id', 'idx_postal_code_zones_zone');
        });

        // Payments optimization for Stripe integration
        Schema::table('payments', function (Blueprint $table) {
            $table->index('stripe_payment_intent_id', 'idx_payments_stripe_intent');
            $table->index('status', 'idx_payments_status');
            $table->index('user_id', 'idx_payments_user_id');
            $table->index(['user_id', 'status'], 'idx_payments_user_status');
            $table->index('created_at', 'idx_payments_created_at');
        });

        // Notifications optimization
        Schema::table('notifications', function (Blueprint $table) {
            $table->index('notifiable_id', 'idx_notifications_notifiable_id');
            $table->index('read_at', 'idx_notifications_read_at');
            $table->index(['notifiable_id', 'read_at'], 'idx_notifications_notifiable_read');
        });

        // Product questions optimization
        Schema::table('product_questions', function (Blueprint $table) {
            $table->index('product_id', 'idx_product_questions_product_id');
            $table->index('user_id', 'idx_product_questions_user_id');
            $table->index(['product_id', 'created_at'], 'idx_product_questions_product_created');
        });

        // Adoption system optimization
        Schema::table('adoptable_items', function (Blueprint $table) {
            $table->index('producer_id', 'idx_adoptable_items_producer_id');
            $table->index('slug', 'idx_adoptable_items_slug');
            $table->index('type', 'idx_adoptable_items_type');
        });

        Schema::table('adoptions', function (Blueprint $table) {
            $table->index('user_id', 'idx_adoptions_user_id');
            $table->index('adoptable_item_id', 'idx_adoptions_item_id');
            $table->index('status', 'idx_adoptions_status');
            $table->index(['user_id', 'status'], 'idx_adoptions_user_status');
        });

        // Invoice system optimization - Critical for B2B operations
        if (Schema::hasTable('invoices')) {
            Schema::table('invoices', function (Blueprint $table) {
                $table->index('user_id', 'idx_invoices_user_id');
                $table->index('order_id', 'idx_invoices_order_id');
                $table->index('invoice_number', 'idx_invoices_number');
                $table->index('status', 'idx_invoices_status');
                $table->index('issue_date', 'idx_invoices_issue_date');
                $table->index('due_date', 'idx_invoices_due_date');
                $table->index('invoice_type', 'idx_invoices_type');
                
                // Composite indexes for complex queries
                $table->index(['user_id', 'status'], 'idx_invoices_user_status');
                $table->index(['status', 'due_date'], 'idx_invoices_status_due');
                $table->index(['issue_date', 'status'], 'idx_invoices_issue_status');
            });
        }

        if (Schema::hasTable('invoice_items')) {
            Schema::table('invoice_items', function (Blueprint $table) {
                $table->index('invoice_id', 'idx_invoice_items_invoice_id');
                $table->index('product_id', 'idx_invoice_items_product_id');
                $table->index(['invoice_id', 'product_id'], 'idx_invoice_items_invoice_product');
            });
        }

        if (Schema::hasTable('invoice_payments')) {
            Schema::table('invoice_payments', function (Blueprint $table) {
                $table->index('invoice_id', 'idx_invoice_payments_invoice_id');
                $table->index('payment_method', 'idx_invoice_payments_method');
                $table->index('status', 'idx_invoice_payments_status');
                $table->index('payment_date', 'idx_invoice_payments_date');
                $table->index(['invoice_id', 'status'], 'idx_invoice_payments_invoice_status');
            });
        }

        // B2B system optimization - Enterprise features
        if (Schema::hasTable('business_users')) {
            Schema::table('business_users', function (Blueprint $table) {
                $table->index('user_id', 'idx_business_users_user_id');
                $table->index('business_name', 'idx_business_users_business_name');
                $table->index('verification_status', 'idx_business_users_verification');
                $table->index('is_active', 'idx_business_users_active');
                $table->index(['verification_status', 'is_active'], 'idx_business_users_verified_active');
            });
        }

        if (Schema::hasTable('bulk_order_details')) {
            Schema::table('bulk_order_details', function (Blueprint $table) {
                $table->index('order_id', 'idx_bulk_order_details_order_id');
                $table->index('source', 'idx_bulk_order_details_source');
                $table->index('approved_at', 'idx_bulk_order_details_approved');
                $table->index('rejected_at', 'idx_bulk_order_details_rejected');
            });
        }

        if (Schema::hasTable('credit_limits')) {
            Schema::table('credit_limits', function (Blueprint $table) {
                $table->index('business_user_id', 'idx_credit_limits_business_user');
                $table->index('credit_limit', 'idx_credit_limits_limit');
                $table->index('used_credit', 'idx_credit_limits_used');
                $table->index(['business_user_id', 'credit_limit'], 'idx_credit_limits_user_limit');
            });
        }

        if (Schema::hasTable('credit_transactions')) {
            Schema::table('credit_transactions', function (Blueprint $table) {
                $table->index('business_user_id', 'idx_credit_transactions_business_user');
                $table->index('order_id', 'idx_credit_transactions_order_id');
                $table->index('type', 'idx_credit_transactions_type');
                $table->index('created_at', 'idx_credit_transactions_created');
                $table->index(['business_user_id', 'type'], 'idx_credit_transactions_user_type');
                $table->index(['business_user_id', 'created_at'], 'idx_credit_transactions_user_created');
            });
        }

        // Multi-tenant optimization
        if (Schema::hasTable('tenants')) {
            Schema::table('tenants', function (Blueprint $table) {
                $table->index('domain', 'idx_tenants_domain');
                $table->index('subdomain', 'idx_tenants_subdomain');
                $table->index('is_active', 'idx_tenants_active');
                $table->index(['domain', 'is_active'], 'idx_tenants_domain_active');
            });
        }

        if (Schema::hasTable('tenant_themes')) {
            Schema::table('tenant_themes', function (Blueprint $table) {
                $table->index('tenant_id', 'idx_tenant_themes_tenant_id');
                $table->index('is_active', 'idx_tenant_themes_active');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop all performance indexes
        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex('idx_products_slug');
            $table->dropIndex('idx_products_producer_id');
            $table->dropIndex('idx_products_category_id');
            $table->dropIndex('idx_products_is_active');
            $table->dropIndex('idx_products_is_featured');
            $table->dropIndex('idx_products_created_at');
            $table->dropIndex('idx_products_price');
            $table->dropIndex('idx_products_stock');
            $table->dropIndex('idx_products_active_featured');
            $table->dropIndex('idx_products_producer_active');
            $table->dropIndex('idx_products_category_active');
            $table->dropIndex('idx_products_active_created');
            $table->dropIndex('idx_products_active_price');
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndex('idx_orders_user_id');
            $table->dropIndex('idx_orders_status');
            $table->dropIndex('idx_orders_created_at');
            $table->dropIndex('idx_orders_total_amount');
            $table->dropIndex('idx_orders_user_status');
            $table->dropIndex('idx_orders_status_created');
            $table->dropIndex('idx_orders_created_amount');
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->dropIndex('idx_order_items_order_id');
            $table->dropIndex('idx_order_items_product_id');
            $table->dropIndex('idx_order_items_order_product');
        });

        Schema::table('carts', function (Blueprint $table) {
            $table->dropIndex('idx_carts_session_id');
            $table->dropIndex('idx_carts_expires_at');
            $table->dropIndex('idx_carts_user_expires');
        });

        Schema::table('cart_items', function (Blueprint $table) {
            $table->dropIndex('idx_cart_items_cart_product');
            $table->dropIndex('idx_cart_items_product_id');
        });

        Schema::table('product_categories', function (Blueprint $table) {
            $table->dropIndex('idx_categories_slug');
            $table->dropIndex('idx_categories_parent_id');
            $table->dropIndex('idx_categories_type');
            $table->dropIndex('idx_categories_parent_order');
        });

        Schema::table('product_category_relations', function (Blueprint $table) {
            $table->dropIndex('idx_product_category_product');
            $table->dropIndex('idx_product_category_category');
            $table->dropIndex('idx_product_category_both');
        });

        Schema::table('producers', function (Blueprint $table) {
            $table->dropIndex('idx_producers_user_id');
            $table->dropIndex('idx_producers_verified');
            $table->dropIndex('idx_producers_business_name');
            $table->dropIndex('idx_producers_verified_created');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex('idx_users_email');
            $table->dropIndex('idx_users_role');
            $table->dropIndex('idx_users_is_active');
            $table->dropIndex('idx_users_role_active');
        });

        Schema::table('reviews', function (Blueprint $table) {
            $table->dropIndex('idx_reviews_product_id');
            $table->dropIndex('idx_reviews_user_id');
            $table->dropIndex('idx_reviews_rating');
            $table->dropIndex('idx_reviews_product_rating');
        });

        Schema::table('product_images', function (Blueprint $table) {
            $table->dropIndex('idx_product_images_product_id');
            $table->dropIndex('idx_product_images_product_order');
        });

        Schema::table('shipping_zones', function (Blueprint $table) {
            $table->dropIndex('idx_shipping_zones_name');
            $table->dropIndex('idx_shipping_zones_active');
        });

        Schema::table('postal_code_zones', function (Blueprint $table) {
            $table->dropIndex('idx_postal_code_zones_postal');
            $table->dropIndex('idx_postal_code_zones_zone');
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->dropIndex('idx_payments_stripe_intent');
            $table->dropIndex('idx_payments_status');
            $table->dropIndex('idx_payments_user_id');
            $table->dropIndex('idx_payments_user_status');
            $table->dropIndex('idx_payments_created_at');
        });

        Schema::table('notifications', function (Blueprint $table) {
            $table->dropIndex('idx_notifications_notifiable_id');
            $table->dropIndex('idx_notifications_read_at');
            $table->dropIndex('idx_notifications_notifiable_read');
        });

        Schema::table('product_questions', function (Blueprint $table) {
            $table->dropIndex('idx_product_questions_product_id');
            $table->dropIndex('idx_product_questions_user_id');
            $table->dropIndex('idx_product_questions_product_created');
        });

        Schema::table('adoptable_items', function (Blueprint $table) {
            $table->dropIndex('idx_adoptable_items_producer_id');
            $table->dropIndex('idx_adoptable_items_slug');
            $table->dropIndex('idx_adoptable_items_type');
        });

        Schema::table('adoptions', function (Blueprint $table) {
            $table->dropIndex('idx_adoptions_user_id');
            $table->dropIndex('idx_adoptions_item_id');
            $table->dropIndex('idx_adoptions_status');
            $table->dropIndex('idx_adoptions_user_status');
        });
    }
};
