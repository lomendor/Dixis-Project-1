#!/bin/bash

# Dixis Production Backup Script
# Usage: ./scripts/backup.sh

set -e

# Configuration
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

# Create backup directory
mkdir -p $BACKUP_DIR

log "Starting backup process..."

# Database backup
log "Backing up PostgreSQL database..."
if pg_dump --no-password --clean --create --if-exists > $BACKUP_DIR/dixis_db_$DATE.sql; then
    log "Database backup completed: dixis_db_$DATE.sql"
    
    # Compress database backup
    gzip $BACKUP_DIR/dixis_db_$DATE.sql
    log "Database backup compressed: dixis_db_$DATE.sql.gz"
else
    error "Database backup failed"
fi

# Application files backup (uploads, logs, etc.)
log "Backing up application files..."
if [ -d "/app/uploads" ]; then
    tar -czf $BACKUP_DIR/dixis_uploads_$DATE.tar.gz -C /app uploads
    log "Uploads backup completed: dixis_uploads_$DATE.tar.gz"
fi

if [ -d "/app/logs" ]; then
    tar -czf $BACKUP_DIR/dixis_logs_$DATE.tar.gz -C /app logs
    log "Logs backup completed: dixis_logs_$DATE.tar.gz"
fi

# Configuration backup
log "Backing up configuration files..."
if [ -f "/.env.production" ]; then
    cp /.env.production $BACKUP_DIR/env_production_$DATE
    log "Environment configuration backed up: env_production_$DATE"
fi

# Clean old backups
log "Cleaning old backups (older than $RETENTION_DAYS days)..."
find $BACKUP_DIR -name "dixis_db_*.sql.gz" -mtime +$RETENTION_DAYS -delete
find $BACKUP_DIR -name "dixis_uploads_*.tar.gz" -mtime +$RETENTION_DAYS -delete
find $BACKUP_DIR -name "dixis_logs_*.tar.gz" -mtime +$RETENTION_DAYS -delete
find $BACKUP_DIR -name "env_production_*" -mtime +$RETENTION_DAYS -delete

# Create backup manifest
cat > $BACKUP_DIR/backup_manifest_$DATE.txt << EOF
Dixis Backup Manifest
Date: $(date)
Backup ID: $DATE

Files included:
- dixis_db_$DATE.sql.gz (PostgreSQL database dump)
- dixis_uploads_$DATE.tar.gz (User uploads)
- dixis_logs_$DATE.tar.gz (Application logs)
- env_production_$DATE (Environment configuration)

To restore:
1. Database: gunzip -c dixis_db_$DATE.sql.gz | psql dixis_production
2. Uploads: tar -xzf dixis_uploads_$DATE.tar.gz -C /app/
3. Logs: tar -xzf dixis_logs_$DATE.tar.gz -C /app/
4. Environment: cp env_production_$DATE .env.production
EOF

log "Backup manifest created: backup_manifest_$DATE.txt"

# Calculate backup sizes
DB_SIZE=$(du -h $BACKUP_DIR/dixis_db_$DATE.sql.gz 2>/dev/null | cut -f1 || echo "N/A")
UPLOADS_SIZE=$(du -h $BACKUP_DIR/dixis_uploads_$DATE.tar.gz 2>/dev/null | cut -f1 || echo "N/A")
LOGS_SIZE=$(du -h $BACKUP_DIR/dixis_logs_$DATE.tar.gz 2>/dev/null | cut -f1 || echo "N/A")

log "Backup completed successfully!"
log "Database backup size: $DB_SIZE"
log "Uploads backup size: $UPLOADS_SIZE"
log "Logs backup size: $LOGS_SIZE"
log "All backups stored in: $BACKUP_DIR"

# Optional: Send backup notification (uncomment and configure as needed)
# curl -X POST -H 'Content-type: application/json' \
#     --data "{\"text\":\"Dixis backup completed successfully - $DATE\"}" \
#     "$SLACK_WEBHOOK_URL"

exit 0