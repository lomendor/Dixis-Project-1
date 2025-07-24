# Production Database Migration Plan
## SQLite → MySQL Migration Strategy for Dixis Fresh

**Created**: December 21, 2024  
**Target Environment**: Production MySQL Database  
**Current Environment**: SQLite Development Database  

---

## 🎯 Migration Overview

### Current State
- **Database**: SQLite (1.4MB, populated with test data)
- **Tables**: 83 tables with complex relationships
- **Records**: 65 products, 9 users, 5 producers, extensive test data
- **Features**: Multi-tenant, B2B, adoption marketplace, Greek VAT compliance

### Target State
- **Database**: MySQL 8.0+ with utf8mb4 charset
- **Environment**: Production-ready with optimized performance
- **Backup Strategy**: Automated daily backups
- **Monitoring**: Performance and health monitoring

---

## 📋 Pre-Migration Checklist

### ✅ Infrastructure Requirements
- [ ] MySQL 8.0+ server provisioned
- [ ] Database `dixis_production` created with utf8mb4_unicode_ci collation
- [ ] Database user `dixis_user` created with appropriate privileges
- [ ] SSL certificates configured for encrypted connections
- [ ] Backup storage configured (minimum 7-day retention)

### ✅ Environment Configuration
- [ ] Production `.env` file configured with MySQL credentials
- [ ] Connection pooling configured for high availability
- [ ] Database connection encryption enabled
- [ ] Performance monitoring tools installed

---

## 🏗️ Migration Strategy

### Phase 1: Schema Migration (Day 1)

**1.1 Database Setup**
```sql
-- Create production database
CREATE DATABASE dixis_production 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Create application user
CREATE USER 'dixis_user'@'%' IDENTIFIED BY 'SECURE_PRODUCTION_PASSWORD';
GRANT ALL PRIVILEGES ON dixis_production.* TO 'dixis_user'@'%';
FLUSH PRIVILEGES;
```

**1.2 Laravel Migration**
```bash
# Run all pending migrations
php artisan migrate --force --env=production

# Verify migration status
php artisan migrate:status --env=production
```

**1.3 Indexes and Constraints**
```sql
-- Performance indexes for Greek marketplace
CREATE INDEX idx_products_category_featured ON products (category, is_featured);
CREATE INDEX idx_products_producer_active ON products (producer_id, is_active);
CREATE INDEX idx_orders_user_date ON orders (user_id, created_at);
CREATE INDEX idx_shipping_zones_greece ON shipping_zones (country, region);

-- Full-text search for Greek content
ALTER TABLE products ADD FULLTEXT(name, description);
ALTER TABLE producers ADD FULLTEXT(business_name, description);
```

### Phase 2: Data Migration (Day 1-2)

**2.1 Critical Data Priority**
1. **Users & Authentication** (Priority 1)
   - User accounts with hashed passwords
   - User roles and permissions
   - Email verification status

2. **Core Business Data** (Priority 1)
   - Producers and business profiles
   - Product catalog with images
   - Categories and taxonomies

3. **Financial Data** (Priority 1)
   - Active orders and payments
   - Invoice records
   - QuickBooks integration tokens

4. **Configuration Data** (Priority 2)
   - Shipping zones and rates
   - Tenant configurations
   - System settings

**2.2 Migration Commands**
```bash
# Export SQLite data
php artisan db:export --connection=sqlite --format=sql

# Import to MySQL with validation
php artisan db:import --connection=mysql --validate=true

# Run data integrity checks
php artisan db:verify-integrity
```

### Phase 3: File Assets Migration (Day 2)

**3.1 Image Assets**
- Product images (main_image columns)
- Producer logos and covers
- Category icons
- User avatars

**3.2 Migration Process**
```bash
# Create asset backup
tar -czf production_assets_backup.tar.gz storage/app/public/

# Sync to production storage
rsync -avz storage/app/public/ production:/var/www/dixis/storage/app/public/

# Update file permissions
chown -R www-data:www-data storage/app/public/
chmod -R 755 storage/app/public/
```

### Phase 4: Validation & Testing (Day 2-3)

**4.1 Data Integrity Checks**
```sql
-- Verify record counts
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'products', COUNT(*) FROM products
UNION ALL
SELECT 'orders', COUNT(*) FROM orders
UNION ALL
SELECT 'producers', COUNT(*) FROM producers;

-- Check referential integrity
SELECT 'orphaned_products' as issue, COUNT(*) as count 
FROM products p 
LEFT JOIN producers pr ON p.producer_id = pr.id 
WHERE pr.id IS NULL;

-- Verify Greek VAT calculations
SELECT AVG(total_tax) as avg_tax FROM orders WHERE total_tax > 0;
```

**4.2 Functional Testing**
- [ ] User authentication and registration
- [ ] Product catalog browsing
- [ ] Multi-producer cart functionality
- [ ] B2B wholesale pricing
- [ ] Adoption marketplace features
- [ ] Greek VAT tax calculations
- [ ] SEPA payment processing
- [ ] Invoice generation
- [ ] Email notifications

---

## ⚡ Performance Optimization

### Database Tuning
```sql
-- MySQL configuration optimizations
SET GLOBAL innodb_buffer_pool_size = '1G';
SET GLOBAL query_cache_size = '256M';
SET GLOBAL max_connections = 200;
SET GLOBAL innodb_file_per_table = ON;

-- Enable slow query log
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 2;
```

