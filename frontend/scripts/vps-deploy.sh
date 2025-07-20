#!/bin/bash

# Dixis VPS Production Deployment Script
# Complete deployment to VPS with Docker, SSL, and monitoring

set -e

# Configuration
PROJECT_NAME="dixis-marketplace"
DOMAIN="${DOMAIN:-dixis.gr}"
VPS_USER="${VPS_USER:-dixis}"
VPS_HOST="${VPS_HOST:-your-vps-ip}"
APP_DIR="/var/www/dixis-marketplace"
FRONTEND_DIR="$APP_DIR/dixis-fresh"
BACKEND_DIR="$APP_DIR/backend"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if we can connect to VPS
    if ! ssh -o ConnectTimeout=10 "$VPS_USER@$VPS_HOST" "echo 'Connection test'" &> /dev/null; then
        error "Cannot connect to VPS. Please check SSH configuration."
    fi
    
    # Check Docker on VPS
    if ! ssh "$VPS_USER@$VPS_HOST" "command -v docker" &> /dev/null; then
        error "Docker is not installed on VPS"
    fi
    
    # Check Docker Compose on VPS
    if ! ssh "$VPS_USER@$VPS_HOST" "command -v docker-compose" &> /dev/null; then
        error "Docker Compose is not installed on VPS"
    fi
    
    success "Prerequisites check passed"
}

# Setup VPS environment
setup_vps_environment() {
    log "Setting up VPS environment..."
    
    ssh "$VPS_USER@$VPS_HOST" << 'EOF'
        # Create application directory
        sudo mkdir -p /var/www/dixis-marketplace
        sudo chown $USER:$USER /var/www/dixis-marketplace
        
        # Create necessary directories
        mkdir -p /var/www/dixis-marketplace/{logs,backups,ssl}
        
        # Install required packages
        sudo apt update
        sudo apt install -y nginx certbot python3-certbot-nginx ufw fail2ban
        
        # Configure firewall
        sudo ufw allow 22
        sudo ufw allow 80
        sudo ufw allow 443
        sudo ufw --force enable
        
        # Configure fail2ban
        sudo systemctl enable fail2ban
        sudo systemctl start fail2ban
EOF
    
    success "VPS environment setup completed"
}

# Deploy code to VPS
deploy_code() {
    log "Deploying code to VPS..."
    
    # Sync code to VPS
    rsync -avz --delete \
        --exclude 'node_modules' \
        --exclude '.next' \
        --exclude '.git' \
        --exclude 'logs' \
        --exclude 'backups' \
        ./ "$VPS_USER@$VPS_HOST:$APP_DIR/"
    
    # Sync backend code
    rsync -avz --delete \
        --exclude 'vendor' \
        --exclude 'storage/logs' \
        --exclude 'storage/framework/cache' \
        --exclude 'storage/framework/sessions' \
        --exclude 'storage/framework/views' \
        ../backend/ "$VPS_USER@$VPS_HOST:$BACKEND_DIR/"
    
    success "Code deployment completed"
}

# Setup environment files
setup_environment() {
    log "Setting up environment files..."
    
    ssh "$VPS_USER@$VPS_HOST" << EOF
        cd $FRONTEND_DIR
        
        # Create production environment file
        cat > .env.production << 'ENVEOF'
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://$DOMAIN/api
NEXT_PUBLIC_APP_URL=https://$DOMAIN
NEXT_TELEMETRY_DISABLED=1
ENVEOF

        cd $BACKEND_DIR
        
        # Create Laravel production environment
        if [ ! -f .env ]; then
            cp .env.example .env
            
            # Generate app key
            docker-compose -f docker-compose.prod.yml run --rm app php artisan key:generate --force
        fi
EOF
    
    success "Environment setup completed"
}

