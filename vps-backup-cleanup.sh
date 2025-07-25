#!/bin/bash

# 🔐 Dixis VPS Backup & Cleanup Script
# Safe backup before complete cleanup for Greek market fresh install

set -e

echo "🔐 Starting Dixis VPS Backup & Cleanup Process..."
echo "=============================================="
echo "Target: dixis.io (147.93.126.235)"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

# Create backup directory with timestamp
BACKUP_DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/root/backups/pre-cleanup-${BACKUP_DATE}"

echo "==============================================="
echo "📦 PHASE 1: BACKUP VALUABLE CONFIGURATIONS"
echo "==============================================="
echo ""

print_info "Creating backup directory: $BACKUP_DIR"
mkdir -p "$BACKUP_DIR"
cd "$BACKUP_DIR"

# 1. Backup Nginx configuration
print_info "Backing up Nginx configuration..."
if [ -d /etc/nginx/sites-available ]; then
    if [ -f /etc/nginx/sites-available/dixis ]; then
        cp -r /etc/nginx/sites-available/dixis ./nginx-dixis-config
        print_status "Nginx config backed up"
    else
        print_warning "No dixis nginx config found"
    fi
fi

# 2. Backup environment files
print_info "Backing up environment files..."
if [ -f /var/www/dixis/backend/.env ]; then
    cp /var/www/dixis/backend/.env ./backend-env-backup
    print_status "Backend .env backed up"
    
    # Extract any existing API keys
    print_info "Extracting API credentials..."
    grep -E "(VIVA_|AFTERSALES_|STRIPE_)" ./backend-env-backup > ./api-credentials.txt 2>/dev/null || true
fi

if [ -f /var/www/dixis/frontend/.env.local ]; then
    cp /var/www/dixis/frontend/.env.local ./frontend-env-backup
    print_status "Frontend .env backed up"
fi

# 3. Backup PostgreSQL database
print_info "Backing up PostgreSQL database..."
if sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw dixis_production; then
    sudo -u postgres pg_dump dixis_production > ./postgres-dixis-backup.sql
    print_status "PostgreSQL database backed up"
    BACKUP_SIZE=$(du -h ./postgres-dixis-backup.sql | cut -f1)
    print_info "Database backup size: $BACKUP_SIZE"
else
    print_warning "No dixis_production database found"
fi

# 4. Backup SSL certificates
print_info "Backing up SSL certificates..."
if [ -d /etc/letsencrypt/live/dixis.io ]; then
    cp -r /etc/letsencrypt/live/dixis.io ./ssl-certificates
    cp -r /etc/letsencrypt/renewal/dixis.io.conf ./ssl-renewal-config 2>/dev/null || true
    print_status "SSL certificates backed up"
else
    print_warning "No SSL certificates found for dixis.io"
fi

# 5. Create system state snapshot
print_info "Creating system state snapshot..."
{
    echo "=== System State Snapshot ==="
    echo "Date: $(date)"
    echo "Hostname: $(hostname)"
    echo ""
    echo "=== Running Services ==="
    systemctl list-units --type=service --state=running
    echo ""
    echo "=== PHP Version ==="
    php -v
    echo ""
    echo "=== Node Version ==="
    node -v 2>/dev/null || echo "Node not found"
    echo ""
    echo "=== Database Versions ==="
    sudo -u postgres psql --version
    mysql --version 2>/dev/null || echo "MySQL not found"
    echo ""
    echo "=== Disk Usage ==="
    df -h
    echo ""
    echo "=== Memory Usage ==="
    free -h
} > ./system-state-snapshot.txt

print_status "System state snapshot created"

# 6. List backup contents
print_info "Backup completed. Contents:"
ls -la
echo ""
BACKUP_TOTAL_SIZE=$(du -sh . | cut -f1)
print_status "Total backup size: $BACKUP_TOTAL_SIZE"

echo ""
echo "==============================================="
echo "🧹 PHASE 2: CLEANUP PREPARATION"
echo "==============================================="
echo ""

