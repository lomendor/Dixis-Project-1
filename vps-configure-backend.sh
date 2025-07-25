#!/bin/bash

# Backend configuration script for Dixis Greek Market

set -e

echo "🔧 Configuring Dixis Backend..."
echo "=============================="

cd /var/www/dixis-marketplace/backend

# Create production .env with dixis.io domain
echo "📝 Creating production environment file..."
cat > .env << 'EOF'
APP_NAME="Dixis Greek Marketplace"
APP_ENV=production
APP_KEY=
APP_DEBUG=false
APP_URL=https://dixis.io

APP_LOCALE=el
APP_FALLBACK_LOCALE=en
APP_FAKER_LOCALE=el_GR

# Database
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=dixis_production
DB_USERNAME=dixis_user
DB_PASSWORD=DixisGreek2025!

# Cache & Session
CACHE_STORE=redis
SESSION_DRIVER=redis
QUEUE_CONNECTION=redis

REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

# Greek Market Services (UPDATE WITH REAL CREDENTIALS)
VIVA_WALLET_CLIENT_ID=
VIVA_WALLET_CLIENT_SECRET=
VIVA_WALLET_MERCHANT_ID=
VIVA_WALLET_API_KEY=
VIVA_WALLET_SOURCE_CODE=
VIVA_WALLET_SANDBOX=false

AFTERSALES_PRO_API_KEY=
AFTERSALES_PRO_API_SECRET=
AFTERSALES_PRO_SANDBOX=false

# Greek VAT Configuration
GREEK_VAT_MAINLAND=0.24
GREEK_VAT_ISLANDS=0.13
GREEK_VAT_REDUCED=0.06

# Greek Company Info
APP_COMPANY_NAME="Dixis Greek Marketplace"
APP_COMPANY_TAX_ID="123456789"
APP_COMPANY_ADDRESS="Σταδίου 1, Αθήνα"
APP_COMPANY_CITY="Αθήνα"
APP_COMPANY_POSTCODE="10564"
APP_COMPANY_PHONE="+30 210 1234567"
APP_COMPANY_EMAIL="info@dixis.io"

# Mail Configuration
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="noreply@dixis.io"
MAIL_FROM_NAME="${APP_NAME}"

# Logging
LOG_CHANNEL=daily
LOG_LEVEL=warning
EOF

# Fix storage directory structure
echo "📁 Creating storage directories..."
mkdir -p storage/app/public
mkdir -p storage/framework/{sessions,views,cache}
mkdir -p storage/logs
mkdir -p bootstrap/cache

# Install dependencies
echo "📦 Installing backend dependencies..."
export COMPOSER_ALLOW_SUPERUSER=1
composer install --optimize-autoloader --no-dev --no-interaction

# Generate application key
echo "🔑 Generating application key..."
php artisan key:generate

# Run migrations
echo "🗄️ Running database migrations..."
php artisan migrate --force

# Seed initial data
echo "🌱 Seeding initial data..."
php artisan db:seed --class=DatabaseSeeder --force || true

# Optimize application
echo "⚡ Optimizing application..."
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan storage:link

# Create admin user
echo "👤 Creating admin user..."
php artisan tinker --execute="
\$user = new \App\Models\User();
\$user->name = 'Admin';
\$user->email = 'admin@dixis.io';
\$user->password = bcrypt('DixisAdmin2025!');
\$user->email_verified_at = now();
\$user->role = 'admin';
\$user->save();
echo 'Admin user created: admin@dixis.io';
" || echo "Admin user might already exist"

echo "✅ Backend configuration complete!"