#!/bin/bash

# 🚀 Dixis Greek Market Fresh Installation Script
# Clean installation optimized for Greek market on dixis.io

set -e

echo "🚀 Starting Dixis Greek Market Fresh Installation..."
echo "=================================================="
echo "Target: dixis.io (147.93.126.235)"
echo "Stack: Ubuntu 24.04 + PostgreSQL + Nginx + PHP 8.3"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

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

print_section() {
    echo -e "\n${PURPLE}==== $1 ====${NC}"
}

# Verify clean state
print_section "VERIFYING CLEAN STATE"

if [ -d /var/www/dixis ]; then
    print_error "Old installation found at /var/www/dixis"
    print_error "Please run vps-backup-cleanup.sh first!"
    exit 1
fi

if command -v mysql > /dev/null; then
    print_warning "MySQL is still installed. Run cleanup script first!"
fi

print_status "System is clean and ready for installation"

# ==========================================
# PHASE 1: SYSTEM PREPARATION
# ==========================================
print_section "PHASE 1: SYSTEM PREPARATION"

print_info "Updating system packages..."
apt update && apt upgrade -y
print_status "System updated"

print_info "Installing required packages..."
apt install -y \
    nginx \
    postgresql-16 postgresql-client-16 \
    php8.3-fpm php8.3-cli php8.3-common \
    php8.3-pgsql php8.3-mbstring php8.3-xml \
    php8.3-curl php8.3-zip php8.3-bcmath \
    php8.3-gd php8.3-intl php8.3-redis \
    redis-server \
    git curl wget unzip \
    software-properties-common \
    certbot python3-certbot-nginx \
    supervisor \
    ufw

print_status "Base packages installed"

# Install Composer
print_info "Installing Composer..."
if ! command -v composer > /dev/null; then
    curl -sS https://getcomposer.org/installer | php
    mv composer.phar /usr/local/bin/composer
    chmod +x /usr/local/bin/composer
fi
print_status "Composer installed: $(composer --version)"

# Install Node.js 20 LTS
print_info "Installing Node.js 20 LTS..."
if ! command -v node > /dev/null || [ $(node -v | cut -d'v' -f2 | cut -d'.' -f1) -lt 20 ]; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi
print_status "Node.js installed: $(node -v)"

# Install PM2
print_info "Installing PM2..."
npm install pm2 -g
print_status "PM2 installed"

# ==========================================
# PHASE 2: DATABASE SETUP
# ==========================================
print_section "PHASE 2: POSTGRESQL SETUP"

print_info "Configuring PostgreSQL..."

# Start PostgreSQL
systemctl start postgresql
systemctl enable postgresql

# Create database and user
print_info "Creating database and user..."
sudo -u postgres psql <<EOF
-- Drop if exists (fresh start)
DROP DATABASE IF EXISTS dixis_production;
DROP USER IF EXISTS dixis_user;

-- Create user and database
CREATE USER dixis_user WITH ENCRYPTED PASSWORD 'DixisGreek2025!';
CREATE DATABASE dixis_production OWNER dixis_user;

-- Grant all privileges
GRANT ALL PRIVILEGES ON DATABASE dixis_production TO dixis_user;

-- Greek-specific settings
ALTER DATABASE dixis_production SET timezone TO 'Europe/Athens';
ALTER DATABASE dixis_production SET lc_monetary TO 'el_GR.UTF-8';
ALTER DATABASE dixis_production SET lc_numeric TO 'el_GR.UTF-8';
EOF

print_status "PostgreSQL configured for Greek market"

# ==========================================
# PHASE 3: APPLICATION DIRECTORY SETUP
# ==========================================
print_section "PHASE 3: APPLICATION SETUP"

print_info "Creating application directory..."
mkdir -p /var/www/dixis-marketplace
cd /var/www/dixis-marketplace

# Create directory structure
mkdir -p backend frontend storage/app/public storage/framework/{sessions,views,cache} storage/logs
chmod -R 775 storage
chmod -R 775 backend/bootstrap/cache 2>/dev/null || mkdir -p backend/bootstrap/cache && chmod -R 775 backend/bootstrap/cache

print_status "Directory structure created"

# ==========================================
# PHASE 4: DEPLOY APPLICATION FILES
# ==========================================
print_section "PHASE 4: DEPLOYING APPLICATION"

print_info "Application files will be deployed from local machine..."
print_warning "Run this on your local machine:"
echo ""
echo "cd /Users/panagiotiskourkoutis/Dixis\\ Project\\ 2/GitHub-Dixis-Project-1"
echo "tar -czf dixis-deploy.tar.gz --exclude='.git' --exclude='node_modules' --exclude='vendor' backend frontend"
echo "scp -i ~/.ssh/dixis_new_key dixis-deploy.tar.gz root@147.93.126.235:/tmp/"
echo ""
print_info "Press Enter when files are uploaded..."
read -r

# Extract application files
if [ -f /tmp/dixis-deploy.tar.gz ]; then
    print_info "Extracting application files..."
    tar -xzf /tmp/dixis-deploy.tar.gz -C /var/www/dixis-marketplace/
    print_status "Application files extracted"
else
    print_error "Deployment archive not found at /tmp/dixis-deploy.tar.gz"
    exit 1
fi

# ==========================================
# PHASE 5: BACKEND CONFIGURATION
# ==========================================
print_section "PHASE 5: BACKEND CONFIGURATION"

cd /var/www/dixis-marketplace/backend

# Create production .env
print_info "Creating production environment file..."
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
EOF

# Install dependencies
print_info "Installing backend dependencies..."
composer install --optimize-autoloader --no-dev

# Generate application key
php artisan key:generate

