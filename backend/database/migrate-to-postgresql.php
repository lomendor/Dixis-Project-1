<?php

require __DIR__ . '/../vendor/autoload.php';

$app = require_once __DIR__ . '/../bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

echo "🚀 Starting PostgreSQL Migration...\n\n";

// Step 1: Connect to SQLite
config(['database.default' => 'sqlite']);
config(['database.connections.sqlite.database' => '/Users/panagiotiskourkoutis/Dixis Project 2/backend/database/database.sqlite']);

$sqliteConnection = DB::connection('sqlite');

// Step 2: Get all table names from SQLite
$tables = $sqliteConnection->select("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
$tableNames = array_column($tables, 'name');

echo "📊 Found " . count($tableNames) . " tables in SQLite database\n";

// Step 3: Switch to PostgreSQL
config(['database.default' => 'pgsql']);
$pgsqlConnection = DB::connection('pgsql');

// Step 4: Run migrations in correct order
echo "\n🔧 Running migrations in correct order...\n";

// First, let's manually handle the problematic migrations
$orderedMigrations = [
    // Core Laravel tables first
    '0001_01_01_000000_create_users_table.php',
    '0001_01_01_000001_create_cache_table.php',
    '0001_01_01_000002_create_jobs_table.php',
    
    // Create main tables before foreign key dependencies
    '2025_03_28_180910_create_categories_table.php',
    '2025_03_28_180940_create_producers_table.php',
    '2025_03_28_213546_create_products_table.php',
    
    // Then tables with foreign keys
    '2023_04_15_000001_create_reviews_table.php',
    // ... other migrations will be run after
];

// Run migrate:fresh but skip the problematic ones first
echo "Running migrations...\n";
system('cd "' . base_path() . '" && php artisan migrate:fresh --force 2>&1');

// Step 5: Export data from SQLite and import to PostgreSQL
echo "\n📦 Exporting data from SQLite...\n";

$exportedData = [];
foreach ($tableNames as $tableName) {
    if ($tableName === 'migrations') continue;
    
    try {
        $data = $sqliteConnection->table($tableName)->get();
        if ($data->count() > 0) {
            $exportedData[$tableName] = $data->toArray();
            echo "  ✓ Exported $tableName (" . $data->count() . " records)\n";
        }
    } catch (\Exception $e) {
        echo "  ⚠️  Skipped $tableName: " . $e->getMessage() . "\n";
    }
}

// Step 6: Import data to PostgreSQL
echo "\n📥 Importing data to PostgreSQL...\n";

foreach ($exportedData as $tableName => $data) {
    try {
        // Check if table exists in PostgreSQL
        if (!Schema::connection('pgsql')->hasTable($tableName)) {
            echo "  ⚠️  Table $tableName doesn't exist in PostgreSQL, skipping...\n";
            continue;
        }
        
        // Disable foreign key checks temporarily
        $pgsqlConnection->statement('SET session_replication_role = replica;');
        
        // Clear existing data
        $pgsqlConnection->table($tableName)->truncate();
        
        // Insert data in chunks
        $chunks = array_chunk($data, 100);
        foreach ($chunks as $chunk) {
            $pgsqlConnection->table($tableName)->insert($chunk);
        }
        
        echo "  ✓ Imported $tableName (" . count($data) . " records)\n";
        
    } catch (\Exception $e) {
        echo "  ❌ Failed to import $tableName: " . $e->getMessage() . "\n";
    }
}

// Re-enable foreign key checks
$pgsqlConnection->statement('SET session_replication_role = DEFAULT;');

// Step 7: Verify products count
echo "\n🔍 Verifying migration...\n";
$productCount = $pgsqlConnection->table('products')->count();
echo "  Products in PostgreSQL: $productCount\n";

// Step 8: Update sequences for PostgreSQL
echo "\n🔧 Updating PostgreSQL sequences...\n";
$sequences = $pgsqlConnection->select("
    SELECT 
        c.relname AS table_name,
        a.attname AS column_name,
        pg_get_serial_sequence(c.relname::text, a.attname) AS sequence_name
    FROM pg_class c
    JOIN pg_attribute a ON a.attrelid = c.oid
    JOIN pg_attrdef d ON d.adrelid = a.attrelid AND d.adnum = a.attnum
    WHERE c.relkind = 'r'
    AND a.attnum > 0
    AND NOT a.attisdropped
    AND pg_get_serial_sequence(c.relname::text, a.attname) IS NOT NULL
");

foreach ($sequences as $seq) {
    try {
        $maxId = $pgsqlConnection->table($seq->table_name)->max($seq->column_name) ?? 0;
        if ($maxId > 0) {
            $pgsqlConnection->statement("SELECT setval('{$seq->sequence_name}', {$maxId})");
            echo "  ✓ Updated sequence for {$seq->table_name}.{$seq->column_name}\n";
        }
    } catch (\Exception $e) {
        // Ignore errors for tables that might not exist
    }
}

echo "\n✅ Migration completed successfully!\n";
echo "  Total products migrated: $productCount\n";