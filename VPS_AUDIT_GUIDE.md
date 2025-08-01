# 🔍 VPS CURRENT STATE AUDIT GUIDE

**Target Server**: 147.93.126.235 (Hostinger VPS)  
**SSH Key**: dixis_new_key  
**Purpose**: Understand current server state before deployment decision  

---

## 🚀 **STEP 1: CONNECT TO VPS**

```bash
# Connect to your VPS server
ssh -i ~/.ssh/dixis_new_key root@147.93.126.235

# If connection fails, try:
ssh -i dixis_new_key root@147.93.126.235
```

**Expected Result**: You should see Ubuntu/server welcome message

---

## 📊 **STEP 2: BASIC SERVER STATUS CHECK**

```bash
# Check server information
echo "=== SERVER INFO ==="
uname -a
cat /etc/os-release
df -h
free -h

# Check running services
echo "=== RUNNING SERVICES ==="
systemctl list-units --state=running --type=service | head -20

# Check network services
echo "=== NETWORK SERVICES ==="
netstat -tlnp | grep LISTEN

# Check processes
echo "=== TOP PROCESSES ==="
ps aux --sort=-%mem | head -10
```

---

## 🐳 **STEP 3: DOCKER STATUS CHECK**

```bash
# Check if Docker is installed
echo "=== DOCKER STATUS ==="
docker --version
docker-compose --version

# Check running containers
docker ps -a

# Check Docker images
docker images

# Check Docker networks
docker network ls

# Check Docker volumes
docker volume ls
```

---

## 📁 **STEP 4: FILE SYSTEM ANALYSIS**

```bash
# Check what's in root directory
echo "=== ROOT DIRECTORY ==="
ls -la /

# Check for web applications
echo "=== WEB APPLICATIONS ==="
ls -la /var/www/ 2>/dev/null || echo "No /var/www/"
ls -la /opt/ 2>/dev/null || echo "No /opt/"

# Check for dixis-related files
echo "=== DIXIS FILES ==="
find / -name "*dixis*" -type d 2>/dev/null | head -10
find / -name "*dixis*" -type f 2>/dev/null | head -10

# Check nginx/apache status
echo "=== WEB SERVERS ==="
systemctl status nginx 2>/dev/null || echo "Nginx not running"
systemctl status apache2 2>/dev/null || echo "Apache not running"
```

---

## 🗄️ **STEP 5: DATABASE STATUS CHECK**

```bash
# Check for PostgreSQL
echo "=== POSTGRESQL ==="
systemctl status postgresql 2>/dev/null || echo "PostgreSQL not running"
sudo -u postgres psql -l 2>/dev/null || echo "No PostgreSQL access"

# Check for MySQL
echo "=== MYSQL ==="
systemctl status mysql 2>/dev/null || echo "MySQL not running"
mysql -e "SHOW DATABASES;" 2>/dev/null || echo "No MySQL access"

# Check for database processes
ps aux | grep -E "(postgres|mysql)" | grep -v grep
```

---

## 🌐 **STEP 6: DOMAIN & SSL STATUS**

```bash
# Check domain configuration
echo "=== DOMAIN STATUS ==="
dig dixis.io @8.8.8.8
dig dixis.gr @8.8.8.8

# Check SSL certificates
echo "=== SSL CERTIFICATES ==="
ls -la /etc/letsencrypt/live/ 2>/dev/null || echo "No Let's Encrypt certs"
ls -la /etc/ssl/certs/dixis* 2>/dev/null || echo "No dixis SSL certs"

# Test HTTP response
echo "=== HTTP TEST ==="
curl -I http://147.93.126.235 2>/dev/null || echo "No HTTP response"
curl -I https://dixis.io 2>/dev/null || echo "No HTTPS response"
curl -I https://dixis.gr 2>/dev/null || echo "No dixis.gr HTTPS"
```

---

## 📋 **STEP 7: APPLICATION STATUS**

```bash
# Check for Laravel/PHP
echo "=== PHP/LARAVEL ==="
php --version 2>/dev/null || echo "PHP not installed"
composer --version 2>/dev/null || echo "Composer not installed"
find / -name "artisan" 2>/dev/null | head -5

# Check for Node.js/Next.js
echo "=== NODE.JS ==="
node --version 2>/dev/null || echo "Node.js not installed"
npm --version 2>/dev/null || echo "NPM not installed"
find / -name "package.json" 2>/dev/null | head -5

# Check for running web applications
echo "=== RUNNING APPS ==="
lsof -i :80 2>/dev/null || echo "Nothing on port 80"
lsof -i :443 2>/dev/null || echo "Nothing on port 443"
lsof -i :3000 2>/dev/null || echo "Nothing on port 3000"
lsof -i :8000 2>/dev/null || echo "Nothing on port 8000"
```

---

## 💾 **STEP 8: BACKUP EXISTING DATA (IMPORTANT)**

