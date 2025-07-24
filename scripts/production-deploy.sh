#!/bin/bash

# Dixis Production Deployment Script
# Usage: ./scripts/production-deploy.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="dixis"
DEPLOY_DATE=$(date +%Y%m%d_%H%M%S)
LOG_FILE="deployment_${DEPLOY_DATE}.log"

# Functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a $LOG_FILE
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a $LOG_FILE
    exit 1
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a $LOG_FILE
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a $LOG_FILE
}

# Pre-deployment checks
check_requirements() {
    log "Checking deployment requirements..."
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed. Please install Docker first."
    fi
    
    # Check if Docker Compose is installed
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose is not installed. Please install Docker Compose first."
    fi
    
    # Check if .env.production exists
    if [ ! -f .env.production ]; then
        error ".env.production file not found. Please copy .env.production.template to .env.production and configure it."
    fi
    
    # Check if SSL certificates exist (for production)
    if [ ! -d ssl ] || [ ! -f ssl/cert.pem ] || [ ! -f ssl/private.key ]; then
        warning "SSL certificates not found in ssl/ directory. HTTPS will not work properly."
        warning "Please add your SSL certificates or generate self-signed ones for testing."
    fi
    
    success "All requirements check passed"
}

# Create necessary directories
create_directories() {
    log "Creating necessary directories..."
    
    mkdir -p logs/nginx
    mkdir -p logs/backend
    mkdir -p logs/frontend
    mkdir -p logs/queue
    mkdir -p logs/scheduler
    mkdir -p uploads
    mkdir -p backups
    mkdir -p monitoring/grafana/dashboards
    mkdir -p monitoring/grafana/datasources
    mkdir -p config/redis
    
    success "Directories created"
}

# Generate SSL certificates if they don't exist
generate_ssl() {
    if [ ! -d ssl ]; then
        log "Generating self-signed SSL certificates for development..."
        mkdir -p ssl
        
        openssl req -x509 -newkey rsa:4096 -keyout ssl/private.key -out ssl/cert.pem -days 365 -nodes \
            -subj "/C=GR/ST=Attica/L=Athens/O=Dixis/CN=dixis.io"
        
        # Generate DH parameters
        openssl dhparam -out ssl/dhparam.pem 2048
        
        success "Self-signed SSL certificates generated"
    fi
}

