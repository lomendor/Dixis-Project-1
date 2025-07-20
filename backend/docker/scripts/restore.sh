#!/bin/bash

# Dixis Marketplace Restore Script
# This script restores backups created by backup.sh

set -e

# Configuration
BACKUP_DIR="/var/backups/dixis"
DB_NAME="${DB_DATABASE:-dixis_marketplace}"
DB_USER="${DB_USERNAME:-root}"
DB_PASSWORD="${DB_PASSWORD:-}"
DB_HOST="${DB_HOST:-mysql}"
REDIS_HOST="${REDIS_HOST:-redis}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

info() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"
}

# Usage function
usage() {
    echo "Usage: $0 [OPTIONS]"
    echo "Options:"
    echo "  -d, --backup-date DATE    Restore from specific backup date (YYYYMMDD_HHMMSS)"
    echo "  -l, --list               List available backups"
    echo "  -f, --force              Force restore without confirmation"
    echo "  --database-only          Restore only database"
    echo "  --redis-only             Restore only Redis data"
    echo "  --files-only             Restore only application files"
    echo "  -h, --help               Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 -l                                    # List available backups"
    echo "  $0 -d 20240115_143000                   # Restore from specific backup"
    echo "  $0 -d 20240115_143000 --database-only   # Restore only database"
    exit 1
}

# List available backups
list_backups() {
    echo "Available backups in $BACKUP_DIR:"
    echo "======================================"
    
    if [ ! -d "$BACKUP_DIR" ] || [ -z "$(ls -A "$BACKUP_DIR" 2>/dev/null)" ]; then
        echo "No backups found."
        exit 0
    fi
    
    # Find all manifest files and extract backup dates
    for manifest in "$BACKUP_DIR"/manifest_*.txt; do
        if [ -f "$manifest" ]; then
            backup_date=$(basename "$manifest" .txt | sed 's/manifest_//')
            echo "Backup Date: $backup_date"
            
            # Show backup size if available
            if [ -f "$BACKUP_DIR/database_${backup_date}.sql.gz" ]; then
                db_size=$(du -h "$BACKUP_DIR/database_${backup_date}.sql.gz" 2>/dev/null | cut -f1)
                echo "  Database: $db_size"
            fi
            
            if [ -f "$BACKUP_DIR/application_${backup_date}.tar.gz" ]; then
                app_size=$(du -h "$BACKUP_DIR/application_${backup_date}.tar.gz" 2>/dev/null | cut -f1)
                echo "  Application: $app_size"
            fi
            
            echo "  Manifest: $manifest"
            echo "--------------------------------------"
        fi
    done
}

# Confirmation function
confirm() {
    if [ "$FORCE" = true ]; then
        return 0
    fi
    
    echo -e "${YELLOW}WARNING: This will overwrite existing data!${NC}"
    echo -e "${YELLOW}Make sure you have a current backup before proceeding.${NC}"
    echo ""
    read -p "Are you sure you want to continue? (yes/no): " -r
    if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
        echo "Restore cancelled."
        exit 0
    fi
}

# Restore database
restore_database() {
    local backup_date=$1
    local db_file="$BACKUP_DIR/database_${backup_date}.sql.gz"
    
    if [ ! -f "$db_file" ]; then
        error "Database backup file not found: $db_file"
        return 1
    fi
    
    log "Restoring database from $db_file..."
    
    # Check if MySQL is accessible
    if ! mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" -e "SELECT 1;" >/dev/null 2>&1; then
        error "Cannot connect to MySQL server"
        return 1
    fi
    
    # Drop existing database and recreate
    warning "Dropping existing database: $DB_NAME"
    mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" -e "DROP DATABASE IF EXISTS $DB_NAME;"
    mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" -e "CREATE DATABASE $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
    
    # Restore from backup
    if zcat "$db_file" | mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD"; then
        log "Database restore completed successfully"
    else
        error "Database restore failed"
        return 1
    fi
}

# Restore Redis
restore_redis() {
    local backup_date=$1
    local redis_file="$BACKUP_DIR/redis_${backup_date}.rdb.gz"
    
    if [ ! -f "$redis_file" ]; then
        warning "Redis backup file not found: $redis_file"
        return 0
    fi
    
    log "Restoring Redis from $redis_file..."
    
    # Check if Redis is accessible
    if ! redis-cli -h "$REDIS_HOST" ping >/dev/null 2>&1; then
        error "Cannot connect to Redis server"
        return 1
    fi
    
    # Flush existing Redis data
    warning "Flushing existing Redis data"
    redis-cli -h "$REDIS_HOST" FLUSHALL
    
    # Extract and copy RDB file
    temp_rdb="/tmp/restore_dump.rdb"
    zcat "$redis_file" > "$temp_rdb"
    
    # Copy to Redis container (if using Docker)
    if command -v docker-compose >/dev/null 2>&1; then
        redis_container=$(docker-compose ps -q redis 2>/dev/null)
        if [ -n "$redis_container" ]; then
            docker cp "$temp_rdb" "$redis_container:/data/dump.rdb"
            docker-compose restart redis
            log "Redis restore completed successfully"
        else
            warning "Redis container not found, manual RDB file placement required"
        fi
    else
        warning "Docker not available, manual Redis restore required"
    fi
    
    rm -f "$temp_rdb"
}

