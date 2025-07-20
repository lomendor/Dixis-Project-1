#!/bin/bash

# Dixis Production Deployment Script
# Automates the production deployment process

set -e

echo "🚀 Starting Dixis Production Deployment..."

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [[ ! -f "package.json" || ! -f "next.config.ts" ]]; then
    print_error "This script must be run from the Dixis frontend root directory"
    exit 1
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if production environment file exists
if [[ ! -f ".env.production" ]]; then
    print_warning "Production environment file not found"
    if [[ -f ".env.production.template" ]]; then
        print_status "Copying template to .env.production"
        cp .env.production.template .env.production
        print_warning "Please edit .env.production with your production values before continuing"
        exit 1
    else
        print_error "No environment template found. Please create .env.production manually"
        exit 1
    fi
fi

# Pre-deployment checks
print_status "Running pre-deployment checks..."

# Check if build passes
print_status "Testing production build..."
if npm run build; then
    print_status "✅ Production build successful"
else
    print_error "❌ Production build failed. Please fix build errors before deploying"
    exit 1
fi

# Check critical environment variables
required_vars=("NEXT_PUBLIC_API_URL" "STRIPE_SECRET_KEY" "JWT_SECRET")
missing_vars=()

for var in "${required_vars[@]}"; do
    if ! grep -q "^${var}=" .env.production; then
        missing_vars+=("$var")
    fi
done

if [[ ${#missing_vars[@]} -gt 0 ]]; then
    print_error "Missing required environment variables:"
    for var in "${missing_vars[@]}"; do
        echo "  - $var"
    done
    exit 1
fi

# Build Docker images
print_status "Building Docker images..."
if docker-compose -f docker-compose.production.yml build; then
    print_status "✅ Docker images built successfully"
else
    print_error "❌ Docker build failed"
    exit 1
fi

# Stop existing containers if running
print_status "Stopping existing containers..."
docker-compose -f docker-compose.production.yml down || true

# Create necessary directories
print_status "Creating necessary directories..."
mkdir -p logs nginx/conf.d ssl monitoring uploads

# Start production services
print_status "Starting production services..."
if docker-compose -f docker-compose.production.yml up -d; then
    print_status "✅ Production services started"
else
    print_error "❌ Failed to start production services"
    exit 1
fi

# Wait for services to be healthy
print_status "Waiting for services to be healthy..."
max_wait=120
wait_time=0

while [[ $wait_time -lt $max_wait ]]; do
    if docker-compose -f docker-compose.production.yml ps | grep -q "healthy"; then
        print_status "✅ Services are healthy"
        break
    fi
    
    if [[ $wait_time -eq 0 ]]; then
        print_status "Waiting for health checks..."
    fi
    
    sleep 5
    wait_time=$((wait_time + 5))
    
    if [[ $wait_time -ge $max_wait ]]; then
        print_warning "Services did not become healthy within ${max_wait} seconds"
        print_status "Checking service status..."
        docker-compose -f docker-compose.production.yml ps
        break
    fi
done

# Test application endpoints
print_status "Testing application endpoints..."

# Wait a bit more for app to be fully ready
sleep 10

if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    print_status "✅ Health check endpoint responding"
else
    print_warning "❌ Health check endpoint not responding"
fi

if curl -f http://localhost:3000 > /dev/null 2>&1; then
    print_status "✅ Main application responding"
else
    print_warning "❌ Main application not responding"
fi

# Show deployment summary
print_status "📊 Deployment Summary:"
echo "================================"
docker-compose -f docker-compose.production.yml ps
echo "================================"

print_status "🎉 Deployment completed!"
print_status "📱 Application: http://localhost:3000"
print_status "📊 Monitoring: http://localhost:3001 (Grafana)"
print_status "🔍 Metrics: http://localhost:9090 (Prometheus)"

print_status "📋 Next steps:"
echo "1. Configure your domain and SSL certificates"
echo "2. Set up monitoring alerts in Grafana"
echo "3. Configure backup procedures"
echo "4. Test all application functionality"

print_status "📝 View logs with:"
echo "docker-compose -f docker-compose.production.yml logs -f"

print_status "🛑 Stop services with:"
echo "docker-compose -f docker-compose.production.yml down"