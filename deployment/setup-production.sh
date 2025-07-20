#!/bin/bash

# Dixis Production Environment Setup Script
# Usage: sudo ./setup-production.sh

set -e

LOG_FILE="/var/log/dixis-setup.log"

echo "🚀 Setting up Dixis Production Environment"
echo "$(date): Starting production setup" >> $LOG_FILE

# Function to log messages
log() {
    echo "$(date): $1" | tee -a $LOG_FILE
}

# Function to handle errors
error_exit() {
    log "ERROR: $1"
    exit 1
}

# Check if running as root
if [[ $EUID -ne 0 ]]; then
    error_exit "This script must be run as root (use sudo)"
fi

# Update system
log "Updating system packages..."
apt update && apt upgrade -y

# Install essential packages
log "Installing essential packages..."
apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release

# Install Nginx
log "Installing Nginx..."
apt install -y nginx
systemctl enable nginx
systemctl start nginx

# Install PHP 8.1 and extensions
log "Installing PHP 8.1 and extensions..."
add-apt-repository ppa:ondrej/php -y
apt update
apt install -y php8.1 php8.1-fpm php8.1-cli php8.1-common php8.1-mysql php8.1-zip php8.1-gd php8.1-mbstring php8.1-curl php8.1-xml php8.1-bcmath php8.1-pgsql php8.1-redis

# Install Composer
log "Installing Composer..."
curl -sS https://getcomposer.org/installer | php
mv composer.phar /usr/local/bin/composer
chmod +x /usr/local/bin/composer

# Install Node.js 18
log "Installing Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Install PostgreSQL
log "Installing PostgreSQL..."
apt install -y postgresql postgresql-contrib

# Install Redis
log "Installing Redis..."
apt install -y redis-server
systemctl enable redis-server
systemctl start redis-server

# Install PM2
log "Installing PM2..."
npm install -g pm2

# Install Certbot for SSL
log "Installing Certbot..."
apt install -y certbot python3-certbot-nginx

# Configure PostgreSQL
log "Configuring PostgreSQL..."
sudo -u postgres psql -c "CREATE DATABASE dixis_production;"
sudo -u postgres psql -c "CREATE USER dixis_user WITH PASSWORD 'dixis_secure_password_2024';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE dixis_production TO dixis_user;"

# Configure PHP-FPM
log "Configuring PHP-FPM..."
sed -i 's/;cgi.fix_pathinfo=1/cgi.fix_pathinfo=0/' /etc/php/8.1/fpm/php.ini
systemctl restart php8.1-fpm

# Create project directories
log "Creating project directories..."
mkdir -p /var/www/dixis-backend
mkdir -p /var/www/dixis-frontend
mkdir -p /backups/dixis
mkdir -p /var/log/dixis

# Set proper ownership
chown -R www-data:www-data /var/www/
chown -R www-data:www-data /backups/dixis

# Configure firewall
log "Configuring firewall..."
ufw --force enable
ufw allow 22/tcp   # SSH
ufw allow 80/tcp   # HTTP
ufw allow 443/tcp  # HTTPS

# Install fail2ban
log "Installing fail2ban..."
apt install -y fail2ban
systemctl enable fail2ban
systemctl start fail2ban

# Create Nginx configuration
log "Creating Nginx configuration..."
cat > /etc/nginx/sites-available/dixis.io << 'EOF'
server {
    listen 80;
    server_name dixis.io www.dixis.io;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name dixis.io www.dixis.io;
    
    # SSL configuration will be added by Certbot
    
    # Frontend (Next.js)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# API subdomain
server {
    listen 443 ssl http2;
    server_name api.dixis.io;
    
    # SSL configuration will be added by Certbot
    
    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Enable the site
ln -sf /etc/nginx/sites-available/dixis.io /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t

# Restart Nginx
systemctl restart nginx

# Create backup script
log "Creating backup script..."
cat > /usr/local/bin/backup-dixis.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/dixis"

# Database backup
sudo -u postgres pg_dump dixis_production > $BACKUP_DIR/dixis_db_$DATE.sql

# Application backup
tar -czf $BACKUP_DIR/dixis_app_$DATE.tar.gz /var/www/dixis-backend /var/www/dixis-frontend

# Clean old backups (keep 7 days)
find $BACKUP_DIR -name "dixis_db_*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "dixis_app_*.tar.gz" -mtime +7 -delete

echo "$(date): Backup completed - $DATE" >> /var/log/dixis-backup.log
EOF

chmod +x /usr/local/bin/backup-dixis.sh

# Add backup to crontab
(crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/backup-dixis.sh") | crontab -

# Create monitoring script
log "Creating monitoring script..."
cat > /usr/local/bin/monitor-dixis.sh << 'EOF'
#!/bin/bash

# Check if services are running
services=("nginx" "php8.1-fpm" "postgresql" "redis-server")

for service in "${services[@]}"; do
    if ! systemctl is-active --quiet $service; then
        echo "$(date): WARNING - $service is not running" >> /var/log/dixis-monitor.log
        systemctl restart $service
    fi
done

# Check if PM2 processes are running
if ! pm2 list | grep -q "dixis-frontend"; then
    echo "$(date): WARNING - PM2 dixis-frontend is not running" >> /var/log/dixis-monitor.log
fi

# Check disk space
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 80 ]; then
    echo "$(date): WARNING - Disk usage is ${DISK_USAGE}%" >> /var/log/dixis-monitor.log
fi
EOF

chmod +x /usr/local/bin/monitor-dixis.sh

# Add monitoring to crontab
(crontab -l 2>/dev/null; echo "*/5 * * * * /usr/local/bin/monitor-dixis.sh") | crontab -

log "✅ Production environment setup completed!"
log "🔧 Next steps:"
log "1. Run SSL certificate setup: certbot --nginx -d dixis.io -d www.dixis.io -d api.dixis.io"
log "2. Deploy backend: ./deploy-backend.sh"
log "3. Deploy frontend: ./deploy-frontend.sh"
log "4. Test the application"

echo "Setup log available at: $LOG_FILE"
echo "🎉 Production environment is ready!"