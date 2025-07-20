#!/bin/bash

# Dixis Production Deployment Script

set -e

echo "🚀 Dixis Production Deployment"
echo "=============================="

# Configuration
PROJECT_NAME="dixis"
DOCKER_COMPOSE_FILE="docker-compose.prod.yml"
BACKUP_DIR="./backups"
ENV_FILE=".env.production"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed"
        exit 1
    fi
    
    if [ ! -f "$ENV_FILE" ]; then
        log_error "Production environment file $ENV_FILE not found"
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

# Create backup
create_backup() {
    log_info "Creating backup..."
    
    mkdir -p "$BACKUP_DIR"
    
    BACKUP_TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
    BACKUP_FILE="$BACKUP_DIR/dixis_backup_$BACKUP_TIMESTAMP.sql"
    
    if docker-compose -f "$DOCKER_COMPOSE_FILE" ps database | grep -q "Up"; then
        log_info "Creating database backup..."
        docker-compose -f "$DOCKER_COMPOSE_FILE" exec -T database \
            mysqldump -u root -p"$DB_ROOT_PASSWORD" "$DB_DATABASE" > "$BACKUP_FILE"
        
        if [ $? -eq 0 ]; then
            log_success "Database backup created: $BACKUP_FILE"
        else
            log_error "Database backup failed"
            exit 1
        fi
    else
        log_warning "Database container not running, skipping backup"
    fi
}

# Build and deploy
deploy() {
    log_info "Starting deployment..."
    
    # Load environment variables
    export $(cat "$ENV_FILE" | grep -v '^#' | xargs)
    
    # Build images
    log_info "Building Docker images..."
    docker-compose -f "$DOCKER_COMPOSE_FILE" build --no-cache
    
    # Stop existing containers
    log_info "Stopping existing containers..."
    docker-compose -f "$DOCKER_COMPOSE_FILE" down
    
    # Start services
    log_info "Starting services..."
    docker-compose -f "$DOCKER_COMPOSE_FILE" up -d
    
    # Wait for services to be ready
    log_info "Waiting for services to be ready..."
    sleep 30
    
    # Run migrations
    log_info "Running database migrations..."
    docker-compose -f "$DOCKER_COMPOSE_FILE" exec -T app php artisan migrate --force
    
    # Clear and cache configuration
    log_info "Optimizing application..."
    docker-compose -f "$DOCKER_COMPOSE_FILE" exec -T app php artisan config:cache
    docker-compose -f "$DOCKER_COMPOSE_FILE" exec -T app php artisan route:cache
    docker-compose -f "$DOCKER_COMPOSE_FILE" exec -T app php artisan view:cache
    
    # Generate API documentation
    log_info "Generating API documentation..."
    docker-compose -f "$DOCKER_COMPOSE_FILE" exec -T app php artisan l5-swagger:generate
    
    log_success "Deployment completed successfully!"
}

# Health check
health_check() {
    log_info "Performing health checks..."
    
    # Check if containers are running
    CONTAINERS=("app" "webserver" "database" "redis" "queue" "scheduler")
    
    for container in "${CONTAINERS[@]}"; do
        if docker-compose -f "$DOCKER_COMPOSE_FILE" ps "$container" | grep -q "Up"; then
            log_success "Container $container is running"
        else
            log_error "Container $container is not running"
            return 1
        fi
    done
    
    # Check HTTP endpoint
    sleep 10
    if curl -f http://localhost/health &> /dev/null; then
        log_success "HTTP health check passed"
    else
        log_error "HTTP health check failed"
        return 1
    fi
    
    # Check database connection
    if docker-compose -f "$DOCKER_COMPOSE_FILE" exec -T database mysql -u "$DB_USERNAME" -p"$DB_PASSWORD" -e "SELECT 1;" &> /dev/null; then
        log_success "Database connection check passed"
    else
        log_error "Database connection check failed"
        return 1
    fi
    
    log_success "All health checks passed!"
}

# Rollback function
rollback() {
    log_warning "Rolling back deployment..."
    
    # Stop current containers
    docker-compose -f "$DOCKER_COMPOSE_FILE" down
    
    # Start with previous images (if available)
    # This is a simplified rollback - in production you'd want more sophisticated versioning
    docker-compose -f "$DOCKER_COMPOSE_FILE" up -d
    
    log_warning "Rollback completed. Please verify the application status."
}

# Show usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo "Options:"
    echo "  deploy     - Deploy the application"
    echo "  backup     - Create a backup only"
    echo "  health     - Run health checks only"
    echo "  rollback   - Rollback deployment"
    echo "  logs       - Show application logs"
    echo "  status     - Show container status"
    echo "  --help     - Show this help message"
}

# Show logs
show_logs() {
    log_info "Showing application logs..."
    docker-compose -f "$DOCKER_COMPOSE_FILE" logs -f --tail=100
}

# Show status
show_status() {
    log_info "Container status:"
    docker-compose -f "$DOCKER_COMPOSE_FILE" ps
    
    echo ""
    log_info "Resource usage:"
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"
}

# Main script logic
case "${1:-deploy}" in
    "deploy")
        check_prerequisites
        create_backup
        deploy
        health_check
        ;;
    "backup")
        check_prerequisites
        create_backup
        ;;
    "health")
        health_check
        ;;
    "rollback")
        rollback
        ;;
    "logs")
        show_logs
        ;;
    "status")
        show_status
        ;;
    "--help"|"help")
        show_usage
        ;;
    *)
        log_error "Unknown command: $1"
        show_usage
        exit 1
        ;;
esac

echo ""
log_success "Operation completed!"