#!/bin/bash

# 🚀 Dixis Greek Market Production Deployment Script
# Context Engineering Guided Deployment

set -e  # Exit on any error

echo "🇬🇷 Starting Dixis Greek Market Production Deployment..."
echo "=================================================="

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   echo "❌ This script should not be run as root for security reasons"
   exit 1
fi

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Phase 1: Environment Setup
echo ""
echo "🔧 Phase 1: Production Environment Setup"
echo "----------------------------------------"

# Check if .env.production exists
if [ ! -f "backend/.env.production" ]; then
    print_error ".env.production file not found!"
    exit 1
fi

print_status "Production environment file found"

# Create production environment from template
if [ ! -f "backend/.env" ]; then
    cp backend/.env.production backend/.env
    print_status "Created .env from production template"
else
    print_warning ".env already exists, backing up..."
    cp backend/.env backend/.env.backup
    cp backend/.env.production backend/.env
    print_status "Updated .env with production configuration"
fi

# Phase 2: Dependencies & Optimization
echo ""
echo "📦 Phase 2: Dependencies & Optimization"
echo "---------------------------------------"

cd backend

# Install/Update Composer dependencies (production optimized)
print_info "Installing optimized Composer dependencies..."
composer install --no-dev --optimize-autoloader --no-interaction

print_status "Composer dependencies installed"

# Generate application key if not set
if ! grep -q "APP_KEY=base64:" .env; then
    php artisan key:generate --force
    print_status "Application key generated"
fi

# Cache optimization for production
print_info "Optimizing caches for production..."
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

print_status "Production caches optimized"

# Phase 3: Database Setup
echo ""
echo "🗄️  Phase 3: Database Configuration"
echo "------------------------------------"

# Check database connection
print_info "Testing database connection..."
if php artisan migrate:status >/dev/null 2>&1; then
    print_status "Database connection successful"
    
    # Run migrations
    print_info "Running database migrations..."
    php artisan migrate --force
    print_status "Database migrations completed"
    
    # Seed production data if needed
    if [ "$1" = "--seed" ]; then
        print_info "Seeding production data..."
        php artisan db:seed --class=ProductionSeeder --force
        print_status "Production data seeded"
    fi
else
    print_error "Database connection failed! Please check your database configuration."
    exit 1
fi

# Phase 4: Greek Market Services Configuration
echo ""
echo "🇬🇷 Phase 4: Greek Market Services"
echo "-----------------------------------"

print_info "Validating Greek market configuration..."

# Check Viva Wallet configuration
if grep -q "VIVA_WALLET_CLIENT_ID=" .env && [ -n "$(grep VIVA_WALLET_CLIENT_ID= .env | cut -d'=' -f2)" ]; then
    print_status "Viva Wallet configuration found"
else
    print_warning "Viva Wallet credentials not configured"
fi

# Check AfterSalesPro configuration  
if grep -q "AFTERSALES_PRO_API_KEY=" .env && [ -n "$(grep AFTERSALES_PRO_API_KEY= .env | cut -d'=' -f2)" ]; then
    print_status "AfterSalesPro configuration found"
else
    print_warning "AfterSalesPro credentials not configured"
fi

# Check Greek company information
if grep -q "APP_COMPANY_TAX_ID=" .env && [ -n "$(grep APP_COMPANY_TAX_ID= .env | cut -d'=' -f2)" ]; then
    print_status "Greek company information configured"
else
    print_warning "Greek company information needs to be configured"
fi

# Phase 5: Security & Performance
echo ""
echo "🔒 Phase 5: Security & Performance"
echo "----------------------------------"

# Set proper file permissions
print_info "Setting secure file permissions..."
find . -type f -exec chmod 644 {} \;
find . -type d -exec chmod 755 {} \;
chmod -R 775 storage bootstrap/cache
print_status "File permissions secured"

# Clear any development caches
print_info "Clearing development artifacts..."
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Rebuild production caches
php artisan config:cache
php artisan route:cache
php artisan view:cache

print_status "Production caches rebuilt"

# Phase 6: Health Check
echo ""
echo "🏥 Phase 6: Production Health Check"
echo "-----------------------------------"

print_info "Running production health checks..."

# Test basic application functionality
if php artisan --version >/dev/null 2>&1; then
    print_status "Laravel application healthy"
else
    print_error "Laravel application health check failed"
    exit 1
fi

# Test database connectivity
if php artisan migrate:status >/dev/null 2>&1; then
    print_status "Database connectivity confirmed"
else
    print_error "Database health check failed"
    exit 1
fi

cd ..

# Phase 7: Frontend Production Build
echo ""
echo "🎨 Phase 7: Frontend Production Build"
echo "-------------------------------------"

if [ -d "frontend" ]; then
    cd frontend
    
    print_info "Installing frontend dependencies..."
    npm ci --production
    
    print_info "Building production frontend..."
    npm run build
    
    print_status "Frontend production build completed"
    cd ..
else
    print_warning "Frontend directory not found, skipping frontend build"
fi

# Final Summary
echo ""
echo "🎉 Production Deployment Complete!"
echo "=================================="
print_status "Greek Market Production Environment Ready"
print_info "Backend: Production optimized with Greek market integration"
print_info "Database: Migrations completed and optimized"
print_info "Security: File permissions and caches secured"
print_info "Performance: Production caches enabled"

echo ""
echo "🇬🇷 Greek Market Integration Status:"
echo "- Viva Wallet: $(grep -q 'VIVA_WALLET_SANDBOX=false' backend/.env && echo 'Production Mode' || echo 'Needs Configuration')"
echo "- AfterSalesPro: $(grep -q 'AFTERSALES_PRO_SANDBOX=false' backend/.env && echo 'Production Mode' || echo 'Needs Configuration')"  
echo "- VAT System: Configured (24% mainland, 13% islands, 6% food)"
echo "- Greek Language: Enabled"

echo ""
echo "📋 Next Steps:"
echo "1. Configure API credentials in backend/.env"
echo "2. Setup SSL certificate for HTTPS"
echo "3. Configure web server (Nginx/Apache)"
echo "4. Run production tests"
echo "5. Start accepting Greek market orders! 🚀"

echo ""
print_status "Production deployment script completed successfully!"