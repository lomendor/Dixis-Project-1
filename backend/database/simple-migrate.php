<?php

// Simple direct migration script
$sqlitePath = '/Users/panagiotiskourkoutis/Dixis Project 2/backend/database/database.sqlite';
$pdo_sqlite = new PDO("sqlite:$sqlitePath");
$pdo_pgsql = new PDO("pgsql:host=localhost;dbname=dixis_production", 'postgres', 'dixis_secure_password_2025');

echo "🚀 Starting simple migration...\n\n";

// Set error mode
$pdo_sqlite->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
$pdo_pgsql->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

// Drop and recreate schema
try {
    $pdo_pgsql->exec("DROP SCHEMA public CASCADE");
    $pdo_pgsql->exec("CREATE SCHEMA public");
    echo "✅ Schema reset complete\n";
} catch (Exception $e) {
    echo "⚠️ Schema reset failed: " . $e->getMessage() . "\n";
}

// Create minimal tables
$tables = [
    "CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255),
        password VARCHAR(255),
        created_at TIMESTAMP,
        updated_at TIMESTAMP
    )",
    
    "CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        slug VARCHAR(255),
        description TEXT,
        created_at TIMESTAMP,
        updated_at TIMESTAMP
    )",
    
    "CREATE TABLE IF NOT EXISTS producers (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        business_name VARCHAR(255),
        description TEXT,
        created_at TIMESTAMP,
        updated_at TIMESTAMP
    )",
    
    "CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        producer_id INTEGER,
        category_id INTEGER,
        name VARCHAR(255),
        slug VARCHAR(255),
        description TEXT,
        price DECIMAL(10,2),
        stock_quantity INTEGER DEFAULT 0,
        created_at TIMESTAMP,
        updated_at TIMESTAMP
    )"
];

foreach ($tables as $sql) {
    try {
        $pdo_pgsql->exec($sql);
        echo "✅ Table created\n";
    } catch (Exception $e) {
        echo "❌ Table creation failed: " . $e->getMessage() . "\n";
    }
}

// Migrate products
echo "\n📦 Migrating products...\n";
try {
    $stmt = $pdo_sqlite->query("SELECT id, producer_id, category_id, name, slug, description, price, stock_quantity, created_at, updated_at FROM products");
    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $insert = $pdo_pgsql->prepare("INSERT INTO products (id, producer_id, category_id, name, slug, description, price, stock_quantity, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    
    foreach ($products as $product) {
        $insert->execute([
            $product['id'],
            $product['producer_id'],
            $product['category_id'],
            $product['name'],
            $product['slug'],
            $product['description'],
            $product['price'],
            $product['stock_quantity'] ?: 0,
            $product['created_at'],
            $product['updated_at']
        ]);
    }
    
    echo "✅ Migrated " . count($products) . " products\n";
    
    // Update sequence
    $maxId = $pdo_pgsql->query("SELECT MAX(id) FROM products")->fetchColumn();
    if ($maxId) {
        $pdo_pgsql->exec("SELECT setval('products_id_seq', $maxId)");
    }
    
} catch (Exception $e) {
    echo "❌ Product migration failed: " . $e->getMessage() . "\n";
}

// Verify
$count = $pdo_pgsql->query("SELECT COUNT(*) FROM products")->fetchColumn();
echo "\n✅ Total products in PostgreSQL: $count\n";