# Build and start services
build_and_start() {
    log "Building and starting services..."
    
    ssh "$VPS_USER@$VPS_HOST" << EOF
        cd $BACKEND_DIR
        
        # Build and start backend services
        docker-compose -f docker-compose.prod.yml build --no-cache
        docker-compose -f docker-compose.prod.yml up -d
        
        # Wait for services to be ready
        sleep 30
        
        # Run migrations
        docker-compose -f docker-compose.prod.yml exec -T app php artisan migrate --force
        
        # Optimize Laravel
        docker-compose -f docker-compose.prod.yml exec -T app php artisan config:cache
        docker-compose -f docker-compose.prod.yml exec -T app php artisan route:cache
        docker-compose -f docker-compose.prod.yml exec -T app php artisan view:cache
        
        cd $FRONTEND_DIR
        
        # Install frontend dependencies
        npm ci --production
        
        # Build frontend
        npm run build
        
        # Start frontend with PM2
        sudo npm install -g pm2
        pm2 delete dixis-frontend || true
        pm2 start npm --name "dixis-frontend" -- start
        pm2 save
        pm2 startup systemd -u $USER --hp /home/$USER
EOF
    
    success "Services build and start completed"
}

# Configure Nginx
configure_nginx() {
    log "Configuring Nginx..."
    
    ssh "$VPS_USER@$VPS_HOST" << EOF
        # Create Nginx configuration
        sudo tee /etc/nginx/sites-available/$DOMAIN << 'NGINXEOF'
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;
    
    # SSL Configuration (will be updated by Certbot)
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Frontend (Next.js)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # Backend API (Laravel)
    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Static files
    location /_next/static {
        proxy_pass http://localhost:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
NGINXEOF

        # Enable site
        sudo ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/
        sudo nginx -t
        sudo systemctl reload nginx
EOF
    
    success "Nginx configuration completed"
}

# Setup SSL
setup_ssl() {
    log "Setting up SSL certificate..."
    
    ssh "$VPS_USER@$VPS_HOST" << EOF
        # Obtain SSL certificate
        sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN
        
        # Setup auto-renewal
        (crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -
EOF
    
    success "SSL setup completed"
}

# Health check
health_check() {
    log "Performing health check..."
    
    # Check frontend
    if curl -f "https://$DOMAIN" &> /dev/null; then
        success "Frontend health check passed"
    else
        error "Frontend health check failed"
    fi
    
    # Check backend API
    if curl -f "https://$DOMAIN/api/health" &> /dev/null; then
        success "Backend API health check passed"
    else
        warning "Backend API health check failed (may be normal if endpoint doesn't exist)"
    fi
    
    success "Health checks completed"
}

# Setup monitoring
setup_monitoring() {
    log "Setting up monitoring..."
    
    ssh "$VPS_USER@$VPS_HOST" << 'EOF'
        # Create monitoring script
        cat > /home/$USER/monitor.sh << 'MONEOF'
#!/bin/bash
# Simple monitoring script

# Check services
docker-compose -f /var/www/dixis-marketplace/backend/docker-compose.prod.yml ps
pm2 status

# Check disk space
df -h

# Check memory
free -h

# Check logs for errors
tail -n 50 /var/log/nginx/error.log | grep -i error || echo "No recent nginx errors"
MONEOF

        chmod +x /home/$USER/monitor.sh
        
        # Setup cron for monitoring
        (crontab -l 2>/dev/null; echo "*/5 * * * * /home/$USER/monitor.sh >> /var/log/monitoring.log 2>&1") | crontab -
EOF
    
    success "Monitoring setup completed"
}

# Main deployment function
main() {
    log "Starting VPS deployment for $PROJECT_NAME"
    log "Domain: $DOMAIN"
    log "VPS: $VPS_USER@$VPS_HOST"
    log "=========================================="
    
    check_prerequisites
    setup_vps_environment
    deploy_code
    setup_environment
    build_and_start
    configure_nginx
    setup_ssl
    health_check
    setup_monitoring
    
    success "🎉 VPS deployment completed successfully!"
    log "Your application is now available at: https://$DOMAIN"
    log "=========================================="
}

# Handle script interruption
trap 'error "Deployment interrupted"' INT TERM

# Show usage
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    echo "Usage: $0 [options]"
    echo "Environment variables:"
    echo "  DOMAIN      - Domain name (default: dixis.gr)"
    echo "  VPS_USER    - VPS username (default: dixis)"
    echo "  VPS_HOST    - VPS IP address (required)"
    echo ""
    echo "Example:"
    echo "  DOMAIN=mydomain.com VPS_HOST=1.2.3.4 $0"
    exit 0
fi

# Check required environment variables
if [ -z "$VPS_HOST" ]; then
    error "VPS_HOST environment variable is required"
fi

# Run main function
main "$@"
