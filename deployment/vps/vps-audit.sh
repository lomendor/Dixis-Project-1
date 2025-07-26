#!/bin/bash

# 🔍 Dixis VPS Comprehensive Audit Script
# Safe deployment assessment for dixis.io production server
# Context Engineering guided VPS analysis

set -e

echo "🔍 Starting Dixis VPS Comprehensive Audit..."
echo "============================================="

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
print_section() {
    echo -e "\n${PURPLE}==== $1 ====${NC}"
}

print_found() {
    echo -e "${GREEN}✅ FOUND: $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  WARNING: $1${NC}"
}

print_critical() {
    echo -e "${RED}🚨 CRITICAL: $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  INFO: $1${NC}"
}

print_note() {
    echo -e "${CYAN}📝 NOTE: $1${NC}"
}

# Results tracking
AUDIT_RESULTS="/tmp/dixis_vps_audit_$(date +%Y%m%d_%H%M%S).log"
CONFLICTS_FOUND=0
SERVICES_RUNNING=0
DATABASES_FOUND=0
WEBSITES_FOUND=0

log_result() {
    echo "$1" >> "$AUDIT_RESULTS"
}

# Start audit
echo "📋 Audit started at: $(date)"
echo "🖥️ Server: $(hostname)"
echo "👤 User: $(whoami)"
echo "📁 Working directory: $(pwd)"
echo ""

log_result "=== DIXIS VPS AUDIT REPORT ==="
log_result "Date: $(date)"
log_result "Server: $(hostname)"
log_result "User: $(whoami)"
log_result ""

# ==========================================
# 1. SYSTEM OVERVIEW
# ==========================================
print_section "SYSTEM OVERVIEW"

print_info "Operating System Information"
if [ -f /etc/os-release ]; then
    source /etc/os-release
    echo "  OS: $PRETTY_NAME"
    echo "  Version: $VERSION"
    log_result "OS: $PRETTY_NAME $VERSION"
else
    echo "  OS: $(uname -s) $(uname -r)"
    log_result "OS: $(uname -s) $(uname -r)"
fi

print_info "System Resources"
echo "  Memory: $(free -h | grep '^Mem:' | awk '{print $2}')"
echo "  Disk: $(df -h / | tail -1 | awk '{print $2}')"
echo "  Load: $(uptime | awk -F'load average:' '{print $2}')"

log_result "Memory: $(free -h | grep '^Mem:' | awk '{print $2}')"
log_result "Disk: $(df -h / | tail -1 | awk '{print $2}')"

# ==========================================
# 2. RUNNING SERVICES DISCOVERY
# ==========================================
print_section "RUNNING SERVICES DISCOVERY"

print_info "Web Servers"
if pgrep nginx > /dev/null; then
    print_found "Nginx is running"
    SERVICES_RUNNING=$((SERVICES_RUNNING + 1))
    log_result "SERVICE: Nginx - RUNNING"
    
    # Check nginx configuration
    if [ -f /etc/nginx/nginx.conf ]; then
        print_info "Nginx config found at /etc/nginx/nginx.conf"
        
        # Check for virtual hosts
        if [ -d /etc/nginx/sites-enabled ]; then
            VHOSTS=$(ls /etc/nginx/sites-enabled/ 2>/dev/null | wc -l)
            if [ $VHOSTS -gt 0 ]; then
                print_warning "Found $VHOSTS nginx virtual hosts"
                ls /etc/nginx/sites-enabled/
                WEBSITES_FOUND=$((WEBSITES_FOUND + VHOSTS))
                log_result "NGINX_VHOSTS: $VHOSTS found"
            fi
        fi
    fi
else
    print_info "Nginx not running"
    log_result "SERVICE: Nginx - NOT RUNNING"
fi

if pgrep apache2 > /dev/null || pgrep httpd > /dev/null; then
    print_found "Apache is running"
    SERVICES_RUNNING=$((SERVICES_RUNNING + 1))
    CONFLICTS_FOUND=$((CONFLICTS_FOUND + 1))
    print_warning "Apache + Nginx conflict possible on port 80/443"
    log_result "SERVICE: Apache - RUNNING (CONFLICT POSSIBLE)"
else
    print_info "Apache not running"
    log_result "SERVICE: Apache - NOT RUNNING"
fi