# Run migrations
print_info "Running database migrations..."
php artisan migrate --force

# Optimize application
print_info "Optimizing application..."
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan storage:link

print_status "Backend configured successfully"

# ==========================================
# PHASE 6: FRONTEND CONFIGURATION
# ==========================================
print_section "PHASE 6: FRONTEND CONFIGURATION"

cd /var/www/dixis-marketplace/frontend

# Create production environment
print_info "Creating frontend environment..."
cat > .env.local << 'EOF'
NEXT_PUBLIC_API_URL=https://dixis.io/api
NEXT_PUBLIC_APP_URL=https://dixis.io
NEXT_PUBLIC_APP_NAME="Dixis Greek Marketplace"
NEXT_PUBLIC_DEFAULT_LOCALE=el
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=
EOF

# Install dependencies and build
print_info "Installing frontend dependencies..."
npm ci --production

print_info "Building frontend..."
npm run build

print_status "Frontend built successfully"

# ==========================================
# PHASE 7: WEB SERVER CONFIGURATION
# ==========================================
print_section "PHASE 7: NGINX CONFIGURATION"

print_info "Creating Nginx configuration..."
cat > /etc/nginx/sites-available/dixis << 'EOF'
server {
    listen 80;
    server_name dixis.io www.dixis.io;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name dixis.io www.dixis.io;
    
    root /var/www/dixis-marketplace/backend/public;
    index index.php;
    
    # SSL configuration (will be added by certbot)
    # ssl_certificate /etc/letsencrypt/live/dixis.io/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/dixis.io/privkey.pem;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Greek market optimizations
    client_max_body_size 50M;
    client_body_timeout 120s;
    
    # Laravel backend
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }
    
    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.3-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_read_timeout 300;
    }
    
    # API routes
    location /api {
        try_files $uri /index.php?$query_string;
    }
    
    # Storage access
    location /storage {
        alias /var/www/dixis-marketplace/backend/storage/app/public;
    }
    
    # Deny access to sensitive files
    location ~ /\.(?!well-known).* {
        deny all;
    }
}

# Next.js frontend server (internal)
server {
    listen 3000;
    server_name localhost;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/dixis /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test nginx configuration
nginx -t

print_status "Nginx configured"

# ==========================================
# PHASE 8: SSL CERTIFICATE
# ==========================================
print_section "PHASE 8: SSL CERTIFICATE"

# Check if we have backup SSL
if [ -d /root/backups/*/ssl-certificates ]; then
    print_info "Restoring SSL certificates from backup..."
    cp -r /root/backups/*/ssl-certificates/* /etc/letsencrypt/live/dixis.io/
    print_status "SSL certificates restored"
else
    print_warning "No SSL backup found. Need to generate new certificate."
    print_info "Run: certbot --nginx -d dixis.io -d www.dixis.io"
fi

# ==========================================
# PHASE 9: SET PERMISSIONS
# ==========================================
print_section "PHASE 9: PERMISSIONS & OWNERSHIP"

chown -R www-data:www-data /var/www/dixis-marketplace
chmod -R 755 /var/www/dixis-marketplace
chmod -R 775 /var/www/dixis-marketplace/backend/storage
chmod -R 775 /var/www/dixis-marketplace/backend/bootstrap/cache

print_status "Permissions set correctly"

# ==========================================
# PHASE 10: START SERVICES
# ==========================================
print_section "PHASE 10: STARTING SERVICES"

# PHP-FPM
systemctl restart php8.3-fpm
systemctl enable php8.3-fpm

# Redis
systemctl restart redis-server
systemctl enable redis-server

# PostgreSQL
systemctl restart postgresql
systemctl enable postgresql

# Frontend with PM2
cd /var/www/dixis-marketplace/frontend
pm2 start npm --name "dixis-frontend" -- start -- --port 3001
pm2 save
pm2 startup

# Nginx (last)
systemctl restart nginx
systemctl enable nginx

print_status "All services started"

# ==========================================
# PHASE 11: FIREWALL CONFIGURATION
# ==========================================
print_section "PHASE 11: FIREWALL SETUP"

ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

print_status "Firewall configured"

# ==========================================
# FINAL STATUS CHECK
# ==========================================
print_section "INSTALLATION COMPLETE - STATUS CHECK"

echo ""
print_info "Service Status:"
systemctl is-active nginx && echo "  ✅ Nginx: Active" || echo "  ❌ Nginx: Inactive"
systemctl is-active php8.3-fpm && echo "  ✅ PHP-FPM: Active" || echo "  ❌ PHP-FPM: Inactive"
systemctl is-active postgresql && echo "  ✅ PostgreSQL: Active" || echo "  ❌ PostgreSQL: Inactive"
systemctl is-active redis-server && echo "  ✅ Redis: Active" || echo "  ❌ Redis: Inactive"
pm2 list

echo ""
print_info "Next Steps:"
echo "  1. Update .env with real Viva Wallet credentials"
echo "  2. Update .env with real AfterSalesPro credentials"
echo "  3. Configure SSL: certbot --nginx -d dixis.io -d www.dixis.io"
echo "  4. Test endpoints:"
echo "     - https://dixis.io"
echo "     - https://dixis.io/api/health"
echo "     - https://dixis.io/api/v1/payments/greek/methods"

echo ""
echo "================================================"
echo "🎉 DIXIS GREEK MARKET INSTALLATION COMPLETE!"
echo "================================================"
echo ""
print_info "Domain: https://dixis.io"
print_info "Admin: https://dixis.io/admin"
print_info "API: https://dixis.io/api"
echo ""
echo "🇬🇷 Ready for Greek market launch!"
echo "💰 Target: €2K-5K first month revenue"
echo "================================================"