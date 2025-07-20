# Dixis Marketplace - Production Deployment Guide

## Περιεχόμενα
1. [Προαπαιτούμενα](#προαπαιτούμενα)
2. [Αρχική Εγκατάσταση](#αρχική-εγκατάσταση)
3. [Docker Deployment](#docker-deployment)
4. [Παραμετροποίηση Environment](#παραμετροποίηση-environment)
5. [SSL & Security](#ssl--security)
6. [Backup & Monitoring](#backup--monitoring)
7. [Troubleshooting](#troubleshooting)

## Προαπαιτούμενα

### Server Requirements
- **OS**: Ubuntu 20.04+ LTS ή CentOS 8+
- **RAM**: Minimum 2GB, Recommended 4GB+
- **Storage**: Minimum 20GB SSD
- **CPU**: 2+ cores
- **Network**: Static IP address

### Software Dependencies
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Git
sudo apt install git -y

# Install Nginx (for reverse proxy)
sudo apt install nginx -y

# Install Certbot (for SSL)
sudo apt install certbot python3-certbot-nginx -y
```

## Αρχική Εγκατάσταση

### 1. Clone Repository
```bash
# Create application directory
sudo mkdir -p /var/www/dixis-marketplace
cd /var/www/dixis-marketplace

# Clone repository
git clone https://github.com/your-username/dixis-marketplace.git .

# Set permissions
sudo chown -R $USER:$USER /var/www/dixis-marketplace
```

### 2. Environment Configuration
```bash
# Copy production environment template
cp .env.production.example .env

# Edit environment variables
nano .env
```

**Κρίσιμες παράμετροι προς επεξεργασία:**
- `APP_URL`: Το domain σας
- `DB_*`: Database credentials
- `REDIS_PASSWORD`: Strong Redis password
- `MAIL_*`: Email configuration
- `STRIPE_*` / `PAYPAL_*`: Payment gateways
- `AWS_*`: S3 storage credentials

### 3. Generate Application Keys
```bash
# Generate Laravel app key
docker-compose run --rm app php artisan key:generate

# Generate JWT secret
docker-compose run --rm app php artisan jwt:secret
```

## Docker Deployment

### 1. Build και Start Services
```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Start services
docker-compose -f docker-compose.prod.yml up -d

# Check service status
docker-compose -f docker-compose.prod.yml ps
```

### 2. Database Setup
```bash
# Run migrations
docker-compose -f docker-compose.prod.yml exec app php artisan migrate --force

# Seed initial data
docker-compose -f docker-compose.prod.yml exec app php artisan db:seed --force

# Create storage link
docker-compose -f docker-compose.prod.yml exec app php artisan storage:link
```

### 3. Cache Optimization
```bash
# Cache configurations
docker-compose -f docker-compose.prod.yml exec app php artisan config:cache
docker-compose -f docker-compose.prod.yml exec app php artisan route:cache
docker-compose -f docker-compose.prod.yml exec app php artisan view:cache

# Generate IDE helper files (optional)
docker-compose -f docker-compose.prod.yml exec app php artisan ide-helper:generate
```

## Παραμετροποίηση Environment

### 1. Nginx Reverse Proxy
Δημιουργήστε το αρχείο `/etc/nginx/sites-available/dixis-marketplace`:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req zone=api burst=20 nodelay;
    
    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Static files optimization
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|pdf|txt)$ {
        proxy_pass http://localhost:8080;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Ενεργοποιήστε το site:
```bash
sudo ln -s /etc/nginx/sites-available/dixis-marketplace /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 2. SSL Certificate Setup
```bash
# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Setup auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## SSL & Security

### 1. Firewall Configuration
```bash
# Enable UFW
sudo ufw enable

# Allow essential ports
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443

# Check status
sudo ufw status
```

### 2. Security Hardening
```bash
# Disable unused services
sudo systemctl disable apache2 || true
sudo systemctl stop apache2 || true

# Update system packages regularly
sudo apt update && sudo apt upgrade -y

# Install fail2ban
sudo apt install fail2ban -y

# Configure fail2ban for nginx
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
# Edit /etc/fail2ban/jail.local and enable nginx sections
```

### 3. Database Security
```bash
# Secure MySQL installation
docker-compose -f docker-compose.prod.yml exec mysql mysql_secure_installation

# Create dedicated database user
docker-compose -f docker-compose.prod.yml exec mysql mysql -u root -p
```

SQL commands:
```sql
CREATE USER 'dixis_user'@'%' IDENTIFIED BY 'STRONG_PASSWORD';
GRANT ALL PRIVILEGES ON dixis_marketplace_prod.* TO 'dixis_user'@'%';
FLUSH PRIVILEGES;
```

## Backup & Monitoring

### 1. Automated Backups
```bash
# Make backup script executable
chmod +x docker/scripts/backup.sh

# Setup cron job for daily backups
sudo crontab -e
# Add: 0 2 * * * /var/www/dixis-marketplace/docker/scripts/backup.sh
```

### 2. Log Monitoring
```bash
# View application logs
docker-compose -f docker-compose.prod.yml logs -f app

# View nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Setup log rotation
sudo nano /etc/logrotate.d/dixis-marketplace
```

Log rotation configuration:
```
/var/www/dixis-marketplace/storage/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    notifempty
    create 0644 www-data www-data
    postrotate
        docker-compose -f /var/www/dixis-marketplace/docker-compose.prod.yml restart app
    endscript
}
```

### 3. Health Monitoring
Δημιουργήστε monitoring script `/var/www/dixis-marketplace/monitor.sh`:

```bash
#!/bin/bash
HEALTH_URL="https://your-domain.com/api/health"
WEBHOOK_URL="https://your-slack-webhook-url"

if ! curl -f -s $HEALTH_URL > /dev/null; then
    curl -X POST -H 'Content-type: application/json' \
        --data '{"text":"🚨 Dixis Marketplace is down!"}' \
        $WEBHOOK_URL
fi
```

Προσθέστε στο crontab:
```bash
# Check every 5 minutes
*/5 * * * * /var/www/dixis-marketplace/monitor.sh
```

## Deployment Commands

### 1. Quick Deployment Script
Χρησιμοποιήστε το `docker/scripts/deploy.sh`:

```bash
# Deploy latest version
./docker/scripts/deploy.sh

# Deploy specific version
./docker/scripts/deploy.sh --version=v1.2.3

# Deploy with database backup
./docker/scripts/deploy.sh --backup
```

### 2. Manual Deployment Steps
```bash
# Pull latest changes
git pull origin main

# Rebuild containers
docker-compose -f docker-compose.prod.yml build --no-cache

# Run migrations
docker-compose -f docker-compose.prod.yml exec app php artisan migrate --force

# Clear and rebuild cache
docker-compose -f docker-compose.prod.yml exec app php artisan cache:clear
docker-compose -f docker-compose.prod.yml exec app php artisan config:cache
docker-compose -f docker-compose.prod.yml exec app php artisan route:cache
docker-compose -f docker-compose.prod.yml exec app php artisan view:cache

# Restart services
docker-compose -f docker-compose.prod.yml restart
```

### 3. Zero-Downtime Deployment
```bash
# Scale up new instances
docker-compose -f docker-compose.prod.yml up -d --scale app=2

# Wait for health check
sleep 30

# Scale down old instances
docker-compose -f docker-compose.prod.yml up -d --scale app=1
```

## Troubleshooting

### 1. Common Issues

**Service won't start:**
```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs app

# Check disk space
df -h

# Check memory usage
free -h
```

**Database connection issues:**
```bash
# Test database connectivity
docker-compose -f docker-compose.prod.yml exec app php artisan tinker
>>> DB::connection()->getPdo();
```

**Permission issues:**
```bash
# Fix file permissions
sudo chown -R www-data:www-data storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache
```

### 2. Performance Optimization

**Enable OPcache:**
```bash
# Edit PHP configuration
docker-compose -f docker-compose.prod.yml exec app nano /usr/local/etc/php/conf.d/opcache.ini
```

**Database optimization:**
```bash
# Analyze slow queries
docker-compose -f docker-compose.prod.yml exec mysql mysqldumpslow /var/log/mysql/mysql-slow.log
```

**Redis optimization:**
```bash
# Monitor Redis performance
docker-compose -f docker-compose.prod.yml exec redis redis-cli monitor
```

### 3. Emergency Procedures

**Rollback deployment:**
```bash
# Use restore script
./docker/scripts/restore.sh -d BACKUP_DATE

# Or manual rollback
git checkout previous-stable-commit
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d
```

**Emergency maintenance mode:**
```bash
# Enable maintenance mode
docker-compose -f docker-compose.prod.yml exec app php artisan down --secret=emergency-access-token

# Disable maintenance mode
docker-compose -f docker-compose.prod.yml exec app php artisan up
```

## Production Checklist

### Pre-Deployment
- [ ] Environment variables configured
- [ ] SSL certificates installed
- [ ] Database credentials secured
- [ ] Backup system tested
- [ ] Monitoring setup verified
- [ ] Load testing completed

### Post-Deployment
- [ ] Application health check passed
- [ ] Database migrations successful
- [ ] File uploads working
- [ ] Email notifications working
- [ ] Payment processing tested
- [ ] Performance metrics baseline established

### Ongoing Maintenance
- [ ] Daily backup verification
- [ ] Weekly security updates
- [ ] Monthly performance review
- [ ] Quarterly disaster recovery test

## Support

Για τεχνική υποστήριξη:
- Email: admin@dixis-marketplace.com
- Documentation: https://docs.dixis-marketplace.com
- Issue Tracker: https://github.com/your-repo/issues

---
**Σημείωση**: Αυτός ο οδηγός παρέχει τα βασικά βήματα για production deployment. Προσαρμόστε τις ρυθμίσεις ανάλογα με τις ιδιαίτερες ανάγκες του server σας.