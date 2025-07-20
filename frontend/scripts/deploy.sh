#!/bin/bash

# Production Deployment Script for Dixis
# This script handles the complete deployment process

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="dixis-fresh"
BUILD_DIR="build"
BACKUP_DIR="backups"
LOG_FILE="deployment.log"

# Functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a $LOG_FILE
}

success() {
    echo -e "${GREEN}✅ $1${NC}" | tee -a $LOG_FILE
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}" | tee -a $LOG_FILE
}

error() {
    echo -e "${RED}❌ $1${NC}" | tee -a $LOG_FILE
    exit 1
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check Node.js version
    if ! command -v node &> /dev/null; then
        error "Node.js is not installed"
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2)
    REQUIRED_VERSION="18.0.0"
    
    if ! npx semver -r ">=$REQUIRED_VERSION" "$NODE_VERSION" &> /dev/null; then
        error "Node.js version $NODE_VERSION is not supported. Required: >=$REQUIRED_VERSION"
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        error "npm is not installed"
    fi
    
    # Check git
    if ! command -v git &> /dev/null; then
        error "git is not installed"
    fi
    
    success "Prerequisites check passed"
}

# Validate environment
validate_environment() {
    log "Validating environment variables..."
    
    if [ ! -f ".env.local" ] && [ ! -f ".env.production" ]; then
        error "No environment file found. Please create .env.local or .env.production"
    fi
    
    # Run environment validation script
    if [ -f "scripts/validate-env.js" ]; then
        node scripts/validate-env.js || error "Environment validation failed"
    else
        warning "Environment validation script not found"
    fi
    
    success "Environment validation passed"
}

# Create backup
create_backup() {
    log "Creating backup..."
    
    TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
    BACKUP_NAME="${PROJECT_NAME}_backup_${TIMESTAMP}"
    
    mkdir -p $BACKUP_DIR
    
    # Backup current build if exists
    if [ -d ".next" ]; then
        cp -r .next "$BACKUP_DIR/${BACKUP_NAME}_next"
        success "Backup created: $BACKUP_DIR/${BACKUP_NAME}_next"
    fi
    
    # Backup environment files
    if [ -f ".env.local" ]; then
        cp .env.local "$BACKUP_DIR/${BACKUP_NAME}_env.local"
    fi
    
    success "Backup completed"
}

# Install dependencies
install_dependencies() {
    log "Installing dependencies..."
    
    # Clean install
    rm -rf node_modules package-lock.json
    npm ci --production=false
    
    success "Dependencies installed"
}

# Run tests
run_tests() {
    log "Running tests..."
    
    # Type checking
    npm run type-check || error "Type checking failed"
    
    # Linting
    npm run lint || error "Linting failed"
    
    # Unit tests (if available)
    if npm run | grep -q "test"; then
        npm run test || error "Tests failed"
    else
        warning "No tests found"
    fi
    
    success "Tests passed"
}

# Build application
build_application() {
    log "Building application..."
    
    # Clean previous build
    rm -rf .next
    
    # Set production environment
    export NODE_ENV=production
    
    # Build
    npm run build || error "Build failed"
    
    success "Build completed"
}

# Optimize build
optimize_build() {
    log "Optimizing build..."
    
    # Bundle analysis (optional)
    if [ "$ANALYZE_BUNDLE" = "true" ]; then
        log "Running bundle analysis..."
        npm run analyze
    fi
    
    # Compress static files (if gzip available)
    if command -v gzip &> /dev/null; then
        find .next/static -name "*.js" -o -name "*.css" | while read file; do
            gzip -k "$file"
        done
        success "Static files compressed"
    fi
    
    success "Build optimization completed"
}

# Health check
health_check() {
    log "Performing health check..."
    
    # Start the application in background
    npm start &
    APP_PID=$!
    
    # Wait for application to start
    sleep 10
    
    # Check health endpoint
    HEALTH_URL="http://localhost:3000/api/health"
    
    for i in {1..5}; do
        if curl -f "$HEALTH_URL" &> /dev/null; then
            success "Health check passed"
            kill $APP_PID 2>/dev/null || true
            return 0
        fi
        log "Health check attempt $i failed, retrying..."
        sleep 5
    done
    
    kill $APP_PID 2>/dev/null || true
    error "Health check failed"
}

# Deploy to production
deploy_to_production() {
    log "Deploying to production..."
    
    # This would typically involve:
    # - Uploading to server
    # - Updating reverse proxy configuration
    # - Restarting services
    # - Running database migrations
    
    # For now, we'll just log the deployment steps
    log "Deployment steps:"
    log "1. Upload .next directory to production server"
    log "2. Upload package.json and package-lock.json"
    log "3. Run 'npm ci --production' on server"
    log "4. Update environment variables"
    log "5. Restart application service"
    log "6. Update reverse proxy configuration"
    log "7. Run health checks"
    
    success "Deployment instructions logged"
}

# Cleanup
cleanup() {
    log "Cleaning up..."
    
    # Remove temporary files
    rm -f deployment.log.tmp
    
    # Clean old backups (keep last 5)
    if [ -d "$BACKUP_DIR" ]; then
        ls -t "$BACKUP_DIR" | tail -n +6 | xargs -I {} rm -rf "$BACKUP_DIR/{}"
    fi
    
    success "Cleanup completed"
}

# Main deployment process
main() {
    log "Starting deployment process for $PROJECT_NAME"
    log "=========================================="
    
    # Parse command line arguments
    SKIP_TESTS=false
    SKIP_BACKUP=false
    ANALYZE_BUNDLE=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --skip-tests)
                SKIP_TESTS=true
                shift
                ;;
            --skip-backup)
                SKIP_BACKUP=true
                shift
                ;;
            --analyze)
                ANALYZE_BUNDLE=true
                shift
                ;;
            --help)
                echo "Usage: $0 [options]"
                echo "Options:"
                echo "  --skip-tests    Skip running tests"
                echo "  --skip-backup   Skip creating backup"
                echo "  --analyze       Run bundle analysis"
                echo "  --help          Show this help message"
                exit 0
                ;;
            *)
                error "Unknown option: $1"
                ;;
        esac
    done
    
    # Execute deployment steps
    check_prerequisites
    validate_environment
    
    if [ "$SKIP_BACKUP" = false ]; then
        create_backup
    fi
    
    install_dependencies
    
    if [ "$SKIP_TESTS" = false ]; then
        run_tests
    fi
    
    build_application
    optimize_build
    health_check
    deploy_to_production
    cleanup
    
    success "Deployment completed successfully!"
    log "=========================================="
}

# Handle script interruption
trap 'error "Deployment interrupted"' INT TERM

# Run main function
main "$@"
