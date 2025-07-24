# 🚀 Dixis Production Deployment Guide

**Platform**: Greek Traditional Products E-commerce Marketplace  
**Stack**: Laravel 12.19.3 + Next.js 15.3.2 + PostgreSQL + Redis  
**Deployment**: Docker Compose Production Setup  

---

## 📋 Pre-Deployment Checklist

### **✅ Prerequisites**
- [ ] **Docker & Docker Compose** installed
- [ ] **Domain names** configured (dixis.io, api.dixis.io, admin.dixis.io)
- [ ] **SSL certificates** ready (Let's Encrypt or purchased)
- [ ] **Environment variables** configured (.env.production)
- [ ] **Database backup** of existing data (if applicable)
- [ ] **Payment gateway** configured (Stripe production keys)

### **🔐 Security Requirements**
- [ ] **Strong passwords** for all services
- [ ] **Firewall rules** configured (ports 80, 443, 22 only)
- [ ] **SSH key authentication** enabled
- [ ] **Regular backups** scheduled
- [ ] **Monitoring alerts** configured

---

## 🛠️ Installation Steps

### **Step 1: Server Preparation**

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

### **Step 2: Project Setup**

```bash
# Clone repository
git clone https://github.com/your-org/dixis-platform.git
cd dixis-platform/

# Copy environment template
cp .env.production.template .env.production

# Edit configuration (IMPORTANT: Update all values!)
nano .env.production
```

### **Step 3: SSL Certificates**

**Option A: Let's Encrypt (Recommended)**
```bash
# Install Certbot
sudo apt install certbot

# Generate certificates
sudo certbot certonly --standalone -d dixis.io -d www.dixis.io -d api.dixis.io -d admin.dixis.io

# Copy certificates to project
sudo cp /etc/letsencrypt/live/dixis.io/fullchain.pem ssl/cert.pem
sudo cp /etc/letsencrypt/live/dixis.io/privkey.pem ssl/private.key
sudo openssl dhparam -out ssl/dhparam.pem 2048
```

**Option B: Self-Signed (Development Only)**
```bash
# The deployment script will generate these automatically
# if SSL certificates are not found
```

### **Step 4: Production Deployment**

```bash
# Run deployment script
./scripts/production-deploy.sh

# Monitor deployment
docker-compose -f docker-compose.production.yml logs -f
```

---

## 🔧 Configuration Guide

### **Environment Variables (.env.production)**

#### **Critical Settings (MUST CHANGE)**
```env
# Application
APP_KEY=base64:your-32-character-app-key-here
APP_URL=https://dixis.io

# Database
DB_PASSWORD=your-secure-database-password-here

# Redis
REDIS_PASSWORD=your-redis-password-here

# Payment Gateway (PRODUCTION KEYS)
STRIPE_KEY=pk_live_your_live_publishable_key
STRIPE_SECRET=sk_live_your_live_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Email Service
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password

# NextAuth
NEXTAUTH_SECRET=your-nextauth-secret-key-here

# JWT
JWT_SECRET=your-32-character-jwt-secret-here

# Monitoring
GRAFANA_PASSWORD=your-grafana-admin-password
```

#### **Generate Secure Keys**
```bash
# Laravel App Key
php artisan key:generate --show

# JWT Secret (32 characters)
openssl rand -base64 32

# NextAuth Secret (32 characters)
openssl rand -base64 32
```

### **Domain Configuration**

#### **DNS Records**
```
A     dixis.io           → YOUR_SERVER_IP
A     www.dixis.io       → YOUR_SERVER_IP
A     api.dixis.io       → YOUR_SERVER_IP
A     admin.dixis.io     → YOUR_SERVER_IP
CNAME monitoring.dixis.io → dixis.io  (optional)
```

#### **Firewall Setup**
```bash
# Ubuntu/Debian
sudo ufw allow 22/tcp      # SSH
sudo ufw allow 80/tcp      # HTTP
sudo ufw allow 443/tcp     # HTTPS
sudo ufw enable

# Block all other ports
sudo ufw default deny incoming
sudo ufw default allow outgoing
```

---

## 🚀 Deployment Process

### **Automated Deployment**

The deployment script (`scripts/production-deploy.sh`) handles:

1. **Pre-deployment checks** - Verifies requirements
2. **Directory creation** - Sets up logging and storage directories
3. **SSL certificate generation** - Creates self-signed certs if needed
4. **Monitoring setup** - Configures Prometheus, Grafana, Loki
5. **Service deployment** - Builds and starts all services
6. **Database migration** - Runs Laravel migrations
7. **Cache optimization** - Optimizes Laravel caches
8. **Health checks** - Verifies all services are running
9. **Information display** - Shows access URLs and commands

### **Manual Deployment Steps**

If you prefer manual control:

```bash
# 1. Build images
docker-compose -f docker-compose.production.yml build

# 2. Start services
docker-compose -f docker-compose.production.yml up -d

# 3. Run migrations
docker-compose -f docker-compose.production.yml exec backend php artisan migrate --force

# 4. Optimize Laravel
docker-compose -f docker-compose.production.yml exec backend php artisan config:cache
docker-compose -f docker-compose.production.yml exec backend php artisan route:cache
docker-compose -f docker-compose.production.yml exec backend php artisan view:cache

# 5. Check status
docker-compose -f docker-compose.production.yml ps
```

---

## 📊 Monitoring & Access

### **Service Access Points**

| Service | URL | Credentials |
|---------|-----|-------------|
| **Frontend** | https://dixis.io | Public access |
| **Admin Panel** | https://admin.dixis.io | Admin login required |
| **API** | https://api.dixis.io | API authentication |
| **Grafana** | http://YOUR_IP:3001 | admin / [GRAFANA_PASSWORD] |
| **Prometheus** | http://YOUR_IP:9090 | No authentication |

### **Health Check Endpoints**

```bash
# Frontend health
curl https://dixis.io

# Backend health
curl https://api.dixis.io/health

# Database connection
curl https://api.dixis.io/api/v1/products?limit=1

# Monitoring
curl http://YOUR_IP:9090/targets
curl http://YOUR_IP:3001/api/health
```

### **Log Monitoring**

```bash
# View all logs
docker-compose -f docker-compose.production.yml logs -f

# Specific service logs
docker-compose -f docker-compose.production.yml logs -f backend
docker-compose -f docker-compose.production.yml logs -f frontend
docker-compose -f docker-compose.production.yml logs -f postgres
docker-compose -f docker-compose.production.yml logs -f nginx

# System logs
sudo journalctl -u docker -f
```

---

## 🔄 Maintenance Operations

### **Backup Operations**

```bash
# Manual backup
./scripts/backup.sh

# Schedule automatic backups (add to crontab)
0 2 * * * /path/to/dixis-platform/scripts/backup.sh

# Restore from backup
gunzip -c /backups/dixis_db_YYYYMMDD_HHMMSS.sql.gz | docker-compose -f docker-compose.production.yml exec -T postgres psql -U dixis_user -d dixis_production
```

### **Updates & Upgrades**

```bash
# Pull latest code
git pull origin main

# Rebuild and redeploy
docker-compose -f docker-compose.production.yml down
docker-compose -f docker-compose.production.yml build --no-cache
docker-compose -f docker-compose.production.yml up -d

# Run any new migrations
docker-compose -f docker-compose.production.yml exec backend php artisan migrate --force
```

### **Performance Optimization**

```bash
# Clear all caches
docker-compose -f docker-compose.production.yml exec backend php artisan cache:clear
docker-compose -f docker-compose.production.yml exec backend php artisan config:clear
docker-compose -f docker-compose.production.yml exec backend php artisan route:clear
docker-compose -f docker-compose.production.yml exec backend php artisan view:clear

# Rebuild optimized caches
docker-compose -f docker-compose.production.yml exec backend php artisan config:cache
docker-compose -f docker-compose.production.yml exec backend php artisan route:cache
docker-compose -f docker-compose.production.yml exec backend php artisan view:cache

# Optimize Composer autoloader
docker-compose -f docker-compose.production.yml exec backend composer install --optimize-autoloader --no-dev
```

---

## 🚨 Troubleshooting

### **Common Issues**

#### **Services Not Starting**
```bash
# Check service status
docker-compose -f docker-compose.production.yml ps

# View specific service logs
docker-compose -f docker-compose.production.yml logs [service-name]

# Restart specific service
docker-compose -f docker-compose.production.yml restart [service-name]
```

#### **Database Connection Issues**
```bash
# Check PostgreSQL logs
docker-compose -f docker-compose.production.yml logs postgres

# Test database connection
docker-compose -f docker-compose.production.yml exec postgres psql -U dixis_user -d dixis_production -c "SELECT version();"

# Reset database connection
docker-compose -f docker-compose.production.yml restart postgres backend
```

#### **SSL/HTTPS Issues**
```bash
# Check SSL certificates
openssl x509 -in ssl/cert.pem -text -noout

# Test SSL connection
openssl s_client -connect dixis.io:443

# Renew Let's Encrypt certificates
sudo certbot renew
sudo systemctl reload nginx
```

#### **Memory/Performance Issues**
```bash
# Check resource usage
docker stats

# Monitor system resources
htop
free -h
df -h

# Optimize database
docker-compose -f docker-compose.production.yml exec postgres psql -U dixis_user -d dixis_production -c "VACUUM ANALYZE;"
```

### **Emergency Procedures**

#### **Quick Rollback**
```bash
# Stop current deployment
docker-compose -f docker-compose.production.yml down

# Restore from backup
# (Follow backup restore procedures above)

# Start services
docker-compose -f docker-compose.production.yml up -d
```

#### **Database Recovery**
```bash
# If database is corrupted, restore from latest backup
docker-compose -f docker-compose.production.yml exec postgres pg_restore -U dixis_user -d dixis_production /backups/latest_backup.sql
```

---

## 📈 Performance Tuning

### **Database Optimization**

```sql
-- PostgreSQL tuning (execute in database)
-- These are handled automatically in the production setup

-- Check connection usage
SELECT count(*) FROM pg_stat_activity;

-- Analyze query performance
SELECT query, mean_time, calls FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;

-- Optimize frequently accessed tables
VACUUM ANALYZE products;
VACUUM ANALYZE orders;
VACUUM ANALYZE users;
```

### **Redis Optimization**

```bash
# Check Redis memory usage
docker-compose -f docker-compose.production.yml exec redis redis-cli info memory

# Monitor Redis performance
docker-compose -f docker-compose.production.yml exec redis redis-cli monitor

# Optimize Redis configuration (already done in config/redis/redis.conf)
```

### **Load Testing**

```bash
# Run basic load test
./scripts/load-test.sh http://localhost 60s 10 basic

# Run comprehensive performance test
./scripts/load-test.sh https://dixis.io 300s 50 full

# Monitor during load test
docker-compose -f docker-compose.production.yml exec backend php artisan queue:work --verbose
```

---

## 🔐 Security Hardening

### **Server Security**

```bash
# Disable root SSH login
sudo sed -i 's/PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
sudo systemctl reload sshd

# Configure fail2ban
sudo apt install fail2ban
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local

# Set up automatic security updates
sudo apt install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

### **Application Security**

```bash
# Rotate Laravel app key (CAUTION: Will invalidate all sessions)
docker-compose -f docker-compose.production.yml exec backend php artisan key:generate --force

# Update Composer dependencies
docker-compose -f docker-compose.production.yml exec backend composer update --no-dev

# Scan for vulnerabilities
docker-compose -f docker-compose.production.yml exec backend composer audit
```

---

## 📞 Support & Maintenance

### **Maintenance Schedule**

- **Daily**: Automated backups (2:00 AM)
- **Weekly**: Log rotation and cleanup
- **Monthly**: Security updates and dependency updates
- **Quarterly**: Full system audit and performance review

### **Contact Information**

- **Technical Support**: [your-email@dixis.io]
- **Emergency Contact**: [emergency-phone]
- **Documentation**: [internal-wiki-url]
- **Monitoring**: [monitoring-dashboard-url]

---

## 📝 Changelog

### **Version 1.0.0** (2025-07-24)
- Initial production deployment setup
- Complete Docker containerization
- Monitoring and logging implementation
- Automated backup system
- Load testing framework
- Security hardening guidelines

---

**🎯 Production Ready**: This deployment guide provides enterprise-grade setup for the Dixis marketplace platform with comprehensive monitoring, security, and maintenance procedures.

**📊 Success Metrics**: 
- **High Availability**: 99.9% uptime target
- **Performance**: <2s page load times
- **Security**: Zero security incidents
- **Scalability**: Handle 1000+ concurrent users

**🚀 Next Steps**: After successful deployment, focus on user onboarding, marketing campaigns, and feature enhancements based on user feedback.