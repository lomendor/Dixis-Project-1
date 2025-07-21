<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class MigrateFromSqlite extends Command
{
    protected $signature = 'db:migrate-from-sqlite';
    protected $description = 'Migrate data from SQLite to PostgreSQL';

    public function handle()
    {
        $this->info('Starting SQLite to PostgreSQL migration...');
        
        // Connect to SQLite
        config(['database.default' => 'sqlite']);
        config(['database.connections.sqlite.database' => '/Users/panagiotiskourkoutis/Dixis Project 2/backend/database/database.sqlite']);
        
        // Get SQLite connection
        $sqlite = DB::connection('sqlite');
        
        // Get all tables with their data
        $tables = [
            'users', 'categories', 'producers', 'products', 
            'orders', 'order_items', 'carts', 'cart_items',
            'addresses', 'businesses', 'payments', 'invoices',
            'reviews', 'favorites', 'wishlists'
        ];
        
        $data = [];
        foreach ($tables as $table) {
            try {
                if ($sqlite->getSchemaBuilder()->hasTable($table)) {
                    $tableData = $sqlite->table($table)->get();
                    if ($tableData->count() > 0) {
                        $data[$table] = $tableData->toArray();
                        $this->info("Exported {$table}: {$tableData->count()} records");
                    }
                }
            } catch (\Exception $e) {
                $this->warn("Skipped {$table}: " . $e->getMessage());
            }
        }
        
        // Switch to PostgreSQL
        config(['database.default' => 'pgsql']);
        $pgsql = DB::connection('pgsql');
        
        // Create basic schema
        $this->createBasicSchema($pgsql);
        
        // Import data
        $this->info("\nImporting data to PostgreSQL...");
        
        foreach ($data as $table => $records) {
            try {
                if ($pgsql->getSchemaBuilder()->hasTable($table)) {
                    // Disable foreign key checks
                    $pgsql->statement('SET session_replication_role = replica;');
                    
                    // Insert data
                    foreach (array_chunk($records, 100) as $chunk) {
                        $pgsql->table($table)->insert($chunk);
                    }
                    
                    $this->info("Imported {$table}: " . count($records) . " records");
                }
            } catch (\Exception $e) {
                $this->error("Failed to import {$table}: " . $e->getMessage());
            }
        }
        
        // Re-enable foreign key checks
        $pgsql->statement('SET session_replication_role = DEFAULT;');
        
        // Update sequences
        $this->updateSequences($pgsql);
        
        // Verify
        $productCount = $pgsql->table('products')->count();
        $this->info("\n✅ Migration completed! Products in PostgreSQL: {$productCount}");
        
        return 0;
    }
    
    private function createBasicSchema($db)
    {
        $this->info("\nCreating basic schema...");
        
        // Create tables in order without foreign keys first
        Schema::connection('pgsql')->dropAllTables();
        
        // Users table
        if (!Schema::connection('pgsql')->hasTable('users')) {
            Schema::connection('pgsql')->create('users', function ($table) {
                $table->id();
                $table->string('name');
                $table->string('email')->unique();
                $table->timestamp('email_verified_at')->nullable();
                $table->string('password');
                $table->string('phone')->nullable();
                $table->string('remember_token')->nullable();
                $table->timestamps();
            });
        }
        
        // Categories
        if (!Schema::connection('pgsql')->hasTable('categories')) {
            Schema::connection('pgsql')->create('categories', function ($table) {
                $table->id();
                $table->string('name');
                $table->string('slug')->unique();
                $table->text('description')->nullable();
                $table->string('image')->nullable();
                $table->timestamps();
            });
        }
        
        // Producers
        if (!Schema::connection('pgsql')->hasTable('producers')) {
            Schema::connection('pgsql')->create('producers', function ($table) {
                $table->id();
                $table->unsignedBigInteger('user_id')->nullable();
                $table->string('business_name');
                $table->string('slug')->unique();
                $table->text('description')->nullable();
                $table->string('logo')->nullable();
                $table->string('cover_image')->nullable();
                $table->string('location')->nullable();
                $table->decimal('rating', 3, 2)->default(0);
                $table->integer('total_reviews')->default(0);
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        }
        
        // Products
        if (!Schema::connection('pgsql')->hasTable('products')) {
            Schema::connection('pgsql')->create('products', function ($table) {
                $table->id();
                $table->unsignedBigInteger('producer_id');
                $table->unsignedBigInteger('category_id')->nullable();
                $table->string('name');
                $table->string('slug')->unique();
                $table->text('description')->nullable();
                $table->decimal('price', 10, 2);
                $table->string('unit')->default('piece');
                $table->integer('stock_quantity')->default(0);
                $table->string('image')->nullable();
                $table->boolean('is_active')->default(true);
                $table->decimal('weight', 8, 2)->nullable();
                $table->string('sku')->nullable();
                $table->decimal('rating', 3, 2)->default(0);
                $table->integer('total_reviews')->default(0);
                $table->json('images')->nullable();
                $table->timestamps();
            });
        }
        
        // Orders
        if (!Schema::connection('pgsql')->hasTable('orders')) {
            Schema::connection('pgsql')->create('orders', function ($table) {
                $table->id();
                $table->unsignedBigInteger('user_id')->nullable();
                $table->string('order_number')->unique();
                $table->string('status')->default('pending');
                $table->decimal('subtotal', 10, 2);
                $table->decimal('tax', 10, 2)->default(0);
                $table->decimal('shipping', 10, 2)->default(0);
                $table->decimal('total', 10, 2);
                $table->json('shipping_address')->nullable();
                $table->json('billing_address')->nullable();
                $table->timestamps();
            });
        }
        
        $this->info("Basic schema created");
    }
    
    private function updateSequences($db)
    {
        $this->info("\nUpdating PostgreSQL sequences...");
        
        $tables = ['users', 'categories', 'producers', 'products', 'orders'];
        
        foreach ($tables as $table) {
            try {
                $maxId = $db->table($table)->max('id') ?? 0;
                if ($maxId > 0) {
                    $db->statement("SELECT setval('{$table}_id_seq', {$maxId})");
                    $this->info("Updated sequence for {$table}");
                }
            } catch (\Exception $e) {
                // Ignore
            }
        }
    }
}
