#!/bin/bash

# 🚀 DIXIS VPS DEPLOYMENT SCRIPT
# Target: 147.93.126.235 (Hostinger)
# Generated: July 21, 2025

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
VPS_HOST="147.93.126.235"
VPS_USER="root"
APP_DIR="/var/www/dixis"
DOMAIN="dixis.gr"
DB_NAME="dixis_production"

echo -e "${BLUE}🚀 DIXIS VPS DEPLOYMENT STARTING...${NC}"

# Function to print status
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we can connect to VPS
echo -e "${BLUE}📡 Testing VPS connection...${NC}"
if ! ping -c 1 $VPS_HOST >/dev/null 2>&1; then
    print_error "Cannot connect to VPS at $VPS_HOST"
    exit 1
fi
print_status "VPS connection successful"

# Check if SSH key exists
SSH_KEY="$HOME/.ssh/dixis_vps_key"
if [ ! -f "$SSH_KEY" ]; then
    print_warning "SSH key not found at $SSH_KEY"
    print_warning "You'll need to use password authentication"
    SSH_OPTS=""
else
    SSH_OPTS="-i $SSH_KEY"
    print_status "SSH key found"
fi

echo -e "${BLUE}📦 STEP 1: Preparing backend deployment...${NC}"

# Create deployment package
echo "Creating deployment package..."
cd "$(dirname "$0")/.."
tar -czf dixis-deployment.tar.gz \
    --exclude='node_modules' \
    --exclude='.git' \
    --exclude='storage/logs/*' \
    --exclude='storage/framework/cache/*' \
    --exclude='storage/framework/sessions/*' \
    --exclude='storage/framework/views/*' \
    backend/ frontend/ deployment/

print_status "Deployment package created"

echo -e "${BLUE}📦 STEP 2: Uploading to VPS...${NC}"

# Upload deployment package
scp $SSH_OPTS dixis-deployment.tar.gz $VPS_USER@$VPS_HOST:/tmp/

print_status "Files uploaded to VPS"

echo -e "${BLUE}🔧 STEP 3: VPS setup and configuration...${NC}"

# Execute deployment commands on VPS
ssh $SSH_OPTS $VPS_USER@$VPS_HOST << 'ENDSSH'
set -e

echo "🏗️  Setting up application directory..."
sudo mkdir -p /var/www/dixis
cd /var/www/dixis

echo "📦 Extracting deployment package..."
sudo tar -xzf /tmp/dixis-deployment.tar.gz
sudo chown -R www-data:www-data /var/www/dixis

echo "🔧 Setting up backend..."
cd /var/www/dixis/backend

# Copy production environment
sudo cp ../deployment/production/.env.production .env

# Generate application key
sudo -u www-data php artisan key:generate --force

# Install/update dependencies (if composer.json changed)
sudo -u www-data composer install --no-dev --optimize-autoloader

# Set proper permissions
sudo chown -R www-data:www-data /var/www/dixis
sudo chmod -R 755 /var/www/dixis
sudo chmod -R 775 storage bootstrap/cache

echo "🗄️  Setting up database..."
# Run migrations (if needed)
sudo -u www-data php artisan migrate --force

# Clear and cache configuration
sudo -u www-data php artisan config:clear
sudo -u www-data php artisan config:cache
sudo -u www-data php artisan route:clear
sudo -u www-data php artisan route:cache
sudo -u www-data php artisan view:clear

echo "🌐 Setting up frontend..."
cd /var/www/dixis/frontend

# Install dependencies and build
npm ci --production
npm run build

# Copy built files to public directory
sudo mkdir -p /var/www/dixis/public
sudo cp -r .next/static /var/www/dixis/public/
sudo cp -r public/* /var/www/dixis/public/

echo "🔧 Configuring Nginx..."
# Create Nginx configuration
sudo tee /etc/nginx/sites-available/dixis > /dev/null << 'EOF'
server {
    listen 80;
    server_name dixis.gr www.dixis.gr;
    
    # Redirect to HTTPS (when SSL is configured)
    # return 301 https://$server_name$request_uri;
    
    root /var/www/dixis/frontend;
    index index.html index.htm;
    
    # Handle Next.js static files
    location /_next/static/ {
        alias /var/www/dixis/frontend/.next/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Handle public assets
    location /images/ {
        alias /var/www/dixis/frontend/public/images/;
        expires 1y;
        add_header Cache-Control "public";
    }
    
    # Handle API requests to Laravel backend
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Handle Next.js application
    location / {
        try_files $uri $uri/ @nextjs;
    }
    
    location @nextjs {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Enable the site
sudo ln -sf /etc/nginx/sites-available/dixis /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

echo "🔄 Starting services..."
# Start Laravel backend (using Laravel's built-in server for now)
cd /var/www/dixis/backend
sudo -u www-data nohup php artisan serve --host=127.0.0.1 --port=8000 > /dev/null 2>&1 &

# Start Next.js frontend  
cd /var/www/dixis/frontend
sudo -u www-data nohup npm start -- --port=3000 > /dev/null 2>&1 &

echo "✅ Deployment completed successfully!"
echo "🌐 Your site should be available at: http://dixis.gr"
echo "🔗 Backend API: http://dixis.gr/api/v1/products"

ENDSSH

print_status "VPS deployment completed!"

echo -e "${BLUE}🧹 Cleaning up...${NC}"
rm dixis-deployment.tar.gz
print_status "Cleanup completed"

echo -e "${GREEN}🎉 DEPLOYMENT SUCCESSFUL!${NC}"
echo -e "${BLUE}Next steps:${NC}"
echo "1. Configure SSL certificates"
echo "2. Set up domain DNS"
echo "3. Test all functionality"
echo "4. Configure monitoring"
echo ""
echo -e "${GREEN}Your Dixis marketplace is now live! 🇬🇷${NC}"