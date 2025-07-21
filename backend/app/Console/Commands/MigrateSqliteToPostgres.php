<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\File;

class MigrateSqliteToPostgres extends Command
{
    protected $signature = 'db:sqlite-to-postgres';
    protected $description = 'Migrate all data from SQLite to PostgreSQL';

    public function handle()
    {
        $this->info('🚀 Starting SQLite to PostgreSQL migration...');
        
        // Step 1: Setup SQLite connection
        $sqlitePath = '/Users/panagiotiskourkoutis/Dixis Project 2/backend/database/database.sqlite';
        
        if (!File::exists($sqlitePath)) {
            $this->error("SQLite database not found at: $sqlitePath");
            return 1;
        }
        
        // Configure SQLite connection
        config(['database.connections.sqlite_source' => [
            'driver' => 'sqlite',
            'database' => $sqlitePath,
            'prefix' => '',
            'foreign_key_constraints' => false,
        ]]);
        
        $sqlite = DB::connection('sqlite_source');
        $pgsql = DB::connection('pgsql');
        
        // Step 2: Create tables schema in PostgreSQL
        $this->info('📋 Creating PostgreSQL schema...');
        $this->createPostgresSchema($pgsql);
        
        // Step 3: Get critical tables in order
        $criticalTables = [
            'users',
            'categories', 
            'producers',
            'products',
            'carts',
            'cart_items',
            'orders',
            'order_items',
            'addresses',
            'businesses',
            'payments',
            'invoices',
            'reviews'
        ];
        
        // Step 4: Migrate data table by table
        $this->info("\n📦 Migrating data...\n");
        
        foreach ($criticalTables as $table) {
            $this->migrateTable($sqlite, $pgsql, $table);
        }
        
        // Step 5: Update sequences
        $this->updatePostgresSequences($pgsql);
        
        // Step 6: Verify results
        $this->verifyMigration($pgsql);
        
        $this->info("\n✅ Migration completed successfully!");
        
        return 0;
    }
    
    private function createPostgresSchema($pgsql)
    {
        // Drop all tables first
        $pgsql->statement('DROP SCHEMA public CASCADE');
        $pgsql->statement('CREATE SCHEMA public');
        
        // Create essential tables with minimal structure
        $statements = [
            // Users table
            "CREATE TABLE users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                email_verified_at TIMESTAMP NULL,
                password VARCHAR(255) NOT NULL,
                phone VARCHAR(255) NULL,
                first_name VARCHAR(255) NULL,
                last_name VARCHAR(255) NULL,
                address TEXT NULL,
                city VARCHAR(255) NULL,
                postal_code VARCHAR(20) NULL,
                country VARCHAR(255) NULL DEFAULT 'Greece',
                is_producer BOOLEAN DEFAULT FALSE,
                is_admin BOOLEAN DEFAULT FALSE,
                remember_token VARCHAR(100) NULL,
                created_at TIMESTAMP NULL,
                updated_at TIMESTAMP NULL
            )",
            
            // Categories table
            "CREATE TABLE categories (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                slug VARCHAR(255) UNIQUE NOT NULL,
                description TEXT NULL,
                image VARCHAR(255) NULL,
                parent_id INTEGER NULL,
                sort_order INTEGER DEFAULT 0,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP NULL,
                updated_at TIMESTAMP NULL
            )",
            
