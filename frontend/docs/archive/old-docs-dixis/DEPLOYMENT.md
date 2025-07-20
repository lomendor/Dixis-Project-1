# Dixis Fresh - Production Deployment Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL 15+
- Redis 7+
- Docker & Docker Compose (optional)

### Environment Setup

1. **Copy environment template:**
   ```bash
   cp .env.example .env.local
   ```

2. **Fill in required variables:**
   ```bash
   # Required for production
   NEXT_PUBLIC_SITE_URL=https://dixis.gr
   DATABASE_URL=postgresql://user:pass@host:5432/dixis_production
   JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
   NEXTAUTH_SECRET=your-nextauth-secret-key
   ```

3. **Validate environment:**
   ```bash
   npm run validate-env
   ```

## 🐳 Docker Deployment (Recommended)

### Quick Deploy with Docker Compose

```bash
# Clone and setup
git clone <repository-url>
cd dixis-fresh

# Copy and configure environment
cp .env.example .env.local
# Edit .env.local with your values

# Deploy with Docker Compose
docker-compose up -d

# Check health
docker-compose ps
curl http://localhost:3000/api/health
```

### Production Docker Deployment

```bash
# Build production image
docker build -t dixis-fresh:latest .

# Run with production settings
docker run -d \
  --name dixis-fresh \
  -p 3000:3000 \
  --env-file .env.local \
  dixis-fresh:latest
```

## 🔧 Manual Deployment

### 1. Install Dependencies
```bash
npm ci --only=production
```

### 2. Build Application
```bash
npm run build:production
```

### 3. Start Production Server
```bash
npm run start:production
```

## 🌐 Platform-Specific Deployments

### Vercel Deployment

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel --prod
   ```

3. **Environment Variables:**
   - Set in Vercel dashboard
   - Or use `vercel env` commands

### Railway Deployment

1. **Connect GitHub repository**
2. **Set environment variables in Railway dashboard**
3. **Deploy automatically on push**

### DigitalOcean App Platform

1. **Create new app from GitHub**
2. **Configure build settings:**
   - Build Command: `npm run build:production`
   - Run Command: `npm run start:production`
3. **Set environment variables**

### AWS ECS/Fargate

1. **Build and push Docker image to ECR**
2. **Create ECS task definition**
3. **Deploy to ECS cluster**

## 📊 Monitoring & Health Checks

### Health Check Endpoints

- **Application Health:** `GET /api/health`
- **Error Monitoring:** `POST /api/monitoring/errors`
- **Metrics:** `GET /api/monitoring/metrics`

### Monitoring Setup

1. **Sentry (Error Tracking):**
   ```bash
   SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
   ```

2. **Google Analytics:**
   ```bash
   GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
   ```

3. **Custom Monitoring:**
   ```bash
   # Enable monitoring endpoints
   MONITORING_API_TOKEN=your-secure-token
   ```

## 🔒 Security Configuration

### Required Security Settings

```bash
# JWT Security
JWT_SECRET=minimum-32-character-secret-key
BCRYPT_ROUNDS=12

# CORS Settings
ALLOWED_ORIGINS=https://dixis.gr,https://www.dixis.gr
ALLOWED_METHODS=GET,POST,PUT,DELETE,OPTIONS

# Security Headers
ENABLE_SECURITY_HEADERS=true
ENABLE_CSP=true
ENABLE_HSTS=true
```

### SSL/TLS Setup

1. **Let's Encrypt (Recommended):**
   ```bash
   # Using Certbot
   certbot --nginx -d dixis.gr -d www.dixis.gr
   ```

2. **Custom SSL Certificate:**
   - Place certificates in `nginx/ssl/`
   - Update nginx configuration

## 🗄️ Database Setup

### PostgreSQL Setup

1. **Create Database:**
   ```sql
   CREATE DATABASE dixis_production;
   CREATE USER dixis_user WITH PASSWORD 'secure_password';
   GRANT ALL PRIVILEGES ON DATABASE dixis_production TO dixis_user;
   ```

2. **Run Migrations:**
   ```bash
   # If using Prisma
   npx prisma migrate deploy
   
   # If using custom migrations
   npm run migrate:production
   ```

### Redis Setup

1. **Install Redis:**
   ```bash
   # Ubuntu/Debian
   sudo apt install redis-server
   
   # macOS
   brew install redis
   ```

2. **Configure Redis:**
   ```bash
   REDIS_URL=redis://localhost:6379
   REDIS_PASSWORD=your-redis-password
   ```

## 📈 Performance Optimization

### Build Optimizations

```bash
# Analyze bundle size
npm run build:analyze

# Clean build cache
npm run clean:cache

# Type checking
npm run type-check
```

### Caching Strategy

```bash
# Cache TTL Settings
CACHE_TTL=3600                    # 1 hour
STATIC_CACHE_TTL=86400           # 24 hours
API_CACHE_TTL=300                # 5 minutes
```

### CDN Configuration

```bash
# AWS CloudFront
NEXT_PUBLIC_CDN_URL=https://cdn.dixis.gr

# Image Optimization
NEXT_PUBLIC_IMAGE_DOMAINS=images.unsplash.com,cdn.dixis.gr
```

## 🔄 CI/CD Pipeline

### GitHub Actions Example

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build application
        run: npm run build:production
      
      - name: Deploy to production
        run: npm run deploy:production
```

## 🚨 Troubleshooting

### Common Issues

1. **Build Failures:**
   ```bash
   # Clear cache and rebuild
   npm run clean
   npm ci
   npm run build:production
   ```

2. **Environment Variable Issues:**
   ```bash
   # Validate environment
   npm run validate-env
   ```

3. **Database Connection Issues:**
   ```bash
   # Test database connection
   psql $DATABASE_URL -c "SELECT 1;"
   ```

4. **Memory Issues:**
   ```bash
   # Increase Node.js memory limit
   NODE_OPTIONS="--max-old-space-size=4096" npm run build
   ```

### Logs and Debugging

```bash
# Application logs
docker-compose logs app

# Database logs
docker-compose logs db

# Nginx logs
docker-compose logs nginx

# Health check
curl -f http://localhost:3000/api/health
```

## 📋 Pre-Deployment Checklist

- [ ] Environment variables configured
- [ ] Database setup and migrated
- [ ] SSL certificates installed
- [ ] Security headers configured
- [ ] Monitoring setup (Sentry, Analytics)
- [ ] Health checks passing
- [ ] Performance optimizations applied
- [ ] Backup strategy in place
- [ ] CDN configured
- [ ] Error tracking enabled

## 🔧 Maintenance

### Regular Tasks

1. **Update Dependencies:**
   ```bash
   npm audit
   npm update
   ```

2. **Database Maintenance:**
   ```bash
   # Backup database
   pg_dump $DATABASE_URL > backup.sql
   
   # Optimize database
   VACUUM ANALYZE;
   ```

3. **Log Rotation:**
   ```bash
   # Setup logrotate for application logs
   sudo logrotate -f /etc/logrotate.d/dixis-fresh
   ```

4. **Security Updates:**
   ```bash
   # Check for security vulnerabilities
   npm audit --audit-level moderate
   ```

## 📞 Support

For deployment issues:
- Check logs: `docker-compose logs`
- Health check: `curl /api/health`
- Validate environment: `npm run validate-env`
- Contact: support@dixis.gr