print_info "Database Servers"
if pgrep postgres > /dev/null; then
    print_found "PostgreSQL is running"
    SERVICES_RUNNING=$((SERVICES_RUNNING + 1))
    DATABASES_FOUND=$((DATABASES_FOUND + 1))
    log_result "DATABASE: PostgreSQL - RUNNING"
    
    # Check PostgreSQL databases
    if command -v psql > /dev/null; then
        print_info "Checking PostgreSQL databases..."
        sudo -u postgres psql -l 2>/dev/null | grep -E '^ [a-zA-Z]' | awk '{print "    " $1}' || echo "    Cannot access PostgreSQL"
    fi
else
    print_info "PostgreSQL not running"
    log_result "DATABASE: PostgreSQL - NOT RUNNING"
fi

if pgrep mysqld > /dev/null || pgrep mariadb > /dev/null; then
    print_found "MySQL/MariaDB is running"
    SERVICES_RUNNING=$((SERVICES_RUNNING + 1))
    DATABASES_FOUND=$((DATABASES_FOUND + 1))
    log_result "DATABASE: MySQL/MariaDB - RUNNING"
else
    print_info "MySQL/MariaDB not running"
    log_result "DATABASE: MySQL/MariaDB - NOT RUNNING"
fi

if pgrep redis > /dev/null; then
    print_found "Redis is running"
    SERVICES_RUNNING=$((SERVICES_RUNNING + 1))
    log_result "SERVICE: Redis - RUNNING"
else
    print_info "Redis not running"
    log_result "SERVICE: Redis - NOT RUNNING"
fi

print_info "PHP Services"
if pgrep php-fpm > /dev/null; then
    print_found "PHP-FPM is running"
    SERVICES_RUNNING=$((SERVICES_RUNNING + 1))
    log_result "SERVICE: PHP-FPM - RUNNING"
    
    # Check PHP version
    if command -v php > /dev/null; then
        PHP_VERSION=$(php -v | head -1 | awk '{print $2}')
        print_info "PHP Version: $PHP_VERSION"
        log_result "PHP_VERSION: $PHP_VERSION"
    fi
else
    print_info "PHP-FPM not running"
    log_result "SERVICE: PHP-FPM - NOT RUNNING"
fi

# ==========================================
# 3. PORT ANALYSIS
# ==========================================
print_section "PORT ANALYSIS"

print_info "Critical Ports Status"
PORTS=(80 443 8000 3000 5432 3306 6379 22)
PORT_CONFLICTS=()

for port in "${PORTS[@]}"; do
    if ss -tuln | grep ":$port " > /dev/null; then
        SERVICE=$(ss -tulnp | grep ":$port " | awk '{print $7}' | cut -d',' -f2 | cut -d'=' -f2 | head -1)
        print_warning "Port $port is occupied by: $SERVICE"
        log_result "PORT_CONFLICT: $port - $SERVICE"
        
        # Check for specific conflicts
        if [ "$port" = "8000" ]; then
            PORT_CONFLICTS+=("Laravel default port 8000 occupied")
            CONFLICTS_FOUND=$((CONFLICTS_FOUND + 1))
        elif [ "$port" = "80" ] || [ "$port" = "443" ]; then
            PORT_CONFLICTS+=("HTTP/HTTPS ports occupied")
            CONFLICTS_FOUND=$((CONFLICTS_FOUND + 1))
        fi
    else
        print_info "Port $port is free"
        log_result "PORT_FREE: $port"
    fi
done

# ==========================================
# 4. WEB APPLICATIONS DISCOVERY
# ==========================================
print_section "WEB APPLICATIONS DISCOVERY"

print_info "Scanning web directories..."

# Common web directories
WEB_DIRS=("/var/www" "/home/*/public_html" "/opt" "/srv/www" "/usr/share/nginx/html")

