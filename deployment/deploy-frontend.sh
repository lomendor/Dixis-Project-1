#!/bin/bash

# Dixis Frontend Deployment Script
# Usage: ./deploy-frontend.sh [environment]

set -e

ENVIRONMENT=${1:-production}
PROJECT_DIR="/var/www/dixis-frontend"
FRONTEND_DIR="$PROJECT_DIR/dixis-fresh"
BACKUP_DIR="/backups/dixis"
LOG_FILE="/var/log/dixis-deploy.log"
PM2_APP_NAME="dixis-frontend"

echo "🚀 Starting Dixis Frontend Deployment - Environment: $ENVIRONMENT"
echo "$(date): Starting frontend deployment" >> $LOG_FILE

# Create backup directory if it doesn't exist
sudo mkdir -p $BACKUP_DIR

# Function to log messages
log() {
    echo "$(date): $1" | tee -a $LOG_FILE
}

# Function to handle errors
error_exit() {
    log "ERROR: $1"
    exit 1
}

# Check if Node.js and npm are installed
if ! command -v node &> /dev/null; then
    error_exit "Node.js is not installed. Please install Node.js 18+ first."
fi

if ! command -v npm &> /dev/null; then
    error_exit "npm is not installed. Please install npm first."
fi

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    log "Installing PM2 globally..."
    sudo npm install -g pm2
fi

# Backup current deployment
log "Creating backup of current deployment..."
if [ -d "$FRONTEND_DIR" ]; then
    sudo cp -r $FRONTEND_DIR $BACKUP_DIR/frontend-backup-$(date +%Y%m%d_%H%M%S)
    log "Backup created successfully"
fi

# Clone or update repository
if [ ! -d "$PROJECT_DIR" ]; then
    log "Cloning repository..."
    sudo git clone https://github.com/lomendor/Dixis4.git $PROJECT_DIR
else
    log "Updating repository..."
    cd $PROJECT_DIR
    sudo git fetch origin
    sudo git reset --hard origin/main
fi

cd $FRONTEND_DIR

# Install dependencies
log "Installing npm dependencies..."
sudo npm ci --production=false

# Build application
log "Building Next.js application..."
sudo npm run build

# Environment setup
log "Setting up environment..."
if [ ! -f ".env.local" ]; then
    sudo cp .env.example .env.local 2>/dev/null || true
    log "Created .env.local file"
fi

# Set proper permissions
log "Setting file permissions..."
sudo chown -R www-data:www-data $FRONTEND_DIR
sudo chmod -R 755 $FRONTEND_DIR

# PM2 process management
log "Managing PM2 processes..."

# Check if PM2 process exists
if pm2 list | grep -q $PM2_APP_NAME; then
    log "Restarting existing PM2 process..."
    pm2 restart $PM2_APP_NAME
else
    log "Starting new PM2 process..."
    cd $FRONTEND_DIR
    pm2 start npm --name $PM2_APP_NAME -- start
    pm2 save
fi

# Ensure PM2 starts on boot
pm2 startup > /dev/null 2>&1 || true

# Health check
log "Performing health check..."
sleep 10

# Check if Next.js is responding
if curl -f -s http://localhost:3000 > /dev/null; then
    log "✅ Frontend deployment successful! Health check passed."
else
    log "⚠️ Health check failed. Please verify the deployment."
    pm2 logs $PM2_APP_NAME --lines 20
fi

# Display PM2 status
log "PM2 Process Status:"
pm2 list

log "🎉 Frontend deployment completed!"
echo "Deployment log available at: $LOG_FILE"
echo "PM2 logs: pm2 logs $PM2_APP_NAME"