# Restore application files
restore_files() {
    local backup_date=$1
    local app_file="$BACKUP_DIR/application_${backup_date}.tar.gz"
    local storage_file="$BACKUP_DIR/storage_${backup_date}.tar.gz"
    
    if [ ! -f "$app_file" ]; then
        error "Application backup file not found: $app_file"
        return 1
    fi
    
    log "Restoring application files from $app_file..."
    
    # Backup current .env file
    if [ -f "/var/www/html/.env" ]; then
        cp "/var/www/html/.env" "/tmp/.env.backup"
        log "Current .env file backed up to /tmp/.env.backup"
    fi
    
    # Extract application files
    cd /var/www/html
    tar -xzf "$app_file"
    
    # Restore .env file if it was backed up
    if [ -f "/tmp/.env.backup" ]; then
        mv "/tmp/.env.backup" "/var/www/html/.env"
        log ".env file restored"
    fi
    
    # Restore storage files if available
    if [ -f "$storage_file" ]; then
        log "Restoring storage files from $storage_file..."
        cd /var/www/html/storage/app
        tar -xzf "$storage_file"
    fi
    
    # Set proper permissions
    chown -R www-data:www-data /var/www/html
    chmod -R 755 /var/www/html
    chmod -R 775 /var/www/html/storage
    chmod -R 775 /var/www/html/bootstrap/cache
    
    log "Application files restore completed successfully"
}

# Run post-restore tasks
post_restore_tasks() {
    log "Running post-restore tasks..."
    
    cd /var/www/html
    
    # Clear all caches
    php artisan cache:clear
    php artisan config:clear
    php artisan route:clear
    php artisan view:clear
    
    # Regenerate optimized files
    php artisan config:cache
    php artisan route:cache
    php artisan view:cache
    
    # Run migrations (in case of schema updates)
    php artisan migrate --force
    
    # Restart queue workers
    php artisan queue:restart
    
    log "Post-restore tasks completed"
}

# Parse command line arguments
BACKUP_DATE=""
LIST_ONLY=false
FORCE=false
DATABASE_ONLY=false
REDIS_ONLY=false
FILES_ONLY=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -d|--backup-date)
            BACKUP_DATE="$2"
            shift 2
            ;;
        -l|--list)
            LIST_ONLY=true
            shift
            ;;
        -f|--force)
            FORCE=true
            shift
            ;;
        --database-only)
            DATABASE_ONLY=true
            shift
            ;;
        --redis-only)
            REDIS_ONLY=true
            shift
            ;;
        --files-only)
            FILES_ONLY=true
            shift
            ;;
        -h|--help)
            usage
            ;;
        *)
            error "Unknown option: $1"
            usage
            ;;
    esac
done

# Handle list option
if [ "$LIST_ONLY" = true ]; then
    list_backups
    exit 0
fi

# Validate backup date
if [ -z "$BACKUP_DATE" ]; then
    error "Backup date is required. Use -l to list available backups."
    usage
fi

# Check if backup exists
if [ ! -f "$BACKUP_DIR/manifest_${BACKUP_DATE}.txt" ]; then
    error "Backup not found for date: $BACKUP_DATE"
    echo "Use -l to list available backups."
    exit 1
fi

# Show backup information
info "Restoring from backup: $BACKUP_DATE"
if [ -f "$BACKUP_DIR/manifest_${BACKUP_DATE}.txt" ]; then
    echo "Backup Manifest:"
    cat "$BACKUP_DIR/manifest_${BACKUP_DATE}.txt"
    echo ""
fi

# Confirm restore
confirm

# Perform restore based on options
if [ "$DATABASE_ONLY" = true ]; then
    restore_database "$BACKUP_DATE"
elif [ "$REDIS_ONLY" = true ]; then
    restore_redis "$BACKUP_DATE"
elif [ "$FILES_ONLY" = true ]; then
    restore_files "$BACKUP_DATE"
else
    # Full restore
    restore_database "$BACKUP_DATE"
    restore_redis "$BACKUP_DATE"
    restore_files "$BACKUP_DATE"
    post_restore_tasks
fi

log "Restore process completed successfully!"

exit 0