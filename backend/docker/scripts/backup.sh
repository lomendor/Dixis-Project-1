#!/bin/bash

# Dixis Marketplace Backup Script
# This script creates automated backups of the database, Redis data, and application files

set -e

# Configuration
BACKUP_DIR="/var/backups/dixis"
DB_NAME="${DB_DATABASE:-dixis_marketplace}"
DB_USER="${DB_USERNAME:-root}"
DB_PASSWORD="${DB_PASSWORD:-}"
DB_HOST="${DB_HOST:-mysql}"
REDIS_HOST="${REDIS_HOST:-redis}"
RETENTION_DAYS=30
DATE=$(date +%Y%m%d_%H%M%S)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}" >&2
}

warning() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
    warning "Running as root. Consider using a dedicated backup user."
fi

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Database backup
log "Starting database backup..."
DB_BACKUP_FILE="$BACKUP_DIR/database_${DATE}.sql"

if command -v mysqldump >/dev/null 2>&1; then
    if mysqldump -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" \
        --single-transaction \
        --routines \
        --triggers \
        --events \
        --add-drop-database \
        --databases "$DB_NAME" > "$DB_BACKUP_FILE"; then
        
        # Compress the backup
        gzip "$DB_BACKUP_FILE"
        log "Database backup completed: ${DB_BACKUP_FILE}.gz"
    else
        error "Database backup failed"
        exit 1
    fi
else
    error "mysqldump not found. Please install MySQL client tools."
    exit 1
fi

# Redis backup
log "Starting Redis backup..."
REDIS_BACKUP_FILE="$BACKUP_DIR/redis_${DATE}.rdb"

if command -v redis-cli >/dev/null 2>&1; then
    # Trigger Redis BGSAVE
    redis-cli -h "$REDIS_HOST" BGSAVE
    
    # Wait for background save to complete
    while [ "$(redis-cli -h "$REDIS_HOST" LASTSAVE)" = "$(redis-cli -h "$REDIS_HOST" LASTSAVE)" ]; do
        sleep 1
    done
    
    # Copy the RDB file
    if docker cp "$(docker-compose ps -q redis)":/data/dump.rdb "$REDIS_BACKUP_FILE" 2>/dev/null; then
        gzip "$REDIS_BACKUP_FILE"
        log "Redis backup completed: ${REDIS_BACKUP_FILE}.gz"
    else
        warning "Redis backup failed or Redis container not found"
    fi
else
    warning "redis-cli not found. Skipping Redis backup."
fi

# Application files backup
log "Starting application files backup..."
APP_BACKUP_FILE="$BACKUP_DIR/application_${DATE}.tar.gz"

# Exclude development files and cache
tar -czf "$APP_BACKUP_FILE" \
    --exclude='vendor' \
    --exclude='node_modules' \
    --exclude='storage/logs/*' \
    --exclude='storage/framework/cache/*' \
    --exclude='storage/framework/sessions/*' \
    --exclude='storage/framework/views/*' \
    --exclude='.git' \
    --exclude='.env' \
    --exclude='docker' \
    -C /var/www/html .

if [ $? -eq 0 ]; then
    log "Application files backup completed: $APP_BACKUP_FILE"
else
    error "Application files backup failed"
fi

# Storage files backup (uploads, documents, etc.)
log "Starting storage files backup..."
STORAGE_BACKUP_FILE="$BACKUP_DIR/storage_${DATE}.tar.gz"

if [ -d "/var/www/html/storage/app/public" ]; then
    tar -czf "$STORAGE_BACKUP_FILE" -C /var/www/html/storage/app public
    log "Storage files backup completed: $STORAGE_BACKUP_FILE"
else
    warning "Storage directory not found. Skipping storage backup."
fi

# Environment configuration backup
log "Starting environment backup..."
ENV_BACKUP_FILE="$BACKUP_DIR/environment_${DATE}.env"

if [ -f "/var/www/html/.env" ]; then
    # Remove sensitive data before backup
    grep -v -E '^(DB_PASSWORD|REDIS_PASSWORD|APP_KEY|JWT_SECRET)=' /var/www/html/.env > "$ENV_BACKUP_FILE"
    log "Environment configuration backup completed: $ENV_BACKUP_FILE"
else
    warning ".env file not found. Skipping environment backup."
fi

# Create backup manifest
log "Creating backup manifest..."
MANIFEST_FILE="$BACKUP_DIR/manifest_${DATE}.txt"

cat > "$MANIFEST_FILE" << EOF
Dixis Marketplace Backup Manifest
Generated: $(date)
Backup ID: $DATE

Files included in this backup:
- Database: database_${DATE}.sql.gz
- Redis: redis_${DATE}.rdb.gz
- Application: application_${DATE}.tar.gz
- Storage: storage_${DATE}.tar.gz
- Environment: environment_${DATE}.env

System Information:
- Hostname: $(hostname)
- Docker Version: $(docker --version 2>/dev/null || echo "Not available")
- Disk Usage: $(df -h /var/www/html 2>/dev/null || echo "Not available")

Database Information:
- Database Name: $DB_NAME
- Database Host: $DB_HOST
- Backup Method: mysqldump with single-transaction

Redis Information:
- Redis Host: $REDIS_HOST
- Backup Method: BGSAVE + RDB copy

Notes:
- Sensitive environment variables have been excluded from environment backup
- Cache and temporary files have been excluded from application backup
- This backup should be stored securely and tested regularly
EOF

log "Backup manifest created: $MANIFEST_FILE"

# Cleanup old backups
log "Cleaning up old backups (older than $RETENTION_DAYS days)..."
find "$BACKUP_DIR" -type f -mtime +$RETENTION_DAYS -delete 2>/dev/null || true

# Calculate backup size
TOTAL_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)
log "Backup completed successfully. Total backup size: $TOTAL_SIZE"

# Optional: Send notification (uncomment if you have mail configured)
# echo "Dixis Marketplace backup completed successfully on $(hostname) at $(date)" | \
#     mail -s "Backup Success - Dixis Marketplace" admin@example.com

log "Backup process finished. Backup ID: $DATE"

exit 0