### Connection Pooling
```php
// config/database.php - Production MySQL settings
'mysql' => [
    'driver' => 'mysql',
    'host' => env('DB_HOST', '127.0.0.1'),
    'port' => env('DB_PORT', '3306'),
    'database' => env('DB_DATABASE', 'forge'),
    'username' => env('DB_USERNAME', 'forge'),
    'password' => env('DB_PASSWORD', ''),
    'charset' => 'utf8mb4',
    'collation' => 'utf8mb4_unicode_ci',
    'prefix' => '',
    'prefix_indexes' => true,
    'strict' => true,
    'engine' => 'InnoDB ROW_FORMAT=DYNAMIC',
    'options' => [
        PDO::ATTR_EMULATE_PREPARES => false,
        PDO::ATTR_STRINGIFY_FETCHES => false,
        PDO::MYSQL_ATTR_USE_BUFFERED_QUERY => false,
    ],
    'pool' => [
        'min_connections' => 5,
        'max_connections' => 20,
        'connect_timeout' => 60,
        'wait_timeout' => 60,
        'heartbeat' => -1,
        'max_idle_time' => 60,
    ],
]
```

---

## 🔧 Production Environment Configuration

### Environment Variables
```env
# Database Configuration
DB_CONNECTION=mysql
DB_HOST=your-mysql-host.amazonaws.com
DB_PORT=3306
DB_DATABASE=dixis_production
DB_USERNAME=dixis_user
DB_PASSWORD=your-secure-password-here

# Connection Security
DB_SSL_MODE=require
DB_SSL_CERT=/path/to/client-cert.pem
DB_SSL_KEY=/path/to/client-key.pem
DB_SSL_CA=/path/to/ca-cert.pem

# Performance
DB_POOL_MIN=5
DB_POOL_MAX=20
DB_TIMEOUT=60

# Backup Configuration
BACKUP_ENABLED=true
BACKUP_SCHEDULE="0 2 * * *"  # Daily at 2 AM
BACKUP_RETENTION_DAYS=30
```

### Laravel Cache Configuration
```php
// config/cache.php - Production optimization
'default' => env('CACHE_DRIVER', 'redis'),
'stores' => [
    'redis' => [
        'driver' => 'redis',
        'connection' => 'cache',
        'lock_connection' => 'default',
    ],
],

// Enable database query caching
'database' => [
    'query_cache' => true,
    'cache_time' => 3600, // 1 hour
]
```

---

## 🔍 Monitoring & Maintenance

### Health Checks
```bash
#!/bin/bash
# Production database health check script

# Check MySQL connection
mysql -h $DB_HOST -u $DB_USERNAME -p$DB_PASSWORD -e "SELECT 1" > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ Database connection: OK"
else
    echo "❌ Database connection: FAILED"
    exit 1
fi

# Check table integrity
php artisan db:check-integrity --quiet
echo "✅ Database integrity: OK"

# Check backup status
if [ -f "/backups/dixis_$(date +%Y%m%d).sql.gz" ]; then
    echo "✅ Daily backup: OK"
else
    echo "⚠️  Daily backup: MISSING"
fi
```

### Performance Monitoring
- **Database response time**: < 100ms for 95% of queries
- **Connection pool usage**: < 80% during peak hours
- **Slow query log**: Monitor queries > 2 seconds
- **Storage growth**: Track database size growth trends

---

## 🚨 Rollback Strategy

### Emergency Rollback Process
1. **Stop application traffic** (maintenance mode)
2. **Restore SQLite database** from backup
3. **Update environment** to use SQLite
4. **Restart application** services
5. **Verify functionality** before removing maintenance mode

### Rollback Commands
```bash
# Enable maintenance mode
php artisan down --message="Database maintenance in progress"

# Restore SQLite backup
cp database/database.sqlite.backup database/database.sqlite

# Update environment
sed -i 's/DB_CONNECTION=mysql/DB_CONNECTION=sqlite/' .env

# Clear caches
php artisan config:clear
php artisan cache:clear

# Disable maintenance mode
php artisan up
```

---

## 📅 Migration Timeline

### Pre-Migration (1 week before)
- [ ] Infrastructure provisioning
- [ ] Backup creation and verification
- [ ] Migration script testing in staging
- [ ] Team training and documentation review

### Migration Day
- [ ] **T-0**: Begin maintenance window (2 hours planned)
- [ ] **T+15min**: Schema migration complete
- [ ] **T+45min**: Data migration complete
- [ ] **T+75min**: File assets synced
- [ ] **T+90min**: Validation and testing complete
- [ ] **T+120min**: Production traffic restored

### Post-Migration (1 week after)
- [ ] Performance monitoring and optimization
- [ ] Daily backup verification
- [ ] User feedback collection
- [ ] Documentation updates

---

## ✅ Success Criteria

### Technical Metrics
- [ ] 100% data integrity preserved
- [ ] < 2 hours total downtime
- [ ] Database response time < 100ms
- [ ] Zero data loss
- [ ] All automated tests passing

### Business Metrics
- [ ] User authentication working
- [ ] Order processing functional
- [ ] Payment system operational
- [ ] Email notifications sending
- [ ] Greek VAT calculations accurate

---

**Migration Lead**: Development Team  
**Review**: Database Administrator  
**Approval**: Technical Lead  
**Emergency Contact**: [Contact Information]