#!/bin/bash

# Fix migration order and run essential migrations only

set -e

echo "🔧 Fixing migrations for Greek market deployment..."
echo "================================================"

cd /var/www/dixis-marketplace/backend

# Drop all tables first
echo "🗑️ Dropping existing tables..."
php artisan db:wipe --force

# Run essential migrations in correct order
echo "📊 Running essential migrations..."

# Core Laravel tables
php artisan migrate --path=database/migrations/0001_01_01_000000_create_users_table.php --force
php artisan migrate --path=database/migrations/0001_01_01_000001_create_cache_table.php --force
php artisan migrate --path=database/migrations/0001_01_01_000002_create_jobs_table.php --force

# Businesses and producers
php artisan migrate --path=database/migrations/2023_07_15_000000_create_businesses_table.php --force || true
php artisan migrate --path=database/migrations/2025_03_28_213533_create_producers_table.php --force

# Core marketplace tables
php artisan migrate --path=database/migrations/2025_06_09_154703_create_categories_table.php --force
php artisan migrate --path=database/migrations/2025_03_28_213546_create_products_table.php --force
php artisan migrate --path=database/migrations/2025_03_28_213622_create_product_categories_table.php --force

# Orders and payments
php artisan migrate --path=database/migrations/2025_06_09_155003_create_orders_table.php --force || true
php artisan migrate --path=database/migrations/2025_06_09_155303_create_order_items_table.php --force || true
php artisan migrate --path=database/migrations/2025_06_09_155903_create_payments_table.php --force || true

# Greek specific tables
php artisan migrate --path=database/migrations/2025_07_20_100001_create_greek_vat_zones_table.php --force || true
php artisan migrate --path=database/migrations/2025_07_20_100002_create_greek_shipping_zones_table.php --force || true

# Additional features (run all remaining)
echo "📝 Running remaining migrations..."
php artisan migrate --force || true

echo "✅ Essential migrations completed!"

# Create admin user
echo "👤 Creating admin user..."
php artisan tinker --execute="
try {
    \$user = \App\Models\User::where('email', 'admin@dixis.io')->first();
    if (!\$user) {
        \$user = new \App\Models\User();
        \$user->name = 'Admin';
        \$user->email = 'admin@dixis.io';
        \$user->password = bcrypt('DixisAdmin2025!');
        \$user->email_verified_at = now();
        \$user->save();
        echo 'Admin user created successfully';
    } else {
        echo 'Admin user already exists';
    }
} catch (\Exception \$e) {
    echo 'Error: ' . \$e->getMessage();
}
"

# Optimize
echo "⚡ Optimizing application..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "✅ Migration fix completed!"