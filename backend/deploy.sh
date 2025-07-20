#!/bin/bash
# Dixis Fresh Production Deployment Script
# Generated: 2025-06-21T12:42:32.983Z

set -e  # Exit on any error

echo "🚀 Starting Dixis Fresh Production Deployment"
echo "Timestamp: $(date)"

# Configuration
PROJECT_ROOT="/var/www/dixis"
BACKUP_DIR="/var/backups/dixis"
LOG_FILE="/var/log/dixis/deploy.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}" | tee -a "${LOG_FILE}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}" | tee -a "${LOG_FILE}"
    exit 1
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}" | tee -a "${LOG_FILE}"
}

# Create necessary directories
mkdir -p "${BACKUP_DIR}"
mkdir -p "$(dirname "${LOG_FILE}")"

log "Starting deployment process..."

# 1. Create backup
log "Creating backup..."
if [ -d "${PROJECT_ROOT}" ]; then
    BACKUP_NAME="dixis_backup_$(date +%Y%m%d_%H%M%S)"
    tar -czf "${BACKUP_DIR}/${BACKUP_NAME}.tar.gz" -C "${PROJECT_ROOT}" . || warn "Backup creation failed"
    log "Backup created: ${BACKUP_NAME}.tar.gz"
fi

# 2. Update source code
log "Updating source code..."
cd "${PROJECT_ROOT}"

# Git pull (if using Git deployment)
if [ -d ".git" ]; then
    git fetch origin
    git checkout production
    git pull origin production
    log "Source code updated from Git"
fi

# 3. Install dependencies
log "Installing dependencies..."
composer install --no-dev --optimize-autoloader --no-interaction
log "Composer dependencies installed"

# 4. Update environment
log "Updating environment configuration..."
if [ ! -f ".env" ]; then
    cp .env.production .env
    log "Production environment file copied"
fi

# 5. Database migration
log "Running database migrations..."
php artisan down --message="Deployment in progress..."
php artisan migrate --force
log "Database migrations completed"

# 6. Clear and rebuild caches
log "Optimizing application..."
php artisan config:clear
php artisan cache:clear
php artisan view:clear
php artisan route:clear

php artisan config:cache
php artisan route:cache
php artisan view:cache
log "Application optimized"

# 7. Storage link
log "Creating storage link..."
php artisan storage:link
log "Storage link created"

# 8. Queue restart
log "Restarting queue workers..."
php artisan queue:restart
log "Queue workers restarted"

# 9. Search index update
log "Updating search indexes..."
php artisan scout:import "App\Models\Product"
php artisan scout:import "App\Models\Producer"
log "Search indexes updated"

# 10. File permissions
log "Setting file permissions..."
chown -R www-data:www-data storage bootstrap/cache
chmod -R 755 storage bootstrap/cache
log "File permissions set"

# 11. Health check
log "Running health check..."
if php artisan health:check; then
    log "Health check passed"
else
    error "Health check failed - deployment aborted"
fi

# 12. Bring application online
log "Bringing application online..."
php artisan up
log "Application is now online"

# 13. Notify completion
log "Deployment completed successfully!"

# Send notification (optional)
if command -v curl &> /dev/null && [ -n "${SLACK_WEBHOOK_URL}" ]; then
    curl -X POST -H 'Content-type: application/json' \
        --data '{"text":"🚀 Dixis Fresh production deployment completed successfully!"}' \
        "${SLACK_WEBHOOK_URL}" || warn "Failed to send Slack notification"
fi

echo "✅ Deployment completed at $(date)"