            // Producers table
            "CREATE TABLE producers (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NULL,
                business_name VARCHAR(255) NOT NULL,
                slug VARCHAR(255) UNIQUE NOT NULL,
                description TEXT NULL,
                logo VARCHAR(255) NULL,
                cover_image VARCHAR(255) NULL,
                location VARCHAR(255) NULL,
                address TEXT NULL,
                city VARCHAR(255) NULL,
                postal_code VARCHAR(20) NULL,
                phone VARCHAR(255) NULL,
                email VARCHAR(255) NULL,
                website VARCHAR(255) NULL,
                established_year INTEGER NULL,
                certifications TEXT NULL,
                story TEXT NULL,
                farming_practices TEXT NULL,
                rating DECIMAL(3,2) DEFAULT 0,
                total_reviews INTEGER DEFAULT 0,
                is_verified BOOLEAN DEFAULT FALSE,
                is_active BOOLEAN DEFAULT TRUE,
                commission_rate DECIMAL(5,2) DEFAULT 15.00,
                created_at TIMESTAMP NULL,
                updated_at TIMESTAMP NULL
            )",
            
            // Products table
            "CREATE TABLE products (
                id SERIAL PRIMARY KEY,
                producer_id INTEGER NOT NULL,
                category_id INTEGER NULL,
                name VARCHAR(255) NOT NULL,
                slug VARCHAR(255) UNIQUE NOT NULL,
                description TEXT NULL,
                price DECIMAL(10,2) NOT NULL,
                unit VARCHAR(50) DEFAULT 'piece',
                stock_quantity INTEGER DEFAULT 0,
                image VARCHAR(255) NULL,
                images JSON NULL,
                weight DECIMAL(8,2) NULL,
                sku VARCHAR(100) NULL,
                barcode VARCHAR(100) NULL,
                origin VARCHAR(255) NULL,
                ingredients TEXT NULL,
                nutritional_info TEXT NULL,
                storage_instructions TEXT NULL,
                preparation_tips TEXT NULL,
                harvest_date DATE NULL,
                expiry_date DATE NULL,
                is_organic BOOLEAN DEFAULT FALSE,
                is_seasonal BOOLEAN DEFAULT FALSE,
                season_start INTEGER NULL,
                season_end INTEGER NULL,
                rating DECIMAL(3,2) DEFAULT 0,
                total_reviews INTEGER DEFAULT 0,
                is_featured BOOLEAN DEFAULT FALSE,
                is_active BOOLEAN DEFAULT TRUE,
                meta_title VARCHAR(255) NULL,
                meta_description TEXT NULL,
                created_at TIMESTAMP NULL,
                updated_at TIMESTAMP NULL
            )",
            
            // Carts table
            "CREATE TABLE carts (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NULL,
                session_id VARCHAR(255) NULL,
                items JSON NULL,
                item_count INTEGER DEFAULT 0,
                subtotal DECIMAL(10,2) DEFAULT 0,
                tax DECIMAL(10,2) DEFAULT 0,
                shipping DECIMAL(10,2) DEFAULT 0,
                total DECIMAL(10,2) DEFAULT 0,
                currency VARCHAR(3) DEFAULT 'EUR',
                created_at TIMESTAMP NULL,
                updated_at TIMESTAMP NULL
            )",
            
            // Cart items table
            "CREATE TABLE cart_items (
                id SERIAL PRIMARY KEY,
                cart_id INTEGER NOT NULL,
                product_id INTEGER NOT NULL,
                quantity INTEGER NOT NULL DEFAULT 1,
                price DECIMAL(10,2) NOT NULL,
                subtotal DECIMAL(10,2) NOT NULL,
                attributes JSON NULL,
                created_at TIMESTAMP NULL,
                updated_at TIMESTAMP NULL
            )",
            
            // Orders table
            "CREATE TABLE orders (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NULL,
                order_number VARCHAR(50) UNIQUE NOT NULL,
                status VARCHAR(50) DEFAULT 'pending',
                subtotal DECIMAL(10,2) NOT NULL,
                tax DECIMAL(10,2) DEFAULT 0,
                shipping DECIMAL(10,2) DEFAULT 0,
                discount DECIMAL(10,2) DEFAULT 0,
                total DECIMAL(10,2) NOT NULL,
                currency VARCHAR(3) DEFAULT 'EUR',
                payment_method VARCHAR(50) NULL,
                payment_status VARCHAR(50) DEFAULT 'pending',
                shipping_method VARCHAR(50) NULL,
                shipping_address JSON NULL,
                billing_address JSON NULL,
                notes TEXT NULL,
                shipped_at TIMESTAMP NULL,
                delivered_at TIMESTAMP NULL,
                created_at TIMESTAMP NULL,
                updated_at TIMESTAMP NULL
            )",
            
            // Order items table
            "CREATE TABLE order_items (
                id SERIAL PRIMARY KEY,
                order_id INTEGER NOT NULL,
                product_id INTEGER NOT NULL,
                producer_id INTEGER NOT NULL,
                quantity INTEGER NOT NULL DEFAULT 1,
                price DECIMAL(10,2) NOT NULL,
                subtotal DECIMAL(10,2) NOT NULL,
                commission DECIMAL(10,2) DEFAULT 0,
                created_at TIMESTAMP NULL,
                updated_at TIMESTAMP NULL
            )",
            
            // Other essential tables
            "CREATE TABLE addresses (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL,
                type VARCHAR(50) DEFAULT 'shipping',
                first_name VARCHAR(255) NULL,
                last_name VARCHAR(255) NULL,
                company VARCHAR(255) NULL,
                address_line1 VARCHAR(255) NOT NULL,
                address_line2 VARCHAR(255) NULL,
                city VARCHAR(255) NOT NULL,
                state VARCHAR(255) NULL,
                postal_code VARCHAR(20) NOT NULL,
                country VARCHAR(255) DEFAULT 'Greece',
                phone VARCHAR(50) NULL,
                is_default BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP NULL,
                updated_at TIMESTAMP NULL
            )",
            
            "CREATE TABLE businesses (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL,
                name VARCHAR(255) NOT NULL,
                vat_number VARCHAR(50) NULL,
                tax_office VARCHAR(255) NULL,
                address TEXT NULL,
                city VARCHAR(255) NULL,
                postal_code VARCHAR(20) NULL,
                phone VARCHAR(50) NULL,
                email VARCHAR(255) NULL,
                is_verified BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP NULL,
                updated_at TIMESTAMP NULL
            )",
            
            "CREATE TABLE payments (
                id SERIAL PRIMARY KEY,
                order_id INTEGER NOT NULL,
                amount DECIMAL(10,2) NOT NULL,
                currency VARCHAR(3) DEFAULT 'EUR',
                method VARCHAR(50) NOT NULL,
                status VARCHAR(50) DEFAULT 'pending',
                transaction_id VARCHAR(255) NULL,
                gateway_response JSON NULL,
                paid_at TIMESTAMP NULL,
                created_at TIMESTAMP NULL,
                updated_at TIMESTAMP NULL
            )",
            
            "CREATE TABLE invoices (
                id SERIAL PRIMARY KEY,
                order_id INTEGER NOT NULL,
                invoice_number VARCHAR(50) UNIQUE NOT NULL,
                amount DECIMAL(10,2) NOT NULL,
                tax DECIMAL(10,2) DEFAULT 0,
                total DECIMAL(10,2) NOT NULL,
                status VARCHAR(50) DEFAULT 'pending',
                issued_at TIMESTAMP NULL,
                due_at TIMESTAMP NULL,
                paid_at TIMESTAMP NULL,
                created_at TIMESTAMP NULL,
                updated_at TIMESTAMP NULL
            )",
            
            "CREATE TABLE reviews (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL,
                product_id INTEGER NOT NULL,
                order_id INTEGER NULL,
                rating INTEGER NOT NULL,
                title VARCHAR(255) NULL,
                comment TEXT NULL,
                is_verified BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP NULL,
                updated_at TIMESTAMP NULL
            )"
        ];
        
        foreach ($statements as $sql) {
            try {
                $pgsql->statement($sql);
            } catch (\Exception $e) {
                $this->warn("Failed to create table: " . $e->getMessage());
            }
        }
        
        $this->info("✅ PostgreSQL schema created");
    }
    
    private function migrateTable($sqlite, $pgsql, $table)
    {
        try {
            // Check if table exists in SQLite
            $exists = $sqlite->select("SELECT name FROM sqlite_master WHERE type='table' AND name=?", [$table]);
            if (empty($exists)) {
                $this->warn("  ⚠️  Table '$table' not found in SQLite");
                return;
            }
            
            // Get data from SQLite
            $data = $sqlite->table($table)->get();
            
            if ($data->isEmpty()) {
                $this->info("  ⚠️  Table '$table' is empty");
                return;
            }
            
            // Convert to array and clean data
            $records = $data->map(function ($item) {
                $array = (array) $item;
                
                // Clean up data types
                foreach ($array as $key => $value) {
                    // Convert JSON strings to proper JSON
                    if (is_string($value) && (substr($value, 0, 1) === '{' || substr($value, 0, 1) === '[')) {
                        // Keep as string for PostgreSQL JSON columns
                        continue;
                    }
                    
                    // Convert SQLite datetime format
                    if (is_string($value) && preg_match('/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/', $value)) {
                        $array[$key] = str_replace(' ', 'T', $value);
                    }
                    
                    // Handle null values
                    if ($value === '' || $value === 'null') {
                        $array[$key] = null;
                    }
                }
                
                return $array;
            })->toArray();
            
            // Insert in chunks
            foreach (array_chunk($records, 100) as $chunk) {
                $pgsql->table($table)->insert($chunk);
            }
            
            $this->info("  ✅ Migrated '$table': " . count($records) . " records");
            
        } catch (\Exception $e) {
            $this->error("  ❌ Failed to migrate '$table': " . $e->getMessage());
        }
    }
    
    private function updatePostgresSequences($pgsql)
    {
        $this->info("\n🔧 Updating PostgreSQL sequences...");
        
        $tables = $pgsql->select("
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
        ");
        
        foreach ($tables as $table) {
            try {
                $maxId = $pgsql->table($table->table_name)->max('id');
                if ($maxId > 0) {
                    $pgsql->statement("SELECT setval('{$table->table_name}_id_seq', ?)", [$maxId]);
                    $this->info("  ✅ Updated sequence for {$table->table_name}");
                }
            } catch (\Exception $e) {
                // Some tables might not have an id column
            }
        }
    }
    
    private function verifyMigration($pgsql)
    {
        $this->info("\n🔍 Verifying migration...");
        
        $counts = [
            'users' => $pgsql->table('users')->count(),
            'categories' => $pgsql->table('categories')->count(),
            'producers' => $pgsql->table('producers')->count(),
            'products' => $pgsql->table('products')->count(),
            'orders' => $pgsql->table('orders')->count(),
            'carts' => $pgsql->table('carts')->count(),
        ];
        
        foreach ($counts as $table => $count) {
            $this->info("  $table: $count records");
        }
        
        $this->info("\n📊 Total products in PostgreSQL: " . $counts['products']);
    }
}