for dir_pattern in "${WEB_DIRS[@]}"; do
    for web_dir in $dir_pattern; do
        if [ -d "$web_dir" ]; then
            print_found "Web directory: $web_dir"
            
            # Check for Laravel applications
            find "$web_dir" -name "artisan" -type f 2>/dev/null | while read artisan_file; do
                laravel_dir=$(dirname "$artisan_file")
                print_warning "Laravel application found: $laravel_dir"
                WEBSITES_FOUND=$((WEBSITES_FOUND + 1))
                log_result "LARAVEL_APP: $laravel_dir"
                
                # Check if it's our Dixis app
                if [ -f "$laravel_dir/composer.json" ]; then
                    if grep -q "dixis" "$laravel_dir/composer.json" 2>/dev/null; then
                        print_critical "Existing Dixis application found!"
                        CONFLICTS_FOUND=$((CONFLICTS_FOUND + 1))
                        log_result "DIXIS_CONFLICT: Existing Dixis app at $laravel_dir"
                    fi
                fi
            done
            
            # Check for Node.js applications
            find "$web_dir" -name "package.json" -type f 2>/dev/null | while read package_file; do
                node_dir=$(dirname "$package_file")
                print_warning "Node.js application found: $node_dir"
                log_result "NODEJS_APP: $node_dir"
            done
            
            # Check for .env files
            find "$web_dir" -name ".env" -type f 2>/dev/null | while read env_file; do
                print_warning "Environment file found: $env_file"
                log_result "ENV_FILE: $env_file"
            done
        fi
    done
done

# ==========================================
# 5. DOMAIN & SSL CONFIGURATION
# ==========================================
print_section "DOMAIN & SSL CONFIGURATION"

print_info "Checking domain configuration for dixis.io"

# Check nginx sites for dixis.io
if [ -d /etc/nginx/sites-enabled ]; then
    if grep -r "dixis.io" /etc/nginx/sites-enabled/ 2>/dev/null; then
        print_found "dixis.io found in nginx configuration"
        log_result "DOMAIN: dixis.io configured in nginx"
    else
        print_info "dixis.io not found in nginx configuration"
        log_result "DOMAIN: dixis.io not configured"
    fi
fi

# Check for SSL certificates
print_info "SSL Certificates scan"
SSL_DIRS=("/etc/letsencrypt/live" "/etc/ssl/certs" "/etc/nginx/ssl")

for ssl_dir in "${SSL_DIRS[@]}"; do
    if [ -d "$ssl_dir" ]; then
        print_found "SSL directory: $ssl_dir"
        
        # Check for dixis.io certificates
        if find "$ssl_dir" -name "*dixis*" 2>/dev/null | grep -q .; then
            print_found "Dixis SSL certificates found in $ssl_dir"
            log_result "SSL: Dixis certificates found in $ssl_dir"
        fi
    fi
done

# ==========================================
# 6. SECURITY ASSESSMENT
# ==========================================
print_section "SECURITY ASSESSMENT"

print_info "Firewall Status"
if command -v ufw > /dev/null; then
    UFW_STATUS=$(ufw status | head -1)
    print_info "UFW: $UFW_STATUS"
    log_result "FIREWALL: UFW - $UFW_STATUS"
elif command -v iptables > /dev/null; then
    IPTABLES_RULES=$(iptables -L | wc -l)
    print_info "iptables rules: $IPTABLES_RULES"
    log_result "FIREWALL: iptables - $IPTABLES_RULES rules"
else
    print_warning "No firewall detected"
    log_result "FIREWALL: None detected"
fi

print_info "User Accounts"
USERS_WITH_SHELL=$(cat /etc/passwd | grep -E "/bin/(bash|sh|zsh)" | wc -l)
print_info "Users with shell access: $USERS_WITH_SHELL"
log_result "USERS_WITH_SHELL: $USERS_WITH_SHELL"

print_info "sudo Access"
if [ -f /etc/sudoers ]; then
    SUDO_USERS=$(grep -E "^[^#]*\s+ALL=\(ALL\)" /etc/sudoers | wc -l)
    print_info "Users with sudo access: $SUDO_USERS"
    log_result "SUDO_USERS: $SUDO_USERS"
fi

# ==========================================
# 7. CONFLICT ANALYSIS & RECOMMENDATIONS
# ==========================================
print_section "CONFLICT ANALYSIS & RECOMMENDATIONS"

log_result ""
log_result "=== CONFLICT ANALYSIS ==="
log_result "Total services running: $SERVICES_RUNNING"
log_result "Databases found: $DATABASES_FOUND"
log_result "Websites found: $WEBSITES_FOUND"
log_result "Conflicts detected: $CONFLICTS_FOUND"
log_result ""

print_info "Audit Summary"
echo "  Services running: $SERVICES_RUNNING"
echo "  Databases found: $DATABASES_FOUND"
echo "  Websites found: $WEBSITES_FOUND"
echo "  Conflicts detected: $CONFLICTS_FOUND"

