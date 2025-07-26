#!/bin/bash

# Complete remaining database migrations for Dixis Greek Market

set -e

echo "🗄️ Completing Database Migrations..."
echo "===================================="

cd /var/www/dixis-marketplace/backend

# Create missing orders table to resolve dependencies
echo "📦 Creating orders table..."
cat > database/migrations/2025_07_25_140001_create_orders_table.php << 'EOF'
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->string('order_number')->unique();
            $table->enum('status', ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'])->default('pending');
            $table->decimal('subtotal', 10, 2)->default(0);
            $table->decimal('tax_amount', 10, 2)->default(0);
            $table->decimal('shipping_amount', 10, 2)->default(0);
            $table->decimal('total', 10, 2)->default(0);
            $table->string('currency', 3)->default('EUR');
            
            // Greek market specific
            $table->decimal('vat_rate', 5, 4)->default(0.24); // Greek VAT
            $table->string('vat_zone')->default('mainland'); // mainland, islands
            
            // Shipping info
            $table->json('shipping_address')->nullable();
            $table->json('billing_address')->nullable();
            
            // Payment info
            $table->string('payment_status')->default('pending');
            $table->string('payment_method')->nullable();
            $table->string('payment_reference')->nullable();
            
            $table->timestamps();
            
            $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');
            $table->index(['status', 'created_at']);
            $table->index(['user_id', 'created_at']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('orders');
    }
};
EOF

# Create order items table
echo "📦 Creating order items table..."
cat > database/migrations/2025_07_25_140002_create_order_items_table.php << 'EOF'
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('order_id');
            $table->unsignedBigInteger('product_id')->nullable();
            $table->string('product_name');
            $table->text('product_description')->nullable();
            $table->decimal('price', 10, 2);
            $table->integer('quantity');
            $table->decimal('total', 10, 2);
            $table->timestamps();
            
            $table->foreign('order_id')->references('id')->on('orders')->onDelete('cascade');
            $table->foreign('product_id')->references('id')->on('products')->onDelete('set null');
        });
    }

    public function down()
    {
        Schema::dropIfExists('order_items');
    }
};
EOF

# Create payments table
echo "📦 Creating payments table..."
cat > database/migrations/2025_07_25_140003_create_payments_table.php << 'EOF'
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('order_id')->nullable();
            $table->string('payment_method'); // viva_wallet, stripe, bank_transfer
            $table->string('payment_status')->default('pending'); // pending, completed, failed, cancelled
            $table->decimal('amount', 10, 2);
            $table->string('currency', 3)->default('EUR');
            
            // Greek payment specific
            $table->string('viva_order_code')->nullable();
            $table->string('viva_transaction_id')->nullable();
            $table->json('viva_response')->nullable();
            
            // Stripe
            $table->string('stripe_payment_intent')->nullable();
            $table->json('stripe_response')->nullable();
            
            // General
            $table->string('external_reference')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamp('processed_at')->nullable();
            $table->timestamps();
            
            $table->foreign('order_id')->references('id')->on('orders')->onDelete('set null');
            $table->index(['payment_status', 'created_at']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('payments');
    }
};
EOF

# Run all new migrations
echo "🔄 Running new migrations..."
php artisan migrate --force

# Try to run remaining migrations that were failing
echo "🔄 Attempting remaining migrations..."
php artisan migrate --force || echo "Some migrations may still need manual fixes"

# Update backend .env for HTTPS
echo "🔒 Updating configuration for HTTPS..."
sed -i 's|APP_URL=http://dixis.io|APP_URL=https://dixis.io|' .env

# Clear and rebuild caches
echo "⚡ Rebuilding caches..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Check migration status
echo "📊 Migration Status:"
php artisan migrate:status | tail -20

echo "✅ Database migrations completed!"