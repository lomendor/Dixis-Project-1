#!/bin/bash
# Dixis Platform - Blue-Green Deployment Script
# Zero-downtime deployment for Greek marketplace

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="dixis-platform"
BLUE_COMPOSE="docker-compose.prod.yml"
GREEN_COMPOSE="docker-compose.green.yml"
NGINX_CONFIG_DIR="./docker/config/nginx-proxy/conf.d"
HEALTH_CHECK_URL="http://localhost:8001/api/v1/health"
LOG_FILE="./blue-green-deploy-$(date +%Y%m%d-%H%M%S).log"

# Current environment tracking
CURRENT_ENV_FILE="./.current-environment"
BLUE_PORT=8000
GREEN_PORT=8001

# Functions
log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
    exit 1
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

# Get current active environment
get_current_environment() {
    if [[ -f "$CURRENT_ENV_FILE" ]]; then
        cat "$CURRENT_ENV_FILE"
    else
        echo "blue"
    fi
}

# Set current environment
set_current_environment() {
    echo "$1" > "$CURRENT_ENV_FILE"
}

# Generate green docker-compose file
generate_green_compose() {
    log "📝 Generating green environment configuration..."
    
    # Copy blue compose and modify ports
    cp "$BLUE_COMPOSE" "$GREEN_COMPOSE"
    
    # Update ports for green environment
    sed -i.bak 's/8000:8000/8001:8000/g' "$GREEN_COMPOSE"
    sed -i.bak 's/3000:3000/3001:3000/g' "$GREEN_COMPOSE"
    
    # Update container names
    sed -i.bak 's/container_name: dixis-/container_name: dixis-green-/g' "$GREEN_COMPOSE"
    
    # Update network names
    sed -i.bak 's/dixis-network/dixis-green-network/g' "$GREEN_COMPOSE"
    
    success "✅ Green environment configuration generated"
}

# Deploy to inactive environment
deploy_inactive_environment() {
    local current_env=$(get_current_environment)
    local target_env
    local target_compose
    local target_port
    
    if [[ "$current_env" == "blue" ]]; then
        target_env="green"
        target_compose="$GREEN_COMPOSE"
        target_port="$GREEN_PORT"
    else
        target_env="blue" 
        target_compose="$BLUE_COMPOSE"
        target_port="$BLUE_PORT"
    fi
    
    log "🚀 Deploying to $target_env environment (port $target_port)..."
    
    # Generate green compose if needed
    if [[ "$target_env" == "green" ]] && [[ ! -f "$GREEN_COMPOSE" ]]; then
        generate_green_compose
    fi
    
    # Pull latest images
    log "🐳 Pulling latest images for $target_env environment..."
    docker-compose -f "$target_compose" pull
    
    # Start target environment
    log "🔧 Starting $target_env environment..."
    docker-compose -f "$target_compose" up -d --remove-orphans
    
    # Wait for services to be ready
    log "⏳ Waiting for $target_env environment to be ready..."
    sleep 30
    
    # Run migrations on target environment
    log "🗄️ Running database migrations on $target_env..."
    docker-compose -f "$target_compose" exec -T backend php artisan migrate --force
    
    # Clear caches
    log "🧹 Optimizing $target_env application..."
    docker-compose -f "$target_compose" exec -T backend php artisan config:cache
    docker-compose -f "$target_compose" exec -T backend php artisan route:cache
    docker-compose -f "$target_compose" exec -T backend php artisan view:cache
    
    success "✅ $target_env environment deployed successfully"
}

# Health check for target environment
health_check_target() {
    local current_env=$(get_current_environment)
    local target_port
    
    if [[ "$current_env" == "blue" ]]; then
        target_port="$GREEN_PORT"
    else
        target_port="$BLUE_PORT"
    fi
    
    local target_url="http://localhost:$target_port/api/v1/health"
    local max_attempts=15
    local attempt=1
    
    log "🏥 Running health checks on target environment..."
    
    while [[ $attempt -le $max_attempts ]]; do
        log "Health check attempt $attempt/$max_attempts..."
        
        if curl -f -s "$target_url" > /dev/null; then
            success "✅ Target environment health check passed"
            return 0
        fi
        
        if [[ $attempt -eq $max_attempts ]]; then
            error "❌ Target environment health check failed after $max_attempts attempts"
        fi
        
        sleep 10
        ((attempt++))
    done
}

# Smoke tests for target environment
run_smoke_tests() {
    local current_env=$(get_current_environment)
    local target_port
    
    if [[ "$current_env" == "blue" ]]; then
        target_port="$GREEN_PORT"
    else
        target_port="$BLUE_PORT"
    fi
    
    log "🧪 Running smoke tests on target environment..."
    
    # Test basic endpoints
    log "Testing basic API endpoints..."
    
    # Health check
    if ! curl -f -s "http://localhost:$target_port/api/v1/health" > /dev/null; then
        error "❌ Health check endpoint failed"
    fi
    
    # Greek VAT calculation
    log "Testing Greek VAT calculation..."
    local vat_response
    vat_response=$(curl -s "http://localhost:$target_port/api/v1/vat/calculate?amount=100&region=mainland" || echo "ERROR")
    
    if [[ "$vat_response" != *"24.00"* ]]; then
        error "❌ Greek VAT calculation test failed"
    fi
    
    # Product listing
    log "Testing product listing..."
    if ! curl -f -s "http://localhost:$target_port/api/v1/products?limit=1" > /dev/null; then
        error "❌ Product listing test failed"
    fi
    
    # Database connectivity
    log "Testing database connectivity..."
    local target_compose
    if [[ "$current_env" == "blue" ]]; then
        target_compose="$GREEN_COMPOSE"
    else
        target_compose="$BLUE_COMPOSE"
    fi
    
    if ! docker-compose -f "$target_compose" exec -T backend php artisan dixis:check-database; then
        error "❌ Database connectivity test failed"
    fi
    
    success "✅ All smoke tests passed"
}