# Show what will be removed
print_warning "The following will be PERMANENTLY REMOVED:"
echo "  - /var/www/dixis (entire application)"
echo "  - PostgreSQL: dixis_production database"
echo "  - MySQL/MariaDB (completely removed)"
echo "  - All Node.js processes"
echo "  - Port 8000 and 3000 services"
echo ""

print_info "Backup location: $BACKUP_DIR"
print_info "Backup includes: Nginx config, .env files, database, SSL certs"

echo ""
echo "==============================================="
echo "⚠️  SAFETY CHECK"
echo "==============================================="
echo ""
echo "Ready to proceed with COMPLETE CLEANUP?"
echo "This action is IRREVERSIBLE!"
echo ""
echo "Type 'CLEAN' to proceed with cleanup, or Ctrl+C to cancel:"
read -r CONFIRMATION

if [ "$CONFIRMATION" != "CLEAN" ]; then
    print_error "Cleanup cancelled. Backup preserved at: $BACKUP_DIR"
    exit 1
fi

echo ""
echo "==============================================="
echo "🗑️  PHASE 3: EXECUTING CLEANUP"
echo "==============================================="
echo ""

# 1. Stop all services
print_info "Stopping all services..."
systemctl stop nginx || true
systemctl stop php8.3-fpm || true
systemctl stop php8.2-fpm || true
systemctl stop php-fpm || true

# Stop Node.js processes
if command -v pm2 > /dev/null; then
    pm2 delete all 2>/dev/null || true
    pm2 kill || true
fi
pkill -f "node" || true
pkill -f "npm" || true

print_status "Services stopped"

# 2. Remove application directory
print_info "Removing application directory..."
if [ -d /var/www/dixis ]; then
    rm -rf /var/www/dixis
    print_status "Application directory removed"
else
    print_warning "Application directory not found"
fi

# 3. Clean databases
print_info "Cleaning databases..."

# PostgreSQL - only drop the dixis database
if sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw dixis_production; then
    sudo -u postgres psql -c "DROP DATABASE dixis_production;"
    print_status "PostgreSQL dixis_production dropped"
fi

# MySQL - complete removal
print_info "Removing MySQL/MariaDB completely..."
systemctl stop mysql 2>/dev/null || true
systemctl stop mariadb 2>/dev/null || true
apt-get remove --purge -y mysql-server mysql-client mysql-common mariadb-server mariadb-client 2>/dev/null || true
apt-get autoremove -y
rm -rf /var/lib/mysql
rm -rf /etc/mysql
print_status "MySQL/MariaDB removed"

# 4. Clean package caches
print_info "Cleaning package caches..."
apt-get clean
npm cache clean --force 2>/dev/null || true
composer clear-cache 2>/dev/null || true
print_status "Package caches cleaned"

# 5. Free up ports
print_info "Checking freed ports..."
for port in 8000 3000; do
    if ! ss -tuln | grep ":$port " > /dev/null; then
        print_status "Port $port is now free"
    else
        print_warning "Port $port may still be in use"
    fi
done

# 6. Clean old log files
print_info "Cleaning old logs..."
find /var/log -name "*.log" -type f -mtime +30 -delete 2>/dev/null || true
journalctl --vacuum-time=7d 2>/dev/null || true

echo ""
echo "==============================================="
echo "📊 CLEANUP SUMMARY"
echo "==============================================="
echo ""

# Show disk space recovered
DISK_AFTER=$(df -h / | tail -1 | awk '{print $4}')
print_status "Free disk space: $DISK_AFTER"

# Show running services
SERVICES_COUNT=$(systemctl list-units --type=service --state=running | wc -l)
print_status "Running services: $SERVICES_COUNT"

# Verify removals
if [ ! -d /var/www/dixis ]; then
    print_status "Application directory removed successfully"
fi

if ! command -v mysql > /dev/null; then
    print_status "MySQL removed successfully"
fi

echo ""
echo "==============================================="
echo "✅ CLEANUP COMPLETED SUCCESSFULLY"
echo "==============================================="
echo ""
print_info "Backup preserved at: $BACKUP_DIR"
print_info "Server is now ready for fresh Greek market installation"
print_info "Next step: Run fresh installation script"
echo ""
echo "🚀 Ready for clean Dixis Greek Market deployment!"
echo "================================================"