echo ""
print_section "DEPLOYMENT STRATEGY RECOMMENDATIONS"

if [ $CONFLICTS_FOUND -eq 0 ]; then
    print_found "CLEAN DEPLOYMENT RECOMMENDED"
    echo "  ✅ No major conflicts detected"
    echo "  ✅ Safe to proceed with standard deployment"
    echo "  ✅ Use deploy-production.sh directly"
    log_result "RECOMMENDATION: Clean deployment - no conflicts"
    
elif [ $CONFLICTS_FOUND -le 2 ]; then
    print_warning "CAREFUL DEPLOYMENT RECOMMENDED"
    echo "  ⚠️  Minor conflicts detected"
    echo "  ⚠️  Consider backup before deployment"
    echo "  ⚠️  May need custom ports or directories"
    log_result "RECOMMENDATION: Careful deployment - minor conflicts"
    
else
    print_critical "COMPLEX DEPLOYMENT REQUIRED"
    echo "  🚨 Major conflicts detected"
    echo "  🚨 Backup existing applications first"
    echo "  🚨 Consider co-existence setup"
    echo "  🚨 Manual configuration required"
    log_result "RECOMMENDATION: Complex deployment - major conflicts"
fi

# ==========================================
# 8. DETAILED RECOMMENDATIONS
# ==========================================
print_section "DETAILED NEXT STEPS"

if [ ${#PORT_CONFLICTS[@]} -gt 0 ]; then
    print_warning "Port Conflict Resolution:"
    for conflict in "${PORT_CONFLICTS[@]}"; do
        echo "  - $conflict"
    done
fi

print_info "Suggested Actions:"

if [ $CONFLICTS_FOUND -eq 0 ]; then
    echo "  1. Run backup script (optional)"
    echo "  2. Update deployment scripts to dixis.io"
    echo "  3. Execute ./deploy-production.sh"
    echo "  4. Configure SSL for dixis.io"
    echo "  5. Test Greek market functionality"
    
elif [ $CONFLICTS_FOUND -le 2 ]; then
    echo "  1. BACKUP existing applications"
    echo "  2. Stop conflicting services temporarily"
    echo "  3. Update deployment scripts to dixis.io"
    echo "  4. Deploy with custom configuration"
    echo "  5. Restart services with new configs"
    
else
    echo "  1. FULL BACKUP of all applications"
    echo "  2. Document existing configurations"
    echo "  3. Choose co-existence strategy"
    echo "  4. Deploy to separate directory/port"
    echo "  5. Gradual migration plan"
fi

# ==========================================
# 9. BACKUP RECOMMENDATIONS
# ==========================================
print_section "BACKUP RECOMMENDATIONS"

print_info "Critical files to backup:"
echo "  - /etc/nginx/ (nginx configuration)"
echo "  - /var/www/ (web applications)"
echo "  - Database dumps"
echo "  - SSL certificates"
echo "  - Environment files (.env)"

print_info "Backup commands to run:"
echo "  sudo tar -czf /tmp/nginx_backup_\$(date +%Y%m%d).tar.gz /etc/nginx/"
echo "  sudo tar -czf /tmp/www_backup_\$(date +%Y%m%d).tar.gz /var/www/"
if [ $DATABASES_FOUND -gt 0 ]; then
    echo "  pg_dumpall > /tmp/postgres_backup_\$(date +%Y%m%d).sql"
fi

echo ""
print_section "AUDIT COMPLETE"
print_info "Full audit report saved to: $AUDIT_RESULTS"
print_info "Review the report and choose deployment strategy"

if [ $CONFLICTS_FOUND -eq 0 ]; then
    print_found "🚀 Ready for immediate deployment!"
elif [ $CONFLICTS_FOUND -le 2 ]; then
    print_warning "⚠️  Proceed with caution - backup first"
else
    print_critical "🛑 Plan carefully - complex deployment needed"
fi

echo ""
echo "📊 Final Score: $((10 - CONFLICTS_FOUND))/10 deployment readiness"
log_result ""
log_result "FINAL_SCORE: $((10 - CONFLICTS_FOUND))/10 deployment readiness"
log_result "AUDIT_COMPLETED: $(date)"

echo "================================="
echo "🔍 VPS Audit completed successfully"
echo "================================="