# Configure monitoring
setup_monitoring() {
    log "Setting up monitoring configuration..."
    
    # Prometheus configuration
    cat > monitoring/prometheus.yml << 'EOF'
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "alert_rules.yml"

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'dixis-backend'
    static_configs:
      - targets: ['backend:8000']
    metrics_path: '/metrics'
    scrape_interval: 30s

  - job_name: 'dixis-frontend'
    static_configs:
      - targets: ['frontend:3000']
    metrics_path: '/api/metrics'
    scrape_interval: 30s

  - job_name: 'redis'
    static_configs:
      - targets: ['redis:6379']

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres:5432']
EOF

    # Alert rules
    cat > monitoring/alert_rules.yml << 'EOF'
groups:
  - name: dixis_alerts
    rules:
      - alert: HighMemoryUsage
        expr: (1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100 > 80
        for: 2m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage detected"
          description: "Memory usage is above 80%"

      - alert: HighCPUUsage
        expr: 100 - (avg by(instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 80
        for: 2m
        labels:
          severity: warning
        annotations:
          summary: "High CPU usage detected"
          description: "CPU usage is above 80%"

      - alert: ServiceDown
        expr: up == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Service {{ $labels.job }} is down"
          description: "Service {{ $labels.job }} has been down for more than 1 minute"
EOF

    # Grafana datasource
    mkdir -p monitoring/grafana/datasources
    cat > monitoring/grafana/datasources/prometheus.yml << 'EOF'
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
EOF

    # Loki configuration
    cat > monitoring/loki-config.yml << 'EOF'
auth_enabled: false

server:
  http_listen_port: 3100

ingester:
  lifecycler:
    address: 127.0.0.1
    ring:
      kvstore:
        store: inmemory
      replication_factor: 1

schema_config:
  configs:
    - from: 2020-10-24
      store: boltdb-shipper
      object_store: filesystem
      schema: v11
      index:
        prefix: index_
        period: 24h

storage_config:
  boltdb_shipper:
    active_index_directory: /loki/boltdb-shipper-active
    cache_location: /loki/boltdb-shipper-cache
    shared_store: filesystem
  filesystem:
    directory: /loki/chunks

limits_config:
  enforce_metric_name: false
  reject_old_samples: true
  reject_old_samples_max_age: 168h
EOF

    # Promtail configuration
    cat > monitoring/promtail-config.yml << 'EOF'
server:
  http_listen_port: 9080
  grpc_listen_port: 0

positions:
  filename: /tmp/positions.yaml

clients:
  - url: http://loki:3100/loki/api/v1/push

scrape_configs:
  - job_name: dixis-logs
    static_configs:
      - targets:
          - localhost
        labels:
          job: dixis-logs
          __path__: /var/log/dixis/*.log
EOF

    # Redis configuration
    cat > config/redis/redis.conf << 'EOF'
# Redis configuration for production
bind 0.0.0.0
port 6379
timeout 0
tcp-keepalive 300

# Memory and persistence
save 900 1
save 300 10
save 60 10000
stop-writes-on-bgsave-error yes
rdbcompression yes
rdbchecksum yes
dbfilename dump.rdb
dir /data

# Logging
loglevel notice
logfile ""

# Security
rename-command FLUSHDB ""
rename-command FLUSHALL ""
rename-command DEBUG ""
rename-command CONFIG ""
EOF

    success "Monitoring configuration completed"
}

# Build and deploy
deploy() {
    log "Starting deployment..."
    
    # Stop existing containers
    log "Stopping existing containers..."
    docker-compose -f docker-compose.production.yml down 2>/dev/null || true
    
    # Remove old images (optional, uncomment if you want to force rebuild)
    # docker-compose -f docker-compose.production.yml build --no-cache
    
    # Pull latest images and build
    log "Building application images..."
    docker-compose -f docker-compose.production.yml build
    
    # Start services
    log "Starting services..."
    docker-compose -f docker-compose.production.yml up -d
    
    # Wait for services to be ready
    log "Waiting for services to be ready..."
    sleep 30
    
    # Run database migrations
    log "Running database migrations..."
    docker-compose -f docker-compose.production.yml exec -T backend php artisan migrate --force
    
    # Clear and cache configuration
    log "Optimizing application..."
    docker-compose -f docker-compose.production.yml exec -T backend php artisan config:cache
    docker-compose -f docker-compose.production.yml exec -T backend php artisan route:cache
    docker-compose -f docker-compose.production.yml exec -T backend php artisan view:cache
    
    success "Deployment completed successfully"
}

# Health checks
health_check() {
    log "Performing health checks..."
    
    # Check if all services are running
    SERVICES=(backend frontend postgres redis nginx)
    
    for service in "${SERVICES[@]}"; do
        if docker-compose -f docker-compose.production.yml ps | grep -q "$service.*Up"; then
            success "$service is running"
        else
            error "$service is not running properly"
        fi
    done
    
    # Test HTTP endpoints
    log "Testing HTTP endpoints..."
    
    # Wait a bit more for services to be fully ready
    sleep 10
    
    # Test frontend
    if curl -f -s http://localhost:3000 > /dev/null; then
        success "Frontend is responding"
    else
        warning "Frontend is not responding (this might be normal if HTTPS-only)"
    fi
    
    # Test backend health
    if curl -f -s http://localhost:8000/api/health > /dev/null; then
        success "Backend API is responding"
    else
        warning "Backend API is not responding"
    fi
    
    # Test monitoring
    if curl -f -s http://localhost:9090 > /dev/null; then
        success "Prometheus is responding"
    else
        warning "Prometheus is not responding"
    fi
    
    if curl -f -s http://localhost:3001 > /dev/null; then
        success "Grafana is responding"
    else
        warning "Grafana is not responding"
    fi
}

# Backup current deployment
backup_current() {
    if [ -d "previous_deployment" ]; then
        log "Backing up current deployment..."
        rm -rf "previous_deployment_old"
        mv "previous_deployment" "previous_deployment_old"
    fi
    
    mkdir -p "previous_deployment"
    # Add backup logic here if needed
}

# Show deployment information
show_info() {
    echo ""
    echo -e "${GREEN}🎉 Dixis Production Deployment Completed!${NC}"
    echo ""
    echo -e "${BLUE}📊 Access Information:${NC}"
    echo "• Frontend:    http://localhost:3000 (or https://dixis.io)"
    echo "• Backend API: http://localhost:8000 (or https://api.dixis.io)"
    echo "• Grafana:     http://localhost:3001 (admin/admin123)"
    echo "• Prometheus:  http://localhost:9090"
    echo ""
    echo -e "${BLUE}🔧 Management Commands:${NC}"
    echo "• View logs:    docker-compose -f docker-compose.production.yml logs -f [service]"
    echo "• View status:  docker-compose -f docker-compose.production.yml ps"
    echo "• Stop all:     docker-compose -f docker-compose.production.yml down"
    echo "• Restart:      docker-compose -f docker-compose.production.yml restart [service]"
    echo ""
    echo -e "${BLUE}📝 Log Files:${NC}"
    echo "• Deployment:   $LOG_FILE"
    echo "• Application:  logs/"
    echo ""
    echo -e "${YELLOW}⚠️  Next Steps:${NC}"
    echo "1. Configure your domain DNS to point to this server"
    echo "2. Install real SSL certificates (Let's Encrypt recommended)"
    echo "3. Configure backup strategy"
    echo "4. Set up monitoring alerts"
    echo "5. Test all functionality thoroughly"
    echo ""
}

# Main execution
main() {
    log "Starting Dixis production deployment..."
    
    check_requirements
    create_directories
    generate_ssl
    setup_monitoring
    backup_current
    deploy
    health_check
    show_info
    
    success "Deployment completed successfully at $(date)"
}

# Run main function
main "$@"