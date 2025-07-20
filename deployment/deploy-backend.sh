#!/bin/bash

# Dixis Backend Deployment Script
# Usage: ./deploy-backend.sh [environment]

set -e

ENVIRONMENT=${1:-production}
PROJECT_DIR="/var/www/dixis-backend"
BACKUP_DIR="/backups/dixis"
LOG_FILE="/var/log/dixis-deploy.log"

echo "🚀 Starting Dixis Backend Deployment - Environment: $ENVIRONMENT"
echo "$(date): Starting deployment" >> $LOG_FILE

# Create backup directory if it doesn't exist
sudo mkdir -p $BACKUP_DIR

# Function to log messages
log() {
    echo "$(date): $1" | tee -a $LOG_FILE
}

# Function to handle errors
error_exit() {
    log "ERROR: $1"
    exit 1
}

# Check if running as root or with sudo
if [[ $EUID -eq 0 ]]; then
    error_exit "This script should not be run as root. Use sudo for specific commands."
fi

# Backup current deployment
log "Creating backup of current deployment..."
if [ -d "$PROJECT_DIR" ]; then
    sudo cp -r $PROJECT_DIR $BACKUP_DIR/backend-backup-$(date +%Y%m%d_%H%M%S)
    log "Backup created successfully"
fi

# Clone or update repository
if [ ! -d "$PROJECT_DIR" ]; then
    log "Cloning repository..."
    sudo git clone https://github.com/lomendor/Dixis4.git $PROJECT_DIR
else
    log "Updating repository..."
    cd $PROJECT_DIR
    sudo git fetch origin
    sudo git reset --hard origin/main
fi

cd $PROJECT_DIR

# Install/update dependencies
log "Installing Composer dependencies..."
sudo composer install --optimize-autoloader --no-dev --no-interaction

# Environment setup
log "Setting up environment..."
if [ ! -f ".env" ]; then
    sudo cp .env.example .env
    log "Created .env file from example"
fi

# Generate application key if not exists
if ! grep -q "APP_KEY=" .env || [ -z "$(grep APP_KEY= .env | cut -d'=' -f2)" ]; then
    log "Generating application key..."
    sudo php artisan key:generate --force
fi

# Database operations
log "Running database migrations..."
sudo php artisan migrate --force

# Clear and cache configurations
log "Optimizing application..."
sudo php artisan config:clear
sudo php artisan cache:clear
sudo php artisan route:clear
sudo php artisan view:clear

sudo php artisan config:cache
sudo php artisan route:cache
sudo php artisan view:cache

# Set proper permissions
log "Setting file permissions..."
sudo chown -R www-data:www-data $PROJECT_DIR
sudo chmod -R 755 $PROJECT_DIR/storage
sudo chmod -R 755 $PROJECT_DIR/bootstrap/cache

# Restart services
log "Restarting services..."
sudo systemctl reload nginx
sudo systemctl restart php8.1-fpm

# Health check
log "Performing health check..."
sleep 5

# Check if Laravel is responding
if curl -f -s http://localhost:8080/api/health > /dev/null; then
    log "✅ Backend deployment successful! Health check passed."
else
    log "⚠️ Health check failed. Please verify the deployment."
fi

log "🎉 Backend deployment completed!"
echo "Deployment log available at: $LOG_FILE"