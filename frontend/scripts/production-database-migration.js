/**
 * Production Database Migration Script
 * SQLite → MySQL Migration for Dixis Fresh
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class ProductionDatabaseMigration {
  constructor() {
    this.logFile = path.join(__dirname, '..', 'migration.log');
    this.backupDir = path.join(__dirname, '..', 'backups');
    this.startTime = new Date();
    
    // Ensure backup directory exists
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
    
    this.log('Production Database Migration Script Initialized');
  }

  log(message, type = 'INFO') {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${type}] ${message}\n`;
    
    console.log(logEntry.trim());
    fs.appendFileSync(this.logFile, logEntry);
  }

  error(message, error = null) {
    this.log(message, 'ERROR');
    if (error) {
      this.log(error.stack || error.toString(), 'ERROR');
    }
  }

  success(message) {
    this.log(message, 'SUCCESS');
  }

  warn(message) {
    this.log(message, 'WARN');
  }

  /**
   * Execute shell command with logging
   */
  exec(command, options = {}) {
    this.log(`Executing: ${command}`);
    try {
      const result = execSync(command, { 
        encoding: 'utf8', 
        stdio: 'pipe',
        ...options 
      });
      this.log(`Command completed successfully`);
      return result;
    } catch (error) {
      this.error(`Command failed: ${command}`, error);
      throw error;
    }
  }

  /**
   * Pre-migration checks
   */
  async preMigrationChecks() {
    this.log('Starting pre-migration checks...');
    
    try {
      // Check if SQLite database exists
      const sqlitePath = path.join(__dirname, '..', '..', 'backend', 'database', 'database.sqlite');
      if (!fs.existsSync(sqlitePath)) {
        throw new Error('SQLite database not found at expected location');
      }
      this.success('SQLite database found');

      // Check SQLite database size
      const stats = fs.statSync(sqlitePath);
      this.log(`SQLite database size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);

      // Verify Laravel backend directory
      const backendPath = path.join(__dirname, '..', '..', 'backend');
      if (!fs.existsSync(backendPath)) {
        throw new Error('Laravel backend directory not found');
      }
      this.success('Laravel backend directory found');

      // Check if MySQL is accessible (will require MySQL to be running)
      try {
        this.exec('mysql --version');
        this.success('MySQL client available');
      } catch (error) {
        this.warn('MySQL client not found - ensure MySQL is installed for production');
      }

      // Check Laravel artisan commands
      try {
        process.chdir(backendPath);
        this.exec('php artisan --version');
        this.success('Laravel Artisan available');
      } catch (error) {
        this.error('Laravel Artisan not available', error);
        throw error;
      }

      this.success('Pre-migration checks completed successfully');
      return true;
    } catch (error) {
      this.error('Pre-migration checks failed', error);
      throw error;
    }
  }

  /**
   * Create backup of current SQLite database
   */
  async createBackup() {
    this.log('Creating backup of SQLite database...');
    
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFileName = `dixis_sqlite_backup_${timestamp}.sqlite`;
      const backupPath = path.join(this.backupDir, backupFileName);
      
      const sqlitePath = path.join(__dirname, '..', '..', 'backend', 'database', 'database.sqlite');
      
      // Copy SQLite file
      fs.copyFileSync(sqlitePath, backupPath);
      
      // Create backup info file
      const backupInfo = {
        timestamp: new Date().toISOString(),
        originalPath: sqlitePath,
        backupPath: backupPath,
        fileSize: fs.statSync(sqlitePath).size,
        migrationVersion: '1.0.0'
      };
      
      fs.writeFileSync(
        path.join(this.backupDir, `backup_info_${timestamp}.json`),
        JSON.stringify(backupInfo, null, 2)
      );
      
      this.success(`Backup created: ${backupFileName}`);
      return backupPath;
    } catch (error) {
      this.error('Backup creation failed', error);
      throw error;
    }
  }

  /**
   * Export SQLite data to SQL dump
   */
  async exportSQLiteData() {
    this.log('Exporting SQLite data to SQL dump...');
    
    try {
      const sqlitePath = path.join(__dirname, '..', '..', 'backend', 'database', 'database.sqlite');
      const dumpPath = path.join(this.backupDir, 'dixis_sqlite_dump.sql');
      
      // Export SQLite to SQL dump
      this.exec(`sqlite3 "${sqlitePath}" .dump > "${dumpPath}"`);
      
      // Verify dump was created
      if (!fs.existsSync(dumpPath)) {
        throw new Error('SQL dump file was not created');
      }
      
      const dumpSize = fs.statSync(dumpPath).size;
      this.success(`SQLite data exported to SQL dump (${(dumpSize / 1024).toFixed(2)} KB)`);
      
      return dumpPath;
    } catch (error) {
      this.error('SQLite data export failed', error);
      throw error;
    }
  }

  /**
   * Generate MySQL schema creation script
   */
  async generateMySQLSchema() {
    this.log('Generating MySQL schema creation script...');
    
    try {
      const schemaScript = `
-- MySQL Production Schema for Dixis Fresh
-- Generated: ${new Date().toISOString()}

-- Create database with proper charset
CREATE DATABASE IF NOT EXISTS dixis_production 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Use the database
USE dixis_production;

-- Create application user (run this as root)
-- CREATE USER 'dixis_user'@'%' IDENTIFIED BY 'SECURE_PRODUCTION_PASSWORD';
-- GRANT ALL PRIVILEGES ON dixis_production.* TO 'dixis_user'@'%';
-- FLUSH PRIVILEGES;

-- MySQL specific settings for optimal performance
SET GLOBAL innodb_buffer_pool_size = 1073741824; -- 1GB
SET GLOBAL innodb_file_per_table = ON;
SET GLOBAL innodb_flush_log_at_trx_commit = 2;

-- Enable slow query log for monitoring
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 2;

-- Performance indexes for Greek marketplace
-- These will be created after migration

-- Full-text search indexes (after migration)
-- ALTER TABLE products ADD FULLTEXT(name, description);
-- ALTER TABLE producers ADD FULLTEXT(business_name, description);

-- Performance indexes
-- CREATE INDEX idx_products_category_featured ON products (category, is_featured);
-- CREATE INDEX idx_products_producer_active ON products (producer_id, is_active);
-- CREATE INDEX idx_orders_user_date ON orders (user_id, created_at);
-- CREATE INDEX idx_shipping_zones_greece ON shipping_zones (country, region);
-- CREATE INDEX idx_cart_items_session ON cart_items (session_id, created_at);
-- CREATE INDEX idx_products_price_range ON products (price, is_active);
-- CREATE INDEX idx_users_email_verified ON users (email, email_verified_at);

-- Greek-specific optimizations
-- CREATE INDEX idx_shipping_zones_postal_code ON shipping_zones (postal_code_start, postal_code_end);
-- CREATE INDEX idx_products_seasonal ON products (seasonal_start, seasonal_end, is_active);
`;

      const schemaPath = path.join(this.backupDir, 'mysql_schema_setup.sql');
      fs.writeFileSync(schemaPath, schemaScript.trim());
      
      this.success('MySQL schema script generated');
      return schemaPath;
    } catch (error) {
      this.error('MySQL schema generation failed', error);
      throw error;
    }
  }

  /**
   * Generate Laravel migration commands
   */
  async generateMigrationCommands() {
    this.log('Generating Laravel migration commands...');
    
    try {
      const commands = [
        '# Laravel Production Migration Commands',
        '# Run these commands in the Laravel backend directory',
        '',
        '# 1. Update environment to use MySQL',
        'cp .env.production .env',
        '',
        '# 2. Clear Laravel caches',
        'php artisan config:clear',
        'php artisan cache:clear',
        'php artisan view:clear',
        '',
        '# 3. Run database migrations',
        'php artisan migrate --force',
        '',
        '# 4. Verify migration status',
        'php artisan migrate:status',
        '',
        '# 5. Seed essential data (if needed)',
        '# php artisan db:seed --class=ProductionSeeder',
        '',
        '# 6. Create storage link',
        'php artisan storage:link',
        '',
        '# 7. Optimize for production',
        'php artisan config:cache',
        'php artisan route:cache',
        'php artisan view:cache',
        '',
        '# 8. Run integrity checks',
        'php artisan db:check-integrity',
        '',
        '# 9. Create search indexes (after data import)',
        'php artisan scout:import "App\\Models\\Product"',
        'php artisan scout:import "App\\Models\\Producer"',
      ].join('\n');

      const commandsPath = path.join(this.backupDir, 'laravel_migration_commands.sh');
      fs.writeFileSync(commandsPath, commands);
      
      // Make it executable
      fs.chmodSync(commandsPath, '755');
      
      this.success('Laravel migration commands generated');
      return commandsPath;
    } catch (error) {
      this.error('Laravel migration commands generation failed', error);
      throw error;
    }
  }

  /**
   * Generate data integrity validation script
   */
  async generateValidationScript() {
    this.log('Generating data integrity validation script...');
    
    try {
      const validationSQL = `
-- Data Integrity Validation for Dixis Fresh Migration
-- Run this after migration to verify data integrity

-- Record count verification
SELECT 'users' as table_name, COUNT(*) as record_count FROM users
UNION ALL
SELECT 'producers', COUNT(*) FROM producers
UNION ALL
SELECT 'products', COUNT(*) FROM products
UNION ALL
SELECT 'orders', COUNT(*) FROM orders
UNION ALL
SELECT 'order_items', COUNT(*) FROM order_items
UNION ALL
SELECT 'cart_items', COUNT(*) FROM cart_items
UNION ALL
SELECT 'addresses', COUNT(*) FROM addresses
UNION ALL
SELECT 'businesses', COUNT(*) FROM businesses
UNION ALL
SELECT 'adoptions', COUNT(*) FROM adoptions
UNION ALL
SELECT 'adoptable_items', COUNT(*) FROM adoptable_items;

-- Referential integrity checks
SELECT 'orphaned_products' as issue, COUNT(*) as count 
FROM products p 
LEFT JOIN producers pr ON p.producer_id = pr.id 
WHERE pr.id IS NULL AND p.producer_id IS NOT NULL;

SELECT 'orphaned_order_items' as issue, COUNT(*) as count 
FROM order_items oi 
LEFT JOIN orders o ON oi.order_id = o.id 
WHERE o.id IS NULL;

SELECT 'orphaned_cart_items' as issue, COUNT(*) as count 
FROM cart_items ci 
LEFT JOIN products p ON ci.product_id = p.id 
WHERE p.id IS NULL;

-- Data quality checks
SELECT 'products_without_price' as issue, COUNT(*) as count 
FROM products 
WHERE price IS NULL OR price <= 0;

SELECT 'users_without_email' as issue, COUNT(*) as count 
FROM users 
WHERE email IS NULL OR email = '';

SELECT 'producers_without_business_name' as issue, COUNT(*) as count 
FROM producers 
WHERE business_name IS NULL OR business_name = '';

-- Greek-specific validations
SELECT 'invalid_vat_numbers' as issue, COUNT(*) as count 
FROM businesses 
WHERE vat_number IS NOT NULL 
AND vat_number NOT REGEXP '^[A-Z]{2}[0-9]{9}$';

SELECT 'invalid_postal_codes' as issue, COUNT(*) as count 
FROM addresses 
WHERE postal_code IS NOT NULL 
AND country = 'GR' 
AND postal_code NOT REGEXP '^[0-9]{5}$';

-- Performance baseline queries
SELECT 'avg_products_per_producer' as metric, AVG(product_count) as value
FROM (
    SELECT producer_id, COUNT(*) as product_count 
    FROM products 
    WHERE is_active = 1 
    GROUP BY producer_id
) as producer_stats;

SELECT 'products_with_images' as metric, 
       (COUNT(CASE WHEN main_image IS NOT NULL THEN 1 END) * 100.0 / COUNT(*)) as percentage
FROM products;

-- Greek VAT calculation test
SELECT 'avg_tax_percentage' as metric, 
       AVG((total_tax * 100.0) / (total_amount - total_tax)) as avg_tax_rate
FROM orders 
WHERE total_tax > 0 AND total_amount > total_tax;
`;

      const validationPath = path.join(this.backupDir, 'data_integrity_validation.sql');
      fs.writeFileSync(validationPath, validationSQL.trim());
      
      this.success('Data integrity validation script generated');
      return validationPath;
    } catch (error) {
      this.error('Validation script generation failed', error);
      throw error;
    }
  }

  /**
   * Generate rollback script
   */
  async generateRollbackScript() {
    this.log('Generating rollback script...');
    
    try {
      const rollbackScript = `#!/bin/bash
# Emergency Rollback Script for Dixis Fresh
# Generated: ${new Date().toISOString()}

set -e  # Exit on any error

echo "🚨 EMERGENCY ROLLBACK INITIATED"
echo "Timestamp: $(date)"

# Navigate to Laravel backend
cd "$(dirname "$0")/../../backend"

# Enable maintenance mode
echo "1. Enabling maintenance mode..."
php artisan down --message="Emergency database rollback in progress"

# Switch back to SQLite
echo "2. Switching to SQLite configuration..."
cp .env.sqlite .env || cp .env.local .env

# Clear Laravel caches
echo "3. Clearing application caches..."
php artisan config:clear
php artisan cache:clear
php artisan view:clear

# Restore SQLite backup (latest)
echo "4. Restoring SQLite database..."
BACKUP_FILE=$(ls -t ../dixis-fresh/backups/dixis_sqlite_backup_*.sqlite | head -n1)
if [ -f "$BACKUP_FILE" ]; then
    cp "$BACKUP_FILE" database/database.sqlite
    echo "✅ SQLite database restored from: $BACKUP_FILE"
else
    echo "❌ No SQLite backup found!"
    exit 1
fi

# Verify database connection
echo "5. Verifying database connection..."
php artisan migrate:status

# Run basic integrity check
echo "6. Running basic integrity check..."
php artisan tinker --execute="echo 'Users: ' . App\\Models\\User::count(); echo 'Products: ' . App\\Models\\Product::count();"

# Clear caches again
echo "7. Optimizing application..."
php artisan config:cache
php artisan route:cache

# Disable maintenance mode
echo "8. Bringing application back online..."
php artisan up

echo "✅ ROLLBACK COMPLETED SUCCESSFULLY"
echo "Application is now running on SQLite"
echo "Timestamp: $(date)"

# Log rollback event
echo "$(date): Emergency rollback completed - switched back to SQLite" >> rollback.log
`;

      const rollbackPath = path.join(this.backupDir, 'emergency_rollback.sh');
      fs.writeFileSync(rollbackPath, rollbackScript.trim());
      
      // Make it executable
      fs.chmodSync(rollbackPath, '755');
      
      this.success('Emergency rollback script generated');
      return rollbackPath;
    } catch (error) {
      this.error('Rollback script generation failed', error);
      throw error;
    }
  }

  /**
   * Generate production environment template
   */
  async generateProductionEnvTemplate() {
    this.log('Generating production environment template...');
    
    try {
      const envTemplate = `# Dixis Fresh Production Environment
# Generated: ${new Date().toISOString()}

APP_NAME="Dixis Fresh"
APP_ENV=production
APP_KEY=base64:YOUR_PRODUCTION_KEY_HERE
APP_DEBUG=false
APP_URL=https://dixis.gr

LOG_CHANNEL=stack
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=error

# MySQL Production Database
DB_CONNECTION=mysql
DB_HOST=your-mysql-host.example.com
DB_PORT=3306
DB_DATABASE=dixis_production
DB_USERNAME=dixis_user
DB_PASSWORD=YOUR_SECURE_PASSWORD_HERE

# Database SSL (recommended for production)
DB_SSL_MODE=required
DB_SSL_CERT=/path/to/client-cert.pem
DB_SSL_KEY=/path/to/client-key.pem
DB_SSL_CA=/path/to/ca-cert.pem

# Redis Cache (recommended for production)
CACHE_DRIVER=redis
QUEUE_CONNECTION=redis
SESSION_DRIVER=redis

REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

# Email Configuration
MAIL_MAILER=smtp
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_USERNAME=noreply@dixis.gr
MAIL_PASSWORD=your-email-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@dixis.gr
MAIL_FROM_NAME="Dixis Fresh"

# Stripe Payment Processing
STRIPE_KEY=pk_live_YOUR_LIVE_PUBLISHABLE_KEY
STRIPE_SECRET=sk_live_YOUR_LIVE_SECRET_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET

# Greek Tax Configuration
GREEK_VAT_RATE_STANDARD=0.24
GREEK_VAT_RATE_REDUCED=0.13
GREEK_VAT_RATE_SUPER_REDUCED=0.06
GREEK_VAT_BUSINESS_REGISTRATION=YOUR_BUSINESS_VAT_NUMBER

# File Storage (AWS S3 recommended for production)
FILESYSTEM_DISK=s3
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_DEFAULT_REGION=eu-west-1
AWS_BUCKET=dixis-production-storage
AWS_USE_PATH_STYLE_ENDPOINT=false

# QuickBooks Integration
QUICKBOOKS_CLIENT_ID=your-quickbooks-client-id
QUICKBOOKS_CLIENT_SECRET=your-quickbooks-client-secret
QUICKBOOKS_ENVIRONMENT=production

# Greek Courier Integration
COURIER_API_KEY=your-courier-api-key
COURIER_ENVIRONMENT=production

# Security
SECURE_SSL_REDIRECT=true
SESSION_SECURE_COOKIE=true
SANCTUM_STATEFUL_DOMAINS=dixis.gr,www.dixis.gr

# Performance Monitoring
TELESCOPE_ENABLED=false
DEBUGBAR_ENABLED=false

# Backup Configuration
BACKUP_ENABLED=true
BACKUP_NOTIFICATION_EMAIL=admin@dixis.gr

# Error Tracking (Sentry recommended)
SENTRY_LARAVEL_DSN=your-sentry-dsn
SENTRY_TRACES_SAMPLE_RATE=0.1
`;

      const envPath = path.join(this.backupDir, '.env.production.template');
      fs.writeFileSync(envPath, envTemplate.trim());
      
      this.success('Production environment template generated');
      return envPath;
    } catch (error) {
      this.error('Production environment template generation failed', error);
      throw error;
    }
  }

  /**
   * Generate final migration report
   */
  async generateMigrationReport() {
    this.log('Generating migration report...');
    
    try {
      const endTime = new Date();
      const duration = Math.round((endTime - this.startTime) / 1000);
      
      const report = {
        migration: {
          timestamp: this.startTime.toISOString(),
          duration_seconds: duration,
          status: 'preparation_complete',
          version: '1.0.0'
        },
        files_generated: {
          backup_directory: this.backupDir,
          sqlite_backup: 'dixis_sqlite_backup_*.sqlite',
          sql_dump: 'dixis_sqlite_dump.sql',
          mysql_schema: 'mysql_schema_setup.sql',
          migration_commands: 'laravel_migration_commands.sh',
          validation_script: 'data_integrity_validation.sql',
          rollback_script: 'emergency_rollback.sh',
          env_template: '.env.production.template'
        },
        next_steps: [
          '1. Review and customize .env.production.template',
          '2. Provision MySQL database in production',
          '3. Run mysql_schema_setup.sql to create database',
          '4. Execute laravel_migration_commands.sh in backend directory',
          '5. Import data and run validation script',
          '6. Test application functionality',
          '7. Monitor performance and maintain rollback capability'
        ],
        checklist: {
          pre_migration_checks: 'completed',
          backup_creation: 'completed',
          script_generation: 'completed',
          documentation: 'completed'
        }
      };
      
      const reportPath = path.join(this.backupDir, 'migration_report.json');
      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
      
      this.success(`Migration preparation completed in ${duration} seconds`);
      this.success(`All files generated in: ${this.backupDir}`);
      
      return report;
    } catch (error) {
      this.error('Migration report generation failed', error);
      throw error;
    }
  }

  /**
   * Main migration preparation process
   */
  async run() {
    try {
      this.log('🚀 Starting Production Database Migration Preparation');
      
      await this.preMigrationChecks();
      await this.createBackup();
      await this.exportSQLiteData();
      await this.generateMySQLSchema();
      await this.generateMigrationCommands();
      await this.generateValidationScript();
      await this.generateRollbackScript();
      await this.generateProductionEnvTemplate();
      
      const report = await this.generateMigrationReport();
      
      this.success('🎉 Migration preparation completed successfully!');
      this.log('📁 Check the backups directory for all generated files');
      this.log('📖 Review PRODUCTION_DATABASE_MIGRATION_PLAN.md for detailed instructions');
      
      return report;
    } catch (error) {
      this.error('❌ Migration preparation failed', error);
      throw error;
    }
  }
}

// Run the migration preparation if called directly
if (require.main === module) {
  const migration = new ProductionDatabaseMigration();
  migration.run()
    .then(report => {
      console.log('\n✅ Migration preparation completed successfully!');
      console.log('📋 Summary:');
      console.log(`   - Duration: ${report.migration.duration_seconds} seconds`);
      console.log(`   - Files: ${Object.keys(report.files_generated).length} generated`);
      console.log(`   - Backup: ${report.files_generated.backup_directory}`);
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Migration preparation failed:', error.message);
      process.exit(1);
    });
}

module.exports = ProductionDatabaseMigration;