```bash
# Create backup directory
mkdir -p /root/dixis_backup_$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/root/dixis_backup_$(date +%Y%m%d_%H%M%S)"

# Backup databases if they exist
echo "=== CREATING BACKUPS ==="
if systemctl is-active --quiet postgresql; then
    sudo -u postgres pg_dumpall > "$BACKUP_DIR/postgresql_backup.sql"
    echo "PostgreSQL backup created"
fi

if systemctl is-active --quiet mysql; then
    mysqldump --all-databases > "$BACKUP_DIR/mysql_backup.sql" 2>/dev/null
    echo "MySQL backup created"
fi

# Backup web files
if [ -d "/var/www" ]; then
    tar -czf "$BACKUP_DIR/var_www_backup.tar.gz" /var/www/
    echo "Web files backup created"
fi

# Backup SSL certificates
if [ -d "/etc/letsencrypt" ]; then
    tar -czf "$BACKUP_DIR/ssl_certs_backup.tar.gz" /etc/letsencrypt/
    echo "SSL certificates backup created"
fi

echo "Backup directory: $BACKUP_DIR"
ls -la "$BACKUP_DIR"
```

---

## 📝 **STEP 9: SAVE AUDIT RESULTS**

```bash
# Create comprehensive audit report
AUDIT_FILE="/root/vps_audit_$(date +%Y%m%d_%H%M%S).txt"

echo "VPS AUDIT REPORT - $(date)" > "$AUDIT_FILE"
echo "=================================" >> "$AUDIT_FILE"
echo "" >> "$AUDIT_FILE"

# System info
echo "SYSTEM INFORMATION:" >> "$AUDIT_FILE"
uname -a >> "$AUDIT_FILE"
cat /etc/os-release >> "$AUDIT_FILE"
echo "" >> "$AUDIT_FILE"

# Resources
echo "SYSTEM RESOURCES:" >> "$AUDIT_FILE"
df -h >> "$AUDIT_FILE"
free -h >> "$AUDIT_FILE"
echo "" >> "$AUDIT_FILE"

# Docker status
echo "DOCKER STATUS:" >> "$AUDIT_FILE"
docker --version >> "$AUDIT_FILE" 2>&1
docker ps -a >> "$AUDIT_FILE" 2>&1
echo "" >> "$AUDIT_FILE"

# Running services
echo "RUNNING SERVICES:" >> "$AUDIT_FILE"
systemctl list-units --state=running --type=service >> "$AUDIT_FILE"
echo "" >> "$AUDIT_FILE"

# Network services
echo "NETWORK SERVICES:" >> "$AUDIT_FILE"
netstat -tlnp >> "$AUDIT_FILE" 2>&1

echo "Audit report saved: $AUDIT_FILE"
```

---

## 🎯 **STEP 10: DECISION MATRIX**

Based on the audit results, use this decision matrix:

### **🟢 KEEP EXISTING IF:**
- Docker is installed and working
- Databases contain valuable data
- Web applications are running correctly
- SSL certificates are valid
- No major resource conflicts

### **🔴 FRESH INSTALL IF:**
- System is cluttered with unused services
- Conflicting web servers (nginx + apache)
- Broken Docker installation
- Database corruption or access issues
- Expired SSL certificates
- High resource usage from unknown processes

---

## 📊 **AUDIT CHECKLIST**

After running all commands, answer these questions:

**System Health:**
- [ ] Server accessible via SSH?
- [ ] Sufficient resources (CPU, RAM, disk)?
- [ ] Ubuntu/Linux version compatible?

**Docker Status:**
- [ ] Docker installed and working?
- [ ] Any containers currently running?
- [ ] Docker Compose available?

**Conflicting Services:**
- [ ] Multiple web servers running?
- [ ] Conflicting database services?
- [ ] Unknown processes consuming resources?

**Existing Data:**
- [ ] Valuable databases to preserve?
- [ ] Important files in /var/www/?
- [ ] Valid SSL certificates?

**Domain/DNS:**
- [ ] dixis.io resolving to server?
- [ ] dixis.gr configured?
- [ ] HTTP/HTTPS responding?

---

## 🚀 **NEXT STEPS BASED ON RESULTS**

### **If Clean System (Recommended Path)**
```bash
# Run fresh installation
./deployment/vps/vps-fresh-install.sh
```

### **If System Has Valuable Data**
```bash
# Preserve data and selective cleanup
./deployment/vps/vps-selective-cleanup.sh

# Then deploy Docker stack
docker-compose -f docker-compose.production.yml up -d --build
```

### **If System is Heavily Used**
```bash
# Backup everything first
./deployment/vps/vps-backup-cleanup.sh

# Then fresh install
./deployment/vps/vps-fresh-install.sh
```

---

## 📞 **SUPPORT COMMANDS**

```bash
# Check audit report
cat /root/vps_audit_*.txt

# Check backup directory
ls -la /root/dixis_backup_*

# System overview
htop  # Press 'q' to exit

# Disk usage
du -sh /* | sort -hr
```

---

**🎯 Run this audit first, then report results for deployment strategy decision!**