# Switch traffic to target environment
switch_traffic() {
    local current_env=$(get_current_environment)
    local target_env
    local target_port
    
    if [[ "$current_env" == "blue" ]]; then
        target_env="green"
        target_port="$GREEN_PORT"
    else
        target_env="blue"
        target_port="$BLUE_PORT"
    fi
    
    log "🔀 Switching traffic from $current_env to $target_env environment..."
    
    # Update nginx configuration
    local nginx_config="$NGINX_CONFIG_DIR/dixis.conf"
    local backup_config="$NGINX_CONFIG_DIR/dixis.conf.backup.$(date +%Y%m%d-%H%M%S)"
    
    # Backup current config
    cp "$nginx_config" "$backup_config"
    
    # Update upstream configuration
    sed -i.switch "s/server backend:8000/server backend:$target_port/g" "$nginx_config"
    sed -i.switch "s/server frontend:3000/server frontend:$((target_port + 1000))/g" "$nginx_config"
    
    # Test nginx configuration
    if ! docker-compose -f "$BLUE_COMPOSE" exec nginx-proxy nginx -t; then
        log "❌ Nginx configuration test failed, reverting..."
        cp "$backup_config" "$nginx_config"
        error "Failed to update nginx configuration"
    fi
    
    # Reload nginx
    docker-compose -f "$BLUE_COMPOSE" exec nginx-proxy nginx -s reload
    
    # Update current environment tracking
    set_current_environment "$target_env"
    
    success "✅ Traffic switched to $target_env environment"
}

# Verify traffic switch
verify_traffic_switch() {
    local current_env=$(get_current_environment)
    
    log "🔍 Verifying traffic switch to $current_env environment..."
    
    # Test main application
    if ! curl -f -s "http://localhost/api/v1/health" > /dev/null; then
        error "❌ Main application not responding after traffic switch"
    fi
    
    # Test a few more endpoints to ensure everything works
    if ! curl -f -s "http://localhost/api/v1/products?limit=1" > /dev/null; then
        error "❌ Product listing not working after traffic switch"
    fi
    
    success "✅ Traffic switch verified successfully"
}

# Cleanup old environment
cleanup_old_environment() {
    local current_env=$(get_current_environment)
    local old_env
    local old_compose
    
    if [[ "$current_env" == "blue" ]]; then
        old_env="green"
        old_compose="$GREEN_COMPOSE"
    else
        old_env="blue"
        old_compose="$BLUE_COMPOSE"
    fi
    
    log "🧹 Cleaning up $old_env environment..."
    
    # Give some time for any remaining requests
    log "⏳ Waiting 30 seconds for graceful shutdown..."
    sleep 30
    
    # Stop old environment
    docker-compose -f "$old_compose" down
    
    # Remove unused images
    docker image prune -f
    
    success "✅ $old_env environment cleaned up"
}

# Rollback function
rollback() {
    local current_env=$(get_current_environment)
    local old_env
    
    if [[ "$current_env" == "blue" ]]; then
        old_env="green"
    else
        old_env="blue"
    fi
    
    warning "⚠️ Rolling back to $old_env environment..."
    
    # Switch back
    set_current_environment "$old_env"
    switch_traffic
    
    error "❌ Deployment failed and rolled back to $old_env"
}

# Main deployment function
main() {
    log "🚀 Starting Blue-Green Deployment for Dixis Platform"
    log "🇬🇷 Zero-downtime deployment for Greek marketplace"
    
    local current_env=$(get_current_environment)
    log "📊 Current active environment: $current_env"
    
    # Set trap for rollback on error
    trap rollback ERR
    
    # Deploy to inactive environment
    deploy_inactive_environment
    
    # Health check target environment
    health_check_target
    
    # Run smoke tests
    run_smoke_tests
    
    # Switch traffic
    switch_traffic
    
    # Verify traffic switch
    verify_traffic_switch
    
    # Wait a bit to ensure everything is stable
    log "⏳ Waiting 60 seconds to ensure stability..."
    sleep 60
    
    # Final verification
    verify_traffic_switch
    
    # Cleanup old environment
    cleanup_old_environment
    
    # Remove trap
    trap - ERR
    
    local new_env=$(get_current_environment)
    success "🎉 Blue-Green Deployment Completed Successfully!"
    log "🌐 Traffic is now running on $new_env environment"
    log "📊 Zero downtime achieved for Greek marketplace users"
}

# Handle command line arguments
case "${1:-deploy}" in
    deploy)
        main
        ;;
    rollback)
        rollback
        ;;
    status)
        current_env=$(get_current_environment)
        log "📊 Current active environment: $current_env"
        ;;
    *)
        echo "Usage: $0 {deploy|rollback|status}"
        exit 1
        ;;
esac